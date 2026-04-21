"""
Field Status Logic
==================
Status is computed fresh on every read, never stored.

Rules (in order):
  1. COMPLETED  — stage == harvested
  2. AT RISK    — health_score <= 4  (poor health reported)
  3. AT RISK    — stage ready + no update in >7 days  (overdue harvest)
  4. AT RISK    — stage planted/growing + no update in >14 days  (neglected)
  5. AT RISK    — days_since_planted > expected_max * 1.5  (behind schedule)
  6. ACTIVE     — everything else

Expected max days per stage from planting date:
  planted  → 14d   growing → 60d   ready → 75d
"""
import pytz
from datetime import datetime
from models import FieldStage, FieldStatus

NAIROBI = pytz.timezone("Africa/Nairobi")

STAGE_MAX = {
    FieldStage.planted: 14, FieldStage.growing: 60,
    FieldStage.ready: 75,   FieldStage.harvested: 9999,
}


def now_nairobi() -> datetime:
    return datetime.now(NAIROBI)


def to_nairobi(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        dt = pytz.utc.localize(dt)
    return dt.astimezone(NAIROBI)


def days_since(dt: datetime) -> int:
    return max(0, (now_nairobi() - to_nairobi(dt)).days)


def compute_status(
    stage: FieldStage,
    planting_date: datetime,
    last_update: datetime | None,
    health_score: int | None,
) -> FieldStatus:

    if stage == FieldStage.harvested:
        return FieldStatus.completed

    if health_score is not None and health_score <= 4:
        return FieldStatus.at_risk

    no_update_days = days_since(last_update) if last_update else days_since(planting_date)

    if stage == FieldStage.ready and no_update_days > 7:
        return FieldStatus.at_risk

    if stage in (FieldStage.planted, FieldStage.growing) and no_update_days > 14:
        return FieldStatus.at_risk

    if days_since(planting_date) > STAGE_MAX.get(stage, 9999) * 1.5:
        return FieldStatus.at_risk

    return FieldStatus.active
