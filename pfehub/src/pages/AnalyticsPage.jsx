import { useAnalytics, useSubmissions, useStudents, useTasks } from "../hooks/useFirestore";
import { StatCard, ProgressBar, Badge, Spinner, glass } from "../components/UI";

export default function AnalyticsPage() {
  const { data: analytics, loading: loadA } = useAnalytics();
  const { data: submissions } = useSubmissions();
  const { data: students } = useStudents();
  const { data: tasks } = useTasks();

  // Grade distribution
  const graded = submissions.filter((s) => s.grade != null);
  const gradeDist = [
    { range: "18–20 (Excellent)", count: graded.filter(s => s.grade >= 18).length, color: "#4ade80" },
    { range: "15–17 (Good)", count: graded.filter(s => s.grade >= 15 && s.grade < 18).length, color: "#22d3ee" },
    { range: "12–14 (Average)", count: graded.filter(s => s.grade >= 12 && s.grade < 15).length, color: "#fbbf24" },
    { range: "0–11 (Below avg)", count: graded.filter(s => s.grade < 12).length, color: "#f87171" },
  ];
  const maxGradeCount = Math.max(...gradeDist.map(g => g.count), 1);

  // Top students by avg grade
  const studentGrades = {};
  graded.forEach((s) => {
    if (!studentGrades[s.studentId]) studentGrades[s.studentId] = { grades: [], name: s.studentName };
    studentGrades[s.studentId].grades.push(s.grade);
  });
  const topStudents = Object.entries(studentGrades)
    .map(([id, { grades, name }]) => ({
      id, name,
      avg: (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(1),
      count: grades.length,
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 6);

  const avgGrade = graded.length
    ? (graded.reduce((a, s) => a + s.grade, 0) / graded.length).toFixed(1)
    : "—";

  const completionRate = tasks.length
    ? Math.round((tasks.filter(t => t.status === "completed").length / tasks.length) * 100)
    : 0;

  // Simulated weekly data (last 7 days)
  const weekData = [3, 7, 5, 12, 8, 4, 9];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxWeek = Math.max(...weekData, 1);

  if (loadA) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
      <Spinner size={40} />
    </div>
  );

  return (
    <div style={{ padding: "32px" }}>
      <div style={{ marginBottom: 32, animation: "fadeUp 0.4s ease" }}>
        <h2 style={{ fontSize: 23, fontWeight: 800, marginBottom: 3 }}>Analytics</h2>
        <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>Platform-wide statistics and performance overview</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 28, animation: "fadeUp 0.4s 0.1s ease both" }}>
        <StatCard label="Total Students" value={analytics?.totalStudents ?? students.length} icon="👥" color="#22d3ee" />
        <StatCard label="Total Submissions" value={analytics?.totalSubmissions ?? submissions.length} icon="📥" color="#6366f1" />
        <StatCard label="Completion Rate" value={`${completionRate}%`} icon="✓" color="#4ade80" />
        <StatCard label="Avg Grade" value={avgGrade !== "—" ? `${avgGrade}/20` : "—"} icon="⭐" color="#f59e0b" />
        <StatCard label="Pending Reviews" value={submissions.filter(s => s.status === "pending").length} icon="⏳" color="#fbbf24" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18, animation: "fadeUp 0.4s 0.2s ease both" }}>
        {/* Weekly submissions bar chart */}
        <div style={{ ...glass, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20 }}>Weekly Submissions (last 7 days)</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 130, paddingBottom: 8 }}>
            {weekData.map((v, i) => {
              const pct = (v / maxWeek) * 100;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
                  <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                    <div style={{
                      width: "100%", borderRadius: "5px 5px 0 0",
                      height: `${pct}%`, minHeight: 4,
                      background: `linear-gradient(to top, #22d3ee, #6366f1)`,
                      boxShadow: "0 0 12px rgba(34,211,238,0.3)",
                      transition: "height 0.8s cubic-bezier(0.4,0,0.2,1)",
                    }} />
                  </div>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>{days[i]}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{v}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Students */}
        <div style={{ ...glass, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20 }}>Top Students by Grade</h3>
          {topStudents.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No grades yet</p>
          ) : (
            topStudents.map((s, i) => {
              const colors = ["#fbbf24", "#94a3b8", "#a78bfa", "#22d3ee", "#4ade80", "#f87171"];
              const medalColors = ["#fbbf24", "#c0c0c0", "#cd7f32"];
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <span style={{ fontSize: 13, color: medalColors[i] || "rgba(255,255,255,0.25)", fontWeight: 800, width: 20, textAlign: "center", fontFamily: "'Space Mono', monospace" }}>
                    {i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${i + 1}`}
                  </span>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${colors[i] || "#22d3ee"}18`, border: `1px solid ${colors[i] || "#22d3ee"}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: colors[i] || "#22d3ee" }}>
                    {s.name?.[0] || "?"}
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name || "Unknown"}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{s.count} grade{s.count !== 1 ? "s" : ""}</div>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: parseFloat(s.avg) >= 15 ? "#4ade80" : parseFloat(s.avg) >= 10 ? "#fbbf24" : "#f87171", fontFamily: "'Space Mono', monospace" }}>
                    {s.avg}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Grade Distribution */}
      <div style={{ ...glass, padding: 24, animation: "fadeUp 0.4s 0.3s ease both" }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20 }}>Grade Distribution ({graded.length} graded)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 18 }}>
          {gradeDist.map((g) => {
            const pct = maxGradeCount ? Math.round((g.count / maxGradeCount) * 100) : 0;
            return (
              <div key={g.range}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{g.range}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: g.color, fontFamily: "'Space Mono', monospace" }}>{g.count}</span>
                </div>
                <ProgressBar value={pct} color={g.color} height={10} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Completion */}
      <div style={{ ...glass, padding: 24, marginTop: 18, animation: "fadeUp 0.4s 0.35s ease both" }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20 }}>Task Status Overview ({tasks.length} total)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 18 }}>
          {[
            { label: "Completed", val: tasks.filter(t => t.status === "completed").length, color: "#4ade80" },
            { label: "In Progress", val: tasks.filter(t => t.status === "in_progress").length, color: "#fbbf24" },
            { label: "Pending", val: tasks.filter(t => t.status === "pending").length, color: "#94a3b8" },
          ].map((item) => (
            <div key={item.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{item.label}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: item.color, fontFamily: "'Space Mono', monospace" }}>
                  {item.val} {tasks.length > 0 && <span style={{ fontSize: 11, opacity: 0.6 }}>({Math.round(item.val / tasks.length * 100)}%)</span>}
                </span>
              </div>
              <ProgressBar value={tasks.length ? (item.val / tasks.length) * 100 : 0} color={item.color} height={10} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
