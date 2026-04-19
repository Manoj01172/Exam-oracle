import requests
import json
import re

# ── Groq API — Free, very fast, generous limits ───────────────────────────────
# Get free key from: https://console.groq.com  (signup with Google)
# Free tier: 14,400 requests/day, 6000 tokens/min — plenty for this project
GROQ_API_KEY = "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"
GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL   = "llama-3.3-70b-versatile"   # Free, powerful model


def run_ai_analysis(raw_text: str, filename: str = "") -> dict:
    """
    Send extracted PDF text to Groq API for intelligent analysis.
    Returns: topics, predicted questions with answers, frequently asked, marks guide, quiz.
    """
    if not raw_text or len(raw_text.strip()) < 100:
        return _empty_result(error="Not enough text extracted from PDF.")

    text_chunk = raw_text[:4000]

    prompt = f"""You are an expert exam analyst. Analyze this exam question paper and return a comprehensive JSON analysis.

EXAM PAPER TEXT:
{text_chunk}

Return ONLY valid JSON, no markdown, no explanation, just the JSON object:
{{
  "subject": "Subject name detected from paper",
  "summary": "2-3 sentence overview of what this exam covers and what students should focus on",
  "topic_weightage": [
    {{
      "topic": "Topic name (2-4 words, real subject concept)",
      "weightage": 25,
      "frequency": 4,
      "importance": "High",
      "unit": "Unit 1",
      "description": "One line about this topic"
    }}
  ],
  "predicted_questions": [
    {{
      "question": "Full predicted exam question",
      "topic": "Related topic",
      "marks": 10,
      "importance": "High",
      "probability": 85,
      "answer": "Detailed model answer. For 2-mark: 2-3 lines with definition. For 5-mark: structured paragraph with points. For 10-mark: detailed explanation with examples.",
      "answer_length_guide": "Specific guidance like: Write 2-3 lines covering definition and one example",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }}
  ],
  "frequently_asked": [
    {{
      "question": "Most repeated question from paper",
      "times_appeared": 2,
      "topic": "Topic name",
      "marks": 5
    }}
  ],
  "marks_distribution": [
    {{ "marks": 2, "question_count": 5, "guidance": "Definition + one example, 2-3 lines max" }},
    {{ "marks": 5, "question_count": 4, "guidance": "Explanation with 3-4 points, one paragraph" }},
    {{ "marks": 10, "question_count": 3, "guidance": "Detailed answer with introduction, body, conclusion, examples" }}
  ],
  "quiz_questions": [
    {{
      "question": "MCQ question directly from paper content",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Why this answer is correct",
      "topic": "Topic name",
      "difficulty": "Medium"
    }}
  ]
}}

Rules:
- topic_weightage: 6-10 real subject topics only, weightage values must sum to 100
- predicted_questions: 8-12 questions mixing 2, 5, and 10 mark questions
- frequently_asked: 3-5 questions that appear repeatedly
- quiz_questions: 8-10 MCQs based on actual content
- answers must match marks — 2 marks short, 10 marks detailed
- topics must be real subject concepts NOT instruction words like explain/write/discuss
- probability: 0-99, importance: High/Medium/Low only"""

    try:
        response = requests.post(
            GROQ_URL,
            headers={
                "Content-Type":  "application/json",
                "Authorization": f"Bearer {GROQ_API_KEY}",
            },
            json={
                "model":       GROQ_MODEL,
                "messages":    [{"role": "user", "content": prompt}],
                "temperature": 0.3,
                "max_tokens":  4000,
            },
            timeout=60
        )

        if response.status_code != 200:
            return _empty_result(error=f"Groq API error: {response.status_code} — {response.text[:300]}")

        data         = response.json()
        raw_response = data.get("choices", [{}])[0].get("message", {}).get("content", "")

        if not raw_response:
            return _empty_result(error="Empty response from Groq.")

        # Clean and parse JSON
        cleaned    = re.sub(r"```json|```", "", raw_response).strip()
        json_match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if json_match:
            cleaned = json_match.group(0)

        result            = json.loads(cleaned)
        result["success"] = True
        return result

    except json.JSONDecodeError as e:
        return _empty_result(error=f"Could not parse response: {str(e)}")
    except requests.exceptions.Timeout:
        return _empty_result(error="Request timed out. Try again.")
    except Exception as e:
        return _empty_result(error=f"Unexpected error: {str(e)}")


def _empty_result(error: str = "") -> dict:
    return {
        "success":             False,
        "error":               error,
        "subject":             "Unknown",
        "summary":             "",
        "topic_weightage":     [],
        "predicted_questions": [],
        "frequently_asked":    [],
        "marks_distribution":  [],
        "quiz_questions":      [],
    }
