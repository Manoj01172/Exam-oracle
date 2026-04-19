from flask import Blueprint, request, jsonify
from database.db import get_connection

doubt_bp = Blueprint("doubts", __name__)


@doubt_bp.route("/ask", methods=["POST"])
def ask_doubt():
    data       = request.get_json()
    student_id = data.get("student_id")
    teacher_id = data.get("teacher_id")
    question   = data.get("question", "").strip()
    subject    = data.get("subject", "General")

    if not student_id or not question:
        return jsonify({"error": "student_id and question required."}), 400

    conn = get_connection()
    try:
        cursor = conn.execute(
            "INSERT INTO doubts (student_id, teacher_id, question, subject) VALUES (?,?,?,?)",
            (student_id, teacher_id, question, subject)
        )
        conn.commit()

        # Auto notify teacher
        if teacher_id:
            student = conn.execute("SELECT name FROM users WHERE id=?", (student_id,)).fetchone()
            conn.execute(
                "INSERT INTO notifications (user_id, title, message, type) VALUES (?,?,?,?)",
                (teacher_id, "New Doubt Received",
                 f"{student['name'] if student else 'A student'} asked: {question[:80]}...",
                 "doubt")
            )
            conn.commit()

        return jsonify({"message": "Doubt submitted.", "id": cursor.lastrowid}), 201
    finally:
        conn.close()


@doubt_bp.route("/answer/<int:doubt_id>", methods=["POST"])
def answer_doubt(doubt_id):
    data   = request.get_json()
    answer = data.get("answer", "").strip()

    if not answer:
        return jsonify({"error": "Answer required."}), 400

    conn = get_connection()
    try:
        doubt = conn.execute("SELECT * FROM doubts WHERE id=?", (doubt_id,)).fetchone()
        if not doubt:
            return jsonify({"error": "Doubt not found."}), 404

        conn.execute(
            "UPDATE doubts SET answer=?, status='answered', answered_at=datetime('now') WHERE id=?",
            (answer, doubt_id)
        )

        # Notify student
        conn.execute(
            "INSERT INTO notifications (user_id, title, message, type) VALUES (?,?,?,?)",
            (doubt["student_id"], "Your Doubt Was Answered!",
             f"Your question has been answered: {doubt['question'][:60]}...", "doubt")
        )
        conn.commit()
        return jsonify({"message": "Answered and student notified."}), 200
    finally:
        conn.close()


@doubt_bp.route("/student/<int:student_id>", methods=["GET"])
def get_student_doubts(student_id):
    conn = get_connection()
    try:
        rows = conn.execute(
            """SELECT d.*, u.name AS teacher_name
               FROM doubts d LEFT JOIN users u ON d.teacher_id=u.id
               WHERE d.student_id=? ORDER BY d.created_at DESC""",
            (student_id,)
        ).fetchall()
        return jsonify({"doubts": [dict(r) for r in rows]}), 200
    finally:
        conn.close()


@doubt_bp.route("/teacher/<int:teacher_id>", methods=["GET"])
def get_teacher_doubts(teacher_id):
    conn = get_connection()
    try:
        rows = conn.execute(
            """SELECT d.*, u.name AS student_name
               FROM doubts d JOIN users u ON d.student_id=u.id
               WHERE d.teacher_id=? ORDER BY d.created_at DESC""",
            (teacher_id,)
        ).fetchall()
        return jsonify({"doubts": [dict(r) for r in rows]}), 200
    finally:
        conn.close()
