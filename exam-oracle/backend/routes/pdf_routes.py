from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
import uuid

from database.db import get_connection
from modules.pdf_processor import extract_text_from_pdf

pdf_bp = Blueprint("pdf", __name__)

ALLOWED_EXTENSIONS = {"pdf"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@pdf_bp.route("/upload", methods=["POST"])
def upload_pdf():
    """
    Upload one or more PDF files.
    Expects: multipart/form-data with 'files' field and 'user_id' field.
    """
    if "files" not in request.files:
        return jsonify({"error": "No files were provided."}), 400

    user_id = request.form.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id is required."}), 400

    files = request.files.getlist("files")
    if not files or all(f.filename == "" for f in files):
        return jsonify({"error": "No files selected."}), 400

    upload_folder = current_app.config["UPLOAD_FOLDER"]
    uploaded = []
    errors   = []

    for file in files:
        if file.filename == "":
            continue

        if not allowed_file(file.filename):
            errors.append(f"{file.filename}: Only PDF files are allowed.")
            continue

        # Save with a unique name to avoid collisions
        original_name  = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{original_name}"
        save_path       = os.path.join(upload_folder, unique_filename)

        file.save(save_path)
        file_size = os.path.getsize(save_path)

        # Extract text immediately
        extraction = extract_text_from_pdf(save_path)

        conn = get_connection()
        try:
            cursor = conn.execute(
                """
                INSERT INTO pdf_files
                    (user_id, filename, original_name, file_size, page_count, word_count, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    user_id,
                    unique_filename,
                    original_name,
                    file_size,
                    extraction.get("page_count", 0),
                    extraction.get("word_count", 0),
                    "processed" if extraction.get("success") else "failed"
                )
            )
            conn.commit()
            pdf_id = cursor.lastrowid
        finally:
            conn.close()

        uploaded.append({
            "id":            pdf_id,
            "original_name": original_name,
            "file_size_kb":  round(file_size / 1024, 1),
            "page_count":    extraction.get("page_count", 0),
            "word_count":    extraction.get("word_count", 0),
            "status":        "processed" if extraction.get("success") else "failed",
            "preview":       extraction.get("preview", "")
        })

    return jsonify({
        "message":  f"{len(uploaded)} file(s) uploaded and processed.",
        "uploaded": uploaded,
        "errors":   errors
    }), 200 if uploaded else 400


@pdf_bp.route("/list/<int:user_id>", methods=["GET"])
def list_pdfs(user_id):
    """Return all PDFs uploaded by a specific user."""
    conn = get_connection()
    try:
        rows = conn.execute(
            """
            SELECT id, original_name, file_size, page_count, word_count, status, uploaded_at
            FROM pdf_files
            WHERE user_id = ?
            ORDER BY uploaded_at DESC
            """,
            (user_id,)
        ).fetchall()

        pdfs = []
        for row in rows:
            r = dict(row)
            r["file_size_kb"] = round(r["file_size"] / 1024, 1)
            pdfs.append(r)

        return jsonify({"pdfs": pdfs}), 200
    finally:
        conn.close()


@pdf_bp.route("/delete/<int:pdf_id>", methods=["DELETE"])
def delete_pdf(pdf_id):
    """Delete a PDF record and its file from disk."""
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT filename FROM pdf_files WHERE id = ?", (pdf_id,)
        ).fetchone()

        if not row:
            return jsonify({"error": "PDF not found."}), 404

        # Remove file from disk
        file_path = os.path.join("uploads", row["filename"])
        if os.path.exists(file_path):
            os.remove(file_path)

        # Remove from database
        conn.execute("DELETE FROM pdf_files WHERE id = ?", (pdf_id,))
        conn.execute("DELETE FROM topics WHERE pdf_id = ?", (pdf_id,))
        conn.execute("DELETE FROM predicted_questions WHERE pdf_id = ?", (pdf_id,))
        conn.commit()

        return jsonify({"message": "PDF deleted successfully."}), 200
    finally:
        conn.close()


@pdf_bp.route("/all", methods=["GET"])
def list_all_pdfs():
    """Return all uploaded PDFs across all users (for admin/teacher)."""
    conn = get_connection()
    try:
        rows = conn.execute(
            """
            SELECT p.id, p.original_name, p.file_size, p.page_count,
                   p.word_count, p.status, p.uploaded_at,
                   u.name AS uploaded_by, u.email AS user_email
            FROM pdf_files p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.uploaded_at DESC
            """
        ).fetchall()

        pdfs = []
        for row in rows:
            r = dict(row)
            r["file_size_kb"] = round(r["file_size"] / 1024, 1)
            pdfs.append(r)

        return jsonify({"pdfs": pdfs}), 200
    finally:
        conn.close()
