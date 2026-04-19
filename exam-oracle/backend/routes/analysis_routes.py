from flask import Blueprint, request, jsonify
import os

from database.db import get_connection
from modules.pdf_processor import extract_text_from_pdf
from modules.preprocessor import preprocess_text
from modules.feature_extractor import extract_topics_tfidf
from modules.ml_models import run_all_algorithms
from modules.ai_analyzer import run_ai_analysis

analysis_bp = Blueprint("analysis", __name__)


@analysis_bp.route("/run/<int:pdf_id>", methods=["POST"])
def run_analysis(pdf_id):
    """Hybrid pipeline: ML stats + Claude AI intelligent analysis."""
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT filename, original_name FROM pdf_files WHERE id = ?", (pdf_id,)
        ).fetchone()
    finally:
        conn.close()

    if not row:
        return jsonify({"error": "PDF not found."}), 404

    file_path = os.path.join("uploads", row["filename"])
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found on disk."}), 404

    # Step 1 — Extract text
    extraction = extract_text_from_pdf(file_path)
    if not extraction.get("success"):
        return jsonify({"error": "Could not extract text. May be a scanned PDF."}), 422

    raw_text = extraction["text"]

    # Step 2 — Traditional ML (for algorithm comparison)
    preprocessed = preprocess_text(raw_text)
    topics_raw   = extract_topics_tfidf(
        sentences=preprocessed["sentences"],
        bigrams=preprocessed["bigrams"],
        trigrams=preprocessed["trigrams"],
        top_n=20,
    )
    ml_results = run_all_algorithms(preprocessed["sentences"], topics_raw)

    # Step 3 — Claude AI intelligent analysis
    ai_results = run_ai_analysis(raw_text, filename=row["original_name"])

    # Step 4 — Save to database
    conn = get_connection()
    try:
        conn.execute("DELETE FROM topics WHERE pdf_id=?", (pdf_id,))
        conn.execute("DELETE FROM predicted_questions WHERE pdf_id=?", (pdf_id,))

        if ai_results.get("success") and ai_results.get("topic_weightage"):
            for t in ai_results["topic_weightage"]:
                conn.execute(
                    "INSERT INTO topics (pdf_id,topic,frequency,tfidf_score,unit) VALUES (?,?,?,?,?)",
                    (pdf_id, t["topic"], t.get("frequency", 1), t.get("weightage", 0)/100, t.get("unit","General"))
                )
        else:
            for t in (ml_results.get("topics") or []):
                conn.execute(
                    "INSERT INTO topics (pdf_id,topic,frequency,tfidf_score,unit) VALUES (?,?,?,?,?)",
                    (pdf_id, t["topic"], t["frequency"], t["tfidf_score"], t.get("unit","General"))
                )

        conn.execute("UPDATE pdf_files SET status='analyzed' WHERE id=?", (pdf_id,))
        conn.commit()
    finally:
        conn.close()

    return jsonify({
        "message":             "Analysis complete.",
        "pdf_id":              pdf_id,
        "word_count":          preprocessed["word_count"],
        "sentence_count":      preprocessed["sentence_count"],
        "subject":             ai_results.get("subject", ""),
        "summary":             ai_results.get("summary", ""),
        "topic_weightage":     ai_results.get("topic_weightage", []),
        "predicted_questions": ai_results.get("predicted_questions", []),
        "frequently_asked":    ai_results.get("frequently_asked", []),
        "marks_distribution":  ai_results.get("marks_distribution", []),
        "quiz_questions":      ai_results.get("quiz_questions", []),
        "ai_success":          ai_results.get("success", False),
        "ml_comparison":       ml_results.get("algorithms", {}),
        "best_algorithm":      ml_results.get("best_algorithm", ""),
        "best_accuracy":       ml_results.get("best_accuracy", 0),
        "topics_found":        len(ai_results.get("topic_weightage", [])),
    }), 200


