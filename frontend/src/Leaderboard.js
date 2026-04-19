import { useState, useEffect } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
  .lb-wrap { padding:24px; font-family:'Sora',sans-serif; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .lb-fade { animation:fadeIn 0.3s ease; }
  .lb-class-tabs { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
  .lb-class-tab { padding:8px 16px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; border:1.5px solid var(--border2); color:var(--text2); background:var(--card2); transition:all 0.2s; white-space:nowrap; }
  .lb-class-tab.active { border-color:var(--purple); background:rgba(124,92,252,0.1); color:var(--purple); }
  .lb-podium { display:flex; justify-content:center; align-items:flex-end; gap:16px; margin-bottom:28px; flex-wrap:wrap; }
  .lb-podium-item { text-align:center; display:flex; flex-direction:column; align-items:center; }
  .lb-podium-block { width:90px; border-radius:12px 12px 0 0; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:800; color:#fff; }
  .lb-podium-name { font-size:12px; font-weight:700; margin-top:8px; max-width:90px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .lb-podium-score { font-size:14px; font-weight:800; font-family:'JetBrains Mono',monospace; }
  .av { border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; color:#fff; }
  .lb-list-item { display:flex; align-items:center; gap:14px; padding:14px 18px; background:var(--card); border:1px solid var(--border); border-radius:12px; margin-bottom:8px; transition:all 0.2s; }
  .lb-list-item:hover { border-color:var(--purple); }
  .lb-list-item.me { border-color:var(--purple); background:rgba(124,92,252,0.04); }
  .lb-rank { font-size:15px; font-weight:800; min-width:28px; text-align:center; font-family:'JetBrains Mono',monospace; }
  .lb-info { flex:1; }
  .lb-name { font-size:14px; font-weight:600; }
  .lb-sub { font-size:11px; color:var(--text3); }
  .lb-score { font-size:18px; font-weight:800; font-family:'JetBrains Mono',monospace; }
  .lb-bar-wrap { width:80px; height:5px; background:var(--card2); border-radius:3px; overflow:hidden; }
  .lb-bar-fill { height:100%; border-radius:3px; }
  .lb-stats-row { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:20px; }
  .lb-stat { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:14px; text-align:center; }
  .lb-stat-val { font-size:24px; font-weight:800; }
  .lb-stat-label { font-size:11px; color:var(--text3); margin-top:2px; }
  .empty-box { text-align:center; padding:40px; color:var(--text3); font-size:13px; }
  .spin { animation:spin 1s linear infinite; display:inline-block; width:24px; height:24px; border:3px solid rgba(124,92,252,0.2); border-top-color:var(--purple); border-radius:50%; }
  @keyframes spin { to{transform:rotate(360deg)} }
  @media(max-width:600px) { .lb-wrap{padding:16px;} .lb-podium-block{width:70px;} .lb-stats-row{grid-template-columns:1fr 1fr;} }
`;

const BASE = "http://localhost:5000/api";

function Av({ name="?", size=40 }) {
  const colors = [["#7c5cfc","#5b3fd4"],["#00d4aa","#009977"],["#ff6b35","#cc4400"],["#f59e0b","#d97706"],["#ec4899","#be185d"],["#3b82f6","#1d4ed8"]];
  const [c1,c2] = colors[(name.charCodeAt(0)||0)%colors.length];
  return <div className="av" style={{width:size,height:size,minWidth:size,background:`linear-gradient(135deg,${c1},${c2})`,fontSize:size*0.35,flexShrink:0}}>{name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}</div>;
}

export default function Leaderboard({ user }) {
  const [classes,   setClasses]   = useState([]);
  const [activeClass,setActiveClass]=useState("all");
  const [students,  setStudents]  = useState([]);
  const [stats,     setStats]     = useState({});
  const [loading,   setLoading]   = useState(true);

  useEffect(() => { loadAll(); }, [user.id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [studRes, clsRes] = await Promise.all([
        fetch(`${BASE}/auth/users`).then(r=>r.json()),
        user.role === "teacher"
          ? fetch(`${BASE}/classes/teacher/${user.id}`).then(r=>r.json())
          : fetch(`${BASE}/classes/student/${user.id}`).then(r=>r.json()),
      ]);

      const allStudents = (studRes.users||[]).filter(u=>u.role==="student");
      setStudents(allStudents);
      setClasses(clsRes.classes||[]);

      // Load quiz stats for each student
      const statsMap = {};
      await Promise.all(allStudents.map(async s => {
        try {
          const r    = await fetch(`${BASE}/auth/users/${s.id}/stats`);
          const data = await r.json();
          statsMap[s.id] = data;
        } catch {
          statsMap[s.id] = { average_score:0, total_quizzes:0 };
        }
      }));
      setStats(statsMap);
    } catch { /* ignore */ }
    setLoading(false);
  };

  // Filter students by class
  const [classMembers, setClassMembers] = useState({});

  useEffect(() => {
    classes.forEach(async cls => {
      try {
        const res  = await fetch(`${BASE}/classes/${cls.id}/students`);
        const data = await res.json();
        setClassMembers(m => ({...m, [cls.id]: (data.students||[]).map(s=>s.id)}));
      } catch { /* ignore */ }
    });
  }, [classes]);

  const filteredStudents = activeClass === "all"
    ? students
    : students.filter(s => (classMembers[activeClass]||[]).includes(s.id));

  const ranked = [...filteredStudents]
    .map(s => ({ ...s, avg: stats[s.id]?.average_score||0, quizzes: stats[s.id]?.total_quizzes||0 }))
    .sort((a,b) => b.avg - a.avg);

  const myRank    = ranked.findIndex(s => s.id === user.id) + 1;
  const myScore   = stats[user.id]?.average_score || 0;
  const topScore  = ranked[0]?.avg || 0;
  const avgScore  = ranked.length ? Math.round(ranked.reduce((s,r)=>s+r.avg,0)/ranked.length) : 0;

  const podiumColors = ["var(--gold)", "#aaa", "#cd7f32"];
  const podiumHeights = [120, 90, 70];

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="lb-wrap" style={{textAlign:"center",paddingTop:60}}>
        <span className="spin"/>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="lb-wrap lb-fade">
        <div style={{marginBottom:20}}>
          <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>🏆 Leaderboard</div>
          <div style={{fontSize:13,color:"var(--text3)"}}>Rankings by quiz performance</div>
        </div>

        {/* Class filter tabs */}
        <div className="lb-class-tabs">
          <div className={`lb-class-tab ${activeClass==="all"?"active":""}`} onClick={()=>setActiveClass("all")}>
            🌐 All Students
          </div>
          {classes.map(cls=>(
            <div key={cls.id} className={`lb-class-tab ${activeClass===cls.id?"active":""}`}
              onClick={()=>setActiveClass(cls.id)}>
              🏫 {cls.name}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="lb-stats-row">
          {[
            ["Your Rank",   myRank > 0 ? `#${myRank}` : "N/A", "var(--purple)"],
            ["Your Score",  `${myScore}%`,                       "var(--teal)"],
            ["Class Avg",   `${avgScore}%`,                      "var(--gold)"],
          ].map(([l,v,c])=>(
            <div key={l} className="lb-stat">
              <div className="lb-stat-val" style={{color:c}}>{v}</div>
              <div className="lb-stat-label">{l}</div>
            </div>
          ))}
        </div>

        {ranked.length === 0 ? (
          <div className="empty-box">
            <div style={{fontSize:36,marginBottom:8}}>🏆</div>
            No students in this class yet.
          </div>
        ) : (
          <>
            {/* Podium — top 3 */}
            {ranked.length >= 3 && (
              <div className="lb-podium">
                {/* 2nd */}
                <div className="lb-podium-item">
                  <Av name={ranked[1]?.name||"?"} size={44}/>
                  <div className="lb-podium-block" style={{height:podiumHeights[1],background:podiumColors[1],marginTop:8}}>2</div>
                  <div className="lb-podium-name">{ranked[1]?.name.split(" ")[0]}</div>
                  <div className="lb-podium-score" style={{color:podiumColors[1]}}>{ranked[1]?.avg}%</div>
                </div>
                {/* 1st */}
                <div className="lb-podium-item">
                  <div style={{fontSize:28,marginBottom:4}}>👑</div>
                  <Av name={ranked[0]?.name||"?"} size={52}/>
                  <div className="lb-podium-block" style={{height:podiumHeights[0],background:podiumColors[0],marginTop:8}}>1</div>
                  <div className="lb-podium-name" style={{fontWeight:800}}>{ranked[0]?.name.split(" ")[0]}</div>
                  <div className="lb-podium-score" style={{color:podiumColors[0]}}>{ranked[0]?.avg}%</div>
                </div>
                {/* 3rd */}
                <div className="lb-podium-item">
                  <Av name={ranked[2]?.name||"?"} size={44}/>
                  <div className="lb-podium-block" style={{height:podiumHeights[2],background:podiumColors[2],marginTop:8}}>3</div>
                  <div className="lb-podium-name">{ranked[2]?.name.split(" ")[0]}</div>
                  <div className="lb-podium-score" style={{color:podiumColors[2]}}>{ranked[2]?.avg}%</div>
                </div>
              </div>
            )}

            {/* Full list */}
            {ranked.map((s,i)=>{
              const isMe    = s.id === user.id;
              const color   = i===0?"var(--gold)":i===1?"#aaa":i===2?"#cd7f32":"var(--text3)";
              const barColor = s.avg>=80?"var(--teal)":s.avg>=60?"var(--gold)":"var(--orange)";
              return (
                <div key={s.id} className={`lb-list-item ${isMe?"me":""}`}>
                  <div className="lb-rank" style={{color}}>
                    {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}
                  </div>
                  <Av name={s.name} size={38}/>
                  <div className="lb-info">
                    <div className="lb-name">
                      {s.name}
                      {isMe && <span style={{fontSize:10,color:"var(--purple)",marginLeft:6,fontWeight:700}}>YOU</span>}
                    </div>
                    <div className="lb-sub">{s.quizzes} quizzes completed</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div className="lb-score" style={{color:barColor}}>{s.avg}%</div>
                    <div className="lb-bar-wrap" style={{marginLeft:"auto",marginTop:4}}>
                      <div className="lb-bar-fill" style={{width:`${s.avg}%`,background:barColor}}/>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </>
  );
}
