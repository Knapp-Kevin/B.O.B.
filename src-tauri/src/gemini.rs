use crate::secrets::{OsSecretStore, SecretName, SecretStore};
use anyhow::{Context, Result};
use reqwest::{Client, StatusCode};
use serde::Serialize;
use std::{sync::Arc, time::Duration};
use tauri::State;
use zeroize::{Zeroize, Zeroizing};

const VALIDATION_URL: &str = "https://generativelanguage.googleapis.com/v1beta/models?pageSize=1";

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

pub struct GeminiCredentials {
    secrets: Arc<dyn SecretStore>,
    client: Client,
}

impl GeminiCredentials {
    pub fn new() -> Result<Self> {
        Self::with_secret_store(Arc::new(OsSecretStore))
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

#[cfg(test)]
mod tests {
    use super::*;

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
    }
}
