from flask import Blueprint, request, jsonify, send_file, current_app
from werkzeug.utils import secure_filename
import os, uuid
from database.db import get_connection

shared_notes_bp = Blueprint("shared_notes", __name__)


@shared_notes_bp.route("/upload", methods=["POST"])
def upload_note():
    teacher_id = request.form.get("teacher_id")
    title      = request.form.get("title","").strip()
    class_id   = request.form.get("class_id") or None

    if not teacher_id or not title:
        return jsonify({"error": "teacher_id and title required."}), 400

    filename = original_name = ""
    if "file" in request.files:
        file = request.files["file"]
        if file.filename:
            original_name = secure_filename(file.filename)
            filename      = f"note_{uuid.uuid4().hex}_{original_name}"
            file.save(os.path.join(current_app.config["UPLOAD_FOLDER"], filename))

    conn = get_connection()
    try:
        conn.execute(
            "INSERT INTO shared_notes (teacher_id, class_id, title, filename, original_name) VALUES (?,?,?,?,?)",
            (teacher_id, class_id, title, filename, original_name)
        )
        # Notify students
        if class_id:
            students = conn.execute("SELECT student_id FROM class_members WHERE class_id=?", (class_id,)).fetchall()
        else:
            students = conn.execute("SELECT id AS student_id FROM users WHERE role='student'").fetchall()
        for s in students:
            conn.execute(
                "INSERT INTO notifications (user_id, title, message, type) VALUES (?,?,?,?)",
                (s["student_id"], "New Notes Shared!", f"Your teacher shared: {title}", "info")
            )
        conn.commit()
        return jsonify({"message": "Notes shared."}), 201
    finally:
        conn.close()


@shared_notes_bp.route("/list", methods=["GET"])
def list_notes():
    user_id = request.args.get("user_id")
    role    = request.args.get("role", "student")
    conn    = get_connection()
    try:
        if role == "teacher":
            rows = conn.execute(
                """SELECT n.*, u.name AS teacher_name, c.name AS class_name
                   FROM shared_notes n JOIN users u ON n.teacher_id=u.id
                   LEFT JOIN classes c ON n.class_id=c.id
                   WHERE n.teacher_id=? ORDER BY n.created_at DESC""",
                (user_id,)
            ).fetchall()
        else:
            rows = conn.execute(
                """SELECT n.*, u.name AS teacher_name, c.name AS class_name
                   FROM shared_notes n JOIN users u ON n.teacher_id=u.id
                   LEFT JOIN classes c ON n.class_id=c.id
                   WHERE n.class_id IS NULL
                   OR n.class_id IN (SELECT class_id FROM class_members WHERE student_id=?)
                   ORDER BY n.created_at DESC""",
                (user_id,)
            ).fetchall()
        return jsonify({"notes": [dict(r) for r in rows]}), 200
    finally:
        conn.close()


@shared_notes_bp.route("/download/<int:note_id>", methods=["GET"])
def download_note(note_id):
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM shared_notes WHERE id=?", (note_id,)).fetchone()
        if not row or not row["filename"]:
            return jsonify({"error": "File not found."}), 404
        path = os.path.join(current_app.config["UPLOAD_FOLDER"], row["filename"])
        return send_file(path, as_attachment=True, download_name=row["original_name"])
    finally:
        conn.close()
