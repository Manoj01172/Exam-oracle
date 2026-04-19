def predict_important_topics(topics: list, raw_text: str) -> list:
    """
    Assign final importance probability to each topic.
    Called after TF-IDF extraction.
    Incorporates position bias + frequency weighting.
    """
    if not topics:
        return []

    raw_lower = raw_text.lower()
    max_tfidf = max(t["tfidf_score"] for t in topics) or 1
    max_freq  = max(t["frequency"]   for t in topics) or 1

    enriched = []
    for t in topics:
        norm_tfidf = t["tfidf_score"] / max_tfidf
        norm_freq  = t["frequency"]   / max_freq
        position   = _position_score(t["topic"], raw_lower)

        combined    = 0.55 * norm_tfidf + 0.30 * norm_freq + 0.15 * position
        probability = round(min(combined * 100, 99), 1)

        enriched.append({
            "topic":       t["topic"].title(),
            "tfidf_score": t["tfidf_score"],
            "frequency":   t["frequency"],
            "gram_type":   t.get("gram_type", "unigram"),
            "probability": probability,
            "importance":  _importance_label(probability),
            "unit":        _guess_unit(t["topic"]),
        })

    enriched.sort(key=lambda x: x["probability"], reverse=True)
    return enriched


def _position_score(topic: str, text: str) -> float:
    idx = text.find(topic.lower())
    if idx == -1:
        return 0.0
    pos = idx / max(len(text), 1)
    if pos < 0.25: return 1.0
    if pos < 0.50: return 0.75
    if pos < 0.75: return 0.50
    return 0.25


def _importance_label(prob: float) -> str:
    if prob >= 70: return "High"
    if prob >= 45: return "Medium"
    return "Low"


def _guess_unit(topic: str) -> str:
    t = topic.lower()
    mapping = {
        "Unit 1": ["introduction","overview","basic","definition","concept","history","origin","meaning"],
        "Unit 2": ["data","collection","preprocessing","cleaning","dataset","feature","gather","source"],
        "Unit 3": ["algorithm","model","classification","regression","tree","bayes","cluster","learning","neural","network"],
        "Unit 4": ["evaluation","accuracy","precision","recall","metric","performance","testing","validation"],
        "Unit 5": ["application","case","project","deployment","implementation","system","real","industry"],
    }
    for unit, keywords in mapping.items():
        if any(kw in t for kw in keywords):
            return unit
    return "General"
