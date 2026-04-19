import { useState, useEffect } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
  .tt-wrap { padding:24px; font-family:'Sora',sans-serif; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .tt-fade { animation:fadeIn 0.3s ease; }

  /* HEADER */
  .tt-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
  .tt-title { font-size:20px; font-weight:800; }
  .tt-sub { font-size:13px; color:var(--text3); margin-top:3px; }

  /* DAY TABS */
  .tt-days { display:flex; gap:8px; margin-bottom:24px; overflow-x:auto; padding-bottom:4px; }
  .tt-days::-webkit-scrollbar { height:3px; }
  .tt-days::-webkit-scrollbar-thumb { background:var(--purple); border-radius:2px; }
  .tt-day { padding:10px 18px; border-radius:12px; border:1.5px solid var(--border2); font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s; color:var(--text2); background:var(--card2); white-space:nowrap; text-align:center; min-width:80px; }
  .tt-day:hover { border-color:var(--purple); color:var(--purple); }
  .tt-day.active { border-color:var(--purple); background:rgba(124,92,252,0.1); color:var(--purple); }
  .tt-day.today { border-color:var(--teal) !important; }
  .tt-day-name { font-size:13px; font-weight:700; }
  .tt-day-date { font-size:10px; color:var(--text3); margin-top:2px; }
  .tt-day.active .tt-day-date { color:var(--purple); }

  /* LAYOUT */
  .tt-layout { display:grid; grid-template-columns:1fr 340px; gap:20px; }

  /* TIMELINE */
  .tt-timeline { }
  .tt-timeline-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .tt-timeline-title { font-size:15px; font-weight:700; }
  .tt-empty { text-align:center; padding:48px 20px; color:var(--text3); background:var(--card); border:1px solid var(--border); border-radius:14px; }
  .tt-empty-icon { font-size:48px; margin-bottom:12px; }

  /* TASK CARD */
  .tt-task { display:flex; gap:12px; margin-bottom:10px; animation:fadeIn 0.25s ease; }
  .tt-task-time-col { width:60px; flex-shrink:0; text-align:right; }
  .tt-task-time { font-size:12px; font-weight:700; color:var(--text3); font-family:'JetBrains Mono',monospace; margin-top:14px; }
  .tt-task-line { display:flex; flex-direction:column; align-items:center; margin:0 8px; }
  .tt-task-dot { width:12px; height:12px; border-radius:50%; flex-shrink:0; margin-top:15px; }
  .tt-task-connector { flex:1; width:2px; background:var(--border); margin-top:4px; min-height:20px; }
  .tt-task-card { flex:1; background:var(--card); border:1px solid var(--border); border-radius:14px; padding:14px 16px; cursor:pointer; transition:all 0.2s; position:relative; overflow:hidden; }
  .tt-task-card::before { content:''; position:absolute; left:0; top:0; bottom:0; width:4px; border-radius:4px 0 0 4px; }
  .tt-task-card:hover { border-color:var(--purple); transform:translateX(2px); }
  .tt-task-card.done { opacity:0.6; }
  .tt-task-card.done .tt-task-name { text-decoration:line-through; color:var(--text3); }
  .tt-task-name { font-size:14px; font-weight:600; margin-bottom:5px; display:flex; align-items:center; gap:8px; }
  .tt-task-meta { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
  .tt-task-duration { font-size:11px; color:var(--text3); display:flex; align-items:center; gap:4px; }
  .tt-task-subject { font-size:11px; padding:2px 8px; border-radius:20px; font-weight:600; }
  .tt-task-actions { position:absolute; right:12px; top:50%; transform:translateY(-50%); display:flex; gap:6px; opacity:0; transition:opacity 0.2s; }
  .tt-task-card:hover .tt-task-actions { opacity:1; }
  .tt-action-btn { width:28px; height:28px; border-radius:8px; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:13px; transition:all 0.2s; }

  /* ADD FORM */
  .tt-form-card { background:var(--card); border:1px solid var(--border); border-radius:16px; padding:20px; position:sticky; top:80px; }
  .tt-form-title { font-size:15px; font-weight:700; margin-bottom:16px; }
  .form-group { margin-bottom:14px; }
  .form-label { font-size:12px; font-weight:600; color:var(--text2); margin-bottom:5px; display:block; }
  .form-input { width:100%; background:var(--card2); border:1.5px solid var(--border2); border-radius:10px; padding:10px 13px; color:var(--text); font-size:13.5px; font-family:'Sora',sans-serif; outline:none; transition:border 0.2s; }
  .form-input:focus { border-color:var(--purple); }
  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .color-row { display:flex; gap:8px; flex-wrap:wrap; }
  .color-dot { width:28px; height:28px; border-radius:50%; cursor:pointer; transition:all 0.2s; border:3px solid transparent; }
  .color-dot.selected { border-color:var(--text); transform:scale(1.15); }
  .btn { display:inline-flex; align-items:center; gap:8px; padding:10px 18px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; border:none; font-family:'Sora',sans-serif; transition:all 0.2s; }
  .btn-primary { background:linear-gradient(135deg,var(--purple),var(--purple2)); color:#fff; width:100%; justify-content:center; }
  .btn-primary:hover { transform:translateY(-1px); box-shadow:0 4px 14px rgba(124,92,252,0.3); }
  .btn-outline { background:transparent; border:1.5px solid var(--border2); color:var(--text2); }
  .btn-outline:hover { border-color:var(--purple); color:var(--purple); }

  /* STATS ROW */
  .tt-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:20px; }
  .tt-stat { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:14px; text-align:center; }
  .tt-stat-val { font-size:22px; font-weight:800; margin-bottom:2px; }
  .tt-stat-label { font-size:11px; color:var(--text3); }

  /* PRIORITY BADGE */
  .prio-badge { font-size:10px; padding:2px 8px; border-radius:20px; font-weight:700; }

  @media(max-width:900px) { .tt-layout{grid-template-columns:1fr;} .tt-form-card{position:static;} }
  @media(max-width:600px) { .tt-wrap{padding:16px;} .tt-stats{grid-template-columns:1fr 1fr;} }
`;

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const COLORS = ["#7c5cfc", "#00d4aa", "#ff6b35", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#22c55e"];
const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Geography", "Computer Science", "Economics", "General"];
const PRIORITIES = ["High", "Medium", "Low"];

const STORAGE_KEY = (userId) => `exam_oracle_timetable_${userId}`;

function getTodayIndex() {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

function getWeekDates() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  return DAYS.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function Timetable({ user }) {
  const [activeDay, setActiveDay] = useState(getTodayIndex());
  const [tasks, setTasks] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    subject: "General",
    startTime: "09:00",
    duration: "60",
    priority: "Medium",
    color: "#7c5cfc",
    notes: "",
  });

  const weekDates = getWeekDates();
  const todayIdx = getTodayIndex();

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY(user.id));
      if (saved) setTasks(JSON.parse(saved));
    } catch { /* ignore */ }
  }, [user.id]);

  // Save to localStorage
  const saveTasks = (updated) => {
    setTasks(updated);
    try {
      localStorage.setItem(STORAGE_KEY(user.id), JSON.stringify(updated));
    } catch { /* ignore */ }
  };

  const dayKey = DAYS[activeDay];
  const dayTasks = (tasks[dayKey] || []).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const completedToday = dayTasks.filter(t => t.done).length;
  const totalToday = dayTasks.length;

  // All tasks stats
  const allTasks = Object.values(tasks).flat();
  const totalAll = allTasks.length;
  const completedAll = allTasks.filter(t => t.done).length;
  const todayStudyMin = dayTasks.reduce((sum, t) => sum + (parseInt(t.duration) || 0), 0);

  const resetForm = () => {
    setForm({ name: "", subject: "General", startTime: "09:00", duration: "60", priority: "Medium", color: "#7c5cfc", notes: "" });
    setEditId(null);
    setShowForm(false);
  };

  const handleAdd = () => {
    if (!form.name.trim()) return;

    const newTask = {
      id: editId || Date.now().toString(),
      ...form,
      done: false,
      createdAt: new Date().toISOString(),
    };

    const updated = { ...tasks };
    if (!updated[dayKey]) updated[dayKey] = [];

    if (editId) {
      updated[dayKey] = updated[dayKey].map(t => t.id === editId ? { ...t, ...newTask } : t);
    } else {
      updated[dayKey] = [...updated[dayKey], newTask];
    }

    saveTasks(updated);
    resetForm();
  };

  const toggleDone = (taskId) => {
    const updated = { ...tasks };
    updated[dayKey] = updated[dayKey].map(t =>
      t.id === taskId ? { ...t, done: !t.done } : t
    );
    saveTasks(updated);
  };

  const deleteTask = (taskId) => {
    const updated = { ...tasks };
    updated[dayKey] = updated[dayKey].filter(t => t.id !== taskId);
    saveTasks(updated);
  };

  const editTask = (task) => {
    setForm({ name: task.name, subject: task.subject, startTime: task.startTime, duration: task.duration, priority: task.priority, color: task.color, notes: task.notes || "" });
    setEditId(task.id);
    setShowForm(true);
  };

  const priorityColor = { High: "var(--danger)", Medium: "var(--gold)", Low: "var(--teal)" };

  const formatDuration = (min) => {
    const m = parseInt(min) || 0;
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60), rem = m % 60;
    return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="tt-wrap tt-fade">
        {/* Header */}
        <div className="tt-header">
          <div>
            <div className="tt-title">📅 Study Timetable</div>
            <div className="tt-sub">Plan your study sessions — stay organized</div>
          </div>
          <button className="btn btn-primary" style={{ width: "auto" }} onClick={() => { resetForm(); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            + Add Task
          </button>
        </div>

        {/* Stats */}
        <div className="tt-stats">
          {[
            ["Today's Tasks", `${completedToday}/${totalToday}`, "var(--purple)"],
            ["Study Time", `${formatDuration(todayStudyMin)}`, "var(--teal)"],
            ["Total Tasks", totalAll, "var(--orange)"],
            ["Completed", completedAll, "var(--gold)"],
          ].map(([l, v, c]) => (
            <div key={l} className="tt-stat">
              <div className="tt-stat-val" style={{ color: c }}>{v}</div>
              <div className="tt-stat-label">{l}</div>
            </div>
          ))}
        </div>

        {/* Day Tabs */}
        <div className="tt-days">
          {DAYS.map((day, i) => {
            const date = weekDates[i];
            const isToday = i === todayIdx;
            const taskCount = (tasks[day] || []).length;
            return (
              <div key={day}
                className={`tt-day ${activeDay === i ? "active" : ""} ${isToday ? "today" : ""}`}
                onClick={() => setActiveDay(i)}>
                <div className="tt-day-name">{day.slice(0, 3)}</div>
                <div className="tt-day-date">
                  {date.getDate()}/{date.getMonth() + 1}
                  {isToday && " 📍"}
                </div>
                {taskCount > 0 && (
                  <div style={{ fontSize: 10, color: activeDay === i ? "var(--purple)" : "var(--text3)", marginTop: 2, fontWeight: 700 }}>
                    {taskCount} task{taskCount !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="tt-layout">
          {/* Timeline */}
          <div className="tt-timeline">
            <div className="tt-timeline-header">
              <div className="tt-timeline-title">
                {DAYS[activeDay]}
                {activeDay === todayIdx && <span style={{ fontSize: 12, color: "var(--teal)", marginLeft: 8 }}>Today</span>}
              </div>
              {totalToday > 0 && (
                <div style={{ fontSize: 12, color: "var(--text3)" }}>
                  {completedToday}/{totalToday} done
                  {totalToday > 0 && (
                    <span style={{ marginLeft: 8, color: "var(--teal)", fontWeight: 700 }}>
                      {Math.round((completedToday / totalToday) * 100)}%
                    </span>
                  )}
                </div>
              )}
            </div>

            {dayTasks.length === 0 ? (
              <div className="tt-empty">
                <div className="tt-empty-icon">📝</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No tasks for {DAYS[activeDay]}</div>
                <div style={{ fontSize: 13, marginBottom: 20 }}>Add your first study task!</div>
                <button className="btn btn-outline" onClick={() => { resetForm(); setShowForm(true); }}>
                  + Add Task
                </button>
              </div>
            ) : (
              dayTasks.map((task, i) => (
                <div key={task.id} className="tt-task">
                  {/* Time column */}
                  <div className="tt-task-time-col">
                    <div className="tt-task-time">{task.startTime}</div>
                  </div>

                  {/* Line connector */}
                  <div className="tt-task-line">
                    <div className="tt-task-dot" style={{ background: task.done ? "var(--teal)" : task.color }} />
                    {i < dayTasks.length - 1 && <div className="tt-task-connector" />}
                  </div>

                  {/* Card */}
                  <div className={`tt-task-card ${task.done ? "done" : ""}`}
                    style={{ "--tc": task.color }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: task.color, borderRadius: "4px 0 0 4px" }} />

                    {/* // Naya: */}
                    <div className="tt-task-name">{task.name}</div>

                    <div className="tt-task-meta">
                      <span className="tt-task-subject" style={{ background: `${task.color}18`, color: task.color, border: `1px solid ${task.color}33` }}>
                        {task.subject}
                      </span>
                      <span className="tt-task-duration">
                        ⏱ {formatDuration(task.duration)}
                      </span>
                      <span className="prio-badge" style={{ background: `${priorityColor[task.priority]}18`, color: priorityColor[task.priority], border: `1px solid ${priorityColor[task.priority]}33` }}>
                        {task.priority}
                      </span>
                    </div>

                    {task.notes && (
                      <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 6, lineHeight: 1.5 }}>
                        📝 {task.notes}
                      </div>
                    )}

                    {/* Action buttons */}
                    {/* // Purana tt-task-actions div delete karo aur naya daalo: */}
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <button onClick={() => toggleDone(task.id)} style={{
                        padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                        background: task.done ? "rgba(0,212,170,0.15)" : "rgba(124,92,252,0.12)",
                        color: task.done ? "var(--teal)" : "var(--purple)",
                        fontSize: 12, fontWeight: 700, fontFamily: "'Sora',sans-serif"
                      }}>
                        {task.done ? "✅ Completed" : "☐ Mark Done"}
                      </button>
                      <button onClick={() => editTask(task)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border2)", background: "var(--card2)", cursor: "pointer", fontSize: 12, color: "var(--text2)" }}>✏️</button>
                      <button onClick={() => deleteTask(task.id)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)", cursor: "pointer", fontSize: 12, color: "var(--danger)" }}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add/Edit Form */}
          <div className="tt-form-card">
            <div className="tt-form-title">{editId ? "✏️ Edit Task" : "➕ Add Study Task"}</div>

            <div className="form-group">
              <label className="form-label">Task Name *</label>
              <input className="form-input" placeholder="e.g. Study Chapter 3 — NLP"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                onKeyDown={e => e.key === "Enter" && handleAdd()} />
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <select className="form-input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input className="form-input" type="time" value={form.startTime}
                  onChange={e => setForm({ ...form, startTime: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Duration (min)</label>
                <select className="form-input" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}>
                  {["30", "45", "60", "90", "120", "150", "180"].map(d => (
                    <option key={d} value={d}>{formatDuration(d)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <div style={{ display: "flex", gap: 8 }}>
                {PRIORITIES.map(p => (
                  <div key={p}
                    onClick={() => setForm({ ...form, priority: p })}
                    style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: `1.5px solid ${form.priority === p ? priorityColor[p] : "var(--border2)"}`, background: form.priority === p ? `${priorityColor[p]}15` : "var(--card2)", color: form.priority === p ? priorityColor[p] : "var(--text2)", fontSize: 12, fontWeight: 700, cursor: "pointer", textAlign: "center" }}>
                    {p}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Color</label>
              <div className="color-row">
                {COLORS.map(c => (
                  <div key={c} className={`color-dot ${form.color === c ? "selected" : ""}`}
                    style={{ background: c }} onClick={() => setForm({ ...form, color: c })} />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <input className="form-input" placeholder="Any specific notes..."
                value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>

            <button className="btn btn-primary" onClick={handleAdd} disabled={!form.name.trim()}>
              {editId ? "💾 Save Changes" : "➕ Add Task"}
            </button>

            {editId && (
              <button className="btn btn-outline" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
