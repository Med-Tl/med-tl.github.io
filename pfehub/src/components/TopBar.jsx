import { useState } from "react";
import { useNotifications } from "../hooks/useFirestore";
import { markNotificationRead, markAllNotificationsRead } from "../services/firestoreService";
import { useAuth } from "../context/AuthContext";
import { Badge } from "./UI";

const PAGE_TITLES = {
  dashboard:   "Dashboard",
  projects:    "Projects",
  tasks:       "Tasks",
  labs:        "Labs",
  resources:   "Resource Library",
  submissions: "Submissions",
  students:    "Students",
  analytics:   "Analytics",
};

const NOTIF_ICONS = {
  task:     "☑",
  grade:    "⭐",
  deadline: "⏰",
  resource: "📚",
  feedback: "💬",
  system:   "🔔",
};

export default function TopBar({ active, onToggleSidebar, search, setSearch }) {
  const { profile } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const [showNotif, setShowNotif] = useState(false);

  const handleNotifClick = async (n) => {
    if (!n.read) await markNotificationRead(n.id);
  };

  const handleMarkAll = async () => {
    if (profile?.id) await markAllNotificationsRead(profile.id);
  };

  const fmtTime = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <header style={{
      height: 62, display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", borderBottom: "1px solid rgba(255,255,255,0.07)",
      background: "rgba(5,8,18,0.85)", backdropFilter: "blur(20px)",
      position: "sticky", top: 0, zIndex: 50,
    }}>
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button
          onClick={onToggleSidebar}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.55)", fontSize: 20, cursor: "pointer", padding: "4px 6px", borderRadius: 8, lineHeight: 1, transition: "color 0.2s" }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
          onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.55)"}
        >☰</button>
        <h1 style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em", fontFamily: "'Syne', sans-serif" }}>
          {PAGE_TITLES[active] || "PFEHub"}
        </h1>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Search */}
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "rgba(255,255,255,0.3)", pointerEvents: "none" }}>🔍</span>
          <input
            className="input-field"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 190, paddingLeft: 32, padding: "8px 14px 8px 32px", fontSize: 13 }}
          />
        </div>

        {/* Bell */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotif((p) => !p)}
            style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, cursor: "pointer", position: "relative", transition: "all 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          >
            🔔
            {unreadCount > 0 && (
              <span style={{ position: "absolute", top: -5, right: -5, background: "#ef4444", color: "#fff", borderRadius: "50%", width: 17, height: 17, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, border: "2px solid #050812" }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showNotif && (
            <div style={{
              position: "absolute", right: 0, top: 46, width: 360,
              background: "rgba(8,12,24,0.97)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              zIndex: 200, animation: "fadeUp 0.2s ease",
            }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 800, fontSize: 14 }}>Notifications</span>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {unreadCount > 0 && <Badge color="red">{unreadCount} new</Badge>}
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAll} style={{ background: "none", border: "none", color: "#22d3ee", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Mark all read</button>
                  )}
                </div>
              </div>
              <div style={{ maxHeight: 360, overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "30px 20px", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      style={{
                        padding: "13px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)",
                        background: n.read ? "transparent" : "rgba(34,211,238,0.04)",
                        cursor: "pointer", transition: "background 0.2s",
                        display: "flex", gap: 12, alignItems: "flex-start",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = n.read ? "transparent" : "rgba(34,211,238,0.04)"}
                    >
                      <span style={{ fontSize: 18, marginTop: 1, flexShrink: 0 }}>{NOTIF_ICONS[n.type] || "🔔"}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, color: n.read ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.88)", lineHeight: 1.45 }}>{n.message}</p>
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>{fmtTime(n.createdAt)}</p>
                      </div>
                      {!n.read && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22d3ee", flexShrink: 0, marginTop: 5 }} />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #22d3ee30, #6366f130)", border: "1px solid rgba(34,211,238,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#22d3ee" }}>
          {profile?.avatar || "?"}
        </div>
      </div>
    </header>
  );
}
