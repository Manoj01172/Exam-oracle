import { useState, useEffect } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
  .mc-wrap { padding:24px; font-family:'Sora',sans-serif; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .mc-fade { animation:fadeIn 0.3s ease; }
  .mc-join-box { background:var(--card); border:1px solid var(--border); border-radius:16px; padding:24px; margin-bottom:20px; }
  .mc-join-title { font-size:16px; font-weight:700; margin-bottom:6px; }
  .mc-join-sub { font-size:13px; color:var(--text3); margin-bottom:16px; }
  .mc-join-row { display:flex; gap:10px; }
  .mc-code-input { flex:1; background:var(--card2); border:2px solid var(--border2); border-radius:12px; padding:12px 16px; color:var(--text); font-size:18px; font-family:'JetBrains Mono',monospace; font-weight:700; outline:none; text-transform:uppercase; letter-spacing:4px; text-align:center; transition:border 0.2s; }
  .mc-code-input:focus { border-color:var(--purple); }
  .mc-code-input::placeholder { font-size:14px; letter-spacing:1px; font-family:'Sora',sans-serif; font-weight:400; color:var(--text3); }
  .btn { display:inline-flex; align-items:center; gap:6px; padding:10px 20px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; border:none; font-family:'Sora',sans-serif; transition:all 0.2s; }
  .btn-primary { background:linear-gradient(135deg,var(--purple),var(--purple2)); color:#fff; }
  .btn-primary:hover:not(:disabled) { transform:translateY(-1px); }
  .btn-primary:disabled { opacity:0.5; cursor:not-allowed; }
  .class-card { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:20px; margin-bottom:12px; transition:all 0.2s; }
  .class-card:hover { border-color:var(--purple); }
  .class-name { font-size:16px; font-weight:800; margin-bottom:4px; }
  .class-meta { font-size:12px; color:var(--text3); }
  .error-box { padding:10px 14px; border-radius:10px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); color:var(--danger); font-size:13px; margin-bottom:12px; }
  .success-box { padding:10px 14px; border-radius:10px; background:rgba(0,212,170,0.08); border:1px solid rgba(0,212,170,0.2); color:var(--teal); font-size:13px; margin-bottom:12px; }
  .empty-box { text-align:center; padding:40px; color:var(--text3); }
  .spin { animation:spin 1s linear infinite; display:inline-block; width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; }
  @keyframes spin { to{transform:rotate(360deg)} }
`;

const BASE = process.env.REACT_APP_BASE_URL;

export default function MyClasses({ user }) {
  const [classes,  setClasses]  = useState([]);
  const [code,     setCode]     = useState("");
  const [joining,  setJoining]  = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [msg,      setMsg]      = useState("");
  const [error,    setError]    = useState("");

  useEffect(() => { load(); }, [user.id]);

  const load = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/classes/student/${user.id}`);
      const data = await res.json();
      setClasses(data.classes || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const joinClass = async () => {
    if (!code.trim()) return;
    setJoining(true); setMsg(""); setError("");
    try {
      const res  = await fetch(`${BASE}/classes/join`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ student_id:user.id, join_code:code.trim().toUpperCase() })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not join class.");
      } else {
        setMsg(data.message);
        setCode("");
        await load();
      }
    } catch { setError("Network error. Please try again."); }
    setJoining(false);
    setTimeout(() => { setMsg(""); setError(""); }, 4000);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="mc-wrap mc-fade">
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:20, fontWeight:800, marginBottom:4 }}>🏫 My Classes</div>
          <div style={{ fontSize:13, color:"var(--text3)" }}>Join classes using the code from your teacher</div>
        </div>

        {/* Join Box */}
        <div className="mc-join-box">
          <div className="mc-join-title">Join a Class</div>
          <div className="mc-join-sub">Ask your teacher for the 6-character class code</div>
          {error && <div className="error-box">⚠️ {error}</div>}
          {msg   && <div className="success-box">✅ {msg}</div>}
          <div className="mc-join-row">
            <input
              className="mc-code-input"
              placeholder="Enter class code"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              onKeyDown={e => e.key === "Enter" && joinClass()}
            />
            <button className="btn btn-primary" onClick={joinClass}
              disabled={joining || code.length < 6}>
              {joining ? <span className="spin"/> : "Join →"}
            </button>
          </div>
        </div>

        {/* My Classes */}
        <div style={{ fontSize:15, fontWeight:700, marginBottom:14 }}>
          My Classes ({classes.length})
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:40 }}>
            <span className="spin" style={{ width:28, height:28, border:"3px solid rgba(124,92,252,0.2)", borderTopColor:"var(--purple)" }}/>
          </div>
        ) : classes.length === 0 ? (
          <div className="empty-box">
            <div style={{ fontSize:40, marginBottom:8 }}>🏫</div>
            <div style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>No classes joined yet</div>
            <div>Enter the class code above to join your first class!</div>
          </div>
        ) : (
          classes.map(cls => (
            <div key={cls.id} className="class-card">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div className="class-name">{cls.name}</div>
                  <div className="class-meta">
                    {cls.subject}
                    {cls.section && ` · ${cls.section}`}
                  </div>
                  <div style={{ fontSize:12, color:"var(--text3)", marginTop:4 }}>
                    👨‍🏫 {cls.teacher_name}
                  </div>
                  <div style={{ fontSize:11, color:"var(--text3)", marginTop:2 }}>
                    Joined: {new Date(cls.joined_at).toLocaleDateString("en-IN")}
                  </div>
                </div>
                <span style={{
                  padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:700,
                  background:"rgba(124,92,252,0.1)", color:"var(--purple)",
                  border:"1px solid rgba(124,92,252,0.2)"
                }}>
                  Active
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
