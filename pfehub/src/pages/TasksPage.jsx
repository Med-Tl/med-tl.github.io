import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTasks, useProjects, useSubmissions } from "../hooks/useFirestore";
import { createTask, updateTask, deleteTask } from "../services/firestoreService";
import { glass, Badge, EmptyState, Spinner, Modal } from "../components/UI";

const STATUS_COLOR = { completed: "green", in_progress: "amber", pending: "gray" };

export default function TasksPage({ search }) {
  const { profile, isAdmin } = useAuth();
  const { data: tasks, loading, reload } = useTasks();
  const { data: projects } = useProjects();
  const { data: submissions } = useSubmissions();

  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", deadline: "", projectId: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const daysLeft = (dl) => {
    if (!dl) return null;
    return Math.ceil((new Date(dl) - new Date()) / 86400000);
  };

  const filtered = tasks.filter((t) => {
    const matchSearch = t.title?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || t.status === filter;
    return matchSearch && matchFilter;
  });

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const openCreate = () => {
    setForm({ title: "", description: "", deadline: "", projectId: projects[0]?.id || "" });
    setEditTarget(null); setShowForm(true);
  };

  const openEdit = (t) => {
    setForm({ title: t.title, description: t.description, deadline: t.deadline, projectId: t.projectId });
    setEditTarget(t); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.deadline) { setError("Title and deadline are required."); return; }
    setSaving(true); setError("");
    try {
      if (editTarget) {
        await updateTask(editTarget.id, form);
      } else {
        await createTask({ ...form, teacherId: profile.id });
      }
      await reload();
      setShowForm(false);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this task?")) return;
    await deleteTask(id);
    await reload();
  };

  const getMySubmission = (taskId) => submissions.find((s) => s.taskId === taskId && s.studentId === profile?.id);

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}><Spinner size={40} /></div>;

  return (
    <div style={{ padding: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, animation: "fadeUp 0.4s ease" }}>
        <div>
          <h2 style={{ fontSize: 23, fontWeight: 800, marginBottom: 3 }}>Tasks</h2>
          <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>{filtered.length} task{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        {isAdmin && <button className="btn-primary" onClick={openCreate}>+ New Task</button>}
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap", animation: "fadeUp 0.4s 0.1s ease both" }}>
        {["all", "pending", "in_progress", "completed"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "7px 18px", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer",
            background: filter === f ? "rgba(34,211,238,0.14)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${filter === f ? "#22d3ee" : "rgba(255,255,255,0.1)"}`,
            color: filter === f ? "#22d3ee" : "rgba(255,255,255,0.5)",
            transition: "all 0.18s",
          }}>
            {f === "all" ? "All" : f.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            <span style={{ marginLeft: 8, fontSize: 11, opacity: 0.7 }}>
              {f === "all" ? tasks.length : tasks.filter((t) => t.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Task list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeUp 0.4s 0.15s ease both" }}>
        {filtered.length === 0 ? (
          <EmptyState icon="☑" title="No tasks found" subtitle={isAdmin ? "Create your first task above" : "No tasks assigned yet"} />
        ) : (
          filtered.map((t) => {
            const days = daysLeft(t.deadline);
            const mySub = !isAdmin ? getMySubmission(t.id) : null;

            return (
              <div key={t.id} className="card-hover" style={{ ...glass, padding: "20px 24px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                {/* Status bubble */}
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
                  background: t.status === "completed" ? "rgba(74,222,128,0.15)" : t.status === "in_progress" ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${t.status === "completed" ? "rgba(74,222,128,0.35)" : t.status === "in_progress" ? "rgba(251,191,36,0.35)" : "rgba(255,255,255,0.1)"}`,
                }}>
                  {t.status === "completed" ? "✓" : t.status === "in_progress" ? "⏳" : "○"}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                    <h4 style={{ fontSize: 15, fontWeight: 800 }}>{t.title}</h4>
                    <Badge color={STATUS_COLOR[t.status]}>{t.status.replace("_", " ")}</Badge>
                    {mySub && <Badge color="green">Submitted</Badge>}
                    {mySub?.grade != null && <Badge color="amber">Grade: {mySub.grade}/20</Badge>}
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
                    {t.description?.substring(0, 140)}
                  </p>
                  <div style={{ display: "flex", gap: 16, fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace", flexWrap: "wrap" }}>
                    <span>📅 Due: {t.deadline}</span>
                    {days !== null && (
                      <span style={{ color: days < 0 ? "#f87171" : days <= 3 ? "#fbbf24" : "inherit" }}>
                        {days < 0 ? `⚠ ${Math.abs(days)}d overdue` : days === 0 ? "Due today!" : `${days}d remaining`}
                      </span>
                    )}
                    {isAdmin && <span>📥 {t.submissionCount || 0} submissions</span>}
                  </div>
                  {mySub?.feedback && (
                    <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(34,211,238,0.06)", borderRadius: 10, border: "1px solid rgba(34,211,238,0.15)" }}>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}>💬 {mySub.feedback}</p>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {isAdmin ? (
                    <>
                      <button className="btn-ghost" style={{ padding: "7px 14px", fontSize: 12 }} onClick={() => openEdit(t)}>✏ Edit</button>
                      <button style={{ padding: "7px 14px", fontSize: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, color: "#f87171", fontWeight: 700, cursor: "pointer" }} onClick={() => handleDelete(t.id)}>🗑</button>
                    </>
                  ) : (
                    !mySub && t.status !== "completed" && (
                      <button className="btn-primary" style={{ padding: "7px 16px", fontSize: 12 }}>Submit</button>
                    )
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)}>
        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 22 }}>{editTarget ? "Edit Task" : "Create New Task"}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Task Title">
            <input className="input-field" placeholder="e.g. VPC Architecture Design" value={form.title} onChange={set("title")} />
          </Field>
          <Field label="Instructions">
            <textarea className="input-field" rows={4} placeholder="Detailed instructions for students…" value={form.description} onChange={set("description")} style={{ resize: "vertical" }} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Project">
              <select className="input-field" value={form.projectId} onChange={set("projectId")} style={{ background: "rgba(7,11,20,0.9)" }}>
                <option value="">— Select project —</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </Field>
            <Field label="Deadline">
              <input className="input-field" type="date" value={form.deadline} onChange={set("deadline")} />
            </Field>
          </div>
          {error && <p style={{ color: "#f87171", fontSize: 13 }}>⚠ {error}</p>}
          <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>{saving ? "Saving…" : editTarget ? "Save Changes" : "Create Task"}</button>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

const Field = ({ label, children }) => (
  <div>
    <label style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>{label}</label>
    {children}
  </div>
);
