import { useState, useEffect, useRef } from "react";
import { pdfAPI } from "./services/api";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
  .qz-wrap { padding:24px; font-family:'Sora',sans-serif; max-width:800px; margin:0 auto; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .qz-fade { animation:fadeIn 0.3s ease; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

  /* START SCREEN */
  .qz-start { text-align:center; padding:32px 24px; background:var(--card); border:1px solid var(--border); border-radius:20px; }
  .qz-emoji { font-size:56px; margin-bottom:16px; }
  .qz-title { font-size:26px; font-weight:800; margin-bottom:8px; }
  .qz-sub { font-size:14px; color:var(--text3); margin-bottom:28px; line-height:1.6; }
  .qz-pdf-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:10px; margin-bottom:24px; }
  .qz-pdf-card { padding:14px; background:var(--card2); border:1.5px solid var(--border2); border-radius:12px; cursor:pointer; transition:all 0.2s; text-align:left; }
  .qz-pdf-card:hover { border-color:var(--purple); }
  .qz-pdf-card.selected { border-color:var(--purple); background:rgba(124,92,252,0.08); }
  .qz-pdf-name { font-size:13px; font-weight:600; margin-bottom:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .qz-pdf-sub { font-size:11px; color:var(--text3); }
  .qz-settings { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:24px; }
  .qz-setting { background:var(--card2); border:1px solid var(--border); border-radius:12px; padding:14px; }
  .qz-setting-label { font-size:11px; color:var(--text3); margin-bottom:6px; }
  .qz-setting-val { font-size:20px; font-weight:800; }
  select { background:var(--card2); border:1px solid var(--border); border-radius:8px; padding:7px 12px; color:var(--text); font-size:13px; font-family:'Sora',sans-serif; outline:none; width:100%; }

  /* LOADING */
  .qz-loading { text-align:center; padding:60px 20px; }
  .qz-spinner { width:48px; height:48px; border:3px solid rgba(124,92,252,0.2); border-top-color:var(--purple); border-radius:50%; animation:spin 1s linear infinite; margin:0 auto 20px; }
  @keyframes spin { to{transform:rotate(360deg)} }
  .qz-loading-text { font-size:16px; font-weight:600; margin-bottom:8px; }
  .qz-loading-sub { font-size:13px; color:var(--text3); animation:pulse 1.5s infinite; }

  /* QUIZ */
  .qz-header { display:flex; align-items:center; gap:16px; margin-bottom:24px; }
  .qz-progress-track { flex:1; height:8px; background:var(--card2); border-radius:4px; overflow:hidden; }
  .qz-progress-fill { height:100%; border-radius:4px; background:linear-gradient(90deg,var(--purple),var(--teal)); transition:width 0.4s; }
  .qz-qnum { font-size:13px; color:var(--text3); white-space:nowrap; }
  .qz-timer { display:flex; align-items:center; gap:6px; padding:8px 14px; border-radius:10px; border:1px solid var(--border); background:var(--card2); font-family:'JetBrains Mono',monospace; font-size:15px; font-weight:600; white-space:nowrap; }
  .qz-timer.warn { border-color:var(--orange); color:var(--orange); background:rgba(255,107,53,0.08); }
  .qz-timer.danger { border-color:var(--danger); color:var(--danger); background:rgba(239,68,68,0.08); animation:pulse 0.8s infinite; }
  .qz-card { background:var(--card); border:1px solid var(--border); border-radius:20px; padding:28px; }
  .qz-q-meta { display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap; }
  .badge { display:inline-flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  .qz-q-text { font-size:17px; font-weight:600; line-height:1.6; margin-bottom:24px; color:var(--text); }
  .qz-opt { display:flex; align-items:center; gap:14px; padding:14px 18px; border-radius:12px; border:1.5px solid var(--border2); cursor:pointer; margin-bottom:10px; transition:all 0.2s; font-size:14px; font-weight:500; }
  .qz-opt:hover:not(.disabled) { border-color:var(--purple); background:rgba(124,92,252,0.06); }
  .qz-opt.selected { border-color:var(--purple); background:rgba(124,92,252,0.1); color:var(--purple); }
  .qz-opt.correct { border-color:var(--teal); background:rgba(0,212,170,0.08); color:var(--teal); }
  .qz-opt.wrong { border-color:var(--danger); background:rgba(239,68,68,0.08); color:var(--danger); }
  .qz-opt.disabled { cursor:default; }
  .qz-opt-letter { width:30px; height:30px; border-radius:8px; border:1.5px solid currentColor; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; flex-shrink:0; }
  .qz-explanation { margin-top:14px; padding:12px 16px; background:rgba(0,212,170,0.05); border:1px solid rgba(0,212,170,0.2); border-radius:10px; font-size:13px; color:var(--text2); line-height:1.6; }
  .qz-explanation strong { color:var(--teal); }
  .qz-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:20px; }
  .btn { display:inline-flex; align-items:center; gap:8px; padding:10px 22px; border-radius:10px; font-size:13.5px; font-weight:600; cursor:pointer; border:none; font-family:'Sora',sans-serif; transition:all 0.2s; }
  .btn:disabled { opacity:0.5; cursor:not-allowed; }
  .btn-primary { background:linear-gradient(135deg,var(--purple),var(--purple2)); color:#fff; box-shadow:0 4px 14px rgba(124,92,252,0.3); }
  .btn-primary:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(124,92,252,0.4); }
  .btn-teal { background:linear-gradient(135deg,var(--teal),#00a888); color:#000; font-weight:700; }
  .btn-outline { background:transparent; border:1.5px solid var(--border2); color:var(--text2); }
  .btn-outline:hover { border-color:var(--purple); color:var(--purple); }

  /* RESULT */
  .qz-result { text-align:center; padding:32px 24px; background:var(--card); border:1px solid var(--border); border-radius:20px; }
  .qz-score-circle { width:120px; height:120px; border-radius:50%; margin:0 auto 24px; display:flex; align-items:center; justify-content:center; position:relative; }
  .qz-score-inner { width:94px; height:94px; border-radius:50%; background:var(--card); display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; z-index:1; }
  .qz-score-num { font-size:26px; font-weight:800; }
  .qz-score-label { font-size:10px; color:var(--text3); }
  .qz-result-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin:20px 0; }
  .qz-result-stat { background:var(--card2); border:1px solid var(--border); border-radius:12px; padding:14px; }
  .qz-result-stat-val { font-size:22px; font-weight:800; margin-bottom:4px; }
  .qz-result-stat-label { font-size:11px; color:var(--text3); }
  .qz-review { text-align:left; margin-top:20px; }
  .qz-review-item { display:flex; gap:10px; align-items:flex-start; padding:10px 0; border-bottom:1px solid var(--border); font-size:13px; }
  .qz-review-icon { font-size:16px; flex-shrink:0; margin-top:1px; }
  .qz-review-q { color:var(--text2); flex:1; }
  .qz-streak { display:flex; align-items:center; gap:6px; justify-content:center; margin-bottom:16px; font-size:14px; font-weight:600; color:var(--orange); }
  .error-box { padding:14px; border-radius:12px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); color:var(--danger); font-size:13px; margin-bottom:16px; }
  .empty-box { text-align:center; padding:48px; color:var(--text3); }

  @media(max-width:600px) {
    .qz-wrap{padding:16px;}
    .qz-settings{grid-template-columns:1fr 1fr;}
    .qz-result-grid{grid-template-columns:1fr 1fr;}
    .qz-q-text{font-size:15px;}
    .qz-header{flex-wrap:wrap;}
  }
`;

const GROQ_API_KEY  = "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"; // same key as backend
const GROQ_URL      = "https://api.groq.com/openai/v1/chat/completions";
const TIMER_DEFAULT = 30;

// ── Generate MCQs via Groq ────────────────────────────────────────────────────
async function generateQuizQuestions(pdfText, subject, count = 10) {
  const prompt = `You are an expert exam question creator. Based on this exam paper text, generate ${count} multiple choice questions.

EXAM TEXT:
${pdfText.slice(0, 3000)}

Return ONLY a JSON array, no markdown:
[
  {
    "question": "Clear exam-style MCQ question",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Brief explanation of why this answer is correct",
    "topic": "Topic name",
    "difficulty": "Easy"
  }
]

Rules:
- Questions must be based on actual paper content
- Options must be plausible — no obviously wrong answers
- correct = index of correct option (0, 1, 2, or 3)
- difficulty: Easy, Medium, or Hard
- No duplicate questions
- Mix of Easy, Medium, Hard difficulties`;

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model:       "llama-3.3-70b-versatile",
      messages:    [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens:  3000,
    }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);

  const data = await response.json();
  const raw  = data.choices?.[0]?.message?.content || "[]";
  const clean = raw.replace(/```json|```/g, "").trim();

  // Extract JSON array
  const match = clean.match(/\[.*\]/s);
  if (!match) throw new Error("Could not parse questions");

  return JSON.parse(match[0]);
}

// ── Save quiz result to backend ───────────────────────────────────────────────
async function saveResult(userId, score, total, subject) {
  try {
    await fetch("http://localhost:5000/api/analysis/quiz/save", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ user_id: userId, score, total, subject, time_taken: 0 }),
    });
  } catch { /* non-critical */ }
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function QuizMode({ user }) {
  const [phase,      setPhase]      = useState("start");
  const [pdfs,       setPdfs]       = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [qCount,     setQCount]     = useState(10);
  const [questions,  setQuestions]  = useState([]);
  const [idx,        setIdx]        = useState(0);
  const [selected,   setSelected]   = useState(null);
  const [revealed,   setRevealed]   = useState(false);
  const [answers,    setAnswers]     = useState([]);
  const [time,       setTime]       = useState(TIMER_DEFAULT);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [pdfText,    setPdfText]    = useState("");
  const [subject,    setSubject]    = useState("General");
  const timerRef = useRef(null);

  // Load analyzed PDFs
  useEffect(() => {
    fetch(`http://localhost:5000/api/pdf/list/${user.id}`)
      .then(r => r.json())
      .then(d => {
        const analyzed = (d.pdfs || []).filter(p => p.status === "analyzed");
        setPdfs(analyzed);
        if (analyzed.length > 0) setSelectedId(analyzed[0].id);
      }).catch(() => {});
  }, [user.id]);

  // Timer
  useEffect(() => {
    if (phase !== "quiz" || revealed) return;
    if (time <= 0) { handleReveal(true); return; }
    timerRef.current = setTimeout(() => setTime(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  });

  const startQuiz = async () => {
    if (!selectedId) return setError("Please select a PDF first.");
    setLoading(true); setError("");

    try {
      // Fetch PDF text via backend
      const res  = await fetch(`http://localhost:5000/api/analysis/full/${selectedId}`);
      const data = await res.json();

      const text = data.stored_topics?.map(t => t.topic).join(", ") || "";
      const subj = data.subject || "General";
      setPdfText(text);
      setSubject(subj);

      // Get full text from analysis summary
      const fullText = `${data.summary || ""} ${data.stored_topics?.map(t => t.topic + " " + (t.unit||"")).join(". ") || ""}`;

      // Generate MCQs via Groq
      const qs = await generateQuizQuestions(fullText + " " + text, subj, qCount);

      if (!qs || qs.length === 0) throw new Error("No questions generated. Try again.");

      setQuestions(qs);
      setIdx(0);
      setAnswers([]);
      setSelected(null);
      setRevealed(false);
      setTime(TIMER_DEFAULT);
      setPhase("quiz");
    } catch (err) {
      setError(err.message || "Failed to generate quiz. Check your Groq API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (i) => {
    if (revealed) return;
    setSelected(i);
  };

  const handleReveal = (timedOut = false) => {
    if (revealed) return;
    const q       = questions[idx];
    const correct = (timedOut ? -1 : selected) === q.correct;
    setRevealed(true);
    setAnswers(a => [...a, {
      q:        q.question,
      selected: timedOut ? -1 : selected,
      correct,
      ans:      q.correct,
      topic:    q.topic,
    }]);
  };

  const handleNext = () => {
    if (idx + 1 >= questions.length) {
      finishQuiz();
      return;
    }
    setIdx(i => i + 1);
    setSelected(null);
    setRevealed(false);
    setTime(TIMER_DEFAULT);
  };

  const finishQuiz = async () => {
    const correct = answers.filter(a => a.correct).length;
    setPhase("result");
    await saveResult(user.id, correct, answers.length, subject);
  };

  const resetQuiz = () => {
    setPhase("start");
    setQuestions([]);
    setIdx(0);
    setAnswers([]);
    setSelected(null);
    setRevealed(false);
    setError("");
  };

  const q = questions[idx];

  // ── RENDER: Start screen ────────────────────────────────────────────────────
  if (phase === "start") return (
    <>
      <style>{CSS}</style>
      <div className="qz-wrap qz-fade">
        <div className="qz-start">
          <div className="qz-emoji">🎯</div>
          <h2 className="qz-title">Quiz Mode</h2>
          <p className="qz-sub">
            AI generates real MCQs from your uploaded exam papers.<br />
            Questions are tailored to your PDF content.
          </p>

          {error && <div className="error-box">⚠️ {error}</div>}

          {pdfs.length === 0 ? (
            <div className="empty-box">
              <div style={{ fontSize:36, marginBottom:8 }}>📂</div>
              <div>No analyzed PDFs found.</div>
              <div style={{ fontSize:12, marginTop:4 }}>Go to PDF Upload → analyze a question paper first.</div>
            </div>
          ) : (
            <>
              {/* PDF Selection */}
              <div style={{ textAlign:"left", marginBottom:16 }}>
                <div style={{ fontSize:12, color:"var(--text3)", marginBottom:8, fontWeight:600 }}>
                  SELECT EXAM PAPER
                </div>
                <div className="qz-pdf-grid">
                  {pdfs.map(p => (
                    <div key={p.id}
                      className={`qz-pdf-card ${selectedId === p.id ? "selected" : ""}`}
                      onClick={() => setSelectedId(p.id)}>
                      <div className="qz-pdf-name">📄 {p.original_name}</div>
                      <div className="qz-pdf-sub">{p.word_count} words · {p.page_count} pages</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="qz-settings">
                <div className="qz-setting">
                  <div className="qz-setting-label">QUESTIONS</div>
                  <select value={qCount} onChange={e => setQCount(+e.target.value)}>
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                  </select>
                </div>
                <div className="qz-setting">
                  <div className="qz-setting-label">TIMER</div>
                  <div className="qz-setting-val" style={{ color:"var(--purple)" }}>30s</div>
                </div>
                <div className="qz-setting">
                  <div className="qz-setting-label">PASS MARK</div>
                  <div className="qz-setting-val" style={{ color:"var(--teal)" }}>70%</div>
                </div>
              </div>

              <button className="btn btn-primary"
                style={{ width:"100%", justifyContent:"center", height:50, fontSize:16 }}
                onClick={startQuiz} disabled={loading || !selectedId}>
                {loading ? (
                  <><span style={{ width:18, height:18, border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid #fff", borderRadius:"50%", animation:"spin 1s linear infinite", display:"inline-block" }} /> Generating Questions...</>
                ) : "🚀 Start Quiz"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );

  // ── RENDER: Loading ─────────────────────────────────────────────────────────
  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="qz-wrap">
        <div className="qz-loading">
          <div className="qz-spinner" />
          <div className="qz-loading-text">Generating Quiz Questions</div>
          <div className="qz-loading-sub">AI is analyzing your exam paper...</div>
        </div>
      </div>
    </>
  );

  // ── RENDER: Result ──────────────────────────────────────────────────────────
  if (phase === "result") {
    const correct = answers.filter(a => a.correct).length;
    const pct     = Math.round((correct / answers.length) * 100);
    const passed  = pct >= 70;
    const color   = pct >= 80 ? "var(--teal)" : pct >= 60 ? "var(--gold)" : "var(--danger)";

    return (
      <>
        <style>{CSS}</style>
        <div className="qz-wrap qz-fade">
          <div className="qz-result">
            <div style={{ fontSize:48, marginBottom:12 }}>{passed ? "🎉" : "💪"}</div>
            <h2 style={{ fontSize:24, fontWeight:800, marginBottom:4 }}>
              {passed ? "Excellent work!" : "Keep practicing!"}
            </h2>
            <p style={{ color:"var(--text3)", marginBottom:24, fontSize:14 }}>
              {subject} · {answers.length} questions · Result saved
            </p>

            {/* Score circle */}
            <div className="qz-score-circle"
              style={{ background:`conic-gradient(${color} ${pct}%, var(--card2) 0)` }}>
              <div className="qz-score-inner">
                <div className="qz-score-num" style={{ color }}>{pct}%</div>
                <div className="qz-score-label">Score</div>
              </div>
            </div>

            {/* Stats */}
            <div className="qz-result-grid">
              {[
                ["✅ Correct",  correct,                     "var(--teal)"],
                ["❌ Wrong",    answers.length - correct,     "var(--danger)"],
                ["📝 Total",    answers.length,               "var(--purple)"],
                ["⭐ Points",   correct * 10,                 "var(--gold)"],
              ].map(([l, v, c]) => (
                <div key={l} className="qz-result-stat">
                  <div className="qz-result-stat-val" style={{ color:c }}>{v}</div>
                  <div className="qz-result-stat-label">{l}</div>
                </div>
              ))}
            </div>

            {/* Answer review */}
            <div className="qz-review">
              <div style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>Answer Review</div>
              {answers.map((a, i) => (
                <div key={i} className="qz-review-item">
                  <span className="qz-review-icon">{a.correct ? "✅" : "❌"}</span>
                  <div className="qz-review-q">
                    <div style={{ marginBottom:2 }}>{a.q}</div>
                    {a.topic && <span style={{ fontSize:11, color:"var(--text3)" }}>{a.topic}</span>}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              <button className="btn btn-outline" style={{ flex:1, justifyContent:"center" }} onClick={resetQuiz}>
                ← New Quiz
              </button>
              <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }} onClick={startQuiz}>
                🔄 Retry
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── RENDER: Quiz ────────────────────────────────────────────────────────────
  if (!q) return null;
  const diffColor = q.difficulty === "Easy" ? "var(--teal)" : q.difficulty === "Medium" ? "var(--gold)" : "var(--danger)";

  return (
    <>
      <style>{CSS}</style>
      <div className="qz-wrap qz-fade">
        {/* Header */}
        <div className="qz-header">
          <span className="qz-qnum">{idx + 1} / {questions.length}</span>
          <div className="qz-progress-track">
            <div className="qz-progress-fill" style={{ width:`${((idx + 1) / questions.length) * 100}%` }} />
          </div>
          <div className={`qz-timer ${time <= 10 ? "danger" : time <= 20 ? "warn" : ""}`}>
            ⏱ {String(time).padStart(2, "0")}s
          </div>
          <button className="btn btn-outline" style={{ padding:"6px 12px", fontSize:12 }} onClick={resetQuiz}>
            ✕ Exit
          </button>
        </div>

        {/* Question card */}
        <div className="qz-card">
          <div className="qz-q-meta">
            <span className="badge" style={{ background:"rgba(124,92,252,0.1)", color:"var(--purple)", border:"1px solid rgba(124,92,252,0.2)" }}>
              {q.topic || subject}
            </span>
            <span className="badge" style={{ background:`${diffColor}18`, color:diffColor, border:`1px solid ${diffColor}33` }}>
              {q.difficulty}
            </span>
          </div>

          <div className="qz-q-text">{q.question}</div>

          {/* Options */}
          {q.options.map((opt, i) => {
            let cls = "";
            if (revealed) {
              if (i === q.correct)                      cls = "correct";
              else if (i === selected && i !== q.correct) cls = "wrong";
            } else if (selected === i) {
              cls = "selected";
            }

            return (
              <div key={i} className={`qz-opt ${cls} ${revealed ? "disabled" : ""}`}
                onClick={() => handleSelect(i)}>
                <span className="qz-opt-letter">{String.fromCharCode(65 + i)}</span>
                {opt}
                {revealed && i === q.correct && <span style={{ marginLeft:"auto" }}>✅</span>}
                {revealed && i === selected && i !== q.correct && <span style={{ marginLeft:"auto" }}>❌</span>}
              </div>
            );
          })}

          {/* Explanation */}
          {revealed && q.explanation && (
            <div className="qz-explanation">
              <strong>Explanation: </strong>{q.explanation}
            </div>
          )}

          {/* Actions */}
          <div className="qz-actions">
            {!revealed ? (
              <button className="btn btn-primary" onClick={() => handleReveal(false)}
                disabled={selected === null}>
                Show Answer
              </button>
            ) : (
              <button className="btn btn-teal" onClick={handleNext}>
                {idx + 1 < questions.length ? "Next Question →" : "See Results 🏆"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
