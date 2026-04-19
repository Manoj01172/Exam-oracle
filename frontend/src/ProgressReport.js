import { useState, useEffect } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
  .pr-wrap { padding:24px; font-family:'Sora',sans-serif; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .pr-fade { animation:fadeIn 0.3s ease; }
  .pr-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
  .pr-card { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:20px; margin-bottom:16px; }
  .pr-card-title { font-size:14px; font-weight:700; margin-bottom:14px; }
  .pr-stat-row { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px; }
  .pr-stat { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:14px; text-align:center; }
  .pr-stat-val { font-size:24px; font-weight:800; }
  .pr-stat-label { font-size:11px; color:var(--text3); margin-top:2px; }
  .pr-subject-row { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
  .pr-subject-name { font-size:13px; font-weight:600; min-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .pr-bar { flex:1; height:8px; background:var(--card2); border-radius:4px; overflow:hidden; }
  .pr-bar-fill { height:100%; border-radius:4px; transition:width 0.5s; }
  .pr-val { font-size:12px; font-weight:700; min-width:36px; text-align:right; font-family:'JetBrains Mono',monospace; }
  .btn { display:inline-flex; align-items:center; gap:6px; padding:9px 18px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; border:none; font-family:'Sora',sans-serif; transition:all 0.2s; }
  .btn-primary { background:linear-gradient(135deg,var(--purple),var(--purple2)); color:#fff; }
  .btn-primary:hover { transform:translateY(-1px); }
  .btn-teal { background:linear-gradient(135deg,var(--teal),#00a888); color:#000; font-weight:700; }
  .btn-outline { background:transparent; border:1.5px solid var(--border2); color:var(--text2); }
  .btn-outline:hover { border-color:var(--purple); color:var(--purple); }
  .btn-gold { background:linear-gradient(135deg,var(--gold),#d97706); color:#000; font-weight:700; }
  .pr-student-sel { display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap; align-items:center; }
  .pr-student-chip { padding:7px 14px; border-radius:10px; border:1.5px solid var(--border2); font-size:13px; font-weight:500; cursor:pointer; transition:all 0.2s; color:var(--text2); background:var(--card2); }
  .pr-student-chip.active { border-color:var(--purple); background:rgba(124,92,252,0.1); color:var(--purple); }
  table { width:100%; border-collapse:collapse; }
  th { font-size:11px; font-weight:600; color:var(--text3); text-transform:uppercase; letter-spacing:0.8px; padding:8px 10px; text-align:left; border-bottom:1px solid var(--border); }
  td { padding:10px; border-bottom:1px solid var(--border); font-size:13px; vertical-align:middle; }
  tr:last-child td { border-bottom:none; }
  .badge { display:inline-flex; align-items:center; padding:3px 9px; border-radius:20px; font-size:11px; font-weight:700; }
  .av { border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; color:#fff; }
  .empty-box { text-align:center; padding:32px; color:var(--text3); font-size:13px; }
  .spin { animation:spin 1s linear infinite; display:inline-block; width:20px; height:20px; border:2px solid rgba(124,92,252,0.2); border-top-color:var(--purple); border-radius:50%; }
  @keyframes spin { to{transform:rotate(360deg)} }
  @media(max-width:768px) { .pr-stat-row{grid-template-columns:1fr 1fr;} .pr-wrap{padding:16px;} }
`;

const BASE = process.env.REACT_APP_BASE_URL;

function Av({ name="?", size=34 }) {
  const colors = [["#7c5cfc","#5b3fd4"],["#00d4aa","#009977"],["#ff6b35","#cc4400"],["#f59e0b","#d97706"]];
  const [c1,c2] = colors[(name.charCodeAt(0)||0)%colors.length];
  return <div className="av" style={{width:size,height:size,minWidth:size,background:`linear-gradient(135deg,${c1},${c2})`,fontSize:size*0.35,flexShrink:0}}>{name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}</div>;
}

function pctColor(p) { return p>=75?"var(--teal)":p>=60?"var(--gold)":"var(--danger)"; }

export default function ProgressReport({ user }) {
  const [students,    setStudents]    = useState([]);
  const [selectedId,  setSelectedId]  = useState(user.role==="student" ? user.id : null);
  const [quizStats,   setQuizStats]   = useState(null);
  const [attendance,  setAttendance]  = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading,     setLoading]     = useState(false);

  useEffect(() => {
    if (user.role === "teacher") {
      fetch(`${BASE}/auth/users`).then(r=>r.json()).then(d => {
        const s = (d.users||[]).filter(u=>u.role==="student");
        setStudents(s);
        if (s.length > 0) setSelectedId(s[0].id);
      }).catch(()=>{});
    } else {
      setSelectedId(user.id);
    }
  }, [user.id]);

  useEffect(() => {
    if (!selectedId) return;
    loadStudentData(selectedId);
  }, [selectedId]);

  const loadStudentData = async (sid) => {
    setLoading(true);
    try {
      const [qRes, aRes, subRes] = await Promise.all([
        fetch(`${BASE}/auth/users/${sid}/stats`).then(r=>r.json()),
        fetch(`${BASE}/attendance/summary/${sid}`).then(r=>r.json()),
        fetch(`${BASE}/assignments/student/all?student_id=${sid}`).then(r=>r.json()),
      ]);
      setQuizStats(qRes);
      setAttendance(aRes);
      setAssignments(subRes.assignments||[]);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const selectedStudent = user.role==="student" ? user : students.find(s=>s.id===selectedId);

  // Export attendance to CSV/Excel
  const exportAttendance = () => {
    if (!attendance?.summary?.length) return;
    const rows = [["Subject","Lectures Present","Lectures Total","Labs Present","Labs Total","Percentage","Status"]];
    attendance.summary.forEach(s => {
      rows.push([s.subject, s.lectures.present, s.lectures.total, s.labs.present, s.labs.total, `${s.percentage}%`, s.status]);
    });
    const csv = rows.map(r=>r.join(",")).join("\n");
    const blob = new Blob([csv], {type:"text/csv"});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${selectedStudent?.name||"student"}_attendance.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print/PDF report
  const printReport = () => window.print();

  // Export full report as CSV
  const exportFullReport = () => {
    if (!quizStats) return;
    const rows = [
      ["=== EXAM ORACLE STUDENT REPORT ==="],
      ["Student", selectedStudent?.name||""],
      ["Email",   selectedStudent?.email||""],
      ["Generated", new Date().toLocaleDateString("en-IN")],
      [],
      ["=== QUIZ PERFORMANCE ==="],
      ["Total Quizzes", quizStats.total_quizzes],
      ["Average Score", `${quizStats.average_score}%`],
      [],
      ["Quiz History"],
      ["Subject","Score","Percentage","Date"],
      ...(quizStats.history||[]).map(h=>[h.subject,`${h.score}/${h.total}`,`${h.percentage}%`,new Date(h.completed_at).toLocaleDateString("en-IN")]),
      [],
      ["=== ATTENDANCE ==="],
      ["Overall", `${attendance?.overall_pct||0}%`],
      ["Subject","Present","Total","Percentage","Status"],
      ...(attendance?.summary||[]).map(s=>[s.subject,s.combined_present,s.combined_total,`${s.percentage}%`,s.status]),
      [],
      ["=== ASSIGNMENTS ==="],
      ["Title","Subject","Status","Marks"],
      ...assignments.map(a=>[a.title,a.subject,a.submission_status||"Not submitted",a.marks_obtained||"-"]),
    ];
    const csv  = rows.map(r=>Array.isArray(r)?r.join(","):r).join("\n");
    const blob = new Blob([csv],{type:"text/csv"});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${selectedStudent?.name||"student"}_full_report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const submitted = assignments.filter(a=>a.submission_id);
  const graded    = assignments.filter(a=>a.submission_status==="graded");

  return (
    <>
      <style>{CSS}</style>
      <div className="pr-wrap pr-fade" id="report-content">
        <div className="pr-header">
          <div>
            <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>📊 Progress Report</div>
            <div style={{fontSize:13,color:"var(--text3)"}}>Complete student performance overview</div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button className="btn btn-gold" onClick={exportAttendance}>📊 Export Attendance</button>
            <button className="btn btn-teal" onClick={exportFullReport}>📥 Export CSV</button>
            <button className="btn btn-outline" onClick={printReport}>🖨️ Print Report</button>
          </div>
        </div>

        {/* Student selector — teacher only */}
        {user.role==="teacher" && students.length>0 && (
          <div className="pr-student-sel">
            <span style={{fontSize:13,color:"var(--text3)",fontWeight:600}}>Student:</span>
            {students.map(s=>(
              <div key={s.id}
                className={`pr-student-chip ${selectedId===s.id?"active":""}`}
                onClick={()=>setSelectedId(s.id)}>
                {s.name}
              </div>
            ))}
          </div>
        )}

        {/* Student info */}
        {selectedStudent && (
          <div className="pr-card" style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
            <Av name={selectedStudent.name} size={56}/>
            <div>
              <div style={{fontSize:18,fontWeight:800}}>{selectedStudent.name}</div>
              <div style={{fontSize:13,color:"var(--text3)"}}>{selectedStudent.email}</div>
              <div style={{fontSize:12,color:"var(--purple)",marginTop:4,fontWeight:600}}>
                Report generated: {new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{textAlign:"center",padding:40}}><span className="spin" style={{width:32,height:32,border:"3px solid rgba(124,92,252,0.2)",borderTopColor:"var(--purple)"}}/></div>
        ) : (
          <>
            {/* Stats overview */}
            <div className="pr-stat-row">
              {[
                ["Quiz Avg",   `${quizStats?.average_score||0}%`,        "var(--purple)"],
                ["Quizzes",    quizStats?.total_quizzes||0,               "var(--teal)"],
                ["Attend.",    `${attendance?.overall_pct||0}%`,          "var(--gold)"],
                ["Assignments",`${submitted.length}/${assignments.length}`,"var(--orange)"],
              ].map(([l,v,c])=>(
                <div key={l} className="pr-stat">
                  <div className="pr-stat-val" style={{color:c}}>{v}</div>
                  <div className="pr-stat-label">{l}</div>
                </div>
              ))}
            </div>

            {/* Quiz history */}
            {quizStats?.history?.length>0 && (
              <div className="pr-card">
                <div className="pr-card-title">📝 Quiz Performance</div>
                <div style={{overflowX:"auto"}}>
                  <table>
                    <thead><tr><th>Subject</th><th>Score</th><th>Percentage</th><th>Date</th></tr></thead>
                    <tbody>
                      {quizStats.history.map((h,i)=>(
                        <tr key={i}>
                          <td style={{fontWeight:600}}>{h.subject}</td>
                          <td style={{fontFamily:"var(--mono)",fontSize:12}}>{h.score}/{h.total}</td>
                          <td>
                            <span className="badge" style={{
                              background:`${h.percentage>=70?"var(--teal)":h.percentage>=50?"var(--gold)":"var(--danger)"}18`,
                              color:h.percentage>=70?"var(--teal)":h.percentage>=50?"var(--gold)":"var(--danger)",
                            }}>{h.percentage}%</span>
                          </td>
                          <td style={{color:"var(--text3)",fontSize:12}}>{new Date(h.completed_at).toLocaleDateString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Attendance */}
            {attendance?.summary?.length>0 && (
              <div className="pr-card">
                <div className="pr-card-title">
                  📋 Attendance — Overall {attendance.overall_pct}%
                </div>
                {attendance.summary.map((s,i)=>(
                  <div key={i} className="pr-subject-row">
                    <div className="pr-subject-name">{s.subject}</div>
                    <div className="pr-bar">
                      <div className="pr-bar-fill" style={{width:`${s.percentage}%`,background:pctColor(s.percentage)}}/>
                    </div>
                    <div className="pr-val" style={{color:pctColor(s.percentage)}}>{s.percentage}%</div>
                    <span className="badge" style={{
                      background:`${pctColor(s.status==="safe"?"75":"50")}18`,
                      color:pctColor(s.status==="safe"?"75":"50"),
                      fontSize:10, marginLeft:4,
                      background: s.status==="safe"?"rgba(0,212,170,0.1)":s.status==="warning"?"rgba(245,158,11,0.1)":"rgba(239,68,68,0.1)",
                      color: s.status==="safe"?"var(--teal)":s.status==="warning"?"var(--gold)":"var(--danger)",
                      border: `1px solid ${s.status==="safe"?"rgba(0,212,170,0.2)":s.status==="warning"?"rgba(245,158,11,0.2)":"rgba(239,68,68,0.2)"}`,
                    }}>
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Assignments */}
            {assignments.length>0 && (
              <div className="pr-card">
                <div className="pr-card-title">📚 Assignments</div>
                <div style={{overflowX:"auto"}}>
                  <table>
                    <thead><tr><th>Title</th><th>Subject</th><th>Marks</th><th>Status</th></tr></thead>
                    <tbody>
                      {assignments.map((a,i)=>(
                        <tr key={i}>
                          <td style={{fontWeight:600,fontSize:13}}>{a.title}</td>
                          <td style={{color:"var(--text3)",fontSize:12}}>{a.subject}</td>
                          <td style={{fontFamily:"var(--mono)",fontSize:12}}>
                            {a.submission_status==="graded" ? `${a.marks_obtained}/${a.total_marks}` : "-"}
                          </td>
                          <td>
                            <span className="badge" style={{
                              background: a.submission_status==="graded"?"rgba(124,92,252,0.1)":a.submission_id?"rgba(0,212,170,0.1)":"rgba(90,95,122,0.1)",
                              color:      a.submission_status==="graded"?"var(--purple)":a.submission_id?"var(--teal)":"var(--text3)",
                            }}>
                              {a.submission_status==="graded"?"Graded":a.submission_id?"Submitted":"Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
