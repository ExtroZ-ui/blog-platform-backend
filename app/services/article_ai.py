import math
import re
from collections import Counter


STOP_WORDS = {
    "и",
    "в",
    "во",
    "на",
    "с",
    "со",
    "а",
    "но",
    "или",
    "что",
    "это",
    "как",
    "к",
    "ко",
    "по",
    "за",
    "из",
    "у",
    "от",
    "до",
    "для",
    "о",
    "об",
    "не",
    "нет",
    "мы",
    "вы",
    "они",
    "он",
    "она",
    "оно",
    "я",
    "ты",
    "его",
    "ее",
    "их",
    "же",
    "бы",
    "ли",
    "при",
    "про",
    "без",
    "над",
    "под",
    "так",
    "тоже",
    "очень",
    "может",
    "можно",
    "будет",
    "были",
    "был",
    "была",
}


POSITIVE_MARKERS = {
    "хорош": 2,
    "отлич": 3,
    "успех": 2,
    "радост": 2,
    "побед": 2,
    "польз": 2,
    "лучш": 3,
    "интерес": 1,
    "полезн": 2,
    "развит": 1,
    "технолог": 1,
    "удобн": 2,
    "качеств": 2,
    "эффектив": 2,
    "надежн": 2,
    "безопас": 2,
    "улучш": 2,
    "помог": 2,
    "рост": 2,
}


NEGATIVE_MARKERS = {
    "плох": 2,
    "ужас": 3,
    "проблем": 2,
    "ошиб": 2,
    "провал": 3,
    "опасн": 2,
    "страх": 2,
    "ненавист": 3,
    "кризис": 2,
    "вред": 2,
    "сложн": 1,
    "риск": 2,
    "угроз": 2,
    "неудач": 2,
    "запрет": 1,
    "конфликт": 2,
}


AGE_RULES = {
    "18+": {
        "наркот": 5,
        "насили": 5,
        "убий": 5,
        "жесток": 4,
        "кров": 4,
        "оруж": 4,
        "смерт": 4,
        "алкогол": 4,
        "табак": 4,
        "суицид": 5,
        "порно": 5,
    },
    "16+": {
        "драк": 3,
        "агресс": 3,
        "опасн": 3,
        "угроз": 3,
        "страш": 2,
        "тревог": 2,
        "конфликт": 2,
        "риск": 2,
        "ненавист": 3,
    },
    "12+": {
        "обучен": 1,
        "школ": 1,
        "игр": 1,
        "развит": 1,
        "семь": 1,
        "технолог": 1,
        "интернет": 1,
        "социальн": 1,
    },
}


