from flask import Blueprint, request, jsonify
import json
from database.db import get_connection

attendance_bp = Blueprint("attendance", __name__)


# ── STUDENT: Save schedule setup ──────────────────────────────────────────────
@attendance_bp.route("/schedule/<int:student_id>", methods=["POST"])
def save_schedule(student_id):
    """
    Student sets up their subject schedule once.
    schedule_data = {
      "subjects": [
        { "name":"Mathematics", "total_lectures":40, "total_labs":10, "required_pct":75 },
        ...
      ]
    }
    """
    data          = request.get_json()
    schedule_data = data.get("schedule_data", {})

    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM attendance_schedule WHERE student_id=?", (student_id,)
        ).fetchone()

        if existing:
            conn.execute(
                "UPDATE attendance_schedule SET schedule_data=?, updated_at=datetime('now') WHERE student_id=?",
                (json.dumps(schedule_data), student_id)
            )
        else:
            conn.execute(
                "INSERT INTO attendance_schedule (student_id, schedule_data) VALUES (?,?)",
                (student_id, json.dumps(schedule_data))
            )
        conn.commit()
        return jsonify({"message": "Schedule saved."}), 200
    finally:
        conn.close()


# ── STUDENT: Get schedule ─────────────────────────────────────────────────────
@attendance_bp.route("/schedule/<int:student_id>", methods=["GET"])
def get_schedule(student_id):
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT schedule_data FROM attendance_schedule WHERE student_id=?", (student_id,)
        ).fetchone()

        if not row:
            return jsonify({"schedule_data": {"subjects": []}}), 200

        return jsonify({"schedule_data": json.loads(row["schedule_data"])}), 200
    finally:
        conn.close()


# ── STUDENT: Mark attendance for a day ────────────────────────────────────────
@attendance_bp.route("/mark", methods=["POST"])
def mark_attendance():
    """
    Mark attendance for multiple classes in a day.
    records = [
      { "subject":"Mathematics", "date":"2026-03-21", "status":"present", "class_type":"lecture" },
      { "subject":"Mathematics", "date":"2026-03-21", "status":"absent",  "class_type":"lab" },
      ...
    ]
    """
    data       = request.get_json()
    student_id = data.get("student_id")
    records    = data.get("records", [])

    if not student_id or not records:
        return jsonify({"error": "student_id and records required."}), 400

    conn = get_connection()
    try:
        for rec in records:
            conn.execute(
                """INSERT OR REPLACE INTO attendance_records
                   (student_id, subject, date, status, class_type)
                   VALUES (?,?,?,?,?)""",
                (student_id, rec["subject"], rec["date"], rec["status"], rec.get("class_type","lecture"))
            )
        conn.commit()
        return jsonify({"message": f"{len(records)} records saved."}), 200
    finally:
        conn.close()


# ── STUDENT: Get attendance summary ───────────────────────────────────────────
@attendance_bp.route("/summary/<int:student_id>", methods=["GET"])
def get_summary(student_id):
    """Return attendance percentage per subject."""
    conn = get_connection()
    try:
        # Get schedule
        sched_row = conn.execute(
            "SELECT schedule_data FROM attendance_schedule WHERE student_id=?", (student_id,)
        ).fetchone()

        if not sched_row:
            return jsonify({"summary": [], "overall_pct": 0}), 200

        schedule      = json.loads(sched_row["schedule_data"])
        subjects_conf = schedule.get("subjects", [])

        # Get all attendance records
        records = conn.execute(
            "SELECT subject, class_type, status FROM attendance_records WHERE student_id=?",
            (student_id,)
        ).fetchall()

        # Build counts
        counts = {}
        for rec in records:
            key = (rec["subject"], rec["class_type"])
            if key not in counts:
                counts[key] = {"present": 0, "absent": 0}
            counts[key][rec["status"]] = counts[key].get(rec["status"], 0) + 1

        summary = []
        total_present = 0
        total_classes  = 0

        for subj in subjects_conf:
            name       = subj["name"]
            req_pct    = subj.get("required_pct", 75)

            lec_present = counts.get((name,"lecture"), {}).get("present", 0)
            lec_absent  = counts.get((name,"lecture"), {}).get("absent",  0)
            lec_total   = lec_present + lec_absent

            lab_present = counts.get((name,"lab"), {}).get("present", 0)
            lab_absent  = counts.get((name,"lab"), {}).get("absent",  0)
            lab_total   = lab_present + lab_absent

            combined_present = lec_present + lab_present
            combined_total   = lec_total   + lab_total
            pct = round((combined_present / combined_total) * 100, 1) if combined_total > 0 else 0

            # How many classes can still be missed while staying above required_pct
            total_conf  = subj.get("total_lectures", 0) + subj.get("total_labs", 0)
            can_miss    = 0
            if total_conf > 0:
                remaining   = total_conf - combined_total
                min_present = int((req_pct / 100) * total_conf)
                can_miss    = max(0, combined_present + remaining - min_present)

            total_present += combined_present
            total_classes  += combined_total

            summary.append({
                "subject":        name,
                "lectures":       { "present":lec_present, "absent":lec_absent, "total":lec_total },
                "labs":           { "present":lab_present, "absent":lab_absent, "total":lab_total },
                "combined_present": combined_present,
                "combined_total":   combined_total,
                "percentage":       pct,
                "required_pct":     req_pct,
                "status":           "safe" if pct >= req_pct else ("warning" if pct >= req_pct-10 else "danger"),
                "can_miss":         can_miss,
            })

        overall = round((total_present / total_classes) * 100, 1) if total_classes > 0 else 0
        return jsonify({"summary": summary, "overall_pct": overall}), 200
    finally:
        conn.close()


# ── STUDENT: Get attendance by date ───────────────────────────────────────────
@attendance_bp.route("/records/<int:student_id>", methods=["GET"])
def get_records(student_id):
    date = request.args.get("date")
    conn = get_connection()
    try:
        if date:
            rows = conn.execute(
                "SELECT * FROM attendance_records WHERE student_id=? AND date=? ORDER BY subject",
                (student_id, date)
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM attendance_records WHERE student_id=? ORDER BY date DESC, subject",
                (student_id,)
            ).fetchall()
        return jsonify({"records": [dict(r) for r in rows]}), 200
    finally:
        conn.close()


# ── TEACHER: Get attendance of all students ───────────────────────────────────
@attendance_bp.route("/teacher/overview", methods=["GET"])
def teacher_overview():
    conn = get_connection()
    try:
        students = conn.execute(
            "SELECT id, name, email FROM users WHERE role='student'"
        ).fetchall()

        overview = []
        for student in students:
            records = conn.execute(
                "SELECT status FROM attendance_records WHERE student_id=?", (student["id"],)
            ).fetchall()
            total   = len(records)
            present = sum(1 for r in records if r["status"] == "present")
            pct     = round((present/total)*100, 1) if total > 0 else 0
            overview.append({
                "student_id":   student["id"],
                "student_name": student["name"],
                "student_email":student["email"],
                "total_classes": total,
                "present":       present,
                "absent":        total - present,
                "percentage":    pct,
            })

        return jsonify({"overview": overview}), 200
    finally:
        conn.close()
