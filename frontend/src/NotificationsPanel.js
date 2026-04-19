import { useState, useEffect } from "react";

const CSS = `
  .notif-panel { position:fixed; top:64px; right:16px; width:380px; background:var(--card); border:1px solid var(--border); border-radius:16px; box-shadow:0 20px 60px rgba(0,0,0,0.4); z-index:1000; max-height:500px; display:flex; flex-direction:column; animation:slideIn 0.2s ease; font-family:'Sora',sans-serif; }
  @keyframes slideIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
  .notif-header { padding:16px 18px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; }
  .notif-title { font-size:15px; font-weight:700; }
  .notif-actions { display:flex; gap:8px; align-items:center; }
  .notif-mark-all { font-size:11px; color:var(--purple); cursor:pointer; font-weight:600; }
  .notif-close { width:24px; height:24px; border-radius:6px; border:1px solid var(--border2); background:var(--card2); display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:12px; }
  .notif-list { overflow-y:auto; flex:1; }
  .notif-item { padding:14px 18px; border-bottom:1px solid var(--border); cursor:pointer; transition:background 0.2s; display:flex; gap:12px; align-items:flex-start; }
  .notif-item:hover { background:rgba(255,255,255,0.03); }
  .notif-item.unread { background:rgba(124,92,252,0.04); }
  .notif-item:last-child { border-bottom:none; }
  .notif-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
  .notif-content { flex:1; }
  .notif-item-title { font-size:13px; font-weight:600; margin-bottom:3px; }
  .notif-item-msg { font-size:12px; color:var(--text3); line-height:1.5; }
  .notif-time { font-size:10px; color:var(--text3); margin-top:4px; }
  .notif-dot { width:7px; height:7px; border-radius:50%; background:var(--purple); flex-shrink:0; margin-top:6px; }
  .notif-empty { text-align:center; padding:40px; color:var(--text3); font-size:13px; }
  @media(max-width:420px) { .notif-panel{width:calc(100vw - 32px);right:16px;} }
`;

const BASE = "http://localhost:5000/api";

const TYPE_CONFIG = {
  assignment: { icon:"📚", color:"rgba(124,92,252,0.1)" },
  reminder:   { icon:"⏰", color:"rgba(245,158,11,0.1)" },
  grade:      { icon:"⭐", color:"rgba(0,212,170,0.1)" },
  doubt:      { icon:"❓", color:"rgba(255,107,53,0.1)" },
  info:       { icon:"ℹ️", color:"rgba(90,95,122,0.1)" },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days  > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins  > 0) return `${mins}m ago`;
  return "Just now";
}

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);

  const load = async () => {
    try {
      const res  = await fetch(`${BASE}/notifications/user/${userId}`);
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count    || 0);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [userId]);

  return { notifications, unreadCount, reload: load };
}

export default function NotificationsPanel({ userId, onClose }) {
  const { notifications, unreadCount, reload } = useNotifications(userId);

  const markRead = async (id) => {
    await fetch(`${BASE}/notifications/read/${id}`, { method:"POST" });
    reload();
  };

  const markAllRead = async () => {
    await fetch(`${BASE}/notifications/read-all/${userId}`, { method:"POST" });
    reload();
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="notif-panel">
        <div className="notif-header">
          <div className="notif-title">
            🔔 Notifications
            {unreadCount > 0 && (
              <span style={{ marginLeft:8, fontSize:11, padding:"2px 8px", borderRadius:20, background:"var(--purple)", color:"#fff", fontWeight:700 }}>
                {unreadCount}
              </span>
            )}
          </div>
          <div className="notif-actions">
            {unreadCount > 0 && <span className="notif-mark-all" onClick={markAllRead}>Mark all read</span>}
            <div className="notif-close" onClick={onClose}>✕</div>
          </div>
        </div>

        <div className="notif-list">
          {notifications.length === 0 ? (
            <div className="notif-empty">
              <div style={{ fontSize:32, marginBottom:8 }}>🔔</div>
              No notifications yet
            </div>
          ) : (
            notifications.map(n => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
              return (
                <div key={n.id}
                  className={`notif-item ${!n.is_read ? "unread" : ""}`}
                  onClick={() => !n.is_read && markRead(n.id)}>
                  <div className="notif-icon" style={{ background: cfg.color }}>{cfg.icon}</div>
                  <div className="notif-content">
                    <div className="notif-item-title">{n.title}</div>
                    {n.message && <div className="notif-item-msg">{n.message}</div>}
                    <div className="notif-time">{timeAgo(n.created_at)}</div>
                  </div>
                  {!n.is_read && <div className="notif-dot" />}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
