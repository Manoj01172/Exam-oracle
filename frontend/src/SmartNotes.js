import { useState, useEffect } from "react";
import { pdfAPI } from "./services/api";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
  .notes-wrap { padding:24px; font-family:'Sora',sans-serif; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .notes-fade { animation:fadeIn 0.3s ease; }

  /* HEADER */
  .notes-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:12px; }
  .notes-title { font-size:20px; font-weight:800; }
  .notes-sub { font-size:13px; color:var(--text3); margin-top:3px; }
  .notes-actions { display:flex; gap:8px; flex-wrap:wrap; }

  /* PDF SELECTOR */
  .notes-pdf-row { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; align-items:center; }
  .notes-pdf-chip { padding:8px 16px; border-radius:10px; border:1.5px solid var(--border2); font-size:13px; font-weight:500; cursor:pointer; transition:all 0.2s; color:var(--text2); background:var(--card2); }
  .notes-pdf-chip:hover { border-color:var(--purple); color:var(--purple); }
  .notes-pdf-chip.active { border-color:var(--purple); background:rgba(124,92,252,0.1); color:var(--purple); }

  /* NOTES CONTENT */
  .notes-grid { display:grid; grid-template-columns:280px 1fr; gap:20px; }
  .notes-sidebar { position:sticky; top:80px; height:fit-content; }
  .notes-toc { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:16px; }
  .notes-toc-title { font-size:12px; font-weight:700; color:var(--text3); text-transform:uppercase; letter-spacing:1px; margin-bottom:12px; }
  .notes-toc-item { display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:8px; cursor:pointer; font-size:13px; font-weight:500; color:var(--text2); transition:all 0.2s; margin-bottom:2px; }
  .notes-toc-item:hover { background:var(--card2); color:var(--text); }
  .notes-toc-item.active { background:rgba(124,92,252,0.1); color:var(--purple); }
  .notes-toc-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }

  /* NOTE CARDS */
  .note-unit-card { background:var(--card); border:1px solid var(--border); border-radius:16px; padding:24px; margin-bottom:16px; position:relative; overflow:hidden; }
  .note-unit-card::before { content:''; position:absolute; left:0; top:0; bottom:0; width:4px; border-radius:4px 0 0 4px; }
  .note-unit-title { font-size:17px; font-weight:800; margin-bottom:6px; }
  .note-unit-sub { font-size:12px; color:var(--text3); margin-bottom:16px; }
  .note-section { margin-bottom:16px; }
  .note-section-title { font-size:13px; font-weight:700; margin-bottom:10px; display:flex; align-items:center; gap:6px; }
  .note-bullet { display:flex; gap:8px; align-items:flex-start; margin-bottom:8px; font-size:13.5px; line-height:1.7; color:var(--text2); }
  .note-bullet-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; margin-top:8px; }
  .note-definition { background:var(--card2); border:1px solid var(--border); border-radius:10px; padding:12px 14px; margin-bottom:8px; }
  .note-def-term { font-size:13px; font-weight:700; margin-bottom:4px; }
  .note-def-meaning { font-size:12.5px; color:var(--text2); line-height:1.6; }
  .note-formula { background:rgba(124,92,252,0.06); border:1px solid rgba(124,92,252,0.2); border-radius:10px; padding:12px 14px; margin-bottom:8px; font-family:'JetBrains Mono',monospace; font-size:13px; color:var(--purple); }
  .note-important { background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.2); border-radius:10px; padding:12px 14px; margin-bottom:8px; font-size:13px; color:var(--danger); font-weight:600; }
  .note-tag { display:inline-flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; margin-right:6px; margin-bottom:6px; }

  /* BUTTONS */
  .btn { display:inline-flex; align-items:center; gap:8px; padding:10px 18px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; border:none; font-family:'Sora',sans-serif; transition:all 0.2s; }
  .btn:disabled { opacity:0.5; cursor:not-allowed; }
  .btn-primary { background:linear-gradient(135deg,var(--purple),var(--purple2)); color:#fff; box-shadow:0 4px 14px rgba(124,92,252,0.25); }
  .btn-primary:hover:not(:disabled) { transform:translateY(-1px); }
  .btn-teal { background:linear-gradient(135deg,var(--teal),#00a888); color:#000; font-weight:700; }
  .btn-outline { background:transparent; border:1.5px solid var(--border2); color:var(--text2); }
  .btn-outline:hover { border-color:var(--purple); color:var(--purple); }

  /* LOADING */
  .notes-loading { text-align:center; padding:60px; color:var(--text3); }
  .spin { animation:spin 1s linear infinite; display:inline-block; width:32px; height:32px; border:3px solid rgba(124,92,252,0.2); border-top-color:var(--purple); border-radius:50%; }
  @keyframes spin { to{transform:rotate(360deg)} }
  .empty-box { text-align:center; padding:48px; color:var(--text3); }
  .error-box { padding:14px; border-radius:12px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); color:var(--danger); font-size:13px; margin-bottom:16px; }
  .success-box { padding:14px; border-radius:12px; background:rgba(0,212,170,0.08); border:1px solid rgba(0,212,170,0.2); color:var(--teal); font-size:13px; margin-bottom:16px; }

  /* PRINT STYLES */
  @media print {
    .notes-sidebar, .notes-actions, .notes-pdf-row, .notes-header .btn { display:none !important; }
    .notes-grid { grid-template-columns:1fr !important; }
    .note-unit-card { break-inside:avoid; box-shadow:none; border:1px solid #ddd; }
    body { background:#fff !important; color:#000 !important; }
  }

  @media(max-width:900px) { .notes-grid{grid-template-columns:1fr;} .notes-sidebar{position:static;} }
  @media(max-width:600px) { .notes-wrap{padding:16px;} }
`;

const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;
const GROQ_URL = process.env.REACT_APP_GROQ_URL;

const UNIT_COLORS = [
  "var(--purple)", "var(--teal)", "var(--orange)",
  "var(--gold)",   "var(--danger)", "#3b82f6",
];

// ── Generate Notes via Groq ───────────────────────────────────────────────────
async function generateNotes(pdfText, subject) {
  const prompt = `You are an expert study notes creator. Create comprehensive, well-structured study notes from this exam paper.

EXAM PAPER TEXT:
${pdfText.slice(0, 4000)}

Return ONLY valid JSON, no markdown:
{
  "subject": "${subject}",
  "overview": "Brief overview of the entire subject in 2-3 sentences",
  "units": [
    {
      "unit": "Unit 1",
      "title": "Unit title",
      "color_hint": "purple",
      "key_points": [
        "Important point 1 — detailed explanation",
        "Important point 2 — detailed explanation"
      ],
      "definitions": [
        { "term": "Term name", "meaning": "Clear definition of the term" }
      ],
      "important_notes": [
        "Critical exam tip or frequently asked point"
      ],
      "formulas_or_steps": [
        "Formula or step-by-step process if applicable"
      ],
      "exam_tips": [
        "Specific tip for answering exam questions on this topic"
      ],
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
  ],
  "quick_revision": [
    "One-liner revision point 1",
    "One-liner revision point 2"
  ],
  "most_important_topics": ["Topic 1", "Topic 2", "Topic 3"]
}

Rules:
- Create 4-6 units based on actual paper content
- key_points: 4-6 detailed points per unit
- definitions: 2-4 key terms per unit
- important_notes: 1-2 critical exam points
- quick_revision: 8-12 one-liner revision points
- All content must come from the actual paper
- Use simple, clear language students can understand`;

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model:       "llama-3.3-70b-versatile",
      messages:    [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens:  4000,
    }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  const raw  = data.choices?.[0]?.message?.content || "{}";
  const clean = raw.replace(/```json|```/g, "").trim();
  const match = clean.match(/\{.*\}/s);
  if (!match) throw new Error("Could not parse notes");
  return JSON.parse(match[0]);
}

// ── Download notes as PDF using browser print ─────────────────────────────────
function downloadAsPDF() {
  window.print();
}

// ── Copy notes as text ────────────────────────────────────────────────────────
function copyAsText(notes) {
  if (!notes) return;
  let text = `${notes.subject} — Study Notes\n${"=".repeat(50)}\n\n`;
  text += `Overview: ${notes.overview}\n\n`;

  notes.units?.forEach(u => {
    text += `${u.unit}: ${u.title}\n${"-".repeat(40)}\n`;
    u.key_points?.forEach(p => { text += `• ${p}\n`; });
    if (u.definitions?.length) {
      text += "\nDefinitions:\n";
      u.definitions.forEach(d => { text += `  ${d.term}: ${d.meaning}\n`; });
    }
    if (u.exam_tips?.length) {
      text += "\nExam Tips:\n";
      u.exam_tips.forEach(t => { text += `  ★ ${t}\n`; });
    }
    text += "\n";
  });

  text += "Quick Revision:\n";
  notes.quick_revision?.forEach((r, i) => { text += `${i+1}. ${r}\n`; });

  navigator.clipboard.writeText(text).catch(() => {});
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SmartNotes({ user }) {
  const [pdfs,       setPdfs]       = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [notes,      setNotes]      = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [copied,     setCopied]     = useState(false);
  const [activeUnit, setActiveUnit] = useState(0);

  useEffect(() => {
    fetch(`http://localhost:5000/api/pdf/list/${user.id}`)
      .then(r => r.json())
      .then(d => {
        const analyzed = (d.pdfs || []).filter(p => p.status === "analyzed");
        setPdfs(analyzed);
        if (analyzed.length > 0) setSelectedId(analyzed[0].id);
      }).catch(() => {});
  }, [user.id]);

  const handleGenerate = async () => {
    if (!selectedId) return;
    setLoading(true); setError(""); setNotes(null);

    try {
      // Get analysis data
      const res  = await fetch(`http://localhost:5000/api/analysis/full/${selectedId}`);
      const data = await res.json();

      const fullText = [
        data.summary || "",
        (data.stored_topics || []).map(t => `${t.topic} ${t.unit || ""}`).join(". "),
        (data.predicted_questions || []).map(q => q.question + " " + (q.answer || "")).join(" "),
      ].join(" ");

      const subject = data.subject || "General";
      const generated = await generateNotes(fullText, subject);
      setNotes(generated);
      setActiveUnit(0);
    } catch (err) {
      setError(err.message || "Failed to generate notes.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    copyAsText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (pdfs.length === 0) return (
    <>
      <style>{CSS}</style>
      <div className="notes-wrap">
        <div className="empty-box">
          <div style={{ fontSize:48, marginBottom:12 }}>📄</div>
          <div style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>No analyzed PDFs</div>
          <div>Go to PDF Upload → analyze a question paper first.</div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="notes-wrap notes-fade">

        {/* Header */}
        <div className="notes-header">
          <div>
            <div className="notes-title">📄 Smart Notes Generator</div>
            <div className="notes-sub">AI-powered notes from your exam papers — unit wise, structured</div>
          </div>
          {notes && (
            <div className="notes-actions">
              <button className="btn btn-outline" onClick={handleCopy}>
                {copied ? "✅ Copied!" : "📋 Copy Text"}
              </button>
              <button className="btn btn-teal" onClick={downloadAsPDF}>
                ⬇️ Download PDF
              </button>
            </div>
          )}
        </div>

        {/* PDF Selector */}
        <div className="notes-pdf-row">
          <span style={{ fontSize:13, color:"var(--text3)", fontWeight:600 }}>PDF:</span>
          {pdfs.map(p => (
            <div key={p.id}
              className={`notes-pdf-chip ${selectedId === p.id ? "active" : ""}`}
              onClick={() => { setSelectedId(p.id); setNotes(null); }}>
              📄 {p.original_name}
            </div>
          ))}
          <button className="btn btn-primary" onClick={handleGenerate} disabled={loading || !selectedId}>
            {loading
              ? <><span style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid #fff", borderRadius:"50%", animation:"spin 1s linear infinite", display:"inline-block" }} /> Generating...</>
              : "✨ Generate Notes"
            }
          </button>
        </div>

        {error   && <div className="error-box">⚠️ {error}</div>}

        {/* Loading */}
        {loading && (
          <div className="notes-loading">
            <div className="spin" style={{ marginBottom:16 }} />
            <div style={{ fontSize:16, fontWeight:600, marginBottom:6 }}>Generating Smart Notes</div>
            <div style={{ fontSize:13, color:"var(--text3)" }}>AI is creating structured notes from your exam paper...</div>
          </div>
        )}

        {/* Notes Content */}
        {notes && !loading && (
          <div id="notes-content">

            {/* Overview Banner */}
            <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, padding:"18px 20px", marginBottom:20, borderLeft:"4px solid var(--purple)" }}>
              <div style={{ fontSize:16, fontWeight:800, marginBottom:6 }}>
                📚 {notes.subject}
              </div>
              <div style={{ fontSize:13.5, color:"var(--text2)", lineHeight:1.7 }}>{notes.overview}</div>
              {notes.most_important_topics?.length > 0 && (
                <div style={{ marginTop:12, display:"flex", gap:6, flexWrap:"wrap" }}>
                  <span style={{ fontSize:11, color:"var(--text3)", marginRight:4 }}>Most important:</span>
                  {notes.most_important_topics.map((t, i) => (
                    <span key={i} className="note-tag" style={{ background:"rgba(239,68,68,0.08)", color:"var(--danger)", border:"1px solid rgba(239,68,68,0.2)" }}>
                      🔥 {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="notes-grid">
              {/* Sidebar TOC */}
              <div className="notes-sidebar">
                <div className="notes-toc">
                  <div className="notes-toc-title">Contents</div>
                  {notes.units?.map((u, i) => (
                    <div key={i}
                      className={`notes-toc-item ${activeUnit === i ? "active" : ""}`}
                      onClick={() => {
                        setActiveUnit(i);
                        document.getElementById(`unit-${i}`)?.scrollIntoView({ behavior:"smooth", block:"start" });
                      }}>
                      <div className="notes-toc-dot" style={{ background: UNIT_COLORS[i % UNIT_COLORS.length] }} />
                      <div>
                        <div style={{ fontSize:12, color:"var(--text3)" }}>{u.unit}</div>
                        <div style={{ fontSize:13, fontWeight:600 }}>{u.title}</div>
                      </div>
                    </div>
                  ))}

                  {/* Quick revision */}
                  {notes.quick_revision?.length > 0 && (
                    <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid var(--border)" }}>
                      <div className="notes-toc-title">Quick Revision</div>
                      {notes.quick_revision.map((r, i) => (
                        <div key={i} style={{ fontSize:12, color:"var(--text2)", padding:"5px 4px", borderBottom:"1px solid var(--border)", lineHeight:1.5 }}>
                          {i+1}. {r}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Main content */}
              <div>
                {notes.units?.map((u, i) => {
                  const color = UNIT_COLORS[i % UNIT_COLORS.length];
                  return (
                    <div key={i} id={`unit-${i}`} className="note-unit-card"
                      style={{ "--uc": color }}>
                      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:4, background:color, borderRadius:"4px 0 0 4px" }} />

                      {/* Unit header */}
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
                        <div>
                          <div style={{ fontSize:11, color, fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", marginBottom:4 }}>{u.unit}</div>
                          <div className="note-unit-title">{u.title}</div>
                        </div>
                        <div style={{ display:"flex", gap:4, flexWrap:"wrap", maxWidth:240, justifyContent:"flex-end" }}>
                          {u.keywords?.slice(0,4).map((k, j) => (
                            <span key={j} className="note-tag" style={{ background:`${color}15`, color, border:`1px solid ${color}33` }}>{k}</span>
                          ))}
                        </div>
                      </div>

                      {/* Key Points */}
                      {u.key_points?.length > 0 && (
                        <div className="note-section">
                          <div className="note-section-title" style={{ color }}>
                            📌 Key Points
                          </div>
                          {u.key_points.map((p, j) => (
                            <div key={j} className="note-bullet">
                              <div className="note-bullet-dot" style={{ background:color }} />
                              {p}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Definitions */}
                      {u.definitions?.length > 0 && (
                        <div className="note-section">
                          <div className="note-section-title" style={{ color }}>
                            📖 Key Definitions
                          </div>
                          {u.definitions.map((d, j) => (
                            <div key={j} className="note-definition">
                              <div className="note-def-term" style={{ color }}>{d.term}</div>
                              <div className="note-def-meaning">{d.meaning}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Formulas / Steps */}
                      {u.formulas_or_steps?.length > 0 && (
                        <div className="note-section">
                          <div className="note-section-title" style={{ color }}>
                            🔢 Formulas / Steps
                          </div>
                          {u.formulas_or_steps.map((f, j) => (
                            <div key={j} className="note-formula">{f}</div>
                          ))}
                        </div>
                      )}

                      {/* Important Notes */}
                      {u.important_notes?.length > 0 && (
                        <div className="note-section">
                          <div className="note-section-title" style={{ color:"var(--danger)" }}>
                            ⚠️ Important
                          </div>
                          {u.important_notes.map((n, j) => (
                            <div key={j} className="note-important">{n}</div>
                          ))}
                        </div>
                      )}

                      {/* Exam Tips */}
                      {u.exam_tips?.length > 0 && (
                        <div className="note-section">
                          <div className="note-section-title" style={{ color:"var(--gold)" }}>
                            ⭐ Exam Tips
                          </div>
                          {u.exam_tips.map((t, j) => (
                            <div key={j} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:6, fontSize:13, color:"var(--gold)", background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:8, padding:"8px 12px" }}>
                              <span>★</span>{t}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!notes && !loading && (
          <div className="empty-box">
            <div style={{ fontSize:48, marginBottom:12 }}>✨</div>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>Generate Smart Notes</div>
            <div style={{ fontSize:13, marginBottom:20 }}>Select a PDF and click "Generate Notes" to create AI-powered study notes</div>
            <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
              ✨ Generate Notes
            </button>
          </div>
        )}
      </div>
    </>
  );
}
