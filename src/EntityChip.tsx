import { useState } from "react";

function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M4 2h5.5L13 5.5V13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M9 2v4h4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EntityChip({
  name,
  meta,
  onClick,
}: {
  name: string;
  meta?: string;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px 4px 8px",
        borderRadius: 8,
        border: `1px solid ${hovered ? "#444" : "#2a2a2a"}`,
        background: hovered ? "#1a1a1a" : "#131313",
        color: hovered ? "#ccc" : "#999",
        fontSize: 13,
        fontFamily: "'SF Mono', 'Fira Code', ui-monospace, monospace",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.12s, background 0.12s, color 0.12s",
        lineHeight: 1,
      }}
    >
      <FileIcon />
      <span>{name}</span>
      {meta && (
        <span style={{ color: "#555", fontSize: 11, fontFamily: "inherit" }}>
          {meta}
        </span>
      )}
    </span>
  );
}
