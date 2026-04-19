import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "database", "exam_oracle.db")


def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    c    = conn.cursor()

    c.execute("""CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'student',
        created_at TEXT DEFAULT (datetime('now')))""")

    c.execute("""CREATE TABLE IF NOT EXISTS pdf_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL, filename TEXT NOT NULL,
        original_name TEXT NOT NULL, file_size INTEGER NOT NULL,
        page_count INTEGER DEFAULT 0, word_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'uploaded', uploaded_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id))""")

    c.execute("""CREATE TABLE IF NOT EXISTS topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pdf_id INTEGER NOT NULL, topic TEXT NOT NULL,
        frequency INTEGER DEFAULT 1, tfidf_score REAL DEFAULT 0.0,
        unit TEXT DEFAULT 'Unknown', extracted_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (pdf_id) REFERENCES pdf_files(id))""")

    c.execute("""CREATE TABLE IF NOT EXISTS predicted_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pdf_id INTEGER NOT NULL, question TEXT NOT NULL,
        probability REAL DEFAULT 0.0, importance TEXT DEFAULT 'Medium',
        unit TEXT DEFAULT 'Unknown', created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (pdf_id) REFERENCES pdf_files(id))""")

    c.execute("""CREATE TABLE IF NOT EXISTS quiz_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL, score INTEGER NOT NULL,
        total INTEGER NOT NULL, percentage REAL NOT NULL,
        subject TEXT DEFAULT 'General', time_taken INTEGER DEFAULT 0,
        completed_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id))""")

    c.execute("""CREATE TABLE IF NOT EXISTS classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_id INTEGER NOT NULL, name TEXT NOT NULL,
        subject TEXT DEFAULT 'General', section TEXT DEFAULT '',
        join_code TEXT NOT NULL UNIQUE, created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (teacher_id) REFERENCES users(id))""")

    c.execute("""CREATE TABLE IF NOT EXISTS class_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id INTEGER NOT NULL, student_id INTEGER NOT NULL,
        joined_at TEXT DEFAULT (datetime('now')),
        UNIQUE(class_id, student_id),
        FOREIGN KEY (class_id) REFERENCES classes(id),
        FOREIGN KEY (student_id) REFERENCES users(id))""")

    c.execute("""CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_id INTEGER NOT NULL, class_id INTEGER,
        title TEXT NOT NULL, description TEXT DEFAULT '',
        type TEXT NOT NULL DEFAULT 'text', content TEXT DEFAULT '',
        due_date TEXT DEFAULT '', subject TEXT DEFAULT 'General',
        total_marks INTEGER DEFAULT 100, filename TEXT DEFAULT '',
        original_name TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now')),
        is_active INTEGER DEFAULT 1,
        FOREIGN KEY (teacher_id) REFERENCES users(id),
        FOREIGN KEY (class_id) REFERENCES classes(id))""")

    c.execute("""CREATE TABLE IF NOT EXISTS assignment_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assignment_id INTEGER NOT NULL, student_id INTEGER NOT NULL,
        answer_text TEXT DEFAULT '', filename TEXT DEFAULT '',
        original_name TEXT DEFAULT '', mcq_answers TEXT DEFAULT '[]',
        marks_obtained INTEGER DEFAULT 0, feedback TEXT DEFAULT '',
        status TEXT DEFAULT 'submitted', submitted_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (assignment_id) REFERENCES assignments(id),
        FOREIGN KEY (student_id) REFERENCES users(id))""")

    c.execute("""CREATE TABLE IF NOT EXISTS attendance_schedule (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL UNIQUE,
        schedule_data TEXT NOT NULL DEFAULT '{}',
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (student_id) REFERENCES users(id))""")

    c.execute("""CREATE TABLE IF NOT EXISTS attendance_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL, subject TEXT NOT NULL,
        date TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'present',
        class_type TEXT NOT NULL DEFAULT 'lecture',
        marked_at TEXT DEFAULT (datetime('now')),
        UNIQUE(student_id, subject, date, class_type),
        FOREIGN KEY (student_id) REFERENCES users(id))""")

    c.execute("""CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL, title TEXT NOT NULL,
        message TEXT DEFAULT '', type TEXT DEFAULT 'info',
        is_read INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id))""")

    c.execute("""CREATE TABLE IF NOT EXISTS doubts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL, teacher_id INTEGER,
        question TEXT NOT NULL, answer TEXT DEFAULT '',
        subject TEXT DEFAULT 'General', status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT (datetime('now')),
        answered_at TEXT DEFAULT '',
        FOREIGN KEY (student_id) REFERENCES users(id),
        FOREIGN KEY (teacher_id) REFERENCES users(id))""")

    c.execute("""CREATE TABLE IF NOT EXISTS exam_countdowns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL, exam_name TEXT NOT NULL,
        exam_date TEXT NOT NULL, subject TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id))""")

    c.execute("""CREATE TABLE IF NOT EXISTS shared_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_id INTEGER NOT NULL, class_id INTEGER,
        title TEXT NOT NULL, filename TEXT DEFAULT '',
        original_name TEXT DEFAULT '', description TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (teacher_id) REFERENCES users(id),
        FOREIGN KEY (class_id) REFERENCES classes(id))""")

    conn.commit()
    conn.close()
    print("[DB] All tables initialized.")
