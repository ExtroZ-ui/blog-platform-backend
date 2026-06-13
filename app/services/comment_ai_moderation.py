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
    normalized = re.sub(r"[^а-яa-z0-9:/.\s-]", " ", normalized)
    normalized = re.sub(r"\s+", " ", normalized).strip()

    return normalized


def contains_any(text: str, markers: list[str]) -> bool:
    return any(marker in text for marker in markers)


def count_markers(text: str, markers: list[str]) -> int:
    return sum(1 for marker in markers if marker in text)


def contains_url(text: str) -> bool:
    normalized = text.lower()

    url_markers = [
        "http://",
        "https://",
        "www.",
        ".ru",
        ".com",
        ".net",
        ".org",
        "t.me",
        "telegram",
    ]

    return any(marker in normalized for marker in url_markers)


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
        "реклам",
        "казино",
        "ставк",
        "промокод",
        "купит",
        "купите",
        "подписчик",
        "накрут",
        "заработ",
        "быстро заработать",
        "без усилий",
        "переход",
        "перейд",
        "сайт",
        "ссылка",
        "мошен",
        "лохотрон",
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
        "тупая",
        "дурак",
        "идиот",
        "мраз",
        "урод",
        "некомпетент",
        "бесполезн",
        "отвратительн",
        "вводит в заблуждение",
    ]

    suspicious_markers = [
        "жесть",
        "ужас",
        "ужасн",
        "опасн",
        "угроз",
        "агресс",
        "обман",
        "конфликт",
        "запрещ",
        "жесток",
        "плох",
        "сомнительн",
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

    if contains_url(text):
        risk_score += 80
        category = "external_link"
        reason = "Комментарий содержит внешнюю ссылку."

    hard_block_score = count_markers(normalized, hard_block_markers)
    violence_score = count_markers(normalized, violence_markers)
    toxicity_score = count_markers(normalized, toxicity_markers)
    suspicious_score = count_markers(normalized, suspicious_markers)

    if hard_block_score:
        risk_score += hard_block_score * 45
        category = "blocked_content"
        reason = "Комментарий содержит признаки запрещённого или рекламного содержания."

    if violence_score:
        risk_score += violence_score * 80
        category = "violence"
        reason = "Комментарий содержит признаки насилия или угроз."

    if toxicity_score:
        risk_score += toxicity_score * 35
        if category == "safe":
            category = "toxicity"
            reason = "Комментарий содержит признаки токсичного общения."

    if suspicious_score:
        risk_score += min(suspicious_score * 10, 35)
        if category == "safe":
            category = "suspicious"
            reason = "Комментарий требует ручной проверки."

    if contains_any(normalized, positive_markers):
        risk_score -= 10

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