import re


def normalize_comment(text: str) -> str:
    text = text.lower()
    text = text.replace("ё", "е")
    text = re.sub(r"[^а-яa-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    return text


def moderate_comment_text(text: str) -> str:
    normalized_text = normalize_comment(text)

    rejected_markers = [
        "оскорб",
        "ненавист",
        "угроз",
        "убью",
        "наркот",
        "спам",
        "реклама",
    ]

    pending_markers = [
        "плохой",
        "ужас",
        "обман",
        "опасн",
        "конфликт",
        "агресс",
        "груб",
    ]

    if any(marker in normalized_text for marker in rejected_markers):
        return "rejected"

    if any(marker in normalized_text for marker in pending_markers):
        return "pending"

    return "approved"