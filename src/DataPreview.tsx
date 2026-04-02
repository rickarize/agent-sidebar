import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

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

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <motion.svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      animate={{ rotate: open ? 90 : 0 }}
      transition={{ duration: 0.1 }}
      style={{ display: "block", flexShrink: 0 }}
    >
      <path
        d="M6 4l4 4-4 4"
        stroke="#555"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

interface Column {
  key: string;
  label: string;
  width?: number;
}

interface DataPreviewProps {
  name: string;
  meta?: string;
  href?: string;
  columns: Column[];
  rows: Record<string, string>[];
  maxRows?: number;
  defaultOpen?: boolean;
  footerLinkText?: string;
  footerLinkHref?: string;
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ display: "block" }}>
      <path
        d="M6 3H3.5A1.5 1.5 0 0 0 2 4.5v8A1.5 1.5 0 0 0 3.5 14h8a1.5 1.5 0 0 0 1.5-1.5V10"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 2h5v5M14 2L7 9"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DataPreview({
  name,
  meta,
  href,
  columns,
  rows,
  maxRows = 5,
  defaultOpen = false,
  footerLinkText,
  footerLinkHref,
}: DataPreviewProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [hovered, setHovered] = useState(false);
  const displayRows = rows.slice(0, maxRows);
  const remaining = rows.length - displayRows.length;

  return (
    <div
      style={{
        borderRadius: 10,
        border: `1px solid ${open ? "#333" : hovered ? "#333" : "#222"}`,
        background: open ? "#111" : hovered ? "#151515" : "#0f0f0f",
        overflow: "hidden",
        transition: "border-color 0.12s, background 0.12s",
      }}
    >
      {/* Header — always visible, acts as chip */}
      <div
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          cursor: "pointer",
          color: hovered || open ? "#ccc" : "#999",
          transition: "color 0.12s",
        }}
      >
        <FileIcon />
        <span
          style={{
            fontSize: 13,
            fontFamily: "var(--font-mono)",
          }}
        >
          {name}
        </span>
        {meta && (
          <span style={{ fontSize: 11, color: "#555" }}>{meta}</span>
        )}
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                color: hovered || open ? "#777" : "#444",
                transition: "color 0.12s",
                display: "flex",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ccc")}
              onMouseLeave={(e) => (e.currentTarget.style.color = hovered || open ? "#777" : "#444")}
            >
              <LinkIcon />
            </a>
          )}
          <ChevronIcon open={open} />
        </span>
      </div>

      {/* Expandable table */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.12 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ borderTop: "1px solid #222" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                }}
              >
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        style={{
                          textAlign: "left",
                          padding: "6px 10px",
                          color: "#666",
                          fontWeight: 600,
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          borderBottom: "1px solid #1e1e1e",
                          width: col.width,
                        }}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((row, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom:
                          i < displayRows.length - 1
                            ? "1px solid #1a1a1a"
                            : "none",
                      }}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          style={{
                            padding: "5px 10px",
                            color: "#aaa",
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row[col.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {(remaining > 0 || footerLinkHref) && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "6px 10px",
                    fontSize: 11,
                    color: "#555",
                    borderTop: "1px solid #1a1a1a",
                  }}
                >
                  <span>
                    {remaining > 0 && `+ ${remaining} more row${remaining !== 1 ? "s" : ""}`}
                  </span>
                  {footerLinkHref && (
                    <a
                      href={footerLinkHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#777",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        transition: "color 0.12s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#ccc")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#777")}
                    >
                      {footerLinkText || "Open"}
                      <LinkIcon />
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
