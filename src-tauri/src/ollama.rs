use crate::runtime::{
    validate_runtime_for_inference, AuthMechanism, AuthState, BillingClass, LocalityClass,
    RuntimeCapability, RuntimeFailure, RuntimeHealth, RuntimeIdentity, RuntimeInvocationPolicy,
    RuntimeModelState, RuntimePolicyBlock, RuntimeReadiness, RuntimeStatus,
};
use anyhow::{Context, Result};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;

const OLLAMA_BASE_URL: &str = "http://127.0.0.1:11434";
const REQUEST_TIMEOUT: Duration = Duration::from_secs(120);

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum OllamaAdapterError {
    PolicyBlocked(RuntimePolicyBlock),
    Runtime(RuntimeFailure),
}

#[derive(Debug, Deserialize)]
struct VersionResponse {
    version: String,
}

#[derive(Debug, Deserialize)]
struct TagsResponse {
    #[serde(default)]
    models: Vec<TaggedModel>,
}

#[derive(Debug, Deserialize)]
struct TaggedModel {
    name: String,
    #[serde(default)]
    size: u64,
    #[serde(default)]
    digest: String,
    details: ModelDetails,
}

#[derive(Debug, Default, Deserialize)]
struct ModelDetails {
    #[serde(default)]
    format: String,
}

#[derive(Debug, Serialize)]
struct ShowRequest<'a> {
    model: &'a str,
}

#[derive(Debug, Deserialize)]
struct ShowResponse {
    #[serde(default)]
    capabilities: Vec<String>,
}

#[derive(Debug, Serialize)]
struct GenerateRequest<'a> {
    model: &'a str,
    prompt: &'a str,
    stream: bool,
}

#[derive(Debug, Deserialize)]
struct GenerateResponse {
    #[serde(default)]
    response: String,
    #[serde(default)]
    done: bool,
}

pub struct OllamaLocalAdapter {
    client: Client,
    model_id: String,
}

impl OllamaLocalAdapter {
    pub fn new(model_id: impl Into<String>) -> Result<Self> {
        let client = Client::builder()
            .timeout(REQUEST_TIMEOUT)
            .build()
            .context("build Ollama loopback client")?;
        Ok(Self {
            client,
            model_id: model_id.into(),
        })
    }

    pub async fn status(&self) -> RuntimeStatus {
        let version = match self.fetch_version().await {
            Ok(version) => version,
            Err(failure) => return unavailable_status(self.model_id.clone(), failure),
        };

        let tagged = match self.fetch_tagged_model().await {
            Ok(Some(model)) => model,
            Ok(None) => {
                return RuntimeStatus {
                    identity: ollama_identity(Some(version)),
                    health: RuntimeHealth::Degraded,
                    auth_mechanism: AuthMechanism::None,
                    auth_state: AuthState::NotRequired,
                    billing_class: BillingClass::Unknown,
                    locality: LocalityClass::Unknown,
                    model: None,
                    failure: Some(RuntimeFailure::UnsupportedCapability),
                }
            }
            Err(failure) => return unavailable_status(self.model_id.clone(), failure),
        };

        let show = match self.fetch_show().await {
            Ok(show) => show,
            Err(failure) => return unavailable_status(self.model_id.clone(), failure),
        };

        let local_evidence = is_explicitly_local_model(&tagged);
        let capabilities = map_capabilities(&show.capabilities);
        let text_generation = capabilities.contains(&RuntimeCapability::TextGeneration);

        RuntimeStatus {
            identity: ollama_identity(Some(version)),
            health: if text_generation {
                RuntimeHealth::Ready
            } else {
                RuntimeHealth::Degraded
            },
            auth_mechanism: AuthMechanism::None,
            auth_state: AuthState::NotRequired,
            billing_class: if local_evidence {
                BillingClass::Local
            } else {
                BillingClass::Unknown
            },
            locality: if local_evidence {
                LocalityClass::LoopbackLocal
            } else {
                LocalityClass::Unknown
            },
            model: Some(RuntimeModelState {
                model_id: tagged.name.clone(),
                display_name: tagged.name,
                capabilities,
                context_limit: None,
                readiness: RuntimeReadiness::Ready,
                approximate_memory_mib: local_evidence.then_some(tagged.size / (1024 * 1024)),
                accelerator_class: None,
            }),
            failure: (!text_generation).then_some(RuntimeFailure::UnsupportedCapability),
        }
    }

