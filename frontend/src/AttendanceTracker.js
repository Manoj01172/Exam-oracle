import { useState, useEffect } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
  .at-wrap { padding:24px; font-family:'Sora',sans-serif; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .at-fade { animation:fadeIn 0.3s ease; }

  .at-tabs { display:flex; gap:8px; margin-bottom:24px; }
  .at-tab { padding:9px 20px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; border:1.5px solid var(--border2); color:var(--text2); background:var(--card2); transition:all 0.2s; }
  .at-tab.active { border-color:var(--purple); background:rgba(124,92,252,0.1); color:var(--purple); }

  /* SUMMARY CARDS */
  .at-summary-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:14px; margin-bottom:24px; }
  .at-subj-card { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:18px; position:relative; overflow:hidden; cursor:pointer; transition:all 0.2s; }
  .at-subj-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.2); }
  .at-subj-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; }
  .at-subj-name { font-size:14px; font-weight:700; margin-bottom:8px; }
  .at-subj-pct { font-size:32px; font-weight:800; line-height:1; margin-bottom:4px; }
  .at-subj-detail { font-size:11px; color:var(--text3); }
  .at-subj-bar { height:4px; background:var(--card2); border-radius:2px; margin-top:10px; overflow:hidden; }
  .at-subj-bar-fill { height:100%; border-radius:2px; transition:width 0.5s; }
  .at-can-miss { font-size:11px; margin-top:6px; font-weight:600; }

  /* OVERALL */
  .at-overall { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:20px; margin-bottom:20px; display:flex; align-items:center; gap:20px; flex-wrap:wrap; }
  .at-overall-circle { position:relative; width:90px; height:90px; flex-shrink:0; }
  .at-overall-circle svg { transform:rotate(-90deg); }
  .at-overall-pct { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:20px; font-weight:800; }

  /* MARK ATTENDANCE */
  .at-mark-card { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:20px; margin-bottom:16px; }
  .at-mark-title { font-size:15px; font-weight:700; margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; }
  .at-subject-row { display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid var(--border); flex-wrap:wrap; }
  .at-subject-row:last-child { border-bottom:none; }
  .at-subj-label { font-size:13px; font-weight:600; flex:1; min-width:140px; }
  .at-class-group { display:flex; gap:6px; align-items:center; }
  .at-class-label { font-size:11px; color:var(--text3); min-width:50px; }
  .at-status-btn { padding:6px 14px; border-radius:8px; border:1.5px solid var(--border2); font-size:12px; font-weight:600; cursor:pointer; transition:all 0.2s; color:var(--text2); background:var(--card2); }
  .at-status-btn.present { border-color:var(--teal); background:rgba(0,212,170,0.1); color:var(--teal); }
  .at-status-btn.absent  { border-color:var(--danger); background:rgba(239,68,68,0.1); color:var(--danger); }

  /* SETUP */
  .at-setup-card { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:20px; }
  .at-setup-row { display:flex; gap:10px; align-items:flex-end; margin-bottom:12px; flex-wrap:wrap; }
  .form-group { flex:1; min-width:120px; }
  .form-label { font-size:12px; font-weight:600; color:var(--text2); margin-bottom:5px; display:block; }
  .form-input { width:100%; background:var(--card2); border:1.5px solid var(--border2); border-radius:10px; padding:9px 13px; color:var(--text); font-size:13px; font-family:'Sora',sans-serif; outline:none; transition:border 0.2s; }
  .form-input:focus { border-color:var(--purple); }
  .btn { display:inline-flex; align-items:center; gap:6px; padding:9px 18px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; border:none; font-family:'Sora',sans-serif; transition:all 0.2s; }
  .btn-primary { background:linear-gradient(135deg,var(--purple),var(--purple2)); color:#fff; }
  .btn-primary:hover { transform:translateY(-1px); box-shadow:0 4px 14px rgba(124,92,252,0.3); }
  .btn-danger  { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); color:var(--danger); }
  .btn-outline { background:transparent; border:1.5px solid var(--border2); color:var(--text2); }
  .btn-outline:hover { border-color:var(--purple); color:var(--purple); }
  .badge { display:inline-flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }

  .spin { animation:spin 1s linear infinite; display:inline-block; width:20px; height:20px; border:2px solid rgba(124,92,252,0.2); border-top-color:var(--purple); border-radius:50%; }
  @keyframes spin { to{transform:rotate(360deg)} }
  .empty-box { text-align:center; padding:40px; color:var(--text3); }
  .success-box { padding:12px 16px; border-radius:10px; background:rgba(0,212,170,0.08); border:1px solid rgba(0,212,170,0.2); color:var(--teal); font-size:13px; margin-bottom:14px; }
  @media(max-width:600px) { .at-wrap{padding:16px;} .at-summary-grid{grid-template-columns:1fr 1fr;} }
