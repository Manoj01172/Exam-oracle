import { useState, useEffect, useRef } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
  .sf-wrap { padding:24px; font-family:'Sora',sans-serif; max-width:1000px; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .sf-fade { animation:fadeIn 0.25s ease; }
  .sf-search-wrap { position:relative; margin-bottom:20px; }
  .sf-search-input { width:100%; padding:16px 20px 16px 52px; background:var(--card); border:2px solid var(--border); border-radius:16px; color:var(--text); font-size:16px; font-family:'Sora',sans-serif; outline:none; transition:border 0.2s; }
  .sf-search-input:focus { border-color:var(--purple); box-shadow:0 0 0 4px rgba(124,92,252,0.08); }
  .sf-search-input::placeholder { color:var(--text3); }
  .sf-search-icon { position:absolute; left:18px; top:50%; transform:translateY(-50%); color:var(--text3); }
  .sf-search-clear { position:absolute; right:16px; top:50%; transform:translateY(-50%); cursor:pointer; color:var(--text3); width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:var(--card2); border:1px solid var(--border); font-size:13px; transition:all 0.2s; }
  .sf-search-clear:hover { color:var(--text); border-color:var(--purple); }
  .sf-search-count { position:absolute; right:52px; top:50%; transform:translateY(-50%); font-size:12px; color:var(--text3); font-family:'JetBrains Mono',monospace; }
  .sf-filters { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; align-items:center; }
  .sf-filter-label { font-size:12px; color:var(--text3); font-weight:600; }
  .sf-chip { padding:6px 14px; border-radius:20px; border:1.5px solid var(--border2); font-size:12px; font-weight:600; cursor:pointer; transition:all 0.2s; color:var(--text2); background:var(--card2); white-space:nowrap; }
  .sf-chip:hover { border-color:var(--purple); color:var(--purple); }
  .sf-chip.active { border-color:var(--purple); background:rgba(124,92,252,0.1); color:var(--purple); }
  .sf-chip.imp-high { border-color:rgba(239,68,68,0.4); color:var(--danger); background:rgba(239,68,68,0.06); }
  .sf-chip.imp-high.active { background:rgba(239,68,68,0.15); }
  .sf-chip.imp-med { border-color:rgba(245,158,11,0.4); color:var(--gold); background:rgba(245,158,11,0.06); }
  .sf-chip.imp-med.active { background:rgba(245,158,11,0.15); }
  .sf-divider { width:1px; height:24px; background:var(--border); margin:0 4px; }
  .sf-tabs { display:flex; gap:6px; margin-bottom:20px; flex-wrap:wrap; }
  .sf-tab { padding:8px 16px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s; color:var(--text2); background:var(--card2); border:1px solid var(--border); display:flex; align-items:center; gap:6px; }
  .sf-tab:hover { color:var(--text); }
  .sf-tab.active { background:rgba(124,92,252,0.1); color:var(--purple); border-color:rgba(124,92,252,0.3); }
  .sf-tab-count { font-size:10px; padding:1px 7px; border-radius:20px; background:rgba(124,92,252,0.15); color:var(--purple); font-weight:700; }
  .sf-result-item { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px 18px; margin-bottom:10px; cursor:pointer; transition:all 0.2s; }
  .sf-result-item:hover { border-color:var(--purple); transform:translateX(3px); box-shadow:0 4px 16px rgba(124,92,252,0.08); }
  .sf-result-header { display:flex; align-items:flex-start; gap:12px; margin-bottom:8px; }
  .sf-result-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
  .sf-result-title { font-size:14px; font-weight:600; line-height:1.4; flex:1; }
  .sf-result-title mark { background:rgba(124,92,252,0.2); color:var(--purple); border-radius:3px; padding:0 2px; }
  .sf-result-meta { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
  .sf-result-source { font-size:11px; color:var(--text3); }
  .sf-result-snippet { font-size:12.5px; color:var(--text2); margin-top:8px; line-height:1.6; }
  .sf-result-snippet mark { background:rgba(124,92,252,0.15); color:var(--purple); border-radius:2px; padding:0 2px; }
  .sf-nav-hint { font-size:10px; color:var(--purple); margin-left:auto; opacity:0.7; }
  .badge { display:inline-flex; align-items:center; padding:2px 8px; border-radius:20px; font-size:11px; font-weight:700; }
  .sf-prob { font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:700; }
  .sf-empty { text-align:center; padding:60px 20px; color:var(--text3); }
  .sf-empty-icon { font-size:48px; margin-bottom:12px; }
  .sf-suggestions { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; margin-top:16px; }
  .sf-suggestion { padding:6px 14px; border-radius:20px; background:var(--card2); border:1px solid var(--border); font-size:12px; cursor:pointer; color:var(--text2); transition:all 0.2s; }
  .sf-suggestion:hover { border-color:var(--purple); color:var(--purple); }
  .sf-stats-row { display:flex; gap:20px; margin-bottom:16px; flex-wrap:wrap; }
  .sf-stat { font-size:12px; color:var(--text3); }
  .sf-stat strong { color:var(--text); }
  .sf-section-header { font-size:13px; font-weight:700; color:var(--text3); margin-bottom:10px; text-transform:uppercase; letter-spacing:0.8px; }
`;

function highlight(text, query) {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts   = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map(p =>
    p.toLowerCase() === query.toLowerCase() ? `<mark>${p}</mark>` : p
  ).join("");
}

export default function SearchFilter({ user, onNavigate }) {
  const [query,      setQuery]      = useState("");
  const [activeTab,  setActiveTab]  = useState("all");
  const [impFilter,  setImpFilter]  = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");
  const [diffFilter, setDiffFilter] = useState("all");
  const [allData,    setAllData]    = useState({ topics:[], questions:[], pdfs:[], notes:[] });
  const [loading,    setLoading]    = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const topicsRes  = await fetch("http://localhost:5000/api/analysis/topics/all");
        const topicsData = await topicsRes.json();
        const pdfsRes    = await fetch(`http://localhost:5000/api/pdf/list/${user.id}`);
        const pdfsData   = await pdfsRes.json();

        const analyzedPdfs = (pdfsData.pdfs || []).filter(p => p.status === "analyzed");
        const allQuestions = [];
        const allNotes     = [];

        await Promise.all(analyzedPdfs.map(async (pdf) => {
          try {
            const res  = await fetch(`http://localhost:5000/api/analysis/full/${pdf.id}`);
            const data = await res.json();
            (data.predicted_questions || []).forEach(q => {
              allQuestions.push({ ...q, pdf_name: pdf.original_name, pdf_id: pdf.id });
            });
            (data.frequently_asked || []).forEach(q => {
              allQuestions.push({
                question: q.question, topic: q.topic, marks: q.marks,
                importance: "High", probability: 90, answer: "",
                pdf_name: pdf.original_name, pdf_id: pdf.id, type: "frequent",
              });
            });
            (data.stored_topics || []).forEach(t => {
              allNotes.push({ topic: t.topic, unit: t.unit, score: t.tfidf_score, pdf_name: pdf.original_name, pdf_id: pdf.id });
            });
          } catch { /* skip */ }
        }));

        setAllData({ topics: topicsData.topics || [], questions: allQuestions, pdfs: pdfsData.pdfs || [], notes: allNotes });
      } catch { /* ignore */ }
      setLoading(false);
    }
    loadAll();
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [user.id]);

  const allUnits = ["all", ...new Set([
    ...allData.topics.map(t => t.unit || "General").filter(Boolean),
    ...allData.notes.map(t => t.unit || "General").filter(Boolean),
  ])].slice(0, 8);

  const q = query.toLowerCase().trim();

  const filteredTopics    = allData.topics.filter(t => {
    if (q && !t.topic?.toLowerCase().includes(q)) return false;
    if (unitFilter !== "all" && t.unit !== unitFilter) return false;
    return true;
  });
  const filteredQuestions = allData.questions.filter(t => {
    if (q && !t.question?.toLowerCase().includes(q) && !t.topic?.toLowerCase().includes(q)) return false;
    if (impFilter !== "all" && t.importance !== impFilter) return false;
    if (diffFilter !== "all" && t.difficulty !== diffFilter) return false;
    return true;
  });
  const filteredPdfs  = allData.pdfs.filter(t => !q || t.original_name?.toLowerCase().includes(q));
  const filteredNotes = allData.notes.filter(t => {
    if (q && !t.topic?.toLowerCase().includes(q)) return false;
    if (unitFilter !== "all" && t.unit !== unitFilter) return false;
    return true;
  });

  const totalResults = filteredTopics.length + filteredQuestions.length + filteredPdfs.length + filteredNotes.length;
  const tabs = [
    { id:"all",       label:"All",       count: totalResults },
    { id:"questions", label:"Questions", count: filteredQuestions.length },
    { id:"topics",    label:"Topics",    count: filteredTopics.length },
    { id:"notes",     label:"Notes",     count: filteredNotes.length },
    { id:"pdfs",      label:"PDFs",      count: filteredPdfs.length },
  ];

  const showQuestions = activeTab === "all" || activeTab === "questions";
  const showTopics    = activeTab === "all" || activeTab === "topics";
  const showNotes     = activeTab === "all" || activeTab === "notes";
  const showPdfs      = activeTab === "all" || activeTab === "pdfs";
  const impColor = { High:"var(--danger)", Medium:"var(--gold)", Low:"var(--text3)" };

  const nav = (page) => { if (onNavigate) onNavigate(page); };

  return (
    <>
      <style>{CSS}</style>
      <div className="sf-wrap sf-fade">
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:20, fontWeight:800, marginBottom:4 }}>🔍 Search & Filter</div>
          <div style={{ fontSize:13, color:"var(--text3)" }}>Search across topics, questions, notes and PDFs</div>
        </div>

        {/* Search */}
        <div className="sf-search-wrap">
          <svg className="sf-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input ref={inputRef} className="sf-search-input"
            placeholder="Search topics, questions, exam notes..."
            value={query} onChange={e => setQuery(e.target.value)} />
          {query && <>
            <span className="sf-search-count">{totalResults} results</span>
            <div className="sf-search-clear" onClick={() => setQuery("")}>✕</div>
          </>}
        </div>

        {/* Filters */}
        <div className="sf-filters">
          <span className="sf-filter-label">IMPORTANCE:</span>
          {[["all","All"],["High","High 🔴"],["Medium","Medium 🟡"],["Low","Low"]].map(([v,l]) => (
            <div key={v} className={`sf-chip ${impFilter===v?"active":""} ${v==="High"?"imp-high":v==="Medium"?"imp-med":""}`}
              onClick={() => setImpFilter(v)}>{l}</div>
          ))}
          <div className="sf-divider" />
          <span className="sf-filter-label">UNIT:</span>
          {allUnits.map(u => (
            <div key={u} className={`sf-chip ${unitFilter===u?"active":""}`}
              onClick={() => setUnitFilter(u)}>{u==="all"?"All Units":u}</div>
          ))}
          <div className="sf-divider" />
          <span className="sf-filter-label">DIFFICULTY:</span>
          {[["all","All"],["Easy","Easy"],["Medium","Medium"],["Hard","Hard"]].map(([v,l]) => (
            <div key={v} className={`sf-chip ${diffFilter===v?"active":""}`}
              onClick={() => setDiffFilter(v)}>{l}</div>
          ))}
        </div>

        {/* Tabs */}
        <div className="sf-tabs">
          {tabs.map(t => (
            <div key={t.id} className={`sf-tab ${activeTab===t.id?"active":""}`} onClick={() => setActiveTab(t.id)}>
              {t.label}<span className="sf-tab-count">{t.count}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        {!loading && (
          <div className="sf-stats-row">
            <span className="sf-stat"><strong>{allData.pdfs.length}</strong> PDFs</span>
            <span className="sf-stat"><strong>{allData.questions.length}</strong> Questions</span>
            <span className="sf-stat"><strong>{allData.topics.length}</strong> Topics</span>
            <span className="sf-stat"><strong>{allData.notes.length}</strong> Notes</span>
          </div>
        )}

        {loading && (
          <div className="sf-empty">
            <div style={{ width:36,height:36,border:"3px solid rgba(124,92,252,0.2)",borderTopColor:"var(--purple)",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 16px" }} />
            Loading data...
          </div>
        )}

        {!loading && totalResults === 0 && (
          <div className="sf-empty">
            <div className="sf-empty-icon">{query?"🔍":"✨"}</div>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>
              {query ? `No results for "${query}"` : "Start searching"}
            </div>
            <div style={{ fontSize:13 }}>
              {query ? "Try different keywords or remove filters" : "Type anything to search across your exam papers"}
            </div>
            {!query && (
              <div className="sf-suggestions">
                {["machine learning","data acquisition","HRM","performance appraisal","NoSQL","training"].map(s => (
                  <div key={s} className="sf-suggestion" onClick={() => setQuery(s)}>🔍 {s}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* QUESTIONS */}
        {showQuestions && filteredQuestions.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div className="sf-section-header">🔮 Predicted Questions ({filteredQuestions.length})</div>
            {filteredQuestions.slice(0, activeTab==="questions"?50:5).map((item, i) => (
              <div key={i} className="sf-result-item" onClick={() => nav("analysis")}>
                <div className="sf-result-header">
                  <div className="sf-result-icon" style={{ background:"rgba(124,92,252,0.1)" }}>🔮</div>
                  <div style={{ flex:1 }}>
                    <div className="sf-result-title" dangerouslySetInnerHTML={{ __html: highlight(item.question, query) }} />
                    <div className="sf-result-meta" style={{ marginTop:6 }}>
                      {item.importance && <span className="badge" style={{ background:`${impColor[item.importance]||"var(--text3)"}18`, color:impColor[item.importance]||"var(--text3)", border:`1px solid ${impColor[item.importance]||"var(--text3)"}33` }}>{item.importance}</span>}
                      {item.marks && <span className="badge" style={{ background:"rgba(124,92,252,0.08)", color:"var(--purple)", border:"1px solid rgba(124,92,252,0.2)" }}>{item.marks} marks</span>}
                      {item.topic && <span className="badge" style={{ background:"var(--card2)", color:"var(--text3)", border:"1px solid var(--border)" }}>{item.topic}</span>}
                      {item.probability && <span className="sf-prob" style={{ color:item.probability>=70?"var(--teal)":item.probability>=45?"var(--gold)":"var(--orange)" }}>{item.probability}% likely</span>}
                      <span className="sf-result-source">📄 {item.pdf_name}</span>
                      <span className="sf-nav-hint">→ Open Analysis</span>
                    </div>
                  </div>
                </div>
                {item.answer && <div className="sf-result-snippet" dangerouslySetInnerHTML={{ __html: highlight(item.answer.slice(0,200)+(item.answer.length>200?"...":""), query) }} />}
              </div>
            ))}
            {activeTab !== "questions" && filteredQuestions.length > 5 && (
              <div style={{ textAlign:"center", marginTop:8 }}>
                <span style={{ fontSize:12, color:"var(--purple)", cursor:"pointer", fontWeight:600 }} onClick={() => setActiveTab("questions")}>
                  View all {filteredQuestions.length} questions →
                </span>
              </div>
            )}
          </div>
        )}

        {/* TOPICS */}
        {showTopics && filteredTopics.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div className="sf-section-header">🏷️ Topics ({filteredTopics.length})</div>
            {filteredTopics.slice(0, activeTab==="topics"?50:6).map((item, i) => {
              const prob  = Math.min(Math.round((item.avg_score||0)*100), 99);
              const color = prob>=70?"var(--teal)":prob>=45?"var(--gold)":"var(--orange)";
              return (
                <div key={i} className="sf-result-item" onClick={() => nav("analysis")}>
                  <div className="sf-result-header">
                    <div className="sf-result-icon" style={{ background:"rgba(0,212,170,0.1)" }}>🏷️</div>
                    <div style={{ flex:1 }}>
                      <div className="sf-result-title" dangerouslySetInnerHTML={{ __html: highlight(item.topic, query) }} />
                      <div className="sf-result-meta" style={{ marginTop:6 }}>
                        <span className="sf-prob" style={{ color }}>Probability: {prob}%</span>
                        <span className="badge" style={{ background:"var(--card2)", color:"var(--text3)", border:"1px solid var(--border)" }}>{item.pdf_count} PDF{item.pdf_count!==1?"s":""}</span>
                        <span className="badge" style={{ background:"var(--card2)", color:"var(--text3)", border:"1px solid var(--border)" }}>{item.total_frequency}× found</span>
                        <span className="sf-nav-hint">→ Open Analysis</span>
                      </div>
                    </div>
                    <div style={{ width:60, height:6, background:"var(--card2)", borderRadius:3, overflow:"hidden", alignSelf:"center" }}>
                      <div style={{ width:`${prob}%`, height:"100%", background:color, borderRadius:3 }} />
                    </div>
                  </div>
                </div>
              );
            })}
            {activeTab !== "topics" && filteredTopics.length > 6 && (
              <div style={{ textAlign:"center", marginTop:8 }}>
                <span style={{ fontSize:12, color:"var(--purple)", cursor:"pointer", fontWeight:600 }} onClick={() => setActiveTab("topics")}>
                  View all {filteredTopics.length} topics →
                </span>
              </div>
            )}
          </div>
        )}

        {/* NOTES */}
        {showNotes && filteredNotes.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div className="sf-section-header">📄 Notes ({filteredNotes.length})</div>
            {filteredNotes.slice(0, activeTab==="notes"?50:5).map((item, i) => (
              <div key={i} className="sf-result-item" onClick={() => nav("notes")}>
                <div className="sf-result-header">
                  <div className="sf-result-icon" style={{ background:"rgba(255,107,53,0.1)" }}>📄</div>
                  <div style={{ flex:1 }}>
                    <div className="sf-result-title" dangerouslySetInnerHTML={{ __html: highlight(item.topic, query) }} />
                    <div className="sf-result-meta" style={{ marginTop:6 }}>
                      <span className="badge" style={{ background:"rgba(255,107,53,0.08)", color:"var(--orange)", border:"1px solid rgba(255,107,53,0.2)" }}>{item.unit||"General"}</span>
                      <span className="sf-result-source">📄 {item.pdf_name}</span>
                      <span className="sf-nav-hint">→ Open Smart Notes</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PDFs */}
        {showPdfs && filteredPdfs.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div className="sf-section-header">📂 PDFs ({filteredPdfs.length})</div>
            {filteredPdfs.map((item, i) => (
              <div key={i} className="sf-result-item" onClick={() => nav("upload")}>
                <div className="sf-result-header">
                  <div className="sf-result-icon" style={{ background:"rgba(245,158,11,0.1)" }}>📂</div>
                  <div style={{ flex:1 }}>
                    <div className="sf-result-title" dangerouslySetInnerHTML={{ __html: highlight(item.original_name, query) }} />
                    <div className="sf-result-meta" style={{ marginTop:6 }}>
                      <span className="badge" style={{
                        background: item.status==="analyzed"?"rgba(0,212,170,0.1)":"rgba(239,68,68,0.1)",
                        color:      item.status==="analyzed"?"var(--teal)":"var(--danger)",
                        border:     `1px solid ${item.status==="analyzed"?"rgba(0,212,170,0.2)":"rgba(239,68,68,0.2)"}`,
                      }}>{item.status}</span>
                      <span style={{ fontSize:12, color:"var(--text3)" }}>{item.file_size_kb} KB · {item.page_count} pages · {item.word_count} words</span>
                      <span className="sf-nav-hint">→ Open PDF Upload</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
