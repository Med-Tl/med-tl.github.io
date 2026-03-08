// ─── DESIGN SYSTEM ─────────────────────────────────────────────────────────

export const glass = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)",
  backdropFilter: "blur(20px)",
  borderRadius: "16px",
};

export const glassStrong = {
  background: "rgba(10,14,26,0.92)",
  border: "1px solid rgba(255,255,255,0.12)",
  backdropFilter: "blur(32px)",
  borderRadius: "16px",
};

// ─── BADGE ───────────────────────────────────────────────────────────────────
export const Badge = ({ children, color = "blue", size = "sm" }) => {
  const map = {
    blue:   ["rgba(59,130,246,0.18)",   "#60a5fa"],
    green:  ["rgba(34,197,94,0.18)",    "#4ade80"],
    amber:  ["rgba(245,158,11,0.18)",   "#fbbf24"],
    red:    ["rgba(239,68,68,0.18)",    "#f87171"],
    purple: ["rgba(168,85,247,0.18)",   "#c084fc"],
    cyan:   ["rgba(6,182,212,0.18)",    "#22d3ee"],
    gray:   ["rgba(148,163,184,0.12)",  "#94a3b8"],
    orange: ["rgba(249,115,22,0.18)",   "#fb923c"],
  };
  const [bg, clr] = map[color] ?? map.blue;
  return (
    <span style={{
      background: bg, color: clr,
      border: `1px solid ${clr}30`,
      padding: size === "sm" ? "2px 9px" : "4px 13px",
      borderRadius: 99, fontSize: size === "sm" ? 11 : 12,
      fontWeight: 700, letterSpacing: "0.04em",
      fontFamily: "'JetBrains Mono', monospace",
      display: "inline-flex", alignItems: "center", gap: 4,
    }}>{children}</span>
  );
};

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
export const ProgressBar = ({ value, color = "#22d3ee", height = 6, glow = true }) => (
  <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 99, height, overflow: "hidden" }}>
    <div style={{
      width: `${Math.min(value, 100)}%`, height: "100%",
      background: `linear-gradient(90deg, ${color}cc, ${color})`,
      borderRadius: 99, transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)",
      boxShadow: glow ? `0 0 10px ${color}70` : "none",
    }} />
  </div>
);

// ─── STAT CARD ───────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, icon, color, delta, subtitle }) => (
  <div style={{ ...glass, padding: "22px 24px", position: "relative", overflow: "hidden" }}>
    <div style={{
      position: "absolute", top: -30, right: -30, width: 120, height: 120,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color}18, transparent 70%)`,
    }} />
    <div style={{ fontSize: 26, marginBottom: 10, lineHeight: 1 }}>{icon}</div>
    <div style={{
      fontSize: 34, fontWeight: 800, color: "#fff",
      fontFamily: "'Space Mono', monospace", lineHeight: 1, letterSpacing: "-0.02em",
    }}>{value}</div>
    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginTop: 7, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</div>
    {delta && <div style={{ color: "#4ade80", fontSize: 11, marginTop: 4, fontWeight: 700 }}>↑ {delta}</div>}
    {subtitle && <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 4 }}>{subtitle}</div>}
  </div>
);

// ─── SPINNER ─────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 24, color = "#22d3ee" }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    border: `2px solid rgba(255,255,255,0.1)`,
    borderTopColor: color,
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  }} />
);

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
export const EmptyState = ({ icon = "📭", title = "Nothing here yet", subtitle = "" }) => (
  <div style={{ textAlign: "center", padding: "60px 20px" }}>
    <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
    <h3 style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>{title}</h3>
    {subtitle && <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>{subtitle}</p>}
  </div>
);

// ─── FILE DROP ZONE ──────────────────────────────────────────────────────────
export const FileDropZone = ({ onFile, accept = "*", label = "Drop files or click to upload", sublabel = "PDF, ZIP, PNG · Max 50MB" }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handle = (file) => {
    if (file) onFile(file);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files[0]); }}
      style={{
        border: `2px dashed ${dragging ? "#22d3ee" : "rgba(255,255,255,0.12)"}`,
        borderRadius: 14, padding: "32px 20px", textAlign: "center",
        cursor: "pointer", transition: "all 0.2s ease",
        background: dragging ? "rgba(34,211,238,0.04)" : "rgba(255,255,255,0.02)",
      }}
    >
      <input ref={inputRef} type="file" accept={accept} style={{ display: "none" }} onChange={(e) => handle(e.target.files[0])} />
      <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{label}</p>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginTop: 4 }}>{sublabel}</p>
    </div>
  );
};

// ─── UPLOAD PROGRESS ─────────────────────────────────────────────────────────
export const UploadProgress = ({ progress, fileName }) => (
  <div style={{ background: "rgba(34,211,238,0.06)", border: "1px solid rgba(34,211,238,0.15)", borderRadius: 12, padding: "14px 16px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
      <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>📄 {fileName}</span>
      <span style={{ color: "#22d3ee", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{progress}%</span>
    </div>
    <ProgressBar value={progress} color="#22d3ee" height={4} />
  </div>
);

// ─── MODAL ───────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, children, width = 540 }) => {
  if (!open) return null;
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div style={{ ...glassStrong, padding: 36, width: "100%", maxWidth: width, maxHeight: "90vh", overflowY: "auto", position: "relative" }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 18, background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 24, lineHeight: 1, cursor: "pointer" }}>×</button>
        {children}
      </div>
    </div>
  );
};

// ─── TOAST ───────────────────────────────────────────────────────────────────
export const Toast = ({ toasts }) => (
  <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 500, display: "flex", flexDirection: "column", gap: 10 }}>
    {toasts.map((t) => (
      <div key={t.id} style={{
        background: t.type === "error" ? "rgba(239,68,68,0.15)" : "rgba(34,211,238,0.1)",
        border: `1px solid ${t.type === "error" ? "rgba(239,68,68,0.35)" : "rgba(34,211,238,0.25)"}`,
        color: t.type === "error" ? "#f87171" : "#22d3ee",
        padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600,
        backdropFilter: "blur(20px)", minWidth: 280,
        animation: "fadeUp 0.3s ease",
      }}>
        {t.type === "error" ? "⚠ " : "✓ "}{t.message}
      </div>
    ))}
  </div>
);

// Need these for FileDropZone
import { useState, useRef } from "react";
