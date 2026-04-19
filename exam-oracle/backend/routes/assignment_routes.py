from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os, uuid, json
from database.db import get_connection

assignment_bp = Blueprint("assignment", __name__)


@assignment_bp.route("/create", methods=["POST"])
def create_assignment():
    """Teacher creates assignment — can target a specific class or all students."""
    teacher_id  = request.form.get("teacher_id")
    title       = request.form.get("title", "").strip()
    description = request.form.get("description", "").strip()
    atype       = request.form.get("type", "text")
    content     = request.form.get("content", "")
    due_date    = request.form.get("due_date", "")
    subject     = request.form.get("subject", "General")
    total_marks = request.form.get("total_marks", 100)
    class_id    = request.form.get("class_id")   # None = send to all

    if not teacher_id or not title:
        return jsonify({"error": "teacher_id and title are required."}), 400

    filename = original_name = ""
    if atype == "pdf" and "file" in request.files:
        file = request.files["file"]
        if file.filename:
            original_name = secure_filename(file.filename)
            filename      = f"assign_{uuid.uuid4().hex}_{original_name}"
            file.save(os.path.join(current_app.config["UPLOAD_FOLDER"], filename))

    conn = get_connection()
    try:
        cursor = conn.execute(
            """INSERT INTO assignments
               (teacher_id, class_id, title, description, type, content,
                due_date, subject, total_marks, filename, original_name)
               VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
            (teacher_id, class_id or None, title, description, atype,
             content, due_date, subject, total_marks, filename, original_name)
        )
        conn.commit()
        return jsonify({"message": "Assignment created.", "id": cursor.lastrowid}), 201
    finally:
        conn.close()


@assignment_bp.route("/teacher/<int:teacher_id>", methods=["GET"])
def get_teacher_assignments(teacher_id):
    conn = get_connection()
    try:
        rows = conn.execute(
            """SELECT a.*,
               c.name AS class_name,
               (SELECT COUNT(*) FROM assignment_submissions s WHERE s.assignment_id=a.id) AS submission_count
               FROM assignments a
               LEFT JOIN classes c ON a.class_id = c.id
               WHERE a.teacher_id=? ORDER BY a.created_at DESC""",
            (teacher_id,)
        ).fetchall()
        return jsonify({"assignments": [dict(r) for r in rows]}), 200
    finally:
        conn.close()


@assignment_bp.route("/<int:assignment_id>/submissions", methods=["GET"])
def get_submissions(assignment_id):
    conn = get_connection()
    try:
        rows = conn.execute(
            """SELECT s.*, u.name AS student_name, u.email AS student_email
               FROM assignment_submissions s
               JOIN users u ON s.student_id=u.id
               WHERE s.assignment_id=? ORDER BY s.submitted_at DESC""",
            (assignment_id,)
        ).fetchall()
        return jsonify({"submissions": [dict(r) for r in rows]}), 200
    finally:
        conn.close()


@assignment_bp.route("/grade/<int:submission_id>", methods=["POST"])
def grade_submission(submission_id):
    data = request.get_json()
    conn = get_connection()
    try:
        conn.execute(
            "UPDATE assignment_submissions SET marks_obtained=?, feedback=?, status='graded' WHERE id=?",
            (data.get("marks_obtained", 0), data.get("feedback", ""), submission_id)
        )
        conn.commit()
        return jsonify({"message": "Graded."}), 200
    finally:
        conn.close()


@assignment_bp.route("/<int:assignment_id>", methods=["DELETE"])
def delete_assignment(assignment_id):
    conn = get_connection()
    try:
        conn.execute("UPDATE assignments SET is_active=0 WHERE id=?", (assignment_id,))
        conn.commit()
        return jsonify({"message": "Deleted."}), 200
    finally:
        conn.close()


@assignment_bp.route("/student/all", methods=["GET"])
def get_student_assignments():
    """
    Return assignments visible to a student:
    - Assignments sent to ALL (class_id IS NULL)
    - Assignments sent to classes the student has joined
    """
    student_id = request.args.get("student_id")
    conn = get_connection()
    try:
        rows = conn.execute(
            """SELECT a.*,
               u.name AS teacher_name,
               c.name AS class_name,
               s.id AS submission_id,
               s.status AS submission_status,
               s.marks_obtained,
               s.feedback,
               s.submitted_at AS my_submitted_at
               FROM assignments a
               JOIN users u ON a.teacher_id = u.id
               LEFT JOIN classes c ON a.class_id = c.id
               LEFT JOIN assignment_submissions s
                 ON s.assignment_id=a.id AND s.student_id=?
               WHERE a.is_active=1
               AND (
                 a.class_id IS NULL
                 OR a.class_id IN (
                   SELECT class_id FROM class_members WHERE student_id=?
                 )
               )
               ORDER BY a.created_at DESC""",
            (student_id, student_id)
        ).fetchall()
        return jsonify({"assignments": [dict(r) for r in rows]}), 200
    finally:
        conn.close()


@assignment_bp.route("/submit", methods=["POST"])
def submit_assignment():
    assignment_id = request.form.get("assignment_id")
    student_id    = request.form.get("student_id")
    answer_text   = request.form.get("answer_text", "")
    mcq_answers   = request.form.get("mcq_answers", "[]")

    if not assignment_id or not student_id:
        return jsonify({"error": "assignment_id and student_id required."}), 400

    filename = original_name = ""
    if "file" in request.files:
        file = request.files["file"]
        if file.filename:
            original_name = secure_filename(file.filename)
            filename      = f"sub_{uuid.uuid4().hex}_{original_name}"
            file.save(os.path.join(current_app.config["UPLOAD_FOLDER"], filename))

    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM assignment_submissions WHERE assignment_id=? AND student_id=?",
            (assignment_id, student_id)
        ).fetchone()

        if existing:
            conn.execute(
                """UPDATE assignment_submissions
                   SET answer_text=?, filename=?, original_name=?, mcq_answers=?,
                       status='resubmitted', submitted_at=datetime('now')
                   WHERE id=?""",
                (answer_text, filename, original_name, mcq_answers, existing["id"])
            )
        else:
            conn.execute(
                """INSERT INTO assignment_submissions
                   (assignment_id, student_id, answer_text, filename, original_name, mcq_answers)
                   VALUES (?,?,?,?,?,?)""",
                (assignment_id, student_id, answer_text, filename, original_name, mcq_answers)
            )
        conn.commit()
        return jsonify({"message": "Submitted successfully."}), 201
    finally:
        conn.close()
