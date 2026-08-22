use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeIdentity {
    pub runtime_id: String,
    pub runtime_kind: String,
    pub version: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum RuntimeHealth {
    Ready,
    Degraded,
    Unavailable,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AuthMechanism {
    None,
    ApiKey,
    AccountSession,
    RuntimeToken,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AuthState {
    NotRequired,
    Ready,
    Missing,
    Expired,
    Invalid,
    Unknown,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BillingClass {
    Free,
    Subscription,
    Local,
    Metered,
    Unknown,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum LocalityClass {
    OnDevice,
    LoopbackLocal,
    LanRemote,
    Cloud,
    Unknown,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RuntimeCapability {
    TextGeneration,
    StructuredOutput,
    Streaming,
    Cancellation,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RuntimeReadiness {
    Ready,
    Loading,
    NotLoaded,
    Unknown,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeModelState {
    pub model_id: String,
    pub display_name: String,
    pub capabilities: Vec<RuntimeCapability>,
    pub context_limit: Option<u32>,
    pub readiness: RuntimeReadiness,
    pub approximate_memory_mib: Option<u64>,
    pub accelerator_class: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeStatus {
    pub identity: RuntimeIdentity,
    pub health: RuntimeHealth,
    pub auth_mechanism: AuthMechanism,
    pub auth_state: AuthState,
    pub billing_class: BillingClass,
    pub locality: LocalityClass,
    pub model: Option<RuntimeModelState>,
    pub failure: Option<RuntimeFailure>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RuntimeFailure {
    Unavailable,
    Unauthenticated,
    AllowanceExhausted,
    BillingClassUnknown,
    PrivacyLocalityBlocked,
    Timeout,
    Cancelled,
    InvalidResponse,
    UnsupportedCapability,
    ExecutionFailure,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RuntimePolicyBlock {
    Unavailable,
    Unauthenticated,
    BillingClassUnknown,
    LocalityUnknown,
}

pub fn validate_runtime_for_inference(status: &RuntimeStatus) -> Result<(), RuntimePolicyBlock> {
    if status.health == RuntimeHealth::Unavailable {
        return Err(RuntimePolicyBlock::Unavailable);
    }

    match status.auth_state {
        AuthState::NotRequired | AuthState::Ready => {}
        AuthState::Missing | AuthState::Expired | AuthState::Invalid | AuthState::Unknown => {
            return Err(RuntimePolicyBlock::Unauthenticated)
        }
    }

    if status.billing_class == BillingClass::Unknown {
        return Err(RuntimePolicyBlock::BillingClassUnknown);
    }

    if status.locality == LocalityClass::Unknown {
        return Err(RuntimePolicyBlock::LocalityUnknown);
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn local_status() -> RuntimeStatus {
        RuntimeStatus {
            identity: RuntimeIdentity {
                runtime_id: "bob-local".to_owned(),
                runtime_kind: "embedded".to_owned(),
                version: None,
            },
            health: RuntimeHealth::Ready,
            auth_mechanism: AuthMechanism::None,
            auth_state: AuthState::NotRequired,
            billing_class: BillingClass::Local,
            locality: LocalityClass::OnDevice,
            model: Some(RuntimeModelState {
                model_id: "example.gguf".to_owned(),
                display_name: "Example local model".to_owned(),
                capabilities: vec![RuntimeCapability::TextGeneration],
                context_limit: Some(8_192),
                readiness: RuntimeReadiness::Ready,
                approximate_memory_mib: Some(4_096),
                accelerator_class: Some("cpu".to_owned()),
            }),
            failure: None,
        }
    }

    #[test]
    fn healthy_local_runtime_does_not_require_credentials() {
        assert_eq!(validate_runtime_for_inference(&local_status()), Ok(()));
    }

    #[test]
    fn unknown_billing_fails_closed() {
        let mut status = local_status();
        status.billing_class = BillingClass::Unknown;

        assert_eq!(
            validate_runtime_for_inference(&status),
            Err(RuntimePolicyBlock::BillingClassUnknown)
        );
    }

    #[test]
    fn unknown_locality_fails_closed() {
        let mut status = local_status();
        status.locality = LocalityClass::Unknown;

        assert_eq!(
            validate_runtime_for_inference(&status),
            Err(RuntimePolicyBlock::LocalityUnknown)
        );
    }

    #[test]
    fn unavailable_runtime_fails_closed() {
        let mut status = local_status();
        status.health = RuntimeHealth::Unavailable;

        assert_eq!(
            validate_runtime_for_inference(&status),
            Err(RuntimePolicyBlock::Unavailable)
        );
    }

    #[test]
    fn cloud_runtime_with_missing_auth_fails_closed() {
        let mut status = local_status();
        status.auth_mechanism = AuthMechanism::ApiKey;
        status.auth_state = AuthState::Missing;
        status.billing_class = BillingClass::Free;
        status.locality = LocalityClass::Cloud;

        assert_eq!(
            validate_runtime_for_inference(&status),
            Err(RuntimePolicyBlock::Unauthenticated)
        );
    }

    #[test]
    fn auth_state_does_not_determine_billing_class() {
        let mut status = local_status();
        status.auth_mechanism = AuthMechanism::AccountSession;
        status.auth_state = AuthState::Ready;
        status.billing_class = BillingClass::Unknown;
        status.locality = LocalityClass::Cloud;

        assert_eq!(
            validate_runtime_for_inference(&status),
            Err(RuntimePolicyBlock::BillingClassUnknown)
        );
    }
}
