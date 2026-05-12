def analyze_sentiment(content: str) -> str:
    text = content.lower()

    positive_words = [
        "хорошо",
        "отлично",
        "успех",
        "радость",
        "победа",
        "польза",
        "лучший",
        "интересный",
        "полезный",
        "развитие",
    ]

    negative_words = [
        "плохо",
        "ужас",
        "проблема",
        "ошибка",
        "провал",
        "опасность",
        "страх",
        "ненависть",
        "кризис",
        "вред",
    ]

    positive_score = sum(1 for word in positive_words if word in text)
    negative_score = sum(1 for word in negative_words if word in text)

    if positive_score > negative_score:
        return "positive"

    if negative_score > positive_score:
        return "negative"

    return "neutral"


def detect_age_rating(content: str) -> str:
    text = content.lower()

    adult_words = [
        "наркотики",
        "насилие",
        "убийство",
        "жестокость",
        "кровь",
        "оружие",
        "смерть",
        "алкоголь",
    ]

    teen_words = [
        "конфликт",
        "драка",
        "страшный",
        "опасный",
        "тревога",
        "агрессия",
    ]

    child_words = [
        "обучение",
        "школа",
        "игра",
        "развитие",
        "семья",
    ]

    if any(word in text for word in adult_words):
        return "18+"

    if any(word in text for word in teen_words):
        return "16+"

    if any(word in text for word in child_words):
        return "12+"

    return "0+"


def analyze_article_content(content: str) -> dict[str, str]:
    return {
        "sentiment": analyze_sentiment(content),
        "age_rating": detect_age_rating(content),
    }