import AnalysisPage from "./AnalysisPage";
import AuthPage from "./AuthPage";
import QuizMode from "./QuizMode";
import SmartNotes from "./SmartNotes";
import SearchFilter from "./SearchFilter";
import Chatbot from "./Chatbot";
import Timetable from "./Timetable";
import PerformanceTracking from "./PerformanceTracking";
import TeacherDashboard from "./TeacherDashboard";
import Assignments from "./Assignments";
import AttendanceTracker from "./AttendanceTracker";
import MyClasses from "./MyClasses";
import NotificationsPanel, { useNotifications } from "./NotificationsPanel";
import StudyTools from "./StudyTools";
import DoubtQA from "./DoubtQA";
import { ThemeProvider, ThemeToggle } from "./ThemeContext";
import Leaderboard    from "./Leaderboard";
import ProgressReport from "./ProgressReport";
import { useState, useEffect, useCallback } from "react";
import { authAPI, pdfAPI, analysisAPI } from "./services/api";

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ path, size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const Icons = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  quiz: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  students: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  analytics: "M18 20V10 M12 20V4 M6 20v-6",
  notes: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  menu: "M3 12h18 M3 6h18 M3 18h18",
  close: "M18 6 6 18 M6 6l12 12",
  search: "M11 17.25a6.25 6.25 0 1 1 0-12.5 6.25 6.25 0 0 1 0 12.5z M16 16l4.5 4.5",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  eyeOff: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94 M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19 M1 1l22 22",
  check: "M20 6 9 17l-5-5",
  pdf: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6",
  trash: "M3 6h18 M19 6l-1 14H6L5 6 M8 6V4h8v2",
  play: "M5 3l14 9-14 9V3z",
  compare: "M18 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14 M22 12H2",
  time: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 5v5l4 2",
  refresh: "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  warning: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  :root{
    --bg:#080a12;--card:#0e1120;--card2:#141728;--border:#1e2235;--border2:#252a40;
    --purple:#7c5cfc;--purple2:#5b3fd4;--teal:#00d4aa;--orange:#ff6b35;--gold:#f59e0b;
    --text:#e8eaf2;--text2:#8b90a8;--text3:#5a5f7a;--danger:#ef4444;--success:#22c55e;
    --glow:rgba(124,92,252,0.15);--radius:14px;
    --font:'Sora',sans-serif;--mono:'JetBrains Mono',monospace;
  }
  body{background:var(--bg);color:var(--text);font-family:var(--font);min-height:100vh;overflow-x:hidden;}
  ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:var(--card);}::-webkit-scrollbar-thumb{background:var(--purple);border-radius:2px;}

  .app-layout{display:flex;min-height:100vh;}
  .sidebar{width:240px;min-height:100vh;background:var(--card);border-right:1px solid var(--border);display:flex;flex-direction:column;position:fixed;left:0;top:0;bottom:0;z-index:100;transition:transform 0.3s cubic-bezier(.4,0,.2,1);}
  .sidebar.collapsed{transform:translateX(-100%);}
  .sidebar-logo{padding:20px;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--border);}
  .logo-icon{width:36px;height:36px;background:linear-gradient(135deg,var(--purple),var(--purple2));border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;}
  .logo-text{font-size:15px;font-weight:700;background:linear-gradient(90deg,var(--purple),var(--teal));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
  .sidebar-section{padding:16px 12px 8px;}
  .sidebar-label{font-size:10px;font-weight:600;letter-spacing:1.5px;color:var(--text3);text-transform:uppercase;padding:0 8px 8px;}
  .nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;cursor:pointer;margin-bottom:2px;transition:all 0.2s;font-size:13.5px;font-weight:500;color:var(--text2);position:relative;}
  .nav-item:hover{background:var(--card2);color:var(--text);}
  .nav-item.active{background:linear-gradient(135deg,rgba(124,92,252,0.2),rgba(124,92,252,0.05));color:var(--purple);border:1px solid rgba(124,92,252,0.2);}
  .nav-item.active::before{content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:20px;background:var(--purple);border-radius:0 3px 3px 0;}
  .sidebar-user{margin-top:auto;padding:16px;border-top:1px solid var(--border);display:flex;align-items:center;gap:10px;cursor:pointer;}
  .main-content{margin-left:240px;flex:1;min-height:100vh;transition:margin 0.3s;}
  .topbar{position:sticky;top:0;z-index:50;background:rgba(8,10,18,0.85);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:0 24px;height:64px;display:flex;align-items:center;gap:16px;}
  .topbar-title{flex:1;}
  .topbar-title h1{font-size:18px;font-weight:700;}
  .topbar-title p{font-size:12px;color:var(--text3);margin-top:1px;}
  .search-box{display:flex;align-items:center;gap:8px;background:var(--card2);border:1px solid var(--border);border-radius:10px;padding:8px 14px;width:220px;}
  .search-box input{background:none;border:none;outline:none;color:var(--text);font-size:13px;font-family:var(--font);width:100%;}
  .search-box input::placeholder{color:var(--text3);}
  .icon-btn{width:36px;height:36px;border-radius:10px;border:1px solid var(--border);background:var(--card2);display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;transition:all 0.2s;}
  .icon-btn:hover{border-color:var(--purple);background:rgba(124,92,252,0.1);}
  .notif-dot{position:absolute;top:7px;right:7px;width:7px;height:7px;background:var(--purple);border-radius:50%;border:2px solid var(--bg);}
  .menu-btn{display:none;}
  .page{padding:24px;animation:fadeIn 0.3s ease;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
  .card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:20px;}
  .card-title{font-size:14px;font-weight:600;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;}
  .stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;}
  .stat-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:20px;position:relative;overflow:hidden;}
  .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--accent,var(--purple)),transparent);}
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  .grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
  .btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:10px;font-size:13.5px;font-weight:600;cursor:pointer;border:none;font-family:var(--font);transition:all 0.2s;}
  .btn:disabled{opacity:0.5;cursor:not-allowed;}
  .btn-primary{background:linear-gradient(135deg,var(--purple),var(--purple2));color:#fff;box-shadow:0 4px 15px rgba(124,92,252,0.3);}
  .btn-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(124,92,252,0.4);}
  .btn-outline{background:transparent;border:1.5px solid var(--border2);color:var(--text2);}
  .btn-outline:hover{border-color:var(--purple);color:var(--purple);background:rgba(124,92,252,0.05);}
  .btn-teal{background:linear-gradient(135deg,var(--teal),#00a888);color:#000;font-weight:700;}
  .btn-danger{background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:var(--danger);}
  .btn-sm{padding:6px 14px;font-size:12px;border-radius:8px;}
  select{background:var(--card2);border:1px solid var(--border);border-radius:8px;padding:7px 12px;color:var(--text);font-size:13px;font-family:var(--font);outline:none;cursor:pointer;}
  select:focus{border-color:var(--purple);}

  /* LOGIN */
  .login-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);position:relative;overflow:hidden;}
  .login-orb{position:absolute;border-radius:50%;filter:blur(80px);opacity:0.15;}
  .login-card{background:var(--card);border:1px solid var(--border);border-radius:24px;padding:40px;width:100%;max-width:420px;position:relative;z-index:1;}
  .login-title{font-size:24px;font-weight:800;margin-bottom:6px;}
  .login-sub{font-size:13px;color:var(--text3);margin-bottom:24px;}
  .form-group{margin-bottom:16px;}
  .form-label{font-size:12.5px;font-weight:600;color:var(--text2);margin-bottom:6px;display:block;}
  .form-input{width:100%;background:var(--card2);border:1.5px solid var(--border2);border-radius:10px;padding:12px 14px;color:var(--text);font-size:14px;font-family:var(--font);outline:none;transition:border 0.2s;}
  .form-input:focus{border-color:var(--purple);}
  .input-wrap{position:relative;}
  .input-wrap .form-input{padding-right:40px;}
  .input-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);cursor:pointer;color:var(--text3);}
  .role-tabs{display:flex;gap:8px;margin-bottom:20px;}
  .role-tab{flex:1;padding:10px;border-radius:10px;border:1.5px solid var(--border2);text-align:center;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;}
  .role-tab.active{border-color:var(--purple);background:rgba(124,92,252,0.1);color:var(--purple);}
  .auth-toggle{text-align:center;margin-top:20px;font-size:13px;color:var(--text3);}
  .auth-toggle span{color:var(--purple);cursor:pointer;font-weight:600;}
  .error-msg{background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:var(--danger);padding:10px 14px;border-radius:10px;font-size:13px;margin-bottom:16px;}
  .success-msg{background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);color:var(--success);padding:10px 14px;border-radius:10px;font-size:13px;margin-bottom:16px;}

  /* UPLOAD */
  .dropzone{border:2px dashed var(--border2);border-radius:16px;padding:40px;text-align:center;cursor:pointer;transition:all 0.2s;background:var(--card2);}
  .dropzone:hover,.dropzone.drag{border-color:var(--purple);background:rgba(124,92,252,0.05);}
  .dropzone-icon{width:56px;height:56px;border-radius:16px;background:rgba(124,92,252,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;}
  .file-item{display:flex;align-items:center;gap:10px;background:var(--card2);border:1px solid var(--border);border-radius:10px;padding:10px 14px;margin-bottom:8px;}
  .progress-mini{height:3px;background:var(--border);border-radius:2px;margin-top:4px;overflow:hidden;}
  .progress-mini-fill{height:100%;background:linear-gradient(90deg,var(--purple),var(--teal));border-radius:2px;transition:width 0.3s;}

  /* TOPICS */
  .topic-card{display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--card2);border:1px solid var(--border);border-radius:12px;margin-bottom:8px;transition:all 0.2s;}
  .topic-card:hover{border-color:var(--purple);transform:translateX(3px);}

  /* TABLE */
  .table-wrap{overflow-x:auto;}
  table{width:100%;border-collapse:collapse;}
  th{font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:0.8px;padding:10px 12px;text-align:left;border-bottom:1px solid var(--border);white-space:nowrap;}
  td{padding:12px;border-bottom:1px solid var(--border);font-size:13px;vertical-align:middle;}
  tr:last-child td{border-bottom:none;}
  tr:hover td{background:rgba(255,255,255,0.02);}

  /* QUIZ */
  .quiz-wrap{max-width:680px;margin:0 auto;}
  .progress-bar-track{height:6px;background:var(--card2);border-radius:3px;overflow:hidden;flex:1;margin:0 16px;}
  .progress-bar-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--purple),var(--teal));transition:width 0.4s;}
  .timer-box{display:flex;align-items:center;gap:6px;background:var(--card2);border:1px solid var(--border);border-radius:10px;padding:8px 14px;font-family:var(--mono);font-size:15px;font-weight:600;}
  .timer-box.warning{border-color:var(--orange);color:var(--orange);}
  .quiz-card{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:28px;}
  .opt{padding:14px 18px;border-radius:12px;border:1.5px solid var(--border2);cursor:pointer;font-size:14px;font-weight:500;transition:all 0.2s;display:flex;align-items:center;gap:12px;margin-bottom:10px;}
  .opt:hover{border-color:var(--purple);background:rgba(124,92,252,0.06);}
  .opt.selected{border-color:var(--purple);background:rgba(124,92,252,0.12);color:var(--purple);}
  .opt.correct{border-color:var(--teal);background:rgba(0,212,170,0.1);color:var(--teal);}
  .opt.wrong{border-color:var(--danger);background:rgba(239,68,68,0.1);color:var(--danger);}
  .opt-letter{width:28px;height:28px;border-radius:8px;border:1.5px solid currentColor;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;}

  /* MISC */
  .divider{height:1px;background:var(--border);margin:16px 0;}
  .section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}
  .section-title{font-size:16px;font-weight:700;}
  .section-sub{font-size:12px;color:var(--text3);margin-top:2px;}
  .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;}
  .empty-state{text-align:center;padding:48px 20px;color:var(--text3);}
  .empty-icon{font-size:48px;margin-bottom:12px;}
  .spin{animation:spin 1s linear infinite;display:inline-block;}
  @keyframes spin{to{transform:rotate(360deg);}}
  .loading-overlay{display:flex;align-items:center;justify-content:center;padding:40px;gap:10px;color:var(--text3);}
  .mono{font-family:var(--mono);}
  .text-muted{color:var(--text3);}
  .text-teal{color:var(--teal);}
  .text-purple{color:var(--purple);}
  .text-danger{color:var(--danger);}
  .mt-4{margin-top:16px;}
  .mb-4{margin-bottom:16px;}
  .w-full{width:100%;}

  /* LEADERBOARD */
  .lb-card{display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--card2);border:1px solid var(--border);border-radius:12px;margin-bottom:8px;}
  .lb-card.top1{background:linear-gradient(135deg,rgba(245,158,11,0.08),transparent);border-color:rgba(245,158,11,0.2);}

  /* NOTE */
  .note-card{background:var(--card2);border:1px solid var(--border);border-radius:14px;padding:20px;margin-bottom:12px;position:relative;}
  .note-bullet{display:flex;gap:8px;align-items:flex-start;margin-bottom:6px;font-size:13.5px;line-height:1.6;color:var(--text2);}
  .note-bullet::before{content:'▸';color:var(--purple);flex-shrink:0;margin-top:1px;}

  @media(max-width:768px){
    .sidebar{transform:translateX(-100%);}
    .sidebar.mobile-open{transform:translateX(0);}
    .main-content{margin-left:0!important;}
    .menu-btn{display:flex!important;}
    .stats-grid{grid-template-columns:1fr 1fr;}
    .grid-2{grid-template-columns:1fr;}
    .page{padding:16px;}
    .topbar{padding:0 16px;}
    .search-box{width:140px;}
  }
  @media(max-width:480px){
    .stats-grid{grid-template-columns:1fr;}
  }
  .sidebar-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99;display:none;}
  .sidebar-overlay.show{display:block;}