    pub async fn generate_text(&self, prompt: &str) -> std::result::Result<String, OllamaAdapterError> {
        let status = self.status().await;
        validate_runtime_for_inference(&status, RuntimeInvocationPolicy::local_only())
            .map_err(OllamaAdapterError::PolicyBlocked)?;

        let prompt = prompt.trim();
        if prompt.is_empty() {
            return Err(OllamaAdapterError::Runtime(RuntimeFailure::InvalidResponse));
        }

        let response = self
            .client
            .post(format!("{OLLAMA_BASE_URL}/api/generate"))
            .json(&GenerateRequest {
                model: &self.model_id,
                prompt,
                stream: false,
            })
            .send()
            .await
            .map_err(|_| OllamaAdapterError::Runtime(RuntimeFailure::Unavailable))?;

        if !response.status().is_success() {
            return Err(OllamaAdapterError::Runtime(classify_http_failure(
                response.status(),
            )));
        }

        let body = response
            .json::<GenerateResponse>()
            .await
            .map_err(|_| OllamaAdapterError::Runtime(RuntimeFailure::InvalidResponse))?;
        let text = body.response.trim().to_owned();
        if !body.done || text.is_empty() {
            return Err(OllamaAdapterError::Runtime(RuntimeFailure::InvalidResponse));
        }
        Ok(text)
    }

    async fn fetch_version(&self) -> std::result::Result<String, RuntimeFailure> {
        let response = self
            .client
            .get(format!("{OLLAMA_BASE_URL}/api/version"))
            .send()
            .await
            .map_err(|_| RuntimeFailure::Unavailable)?;
        if !response.status().is_success() {
            return Err(classify_http_failure(response.status()));
        }
        let body = response
            .json::<VersionResponse>()
            .await
            .map_err(|_| RuntimeFailure::InvalidResponse)?;
        Ok(body.version)
    }

    async fn fetch_tagged_model(&self) -> std::result::Result<Option<TaggedModel>, RuntimeFailure> {
        let response = self
            .client
            .get(format!("{OLLAMA_BASE_URL}/api/tags"))
            .send()
            .await
            .map_err(|_| RuntimeFailure::Unavailable)?;
        if !response.status().is_success() {
            return Err(classify_http_failure(response.status()));
        }
        let body = response
            .json::<TagsResponse>()
            .await
            .map_err(|_| RuntimeFailure::InvalidResponse)?;
        Ok(body.models.into_iter().find(|model| model.name == self.model_id))
    }

    async fn fetch_show(&self) -> std::result::Result<ShowResponse, RuntimeFailure> {
        let response = self
            .client
            .post(format!("{OLLAMA_BASE_URL}/api/show"))
            .json(&ShowRequest {
                model: &self.model_id,
            })
            .send()
            .await
            .map_err(|_| RuntimeFailure::Unavailable)?;
        if !response.status().is_success() {
            return Err(classify_http_failure(response.status()));
        }
        response
            .json::<ShowResponse>()
            .await
            .map_err(|_| RuntimeFailure::InvalidResponse)
    }
}

fn ollama_identity(version: Option<String>) -> RuntimeIdentity {
    RuntimeIdentity {
        runtime_id: "ollama-loopback".to_owned(),
        runtime_kind: "ollama".to_owned(),
        version,
    }
}

fn unavailable_status(model_id: String, failure: RuntimeFailure) -> RuntimeStatus {
    RuntimeStatus {
        identity: ollama_identity(None),
        health: RuntimeHealth::Unavailable,
        auth_mechanism: AuthMechanism::None,
        auth_state: AuthState::NotRequired,
        billing_class: BillingClass::Unknown,
        locality: LocalityClass::Unknown,
        model: Some(RuntimeModelState {
            display_name: model_id.clone(),
            model_id,
            capabilities: Vec::new(),
            context_limit: None,
            readiness: RuntimeReadiness::Unknown,
            approximate_memory_mib: None,
            accelerator_class: None,
        }),
        failure: Some(failure),
    }
}

