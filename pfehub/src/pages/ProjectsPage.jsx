import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useProjects, useStudents } from "../hooks/useFirestore";
import { createProject, updateProject, deleteProject, assignStudentToProject } from "../services/firestoreService";
import { glass, glassStrong, Badge, EmptyState, Spinner, Modal } from "../components/UI";

export default function ProjectsPage({ search }) {
  const { profile, isAdmin } = useAuth();
  const { data: projects, loading, reload } = useProjects();
  const { data: students } = useStudents();

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", status: "active" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filtered = projects.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const openCreate = () => { setForm({ title: "", description: "", status: "active" }); setEditTarget(null); setShowCreate(true); };
  const openEdit = (p) => { setForm({ title: p.title, description: p.description, status: p.status }); setEditTarget(p); setShowCreate(true); };

  const handleSave = async () => {
    if (!form.title.trim()) { setError("Title is required."); return; }
    setSaving(true); setError("");
    try {
      if (editTarget) {
        await updateProject(editTarget.id, form);
      } else {
        await createProject(form, profile.id);
      }
      await reload();
      setShowCreate(false);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    await deleteProject(id);
    await reload();
  };

  const handleAssign = async (studentId) => {
    if (!assignTarget) return;
    await assignStudentToProject(assignTarget.id, studentId);
    await reload();
  };

  const fmtDate = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-GB");
  };

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}><Spinner size={40} /></div>;

  return (
    <div style={{ padding: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, animation: "fadeUp 0.4s ease" }}>
        <div>
          <h2 style={{ fontSize: 23, fontWeight: 800, marginBottom: 3 }}>{isAdmin ? "All Projects" : "My Project"}</h2>
          <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>{filtered.length} project{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        {isAdmin && <button className="btn-primary" onClick={openCreate}>+ New Project</button>}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="◈" title="No projects yet" subtitle={isAdmin ? "Create your first project above" : "Your teacher hasn't assigned a project yet"} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 18, animation: "fadeUp 0.4s 0.1s ease both" }}>
          {filtered.map((p) => (
            <div key={p.id} className="card-hover" style={{ ...glass, padding: 26 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 13, fontSize: 22,
                  background: "linear-gradient(135deg, rgba(34,211,238,0.18), rgba(99,102,241,0.18))",
                  border: "1px solid rgba(34,211,238,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>◈</div>
                <Badge color={p.status === "active" ? "green" : p.status === "completed" ? "blue" : "gray"}>{p.status}</Badge>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, lineHeight: 1.35 }}>{p.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.48)", fontSize: 13, lineHeight: 1.65, marginBottom: 16 }}>
                {p.description?.substring(0, 120)}…
              </p>
              <div style={{ display: "flex", gap: 14, fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" }}>
                <span>👥 {(p.students || []).length} students</span>
                <span>📅 {fmtDate(p.createdAt)}</span>
              </div>
              {isAdmin && (
                <div style={{ display: "flex", gap: 8, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  <button className="btn-ghost" style={{ flex: 1, padding: "8px", fontSize: 12, textAlign: "center" }} onClick={() => openEdit(p)}>✏ Edit</button>
                  <button className="btn-ghost" style={{ flex: 1, padding: "8px", fontSize: 12, textAlign: "center" }} onClick={() => setAssignTarget(p)}>👥 Assign</button>
                  <button
                    style={{ flex: 1, padding: "8px", fontSize: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, color: "#f87171", fontWeight: 700, cursor: "pointer" }}
                    onClick={() => handleDelete(p.id)}
                  >🗑 Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)}>
        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 22 }}>{editTarget ? "Edit Project" : "Create New Project"}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Title">
            <input className="input-field" placeholder="e.g. Cloud Infrastructure Deployment" value={form.title} onChange={set("title")} />
          </Field>
          <Field label="Description">
            <textarea className="input-field" rows={4} placeholder="Project objectives and scope…" value={form.description} onChange={set("description")} style={{ resize: "vertical" }} />
          </Field>
          <Field label="Status">
            <select className="input-field" value={form.status} onChange={set("status")} style={{ background: "rgba(7,11,20,0.9)" }}>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
          {error && <p style={{ color: "#f87171", fontSize: 13 }}>⚠ {error}</p>}
          <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>{saving ? "Saving…" : editTarget ? "Save Changes" : "Create Project"}</button>
            <button className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Assign Students Modal */}
      <Modal open={!!assignTarget} onClose={() => setAssignTarget(null)}>
        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Assign Students</h3>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 20 }}>{assignTarget?.title}</p>
        {students.length === 0 ? (
          <EmptyState icon="👥" title="No students found" />
        ) : (
          students.map((s) => {
            const assigned = (assignTarget?.students || []).includes(s.id);
            return (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#22d3ee" }}>
                  {s.avatar || s.name?.[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700 }}>{s.name}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>{s.email}</p>
                </div>
                <button
                  className={assigned ? "btn-ghost" : "btn-primary"}
                  style={{ padding: "6px 14px", fontSize: 12 }}
                  onClick={() => handleAssign(s.id)}
                >
                  {assigned ? "Assigned ✓" : "Assign"}
                </button>
              </div>
            );
          })
        )}
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
