import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useProjects, useSubmissions, useTasks } from "../hooks/useFirestore";
import { getAnalyticsData } from "../services/firestoreService";
import { StatCard, ProgressBar, Badge, Spinner, glass } from "../components/UI";

export default function AdminDashboard({ setActive }) {
  const { profile } = useAuth();
  const { data: projects, loading: loadP } = useProjects();
  const { data: submissions, loading: loadS } = useSubmissions();
  const { data: tasks, loading: loadT } = useTasks();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    getAnalyticsData().then(setAnalytics).catch(console.error);
  }, []);

  const activeProjects = projects.filter((p) => p.status === "active");
  const pendingSubs = submissions.filter((s) => s.status === "pending");
  const gradedSubs = submissions.filter((s) => s.status === "graded");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const gradeValues = submissions.filter((s) => s.grade != null).map((s) => s.grade);
  const avgGrade = gradeValues.length
    ? (gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length).toFixed(1)
    : "—";

  if (loadP && loadS && loadT) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <div style={{ padding: "32px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32, animation: "fadeUp 0.5s ease" }}>
        <h2 style={{ fontSize: 27, fontWeight: 800, marginBottom: 5, letterSpacing: "-0.02em" }}>
          Good to see you, {profile?.name?.split(" ")[0]} 👋
        </h2>
        <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 14 }}>
          Here's your platform overview for today.
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 28, animation: "fadeUp 0.5s 0.1s ease both" }}>
        <StatCard label="Active Projects" value={activeProjects.length} icon="◈" color="#22d3ee" delta={`${projects.length} total`} />
        <StatCard label="Total Tasks" value={tasks.length} icon="☑" color="#6366f1" subtitle={`${completedTasks.length} completed`} />
        <StatCard label="Submissions" value={submissions.length} icon="📥" color="#a78bfa" subtitle={`${pendingSubs.length} pending review`} />
        <StatCard label="Avg Grade" value={avgGrade !== "—" ? `${avgGrade}/20` : "—"} icon="⭐" color="#f59e0b" />
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18, animation: "fadeUp 0.5s 0.2s ease both" }}>
        {/* Projects */}
        <div style={{ ...glass, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800 }}>Projects</h3>
            <button className="btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => setActive("projects")}>View All →</button>
          </div>
          {projects.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No projects yet</p>
          ) : (
            projects.slice(0, 4).map((p) => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{p.title}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>👥 {(p.students || []).length} students</p>
                </div>
                <Badge color={p.status === "active" ? "green" : "gray"}>{p.status}</Badge>
              </div>
            ))
          )}
        </div>

        {/* Pending Reviews */}
        <div style={{ ...glass, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800 }}>Pending Reviews</h3>
            {pendingSubs.length > 0 && <Badge color="amber">{pendingSubs.length}</Badge>}
          </div>
          {pendingSubs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>✅</div>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>All caught up!</p>
            </div>
          ) : (
            pendingSubs.slice(0, 4).map((s) => (
              <div key={s.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(34,211,238,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                  {s.type === "pdf" ? "📄" : s.type === "zip" ? "🗜" : "🔗"}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.studentName || "Student"}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>{s.fileName || "Submission"}</p>
                </div>
                <button className="btn-primary" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => setActive("submissions")}>Review</button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Task Completion Chart */}
      <div style={{ ...glass, padding: 24, animation: "fadeUp 0.5s 0.3s ease both" }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20 }}>Task Completion by Status</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
          {[
            { label: "Completed", count: tasks.filter(t => t.status === "completed").length, total: tasks.length, color: "#4ade80" },
            { label: "In Progress", count: tasks.filter(t => t.status === "in_progress").length, total: tasks.length, color: "#fbbf24" },
            { label: "Pending", count: tasks.filter(t => t.status === "pending").length, total: tasks.length, color: "#94a3b8" },
          ].map((item) => {
            const pct = tasks.length ? Math.round((item.count / tasks.length) * 100) : 0;
            return (
              <div key={item.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: item.color, fontFamily: "'Space Mono', monospace" }}>
                    {item.count} <span style={{ fontSize: 11, opacity: 0.6 }}>({pct}%)</span>
                  </span>
                </div>
                <ProgressBar value={pct} color={item.color} height={8} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
