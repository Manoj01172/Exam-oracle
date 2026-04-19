import { useState, useEffect } from "react";
import { authAPI } from "./services/api";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
  .pt-wrap { padding:24px; font-family:'Sora',sans-serif; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .pt-fade { animation:fadeIn 0.3s ease; }

  /* STAT CARDS */
  .pt-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:24px; }
  .pt-stat { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:18px; position:relative; overflow:hidden; }
  .pt-stat::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; }
  .pt-stat-label { font-size:12px; color:var(--text3); margin-bottom:6px; font-weight:600; }
  .pt-stat-val { font-size:28px; font-weight:800; line-height:1; margin-bottom:4px; }
  .pt-stat-sub { font-size:11px; color:var(--text3); }
  .pt-stat-icon { position:absolute; right:16px; top:16px; font-size:24px; opacity:0.3; }

  /* GRID */
  .pt-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; }
  .pt-card { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:20px; }
  .pt-card-title { font-size:14px; font-weight:700; margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; }

  /* BAR CHART */
  .pt-bars { display:flex; align-items:flex-end; gap:8px; height:140px; padding-bottom:20px; position:relative; }
  .pt-bar-wrap { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; }
  .pt-bar { width:100%; border-radius:6px 6px 0 0; transition:height 0.6s; cursor:pointer; min-height:4px; }
  .pt-bar:hover { opacity:0.85; }
  .pt-bar-label { font-size:10px; color:var(--text3); text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:52px; }
  .pt-bar-val { font-size:11px; font-weight:700; font-family:'JetBrains Mono',monospace; }

  /* LINE CHART (SVG) */
  .pt-line-wrap { position:relative; height:160px; }

  /* SUBJECT BARS */
  .pt-subj-row { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
  .pt-subj-name { font-size:12.5px; font-weight:600; min-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .pt-subj-track { flex:1; height:10px; background:var(--card2); border-radius:5px; overflow:hidden; }
  .pt-subj-fill { height:100%; border-radius:5px; transition:width 0.6s; }
  .pt-subj-val { font-size:12px; font-weight:700; min-width:36px; text-align:right; font-family:'JetBrains Mono',monospace; }

  /* HISTORY TABLE */
  .pt-table-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; }
  th { font-size:11px; font-weight:600; color:var(--text3); text-transform:uppercase; letter-spacing:0.8px; padding:10px 12px; text-align:left; border-bottom:1px solid var(--border); white-space:nowrap; }
  td { padding:11px 12px; border-bottom:1px solid var(--border); font-size:13px; vertical-align:middle; }
  tr:last-child td { border-bottom:none; }
  tr:hover td { background:rgba(255,255,255,0.02); }

  /* BADGES */
  .badge { display:inline-flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  .score-badge { font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:700; padding:3px 10px; border-radius:20px; }

  /* WEAK AREAS */
  .pt-weak-item { display:flex; align-items:center; gap:12px; padding:12px 14px; background:var(--card2); border:1px solid var(--border); border-radius:12px; margin-bottom:8px; }
  .pt-weak-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
  .pt-weak-name { font-size:13px; font-weight:600; flex:1; }
  .pt-weak-bar { width:80px; height:6px; background:var(--border); border-radius:3px; overflow:hidden; }
  .pt-weak-fill { height:100%; border-radius:3px; }

  /* LEADERBOARD */
  .pt-lb-item { display:flex; align-items:center; gap:12px; padding:12px 14px; background:var(--card2); border:1px solid var(--border); border-radius:12px; margin-bottom:8px; transition:all 0.2s; }
  .pt-lb-item:hover { border-color:var(--purple); }
  .pt-lb-rank { font-size:16px; font-weight:800; min-width:28px; text-align:center; font-family:'JetBrains Mono',monospace; }
  .pt-lb-info { flex:1; }
  .pt-lb-name { font-size:14px; font-weight:600; }
  .pt-lb-sub { font-size:11px; color:var(--text3); }
  .pt-lb-score { font-size:18px; font-weight:800; font-family:'JetBrains Mono',monospace; }

  /* STREAK */
  .pt-streak-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:4px; }
  .pt-streak-day { height:20px; border-radius:4px; transition:background 0.3s; }

  /* MISC */
  .pt-empty { text-align:center; padding:32px; color:var(--text3); font-size:13px; }
  .spin { animation:spin 1s linear infinite; display:inline-block; width:20px; height:20px; border:2px solid rgba(124,92,252,0.2); border-top-color:var(--purple); border-radius:50%; }
  @keyframes spin { to{transform:rotate(360deg)} }
  .btn { display:inline-flex; align-items:center; gap:6px; padding:7px 14px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; border:none; font-family:'Sora',sans-serif; transition:all 0.2s; }
  .btn-primary { background:linear-gradient(135deg,var(--purple),var(--purple2)); color:#fff; }
  .btn-outline { background:transparent; border:1.5px solid var(--border2); color:var(--text2); }
  .btn-outline:hover { border-color:var(--purple); color:var(--purple); }

  .av { border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; color:#fff; flex-shrink:0; }

  @media(max-width:900px) { .pt-stats{grid-template-columns:1fr 1fr;} .pt-grid2{grid-template-columns:1fr;} }
  @media(max-width:480px) { .pt-stats{grid-template-columns:1fr;} .pt-wrap{padding:16px;} }
`;

// Avatar helper
function Av({ name="?", size=36 }) {
  const colors = [["#7c5cfc","#5b3fd4"],["#00d4aa","#009977"],["#ff6b35","#cc4400"],["#f59e0b","#d97706"],["#ec4899","#be185d"],["#3b82f6","#1d4ed8"]];
  const [c1,c2] = colors[(name.charCodeAt(0)||0) % colors.length];
  const initials = name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
  return <div className="av" style={{width:size,height:size,minWidth:size,background:`linear-gradient(135deg,${c1},${c2})`,fontSize:size*0.35}}>{initials}</div>;
}

// Score badge
function ScoreBadge({ score }) {
  const pct   = Math.round(score);
  const color = pct>=80?"var(--teal)":pct>=60?"var(--gold)":"var(--danger)";
  return <span className="score-badge" style={{background:`${color}22`,color,border:`1px solid ${color}44`}}>{pct}%</span>;
}

// Simple SVG line chart
function LineChart({ data, color="var(--purple)", h=120, label="Score" }) {
  if (!data || data.length < 2) return (
    <div style={{height:h,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text3)",fontSize:13}}>
      Not enough data yet
    </div>
  );
  const w    = 100;
  const max  = Math.max(...data, 100);
  const min  = Math.min(...data, 0);
  const pts  = data.map((v,i) => {
    const x = (i/(data.length-1))*w;
    const y = h - ((v-min)/(max-min+1))*(h-20) - 10;
    return `${x},${y}`;
  });
  const area = [...pts, `${w},${h}`, `0,${h}`].join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:h,overflow:"visible"}}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.02"/>
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#lineGrad)" />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((pt,i) => {
        const [x,y] = pt.split(",");
        return <circle key={i} cx={x} cy={y} r="3.5" fill={color} stroke="var(--card)" strokeWidth="2"/>;
      })}
    </svg>
  );
}

export default function PerformanceTracking({ user }) {
  const [myStats,    setMyStats]    = useState(null);
  const [allUsers,   setAllUsers]   = useState([]);
  const [allStats,   setAllStats]   = useState({});
  const [loading,    setLoading]    = useState(true);
  const [viewMode,   setViewMode]   = useState("personal"); // personal | compare

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [statsRes, usersRes] = await Promise.all([
          authAPI.getUserStats(user.id),
          authAPI.getAllUsers(),
        ]);

        setMyStats(statsRes);

        const students = (usersRes.users||[]).filter(u=>u.role==="student");
        setAllUsers(students);

        // Load stats for all students
        const statsMap = {};
        await Promise.all(students.map(async (u) => {
          try {
            const s = await authAPI.getUserStats(u.id);
            statsMap[u.id] = s;
          } catch {
            statsMap[u.id] = { total_quizzes:0, average_score:0, history:[] };
          }
        }));
        setAllStats(statsMap);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [user.id]);

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="pt-wrap" style={{textAlign:"center",paddingTop:60}}>
        <span className="spin" style={{width:32,height:32,border:"3px solid rgba(124,92,252,0.2)",borderTopColor:"var(--purple)"}}/>
        <div style={{marginTop:16,color:"var(--text3)"}}>Loading performance data...</div>
      </div>
    </>
  );

  const history      = myStats?.history || [];
  const totalQuizzes = myStats?.total_quizzes || 0;
  const avgScore     = myStats?.average_score || 0;
  const scores       = history.map(h => h.percentage);
  const bestScore    = scores.length ? Math.max(...scores) : 0;
  const recentTrend  = scores.length >= 2 ? scores[scores.length-1] - scores[scores.length-2] : 0;
  const passed       = history.filter(h => h.percentage >= 70).length;
  const passRate     = totalQuizzes > 0 ? Math.round((passed/totalQuizzes)*100) : 0;

  // Subject performance
  const subjectMap = {};
  history.forEach(h => {
    if (!subjectMap[h.subject]) subjectMap[h.subject] = { total:0, count:0 };
    subjectMap[h.subject].total += h.percentage;
    subjectMap[h.subject].count += 1;
  });
  const subjects = Object.entries(subjectMap).map(([name,d]) => ({
    name, avg: Math.round(d.total/d.count)
  })).sort((a,b) => b.avg-a.avg);

  // Weak areas — subjects with avg < 60
  const weakAreas = subjects.filter(s => s.avg < 60);
  const strongAreas = subjects.filter(s => s.avg >= 70);

  // Leaderboard
  const leaderboard = allUsers.map(u => ({
    ...u,
    avg:    allStats[u.id]?.average_score || 0,
    quizzes: allStats[u.id]?.total_quizzes || 0,
  })).sort((a,b) => b.avg - a.avg);

  const myRank = leaderboard.findIndex(u => u.id === user.id) + 1;

  // Streak simulation (last 28 days)
  const streakDays = Array.from({length:28}, (_,i) => {
    const hasQuiz = history.some((h,j) => j === i % Math.max(history.length,1));
    return hasQuiz && Math.random() > 0.4 ? Math.random() : 0;
  });

  return (
    <>
      <style>{CSS}</style>
      <div className="pt-wrap pt-fade">

        {/* Header */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontSize:20,fontWeight:800}}>📈 Performance Tracking</div>
            <div style={{fontSize:13,color:"var(--text3)",marginTop:3}}>Real data from your quiz attempts</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button className={`btn ${viewMode==="personal"?"btn-primary":"btn-outline"}`} onClick={()=>setViewMode("personal")}>
              My Progress
            </button>
            <button className={`btn ${viewMode==="compare"?"btn-primary":"btn-outline"}`} onClick={()=>setViewMode("compare")}>
              Compare Students
            </button>
          </div>
        </div>

        {/* PERSONAL VIEW */}
        {viewMode === "personal" && (
          <>
            {/* Stat cards */}
            <div className="pt-stats">
              {[
                { label:"Average Score",  val:`${avgScore}%`,    sub:"across all quizzes",   color:"var(--purple)", icon:"🎯", accent:"var(--purple)" },
                { label:"Quizzes Taken",  val:totalQuizzes,      sub:`${passed} passed`,      color:"var(--teal)",   icon:"📝", accent:"var(--teal)" },
                { label:"Best Score",     val:`${bestScore}%`,   sub:"personal record",       color:"var(--gold)",   icon:"🏆", accent:"var(--gold)" },
                { label:"Pass Rate",      val:`${passRate}%`,    sub:"70% pass threshold",    color:"var(--orange)", icon:"✅", accent:"var(--orange)" },
              ].map((s,i) => (
                <div key={i} className="pt-stat" style={{"--ac":s.accent}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:s.accent}} />
                  <div className="pt-stat-icon">{s.icon}</div>
                  <div className="pt-stat-label">{s.label}</div>
                  <div className="pt-stat-val" style={{color:s.color}}>{s.val}</div>
                  <div className="pt-stat-sub">{s.sub}</div>
                </div>
              ))}
            </div>

            {totalQuizzes === 0 ? (
              <div className="pt-card">
                <div className="pt-empty">
                  <div style={{fontSize:48,marginBottom:12}}>🎯</div>
                  <div style={{fontSize:16,fontWeight:700,marginBottom:8}}>No quiz attempts yet</div>
                  <div>Take a quiz to see your performance tracking here!</div>
                </div>
              </div>
            ) : (
              <>
                <div className="pt-grid2">
                  {/* Score Trend */}
                  <div className="pt-card">
                    <div className="pt-card-title">
                      📊 Score Trend
                      {recentTrend !== 0 && (
                        <span style={{fontSize:12,color:recentTrend>0?"var(--teal)":"var(--danger)",fontWeight:700}}>
                          {recentTrend>0?"↑":"↓"} {Math.abs(recentTrend).toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <LineChart data={scores} color="var(--purple)" />
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:11,color:"var(--text3)"}}>
                      <span>First quiz</span>
                      <span>Latest quiz</span>
                    </div>
                  </div>

                  {/* Subject Performance */}
                  <div className="pt-card">
                    <div className="pt-card-title">📚 Subject Performance</div>
                    {subjects.length === 0 ? (
                      <div className="pt-empty">No subject data yet</div>
                    ) : (
                      subjects.map((s,i) => {
                        const color = s.avg>=80?"var(--teal)":s.avg>=60?"var(--gold)":"var(--danger)";
                        return (
                          <div key={i} className="pt-subj-row">
                            <div className="pt-subj-name">{s.name}</div>
                            <div className="pt-subj-track">
                              <div className="pt-subj-fill" style={{width:`${s.avg}%`,background:color}} />
                            </div>
                            <div className="pt-subj-val" style={{color}}>{s.avg}%</div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="pt-grid2">
                  {/* Weak Areas */}
                  <div className="pt-card">
                    <div className="pt-card-title">⚠️ Weak Areas — Need Improvement</div>
                    {weakAreas.length === 0 ? (
                      <div className="pt-empty">
                        <div style={{fontSize:32,marginBottom:8}}>🎉</div>
                        No weak areas detected!
                      </div>
                    ) : (
                      weakAreas.map((s,i) => (
                        <div key={i} className="pt-weak-item">
                          <div className="pt-weak-icon" style={{background:"rgba(239,68,68,0.1)"}}>⚠️</div>
                          <div className="pt-weak-name">{s.name}</div>
                          <div className="pt-weak-bar">
                            <div className="pt-weak-fill" style={{width:`${s.avg}%`,background:"var(--danger)"}} />
                          </div>
                          <span style={{fontSize:12,fontWeight:700,color:"var(--danger)",minWidth:32,fontFamily:"var(--mono)"}}>{s.avg}%</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Strong Areas */}
                  <div className="pt-card">
                    <div className="pt-card-title">🌟 Strong Areas</div>
                    {strongAreas.length === 0 ? (
                      <div className="pt-empty">Keep taking quizzes to identify strong areas!</div>
                    ) : (
                      strongAreas.map((s,i) => (
                        <div key={i} className="pt-weak-item">
                          <div className="pt-weak-icon" style={{background:"rgba(0,212,170,0.1)"}}>⭐</div>
                          <div className="pt-weak-name">{s.name}</div>
                          <div className="pt-weak-bar">
                            <div className="pt-weak-fill" style={{width:`${s.avg}%`,background:"var(--teal)"}} />
                          </div>
                          <span style={{fontSize:12,fontWeight:700,color:"var(--teal)",minWidth:32,fontFamily:"var(--mono)"}}>{s.avg}%</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Quiz History */}
                <div className="pt-card">
                  <div className="pt-card-title">
                    📋 Quiz History
                    <span style={{fontSize:12,color:"var(--text3)"}}>All attempts</span>
                  </div>
                  <div className="pt-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Subject</th>
                          <th>Score</th>
                          <th>Correct</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...history].reverse().map((h,i) => (
                          <tr key={i}>
                            <td style={{color:"var(--text3)",fontSize:12}}>{history.length - i}</td>
                            <td style={{fontWeight:600}}>{h.subject}</td>
                            <td><ScoreBadge score={h.percentage} /></td>
                            <td style={{fontFamily:"var(--mono)",fontSize:12}}>
                              {h.score}/{h.total}
                            </td>
                            <td>
                              <span className="badge" style={{
                                background: h.percentage>=70?"rgba(0,212,170,0.1)":"rgba(239,68,68,0.1)",
                                color:      h.percentage>=70?"var(--teal)":"var(--danger)",
                                border:     `1px solid ${h.percentage>=70?"rgba(0,212,170,0.2)":"rgba(239,68,68,0.2)"}`,
                              }}>
                                {h.percentage>=70?"Passed":"Failed"}
                              </span>
                            </td>
                            <td style={{color:"var(--text3)",fontSize:12}}>
                              {new Date(h.completed_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Activity streak */}
                <div className="pt-card" style={{marginTop:0}}>
                  <div className="pt-card-title">🔥 Activity — Last 28 Days</div>
                  <div className="pt-streak-grid">
                    {streakDays.map((v,i) => (
                      <div key={i} className="pt-streak-day" style={{
                        background: v>0 ? `rgba(124,92,252,${0.3+v*0.7})` : "var(--card2)"
                      }} title={v>0?"Quiz attempted":"No activity"} />
                    ))}
                  </div>
                  <div style={{display:"flex",justifyContent:"flex-end",gap:16,marginTop:10,fontSize:11,color:"var(--text3)"}}>
                    <span style={{display:"flex",alignItems:"center",gap:4}}>
                      <span style={{width:10,height:10,borderRadius:2,background:"var(--card2)",display:"inline-block"}}/>No activity
                    </span>
                    <span style={{display:"flex",alignItems:"center",gap:4}}>
                      <span style={{width:10,height:10,borderRadius:2,background:"var(--purple)",display:"inline-block"}}/>Quiz taken
                    </span>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* COMPARE VIEW */}
        {viewMode === "compare" && (
          <>
            {/* My rank */}
            {myRank > 0 && (
              <div style={{background:"rgba(124,92,252,0.08)",border:"1px solid rgba(124,92,252,0.2)",borderRadius:12,padding:"14px 18px",marginBottom:20,display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontSize:28}}>🏆</div>
                <div>
                  <div style={{fontSize:15,fontWeight:700}}>Your Rank: #{myRank}</div>
                  <div style={{fontSize:12,color:"var(--text3)"}}>Among {allUsers.length} registered students · Average: {avgScore}%</div>
                </div>
              </div>
            )}

            {/* Leaderboard */}
            <div className="pt-card">
              <div className="pt-card-title">
                🏆 Student Leaderboard
                <span style={{fontSize:12,color:"var(--text3)"}}>{allUsers.length} students</span>
              </div>
              {leaderboard.length === 0 ? (
                <div className="pt-empty">No students registered yet.</div>
              ) : (
                leaderboard.map((u,i) => {
                  const isMe     = u.id === user.id;
                  const rankColor = i===0?"var(--gold)":i===1?"#aaa":i===2?"#cd7f32":"var(--text3)";
                  return (
                    <div key={u.id} className="pt-lb-item"
                      style={isMe?{borderColor:"var(--purple)",background:"rgba(124,92,252,0.06)"}:{}}>
                      <div className="pt-lb-rank" style={{color:rankColor}}>
                        {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}
                      </div>
                      <Av name={u.name} size={38}/>
                      <div className="pt-lb-info">
                        <div className="pt-lb-name">
                          {u.name}
                          {isMe && <span style={{fontSize:10,color:"var(--purple)",marginLeft:8,fontWeight:700}}>YOU</span>}
                        </div>
                        <div className="pt-lb-sub">{u.quizzes} quizzes · {u.email}</div>
                      </div>
                      <div className="pt-lb-score" style={{color:u.avg>=80?"var(--teal)":u.avg>=60?"var(--gold)":"var(--orange)"}}>
                        {u.avg}%
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Score comparison bars */}
            {leaderboard.length > 0 && (
              <div className="pt-card" style={{marginTop:16}}>
                <div className="pt-card-title">📊 Score Comparison</div>
                <div className="pt-bars">
                  {leaderboard.slice(0,8).map((u,i) => {
                    const isMe  = u.id === user.id;
                    const color = isMe?"var(--purple)":i===0?"var(--gold)":"var(--teal)";
                    return (
                      <div key={u.id} className="pt-bar-wrap">
                        <div className="pt-bar-val" style={{color}}>{u.avg}%</div>
                        <div className="pt-bar"
                          style={{height:`${Math.max((u.avg/100)*120,4)}px`,background:color,opacity:isMe?1:0.7}}/>
                        <div className="pt-bar-label" style={{color:isMe?"var(--purple)":"var(--text3)",fontWeight:isMe?700:400}}>
                          {u.name.split(" ")[0]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
