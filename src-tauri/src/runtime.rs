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
pub struct RuntimeInvocationPolicy {
    pub metered_enabled: bool,
    pub cloud_allowed: bool,
    pub lan_remote_allowed: bool,
}

impl RuntimeInvocationPolicy {
    pub const fn local_only() -> Self {
        Self {
            metered_enabled: false,
            cloud_allowed: false,
            lan_remote_allowed: false,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RuntimePolicyBlock {
    Unavailable,
    Unauthenticated,
    InconsistentAuthentication,
    ReportedFailure(RuntimeFailure),
    BillingClassUnknown,
    MeteredDisabled,
    LocalityUnknown,
    LocalityBlocked,
    MissingModel,
    ModelNotReady(RuntimeReadiness),
    UnsupportedCapability(RuntimeCapability),
}

pub fn validate_runtime_for_inference(
    status: &RuntimeStatus,
    policy: RuntimeInvocationPolicy,
) -> Result<(), RuntimePolicyBlock> {
    if status.health == RuntimeHealth::Unavailable {
        return Err(RuntimePolicyBlock::Unavailable);
    }

    if let Some(failure) = status.failure {
        return Err(RuntimePolicyBlock::ReportedFailure(failure));
    }

    match (status.auth_mechanism, status.auth_state) {
        (AuthMechanism::None, AuthState::NotRequired) => {}
        (
            AuthMechanism::ApiKey | AuthMechanism::AccountSession | AuthMechanism::RuntimeToken,
            AuthState::Ready,
        ) => {}
        (AuthMechanism::None, _) | (_, AuthState::NotRequired) => {
            return Err(RuntimePolicyBlock::InconsistentAuthentication)
        }
        (
            AuthMechanism::ApiKey | AuthMechanism::AccountSession | AuthMechanism::RuntimeToken,
            AuthState::Missing | AuthState::Expired | AuthState::Invalid | AuthState::Unknown,
        ) => return Err(RuntimePolicyBlock::Unauthenticated),
    }

    match status.billing_class {
        BillingClass::Unknown => return Err(RuntimePolicyBlock::BillingClassUnknown),
        BillingClass::Metered if !policy.metered_enabled => {
            return Err(RuntimePolicyBlock::MeteredDisabled)
        }
        BillingClass::Free
        | BillingClass::Subscription
        | BillingClass::Local
        | BillingClass::Metered => {}
    }

    match status.locality {
        LocalityClass::Unknown => return Err(RuntimePolicyBlock::LocalityUnknown),
        LocalityClass::Cloud if !policy.cloud_allowed => {
            return Err(RuntimePolicyBlock::LocalityBlocked)
        }
        LocalityClass::LanRemote if !policy.lan_remote_allowed => {
            return Err(RuntimePolicyBlock::LocalityBlocked)
        }
        LocalityClass::OnDevice
        | LocalityClass::LoopbackLocal
        | LocalityClass::LanRemote
        | LocalityClass::Cloud => {}
    }

    let model = status
        .model
        .as_ref()
        .ok_or(RuntimePolicyBlock::MissingModel)?;

    if model.readiness != RuntimeReadiness::Ready {
        return Err(RuntimePolicyBlock::ModelNotReady(model.readiness));
    }

    if !model
        .capabilities
        .contains(&RuntimeCapability::TextGeneration)
    {
        return Err(RuntimePolicyBlock::UnsupportedCapability(
            RuntimeCapability::TextGeneration,
        ));
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

    fn cloud_status() -> RuntimeStatus {
        let mut status = local_status();
        status.identity.runtime_id = "cloud-runtime".to_owned();
        status.identity.runtime_kind = "api".to_owned();
        status.auth_mechanism = AuthMechanism::ApiKey;
        status.auth_state = AuthState::Ready;
        status.billing_class = BillingClass::Free;
        status.locality = LocalityClass::Cloud;
        status
    }

    #[test]
    fn healthy_local_runtime_does_not_require_credentials() {
        assert_eq!(
            validate_runtime_for_inference(&local_status(), RuntimeInvocationPolicy::local_only()),
            Ok(())
        );
    }

    #[test]
    fn credential_mechanism_cannot_report_auth_not_required() {
        let mut status = cloud_status();
        status.auth_state = AuthState::NotRequired;

        assert_eq!(
            validate_runtime_for_inference(
                &status,
                RuntimeInvocationPolicy {
                    cloud_allowed: true,
                    ..RuntimeInvocationPolicy::local_only()
                }
            ),
            Err(RuntimePolicyBlock::InconsistentAuthentication)
        );
    }

    #[test]
    fn credential_free_mechanism_cannot_report_auth_ready() {
        let mut status = local_status();
        status.auth_state = AuthState::Ready;

        assert_eq!(
            validate_runtime_for_inference(&status, RuntimeInvocationPolicy::local_only()),
            Err(RuntimePolicyBlock::InconsistentAuthentication)
        );
    }

    #[test]
    fn unknown_billing_fails_closed() {
        let mut status = local_status();
        status.billing_class = BillingClass::Unknown;

        assert_eq!(
            validate_runtime_for_inference(&status, RuntimeInvocationPolicy::local_only()),
            Err(RuntimePolicyBlock::BillingClassUnknown)
        );
    }

    #[test]
    fn unknown_locality_fails_closed() {
        let mut status = local_status();
        status.locality = LocalityClass::Unknown;

        assert_eq!(
            validate_runtime_for_inference(&status, RuntimeInvocationPolicy::local_only()),
            Err(RuntimePolicyBlock::LocalityUnknown)
        );
    }

    #[test]
    fn unavailable_runtime_fails_closed() {
        let mut status = local_status();
        status.health = RuntimeHealth::Unavailable;

        assert_eq!(
            validate_runtime_for_inference(&status, RuntimeInvocationPolicy::local_only()),
            Err(RuntimePolicyBlock::Unavailable)
        );
    }

    #[test]
    fn reported_failure_fails_closed_even_when_health_is_ready() {
        let mut status = local_status();
        status.failure = Some(RuntimeFailure::AllowanceExhausted);

        assert_eq!(
            validate_runtime_for_inference(&status, RuntimeInvocationPolicy::local_only()),
            Err(RuntimePolicyBlock::ReportedFailure(
                RuntimeFailure::AllowanceExhausted
            ))
        );
    }

    #[test]
    fn cloud_runtime_with_missing_auth_fails_closed() {
        let mut status = cloud_status();
        status.auth_state = AuthState::Missing;

        assert_eq!(
            validate_runtime_for_inference(
                &status,
                RuntimeInvocationPolicy {
                    cloud_allowed: true,
                    ..RuntimeInvocationPolicy::local_only()
                }
            ),
            Err(RuntimePolicyBlock::Unauthenticated)
        );
    }

    #[test]
    fn auth_state_does_not_determine_billing_class() {
        let mut status = cloud_status();
        status.auth_mechanism = AuthMechanism::AccountSession;
        status.auth_state = AuthState::Ready;
        status.billing_class = BillingClass::Unknown;

        assert_eq!(
            validate_runtime_for_inference(
                &status,
                RuntimeInvocationPolicy {
                    cloud_allowed: true,
                    ..RuntimeInvocationPolicy::local_only()
                }
            ),
            Err(RuntimePolicyBlock::BillingClassUnknown)
        );
    }

    #[test]
    fn metered_runtime_requires_explicit_enablement() {
        let mut status = cloud_status();
        status.billing_class = BillingClass::Metered;

        assert_eq!(
            validate_runtime_for_inference(
                &status,
                RuntimeInvocationPolicy {
                    cloud_allowed: true,
                    ..RuntimeInvocationPolicy::local_only()
                }
            ),
            Err(RuntimePolicyBlock::MeteredDisabled)
        );

        assert_eq!(
            validate_runtime_for_inference(
                &status,
                RuntimeInvocationPolicy {
                    metered_enabled: true,
                    cloud_allowed: true,
                    lan_remote_allowed: false,
                }
            ),
            Ok(())
        );
    }

    #[test]
    fn remote_locality_requires_explicit_permission() {
        let status = cloud_status();

        assert_eq!(
            validate_runtime_for_inference(&status, RuntimeInvocationPolicy::local_only()),
            Err(RuntimePolicyBlock::LocalityBlocked)
        );

        assert_eq!(
            validate_runtime_for_inference(
                &status,
                RuntimeInvocationPolicy {
                    cloud_allowed: true,
                    ..RuntimeInvocationPolicy::local_only()
                }
            ),
            Ok(())
        );
    }

    #[test]
    fn missing_selected_model_fails_closed() {
        let mut status = local_status();
        status.model = None;

        assert_eq!(
            validate_runtime_for_inference(&status, RuntimeInvocationPolicy::local_only()),
            Err(RuntimePolicyBlock::MissingModel)
        );
    }

    #[test]
    fn non_ready_model_fails_closed() {
        for readiness in [
            RuntimeReadiness::Loading,
            RuntimeReadiness::NotLoaded,
            RuntimeReadiness::Unknown,
        ] {
            let mut status = local_status();
            status.model.as_mut().expect("model").readiness = readiness;

            assert_eq!(
                validate_runtime_for_inference(&status, RuntimeInvocationPolicy::local_only()),
                Err(RuntimePolicyBlock::ModelNotReady(readiness))
            );
        }
    }

    #[test]
    fn model_without_text_generation_fails_closed() {
        let mut status = local_status();
        status.model.as_mut().expect("model").capabilities = vec![RuntimeCapability::Streaming];

        assert_eq!(
            validate_runtime_for_inference(&status, RuntimeInvocationPolicy::local_only()),
            Err(RuntimePolicyBlock::UnsupportedCapability(
                RuntimeCapability::TextGeneration
            ))
        );
    }
}
