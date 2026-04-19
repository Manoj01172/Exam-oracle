from flask import Blueprint, request, jsonify
import random, string
from database.db import get_connection

class_bp = Blueprint("classes", __name__)


def _gen_code():
    """Generate a unique 6-character join code."""
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


# ── TEACHER: Create a class ───────────────────────────────────────────────────
@class_bp.route("/create", methods=["POST"])
def create_class():
    data       = request.get_json()
    teacher_id = data.get("teacher_id")
    name       = data.get("name", "").strip()
    subject    = data.get("subject", "General")
    section    = data.get("section", "")

    if not teacher_id or not name:
        return jsonify({"error": "teacher_id and name are required."}), 400

    conn = get_connection()
    try:
        # Make sure join code is unique
        while True:
            code = _gen_code()
            exists = conn.execute("SELECT id FROM classes WHERE join_code=?", (code,)).fetchone()
            if not exists:
                break

        cursor = conn.execute(
            "INSERT INTO classes (teacher_id, name, subject, section, join_code) VALUES (?,?,?,?,?)",
            (teacher_id, name, subject, section, code)
        )
        conn.commit()
        return jsonify({"message": "Class created.", "id": cursor.lastrowid, "join_code": code}), 201
    finally:
        conn.close()


# ── TEACHER: Get all classes ──────────────────────────────────────────────────
@class_bp.route("/teacher/<int:teacher_id>", methods=["GET"])
def get_teacher_classes(teacher_id):
    conn = get_connection()
    try:
        rows = conn.execute(
            """SELECT c.*,
               (SELECT COUNT(*) FROM class_members m WHERE m.class_id=c.id) AS student_count
               FROM classes c WHERE c.teacher_id=? ORDER BY c.created_at DESC""",
            (teacher_id,)
        ).fetchall()
        return jsonify({"classes": [dict(r) for r in rows]}), 200
    finally:
        conn.close()


# ── TEACHER: Get students in a class ─────────────────────────────────────────
@class_bp.route("/<int:class_id>/students", methods=["GET"])
def get_class_students(class_id):
    conn = get_connection()
    try:
        rows = conn.execute(
            """SELECT u.id, u.name, u.email, m.joined_at
               FROM class_members m
               JOIN users u ON m.student_id = u.id
               WHERE m.class_id=? ORDER BY u.name""",
            (class_id,)
        ).fetchall()
        return jsonify({"students": [dict(r) for r in rows]}), 200
    finally:
        conn.close()


# ── TEACHER: Delete class ─────────────────────────────────────────────────────
@class_bp.route("/<int:class_id>", methods=["DELETE"])
def delete_class(class_id):
    conn = get_connection()
    try:
        conn.execute("DELETE FROM class_members WHERE class_id=?", (class_id,))
        conn.execute("DELETE FROM classes WHERE id=?", (class_id,))
        conn.commit()
        return jsonify({"message": "Class deleted."}), 200
    finally:
        conn.close()


# ── STUDENT: Join a class via code ────────────────────────────────────────────
@class_bp.route("/join", methods=["POST"])
def join_class():
    data       = request.get_json()
    student_id = data.get("student_id")
    join_code  = data.get("join_code", "").strip().upper()

    if not student_id or not join_code:
        return jsonify({"error": "student_id and join_code required."}), 400

    conn = get_connection()
    try:
        cls = conn.execute("SELECT * FROM classes WHERE join_code=?", (join_code,)).fetchone()
        if not cls:
            return jsonify({"error": "Invalid class code. Please check and try again."}), 404

        already = conn.execute(
            "SELECT id FROM class_members WHERE class_id=? AND student_id=?",
            (cls["id"], student_id)
        ).fetchone()

        if already:
            return jsonify({"error": "You have already joined this class."}), 409

        conn.execute(
            "INSERT INTO class_members (class_id, student_id) VALUES (?,?)",
            (cls["id"], student_id)
        )
        conn.commit()
        return jsonify({
            "message":    f"Successfully joined {cls['name']}!",
            "class_name": cls["name"],
            "subject":    cls["subject"],
        }), 201
    finally:
        conn.close()


# ── STUDENT: Get my classes ───────────────────────────────────────────────────
@class_bp.route("/student/<int:student_id>", methods=["GET"])
def get_student_classes(student_id):
    conn = get_connection()
    try:
        rows = conn.execute(
            """SELECT c.*, u.name AS teacher_name, m.joined_at
               FROM class_members m
               JOIN classes c ON m.class_id = c.id
               JOIN users u ON c.teacher_id = u.id
               WHERE m.student_id=? ORDER BY m.joined_at DESC""",
            (student_id,)
        ).fetchall()
        return jsonify({"classes": [dict(r) for r in rows]}), 200
    finally:
        conn.close()