def normalize_text(content: str) -> str:
    text = content.lower()
    text = text.replace("ё", "е")
    text = re.sub(r"[^а-яa-z0-9\s.!?]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    return text


def split_words(text: str) -> list[str]:
    return re.findall(r"[а-яa-z0-9]+", text.lower())


def split_sentences(content: str) -> list[str]:
    sentences = re.split(r"(?<=[.!?])\s+", content.strip())

    return [
        sentence.strip()
        for sentence in sentences
        if len(sentence.strip()) > 10
    ]


def has_negation_before(text: str, marker: str) -> bool:
    pattern = rf"(не|нет|никогда|без)\s+\w*\s*{marker}"

    return re.search(pattern, text) is not None


def calculate_sentiment_score(text: str) -> tuple[int, int]:
    positive_score = 0
    negative_score = 0

    for marker, weight in POSITIVE_MARKERS.items():
        if marker in text:
            if has_negation_before(text, marker):
                negative_score += weight
            else:
                positive_score += weight

    for marker, weight in NEGATIVE_MARKERS.items():
        if marker in text:
            if has_negation_before(text, marker):
                positive_score += weight
            else:
                negative_score += weight

    return positive_score, negative_score


def analyze_sentiment(content: str) -> str:
    text = normalize_text(content)
    positive_score, negative_score = calculate_sentiment_score(text)

    if positive_score == 0 and negative_score == 0:
        return "neutral"

    difference = positive_score - negative_score

    if difference >= 2:
        return "positive"

    if difference <= -2:
        return "negative"

    return "neutral"


def detect_age_rating(content: str) -> str:
    text = normalize_text(content)

    score_18 = sum(
        weight
        for marker, weight in AGE_RULES["18+"].items()
        if marker in text
    )

    score_16 = sum(
        weight
        for marker, weight in AGE_RULES["16+"].items()
        if marker in text
    )

    score_12 = sum(
        weight
        for marker, weight in AGE_RULES["12+"].items()
        if marker in text
    )

    if score_18 >= 4:
        return "18+"

    if score_16 >= 3:
        return "16+"

    if score_12 >= 1:
        return "12+"

    return "0+"


def make_summary(content: str) -> str:
    sentences = split_sentences(content)

    if not sentences:
        return content[:250]

    if len(sentences) == 1:
        return sentences[0][:250]

    summary = " ".join(sentences[:2])

    return summary[:350]


def extract_keywords(content: str, limit: int = 8) -> str:
    text = normalize_text(content)
    words = split_words(text)

    prepared_words = [
        word
        for word in words
        if word not in STOP_WORDS and len(word) >= 4
    ]

    if not prepared_words:
        return ""

    counter = Counter(prepared_words)
    keywords = [
        word
        for word, _ in counter.most_common(limit)
    ]

    return ", ".join(keywords)


def calculate_reading_time(content: str) -> int:
    words_count = len(split_words(content))

    if words_count == 0:
        return 1

    return max(1, math.ceil(words_count / 180))


def detect_moderation_risk(
    content: str,
    sentiment: str,
    age_rating: str,
) -> str:
    text = normalize_text(content)

    risk_markers = [
        "насили",
        "наркот",
        "суицид",
        "убий",
        "оруж",
        "ненавист",
        "угроз",
        "агресс",
        "жесток",
    ]

    risk_count = sum(
        1
        for marker in risk_markers
        if marker in text
    )

    if age_rating == "18+" or risk_count >= 2:
        return "high"

    if age_rating == "16+" or sentiment == "negative" or risk_count == 1:
        return "medium"

    return "low"


def make_author_recommendation(
    sentiment: str,
    age_rating: str,
    moderation_risk: str,
) -> str:
    if moderation_risk == "high":
        return (
            "Материал содержит потенциально чувствительные темы. "
            "Перед публикацией рекомендуется ручная модерация."
        )

    if age_rating in {"16+", "18+"}:
        return (
            "Статья может быть неподходящей для младшей аудитории. "
            "Рекомендуется проверить формулировки и предупреждение о содержании."
        )

    if sentiment == "negative":
        return (
            "Тональность статьи выглядит негативной. "
            "Можно добавить больше нейтральных фактов или выводов."
        )

    if sentiment == "positive":
        return (
            "Статья выглядит позитивной и безопасной для публикации."
        )

    return (
        "Статья выглядит нейтральной. "
        "Можно усилить заголовок и добавить больше конкретики."
    )


def analyze_article_content(content: str) -> dict[str, str | int]:
    sentiment = analyze_sentiment(content)
    age_rating = detect_age_rating(content)
    moderation_risk = detect_moderation_risk(
        content=content,
        sentiment=sentiment,
        age_rating=age_rating,
    )

    return {
        "sentiment": sentiment,
        "age_rating": age_rating,
        "ai_summary": make_summary(content),
        "ai_keywords": extract_keywords(content),
        "reading_time_minutes": calculate_reading_time(content),
        "moderation_risk": moderation_risk,
        "ai_recommendation": make_author_recommendation(
            sentiment=sentiment,
            age_rating=age_rating,
            moderation_risk=moderation_risk,
        ),
    }