fn is_explicitly_local_model(model: &TaggedModel) -> bool {
    let name = model.name.to_ascii_lowercase();
    let obvious_cloud_route = name.ends_with(":cloud") || name.ends_with("-cloud");
    !obvious_cloud_route
        && model.size > 0
        && !model.digest.trim().is_empty()
        && model.details.format.eq_ignore_ascii_case("gguf")
}

fn map_capabilities(capabilities: &[String]) -> Vec<RuntimeCapability> {
    let mut mapped = Vec::new();
    if capabilities.iter().any(|value| value == "completion") {
        mapped.push(RuntimeCapability::TextGeneration);
    }
    mapped
}

fn classify_http_failure(status: reqwest::StatusCode) -> RuntimeFailure {
    match status.as_u16() {
        401 | 403 => RuntimeFailure::Unauthenticated,
        404 => RuntimeFailure::UnsupportedCapability,
        429 => RuntimeFailure::AllowanceExhausted,
        400..=499 => RuntimeFailure::InvalidResponse,
        _ => RuntimeFailure::ExecutionFailure,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn tagged(name: &str, size: u64, digest: &str, format: &str) -> TaggedModel {
        TaggedModel {
            name: name.to_owned(),
            size,
            digest: digest.to_owned(),
            details: ModelDetails {
                format: format.to_owned(),
            },
        }
    }

    #[test]
    fn local_classifier_requires_positive_gguf_evidence() {
        assert!(is_explicitly_local_model(&tagged(
            "gemma3:4b",
            3_338_801_804,
            "a2af6cc3",
            "gguf"
        )));
        assert!(!is_explicitly_local_model(&tagged(
            "gemma3:4b",
            0,
            "a2af6cc3",
            "gguf"
        )));
        assert!(!is_explicitly_local_model(&tagged(
            "gemma3:4b",
            3_338_801_804,
            "",
            "gguf"
        )));
        assert!(!is_explicitly_local_model(&tagged(
            "gemma3:4b",
            3_338_801_804,
            "a2af6cc3",
            "unknown"
        )));
    }

    #[test]
    fn obvious_cloud_routes_never_classify_local() {
        assert!(!is_explicitly_local_model(&tagged(
            "gpt-oss:120b-cloud",
            1,
            "digest",
            "gguf"
        )));
        assert!(!is_explicitly_local_model(&tagged(
            "glm-4.7:cloud",
            1,
            "digest",
            "gguf"
        )));
    }

    #[test]
    fn completion_is_the_only_capability_promoted_by_this_tracer() {
        assert_eq!(
            map_capabilities(&["completion".to_owned(), "vision".to_owned()]),
            vec![RuntimeCapability::TextGeneration]
        );
        assert!(map_capabilities(&["vision".to_owned()]).is_empty());
    }

    #[test]
    fn ambiguous_route_is_blocked_by_normalized_policy() {
        let status = RuntimeStatus {
            identity: ollama_identity(Some("test".to_owned())),
            health: RuntimeHealth::Ready,
            auth_mechanism: AuthMechanism::None,
            auth_state: AuthState::NotRequired,
            billing_class: BillingClass::Unknown,
            locality: LocalityClass::Unknown,
            model: Some(RuntimeModelState {
                model_id: "ambiguous".to_owned(),
                display_name: "ambiguous".to_owned(),
                capabilities: vec![RuntimeCapability::TextGeneration],
                context_limit: None,
                readiness: RuntimeReadiness::Ready,
                approximate_memory_mib: None,
                accelerator_class: None,
            }),
            failure: None,
        };

        assert_eq!(
            validate_runtime_for_inference(&status, RuntimeInvocationPolicy::local_only()),
            Err(RuntimePolicyBlock::BillingClassUnknown)
        );
    }
}
