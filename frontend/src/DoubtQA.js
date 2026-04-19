import { useState, useEffect } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
  .dq-wrap { padding:24px; font-family:'Sora',sans-serif; max-width:800px; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .dq-fade { animation:fadeIn 0.3s ease; }
  .dq-ask-box { background:var(--card); border:1px solid var(--border); border-radius:16px; padding:20px; margin-bottom:20px; }
  .dq-ask-title { font-size:15px; font-weight:700; margin-bottom:14px; }
  .form-group { margin-bottom:12px; }
  .form-label { font-size:12px; font-weight:600; color:var(--text2); margin-bottom:5px; display:block; }
  .form-input { width:100%; background:var(--card2); border:1.5px solid var(--border2); border-radius:10px; padding:10px 13px; color:var(--text); font-size:13px; font-family:'Sora',sans-serif; outline:none; transition:border 0.2s; }
  .form-input:focus { border-color:var(--purple); }
  textarea.form-input { resize:vertical; min-height:80px; }
  .btn { display:inline-flex; align-items:center; gap:6px; padding:9px 18px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; border:none; font-family:'Sora',sans-serif; transition:all 0.2s; }
  .btn-primary { background:linear-gradient(135deg,var(--purple),var(--purple2)); color:#fff; }
  .btn-primary:hover:not(:disabled) { transform:translateY(-1px); }
  .btn-primary:disabled { opacity:0.5; cursor:not-allowed; }
  .btn-teal { background:linear-gradient(135deg,var(--teal),#00a888); color:#000; font-weight:700; }
  .dq-card { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:18px; margin-bottom:12px; transition:all 0.2s; }
  .dq-card:hover { border-color:var(--purple); }
  .dq-q { font-size:14px; font-weight:600; margin-bottom:8px; }
  .dq-meta { font-size:11px; color:var(--text3); margin-bottom:10px; display:flex; gap:12px; flex-wrap:wrap; }
  .dq-answer-box { background:rgba(0,212,170,0.05); border:1px solid rgba(0,212,170,0.2); border-radius:10px; padding:12px 14px; margin-top:10px; }
  .dq-answer-label { font-size:11px; color:var(--teal); font-weight:700; margin-bottom:4px; }
  .dq-answer-text { font-size:13px; color:var(--text2); line-height:1.6; }
  .dq-pending { font-size:12px; color:var(--gold); font-style:italic; }
  .badge { display:inline-flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  .answer-input { width:100%; background:var(--card2); border:1.5px solid var(--border2); border-radius:10px; padding:10px 13px; color:var(--text); font-size:13px; font-family:'Sora',sans-serif; outline:none; resize:vertical; min-height:70px; margin-bottom:10px; }
  .answer-input:focus { border-color:var(--teal); }
  .success-box { padding:10px 14px; border-radius:10px; background:rgba(0,212,170,0.08); border:1px solid rgba(0,212,170,0.2); color:var(--teal); font-size:13px; margin-bottom:14px; }
  .empty-box { text-align:center; padding:40px; color:var(--text3); font-size:13px; }
  .spin { animation:spin 1s linear infinite; display:inline-block; width:16px; height:16px; border:2px solid rgba(124,92,252,0.2); border-top-color:var(--purple); border-radius:50%; }
  @keyframes spin { to{transform:rotate(360deg)} }
  @media(max-width:600px) { .dq-wrap{padding:16px;} }
`;

const BASE = "http://localhost:5000/api";

export default function DoubtQA({ user }) {
  const [doubts,    setDoubts]    = useState([]);
  const [teachers,  setTeachers]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [submitting,setSubmitting]= useState(false);
  const [msg,       setMsg]       = useState("");
  const [answers,   setAnswers]   = useState({});
  const [question,  setQuestion]  = useState("");
  const [subject,   setSubject]   = useState("General");
  const [teacherId, setTeacherId] = useState("");

  useEffect(() => { loadAll(); }, [user.id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      if (user.role === "teacher") {
        const res  = await fetch(`${BASE}/doubts/teacher/${user.id}`);
        const data = await res.json();
        setDoubts(data.doubts || []);
      } else {
        const [dRes, tRes] = await Promise.all([
          fetch(`${BASE}/doubts/student/${user.id}`).then(r=>r.json()),
          fetch(`${BASE}/auth/users`).then(r=>r.json()),
        ]);
        setDoubts(dRes.doubts || []);
        const t = (tRes.users||[]).filter(u=>u.role==="teacher");
        setTeachers(t);
        if (t.length > 0) setTeacherId(String(t[0].id));
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const submitDoubt = async () => {
    if (!question.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`${BASE}/doubts/ask`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          student_id: user.id,
          teacher_id: teacherId || null,
          question,
          subject,
        })
      });
      setMsg("Doubt submitted! Your teacher will answer soon.");
      setQuestion(""); 
      await loadAll();
    } catch { /* ignore */ }
    setSubmitting(false);
    setTimeout(()=>setMsg(""), 4000);
  };

  const submitAnswer = async (doubtId) => {
    const answer = answers[doubtId];
    if (!answer?.trim()) return;
    try {
      await fetch(`${BASE}/doubts/answer/${doubtId}`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ answer })
      });
      setMsg("Answer submitted! Student has been notified.");
      setAnswers(a=>({...a,[doubtId]:""}));
      await loadAll();
    } catch { /* ignore */ }
    setTimeout(()=>setMsg(""), 3000);
  };

  const pending   = doubts.filter(d=>d.status==="pending");
  const answered  = doubts.filter(d=>d.status==="answered");

  return (
    <>
      <style>{CSS}</style>
      <div className="dq-wrap dq-fade">
        <div style={{marginBottom:20}}>
          <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>
            {user.role==="teacher" ? "❓ Student Doubts" : "❓ Ask a Doubt"}
          </div>
          <div style={{fontSize:13,color:"var(--text3)"}}>
            {user.role==="teacher" ? "Answer student questions" : "Ask your teacher anything"}
          </div>
        </div>

        {msg && <div className="success-box">✅ {msg}</div>}

        {/* Student — Ask form */}
        {user.role !== "teacher" && (
          <div className="dq-ask-box">
            <div className="dq-ask-title">Ask a Question</div>
            {teachers.length > 0 && (
              <div className="form-group">
                <label className="form-label">Teacher</label>
                <select className="form-input" value={teacherId} onChange={e=>setTeacherId(e.target.value)}>
                  {teachers.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input className="form-input" placeholder="e.g. Mathematics"
                value={subject} onChange={e=>setSubject(e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Your Question *</label>
              <textarea className="form-input" placeholder="Type your doubt here..."
                value={question} onChange={e=>setQuestion(e.target.value)}/>
            </div>
            <button className="btn btn-primary" onClick={submitDoubt} disabled={submitting||!question.trim()}>
              {submitting?<span className="spin"/>:"📤 Submit Doubt"}
            </button>
          </div>
        )}

        {loading ? (
          <div style={{textAlign:"center",padding:40}}>
            <span className="spin" style={{width:28,height:28,border:"3px solid rgba(124,92,252,0.2)",borderTopColor:"var(--purple)"}}/>
          </div>
        ) : (
          <>
            {/* Pending doubts */}
            {pending.length > 0 && (
              <>
                <div style={{fontSize:14,fontWeight:700,marginBottom:12,color:"var(--gold)"}}>
                  ⏳ Pending ({pending.length})
                </div>
                {pending.map(d=>(
                  <div key={d.id} className="dq-card">
                    <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:8}}>
                      <span className="badge" style={{background:"rgba(245,158,11,0.1)",color:"var(--gold)",border:"1px solid rgba(245,158,11,0.2)"}}>Pending</span>
                      {user.role==="teacher" && <span style={{fontSize:12,color:"var(--text3)"}}>From: {d.student_name}</span>}
                    </div>
                    <div className="dq-q">{d.question}</div>
                    <div className="dq-meta">
                      <span>📚 {d.subject}</span>
                      <span>🕐 {new Date(d.created_at).toLocaleDateString("en-IN")}</span>
                    </div>
                    {user.role==="teacher" && (
                      <div>
                        <textarea className="answer-input"
                          placeholder="Type your answer here..."
                          value={answers[d.id]||""}
                          onChange={e=>setAnswers(a=>({...a,[d.id]:e.target.value}))}/>
                        <button className="btn btn-teal" style={{fontSize:12,padding:"7px 16px"}}
                          onClick={()=>submitAnswer(d.id)} disabled={!answers[d.id]?.trim()}>
                          ✅ Submit Answer
                        </button>
                      </div>
                    )}
                    {user.role !== "teacher" && (
                      <div className="dq-pending">Waiting for teacher's response...</div>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* Answered doubts */}
            {answered.length > 0 && (
              <>
                <div style={{fontSize:14,fontWeight:700,margin:"16px 0 12px",color:"var(--teal)"}}>
                  ✅ Answered ({answered.length})
                </div>
                {answered.map(d=>(
                  <div key={d.id} className="dq-card">
                    <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:8}}>
                      <span className="badge" style={{background:"rgba(0,212,170,0.1)",color:"var(--teal)",border:"1px solid rgba(0,212,170,0.2)"}}>Answered</span>
                      {user.role==="teacher" && <span style={{fontSize:12,color:"var(--text3)"}}>From: {d.student_name}</span>}
                    </div>
                    <div className="dq-q">{d.question}</div>
                    <div className="dq-meta">
                      <span>📚 {d.subject}</span>
                      <span>🕐 {new Date(d.created_at).toLocaleDateString("en-IN")}</span>
                    </div>
                    <div className="dq-answer-box">
                      <div className="dq-answer-label">Answer:</div>
                      <div className="dq-answer-text">{d.answer}</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {doubts.length===0 && (
              <div className="empty-box">
                <div style={{fontSize:36,marginBottom:8}}>❓</div>
                {user.role==="teacher" ? "No student doubts yet." : "No doubts asked yet. Ask your first question above!"}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
