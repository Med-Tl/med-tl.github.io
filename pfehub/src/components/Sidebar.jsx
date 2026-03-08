import { useAuth } from "../context/AuthContext";
import { Badge } from "./UI";

const NAV_ADMIN = [
  { id: "dashboard",   icon: "▦",  label: "Dashboard"      },
  { id: "projects",    icon: "◈",  label: "Projects"        },
  { id: "tasks",       icon: "☑",  label: "Tasks"           },
  { id: "labs",        icon: "⚗",  label: "Labs"            },
  { id: "resources",   icon: "📚", label: "Resources"       },
  { id: "submissions", icon: "📥", label: "Submissions"     },
  { id: "students",    icon: "👥", label: "Students"        },
  { id: "analytics",   icon: "◉",  label: "Analytics"       },
];

const NAV_STUDENT = [
  { id: "dashboard",   icon: "▦",  label: "Dashboard"      },
  { id: "projects",    icon: "◈",  label: "My Project"      },
  { id: "tasks",       icon: "☑",  label: "Tasks"           },
  { id: "labs",        icon: "⚗",  label: "Labs"            },
  { id: "resources",   icon: "📚", label: "Resources"       },
  { id: "submissions", icon: "📤", label: "My Submissions"  },
];

export default function Sidebar({ active, setActive, unreadCount, open }) {
  const { profile, isAdmin, logout } = useAuth();
  const nav = isAdmin ? NAV_ADMIN : NAV_STUDENT;

  return (
    <aside style={{
      width: 232, minHeight: "100vh", position: "fixed", left: 0, top: 0, zIndex: 100,
      background: "rgba(5,8,18,0.97)",
      borderRight: "1px solid rgba(255,255,255,0.07)",
      backdropFilter: "blur(30px)",
      display: "flex", flexDirection: "column",
      transform: open ? "translateX(0)" : "translateX(-100%)",
      transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
    }}>

      {/* Logo */}
      <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #22d3ee, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0, boxShadow: "0 0 20px rgba(34,211,238,0.3)" }}>⚡</div>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", fontFamily: "'Syne', sans-serif" }}>
            PFE<span style={{ color: "#22d3ee" }}>Hub</span>
          </span>
        </div>
      </div>

      {/* User */}
      <div style={{ padding: "15px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #22d3ee40, #6366f140)", border: "1px solid rgba(34,211,238,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#22d3ee", flexShrink: 0 }}>
            {profile?.avatar || "?"}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {profile?.name?.split(" ").slice(0, 2).join(" ") || "User"}
            </div>
            <div style={{ marginTop: 3 }}>
              <Badge color={isAdmin ? "purple" : "cyan"} size="sm">{isAdmin ? "Admin" : "Student"}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 10px", overflowY: "auto" }}>
        {nav.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 11,
              padding: "10px 12px", borderRadius: 10, border: "none",
              color: active === item.id ? "#22d3ee" : "rgba(255,255,255,0.48)",
              background: active === item.id ? "rgba(34,211,238,0.12)" : "transparent",
              textAlign: "left", marginBottom: 2, fontSize: 13, fontWeight: 600,
              cursor: "pointer", transition: "all 0.18s ease",
              fontFamily: "'Syne', sans-serif",
            }}
            onMouseEnter={(e) => { if (active !== item.id) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = active !== item.id ? "rgba(255,255,255,0.75)" : "#22d3ee"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = active === item.id ? "rgba(34,211,238,0.12)" : "transparent"; e.currentTarget.style.color = active === item.id ? "#22d3ee" : "rgba(255,255,255,0.48)"; }}
          >
            <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
            {item.label}
            {item.id === "dashboard" && unreadCount > 0 && (
              <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Sign out */}
      <div style={{ padding: "10px 10px 18px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button
          onClick={logout}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 10, border: "none", color: "rgba(255,255,255,0.35)", background: "transparent", textAlign: "left", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Syne', sans-serif", transition: "all 0.18s" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(239,68,68,0.07)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "transparent"; }}
        >
          <span style={{ fontSize: 16, width: 22, textAlign: "center" }}>↩</span> Sign Out
        </button>
      </div>
    </aside>
  );
}
