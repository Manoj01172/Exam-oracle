from flask import Blueprint, request, jsonify
from database.db import get_connection

notification_bp = Blueprint("notifications", __name__)


@notification_bp.route("/send", methods=["POST"])
def send_notification():
    data    = request.get_json()
    user_id = data.get("user_id")
    title   = data.get("title", "")
    message = data.get("message", "")
    ntype   = data.get("type", "info")  # info | assignment | reminder | grade

    if not user_id or not title:
        return jsonify({"error": "user_id and title required."}), 400

    conn = get_connection()
    try:
        conn.execute(
            "INSERT INTO notifications (user_id, title, message, type) VALUES (?,?,?,?)",
            (user_id, title, message, ntype)
        )
        conn.commit()
        return jsonify({"message": "Notification sent."}), 201
    finally:
        conn.close()


@notification_bp.route("/broadcast", methods=["POST"])
def broadcast():
    """Send notification to all students or a specific class."""
    data     = request.get_json()
    title    = data.get("title", "")
    message  = data.get("message", "")
    ntype    = data.get("type", "info")
    class_id = data.get("class_id")

    conn = get_connection()
    try:
        if class_id:
            students = conn.execute(
                "SELECT student_id FROM class_members WHERE class_id=?", (class_id,)
            ).fetchall()
        else:
            students = conn.execute(
                "SELECT id AS student_id FROM users WHERE role='student'"
            ).fetchall()

        for s in students:
            conn.execute(
                "INSERT INTO notifications (user_id, title, message, type) VALUES (?,?,?,?)",
                (s["student_id"], title, message, ntype)
            )
        conn.commit()
        return jsonify({"message": f"Sent to {len(students)} students."}), 201
    finally:
        conn.close()


@notification_bp.route("/user/<int:user_id>", methods=["GET"])
def get_notifications(user_id):
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 50",
            (user_id,)
        ).fetchall()
        unread = conn.execute(
            "SELECT COUNT(*) as cnt FROM notifications WHERE user_id=? AND is_read=0",
            (user_id,)
        ).fetchone()
        return jsonify({
            "notifications": [dict(r) for r in rows],
            "unread_count":  unread["cnt"]
        }), 200
    finally:
        conn.close()


@notification_bp.route("/read/<int:notif_id>", methods=["POST"])
def mark_read(notif_id):
    conn = get_connection()
    try:
        conn.execute("UPDATE notifications SET is_read=1 WHERE id=?", (notif_id,))
        conn.commit()
        return jsonify({"message": "Marked as read."}), 200
    finally:
        conn.close()


@notification_bp.route("/read-all/<int:user_id>", methods=["POST"])
def mark_all_read(user_id):
    conn = get_connection()
    try:
        conn.execute("UPDATE notifications SET is_read=1 WHERE user_id=?", (user_id,))
        conn.commit()
        return jsonify({"message": "All marked as read."}), 200
    finally:
        conn.close()
