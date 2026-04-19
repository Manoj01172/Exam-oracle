from flask import Flask, jsonify
from flask_cors import CORS
import os
import sys

# FIX PATH
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# CONFIG
app.config["UPLOAD_FOLDER"] = os.path.join(os.path.dirname(__file__), "uploads")
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024
app.config["SECRET_KEY"] = "exam-oracle-secret-key-2025"

os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# =========================
# SAFE IMPORTS (NO CRASH)
# =========================

# AUTH
try:
    from routes.auth_routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    print("✅ auth_routes loaded")
except Exception as e:
    print("❌ auth_routes ERROR:", e)

# PDF
try:
    from routes.pdf_routes import pdf_bp
    app.register_blueprint(pdf_bp, url_prefix="/api/pdf")
    print("✅ pdf_routes loaded")
except Exception as e:
    print("❌ pdf_routes ERROR:", e)

# ANALYSIS
try:
    from routes.analysis_routes import analysis_bp
    app.register_blueprint(analysis_bp, url_prefix="/api/analysis")
    print("✅ analysis_routes loaded")
except Exception as e:
    print("❌ analysis_routes ERROR:", e)

# ASSIGNMENT
try:
    from routes.assignment_routes import assignment_bp
    app.register_blueprint(assignment_bp, url_prefix="/api/assignments")
    print("✅ assignment_routes loaded")
except Exception as e:
    print("❌ assignment_routes ERROR:", e)

# ATTENDANCE
try:
    from routes.attendance_routes import attendance_bp
    app.register_blueprint(attendance_bp, url_prefix="/api/attendance")
    print("✅ attendance_routes loaded")
except Exception as e:
    print("❌ attendance_routes ERROR:", e)

# CLASS
try:
    from routes.class_routes import class_bp
    app.register_blueprint(class_bp, url_prefix="/api/classes")
    print("✅ class_routes loaded")
except Exception as e:
    print("❌ class_routes ERROR:", e)

# NOTIFICATIONS
try:
    from routes.notification_routes import notification_bp
    app.register_blueprint(notification_bp, url_prefix="/api/notifications")
    print("✅ notification_routes loaded")
except Exception as e:
    print("❌ notification_routes ERROR:", e)

# DOUBTS
try:
    from routes.doubt_routes import doubt_bp
    app.register_blueprint(doubt_bp, url_prefix="/api/doubts")
    print("✅ doubt_routes loaded")
except Exception as e:
    print("❌ doubt_routes ERROR:", e)

# SHARED NOTES
try:
    from routes.shared_notes_routes import shared_notes_bp
    app.register_blueprint(shared_notes_bp, url_prefix="/api/shared-notes")
    print("✅ shared_notes_routes loaded")
except Exception as e:
    print("❌ shared_notes_routes ERROR:", e)

# =========================
# DB DISABLED (TEMP)
# =========================
# try:
#     from database.db import init_db
#     with app.app_context():
#         init_db()
#     print("✅ DB initialized")
# except Exception as e:
#     print("❌ DB ERROR:", e)

# =========================
# HEALTH CHECK
# =========================
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "running", "version": "3.0.0"})


# =========================
# RUN (RENDER SAFE)
# =========================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)