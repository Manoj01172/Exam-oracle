from sklearn.feature_extraction.text import TfidfVectorizer
from collections import Counter
import numpy as np

# Custom stopwords — exam instruction words filtered out from TF-IDF
_CUSTOM_STOPS = list({
    "explain", "write", "discuss", "describe", "define", "list", "mention",
    "state", "note", "answer", "question", "marks", "mark", "unit", "part",
    "section", "module", "chapter", "page", "attempt", "solve", "calculate",
    "find", "derive", "prove", "show", "illustrate", "analyze", "analyse",
    "compare", "contrast", "evaluate", "examine", "identify", "justify",
    "outline", "summarize", "summarise", "review", "elaborate", "brief",
    "also", "would", "could", "use", "used", "using", "may", "one", "two",
    "three", "four", "five", "first", "second", "third", "year", "time",
    "example", "given", "following", "based", "however", "therefore",
    "thus", "hence", "since", "though", "although", "whereas", "whether",
    "give", "name", "short", "long", "important", "general", "specific",
    "various", "different", "common", "university", "college", "institute",
    "department", "course", "subject", "exam", "examination", "paper", "test",
    "semester", "term", "annual", "internal", "external", "final", "student",
    "teacher", "professor", "faculty", "class", "lecture", "roll", "number",
    "code", "total", "date", "duration", "hour", "minute", "instruction",
    "compulsory", "optional", "choice", "maximum", "minimum", "right", "left",
    "must", "need", "make", "take", "come", "know", "think", "mean", "type",
    "kind", "form", "ways", "method", "what", "when", "where", "which", "how",
    "why", "whose", "whom", "will", "shall", "have", "been", "does", "into",
    "each", "every", "much", "many", "well", "good", "best", "more", "most",
    "that", "this", "with", "from", "their", "they", "were", "been", "have",
    "other", "same", "such", "both", "even", "only", "like", "able", "while",
})


def extract_topics_tfidf(sentences: list, bigrams: list, trigrams: list, top_n: int = 25) -> list:
    """
    Apply TF-IDF on sentences + bigrams + trigrams combined
    to extract meaningful multi-word topics.
    """
    if not sentences or len(sentences) < 2:
        return []

    # Unigram TF-IDF
    unigram_results = _run_tfidf(
        documents   = sentences,
        ngram_range = (1, 1),
        max_features= 300,
        top_n       = top_n,
        gram_type   = "unigram",
        all_text    = " ".join(sentences),
    )

    # Bigram TF-IDF
    bigram_docs    = _chunk_list(bigrams, chunk_size=20)
    bigram_results = []
    if len(bigram_docs) >= 2:
        bigram_results = _run_tfidf(
            documents   = bigram_docs,
            ngram_range = (1, 2),
            max_features= 200,
            top_n       = top_n,
            gram_type   = "bigram",
            all_text    = " ".join(bigrams),
        )

    # Trigram TF-IDF
    trigram_docs    = _chunk_list(trigrams, chunk_size=15)
    trigram_results = []
    if len(trigram_docs) >= 2:
        trigram_results = _run_tfidf(
            documents   = trigram_docs,
            ngram_range = (1, 3),
            max_features= 100,
            top_n       = top_n // 2,
            gram_type   = "trigram",
            all_text    = " ".join(trigrams),
        )

    # Merge and deduplicate — prefer longer phrases
    all_results = bigram_results + trigram_results + unigram_results
    seen        = set()
    merged      = []

    for item in all_results:
        key = item["topic"].lower()
        if any(key in existing or existing in key for existing in seen):
            continue
        seen.add(key)
        merged.append(item)

    merged.sort(key=lambda x: x["tfidf_score"] * (1.2 if " " in x["topic"] else 1.0), reverse=True)
    return merged[:top_n]


def _run_tfidf(documents, ngram_range, max_features, top_n, gram_type, all_text):
    """Run TF-IDF on documents and return top scored terms."""
    try:
        vectorizer = TfidfVectorizer(
            max_features = max_features,
            ngram_range  = ngram_range,
            min_df       = 1,
            sublinear_tf = True,
            stop_words   = _CUSTOM_STOPS,   # ← custom exam stopwords applied
        )
        matrix        = vectorizer.fit_transform(documents)
        feature_names = vectorizer.get_feature_names_out()
        scores        = np.asarray(matrix.sum(axis=0)).flatten()

        term_scores = sorted(zip(feature_names, scores), key=lambda x: x[1], reverse=True)
        freq_map    = Counter(all_text.lower().split())

        results = []
        for term, score in term_scores[:top_n]:
            if score < 0.01 or len(term) < 4:
                continue
            results.append({
                "topic":       term,
                "tfidf_score": round(float(score), 4),
                "frequency":   freq_map.get(term, 1),
                "gram_type":   gram_type,
            })
        return results
    except Exception:
        return []


def _chunk_list(items: list, chunk_size: int) -> list:
    """Split flat list into chunks to simulate documents for TF-IDF."""
    if not items:
        return []
    return [" ".join(items[i:i + chunk_size]) for i in range(0, len(items), chunk_size)]
