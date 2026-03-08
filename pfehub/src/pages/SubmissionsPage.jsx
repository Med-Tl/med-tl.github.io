import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSubmissions, useTasks } from "../hooks/useFirestore";
import { gradeSubmission } from "../services/firestoreService";
import { createNotification } from "../services/firestoreService";
import { createSubmission } from "../services/firestoreService";
import { uploadSubmissionFile, formatFileSize, validateFile } from "../services/storageService";
import { glass, Badge, EmptyState, Spinner, Modal, FileDropZone, UploadProgress } from "../components/UI";

const STATUS_COLOR = { graded: "green", pending: "amber", late: "red", resubmit: "orange" };

export default function SubmissionsPage({ search }) {
  const { profile, isAdmin } = useAuth();
  const { data: submissions, loading, reload } = useSubmissions();
  const { data: tasks } = useTasks();

  const [selected, setSelected] = useState(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  // Student submit modal
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitTask, setSubmitTask] = useState(null);
  const [file, setFile] = useState(null);
  const [github, setGithub] = useState("");
  const [uploadPct, setUploadPct] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [fileError, setFileError] = useState("");

  const fmtDate = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const filtered = submissions.filter((s) =>
    s.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    s.fileName?.toLowerCase().includes(search.toLowerCase())
  );

  const openReview = (s) => {
    setSelected(s);
    setGrade(s.grade !== null && s.grade !== undefined ? String(s.grade) : "");
    setFeedback(s.feedback || "");
  };

  const handleGrade = async () => {
    if (!selected) return;
    const gradeNum = parseFloat(grade);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 20) { alert("Grade must be 0–20"); return; }
    setSaving(true);
    try {
      await gradeSubmission(selected.id, { grade: gradeNum, feedback });
      // Notify student
      await createNotification(selected.studentId, {
        message: `Feedback received — Grade: ${gradeNum}/20. Check your submissions.`,
        type: "grade",
      });
      await reload();
      setSelected(null);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleFileSelect = (f) => {
    const errs = validateFile(f, { maxMB: 50, allowedTypes: ["pdf", "zip", "png", "jpg", "jpeg"] });
    if (errs.length) { setFileError(errs[0]); return; }
    setFileError(""); setFile(f);
  };

  const handleStudentSubmit = async () => {
    if (!file && !github) return;
    setSubmitting(true);
    try {
      let fileUrl = "";
      if (file) {
        fileUrl = await uploadSubmissionFile(file, profile.id, submitTask?.id || "general", setUploadPct);
      }
      await createSubmission({
        taskId: submitTask?.id || "",
        studentId: profile.id,
        studentName: profile.name,
        type: file ? file.name.split(".").pop() : "github",
        fileName: file?.name || "",
        fileUrl,
        githubRepo: github,
      });
      await reload();
      setShowSubmit(false);
      setFile(null); setGithub(""); setUploadPct(0);
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}><Spinner size={40} /></div>;

  return (
    <div style={{ padding: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, animation: "fadeUp 0.4s ease" }}>
        <div>
          <h2 style={{ fontSize: 23, fontWeight: 800, marginBottom: 3 }}>{isAdmin ? "All Submissions" : "My Submissions"}</h2>
          <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>{filtered.length} submission{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        {!isAdmin && (
          <button className="btn-primary" onClick={() => { setSubmitTask(null); setShowSubmit(true); }}>+ New Submission</button>
        )}
      </div>

      {/* Stats strip (admin) */}
      {isAdmin && (
        <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap", animation: "fadeUp 0.4s 0.1s ease both" }}>
          {[
            { label: "Total", value: submissions.length, color: "#22d3ee" },
            { label: "Pending Review", value: submissions.filter(s => s.status === "pending").length, color: "#fbbf24" },
            { label: "Graded", value: submissions.filter(s => s.status === "graded").length, color: "#4ade80" },
          ].map((s) => (
            <div key={s.label} style={{ ...glass, padding: "14px 22px", display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: "'Space Mono', monospace" }}>{s.value}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon="📥" title="No submissions yet" subtitle={isAdmin ? "Students haven't submitted anything" : "Submit your first task above"} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeUp 0.4s 0.15s ease both" }}>
          {filtered.map((s) => (
            <div key={s.id} className="card-hover" style={{ ...glass, padding: "20px 24px", display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: 13, background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                {s.type === "pdf" ? "📄" : s.type === "zip" ? "🗜" : s.githubRepo ? "🔗" : "📎"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {isAdmin && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 4, alignItems: "center" }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(34,211,238,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#22d3ee" }}>
                      {s.studentName?.[0] || "?"}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#22d3ee" }}>{s.studentName}</span>
                  </div>
                )}
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.fileName || "Submission"}</h4>
                <div style={{ display: "flex", gap: 14, fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace", flexWrap: "wrap" }}>
                  <span>📅 {fmtDate(s.submittedAt)}</span>
                  {s.githubRepo && <a href={s.githubRepo} target="_blank" rel="noreferrer" style={{ color: "#22d3ee", textDecoration: "none" }}>🔗 GitHub</a>}
                </div>
                {s.feedback && (
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 7, fontStyle: "italic", lineHeight: 1.5 }}>
                    💬 "{s.feedback}"
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
                {s.grade != null && (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: s.grade >= 15 ? "#4ade80" : s.grade >= 10 ? "#fbbf24" : "#f87171", fontFamily: "'Space Mono', monospace", lineHeight: 1 }}>{s.grade}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>/20</div>
                  </div>
                )}
                <Badge color={STATUS_COLOR[s.status] || "gray"}>{s.status}</Badge>
                {isAdmin && (
                  <button className="btn-primary" style={{ padding: "7px 16px", fontSize: 12 }} onClick={() => openReview(s)}>
                    {s.status === "graded" ? "Edit Grade" : "Review"}
                  </button>
                )}
                {s.fileUrl && (
                  <button className="btn-ghost" style={{ padding: "7px 12px", fontSize: 12 }} onClick={() => window.open(s.fileUrl, "_blank")}>⬇</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin: Grade Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)}>
        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Review Submission</h3>
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{selected.studentName}</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{selected.fileName}</p>
              {selected.githubRepo && <a href={selected.githubRepo} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#22d3ee" }}>{selected.githubRepo}</a>}
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                {selected.fileUrl && <button className="btn-ghost" style={{ padding: "6px 14px", fontSize: 12 }} onClick={() => window.open(selected.fileUrl, "_blank")}>⬇ Download File</button>}
              </div>
            </div>
            <Field label="Grade (0 – 20)">
              <input className="input-field" type="number" min="0" max="20" step="0.5" placeholder="e.g. 16" value={grade} onChange={(e) => setGrade(e.target.value)} />
            </Field>
            <Field label="Feedback">
              <textarea className="input-field" rows={4} placeholder="Write detailed feedback…" value={feedback} onChange={(e) => setFeedback(e.target.value)} style={{ resize: "vertical" }} />
            </Field>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleGrade} disabled={saving}>{saving ? "Saving…" : "Save Grade & Notify Student"}</button>
              <button className="btn-ghost" onClick={() => setSelected(null)}>Cancel</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Student: Submit Modal */}
      <Modal open={showSubmit} onClose={() => setShowSubmit(false)}>
        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>New Submission</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Task">
            <select className="input-field" value={submitTask?.id || ""} onChange={(e) => setSubmitTask(tasks.find(t => t.id === e.target.value) || null)} style={{ background: "rgba(7,11,20,0.9)" }}>
              <option value="">— Select task —</option>
              {tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </Field>
          <Field label="GitHub Repository (optional)">
            <input className="input-field" placeholder="https://github.com/username/repo" value={github} onChange={(e) => setGithub(e.target.value)} />
          </Field>
          <FileDropZone onFile={handleFileSelect} accept=".pdf,.zip,.png,.jpg,.jpeg" label={file ? `📄 ${file.name} (${formatFileSize(file.size)})` : "Upload PDF, ZIP, or screenshot"} sublabel="PDF, ZIP, PNG, JPG · Max 50MB" />
          {fileError && <p style={{ color: "#f87171", fontSize: 13 }}>⚠ {fileError}</p>}
          {submitting && uploadPct > 0 && file && <UploadProgress progress={uploadPct} fileName={file.name} />}
          <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={handleStudentSubmit} disabled={submitting || (!file && !github)}>{submitting ? `Uploading ${uploadPct}%…` : "Submit"}</button>
            <button className="btn-ghost" onClick={() => setShowSubmit(false)}>Cancel</button>
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
