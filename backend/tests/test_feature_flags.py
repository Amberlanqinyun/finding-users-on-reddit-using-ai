"""Unit tests for feature flag resolution (A3.3)."""
from app.core.feature_flags import Flag, is_enabled


def test_reddit_on_by_default() -> None:
    assert is_enabled(Flag.REDDIT_CONNECTOR, {}) is True


def test_dm_drafts_off_by_default() -> None:
    assert is_enabled(Flag.DM_DRAFTS, {}) is False


def test_x_connector_off_by_default() -> None:
    assert is_enabled(Flag.X_CONNECTOR, {}) is False


def test_workspace_override_enables_dm_drafts() -> None:
    flags = {Flag.DM_DRAFTS: True}
    assert is_enabled(Flag.DM_DRAFTS, flags) is True


def test_workspace_override_disables_reddit() -> None:
    flags = {Flag.REDDIT_CONNECTOR: False}
    assert is_enabled(Flag.REDDIT_CONNECTOR, flags) is False