`;

// ─── SMALL HELPERS ────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <span className="spin" style={{
      width: 18, height: 18,
      border: "2px solid rgba(255,255,255,0.2)",
      borderTop: "2px solid #fff",
      borderRadius: "50%"
    }} />
  );
}

function Av({ name = "?", size = 36 }) {
  const colors = [
    ["#7c5cfc", "#5b3fd4"], ["#00d4aa", "#009977"], ["#ff6b35", "#cc4400"],
    ["#f59e0b", "#d97706"], ["#ec4899", "#be185d"], ["#3b82f6", "#1d4ed8"],
  ];
  const [c1, c2] = colors[(name.charCodeAt(0) || 0) % colors.length];
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, minWidth: size, borderRadius: "50%",
      background: `linear-gradient(135deg,${c1},${c2})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, color: "#fff", flexShrink: 0
    }}>{initials}</div>
  );
}

function ScoreBadge({ score }) {
  const pct = Math.round(score);
  const color = pct >= 80 ? "var(--teal)" : pct >= 60 ? "var(--gold)" : "var(--orange)";
  return (
    <span className="badge" style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
      {pct}%
    </span>
  );
}

function ImpBadge({ imp }) {
  const map = { High: "var(--danger)", Medium: "var(--gold)", Low: "var(--text3)" };
  const c = map[imp] || "var(--text3)";
  return (
    <span className="badge" style={{ color: c, background: `${c}22`, border: `1px solid ${c}33` }}>
      {imp}
    </span>
  );
}

