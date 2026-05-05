from __future__ import annotations

import re
from datetime import datetime


def clean_text(value) -> str:
    if value is None:
        return ""
    if isinstance(value, datetime):
        return value.date().isoformat()
    text = str(value).replace("\n", " ").strip()
    return re.sub(r"\s+", " ", text)


def normalize_for_match(text: str) -> str:
    return clean_text(text).lower().replace("/", " ").replace("-", " ")


def parse_excel_date(value) -> str | None:
    if isinstance(value, datetime):
        return value.date().isoformat()
    text = clean_text(value)
    if not text:
        return None
    if "00:00:00" in text:
        return text.split()[0]
    return text


def numeric_or_none(value) -> float | None:
    if value is None or value == "":
        return None
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return float(value)
    text = clean_text(value).replace("%", "").replace(",", ".")
    if text in {"#DIV/0!", "#VALUE!", "#N/A"}:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def format_number(value):
    if value is None:
        return None
    if isinstance(value, float) and value.is_integer():
        return int(value)
    return value