`;


const BASE = process.env.REACT_APP_BASE_URL;

export default function AttendanceTracker({ user }) {
  const [tab,          setTab]          = useState("summary");
  const [schedule,     setSchedule]     = useState({ subjects:[] });
  const [summary,      setSummary]      = useState([]);
  const [overallPct,   setOverallPct]   = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [msg,          setMsg]          = useState("");
  const [markDate,     setMarkDate]     = useState(new Date().toISOString().split("T")[0]);
  const [markData,     setMarkData]     = useState({});

  // Setup form
  const [newSubject, setNewSubject] = useState({ name:"", total_lectures:40, total_labs:0, required_pct:75 });

  useEffect(() => { loadData(); }, [user.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [schedRes, sumRes] = await Promise.all([
        fetch(`${BASE}/attendance/schedule/${user.id}`).then(r=>r.json()),
        fetch(`${BASE}/attendance/summary/${user.id}`).then(r=>r.json()),
      ]);
      setSchedule(schedRes.schedule_data || { subjects:[] });
      setSummary(sumRes.summary || []);
      setOverallPct(sumRes.overall_pct || 0);

      // Init mark data
      const init = {};
      (schedRes.schedule_data?.subjects||[]).forEach(s => {
        init[s.name] = { lecture:"present", ...(s.total_labs>0?{lab:"present"}:{}) };
      });
      setMarkData(init);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const saveSchedule = async () => {
    setSaving(true);
    try {
      await fetch(`${BASE}/attendance/schedule/${user.id}`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ schedule_data: schedule }),
      });
      setMsg("Schedule saved successfully!");
      await loadData();
    } catch { setMsg("Error saving schedule."); }
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  };

  const addSubject = () => {
    if (!newSubject.name.trim()) return;
    setSchedule(s => ({ subjects:[...s.subjects, { ...newSubject, name:newSubject.name.trim() }] }));
    setNewSubject({ name:"", total_lectures:40, total_labs:0, required_pct:75 });
  };

  const removeSubject = (name) => {
    setSchedule(s => ({ subjects: s.subjects.filter(x=>x.name!==name) }));
  };

  const toggleStatus = (subject, classType) => {
    setMarkData(d => ({
      ...d,
      [subject]: { ...d[subject], [classType]: d[subject]?.[classType]==="present"?"absent":"present" }
    }));
  };

  const submitAttendance = async () => {
    const records = [];
    Object.entries(markData).forEach(([subject, types]) => {
      Object.entries(types).forEach(([classType, status]) => {
        records.push({ subject, date:markDate, status, class_type:classType });
      });
    });

    setSaving(true);
    try {
      await fetch(`${BASE}/attendance/mark`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ student_id:user.id, records }),
      });
      setMsg(`Attendance saved for ${markDate}!`);
      await loadData();
    } catch { setMsg("Error saving attendance."); }
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  };

  const statusColor = (s) => s==="safe"?"var(--teal)":s==="warning"?"var(--gold)":"var(--danger)";
  const pctColor    = (p) => p>=75?"var(--teal)":p>=65?"var(--gold)":"var(--danger)";

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="at-wrap" style={{textAlign:"center",paddingTop:60}}>
        <span className="spin" style={{width:32,height:32,border:"3px solid rgba(124,92,252,0.2)",borderTopColor:"var(--purple)"}}/>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="at-wrap at-fade">
        <div style={{marginBottom:20}}>
          <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>📋 Attendance Tracker</div>
          <div style={{fontSize:13,color:"var(--text3)"}}>Track your class attendance — never fall below 75%</div>
        </div>

        <div className="at-tabs">
          {[["summary","📊 Summary"],["mark","✅ Mark Today"],["setup","⚙️ Setup"]].map(([id,l])=>(
            <div key={id} className={`at-tab ${tab===id?"active":""}`} onClick={()=>setTab(id)}>{l}</div>
          ))}
        </div>

        {msg && <div className="success-box">✅ {msg}</div>}

        {/* ── SUMMARY TAB ── */}
        {tab==="summary" && (
          <>
            {/* Overall */}
            <div className="at-overall">
              <div className="at-overall-circle">
                {(() => {
                  const r=38, c=2*Math.PI*r, dash=(overallPct/100)*c;
                  return (
                    <svg width={90} height={90} viewBox="0 0 90 90">
                      <circle cx={45} cy={45} r={r} fill="none" stroke="var(--card2)" strokeWidth={8}/>
                      <circle cx={45} cy={45} r={r} fill="none" stroke={pctColor(overallPct)} strokeWidth={8}
                        strokeDasharray={`${dash} ${c}`} strokeLinecap="round" style={{transition:"stroke-dasharray 0.6s"}}/>
                    </svg>
                  );
                })()}
                <div className="at-overall-pct" style={{color:pctColor(overallPct)}}>{overallPct}%</div>
              </div>
              <div>
                <div style={{fontSize:18,fontWeight:800,marginBottom:4}}>Overall Attendance</div>
                <div style={{fontSize:13,color:"var(--text3)"}}>
                  {overallPct>=75?"You are safe! Keep it up 🎉":"⚠️ Warning — attendance is low!"}
                </div>
                <div style={{fontSize:12,color:"var(--text3)",marginTop:4}}>
                  Minimum required: 75% per subject
                </div>
              </div>
            </div>

            {summary.length===0 ? (
              <div className="empty-box">
                <div style={{fontSize:40,marginBottom:8}}>📋</div>
                <div style={{fontSize:15,fontWeight:700,marginBottom:8}}>No attendance data yet</div>
                <div>Set up your schedule first, then start marking attendance daily.</div>
                <button className="btn btn-primary" style={{marginTop:16}} onClick={()=>setTab("setup")}>
                  ⚙️ Setup Schedule
                </button>
              </div>
            ) : (
              <div className="at-summary-grid">
                {summary.map((s,i) => (
                  <div key={i} className="at-subj-card" style={{"--sc":statusColor(s.status)}}>
                    <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:statusColor(s.status)}}/>
                    <div className="at-subj-name">{s.subject}</div>
                    <div className="at-subj-pct" style={{color:statusColor(s.status)}}>{s.percentage}%</div>
                    <div className="at-subj-detail">
                      {s.combined_present}/{s.combined_total} classes attended
                    </div>
                    <div className="at-subj-detail" style={{marginTop:2}}>
                      Lectures: {s.lectures.present}/{s.lectures.total} &nbsp;|&nbsp;
                      Labs: {s.labs.present}/{s.labs.total}
                    </div>
                    <div className="at-subj-bar">
                      <div className="at-subj-bar-fill" style={{width:`${s.percentage}%`,background:statusColor(s.status)}}/>
                    </div>
                    <div className="at-can-miss" style={{color:statusColor(s.status)}}>
                      {s.status==="danger"
                        ? "⚠️ Cannot miss any more!"
                        : `Can still miss: ${s.can_miss} class${s.can_miss!==1?"es":""}`}
                    </div>
                    <span className="badge" style={{
                      marginTop:8,
                      background:`${statusColor(s.status)}18`,
                      color:statusColor(s.status),
                      border:`1px solid ${statusColor(s.status)}33`,
                    }}>
                      {s.status==="safe"?"✅ Safe":s.status==="warning"?"⚠️ Warning":"🚨 Danger"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── MARK ATTENDANCE TAB ── */}
        {tab==="mark" && (
          <div className="at-mark-card">
            <div className="at-mark-title">
              Mark Attendance
              <input type="date" value={markDate} onChange={e=>setMarkDate(e.target.value)}
                style={{padding:"6px 12px",background:"var(--card2)",border:"1px solid var(--border)",borderRadius:8,color:"var(--text)",fontSize:13,fontFamily:"'Sora',sans-serif",outline:"none"}}/>
            </div>

            {schedule.subjects.length===0 ? (
              <div className="empty-box">
                <div>Set up your schedule first!</div>
                <button className="btn btn-primary" style={{marginTop:12}} onClick={()=>setTab("setup")}>⚙️ Setup</button>
              </div>
            ) : (
              <>
                {schedule.subjects.map((s,i) => (
                  <div key={i} className="at-subject-row">
                    <div className="at-subj-label">{s.name}</div>
                    <div className="at-class-group">
                      <span className="at-class-label">Lecture:</span>
                      <button
                        className={`at-status-btn ${markData[s.name]?.lecture||"present"}`}
                        onClick={()=>toggleStatus(s.name,"lecture")}>
                        {markData[s.name]?.lecture==="absent"?"❌ Absent":"✅ Present"}
                      </button>
                    </div>
                    {s.total_labs>0 && (
                      <div className="at-class-group">
                        <span className="at-class-label">Lab:</span>
                        <button
                          className={`at-status-btn ${markData[s.name]?.lab||"present"}`}
                          onClick={()=>toggleStatus(s.name,"lab")}>
                          {markData[s.name]?.lab==="absent"?"❌ Absent":"✅ Present"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <button className="btn btn-primary" style={{marginTop:16}} onClick={submitAttendance} disabled={saving}>
                  {saving?<span className="spin"/>:"💾 Save Attendance"}
                </button>
              </>
            )}
          </div>
        )}

        {/* ── SETUP TAB ── */}
        {tab==="setup" && (
          <div className="at-setup-card">
            <div style={{fontSize:15,fontWeight:700,marginBottom:16}}>⚙️ Subject Schedule Setup</div>
            <div style={{fontSize:13,color:"var(--text3)",marginBottom:20}}>
              Add all your subjects with total class counts. Do this once at the start of semester.
            </div>

            {/* Add subject form */}
            <div style={{background:"var(--card2)",border:"1px solid var(--border)",borderRadius:12,padding:16,marginBottom:20}}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>Add Subject</div>
              <div className="at-setup-row">
                <div className="form-group" style={{flex:2}}>
                  <label className="form-label">Subject Name</label>
                  <input className="form-input" placeholder="e.g. Mathematics"
                    value={newSubject.name} onChange={e=>setNewSubject({...newSubject,name:e.target.value})}
                    onKeyDown={e=>e.key==="Enter"&&addSubject()}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Total Lectures</label>
                  <input className="form-input" type="number" min="0"
                    value={newSubject.total_lectures} onChange={e=>setNewSubject({...newSubject,total_lectures:+e.target.value})}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Total Labs</label>
                  <input className="form-input" type="number" min="0"
                    value={newSubject.total_labs} onChange={e=>setNewSubject({...newSubject,total_labs:+e.target.value})}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Required %</label>
                  <input className="form-input" type="number" min="0" max="100"
                    value={newSubject.required_pct} onChange={e=>setNewSubject({...newSubject,required_pct:+e.target.value})}/>
                </div>
                <button className="btn btn-primary" onClick={addSubject} style={{marginBottom:1}}>+ Add</button>
              </div>
            </div>

            {/* Subject list */}
            {schedule.subjects.length===0 ? (
              <div className="empty-box">No subjects added yet.</div>
            ) : (
              <div style={{marginBottom:16}}>
                {schedule.subjects.map((s,i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"var(--card2)",border:"1px solid var(--border)",borderRadius:10,marginBottom:8}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:700}}>{s.name}</div>
                      <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>
                        {s.total_lectures} lectures · {s.total_labs} labs · {s.required_pct}% required
                      </div>
                    </div>
                    <button className="btn btn-danger" style={{padding:"5px 10px",fontSize:12}} onClick={()=>removeSubject(s.name)}>🗑️</button>
                  </div>
                ))}
              </div>
            )}

            {schedule.subjects.length>0 && (
              <button className="btn btn-primary" onClick={saveSchedule} disabled={saving}>
                {saving?<span className="spin"/>:"💾 Save Schedule"}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
