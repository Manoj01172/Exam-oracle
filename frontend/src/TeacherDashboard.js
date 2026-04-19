import { useState, useEffect } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
  .td-wrap { padding:24px; font-family:'Sora',sans-serif; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .td-fade { animation:fadeIn 0.3s ease; }
  .td-tabs { display:flex; gap:8px; margin-bottom:24px; flex-wrap:wrap; }
  .td-tab { padding:9px 20px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; border:1.5px solid var(--border2); color:var(--text2); background:var(--card2); transition:all 0.2s; white-space:nowrap; }
  .td-tab.active { border-color:var(--purple); background:rgba(124,92,252,0.1); color:var(--purple); }
  .td-stat-row { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:24px; }
  .td-stat { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; text-align:center; }
  .td-stat-val { font-size:28px; font-weight:800; }
  .td-stat-label { font-size:11px; color:var(--text3); margin-top:2px; }
  .td-card { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:20px; margin-bottom:16px; }
  .td-card-title { font-size:15px; font-weight:700; margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; }
  .form-group { margin-bottom:14px; }
  .form-label { font-size:12px; font-weight:600; color:var(--text2); margin-bottom:5px; display:block; }
  .form-input { width:100%; background:var(--card2); border:1.5px solid var(--border2); border-radius:10px; padding:10px 13px; color:var(--text); font-size:13px; font-family:'Sora',sans-serif; outline:none; transition:border 0.2s; }
  .form-input:focus { border-color:var(--purple); }
  textarea.form-input { resize:vertical; min-height:80px; }
  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .btn { display:inline-flex; align-items:center; gap:6px; padding:9px 18px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; border:none; font-family:'Sora',sans-serif; transition:all 0.2s; }
  .btn-primary { background:linear-gradient(135deg,var(--purple),var(--purple2)); color:#fff; }
  .btn-primary:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 4px 14px rgba(124,92,252,0.3); }
  .btn-primary:disabled { opacity:0.5; cursor:not-allowed; }
  .btn-teal { background:linear-gradient(135deg,var(--teal),#00a888); color:#000; font-weight:700; }
  .btn-danger { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); color:var(--danger); }
  .btn-outline { background:transparent; border:1.5px solid var(--border2); color:var(--text2); }
  .btn-outline:hover { border-color:var(--purple); color:var(--purple); }
  .badge { display:inline-flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  table { width:100%; border-collapse:collapse; }
  th { font-size:11px; font-weight:600; color:var(--text3); text-transform:uppercase; letter-spacing:0.8px; padding:10px 12px; text-align:left; border-bottom:1px solid var(--border); }
  td { padding:11px 12px; border-bottom:1px solid var(--border); font-size:13px; vertical-align:middle; }
  tr:last-child td { border-bottom:none; }
  tr:hover td { background:rgba(255,255,255,0.02); }
  .av { border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; color:#fff; flex-shrink:0; }
  .class-card { background:var(--card2); border:1px solid var(--border); border-radius:14px; padding:18px; margin-bottom:12px; transition:all 0.2s; }
  .class-card:hover { border-color:var(--purple); }
  .class-code { font-family:'JetBrains Mono',monospace; font-size:22px; font-weight:800; color:var(--purple); letter-spacing:3px; padding:10px 20px; background:rgba(124,92,252,0.08); border:2px dashed rgba(124,92,252,0.3); border-radius:12px; text-align:center; }
  .mcq-builder { background:var(--card2); border:1px solid var(--border); border-radius:10px; padding:14px; margin-bottom:10px; }
  .spin { animation:spin 1s linear infinite; display:inline-block; width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; }
  @keyframes spin { to{transform:rotate(360deg)} }
  .success-box { padding:12px 16px; border-radius:10px; background:rgba(0,212,170,0.08); border:1px solid rgba(0,212,170,0.2); color:var(--teal); font-size:13px; margin-bottom:14px; }
  .empty-box { text-align:center; padding:32px; color:var(--text3); font-size:13px; }
  .at-bar { height:6px; background:var(--card2); border-radius:3px; overflow:hidden; margin-top:4px; }
  .at-fill { height:100%; border-radius:3px; }
  @media(max-width:768px) { .td-stat-row{grid-template-columns:1fr 1fr;} .td-wrap{padding:16px;} .form-row{grid-template-columns:1fr;} }
`;

const BASE = process.env.REACT_APP_BASE_URL;
const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;
const GROQ_URL = process.env.REACT_APP_GROQ_URL;

function Av({ name="?", size=34 }) {
  const colors = [["#7c5cfc","#5b3fd4"],["#00d4aa","#009977"],["#ff6b35","#cc4400"],["#f59e0b","#d97706"]];
  const [c1,c2] = colors[(name.charCodeAt(0)||0)%colors.length];
  return <div className="av" style={{width:size,height:size,minWidth:size,background:`linear-gradient(135deg,${c1},${c2})`,fontSize:size*0.35}}>{name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}</div>;
}

export default function TeacherDashboard({ user }) {
  const [tab,         setTab]         = useState("classes");
  const [classes,     setClasses]     = useState([]);
  const [students,    setStudents]    = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attendance,  setAttendance]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [msg,         setMsg]         = useState("");
  const [viewSubs,    setViewSubs]    = useState(null);
  const [subs,        setSubs]        = useState([]);
  const [grading,     setGrading]     = useState({});
  const [viewClassStudents, setViewClassStudents] = useState(null);
  const [classStudents,     setClassStudents]     = useState([]);

  // Class form
  const [classForm, setClassForm] = useState({ name:"", subject:"General", section:"" });

  // Assignment form
  const [form, setForm] = useState({
    title:"", description:"", type:"text", subject:"General",
    due_date:"", total_marks:100, content:"", class_id:""
  });
  const [mcqs,    setMcqs]    = useState([{ question:"", options:["","","",""], correct:0 }]);

  // AI Question paper
  const [aiTopic,   setAiTopic]   = useState("");
  const [aiPaper,   setAiPaper]   = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => { loadAll(); }, [user.id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [clsRes, studRes, asnRes, attRes] = await Promise.all([
        fetch(`${BASE}/classes/teacher/${user.id}`).then(r=>r.json()),
        fetch(`${BASE}/auth/users`).then(r=>r.json()),
        fetch(`${BASE}/assignments/teacher/${user.id}`).then(r=>r.json()),
        fetch(`${BASE}/attendance/teacher/overview`).then(r=>r.json()),
      ]);
      setClasses(clsRes.classes||[]);
      setStudents((studRes.users||[]).filter(u=>u.role==="student"));
      setAssignments(asnRes.assignments||[]);
      setAttendance(attRes.overview||[]);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const createClass = async () => {
    if (!classForm.name.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`${BASE}/classes/create`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ teacher_id:user.id, ...classForm })
      });
      setMsg("Class created! Share the join code with students.");
      setClassForm({ name:"", subject:"General", section:"" });
      await loadAll();
    } catch { /* ignore */ }
    setSubmitting(false);
    setTimeout(()=>setMsg(""),4000);
  };

  const deleteClass = async (id) => {
    if (!window.confirm("Delete this class? All students will be removed.")) return;
    await fetch(`${BASE}/classes/${id}`, { method:"DELETE" });
    await loadAll();
  };

  const loadClassStudents = async (classId) => {
    setViewClassStudents(classId);
    const res  = await fetch(`${BASE}/classes/${classId}/students`);
    const data = await res.json();
    setClassStudents(data.students||[]);
  };

  const createAssignment = async () => {
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("teacher_id",  user.id);
      formData.append("title",       form.title);
      formData.append("description", form.description);
      formData.append("type",        form.type);
      formData.append("subject",     form.subject);
      formData.append("due_date",    form.due_date);
      formData.append("total_marks", form.total_marks);
      formData.append("content",     form.type==="mcq" ? JSON.stringify(mcqs) : form.content);
      if (form.class_id) formData.append("class_id", form.class_id);
      if (form.type==="pdf" && form._file) formData.append("file", form._file);

      await fetch(`${BASE}/assignments/create`, { method:"POST", body:formData });
      const target = form.class_id
        ? `Class: ${classes.find(c=>String(c.id)===form.class_id)?.name||""}`
        : "All Students";
      setMsg(`Assignment sent to ${target}!`);
      setForm({ title:"", description:"", type:"text", subject:"General", due_date:"", total_marks:100, content:"", class_id:"" });
      setMcqs([{ question:"", options:["","","",""], correct:0 }]);
      await loadAll();
    } catch { /* ignore */ }
    setSubmitting(false);
    setTimeout(()=>setMsg(""),3000);
  };

  const loadSubmissions = async (assignId) => {
    setViewSubs(assignId);
    const res  = await fetch(`${BASE}/assignments/${assignId}/submissions`);
    const data = await res.json();
    setSubs(data.submissions||[]);
  };

  const gradeSubmission = async (subId) => {
    const g = grading[subId]||{};
    await fetch(`${BASE}/assignments/grade/${subId}`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ marks_obtained:g.marks||0, feedback:g.feedback||"" })
    });
    setMsg("Graded!");
    loadSubmissions(viewSubs);
    setTimeout(()=>setMsg(""),2000);
  };

  const deleteAssignment = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;
    await fetch(`${BASE}/assignments/${id}`, { method:"DELETE" });
    await loadAll();
  };

  const generateQP = async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    try {
      const res  = await fetch(GROQ_URL, {
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${GROQ_API_KEY}`},
        body: JSON.stringify({
          model:"llama-3.1-8b-instant",
          messages:[{role:"user",content:`Create a complete exam question paper for: ${aiTopic}
Include:
- 5 short answer questions (2 marks each)
- 3 medium questions (5 marks each)
- 2 long answer questions (10 marks each)
Total: 50 marks. Format professionally.`}],
          max_tokens:1200, temperature:0.4
        })
      });
      const data = await res.json();
      setAiPaper(data.choices?.[0]?.message?.content||"");
    } catch { /* ignore */ }
    setAiLoading(false);
  };

  const addMcq    = () => setMcqs(m=>[...m,{question:"",options:["","","",""],correct:0}]);
  const removeMcq = (i) => setMcqs(m=>m.filter((_,j)=>j!==i));
  const updateMcq = (i,f,v) => setMcqs(m=>m.map((q,j)=>j===i?{...q,[f]:v}:q));
  const updateMcqOpt = (i,oi,v) => setMcqs(m=>m.map((q,j)=>j===i?{...q,options:q.options.map((o,k)=>k===oi?v:o)}:q));
  const pctColor  = (p) => p>=75?"var(--teal)":p>=60?"var(--gold)":"var(--danger)";

  return (
    <>
      <style>{CSS}</style>
      <div className="td-wrap td-fade">
        <div style={{marginBottom:20}}>
          <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>👨‍🏫 Teacher Dashboard</div>
          <div style={{fontSize:13,color:"var(--text3)"}}>Manage classes, assignments, and student attendance</div>
        </div>

        {!loading && (
          <div className="td-stat-row">
            {[
              ["Classes",     classes.length,    "var(--purple)"],
              ["Students",    students.length,   "var(--teal)"],
              ["Assignments", assignments.length,"var(--orange)"],
              ["Submissions", assignments.reduce((s,a)=>s+(a.submission_count||0),0),"var(--gold)"],
            ].map(([l,v,c])=>(
              <div key={l} className="td-stat">
                <div className="td-stat-val" style={{color:c}}>{v}</div>
                <div className="td-stat-label">{l}</div>
              </div>
            ))}
          </div>
        )}

        <div className="td-tabs">
          {[
            ["classes",    "🏫 My Classes"],
            ["assignments","📚 Assignments"],
            ["create",     "➕ Create Assignment"],
            ["qpaper",     "🤖 AI Question Paper"],
            ["attendance", "📋 Attendance"],
          ].map(([id,l])=>(
            <div key={id} className={`td-tab ${tab===id?"active":""}`} onClick={()=>setTab(id)}>{l}</div>
          ))}
        </div>

        {msg && <div className="success-box">✅ {msg}</div>}

        {/* ── CLASSES TAB ── */}
        {tab==="classes" && (
          <div>
            {/* Create class form */}
            <div className="td-card">
              <div className="td-card-title">➕ Create New Class</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Class Name *</label>
                  <input className="form-input" placeholder="e.g. BCA 3rd Year"
                    value={classForm.name} onChange={e=>setClassForm({...classForm,name:e.target.value})}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input className="form-input" placeholder="e.g. Data Structures"
                    value={classForm.subject} onChange={e=>setClassForm({...classForm,subject:e.target.value})}/>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Section (optional)</label>
                <input className="form-input" placeholder="e.g. Section A"
                  value={classForm.section} onChange={e=>setClassForm({...classForm,section:e.target.value})}/>
              </div>
              <button className="btn btn-primary" onClick={createClass} disabled={submitting||!classForm.name.trim()}>
                {submitting?<span className="spin"/>:"🏫 Create Class"}
              </button>
            </div>

            {/* Classes list */}
            {classes.length===0 ? (
              <div className="td-card"><div className="empty-box">
                <div style={{fontSize:36,marginBottom:8}}>🏫</div>
                No classes yet. Create your first class above!
              </div></div>
            ) : (
              classes.map(cls=>(
                <div key={cls.id} className="class-card">
                  <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:12}}>
                    <div>
                      <div style={{fontSize:16,fontWeight:800}}>{cls.name}</div>
                      <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>
                        {cls.subject} {cls.section&&`· ${cls.section}`} · {cls.student_count} students
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button className="btn btn-outline" style={{fontSize:12,padding:"5px 12px"}}
                        onClick={()=>viewClassStudents===cls.id?setViewClassStudents(null):loadClassStudents(cls.id)}>
                        👥 Students
                      </button>
                      <button className="btn btn-danger" style={{fontSize:12,padding:"5px 10px"}}
                        onClick={()=>deleteClass(cls.id)}>🗑️</button>
                    </div>
                  </div>

                  {/* Join Code */}
                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:11,color:"var(--text3)",marginBottom:6,fontWeight:600}}>SHARE THIS CODE WITH STUDENTS:</div>
                    <div className="class-code">{cls.join_code}</div>
                    <div style={{fontSize:11,color:"var(--text3)",marginTop:6,textAlign:"center"}}>
                      Students go to "My Classes" → "Join Class" → enter this code
                    </div>
                  </div>

                  {/* Students list */}
                  {viewClassStudents===cls.id && (
                    <div style={{borderTop:"1px solid var(--border)",paddingTop:14}}>
                      <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>
                        Students ({classStudents.length})
                      </div>
                      {classStudents.length===0 ? (
                        <div style={{color:"var(--text3)",fontSize:13}}>No students have joined yet.</div>
                      ) : (
                        classStudents.map((s,i)=>(
                          <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
                            <Av name={s.name} size={30}/>
                            <div>
                              <div style={{fontWeight:600,fontSize:13}}>{s.name}</div>
                              <div style={{fontSize:11,color:"var(--text3)"}}>{s.email}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── ASSIGNMENTS TAB ── */}
        {tab==="assignments" && (
          <div>
            {assignments.length===0 ? (
              <div className="td-card"><div className="empty-box">
                <div style={{fontSize:36,marginBottom:8}}>📭</div>
                No assignments yet.
                <br/><button className="btn btn-primary" style={{marginTop:12}} onClick={()=>setTab("create")}>Create First</button>
              </div></div>
            ) : assignments.map(a=>(
              <div key={a.id} className="td-card">
                <div className="td-card-title">
                  <div>
                    <div style={{fontSize:15,fontWeight:700}}>{a.title}</div>
                    <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>
                      {a.subject} · {a.type.toUpperCase()} · {a.total_marks} marks
                      {a.class_name && <span style={{color:"var(--purple)",marginLeft:6}}>· 🏫 {a.class_name}</span>}
                      {!a.class_id && <span style={{color:"var(--teal)",marginLeft:6}}>· 👥 All Students</span>}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <span className="badge" style={{background:"rgba(0,212,170,0.1)",color:"var(--teal)",border:"1px solid rgba(0,212,170,0.2)"}}>
                      {a.submission_count} submissions
                    </span>
                    <button className="btn btn-outline" style={{padding:"5px 12px",fontSize:12}} onClick={()=>viewSubs===a.id?setViewSubs(null):loadSubmissions(a.id)}>
                      {viewSubs===a.id?"Close":"View Submissions"}
                    </button>
                    <button className="btn btn-danger" style={{padding:"5px 10px",fontSize:12}} onClick={()=>deleteAssignment(a.id)}>🗑️</button>
                  </div>
                </div>
                {a.description && <div style={{fontSize:13,color:"var(--text2)",marginBottom:8}}>{a.description}</div>}
                {a.due_date && <div style={{fontSize:12,color:"var(--text3)"}}>📅 Due: {new Date(a.due_date).toLocaleDateString("en-IN")}</div>}

                {viewSubs===a.id && (
                  <div style={{marginTop:14,borderTop:"1px solid var(--border)",paddingTop:14}}>
                    <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Submissions ({subs.length})</div>
                    {subs.length===0 ? <div style={{color:"var(--text3)",fontSize:13}}>No submissions yet.</div> : (
                      subs.map(s=>(
                        <div key={s.id} style={{background:"var(--card2)",border:"1px solid var(--border)",borderRadius:10,padding:14,marginBottom:10}}>
                          <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:8}}>
                            <div style={{fontWeight:600}}>{s.student_name}</div>
                            <span className="badge" style={{background:s.status==="graded"?"rgba(124,92,252,0.1)":"rgba(245,158,11,0.1)",color:s.status==="graded"?"var(--purple)":"var(--gold)"}}>
                              {s.status}
                            </span>
                          </div>
                          {s.answer_text && <div style={{fontSize:12,color:"var(--text2)",marginBottom:8}}>{s.answer_text.slice(0,200)}{s.answer_text.length>200?"...":""}</div>}
                          {s.original_name && <div style={{fontSize:12,color:"var(--teal)",marginBottom:8}}>📎 {s.original_name}</div>}
                          {s.status!=="graded" && (
                            <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                              <input type="number" min="0" max={a.total_marks} placeholder="Marks"
                                value={grading[s.id]?.marks||""}
                                onChange={e=>setGrading(g=>({...g,[s.id]:{...g[s.id],marks:e.target.value}}))}
                                style={{width:80,padding:"6px 10px",background:"var(--card)",border:"1px solid var(--border)",borderRadius:8,color:"var(--text)",fontSize:13,fontFamily:"'Sora',sans-serif",outline:"none"}}/>
                              <input placeholder="Feedback"
                                value={grading[s.id]?.feedback||""}
                                onChange={e=>setGrading(g=>({...g,[s.id]:{...g[s.id],feedback:e.target.value}}))}
                                style={{flex:1,minWidth:120,padding:"6px 10px",background:"var(--card)",border:"1px solid var(--border)",borderRadius:8,color:"var(--text)",fontSize:13,fontFamily:"'Sora',sans-serif",outline:"none"}}/>
                              <button className="btn btn-teal" style={{padding:"6px 14px",fontSize:12}} onClick={()=>gradeSubmission(s.id)}>✅ Grade</button>
                            </div>
                          )}
                          {s.status==="graded" && <div style={{fontSize:12,color:"var(--purple)",fontWeight:700}}>Marks: {s.marks_obtained}/{a.total_marks} {s.feedback&&`· ${s.feedback}`}</div>}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── CREATE ASSIGNMENT ── */}
        {tab==="create" && (
          <div className="td-card">
            <div className="td-card-title">➕ Create Assignment</div>

            {/* TARGET */}
            <div className="form-group">
              <label className="form-label">Send To *</label>
              <select className="form-input" value={form.class_id} onChange={e=>setForm({...form,class_id:e.target.value})}>
                <option value="">👥 All Students (Everyone)</option>
                {classes.map(c=>(
                  <option key={c.id} value={c.id}>🏫 {c.name} ({c.student_count} students)</option>
                ))}
              </select>
              {classes.length===0 && (
                <div style={{fontSize:11,color:"var(--text3)",marginTop:4}}>
                  Create a class first to send to specific students.
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" placeholder="Assignment title"
                value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Subject</label>
                <select className="form-input" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}>
                  {["General","Mathematics","Physics","Chemistry","Biology","English","Computer Science","History","Economics"].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-input" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                  <option value="text">Text Answer</option>
                  <option value="mcq">MCQ Quiz</option>
                  <option value="pdf">PDF Upload</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date" value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})}/>
              </div>
              <div className="form-group">
                <label className="form-label">Total Marks</label>
                <input className="form-input" type="number" value={form.total_marks} onChange={e=>setForm({...form,total_marks:e.target.value})}/>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description / Instructions</label>
              <textarea className="form-input" placeholder="What should students do..."
                value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
            </div>

            {form.type==="mcq" && (
              <div style={{marginBottom:16}}>
                <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>MCQ Questions</div>
                {mcqs.map((q,i)=>(
                  <div key={i} className="mcq-builder">
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                      <span style={{fontSize:12,fontWeight:700,color:"var(--purple)"}}>Q{i+1}</span>
                      {mcqs.length>1 && <button style={{background:"none",border:"none",cursor:"pointer",color:"var(--danger)",fontSize:12}} onClick={()=>removeMcq(i)}>✕</button>}
                    </div>
                    <input className="form-input" placeholder="Question" style={{marginBottom:8}}
                      value={q.question} onChange={e=>updateMcq(i,"question",e.target.value)}/>
                    {q.options.map((opt,oi)=>(
                      <div key={oi} style={{display:"flex",gap:8,marginBottom:6,alignItems:"center"}}>
                        <input type="radio" checked={q.correct===oi} onChange={()=>updateMcq(i,"correct",oi)}/>
                        <input className="form-input" placeholder={`Option ${String.fromCharCode(65+oi)}`}
                          value={opt} onChange={e=>updateMcqOpt(i,oi,e.target.value)} style={{padding:"7px 12px"}}/>
                      </div>
                    ))}
                    <div style={{fontSize:11,color:"var(--text3)"}}>Select radio = correct answer</div>
                  </div>
                ))}
                <button className="btn btn-outline" style={{fontSize:12,padding:"6px 14px"}} onClick={addMcq}>+ Add Question</button>
              </div>
            )}

            {form.type==="pdf" && (
              <div className="form-group">
                <label className="form-label">Assignment PDF (optional)</label>
                <input type="file" accept=".pdf" onChange={e=>setForm({...form,_file:e.target.files[0]})} style={{fontSize:13,color:"var(--text2)"}}/>
              </div>
            )}

            <button className="btn btn-primary" onClick={createAssignment} disabled={submitting||!form.title.trim()}>
              {submitting?<span className="spin"/>:"📤 Send Assignment"}
            </button>
          </div>
        )}

        {/* ── AI QUESTION PAPER ── */}
        {tab==="qpaper" && (
          <div className="td-card">
            <div className="td-card-title">🤖 AI Question Paper Generator</div>
            <div style={{display:"flex",gap:10,marginBottom:16}}>
              <input className="form-input" placeholder="Topic: e.g. Human Resource Management..."
                value={aiTopic} onChange={e=>setAiTopic(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&generateQP()} style={{flex:1}}/>
              <button className="btn btn-primary" onClick={generateQP} disabled={aiLoading||!aiTopic.trim()}>
                {aiLoading?<><span className="spin"/> Generating...</>:"🚀 Generate"}
              </button>
            </div>
            {aiPaper && (
              <div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                  <div style={{fontSize:13,fontWeight:700}}>Generated Paper</div>
                  <button className="btn btn-outline" style={{fontSize:12,padding:"5px 12px"}} onClick={()=>navigator.clipboard.writeText(aiPaper)}>📋 Copy</button>
                </div>
                <div style={{background:"var(--card2)",border:"1px solid var(--border)",borderRadius:12,padding:20,fontSize:13,lineHeight:1.8,color:"var(--text2)",whiteSpace:"pre-wrap"}}>
                  {aiPaper}
                </div>
                <button className="btn btn-primary" style={{marginTop:12}} onClick={()=>{setForm({...form,title:`${aiTopic} — Exam`,description:aiTopic,type:"text",content:aiPaper});setTab("create");}}>
                  📤 Send as Assignment
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── ATTENDANCE ── */}
        {tab==="attendance" && (
          <div className="td-card">
            <div className="td-card-title">📋 Student Attendance Overview</div>
            {attendance.length===0 ? (
              <div className="empty-box">No attendance data yet.</div>
            ) : (
              <div style={{overflowX:"auto"}}>
                <table>
                  <thead><tr><th>Student</th><th>Present</th><th>Absent</th><th>Attendance %</th></tr></thead>
                  <tbody>
                    {attendance.sort((a,b)=>b.percentage-a.percentage).map((s,i)=>(
                      <tr key={i}>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <Av name={s.student_name} size={30}/>
                            <div>
                              <div style={{fontWeight:600,fontSize:13}}>{s.student_name}</div>
                              <div style={{fontSize:11,color:"var(--text3)"}}>{s.student_email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{color:"var(--teal)",fontWeight:700}}>{s.present}</td>
                        <td style={{color:"var(--danger)",fontWeight:700}}>{s.absent}</td>
                        <td>
                          <div style={{fontSize:13,fontWeight:700,color:pctColor(s.percentage)}}>{s.percentage}%</div>
                          <div className="at-bar" style={{width:100}}>
                            <div className="at-fill" style={{width:`${s.percentage}%`,background:pctColor(s.percentage)}}/>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