@analysis_bp.route("/full/<int:pdf_id>", methods=["GET"])
def get_full_analysis(pdf_id):
    """Return complete AI analysis for a PDF."""
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT filename, original_name FROM pdf_files WHERE id=? AND status='analyzed'", (pdf_id,)
        ).fetchone()
        if not row:
            return jsonify({"error": "PDF not analyzed yet."}), 404
        topics = conn.execute(
            "SELECT topic,frequency,tfidf_score,unit FROM topics WHERE pdf_id=? ORDER BY tfidf_score DESC", (pdf_id,)
        ).fetchall()
    finally:
        conn.close()

    file_path  = os.path.join("uploads", row["filename"])
    extraction = extract_text_from_pdf(file_path)
    ai_results = {}
    if extraction.get("success"):
        ai_results = run_ai_analysis(extraction["text"], filename=row["original_name"])

    return jsonify({
        "pdf_id":              pdf_id,
        "filename":            row["original_name"],
        "stored_topics":       [dict(t) for t in topics],
        "subject":             ai_results.get("subject", ""),
        "summary":             ai_results.get("summary", ""),
        "topic_weightage":     ai_results.get("topic_weightage", []),
        "predicted_questions": ai_results.get("predicted_questions", []),
        "frequently_asked":    ai_results.get("frequently_asked", []),
        "marks_distribution":  ai_results.get("marks_distribution", []),
        "quiz_questions":      ai_results.get("quiz_questions", []),
        "ai_success":          ai_results.get("success", False),
    }), 200


@analysis_bp.route("/algorithms/<int:pdf_id>", methods=["GET"])
def get_algorithm_results(pdf_id):
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT filename FROM pdf_files WHERE id=? AND status='analyzed'", (pdf_id,)
        ).fetchone()
        if not row:
            return jsonify({"error": "PDF not analyzed yet."}), 404
        file_path  = os.path.join("uploads", row["filename"])
        extraction = extract_text_from_pdf(file_path)
        if not extraction.get("success"):
            return jsonify({"error": "Could not re-read PDF."}), 422
        prep       = preprocess_text(extraction["text"])
        topics_raw = extract_topics_tfidf(prep["sentences"], prep["bigrams"], prep["trigrams"], top_n=15)
        ml         = run_all_algorithms(prep["sentences"], topics_raw)
        return jsonify({
            "pdf_id": pdf_id,
            "algorithms": ml["algorithms"],
            "best_algorithm": ml["best_algorithm"],
            "best_accuracy": ml["best_accuracy"],
        }), 200
    finally:
        conn.close()


@analysis_bp.route("/topics/<int:pdf_id>", methods=["GET"])
def get_topics(pdf_id):
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT topic,frequency,tfidf_score,unit FROM topics WHERE pdf_id=? ORDER BY tfidf_score DESC", (pdf_id,)
        ).fetchall()
        return jsonify({"pdf_id": pdf_id, "topics": [dict(r) for r in rows]}), 200
    finally:
        conn.close()


@analysis_bp.route("/topics/all", methods=["GET"])
def get_all_topics():
    conn = get_connection()
    try:
        rows = conn.execute(
            """SELECT topic, SUM(frequency) AS total_frequency,
               AVG(tfidf_score) AS avg_score, COUNT(DISTINCT pdf_id) AS pdf_count
               FROM topics GROUP BY topic ORDER BY total_frequency DESC LIMIT 30"""
        ).fetchall()
        return jsonify({"topics": [dict(r) for r in rows]}), 200
    finally:
        conn.close()


@analysis_bp.route("/compare", methods=["POST"])
def compare_pdfs():
    data    = request.get_json()
    pdf_ids = data.get("pdf_ids", [])
    if len(pdf_ids) < 2:
        return jsonify({"error": "At least two PDF IDs required."}), 400
    conn = get_connection()
    try:
        ph   = ",".join("?" * len(pdf_ids))
        rows = conn.execute(
            f"""SELECT topic, COUNT(DISTINCT pdf_id) AS occurrence_count,
                SUM(frequency) AS total_frequency FROM topics WHERE pdf_id IN ({ph})
                GROUP BY topic HAVING occurrence_count > 1
                ORDER BY occurrence_count DESC, total_frequency DESC""",
            pdf_ids
        ).fetchall()
        return jsonify({"pdf_ids": pdf_ids, "common_topics": [dict(r) for r in rows], "total_found": len(rows)}), 200
    finally:
        conn.close()


@analysis_bp.route("/quiz/save", methods=["POST"])
def save_quiz_result():
    data       = request.get_json()
    user_id    = data.get("user_id")
    score      = data.get("score")
    total      = data.get("total")
    subject    = data.get("subject", "General")
    time_taken = data.get("time_taken", 0)
    if not all([user_id, score is not None, total]):
        return jsonify({"error": "user_id, score, and total are required."}), 400
    percentage = round((score / total) * 100, 1) if total > 0 else 0
    conn = get_connection()
    try:
        conn.execute(
            "INSERT INTO quiz_results (user_id,score,total,percentage,subject,time_taken) VALUES (?,?,?,?,?,?)",
            (user_id, score, total, percentage, subject, time_taken)
        )
        conn.commit()
        return jsonify({"message": "Quiz result saved.", "percentage": percentage}), 201
    finally:
        conn.close()
