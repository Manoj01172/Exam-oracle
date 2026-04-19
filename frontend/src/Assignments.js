import { useState, useEffect } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
  .asn-wrap { padding:24px; font-family:'Sora',sans-serif; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .asn-fade { animation:fadeIn 0.3s ease; }
  .asn-card { background:var(--card); border:1px solid var(--border); border-radius:16px; padding:20px; margin-bottom:14px; transition:all 0.2s; }
  .asn-card:hover { border-color:var(--purple); }
  .asn-card-header { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:12px; }
  .asn-title { font-size:16px; font-weight:700; }
  .asn-teacher { font-size:12px; color:var(--text3); margin-top:2px; }
  .asn-desc { font-size:13.5px; color:var(--text2); line-height:1.6; margin-bottom:12px; }
  .asn-meta { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:14px; align-items:center; }
  .badge { display:inline-flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  .asn-due { font-size:12px; color:var(--text3); display:flex; align-items:center; gap:4px; }
  .asn-submit-area { background:var(--card2); border:1px solid var(--border); border-radius:12px; padding:16px; }
  .asn-submit-title { font-size:13px; font-weight:700; margin-bottom:12px; }
  .form-input { width:100%; background:var(--card); border:1.5px solid var(--border2); border-radius:10px; padding:10px 13px; color:var(--text); font-size:13px; font-family:'Sora',sans-serif; outline:none; transition:border 0.2s; }
  .form-input:focus { border-color:var(--purple); }
  textarea.form-input { resize:vertical; min-height:80px; }
  .btn { display:inline-flex; align-items:center; gap:6px; padding:9px 18px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; border:none; font-family:'Sora',sans-serif; transition:all 0.2s; }
  .btn-primary { background:linear-gradient(135deg,var(--purple),var(--purple2)); color:#fff; }
  .btn-primary:hover:not(:disabled) { transform:translateY(-1px); }
  .btn-primary:disabled { opacity:0.5; cursor:not-allowed; }
  .btn-outline { background:transparent; border:1.5px solid var(--border2); color:var(--text2); }
  .mcq-opt { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:10px; border:1.5px solid var(--border2); margin-bottom:8px; cursor:pointer; transition:all 0.2s; font-size:13px; }
  .mcq-opt:hover { border-color:var(--purple); background:rgba(124,92,252,0.05); }
  .mcq-opt.selected { border-color:var(--purple); background:rgba(124,92,252,0.1); color:var(--purple); }
  .mcq-letter { width:26px; height:26px; border-radius:6px; border:1.5px solid currentColor; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; flex-shrink:0; }
  .asn-submitted { display:flex; align-items:center; gap:10px; padding:12px 16px; background:rgba(0,212,170,0.08); border:1px solid rgba(0,212,170,0.2); border-radius:10px; }
  .asn-graded { background:rgba(124,92,252,0.08); border-color:rgba(124,92,252,0.2); }
  .spin { animation:spin 1s linear infinite; display:inline-block; width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; }
  @keyframes spin { to{transform:rotate(360deg)} }
  .empty-box { text-align:center; padding:48px; color:var(--text3); }
  .success-box { padding:12px 16px; border-radius:10px; background:rgba(0,212,170,0.08); border:1px solid rgba(0,212,170,0.2); color:var(--teal); font-size:13px; margin-bottom:16px; }
  @media(max-width:600px) { .asn-wrap{padding:16px;} }
`;

const BASE = process.env.REACT_APP_BASE_URL;

export default function Assignments({ user }) {
  const [assignments, setAssignments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(null);
  const [answers,     setAnswers]     = useState({});
  const [mcqAnswers,  setMcqAnswers]  = useState({});
  const [files,       setFiles]       = useState({});
  const [expanded,    setExpanded]    = useState({});
  const [msg,         setMsg]         = useState("");

  useEffect(() => { load(); }, [user.id]);

  const load = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/assignments/student/all?student_id=${user.id}`);
      const data = await res.json();
      setAssignments(data.assignments || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const toggleExpand = (id) => setExpanded(e => ({...e, [id]: !e[id]}));

  const handleMcqSelect = (assignId, qIdx, optIdx) => {
    setMcqAnswers(m => ({
      ...m,
      [assignId]: { ...(m[assignId]||{}), [qIdx]: optIdx }
    }));
  };

  const handleSubmit = async (assignment) => {
    setSubmitting(assignment.id);
    try {
      const formData = new FormData();
      formData.append("assignment_id", assignment.id);
      formData.append("student_id",    user.id);
      formData.append("answer_text",   answers[assignment.id] || "");
      formData.append("mcq_answers",   JSON.stringify(mcqAnswers[assignment.id] || {}));
      if (files[assignment.id]) formData.append("file", files[assignment.id]);

      await fetch(`${BASE}/assignments/submit`, { method:"POST", body:formData });
      setMsg("Assignment submitted successfully!");
      setTimeout(() => setMsg(""), 3000);
      await load();
    } catch { /* ignore */ }
    setSubmitting(null);
  };

  const isOverdue = (due) => due && new Date(due) < new Date();

  const parseMcq = (content) => {
    try { return JSON.parse(content); } catch { return []; }
  };

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="asn-wrap" style={{textAlign:"center",paddingTop:60}}>
        <div style={{width:32,height:32,border:"3px solid rgba(124,92,252,0.2)",borderTopColor:"var(--purple)",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto"}}/>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="asn-wrap asn-fade">
        <div style={{marginBottom:20}}>
          <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>📚 Assignments</div>
          <div style={{fontSize:13,color:"var(--text3)"}}>Assignments from your teachers</div>
        </div>

        {msg && <div className="success-box">✅ {msg}</div>}

        {assignments.length === 0 ? (
          <div className="empty-box">
            <div style={{fontSize:48,marginBottom:12}}>📭</div>
            <div style={{fontSize:16,fontWeight:700,marginBottom:8}}>No assignments yet</div>
            <div>Your teacher hasn't posted any assignments yet.</div>
          </div>
        ) : (
          assignments.map(a => {
            const isSubmitted = !!a.submission_id;
            const isGraded    = a.submission_status === "graded";
            const mcqs        = a.type === "mcq" ? parseMcq(a.content) : [];
            const isExp       = expanded[a.id];

            return (
              <div key={a.id} className="asn-card">
                <div className="asn-card-header">
                  <div style={{flex:1}}>
                    <div className="asn-title">{a.title}</div>
                    <div className="asn-teacher">👨‍🏫 {a.teacher_name} · {a.subject}</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                    <span className="badge" style={{
                      background: a.type==="mcq"?"rgba(124,92,252,0.1)":a.type==="pdf"?"rgba(245,158,11,0.1)":"rgba(0,212,170,0.1)",
                      color: a.type==="mcq"?"var(--purple)":a.type==="pdf"?"var(--gold)":"var(--teal)",
                      border: `1px solid ${a.type==="mcq"?"rgba(124,92,252,0.2)":a.type==="pdf"?"rgba(245,158,11,0.2)":"rgba(0,212,170,0.2)"}`,
                    }}>{a.type.toUpperCase()}</span>
                    <span className="badge" style={{background:"var(--card2)",color:"var(--text3)",border:"1px solid var(--border)"}}>
                      {a.total_marks} marks
                    </span>
                  </div>
                </div>

                <div className="asn-meta">
                  {a.due_date && (
                    <span className="asn-due" style={{color:isOverdue(a.due_date)?"var(--danger)":"var(--text3)"}}>
                      📅 Due: {new Date(a.due_date).toLocaleDateString("en-IN")}
                      {isOverdue(a.due_date) && " ⚠️ Overdue"}
                    </span>
                  )}
                </div>

                {a.description && <div className="asn-desc">{a.description}</div>}

                {/* Graded result */}
                {isGraded && (
                  <div className="asn-submitted asn-graded" style={{marginBottom:12}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:"var(--purple)"}}>
                        ⭐ Graded: {a.marks_obtained}/{a.total_marks} marks
                      </div>
                      {a.feedback && <div style={{fontSize:12,color:"var(--text2)",marginTop:4}}>Feedback: {a.feedback}</div>}
                    </div>
                  </div>
                )}

                {/* Submitted (not graded) */}
                {isSubmitted && !isGraded && (
                  <div className="asn-submitted" style={{marginBottom:12}}>
                    <span>✅</span>
                    <div style={{fontSize:13,fontWeight:600,color:"var(--teal)"}}>
                      Submitted · Awaiting review
                    </div>
                  </div>
                )}

                {/* Submit form */}
                {!isGraded && (
                  <div className="asn-submit-area">
                    <div className="asn-submit-title">
                      {isSubmitted ? "📝 Resubmit" : "📝 Submit Assignment"}
                    </div>

                    {!isExp && (
                      <button className="btn btn-outline" onClick={() => toggleExpand(a.id)}>
                        {isSubmitted ? "Edit & Resubmit" : "Start Submission"} →
                      </button>
                    )}

                    {isExp && (
                      <>
                        {/* MCQ type */}
                        {a.type === "mcq" && mcqs.length > 0 && (
                          <div style={{marginBottom:14}}>
                            {mcqs.map((q, qi) => (
                              <div key={qi} style={{marginBottom:16}}>
                                <div style={{fontSize:14,fontWeight:600,marginBottom:8}}>
                                  Q{qi+1}. {q.question}
                                </div>
                                {q.options.map((opt, oi) => (
                                  <div key={oi}
                                    className={`mcq-opt ${mcqAnswers[a.id]?.[qi]===oi?"selected":""}`}
                                    onClick={() => handleMcqSelect(a.id, qi, oi)}>
                                    <span className="mcq-letter">{String.fromCharCode(65+oi)}</span>
                                    {opt}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Text type */}
                        {(a.type==="text" || !a.type) && (
                          <textarea className="form-input" placeholder="Write your answer here..."
                            value={answers[a.id]||""} onChange={e=>setAnswers(x=>({...x,[a.id]:e.target.value}))}
                            style={{marginBottom:12}}/>
                        )}

                        {/* PDF submission */}
                        {a.type==="pdf" && (
                          <div style={{marginBottom:12}}>
                            <div style={{fontSize:12,color:"var(--text3)",marginBottom:8}}>
                              Upload your assignment PDF:
                            </div>
                            <input type="file" accept=".pdf"
                              onChange={e=>setFiles(f=>({...f,[a.id]:e.target.files[0]}))}
                              style={{fontSize:13,color:"var(--text2)"}}/>
                          </div>
                        )}

                        <div style={{display:"flex",gap:8}}>
                          <button className="btn btn-primary"
                            onClick={() => handleSubmit(a)}
                            disabled={submitting===a.id}>
                            {submitting===a.id ? <span className="spin"/> : "📤 Submit"}
                          </button>
                          <button className="btn btn-outline" onClick={() => toggleExpand(a.id)}>Cancel</button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
