import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import { useNotifications } from "./hooks/useFirestore";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ProjectsPage from "./pages/ProjectsPage";
import TasksPage from "./pages/TasksPage";
import LabsPage from "./pages/LabsPage";
import ResourcesPage from "./pages/ResourcesPage";
import SubmissionsPage from "./pages/SubmissionsPage";
import StudentsPage from "./pages/StudentsPage";
import AnalyticsPage from "./pages/AnalyticsPage";

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-size: 16px; }
    body {
      background: #070b14;
      color: #e2e8f0;
      font-family: 'Syne', sans-serif;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }

    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }

    input, textarea, select, button { font-family: 'Syne', sans-serif; }
    a { color: inherit; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .btn-primary {
      background: linear-gradient(135deg, #22d3ee, #6366f1);
      border: none; color: #fff; padding: 11px 26px;
      border-radius: 10px; font-weight: 800; font-size: 13px;
      letter-spacing: 0.01em; cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 18px rgba(34,211,238,0.25);
      font-family: 'Syne', sans-serif;
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 28px rgba(34,211,238,0.4);
    }
    .btn-primary:disabled {
      opacity: 0.55; cursor: not-allowed;
    }

    .btn-ghost {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.65);
      padding: 10px 22px; border-radius: 10px;
      font-weight: 700; font-size: 13px; cursor: pointer;
      transition: all 0.2s ease;
      font-family: 'Syne', sans-serif;
    }
    .btn-ghost:hover {
      background: rgba(255,255,255,0.1);
      color: #fff;
      border-color: rgba(255,255,255,0.2);
    }

    .input-field {
      width: 100%;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 11px 15px;
      color: #fff;
      font-size: 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
      font-family: 'Syne', sans-serif;
    }
    .input-field:focus {
      border-color: #22d3ee;
      box-shadow: 0 0 0 3px rgba(34,211,238,0.12);
      outline: none;
    }
    .input-field::placeholder { color: rgba(255,255,255,0.28); }
    .input-field option { background: #0d1220; color: #fff; }

    .card-hover {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .card-hover:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 50px rgba(0,0,0,0.45);
    }

    /* Background grid */
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
      background-size: 60px 60px;
    }
  `}</style>
);

// ─── BACKGROUND ───────────────────────────────────────────────────────────────
const BgOrbs = () => (
  <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
    <div style={{ position: "absolute", top: "-20%", left: "-10%", width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 68%)" }} />
    <div style={{ position: "absolute", bottom: "-15%", right: "-5%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.055) 0%, transparent 68%)" }} />
    <div style={{ position: "absolute", top: "45%", left: "55%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.035) 0%, transparent 68%)" }} />
  </div>
);

// ─── APP SHELL ────────────────────────────────────────────────────────────────
function AppShell() {
  const { user, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");

  if (!user) return <AuthPage />;

  const renderPage = () => {
    switch (active) {
      case "dashboard":
        return isAdmin
          ? <AdminDashboard setActive={setActive} />
          : <StudentDashboard setActive={setActive} />;
      case "projects":    return <ProjectsPage search={search} />;
      case "tasks":       return <TasksPage search={search} />;
      case "labs":        return <LabsPage search={search} />;
      case "resources":   return <ResourcesPage search={search} />;
      case "submissions": return <SubmissionsPage search={search} />;
      case "students":    return <StudentsPage search={search} />;
      case "analytics":   return <AnalyticsPage />;
      default:            return null;
    }
  };

  return (
    <>
      <BgOrbs />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Sidebar
          active={active}
          setActive={(p) => { setActive(p); setSearch(""); }}
          unreadCount={unreadCount}
          open={sidebarOpen}
        />
        <div style={{
          marginLeft: sidebarOpen ? 232 : 0,
          minHeight: "100vh",
          transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}>
          <TopBar
            active={active}
            onToggleSidebar={() => setSidebarOpen((p) => !p)}
            search={search}
            setSearch={setSearch}
          />
          <main style={{ minHeight: "calc(100vh - 62px)" }}>
            {renderPage()}
          </main>
        </div>
      </div>
    </>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <GlobalStyle />
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </>
  );
}
