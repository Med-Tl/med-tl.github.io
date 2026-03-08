import { useAuth } from "../context/AuthContext";
import { useProjects, useTasks, useSubmissions, useNotifications } from "../hooks/useFirestore";
import { StatCard, ProgressBar, Badge, Spinner, glass } from "../components/UI";

const NOTIF_ICONS = { task: "☑", grade: "⭐", deadline: "⏰", resource: "📚", feedback: "💬" };

export default function StudentDashboard({ setActive }) {
  const { profile } = useAuth();
  const { data: projects, loading: loadP } = useProjects();
  const { data: tasks, loading: loadT } = useTasks();
  const { data: submissions, loading: loadS } = useSubmissions();
  const { notifications, unreadCount } = useNotifications();

  const completedTasks = tasks.filter((t) => t.status === "completed");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const mySubmissions = submissions;

  const myGrades = mySubmissions.filter((s) => s.grade != null).map((s) => s.grade);
  const avgGrade = myGrades.length
    ? (myGrades.reduce((a, b) => a + b, 0) / myGrades.length).toFixed(1)
    : "—";

  const daysLeft = (deadline) => {
    if (!deadline) return null;
    const d = new Date(deadline) - new Date();
    return Math.ceil(d / (1000 * 60 * 60 * 24));
  };

  const fmtDate = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  };

  if (loadP && loadT && loadS) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <div style={{ padding: "32px" }}>
      <div style={{ marginBottom: 32, animation: "fadeUp 0.5s ease" }}>
        <h2 style={{ fontSize: 27, fontWeight: 800, marginBottom: 5, letterSpacing: "-0.02em" }}>
          Hey, {profile?.name?.split(" ")[0]} 👋
        </h2>
        <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 14 }}>
          Track your projects, tasks, and submissions.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 28, animation: "fadeUp 0.5s 0.1s ease both" }}>
        <StatCard label="Projects" value={projects.length || 0} icon="◈" color="#22d3ee" />
        <StatCard label="Tasks Done" value={completedTasks.length} icon="✓" color="#4ade80" subtitle={`of ${tasks.length} total`} />
        <StatCard label="Submissions" value={mySubmissions.length} icon="📤" color="#a78bfa" />
        <StatCard label="Avg Grade" value={avgGrade !== "—" ? `${avgGrade}/20` : "—"} icon="⭐" color="#f59e0b" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18, animation: "fadeUp 0.5s 0.2s ease both" }}>
        {/* Active Project */}
        <div style={{ ...glass, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>My Project</h3>
          {projects.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>No project assigned yet</p>
            </div>
          ) : (
            projects.slice(0, 1).map((p) => {
              const pct = tasks.length
                ? Math.round((completedTasks.length / tasks.length) * 100)
                : 0;
              return (
                <div key={p.id}>
                  <Badge color="green" size="sm">Active</Badge>
                  <h4 style={{ fontSize: 16, fontWeight: 800, margin: "10px 0 8px", lineHeight: 1.3 }}>{p.title}</h4>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
                    {p.description?.substring(0, 140)}…
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>Overall progress</span>
                    <span style={{ fontWeight: 800, color: "#22d3ee", fontFamily: "'Space Mono', monospace" }}>{pct}%</span>
                  </div>
                  <ProgressBar value={pct} color="#22d3ee" height={8} />
                </div>
              );
            })
          )}
        </div>

        {/* Notifications */}
        <div style={{ ...glass, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800 }}>Notifications</h3>
            {unreadCount > 0 && <Badge color="red">{unreadCount} new</Badge>}
          </div>
          {notifications.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>All clear 🎉</p>
          ) : (
            notifications.slice(0, 5).map((n) => (
              <div key={n.id} style={{ display: "flex", gap: 10, marginBottom: 12, opacity: n.read ? 0.5 : 1 }}>
                <span style={{ fontSize: 16, marginTop: 1, flexShrink: 0 }}>{NOTIF_ICONS[n.type] || "🔔"}</span>
                <div>
                  <p style={{ fontSize: 12, lineHeight: 1.45, color: n.read ? "rgba(255,255,255,0.5)" : "#fff" }}>{n.message}</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 3, fontFamily: "'JetBrains Mono', monospace" }}>
                    {fmtDate(n.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Task Timeline */}
      <div style={{ ...glass, padding: 24, animation: "fadeUp 0.5s 0.3s ease both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800 }}>Task Timeline</h3>
          <button className="btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => setActive("tasks")}>View All →</button>
        </div>
        {tasks.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No tasks assigned</p>
        ) : (
          tasks.map((t, i) => {
            const days = daysLeft(t.deadline);
            const submitted = mySubmissions.some((s) => s.taskId === t.id);
            return (
              <div key={t.id} style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "14px 0",
                borderBottom: i < tasks.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}>
                {/* Status icon */}
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                  background: t.status === "completed" ? "rgba(74,222,128,0.15)" : t.status === "in_progress" ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${t.status === "completed" ? "rgba(74,222,128,0.4)" : t.status === "in_progress" ? "rgba(251,191,36,0.4)" : "rgba(255,255,255,0.1)"}`,
                }}>
                  {t.status === "completed" ? "✓" : t.status === "in_progress" ? "⏳" : "○"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{t.title}</span>
                    {submitted && <Badge color="green" size="sm">Submitted</Badge>}
                  </div>
                  <div style={{ display: "flex", gap: 14, fontSize: 11, color: "rgba(255,255,255,0.38)", fontFamily: "'JetBrains Mono', monospace" }}>
                    <span>📅 {t.deadline}</span>
                    {days !== null && (
                      <span style={{ color: days < 0 ? "#f87171" : days <= 3 ? "#fbbf24" : "inherit" }}>
                        {days < 0 ? `⚠ ${Math.abs(days)}d overdue` : days === 0 ? "Due today!" : `${days}d left`}
                      </span>
                    )}
                  </div>
                </div>
                <Badge color={t.status === "completed" ? "green" : t.status === "in_progress" ? "amber" : "gray"}>
                  {t.status.replace("_", " ")}
                </Badge>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
