"""
Field Status Logic
==================

Status is computed from a combination of factors:

1. COMPLETED  → stage is "harvested"

2. AT RISK    → any of:
   - stage is "ready" but last update > 7 days ago  (overdue harvest)
   - stage is "planted" or "growing" but no update in > 14 days  (neglected)
   - health_score on latest update <= 4  (poor health reported)
   - days_since_planted > expected_days[stage] * 1.5  (significantly behind schedule)

3. ACTIVE     → everything else

Expected growth timelines per stage (from planting date):
   - planted  → 0–14 days
   - growing  → 15–60 days
   - ready    → 61–75 days
   - harvested → 76+ days
"""

from datetime import datetime, timezone
from models import FieldStage, FieldStatus

STAGE_EXPECTED_MAX_DAYS = {
    FieldStage.planted: 14,
    FieldStage.growing: 60,
    FieldStage.ready: 75,
    FieldStage.harvested: 999,
}


def compute_field_status(
    stage: FieldStage,
    planting_date: datetime,
    last_update: datetime | None,
    latest_health_score: int | None,
) -> FieldStatus:
    now = datetime.now(timezone.utc)

    # Ensure planting_date is tz-aware
    if planting_date.tzinfo is None:
        planting_date = planting_date.replace(tzinfo=timezone.utc)

    days_since_planted = (now - planting_date).days

    # ── Completed ────────────────────────────────────────────────────────────
    if stage == FieldStage.harvested:
        return FieldStatus.completed

    # ── At Risk ──────────────────────────────────────────────────────────────
    # Poor health score
    if latest_health_score is not None and latest_health_score <= 4:
        return FieldStatus.at_risk

    # No updates in too long
    if last_update is not None:
        if last_update.tzinfo is None:
            last_update = last_update.replace(tzinfo=timezone.utc)
        days_since_update = (now - last_update).days
    else:
        # Never updated — use days since planted
        days_since_update = days_since_planted

    if stage == FieldStage.ready and days_since_update > 7:
        return FieldStatus.at_risk  # Ready but overdue for harvest

    if stage in (FieldStage.planted, FieldStage.growing) and days_since_update > 14:
        return FieldStatus.at_risk  # No check-in in 2 weeks

    # Behind schedule
    expected_max = STAGE_EXPECTED_MAX_DAYS.get(stage, 999)
    if days_since_planted > expected_max * 1.5:
        return FieldStatus.at_risk

    return FieldStatus.active


def days_since(dt: datetime) -> int:
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return max(0, (now - dt).days)
