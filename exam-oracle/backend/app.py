from flask import Flask, jsonify
from flask_cors import CORS
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))


from routes.auth_routes          import auth_bp
from routes.pdf_routes           import pdf_bp
from routes.analysis_routes      import analysis_bp
from routes.assignment_routes    import assignment_bp
from routes.attendance_routes    import attendance_bp
from routes.class_routes         import class_bp
from routes.notification_routes  import notification_bp
from routes.doubt_routes         import doubt_bp
from routes.shared_notes_routes  import shared_notes_bp
from database.db import init_db

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config["UPLOAD_FOLDER"]      = os.path.join(os.path.dirname(__file__), "uploads")
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024
app.config["SECRET_KEY"]         = "exam-oracle-secret-key-2025"

os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

app.register_blueprint(auth_bp,          url_prefix="/api/auth")
app.register_blueprint(pdf_bp,           url_prefix="/api/pdf")
app.register_blueprint(analysis_bp,      url_prefix="/api/analysis")
app.register_blueprint(assignment_bp,    url_prefix="/api/assignments")
app.register_blueprint(attendance_bp,    url_prefix="/api/attendance")
app.register_blueprint(class_bp,         url_prefix="/api/classes")
app.register_blueprint(notification_bp,  url_prefix="/api/notifications")
app.register_blueprint(doubt_bp,         url_prefix="/api/doubts")
app.register_blueprint(shared_notes_bp,  url_prefix="/api/shared-notes")

with app.app_context():
    init_db()


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "running", "version": "3.0.0"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
