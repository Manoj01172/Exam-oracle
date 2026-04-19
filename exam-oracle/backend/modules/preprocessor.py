import re
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.util import ngrams

# Download required NLTK data
for resource in ["punkt", "stopwords", "wordnet", "punkt_tab"]:
    try:
        nltk.download(resource, quiet=True)
    except Exception:
        pass

_LEMMATIZER = WordNetLemmatizer()
_STOP_WORDS = set(stopwords.words("english"))

# ── Exam instruction words — NOT topics ───────────────────────────────────────
_EXAM_WORDS = {
    "explain", "write", "discuss", "describe", "define", "list", "mention",
    "state", "note", "answer", "question", "marks", "mark", "unit", "part",
    "section", "module", "chapter", "page", "attempt", "solve", "calculate",
    "find", "derive", "prove", "show", "illustrate", "analyze", "analyse",
    "compare", "contrast", "evaluate", "examine", "identify", "justify",
    "outline", "summarize", "summarise", "review", "elaborate", "brief",
    "also", "would", "could", "use", "used", "using", "may", "one", "two",
    "three", "four", "five", "first", "second", "third", "year", "time",
    "part", "example", "given", "following", "based", "however", "therefore",
    "thus", "hence", "since", "though", "although", "whereas", "whether",
    "give", "name", "short", "long", "important", "general", "specific",
    "various", "different", "common", "university", "college", "institute",
    "department", "course", "subject", "exam", "examination", "paper", "test",
    "semester", "term", "annual", "internal", "external", "final", "student",
    "teacher", "professor", "faculty", "class", "lecture", "roll", "number",
    "code", "total", "date", "duration", "hour", "minute", "instruction",
    "compulsory", "optional", "choice", "attempt", "section", "maximum",
    "minimum", "right", "left", "must", "need", "make", "take", "come",
    "know", "think", "mean", "type", "kind", "form", "ways", "method", "what",
}
_STOP_WORDS.update(_EXAM_WORDS)

_ROMAN = {"i","ii","iii","iv","v","vi","vii","viii","ix","x",
          "xi","xii","xiii","xiv","xv","xvi","xvii","xviii","xix","xx"}


def preprocess_text(raw_text: str) -> dict:
    """
    Full NLP preprocessing pipeline:
      1. Clean text (remove numbers, noise)
      2. Sentence tokenization
      3. Word tokenization + stopword removal + lemmatization
      4. Bigram + trigram extraction
    """
    text      = _clean_text(raw_text)
    sentences = sent_tokenize(text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 30]

    all_tokens   = []
    clean_tokens = []

    for sentence in sentences:
        tokens   = word_tokenize(sentence.lower())
        filtered = [
            _LEMMATIZER.lemmatize(token)
            for token in tokens
            if (token.isalpha()
                and token not in _STOP_WORDS
                and len(token) > 3
                and token not in _ROMAN)
        ]
        all_tokens.extend(tokens)
        clean_tokens.extend(filtered)

    bigrams  = [f"{a} {b}"       for a, b    in ngrams(clean_tokens, 2) if a != b]
    trigrams = [f"{a} {b} {c}"   for a, b, c in ngrams(clean_tokens, 3) if len({a,b,c}) == 3]

    return {
        "sentences":      sentences,
        "all_tokens":     all_tokens,
        "clean_tokens":   clean_tokens,
        "bigrams":        bigrams,
        "trigrams":       trigrams,
        "word_count":     len(all_tokens),
        "sentence_count": len(sentences),
        "unique_terms":   len(set(clean_tokens)),
    }


def _clean_text(text: str) -> str:
    text = re.sub(r"\b\d+\b",                " ", text)
    text = re.sub(r"\bPage\s+\d+\b",         " ", text, flags=re.IGNORECASE)
    text = re.sub(r"https?://\S+",           " ", text)
    text = re.sub(r"[^a-zA-Z\s.,?!;:()\-]", " ", text)
    text = re.sub(r"\s+",                    " ", text)
    return text.strip()