function CircleProgress({ value = 0, size = 72, color = "var(--purple)" }) {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--card2)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
          strokeWidth={stroke} strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center"
      }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 800 }}>{value}%</span>
        <span style={{ fontSize: 9, color: "var(--text3)", fontWeight: 500 }}>Score</span>
      </div>
    </div>
  );
}

// ─── QUIZ QUESTIONS (static — will come from backend in Step 5) ───────────────
const QUIZ_QUESTIONS = [
  { id: 1, q: "Which algorithm is best suited for text classification?", opts: ["K-Means Clustering", "Naive Bayes", "Linear Regression", "PCA"], ans: 1, subject: "ML", difficulty: "Medium" },
  { id: 2, q: "What does TF-IDF stand for?", opts: ["Term Frequency-Inverse Document Frequency", "Text Feature Index Data Format", "Total Frequency Index Definition", "Term Factor Inverse Data File"], ans: 0, subject: "NLP", difficulty: "Easy" },
  { id: 3, q: "Which algorithm groups unlabeled data into clusters?", opts: ["Logistic Regression", "Decision Tree", "K-Means", "Naive Bayes"], ans: 2, subject: "ML", difficulty: "Easy" },
  { id: 4, q: "What is the purpose of the train-test split?", opts: ["Speed up training", "Evaluate model on unseen data", "Clean the data", "Reduce number of features"], ans: 1, subject: "ML", difficulty: "Medium" },
  { id: 5, q: "Which Python library is used for PDF text extraction?", opts: ["BeautifulSoup", "Selenium", "pdfplumber", "requests"], ans: 2, subject: "Python", difficulty: "Easy" },
  { id: 6, q: "Stopword removal is performed in which NLP stage?", opts: ["Feature extraction", "Preprocessing", "Model training", "Evaluation"], ans: 1, subject: "NLP", difficulty: "Medium" },
  { id: 7, q: "Which metric measures how many actual positives were correctly identified?", opts: ["Accuracy", "Precision", "Recall", "F1 Score"], ans: 2, subject: "ML", difficulty: "Hard" },
  { id: 8, q: "What does NLP stand for?", opts: ["Neural Learning Protocol", "Natural Language Processing", "Numeric Logic Programming", "Network Layer Protocol"], ans: 1, subject: "NLP", difficulty: "Easy" },
];


