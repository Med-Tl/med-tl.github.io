import { useStudents } from "../hooks/useFirestore";
import { glass, Badge, EmptyState, Spinner } from "../components/UI";

export default function StudentsPage({ search }) {
  const { data: students, loading } = useStudents();

  const filtered = students.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const fmtDate = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-GB");
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
      <Spinner size={40} />
    </div>
  );

  return (
    <div style={{ padding: "32px" }}>
      <div style={{ marginBottom: 28, animation: "fadeUp 0.4s ease" }}>
        <h2 style={{ fontSize: 23, fontWeight: 800, marginBottom: 3 }}>Students</h2>
        <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>{filtered.length} registered student{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="👥" title="No students yet" subtitle="Students will appear here after registration" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, animation: "fadeUp 0.4s 0.1s ease both" }}>
          {filtered.map((s) => (
            <div key={s.id} className="card-hover" style={{ ...glass, padding: 22, display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, rgba(34,211,238,0.2), rgba(99,102,241,0.2))",
                border: "1px solid rgba(34,211,238,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 800, color: "#22d3ee",
              }}>
                {s.avatar || s.name?.[0] || "?"}
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</h4>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.email}</p>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Badge color="cyan" size="sm">Student</Badge>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>Joined {fmtDate(s.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
