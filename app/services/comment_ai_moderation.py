import re
from dataclasses import dataclass


@dataclass(frozen=True)
class CommentModerationResult:
    status: str
    risk_score: int
    category: str
    reason: str


def normalize_text(text: str) -> str:
    normalized = text.lower()
    normalized = normalized.replace("ё", "е")
    normalized = re.sub(r"[^а-яa-z0-9\s]", " ", normalized)
    normalized = re.sub(r"\s+", " ", normalized).strip()

    return normalized


def contains_any(text: str, markers: list[str]) -> bool:
    return any(marker in text for marker in markers)


def analyze_comment_content(text: str) -> CommentModerationResult:
    normalized = normalize_text(text)

    if not normalized:
        return CommentModerationResult(
            status="rejected",
            risk_score=100,
            category="empty",
            reason="Комментарий пустой.",
        )

    hard_block_markers = [
        "спам",
        "реклама",
        "казино",
        "ставк",
        "промокод",
        "купить",
        "наркот",
        "закладк",
        "оруж",
        "пистолет",
        "автомат",
        "взрыв",
        "бомб",
        "террор",
        "экстрем",
    ]

    violence_markers = [
        "убью",
        "убить",
        "убий",
        "уби",
        "резать",
        "зареж",
        "насил",
        "кров",
        "смерт",
    ]

    toxicity_markers = [
        "ненавиж",
        "оскорб",
        "тупой",
        "дурак",
        "идиот",
        "мраз",
        "урод",
    ]

    suspicious_markers = [
        "жесть",
        "ужас",
        "опасн",
        "угроз",
        "агресс",
        "обман",
        "конфликт",
        "запрещ",
        "жесток",
    ]

    positive_markers = [
        "хорош",
        "полезн",
        "интересн",
        "спасибо",
        "отличн",
        "класс",
        "понрав",
    ]

    risk_score = 0
    category = "safe"
    reason = "Комментарий не содержит признаков нарушения."

    if contains_any(normalized, hard_block_markers):
        risk_score += 90
        category = "blocked_content"
        reason = "Комментарий содержит признаки запрещённого или рекламного содержания."

    if contains_any(normalized, violence_markers):
        risk_score += 80
        category = "violence"
        reason = "Комментарий содержит признаки насилия или угроз."

    if contains_any(normalized, toxicity_markers):
        risk_score += 50
        category = "toxicity"
        reason = "Комментарий содержит признаки токсичного общения."

    if contains_any(normalized, suspicious_markers):
        risk_score += 35
        if category == "safe":
            category = "suspicious"
            reason = "Комментарий требует ручной проверки."

    if contains_any(normalized, positive_markers):
        risk_score -= 15

    risk_score = max(0, min(100, risk_score))

    if risk_score >= 75:
        status = "rejected"
    elif risk_score >= 30:
        status = "pending"
    else:
        status = "approved"

    return CommentModerationResult(
        status=status,
        risk_score=risk_score,
        category=category,
        reason=reason,
    )


def moderate_comment_text(text: str) -> str:
    result = analyze_comment_content(text)

    return result.status