// ═══════════════════════════════════════════════════════════════════════════════
// ── DASHBOARD PAGE ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function Dashboard({ user }) {
  const [allUsers, setAllUsers] = useState([]);
  const [allPdfs, setAllPdfs] = useState([]);
  const [allTopics, setAllTopics] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [usersRes, pdfsRes, topicsRes, statsRes] = await Promise.all([
          authAPI.getAllUsers(),
          pdfAPI.listAll(),
          analysisAPI.getAllTopics(),
          authAPI.getUserStats(user.id),
        ]);
        setAllUsers(usersRes.users || []);
        setAllPdfs(pdfsRes.pdfs || []);
        setAllTopics(topicsRes.topics || []);
        setUserStats(statsRes);
      } catch { /* show empty state */ }
      setLoading(false);
    }
    load();
  }, [user.id]);

  const avgScore = userStats?.average_score || 0;
  const totalQuizzes = userStats?.total_quizzes || 0;

  return (
    <div className="page">
      {loading ? (
        <div className="loading-overlay">
          <Spinner /> <span>Loading dashboard data...</span>
        </div>
      ) : (
        <>
          {/* STAT CARDS */}
          <div className="stats-grid">
            <div className="stat-card" style={{ "--accent": "var(--purple)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 4 }}>Your Average Score</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "var(--purple)" }}>
                    {avgScore > 0 ? `${avgScore}%` : "No quizzes yet"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>
                    {totalQuizzes} quiz{totalQuizzes !== 1 ? "zes" : ""} completed
                  </div>
                </div>
                <CircleProgress value={Math.round(avgScore)} color="var(--purple)" />
              </div>
            </div>

            <div className="stat-card" style={{ "--accent": "var(--teal)" }}>
              <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 4 }}>Registered Students</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--teal)" }}>
                {allUsers.filter(u => u.role === "student").length}
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>
                {allUsers.length} total users registered
              </div>
            </div>

            <div className="stat-card" style={{ "--accent": "var(--orange)" }}>
              <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 4 }}>PDFs Analyzed</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--orange)" }}>
                {allPdfs.filter(p => p.status === "analyzed").length}
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>
                {allPdfs.length} total files uploaded
              </div>
            </div>
          </div>

          {/* PREDICTED TOPICS */}
          <div className="grid-2">
            <div className="card">
              <div className="section-header">
                <div>
                  <div className="section-title">🔮 Top Predicted Topics</div>
                  <div className="section-sub">Extracted from uploaded PDFs</div>
                </div>
              </div>
              {allTopics.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📂</div>
                  <div>No topics yet — upload and analyze a PDF first.</div>
                </div>
              ) : (
                allTopics.slice(0, 8).map((t, i) => {
                  const prob = Math.min(Math.round((t.avg_score || 0) * 100), 99);
                  const color = prob >= 70 ? "var(--teal)" : prob >= 45 ? "var(--gold)" : "var(--orange)";
                  return (
                    <div key={i} className="topic-card">
                      <div style={{ fontSize: 14, fontWeight: 700, color, minWidth: 40, fontFamily: "var(--mono)" }}>
                        {prob}%
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>{t.topic}</div>
                        <div style={{ fontSize: 11, color: "var(--text3)" }}>
                          Found in {t.pdf_count} PDF{t.pdf_count !== 1 ? "s" : ""} · {t.total_frequency}× total
                        </div>
                      </div>
                      <div style={{ flex: 1, height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${prob}%`, height: "100%", background: color, borderRadius: 3 }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* RECENT QUIZ HISTORY */}
            <div className="card">
              <div className="section-header">
                <div>
                  <div className="section-title">📊 Your Quiz History</div>
                  <div className="section-sub">Real results from your attempts</div>
                </div>
              </div>
              {!userStats || userStats.history.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🎯</div>
                  <div>No quiz attempts yet — take a quiz to see results here.</div>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Subject</th><th>Score</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {userStats.history.slice(0, 8).map((r, i) => (
                        <tr key={i}>
                          <td>{r.subject}</td>
                          <td><ScoreBadge score={r.percentage} /></td>
                          <td style={{ color: "var(--text3)", fontSize: 12 }}>
                            {new Date(r.completed_at).toLocaleDateString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ALL USERS TABLE */}
          {(user.role === "teacher" || user.role === "admin") && (
            <div className="card mt-4">
              <div className="section-header">
                <div>
                  <div className="section-title">👥 All Registered Users</div>
                  <div className="section-sub">Real accounts from database</div>
                </div>
              </div>
              {allUsers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👤</div>
                  <div>No users registered yet.</div>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr>
                    </thead>
                    <tbody>
                      {allUsers.map((u, i) => (
                        <tr key={u.id}>
                          <td style={{ color: "var(--text3)" }}>{i + 1}</td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <Av name={u.name} size={32} />
                              <span style={{ fontWeight: 600 }}>{u.name}</span>
                            </div>
                          </td>
                          <td style={{ color: "var(--text3)" }}>{u.email}</td>
                          <td>
                            <span className="badge" style={{
                              background: u.role === "teacher" ? "rgba(124,92,252,0.1)" : u.role === "admin" ? "rgba(239,68,68,0.1)" : "rgba(0,212,170,0.1)",
                              color: u.role === "teacher" ? "var(--purple)" : u.role === "admin" ? "var(--danger)" : "var(--teal)",
                            }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ color: "var(--text3)", fontSize: 12 }}>
                            {new Date(u.created_at).toLocaleDateString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── PDF UPLOAD PAGE ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function PDFUpload({ user }) {
  const [myPdfs, setMyPdfs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(null);
  const [drag, setDrag] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadPdfs = useCallback(async () => {
    try {
      const data = await pdfAPI.listByUser(user.id);
      setMyPdfs(data.pdfs || []);
    } catch { /* ignore */ }
  }, [user.id]);

  useEffect(() => { loadPdfs(); }, [loadPdfs]);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setError(""); setMessage(""); setUploading(true);
    try {
      const data = await pdfAPI.upload(files, user.id);
      setMessage(`${data.uploaded.length} file(s) uploaded successfully.`);
      await loadPdfs();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async (pdfId) => {
    setAnalyzing(pdfId); setError(""); setMessage("");
    try {
      const data = await analysisAPI.runAnalysis(pdfId);
      setMessage(`Analysis complete. Found ${data.topics_found} topics in this PDF.`);
      await loadPdfs();
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(null);
    }
  };

  const handleDelete = async (pdfId) => {
    if (!window.confirm("Delete this PDF and all its analysis data?")) return;
    try {
      await pdfAPI.delete(pdfId);
      await loadPdfs();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <div className="section-header">
        <div>
          <div className="section-title">📂 PDF Upload & Analysis</div>
          <div className="section-sub">Upload question papers — the ML pipeline runs automatically</div>
        </div>
      </div>

      <div className="grid-2">
        {/* LEFT — Upload zone */}
        <div>
          <div
            className={`dropzone ${drag ? "drag" : ""}`}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => document.getElementById("pdf-input").click()}
          >
            <input id="pdf-input" type="file" accept=".pdf" multiple hidden
              onChange={e => handleFiles(e.target.files)} />
            <div className="dropzone-icon">
              <Icon path={Icons.upload} size={26} color="var(--purple)" />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
              {uploading ? "Uploading..." : "Drop PDF files here"}
            </div>
            <div style={{ fontSize: 13, color: "var(--text3)" }}>
              {uploading ? <Spinner /> : "Click to browse — multiple files supported"}
            </div>
          </div>

          {message && <div className="success-msg mt-4">✅ {message}</div>}
          {error && <div className="error-msg   mt-4">⚠️ {error}</div>}

          {/* Pipeline explanation */}
          <div className="card mt-4">
            <div className="card-title">Processing Pipeline</div>
            {[
              ["1", "PDF Text Extraction", "pdfplumber / PyPDF2", "var(--teal)"],
              ["2", "NLP Preprocessing", "NLTK tokenizer + lemmatizer", "var(--purple)"],
              ["3", "TF-IDF Extraction", "scikit-learn vectorizer", "var(--orange)"],
              ["4", "Probability Scoring", "Frequency + position weighting", "var(--gold)"],
            ].map(([n, s, t, c]) => (
              <div key={n} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%", background: c, color: "#000",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0
                }}>{n}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{s}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{t}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Uploaded files */}
        <div className="card">
          <div className="card-title">
            Your Uploaded PDFs
            <span style={{ fontSize: 11, color: "var(--text3)" }}>{myPdfs.length} file(s)</span>
          </div>
          {myPdfs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <div>No PDFs uploaded yet.</div>
            </div>
          ) : (
            myPdfs.map(pdf => (
              <div key={pdf.id} className="file-item" style={{ flexDirection: "column", alignItems: "stretch" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon path={Icons.pdf} size={18} color="var(--orange)" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{pdf.original_name}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>
                      {pdf.file_size_kb} KB · {pdf.page_count} pages · {pdf.word_count.toLocaleString()} words
                    </div>
                  </div>
                  <span className="badge" style={{
                    background: pdf.status === "analyzed" ? "rgba(0,212,170,0.1)" :
                      pdf.status === "processed" ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
                    color: pdf.status === "analyzed" ? "var(--teal)" :
                      pdf.status === "processed" ? "var(--gold)" : "var(--danger)",
                  }}>{pdf.status}</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  {pdf.status !== "analyzed" && (
                    <button className="btn btn-sm btn-primary"
                      onClick={() => handleAnalyze(pdf.id)}
                      disabled={analyzing === pdf.id}>
                      {analyzing === pdf.id ? <><Spinner /> Analyzing...</> : "▶ Run Analysis"}
                    </button>
                  )}
                  {pdf.status === "analyzed" && (
                    <button className="btn btn-sm btn-outline"
                      onClick={() => handleAnalyze(pdf.id)}
                      disabled={analyzing === pdf.id}>
                      {analyzing === pdf.id ? <><Spinner /> Re-analyzing...</> : <><Icon path={Icons.refresh} size={13} /> Re-analyze</>}
                    </button>
                  )}
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(pdf.id)}>
                    <Icon path={Icons.trash} size={13} /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// ── STUDENTS / COMPARE PAGE ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function StudentsPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [s1, setS1] = useState("");
  const [s2, setS2] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await authAPI.getAllUsers();
        const u = (res.users || []).filter(u => u.role === "student");
        setUsers(u);

        // Load stats for each student
        const statsMap = {};
        await Promise.all(u.map(async (user) => {
          try {
            const s = await authAPI.getUserStats(user.id);
            statsMap[user.id] = s;
          } catch { statsMap[user.id] = { total_quizzes: 0, average_score: 0, history: [] }; }
        }));
        setStats(statsMap);

        if (u.length >= 1) setS1(String(u[0].id));
        if (u.length >= 2) setS2(String(u[1].id));
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, []);

  const stA = s1 ? stats[s1] : null;
  const stB = s2 ? stats[s2] : null;
  const uA = users.find(u => String(u.id) === s1);
  const uB = users.find(u => String(u.id) === s2);

  const sortedByScore = [...users].sort(
    (a, b) => (stats[b.id]?.average_score || 0) - (stats[a.id]?.average_score || 0)
  );

  if (loading) return (
    <div className="page">
      <div className="loading-overlay"><Spinner /> Loading student data...</div>
    </div>
  );

  return (
    <div className="page">
      <div className="section-header">
        <div>
          <div className="section-title">⚔️ Student Comparison</div>
          <div className="section-sub">Real data from database</div>
        </div>
      </div>

      {users.length < 2 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <div>At least 2 student accounts are needed for comparison.</div>
            <div style={{ marginTop: 8, fontSize: 12, color: "var(--text3)" }}>
              Register more students to use this feature.
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* SELECTORS */}
          <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label className="form-label">Student A</label>
              <select style={{ width: "100%" }} value={s1} onChange={e => setS1(e.target.value)}>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,var(--purple),var(--teal))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12 }}>VS</div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label className="form-label">Student B</label>
              <select style={{ width: "100%" }} value={s2} onChange={e => setS2(e.target.value)}>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>

          {/* COMPARE CARDS */}
          {uA && uB && (
            <div className="grid-2">
              {[[uA, stA], [uB, stB]].map(([u, st], idx) => (
                <div key={idx} className="card" style={{ textAlign: "center" }}>
                  <Av name={u?.name || "?"} size={60} />
                  <div style={{ fontSize: 18, fontWeight: 800, marginTop: 12 }}>{u?.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16 }}>{u?.email}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                    {[
                      ["Avg Score", `${st?.average_score || 0}%`, "var(--teal)"],
                      ["Quizzes", st?.total_quizzes || 0, "var(--purple)"],
                    ].map(([l, v, c]) => (
                      <div key={l} style={{ background: "var(--card2)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 8px" }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: c }}>{v}</div>
                        <div style={{ fontSize: 10, color: "var(--text3)" }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <CircleProgress value={Math.round(st?.average_score || 0)} color={idx === 0 ? "var(--purple)" : "var(--teal)"} />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* LEADERBOARD */}
      <div className="card mt-4">
        <div className="card-title">🏆 Leaderboard — Real Rankings</div>
        {sortedByScore.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏆</div>
            <div>No students registered yet.</div>
          </div>
        ) : (
          sortedByScore.map((u, i) => (
            <div key={u.id} className={`lb-card ${i === 0 ? "top1" : ""}`}>
              <div style={{ fontSize: 16, fontWeight: 800, minWidth: 28, color: i === 0 ? "var(--gold)" : i === 1 ? "#aaa" : i === 2 ? "#cd7f32" : "var(--text3)" }}>
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
              </div>
              <Av name={u.name} size={38} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{u.name}</div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>
                  {stats[u.id]?.total_quizzes || 0} quizzes attempted
                </div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--mono)", color: "var(--teal)" }}>
                {stats[u.id]?.average_score || 0}%
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── ANALYTICS PAGE ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function Analytics() {
  const [topics, setTopics] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [t, p] = await Promise.all([analysisAPI.getAllTopics(), pdfAPI.listAll()]);
        setTopics(t.topics || []);
        setPdfs(p.pdfs || []);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="page"><div className="loading-overlay"><Spinner /> Loading analytics...</div></div>;

  const analyzed = pdfs.filter(p => p.status === "analyzed").length;

  return (
    <div className="page">
      <div className="section-header">
        <div>
          <div className="section-title">📊 Analytics Dashboard</div>
          <div className="section-sub">Real data from your uploaded PDFs</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          ["📄", "PDFs Uploaded", pdfs.length, "var(--purple)"],
          ["🔍", "PDFs Analyzed", analyzed, "var(--teal)"],
          ["🏷️", "Unique Topics", topics.length, "var(--orange)"],
          ["📈", "Top Topic Freq", topics[0]?.total_frequency || 0, "var(--gold)"],
        ].map(([e, l, v, c]) => (
          <div key={l} className="card" style={{ textAlign: "center", padding: 16 }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{e}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: c }}>{v}</div>
            <div style={{ fontSize: 11, color: "var(--text3)" }}>{l}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Topic Frequency (from your PDFs)</div>
        {topics.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <div>Upload and analyze PDFs to see topic data here.</div>
          </div>
        ) : (
          topics.slice(0, 15).map((t, i) => {
            const maxFreq = topics[0].total_frequency || 1;
            const pct = Math.round((t.total_frequency / maxFreq) * 100);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: "var(--text2)", minWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textTransform: "capitalize" }}>
                  {t.topic}
                </div>
                <div style={{ flex: 1, height: 20, background: "var(--card2)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${pct}%`,
                    background: "linear-gradient(90deg,var(--purple),var(--teal))",
                    borderRadius: 4, display: "flex", alignItems: "center", paddingLeft: 8
                  }}>
                    {pct > 15 && <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>{t.total_frequency}×</span>}
                  </div>
                </div>
                <span style={{ fontSize: 11, color: "var(--text3)", minWidth: 24, textAlign: "right" }}>{pct}%</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── SETTINGS PAGE ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function SettingsPage({ user, onLogout }) {
  return (
    <div className="page">
      <div className="section-title mb-4">⚙️ Settings</div>
      <div className="grid-2">
        <div className="card">
          <div className="card-title">Profile</div>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
            <Av name={user.name} size={64} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{user.name}</div>
              <div style={{ fontSize: 13, color: "var(--text3)" }}>{user.email}</div>
              <span className="badge" style={{
                marginTop: 6,
                background: user.role === "teacher" ? "rgba(124,92,252,0.1)" : "rgba(0,212,170,0.1)",
                color: user.role === "teacher" ? "var(--purple)" : "var(--teal)"
              }}>
                {user.role}
              </span>
            </div>
          </div>
          <button className="btn btn-danger w-full" style={{ justifyContent: "center" }} onClick={onLogout}>
            <Icon path={Icons.logout} size={16} /> Sign Out
          </button>
        </div>
        <div className="card">
          <div className="card-title">System Info</div>
          {[["Version", "1.0.0"], ["Backend", "Python + Flask"], ["ML Library", "scikit-learn"], ["NLP", "NLTK"], ["Database", "SQLite"], ["Auth", "bcrypt hashed"], ["APIs", "100% Free — No external AI"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
              <span style={{ color: "var(--text2)" }}>{k}</span>
              <span style={{ fontWeight: 600, color: "var(--teal)" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── APP SHELL ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("exam_oracle_user")); } catch { return null; }
  });
  const [page, setPage] = useState(
    () => JSON.parse(localStorage.getItem("exam_oracle_user"))?.role === "teacher"
      ? "teacher" : "dashboard"
  );
  const [showNotifs, setShowNotifs] = useState(false);
  const { unreadCount, reload: reloadNotifs } = useNotifications(user?.id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const NAV = user?.role === "teacher" ? [
    { id: "teacher", label: "Teacher Panel", icon: Icons.students, section: "MAIN" },
    { id:"leaderboard", label:"Leaderboard",    icon:Icons.trophy,   section:"MAIN" },
{ id:"report",      label:"Progress Report", icon:Icons.analytics, section:"MAIN" },
  ] : [
    { id: "dashboard", label: "Dashboard", icon: Icons.dashboard, section: "MAIN" },
    { id: "search", label: "Search", icon: Icons.search, section: "MAIN" },
    { id: "upload", label: "PDF Upload", icon: Icons.upload, section: "MAIN" },   // ← ADD
    { id: "analysis", label: "Analysis", icon: Icons.analytics, section: "MAIN" },   // ← ADD
    { id: "notes", label: "Smart Notes", icon: Icons.notes, section: "MAIN" },
    { id: "quiz", label: "Quiz Mode", icon: Icons.quiz, section: "MAIN" },
    { id: "chatbot", label: "AI Chat", icon: Icons.ai, section: "MAIN" },
    { id: "assignments", label: "Assignments", icon: Icons.exam, section: "MAIN" },
    { id: "timetable", label: "Timetable", icon: Icons.time, section: "MAIN" },
    { id: "attendance", label: "Attendance", icon: Icons.check, section: "MAIN" },
    { id: "classes", label: "My Classes", icon: Icons.students, section: "MAIN" },
    { id:"doubts",  label:"Ask Doubts",   icon:Icons.quiz,      section:"MAIN" },
    { id:"tools",   label:"Study Tools",  icon:Icons.star,     section:"MAIN" },
    { id: "performance", label: "Performance", icon: Icons.analytics, section: "MANAGEMENT" },
    { id: "students", label: "Students", icon: Icons.students, section: "MANAGEMENT" },
    { id: "settings", label: "Settings", icon: Icons.settings, section: "SYSTEM" },
  ];
  const handleLogin = (u) => {
    setUser(u);
    localStorage.setItem("exam_oracle_user", JSON.stringify(u));
    setPage(u.role === "teacher" ? "teacher" : "dashboard");
  };
  const handleLogout = () => { setUser(null); localStorage.removeItem("exam_oracle_user"); setPage("dashboard"); };

  if (!user) return (
    <>
      <style>{CSS}</style>
      <AuthPage onLogin={handleLogin} />
    </>
  );

  const sections = [...new Set(NAV.map(n => n.section))];
  const currentLabel = NAV.find(n => n.id === page)?.label || "Dashboard";

  const renderPage = () => {
    switch (page) {
      case "classes": return <MyClasses user={user} />;
      case "assignments": return <Assignments user={user} />;
      case "attendance": return <AttendanceTracker user={user} />;
      case "teacher": return <TeacherDashboard user={user} />;
      case "timetable": return <Timetable user={user} />;
      case "chatbot": return <Chatbot user={user} />;
      case "search": return <SearchFilter user={user} onNavigate={setPage} />;
      case "performance": return <PerformanceTracking user={user} />;
      case "notes": return <SmartNotes user={user} />;
      case "quiz": return <QuizMode user={user} />;
      case "analysis": return <AnalysisPage user={user} />;
      case "dashboard": return <Dashboard user={user} />;
      case "upload": return <PDFUpload user={user} />;
      case "students": return <StudentsPage />;
      case "doubts": return <DoubtQA     user={user} />;
      case "tools":  return <StudyTools  user={user} />;
      case "leaderboard": return <Leaderboard    user={user} />;
case "report":      return <ProgressReport user={user} />;
      case "settings": return <SettingsPage user={user} onLogout={handleLogout} />;
      default: return <Dashboard user={user} />;
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="app-layout">
        {/* Mobile overlay */}
        <div className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`} onClick={() => setSidebarOpen(false)} />

        {/* Sidebar */}
        <nav className={`sidebar ${sidebarOpen ? "mobile-open" : ""}`}>
          <div className="sidebar-logo">
            <img src={require("./favicon.png")} alt="logo"
              style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover" }} />
            <div>
              <div className="logo-text">Exam Oracle</div>
              <div style={{ fontSize: 10, color: "var(--text3)" }}>ML Study System</div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", paddingBottom: 8 }}>
            {sections.map(sec => (
              <div key={sec} className="sidebar-section">
                <div className="sidebar-label">{sec}</div>
                {NAV.filter(n => n.section === sec).map(n => (
                  <div key={n.id}
                    className={`nav-item ${page === n.id ? "active" : ""}`}
                    onClick={() => { setPage(n.id); setSidebarOpen(false); }}>
                    <Icon path={n.icon} size={17} color={page === n.id ? "var(--purple)" : "var(--text3)"} />
                    {n.label}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="sidebar-user" onClick={() => { setPage("settings"); setSidebarOpen(false); }}>
            <Av name={user.name} size={36} />
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
              <div style={{ fontSize: 11, color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
            </div>
            <div onClick={e => { e.stopPropagation(); handleLogout(); }}>
              <Icon path={Icons.logout} size={16} color="var(--text3)" />
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="main-content">
          <div className="topbar">
            <button className="icon-btn menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Icon path={sidebarOpen ? Icons.close : Icons.menu} size={18} />
            </button>
            <div className="topbar-title">
              <h1>{currentLabel}</h1>
              <p>Exam Oracle · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}</p>
            </div>
            <div className="search-box">
              <Icon path={Icons.search} size={14} color="var(--text3)" />
              <input placeholder="Search topics..." />
            </div>
            <div className="icon-btn" style={{ position: "relative" }} onClick={() => setShowNotifs(!showNotifs)}>
              <Icon path={Icons.bell} size={18} />
              {unreadCount > 0 && (
                <div className="notif-dot" style={{ background: "var(--danger)" }}>{unreadCount}</div>
              )}
            </div>
            <ThemeToggle/>
            {showNotifs && <NotificationsPanel userId={user?.id} onClose={() => setShowNotifs(false)} />}
            <Av name={user.name} size={34} />
          </div>

          {renderPage()}
        </main>
      </div>
    </>
  );
}