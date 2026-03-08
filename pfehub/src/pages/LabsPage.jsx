import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLabs } from "../hooks/useFirestore";
import { createLab, deleteLab } from "../services/firestoreService";
import { uploadLabSubmission } from "../services/storageService";
import { createSubmission } from "../services/firestoreService";
import { glass, Badge, EmptyState, Spinner, Modal, FileDropZone, UploadProgress } from "../components/UI";

const CAT_COLOR = { AWS: "amber", DevOps: "blue", Linux: "green", Security: "red", Docker: "cyan", Networking: "purple" };
const DIFF_COLOR = { beginner: "green", intermediate: "amber", advanced: "red" };

export default function LabsPage({ search }) {
  const { profile, isAdmin } = useAuth();
  const { data: labs, loading, reload } = useLabs();

  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", instructions: "", category: "AWS", difficulty: "beginner", duration: "2h" });
  const [saving, setSaving] = useState(false);

  // Submission state
  const [file, setFile] = useState(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const filtered = labs.filter((l) =>
    l.title?.toLowerCase().includes(search.toLowerCase()) ||
    l.category?.toLowerCase().includes(search.toLowerCase())
  );

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await createLab(form, profile.id);
      await reload();
      setShowCreate(false);
      setForm({ title: "", description: "", instructions: "", category: "AWS", difficulty: "beginner", duration: "2h" });
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this lab?")) return;
    await deleteLab(id);
    await reload();
  };

  const handleSubmit = async () => {
    if (!file && !githubUrl) return;
    setSubmitting(true);
    try {
      let fileUrl = "";
      if (file) {
        fileUrl = await uploadLabSubmission(file, profile.id, selected.id, setUploadProgress);
      }
      await createSubmission({
        taskId: selected.id,
        studentId: profile.id,
        studentName: profile.name,
        type: file ? file.name.split(".").pop() : "github",
        fileName: file?.name || "",
        fileUrl,
        githubRepo: githubUrl,
        submissionType: "lab",
      });
      setSubmitSuccess(true);
      setFile(null); setGithubUrl("");
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}><Spinner size={40} /></div>;

  return (
    <div style={{ padding: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, animation: "fadeUp 0.4s ease" }}>
        <div>
          <h2 style={{ fontSize: 23, fontWeight: 800, marginBottom: 3 }}>Practical Labs</h2>
          <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>Hands-on exercises for real-world skills</p>
        </div>
        {isAdmin && <button className="btn-primary" onClick={() => setShowCreate(true)}>+ New Lab</button>}
      </div>

      {/* Category legend */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap", animation: "fadeUp 0.4s 0.1s ease both" }}>
        {Object.keys(CAT_COLOR).map((c) => <Badge key={c} color={CAT_COLOR[c]}>{c}</Badge>)}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="⚗" title="No labs yet" subtitle={isAdmin ? "Create the first lab above" : "No labs available"} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18, animation: "fadeUp 0.4s 0.15s ease both" }}>
          {filtered.map((lab) => (
            <div key={lab.id} className="card-hover" style={{ ...glass, padding: 24, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  <Badge color={CAT_COLOR[lab.category] || "blue"}>{lab.category}</Badge>
                  <Badge color={DIFF_COLOR[lab.difficulty] || "gray"}>{lab.difficulty}</Badge>
                </div>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>⏱ {lab.duration}</span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8, lineHeight: 1.35 }}>{lab.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.65, flex: 1, marginBottom: 16 }}>{lab.description}</p>
              <div style={{ display: "flex", gap: 8, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <button className="btn-primary" style={{ flex: 1, padding: "9px", fontSize: 13 }} onClick={() => { setSelected(lab); setSubmitSuccess(false); }}>View Lab →</button>
                {isAdmin && <button style={{ padding: "9px 14px", fontSize: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, color: "#f87171", fontWeight: 700, cursor: "pointer" }} onClick={() => handleDelete(lab.id)}>🗑</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lab Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} width={620}>
        {selected && (
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <Badge color={CAT_COLOR[selected.category] || "blue"}>{selected.category}</Badge>
                <Badge color={DIFF_COLOR[selected.difficulty] || "gray"}>{selected.difficulty}</Badge>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", fontFamily: "'JetBrains Mono', monospace" }}>⏱ {selected.duration}</span>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{selected.title}</h2>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.65 }}>{selected.description}</p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#22d3ee", marginBottom: 12 }}>Step-by-step Instructions</h4>
              <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 12, padding: "18px 20px", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, lineHeight: 1.85, border: "1px solid rgba(255,255,255,0.07)" }}>
                {(selected.instructions || "").split("\n").map((line, i) => (
                  <div key={i} style={{ color: line.match(/^\d+\./) ? "#22d3ee" : "rgba(255,255,255,0.65)" }}>{line}</div>
                ))}
              </div>
            </div>

            {!isAdmin && (
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#22d3ee", marginBottom: 14 }}>Submit Your Work</h4>
                {submitSuccess ? (
                  <div style={{ textAlign: "center", padding: "28px", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 12 }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
                    <p style={{ color: "#4ade80", fontWeight: 700 }}>Lab submitted successfully!</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <input className="input-field" placeholder="GitHub repository URL (optional)" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
                    <FileDropZone onFile={setFile} accept=".pdf,.zip,.png,.jpg,.jpeg" label={file ? `📄 ${file.name}` : "Drop files or click to upload"} sublabel="PDF, ZIP, PNG, JPG · Max 50MB" />
                    {submitting && uploadProgress > 0 && file && <UploadProgress progress={uploadProgress} fileName={file.name} />}
                    <button className="btn-primary" onClick={handleSubmit} disabled={submitting || (!file && !githubUrl)}>
                      {submitting ? "Uploading…" : "Submit Lab Work"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Modal>

      {/* Create Lab Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)}>
        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 22 }}>Create New Lab</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Lab Title"><input className="input-field" placeholder="e.g. AWS EC2 Instance Management" value={form.title} onChange={set("title")} /></Field>
          <Field label="Short Description"><input className="input-field" placeholder="What will students learn?" value={form.description} onChange={set("description")} /></Field>
          <Field label="Step-by-step Instructions"><textarea className="input-field" rows={5} placeholder="1. Step one&#10;2. Step two&#10;…" value={form.instructions} onChange={set("instructions")} style={{ resize: "vertical", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }} /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Field label="Category">
              <select className="input-field" value={form.category} onChange={set("category")} style={{ background: "rgba(7,11,20,0.9)" }}>
                {Object.keys(CAT_COLOR).map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Difficulty">
              <select className="input-field" value={form.difficulty} onChange={set("difficulty")} style={{ background: "rgba(7,11,20,0.9)" }}>
                <option>beginner</option><option>intermediate</option><option>advanced</option>
              </select>
            </Field>
            <Field label="Duration"><input className="input-field" placeholder="e.g. 2h" value={form.duration} onChange={set("duration")} /></Field>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Create Lab"}</button>
            <button className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
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
