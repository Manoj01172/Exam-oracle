from flask import Blueprint, request, jsonify
import bcrypt
from database.db import get_connection

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user account."""
    data = request.get_json()

    name     = data.get("name", "").strip()
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role     = data.get("role", "student")

    # Basic validation
    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required."}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    if role not in ("student", "teacher", "admin"):
        return jsonify({"error": "Invalid role."}), 400

    # Hash password
    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    conn = get_connection()
    try:
        conn.execute(
            "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
            (name, email, password_hash, role)
        )
        conn.commit()

        user = conn.execute(
            "SELECT id, name, email, role, created_at FROM users WHERE email = ?",
            (email,)
        ).fetchone()

        return jsonify({
            "message": "Account created successfully.",
            "user": {
                "id":         user["id"],
                "name":       user["name"],
                "email":      user["email"],
                "role":       user["role"],
                "created_at": user["created_at"]
            }
        }), 201

    except Exception as e:
        if "UNIQUE constraint failed" in str(e):
            return jsonify({"error": "An account with this email already exists."}), 409
        return jsonify({"error": "Registration failed. Please try again."}), 500

    finally:
        conn.close()


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate a user and return their profile."""
    data = request.get_json()

    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    conn = get_connection()
    try:
        user = conn.execute(
            "SELECT * FROM users WHERE email = ?", (email,)
        ).fetchone()

        if not user:
            return jsonify({"error": "No account found with this email."}), 404

        # Verify password
        if not bcrypt.checkpw(password.encode("utf-8"), user["password_hash"].encode("utf-8")):
            return jsonify({"error": "Incorrect password."}), 401

        return jsonify({
            "message": "Login successful.",
            "user": {
                "id":    user["id"],
                "name":  user["name"],
                "email": user["email"],
                "role":  user["role"]
            }
        }), 200

    finally:
        conn.close()


@auth_bp.route("/users", methods=["GET"])
def get_all_users():
    """Return a list of all registered users (for teacher/admin dashboard)."""
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
        ).fetchall()

        users = [dict(r) for r in rows]
        return jsonify({"users": users}), 200
    finally:
        conn.close()


@auth_bp.route("/users/<int:user_id>/stats", methods=["GET"])
def get_user_stats(user_id):
    """Return quiz statistics for a specific user."""
    conn = get_connection()
    try:
        results = conn.execute(
            """
            SELECT score, total, percentage, subject, completed_at
            FROM quiz_results
            WHERE user_id = ?
            ORDER BY completed_at DESC
            """,
            (user_id,)
        ).fetchall()

        stats = [dict(r) for r in results]

        avg = (sum(r["percentage"] for r in stats) / len(stats)) if stats else 0
        return jsonify({
            "user_id":     user_id,
            "total_quizzes": len(stats),
            "average_score": round(avg, 1),
            "history":     stats
        }), 200
    finally:
        conn.close()
