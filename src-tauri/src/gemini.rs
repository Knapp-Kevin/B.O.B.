use crate::secrets::{OsSecretStore, SecretName, SecretStore};
use anyhow::{bail, Context, Result};
use reqwest::{Client, StatusCode};
use serde::{Deserialize, Serialize};
use std::{sync::Arc, time::Duration};
use tauri::State;
use zeroize::{Zeroize, Zeroizing};

const VALIDATION_URL: &str = "https://generativelanguage.googleapis.com/v1beta/models?pageSize=1";
const GENERATE_URL: &str =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const MAX_CONTEXT_INPUT: usize = 4_000;
const MAX_OUTPUT_TOKENS: u32 = 512;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum GeminiValidationState {
    NotConfigured,
    Ready,
    InvalidCredential,
    QuotaLimited,
    Unavailable,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GeminiCredentialStatus {
    configured: bool,
    validation: GeminiValidationState,
}

impl GeminiCredentialStatus {
    fn not_configured() -> Self {
        Self {
            configured: false,
            validation: GeminiValidationState::NotConfigured,
        }
    }

    fn configured(validation: GeminiValidationState) -> Self {
        Self {
            configured: true,
            validation,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GeminiContextPolicy {
    pub professional_business_use_acknowledged: bool,
    pub content_confirmed_non_sensitive: bool,
    pub free_tier_project_confirmed: bool,
}

impl GeminiContextPolicy {
    fn allows_context(self) -> bool {
        self.professional_business_use_acknowledged
            && self.content_confirmed_non_sensitive
            && self.free_tier_project_confirmed
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum GeminiInferenceState {
    Generated,
    PolicyBlocked,
    NotConfigured,
    InvalidCredential,
    QuotaLimited,
    Rejected,
    Unavailable,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GeminiGenerateResult {
    state: GeminiInferenceState,
    text: Option<String>,
}

impl GeminiGenerateResult {
    fn without_text(state: GeminiInferenceState) -> Self {
        Self { state, text: None }
    }

    fn generated(text: String) -> Self {
        Self {
            state: GeminiInferenceState::Generated,
            text: Some(text),
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct GenerateRequest<'a> {
    contents: [GenerateContent<'a>; 1],
    generation_config: GenerationConfig,
}

#[derive(Serialize)]
struct GenerateContent<'a> {
    role: &'static str,
    parts: [GeneratePart<'a>; 1],
}

#[derive(Serialize)]
struct GeneratePart<'a> {
    text: &'a str,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct GenerationConfig {
    max_output_tokens: u32,
}

#[derive(Deserialize)]
struct GenerateResponse {
    #[serde(default)]
    candidates: Vec<GenerateCandidate>,
}

#[derive(Deserialize)]
struct GenerateCandidate {
    content: GenerateResponseContent,
}

#[derive(Deserialize)]
struct GenerateResponseContent {
    #[serde(default)]
    parts: Vec<GenerateResponsePart>,
}

#[derive(Deserialize)]
struct GenerateResponsePart {
    text: Option<String>,
}

pub struct GeminiCredentials {
    secrets: Arc<dyn SecretStore>,
    client: Client,
}

impl GeminiCredentials {
    pub fn new() -> Result<Self> {
        Self::with_secret_store(Arc::new(OsSecretStore::default()))
    }

    fn with_secret_store(secrets: Arc<dyn SecretStore>) -> Result<Self> {
        let client = Client::builder()
            .timeout(Duration::from_secs(12))
            .build()
            .context("build Gemini validation client")?;
        Ok(Self { secrets, client })
    }

    pub async fn status(&self) -> Result<GeminiCredentialStatus> {
        let Some(api_key) = self.secrets.read(SecretName::GeminiApiKey)? else {
            return Ok(GeminiCredentialStatus::not_configured());
        };

        let validation = self.validate(&api_key).await;
        Ok(GeminiCredentialStatus::configured(validation))
    }

    pub async fn configure(&self, mut api_key: String) -> Result<GeminiCredentialStatus> {
        let normalized = Zeroizing::new(api_key.trim().to_owned());
        api_key.zeroize();

        if normalized.len() < 20 || normalized.len() > 4096 {
            return Ok(GeminiCredentialStatus {
                configured: self.secrets.read(SecretName::GeminiApiKey)?.is_some(),
                validation: GeminiValidationState::InvalidCredential,
            });
        }

        let validation = self.validate(&normalized).await;
        if validation != GeminiValidationState::Ready {
            return Ok(GeminiCredentialStatus {
                configured: self.secrets.read(SecretName::GeminiApiKey)?.is_some(),
                validation,
            });
        }

        self.secrets
            .write(SecretName::GeminiApiKey, &normalized)
            .context("store validated Gemini credential")?;

        Ok(GeminiCredentialStatus::configured(
            GeminiValidationState::Ready,
        ))
    }

    pub fn remove(&self) -> Result<GeminiCredentialStatus> {
        self.secrets
            .delete(SecretName::GeminiApiKey)
            .context("remove Gemini credential")?;
        Ok(GeminiCredentialStatus::not_configured())
    }

    pub async fn generate_text(
        &self,
        prompt: &str,
        policy: GeminiContextPolicy,
    ) -> Result<GeminiGenerateResult> {
        if !policy.allows_context() {
            return Ok(GeminiGenerateResult::without_text(
                GeminiInferenceState::PolicyBlocked,
            ));
        }

        let prompt = prompt.trim();
        if prompt.is_empty() {
            bail!("Gemini context input is empty");
        }
        if prompt.len() > MAX_CONTEXT_INPUT {
            bail!("Gemini context input is too long");
        }

        let Some(api_key) = self.secrets.read(SecretName::GeminiApiKey)? else {
            return Ok(GeminiGenerateResult::without_text(
                GeminiInferenceState::NotConfigured,
            ));
        };

        let request = GenerateRequest {
            contents: [GenerateContent {
                role: "user",
                parts: [GeneratePart { text: prompt }],
            }],
            generation_config: GenerationConfig {
                max_output_tokens: MAX_OUTPUT_TOKENS,
            },
        };

        let response = self
            .client
            .post(GENERATE_URL)
            .header("x-goog-api-key", api_key.as_str())
            .json(&request)
            .send()
            .await;

        let response = match response {
            Ok(response) => response,
            Err(_) => {
                return Ok(GeminiGenerateResult::without_text(
                    GeminiInferenceState::Unavailable,
                ))
            }
        };

        let status = response.status();
        if !status.is_success() {
            return Ok(GeminiGenerateResult::without_text(
                classify_inference_status(status),
            ));
        }

        let body = match response.json::<GenerateResponse>().await {
            Ok(body) => body,
            Err(_) => {
                return Ok(GeminiGenerateResult::without_text(
                    GeminiInferenceState::Unavailable,
                ))
            }
        };

        let text = body
            .candidates
            .first()
            .map(|candidate| {
                candidate
                    .content
                    .parts
                    .iter()
                    .filter_map(|part| part.text.as_deref())
                    .collect::<Vec<_>>()
                    .join("")
            })
            .unwrap_or_default();
        let text = text.trim().to_owned();
        if text.is_empty() {
            return Ok(GeminiGenerateResult::without_text(
                GeminiInferenceState::Rejected,
            ));
        }

        Ok(GeminiGenerateResult::generated(text))
    }

    async fn validate(&self, api_key: &str) -> GeminiValidationState {
        let response = self
            .client
            .get(VALIDATION_URL)
            .header("x-goog-api-key", api_key)
            .send()
            .await;

        match response {
            Ok(response) => classify_validation_status(response.status()),
            Err(_) => GeminiValidationState::Unavailable,
        }
    }
}

fn classify_validation_status(status: StatusCode) -> GeminiValidationState {
    if status.is_success() {
        return GeminiValidationState::Ready;
    }
    if matches!(
        status,
        StatusCode::BAD_REQUEST | StatusCode::UNAUTHORIZED | StatusCode::FORBIDDEN
    ) {
        return GeminiValidationState::InvalidCredential;
    }
    if status == StatusCode::TOO_MANY_REQUESTS {
        return GeminiValidationState::QuotaLimited;
    }
    GeminiValidationState::Unavailable
}

fn classify_inference_status(status: StatusCode) -> GeminiInferenceState {
    if matches!(status, StatusCode::UNAUTHORIZED | StatusCode::FORBIDDEN) {
        return GeminiInferenceState::InvalidCredential;
    }
    if status == StatusCode::TOO_MANY_REQUESTS {
        return GeminiInferenceState::QuotaLimited;
    }
    if status == StatusCode::BAD_REQUEST {
        return GeminiInferenceState::Rejected;
    }
    GeminiInferenceState::Unavailable
}

#[tauri::command]
pub async fn gemini_credential_status(
    credentials: State<'_, GeminiCredentials>,
) -> std::result::Result<GeminiCredentialStatus, String> {
    credentials.status().await.map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn configure_gemini_credential(
    credentials: State<'_, GeminiCredentials>,
    api_key: String,
) -> std::result::Result<GeminiCredentialStatus, String> {
    credentials
        .configure(api_key)
        .await
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn remove_gemini_credential(
    credentials: State<'_, GeminiCredentials>,
) -> std::result::Result<GeminiCredentialStatus, String> {
    credentials.remove().map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn generate_gemini_context(
    credentials: State<'_, GeminiCredentials>,
    prompt: String,
    policy: GeminiContextPolicy,
) -> std::result::Result<GeminiGenerateResult, String> {
    credentials
        .generate_text(&prompt, policy)
        .await
        .map_err(|error| error.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicUsize, Ordering};

    #[derive(Default)]
    struct CountingSecretStore {
        reads: AtomicUsize,
    }

    impl SecretStore for CountingSecretStore {
        fn read(&self, _name: SecretName) -> Result<Option<Zeroizing<String>>> {
            self.reads.fetch_add(1, Ordering::SeqCst);
            Ok(Some(Zeroizing::new(
                "test-secret-that-must-not-be-read".to_owned(),
            )))
        }

        fn write(&self, _name: SecretName, _value: &str) -> Result<()> {
            Ok(())
        }

        fn delete(&self, _name: SecretName) -> Result<()> {
            Ok(())
        }
    }

    fn allowed_policy() -> GeminiContextPolicy {
        GeminiContextPolicy {
            professional_business_use_acknowledged: true,
            content_confirmed_non_sensitive: true,
            free_tier_project_confirmed: true,
        }
    }

    #[test]
    fn policy_requires_every_context_confirmation() {
        assert!(allowed_policy().allows_context());
        assert!(!GeminiContextPolicy {
            professional_business_use_acknowledged: false,
            ..allowed_policy()
        }
        .allows_context());
        assert!(!GeminiContextPolicy {
            content_confirmed_non_sensitive: false,
            ..allowed_policy()
        }
        .allows_context());
        assert!(!GeminiContextPolicy {
            free_tier_project_confirmed: false,
            ..allowed_policy()
        }
        .allows_context());
    }

    #[test]
    fn blocked_policy_does_not_read_the_secret_store() {
        tauri::async_runtime::block_on(async {
            let secrets = Arc::new(CountingSecretStore::default());
            let credentials = GeminiCredentials::with_secret_store(secrets.clone())
                .expect("build Gemini credentials for test");
            let result = credentials
                .generate_text(
                    "context that must remain local",
                    GeminiContextPolicy {
                        professional_business_use_acknowledged: false,
                        ..allowed_policy()
                    },
                )
                .await
                .expect("policy-blocked generation should return a typed result");

            assert_eq!(result.state, GeminiInferenceState::PolicyBlocked);
            assert!(result.text.is_none());
            assert_eq!(secrets.reads.load(Ordering::SeqCst), 0);
        });
    }

    #[test]
    fn missing_free_tier_project_confirmation_does_not_read_the_secret_store() {
        tauri::async_runtime::block_on(async {
            let secrets = Arc::new(CountingSecretStore::default());
            let credentials = GeminiCredentials::with_secret_store(secrets.clone())
                .expect("build Gemini credentials for test");
            let result = credentials
                .generate_text(
                    "context that must remain local",
                    GeminiContextPolicy {
                        free_tier_project_confirmed: false,
                        ..allowed_policy()
                    },
                )
                .await
                .expect("missing Free Tier confirmation should return a typed result");

            assert_eq!(result.state, GeminiInferenceState::PolicyBlocked);
            assert!(result.text.is_none());
            assert_eq!(secrets.reads.load(Ordering::SeqCst), 0);
        });
    }

    #[test]
    fn retired_intent_flag_cannot_deserialize_into_an_allowing_policy() {
        // The retired `freeTierIntended` field expressed intent, not billing posture.
        // A caller replaying the old payload shape must fail closed at the IPC boundary
        // rather than silently producing a policy that permits context-bearing inference.
        let retired = serde_json::json!({
            "professionalBusinessUseAcknowledged": true,
            "contentConfirmedNonSensitive": true,
            "freeTierIntended": true
        });

        let decoded = serde_json::from_value::<GeminiContextPolicy>(retired);
        assert!(
            decoded.is_err(),
            "retired intent-only payload must not deserialize into a policy"
        );
    }

    #[test]
    fn every_confirmation_is_required_at_the_deserialization_boundary() {
        // Omitting any confirmation must be a decode failure, never a silent `false`
        // that a later refactor could turn into a permissive default.
        for omitted in [
            "professionalBusinessUseAcknowledged",
            "contentConfirmedNonSensitive",
            "freeTierProjectConfirmed",
        ] {
            let mut payload = serde_json::Map::new();
            for field in [
                "professionalBusinessUseAcknowledged",
                "contentConfirmedNonSensitive",
                "freeTierProjectConfirmed",
            ] {
                if field != omitted {
                    payload.insert(field.to_owned(), serde_json::Value::Bool(true));
                }
            }

            let decoded =
                serde_json::from_value::<GeminiContextPolicy>(serde_json::Value::Object(payload));
            assert!(
                decoded.is_err(),
                "policy missing `{omitted}` must not deserialize"
            );
        }

        let complete = serde_json::json!({
            "professionalBusinessUseAcknowledged": true,
            "contentConfirmedNonSensitive": true,
            "freeTierProjectConfirmed": true
        });
        let decoded = serde_json::from_value::<GeminiContextPolicy>(complete)
            .expect("a complete policy payload should decode");
        assert!(decoded.allows_context());
    }

    #[test]
    fn oversized_context_is_rejected_before_the_secret_store_is_read() {
        tauri::async_runtime::block_on(async {
            let secrets = Arc::new(CountingSecretStore::default());
            let credentials = GeminiCredentials::with_secret_store(secrets.clone())
                .expect("build Gemini credentials for test");
            let oversized = "x".repeat(MAX_CONTEXT_INPUT + 1);

            let error = credentials
                .generate_text(&oversized, allowed_policy())
                .await
                .expect_err("oversized context must be rejected");

            assert_eq!(secrets.reads.load(Ordering::SeqCst), 0);
            let message = error.to_string();
            assert!(!message.contains(&oversized));
            assert!(!message.contains("test-secret-that-must-not-be-read"));
        });
    }

    #[test]
    fn classifies_auth_failures_without_exposing_provider_bodies() {
        assert_eq!(
            classify_validation_status(StatusCode::UNAUTHORIZED),
            GeminiValidationState::InvalidCredential
        );
        assert_eq!(
            classify_validation_status(StatusCode::FORBIDDEN),
            GeminiValidationState::InvalidCredential
        );
        assert_eq!(
            classify_inference_status(StatusCode::UNAUTHORIZED),
            GeminiInferenceState::InvalidCredential
        );
    }

    #[test]
    fn classifies_quota_and_provider_failures_separately() {
        assert_eq!(
            classify_validation_status(StatusCode::TOO_MANY_REQUESTS),
            GeminiValidationState::QuotaLimited
        );
        assert_eq!(
            classify_validation_status(StatusCode::SERVICE_UNAVAILABLE),
            GeminiValidationState::Unavailable
        );
        assert_eq!(
            classify_inference_status(StatusCode::TOO_MANY_REQUESTS),
            GeminiInferenceState::QuotaLimited
        );
        assert_eq!(
            classify_inference_status(StatusCode::BAD_REQUEST),
            GeminiInferenceState::Rejected
        );
        assert_eq!(
            classify_inference_status(StatusCode::SERVICE_UNAVAILABLE),
            GeminiInferenceState::Unavailable
        );
    }
}
