"""
Feature flag system — toggle connectors and experimental features per workspace.

All risky or API-gated features are off by default and must be explicitly
enabled at the workspace level by an Owner/Admin.
"""
from enum import StrEnum


class Flag(StrEnum):
    REDDIT_CONNECTOR = "reddit_connector"
    X_CONNECTOR = "x_connector"
    DM_DRAFTS = "dm_drafts"
    AI_KEYWORD_SUGGESTIONS = "ai_keyword_suggestions"
    VOICE_PROFILE = "voice_profile"
    TEAM_ROLES = "team_roles"


# Flags that are OFF by default (require explicit opt-in)
DEFAULT_OFF: set[Flag] = {
    Flag.X_CONNECTOR,
    Flag.DM_DRAFTS,
}

# Flags that are ON by default
DEFAULT_ON: set[Flag] = {
    Flag.REDDIT_CONNECTOR,
    Flag.AI_KEYWORD_SUGGESTIONS,
    Flag.VOICE_PROFILE,
    Flag.TEAM_ROLES,
}


def is_enabled(flag: Flag, workspace_flags: dict[str, bool]) -> bool:
    """
    Check if a feature flag is enabled for a given workspace.

    Workspace-level overrides take precedence over defaults.
    """
    if flag in workspace_flags:
        return workspace_flags[flag]
    return flag in DEFAULT_ON
