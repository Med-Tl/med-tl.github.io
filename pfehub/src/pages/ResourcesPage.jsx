import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useResources } from "../hooks/useFirestore";
import { createResource, deleteResource, incrementDownload } from "../services/firestoreService";
import { uploadResourceFile, formatFileSize, validateFile } from "../services/storageService";
import { glass, Badge, EmptyState, Spinner, Modal, FileDropZone, UploadProgress } from "../components/UI";

const CAT_COLOR = { AWS: "amber", DevOps: "blue", Linux: "green", Security: "red", General: "gray", Docker: "cyan" };
const TYPE_ICON = { pdf: "📄", zip: "🗜", png: "🖼", jpg: "🖼", jpeg: "🖼", txt: "📝", md: "📝" };

export default function ResourcesPage({ search }) {
  const { profile, isAdmin } = useAuth();
  const { data: resources, loading, reload } = useResources();

  const [catFilter, setCatFilter] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ title: "", category: "AWS" });
  const [uploadPct, setUploadPct] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState("");

  const categories = ["all", ...new Set(resources.map((r) => r.category).filter(Boolean))];

  const filtered = resources.filter((r) => {
    const matchSearch = r.title?.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || r.category === catFilter;
    return matchSearch && matchCat;
  });

  const fmtDate = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-GB");
  };

  const handleFileSelect = (f) => {
    const errs = validateFile(f, { maxMB: 100, allowedTypes: ["pdf", "zip", "png", "jpg", "jpeg", "txt", "md"] });
    if (errs.length) { setFileError(errs[0]); return; }
    setFileError("");
    setFile(f);
    if (!form.title) setForm((p) => ({ ...p, title: f.name.replace(/\.[^.]+$/, "") }));
  };

  const handleUpload = async () => {
    if (!file || !form.title.trim()) return;
    setUploading(true);
    try {
      const fileUrl = await uploadResourceFile(file, profile.id, setUploadPct);
      const ext = file.name.split(".").pop().toLowerCase();
      await createResource({
        title: form.title,
        category: form.category,
        fileUrl,
        fileName: file.name,
        type: ext,
        size: formatFileSize(file.size),
      }, profile.id);
      await reload();
      setShowUpload(false);
      setFile(null); setForm({ title: "", category: "AWS" }); setUploadPct(0);
    } catch (err) { console.error(err); }
    finally { setUploading(false); }
  };

  const handleDownload = async (r) => {
    await incrementDownload(r.id);
    window.open(r.fileUrl, "_blank");
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this resource?")) return;
    await deleteResource(id);
    await reload();
  };

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}><Spinner size={40} /></div>;

  return (
    <div style={{ padding: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, animation: "fadeUp 0.4s ease" }}>
        <div>
          <h2 style={{ fontSize: 23, fontWeight: 800, marginBottom: 3 }}>Resource Library</h2>
          <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13 }}>Learning materials & references</p>
        </div>
        {isAdmin && <button className="btn-primary" onClick={() => setShowUpload(true)}>+ Upload Resource</button>}
      </div>

      {/* Category Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap", animation: "fadeUp 0.4s 0.1s ease both" }}>
        {categories.map((c) => (
          <button key={c} onClick={() => setCatFilter(c)} style={{
            padding: "7px 18px", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer",
            background: catFilter === c ? "rgba(34,211,238,0.14)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${catFilter === c ? "#22d3ee" : "rgba(255,255,255,0.1)"}`,
            color: catFilter === c ? "#22d3ee" : "rgba(255,255,255,0.5)",
            transition: "all 0.18s",
          }}>{c}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📚" title="No resources found" subtitle={isAdmin ? "Upload the first resource" : "No resources available"} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, animation: "fadeUp 0.4s 0.15s ease both" }}>
          {filtered.map((r) => (
            <div key={r.id} className="card-hover" style={{ ...glass, padding: 22 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ width: 50, height: 50, borderRadius: 13, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
                  {TYPE_ICON[r.type] || "📎"}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <h4 style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.35, marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</h4>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    <Badge color={CAT_COLOR[r.category] || "gray"} size="sm">{r.category}</Badge>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace", alignSelf: "center" }}>{r.type?.toUpperCase()}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 14 }}>
                <span>{r.size}</span>
                <span>⬇ {r.downloads || 0} downloads</span>
                <span>{fmtDate(r.createdAt)}</span>
              </div>
              <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <button className="btn-primary" style={{ flex: 1, padding: "8px", fontSize: 12 }} onClick={() => handleDownload(r)}>⬇ Download</button>
                {r.type === "pdf" && <button className="btn-ghost" style={{ flex: 1, padding: "8px", fontSize: 12 }} onClick={() => window.open(r.fileUrl, "_blank")}>👁 View</button>}
                {isAdmin && <button style={{ padding: "8px 12px", fontSize: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, color: "#f87171", fontWeight: 700, cursor: "pointer" }} onClick={() => handleDelete(r.id)}>🗑</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal open={showUpload} onClose={() => setShowUpload(false)}>
        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 22 }}>Upload Resource</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Resource Title">
            <input className="input-field" placeholder="e.g. AWS Solutions Architect Guide" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          </Field>
          <Field label="Category">
            <select className="input-field" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} style={{ background: "rgba(7,11,20,0.9)" }}>
              {Object.keys(CAT_COLOR).map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <FileDropZone onFile={handleFileSelect} accept=".pdf,.zip,.png,.jpg,.txt,.md" label={file ? `📄 ${file.name} (${formatFileSize(file.size)})` : "Drop file or click to browse"} sublabel="PDF, ZIP, PNG, JPG, TXT, MD · Max 100MB" />
          {fileError && <p style={{ color: "#f87171", fontSize: 13 }}>⚠ {fileError}</p>}
          {uploading && uploadPct > 0 && file && <UploadProgress progress={uploadPct} fileName={file.name} />}
          <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={handleUpload} disabled={uploading || !file}>{uploading ? `Uploading ${uploadPct}%…` : "Upload Resource"}</button>
            <button className="btn-ghost" onClick={() => setShowUpload(false)}>Cancel</button>
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
