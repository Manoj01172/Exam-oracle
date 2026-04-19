import { useState, useEffect } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
  .tools-wrap { padding:24px; font-family:'Sora',sans-serif; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .tools-fade { animation:fadeIn 0.3s ease; }
  .tools-tabs { display:flex; gap:8px; margin-bottom:24px; flex-wrap:wrap; }
  .tools-tab { padding:9px 18px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; border:1.5px solid var(--border2); color:var(--text2); background:var(--card2); transition:all 0.2s; }
  .tools-tab.active { border-color:var(--purple); background:rgba(124,92,252,0.1); color:var(--purple); }

  /* COUNTDOWN */
  .countdown-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:14px; margin-bottom:20px; }
  .countdown-card { background:var(--card); border:1px solid var(--border); border-radius:16px; padding:20px; text-align:center; position:relative; overflow:hidden; }
  .countdown-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,var(--purple),var(--teal)); }
  .countdown-exam { font-size:14px; font-weight:700; margin-bottom:4px; }
  .countdown-subject { font-size:11px; color:var(--text3); margin-bottom:12px; }
  .countdown-days { font-size:42px; font-weight:800; line-height:1; }
  .countdown-label { font-size:11px; color:var(--text3); margin-top:4px; }
  .countdown-date { font-size:12px; color:var(--text3); margin-top:8px; }
  .countdown-urgent { color:var(--danger); }
  .countdown-soon { color:var(--gold); }
  .countdown-safe { color:var(--teal); }
  .countdown-done { color:var(--text3); text-decoration:line-through; }

  /* FLASHCARDS */
  .fc-scene { perspective:1000px; width:100%; max-width:500px; margin:0 auto 20px; height:220px; cursor:pointer; }
  .fc-card { width:100%; height:100%; position:relative; transform-style:preserve-3d; transition:transform 0.5s; }
  .fc-card.flipped { transform:rotateY(180deg); }
  .fc-face { position:absolute; inset:0; border-radius:16px; display:flex; align-items:center; justify-content:center; padding:24px; text-align:center; backface-visibility:hidden; }
  .fc-front { background:linear-gradient(135deg,var(--purple),var(--purple2)); color:#fff; }
  .fc-back  { background:linear-gradient(135deg,var(--teal),#00a888); color:#000; transform:rotateY(180deg); }
  .fc-text { font-size:16px; font-weight:600; line-height:1.6; }
  .fc-hint { font-size:11px; opacity:0.7; margin-top:8px; }
  .fc-nav { display:flex; gap:10px; justify-content:center; align-items:center; margin-bottom:20px; }
  .fc-counter { font-size:13px; color:var(--text3); font-family:'JetBrains Mono',monospace; }
  .fc-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .fc-item { background:var(--card2); border:1px solid var(--border); border-radius:12px; padding:14px; cursor:pointer; transition:all 0.2s; }
  .fc-item:hover { border-color:var(--purple); }
  .fc-q { font-size:12px; color:var(--text3); margin-bottom:4px; }
  .fc-a { font-size:13px; font-weight:600; color:var(--teal); }

  /* SHARED NOTES */
  .note-file-card { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:16px 18px; margin-bottom:10px; display:flex; align-items:center; gap:14px; transition:all 0.2s; }
  .note-file-card:hover { border-color:var(--purple); }
  .note-file-icon { width:42px; height:42px; border-radius:12px; background:rgba(245,158,11,0.1); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
  .note-file-name { font-size:14px; font-weight:600; }
  .note-file-meta { font-size:11px; color:var(--text3); margin-top:2px; }

  /* SHARED */
  .form-group { margin-bottom:14px; }
  .form-label { font-size:12px; font-weight:600; color:var(--text2); margin-bottom:5px; display:block; }
  .form-input { width:100%; background:var(--card2); border:1.5px solid var(--border2); border-radius:10px; padding:10px 13px; color:var(--text); font-size:13px; font-family:'Sora',sans-serif; outline:none; transition:border 0.2s; }
  .form-input:focus { border-color:var(--purple); }
  .btn { display:inline-flex; align-items:center; gap:6px; padding:9px 18px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; border:none; font-family:'Sora',sans-serif; transition:all 0.2s; }
  .btn-primary { background:linear-gradient(135deg,var(--purple),var(--purple2)); color:#fff; }
  .btn-primary:hover:not(:disabled) { transform:translateY(-1px); }
  .btn-primary:disabled { opacity:0.5; cursor:not-allowed; }
  .btn-outline { background:transparent; border:1.5px solid var(--border2); color:var(--text2); }
  .btn-outline:hover { border-color:var(--purple); color:var(--purple); }
  .btn-danger { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); color:var(--danger); }
  .card { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:20px; margin-bottom:16px; }
  .card-title { font-size:15px; font-weight:700; margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; }
  .success-box { padding:10px 14px; border-radius:10px; background:rgba(0,212,170,0.08); border:1px solid rgba(0,212,170,0.2); color:var(--teal); font-size:13px; margin-bottom:14px; }
  .empty-box { text-align:center; padding:32px; color:var(--text3); font-size:13px; }
  .spin { animation:spin 1s linear infinite; display:inline-block; width:16px; height:16px; border:2px solid rgba(124,92,252,0.2); border-top-color:var(--purple); border-radius:50%; }
  @keyframes spin { to{transform:rotate(360deg)} }
  @media(max-width:600px) { .tools-wrap{padding:16px;} .fc-grid{grid-template-columns:1fr;} }
`;

const BASE = process.env.REACT_APP_BASE_URL;
const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;
const GROQ_URL = process.env.REACT_APP_GROQ_URL;
const STORAGE_KEY   = (u) => `exam_oracle_tools_${u}`;

function daysUntil(dateStr) {
  const now  = new Date(); now.setHours(0,0,0,0);
  const exam = new Date(dateStr);
  return Math.ceil((exam - now) / 86400000);
}

export default function StudyTools({ user }) {
  const [tab,         setTab]         = useState("countdown");
  const [countdowns,  setCountdowns]  = useState([]);
  const [flashcards,  setFlashcards]  = useState([]);
  const [fcIdx,       setFcIdx]       = useState(0);
  const [fcFlipped,   setFcFlipped]   = useState(false);
  const [sharedNotes, setSharedNotes] = useState([]);
  const [msg,         setMsg]         = useState("");
  const [aiLoading,   setAiLoading]   = useState(false);
  const [aiTopic,     setAiTopic]     = useState("");

  // Countdown form
  const [cdForm, setCdForm] = useState({ exam_name:"", exam_date:"", subject:"" });

  // Notes form (teacher only)
  const [noteForm,  setNoteForm]  = useState({ title:"", description:"", class_id:"" });
  const [noteFile,  setNoteFile]  = useState(null);
  const [classes,   setClasses]   = useState([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY(user.id)) || "{}");
      if (saved.countdowns) setCountdowns(saved.countdowns);
      if (saved.flashcards) setFlashcards(saved.flashcards);
    } catch { /* ignore */ }
    loadSharedNotes();
    if (user.role === "teacher") loadClasses();
  }, [user.id]);

  const save = (key, value) => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY(user.id)) || "{}");
      localStorage.setItem(STORAGE_KEY(user.id), JSON.stringify({ ...saved, [key]: value }));
    } catch { /* ignore */ }
  };

  const loadSharedNotes = async () => {
    try {
      const res  = await fetch(`${BASE}/shared-notes/list?user_id=${user.id}&role=${user.role}`);
      const data = await res.json();
      setSharedNotes(data.notes || []);
    } catch { /* ignore */ }
  };

  const loadClasses = async () => {
    try {
      const res  = await fetch(`${BASE}/classes/teacher/${user.id}`);
      const data = await res.json();
      setClasses(data.classes || []);
    } catch { /* ignore */ }
  };

  // ── COUNTDOWN ────────────────────────────────────────────────────────────────
  const addCountdown = () => {
    if (!cdForm.exam_name || !cdForm.exam_date) return;
    const updated = [...countdowns, { ...cdForm, id: Date.now().toString() }];
    setCountdowns(updated);
    save("countdowns", updated);
    setCdForm({ exam_name:"", exam_date:"", subject:"" });
    setMsg("Exam added!"); setTimeout(()=>setMsg(""), 2000);
  };

  const removeCountdown = (id) => {
    const updated = countdowns.filter(c => c.id !== id);
    setCountdowns(updated);
    save("countdowns", updated);
  };

  // ── FLASHCARDS ────────────────────────────────────────────────────────────────
  const generateFlashcards = async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    try {
      const res  = await fetch(GROQ_URL, {
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${GROQ_API_KEY}`},
        body: JSON.stringify({
          model:"llama-3.1-8b-instant",
          messages:[{role:"user",content:`Create 10 flashcards for: ${aiTopic}
Return ONLY JSON array:
[{"question":"...","answer":"..."}]
Keep answers concise — 1-2 sentences max.`}],
          max_tokens:800, temperature:0.4
        })
      });
      const data = await res.json();
      const raw  = data.choices?.[0]?.message?.content || "[]";
      const clean = raw.replace(/```json|```/g,"").trim();
      const match = clean.match(/\[.*\]/s);
      if (match) {
        const cards = JSON.parse(match[0]);
        setFlashcards(cards);
        save("flashcards", cards);
        setFcIdx(0); setFcFlipped(false);
        setMsg(`${cards.length} flashcards created!`);
        setTimeout(()=>setMsg(""), 2000);
      }
    } catch { /* ignore */ }
    setAiLoading(false);
  };

  const nextCard = () => { setFcIdx(i=>(i+1)%flashcards.length); setFcFlipped(false); };
  const prevCard = () => { setFcIdx(i=>(i-1+flashcards.length)%flashcards.length); setFcFlipped(false); };

  const dayColorClass = (days) => {
    if (days < 0)  return "countdown-done";
    if (days <= 3) return "countdown-urgent";
    if (days <= 7) return "countdown-soon";
    return "countdown-safe";
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="tools-wrap tools-fade">
        <div style={{marginBottom:20}}>
          <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>🧰 Study Tools</div>
          <div style={{fontSize:13,color:"var(--text3)"}}>Exam countdown, flashcards, and shared notes</div>
        </div>

        <div className="tools-tabs">
          {[["countdown","⏳ Exam Countdown"],["flashcards","🃏 Flashcards"],["notes","📎 Shared Notes"]].map(([id,l])=>(
            <div key={id} className={`tools-tab ${tab===id?"active":""}`} onClick={()=>setTab(id)}>{l}</div>
          ))}
        </div>

        {msg && <div className="success-box">✅ {msg}</div>}

        {/* ── COUNTDOWN ── */}
        {tab==="countdown" && (
          <>
            <div className="card">
              <div className="card-title">➕ Add Exam</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div className="form-group">
                  <label className="form-label">Exam Name</label>
                  <input className="form-input" placeholder="e.g. Final Exam"
                    value={cdForm.exam_name} onChange={e=>setCdForm({...cdForm,exam_name:e.target.value})}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input className="form-input" type="date"
                    value={cdForm.exam_date} onChange={e=>setCdForm({...cdForm,exam_date:e.target.value})}/>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Subject (optional)</label>
                <input className="form-input" placeholder="e.g. Mathematics"
                  value={cdForm.subject} onChange={e=>setCdForm({...cdForm,subject:e.target.value})}/>
              </div>
              <button className="btn btn-primary" onClick={addCountdown} disabled={!cdForm.exam_name||!cdForm.exam_date}>
                ➕ Add Exam
              </button>
            </div>

            {countdowns.length===0 ? (
              <div className="empty-box">
                <div style={{fontSize:36,marginBottom:8}}>⏳</div>
                No exams added yet. Add your upcoming exams above!
              </div>
            ) : (
              <div className="countdown-grid">
                {[...countdowns]
                  .sort((a,b)=>new Date(a.exam_date)-new Date(b.exam_date))
                  .map(cd=>{
                    const days = daysUntil(cd.exam_date);
                    const cls  = dayColorClass(days);
                    return (
                      <div key={cd.id} className="countdown-card">
                        <div className="countdown-exam">{cd.exam_name}</div>
                        {cd.subject && <div className="countdown-subject">{cd.subject}</div>}
                        <div className={`countdown-days ${cls}`}>
                          {days < 0 ? "Done" : days}
                        </div>
                        <div className="countdown-label">
                          {days < 0 ? "Exam passed" : days===0 ? "TODAY!" : days===1 ? "day left" : "days left"}
                        </div>
                        <div className="countdown-date">
                          {new Date(cd.exam_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                        </div>
                        <button className="btn btn-danger" style={{marginTop:12,fontSize:11,padding:"4px 10px"}}
                          onClick={()=>removeCountdown(cd.id)}>Remove</button>
                      </div>
                    );
                  })}
              </div>
            )}
          </>
        )}

        {/* ── FLASHCARDS ── */}
        {tab==="flashcards" && (
          <>
            <div className="card">
              <div className="card-title">🤖 Generate AI Flashcards</div>
              <div style={{display:"flex",gap:10}}>
                <input className="form-input" placeholder="Topic: e.g. Human Resource Management"
                  value={aiTopic} onChange={e=>setAiTopic(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&generateFlashcards()} style={{flex:1}}/>
                <button className="btn btn-primary" onClick={generateFlashcards} disabled={aiLoading||!aiTopic.trim()}>
                  {aiLoading?<><span className="spin"/> Generating...</>:"✨ Generate"}
                </button>
              </div>
            </div>

            {flashcards.length > 0 && (
              <>
                {/* Flip card */}
                <div className="fc-scene" onClick={()=>setFcFlipped(f=>!f)}>
                  <div className={`fc-card ${fcFlipped?"flipped":""}`}>
                    <div className="fc-face fc-front">
                      <div>
                        <div className="fc-text">{flashcards[fcIdx]?.question}</div>
                        <div className="fc-hint">Click to reveal answer</div>
                      </div>
                    </div>
                    <div className="fc-face fc-back">
                      <div>
                        <div className="fc-text">{flashcards[fcIdx]?.answer}</div>
                        <div className="fc-hint">Click to go back</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="fc-nav">
                  <button className="btn btn-outline" style={{padding:"6px 14px",fontSize:12}} onClick={prevCard}>← Prev</button>
                  <span className="fc-counter">{fcIdx+1} / {flashcards.length}</span>
                  <button className="btn btn-outline" style={{padding:"6px 14px",fontSize:12}} onClick={nextCard}>Next →</button>
                </div>

                {/* All cards grid */}
                <div className="card">
                  <div className="card-title">All Flashcards</div>
                  <div className="fc-grid">
                    {flashcards.map((fc,i)=>(
                      <div key={i} className="fc-item" onClick={()=>{setFcIdx(i);setFcFlipped(false);}}>
                        <div className="fc-q">Q: {fc.question}</div>
                        <div className="fc-a">A: {fc.answer.slice(0,80)}{fc.answer.length>80?"...":""}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {flashcards.length===0 && !aiLoading && (
              <div className="empty-box">
                <div style={{fontSize:36,marginBottom:8}}>🃏</div>
                Enter a topic above and AI will generate flashcards for you!
              </div>
            )}
          </>
        )}

        {/* ── SHARED NOTES ── */}
        {tab==="notes" && (
          <>
            {user.role==="teacher" && (
              <div className="card">
                <div className="card-title">📤 Share Notes with Students</div>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input className="form-input" placeholder="Note title"
                    value={noteForm.title} onChange={e=>setNoteForm({...noteForm,title:e.target.value})}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Send To</label>
                  <select className="form-input" value={noteForm.class_id} onChange={e=>setNoteForm({...noteForm,class_id:e.target.value})}>
                    <option value="">All Students</option>
                    {classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">PDF File</label>
                  <input type="file" accept=".pdf" onChange={e=>setNoteFile(e.target.files[0])} style={{fontSize:13,color:"var(--text2)"}}/>
                </div>
                <button className="btn btn-primary" disabled={!noteForm.title||!noteFile}
                  onClick={async()=>{
                    const fd = new FormData();
                    fd.append("teacher_id",  user.id);
                    fd.append("title",       noteForm.title);
                    fd.append("class_id",    noteForm.class_id||"");
                    fd.append("file",        noteFile);
                    await fetch(`${BASE}/shared-notes/upload`, {method:"POST",body:fd});
                    setMsg("Notes shared!"); setNoteForm({title:"",description:"",class_id:""}); setNoteFile(null);
                    loadSharedNotes(); setTimeout(()=>setMsg(""),2000);
                  }}>
                  📤 Share Notes
                </button>
              </div>
            )}

            <div className="card">
              <div className="card-title">📚 Available Notes</div>
              {sharedNotes.length===0 ? (
                <div className="empty-box">
                  <div style={{fontSize:36,marginBottom:8}}>📭</div>
                  No shared notes yet.{user.role==="teacher"?" Upload some above!":"Your teacher hasn't shared any notes yet."}
                </div>
              ) : (
                sharedNotes.map(n=>(
                  <div key={n.id} className="note-file-card">
                    <div className="note-file-icon">📄</div>
                    <div style={{flex:1}}>
                      <div className="note-file-name">{n.title}</div>
                      <div className="note-file-meta">{n.original_name} · Shared by {n.teacher_name}</div>
                      <div className="note-file-meta">{new Date(n.created_at).toLocaleDateString("en-IN")}</div>
                    </div>
                    <a href={`${BASE}/shared-notes/download/${n.id}`} target="_blank" rel="noreferrer">
                      <button className="btn btn-outline" style={{fontSize:12,padding:"6px 12px"}}>⬇️ Download</button>
                    </a>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
