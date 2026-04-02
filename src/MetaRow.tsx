import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function MetaRow({ summary, detail }: { summary: string; detail?: string }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const expandable = !!detail;

  return (
    <div>
      <div
        style={{
          fontSize: 14,
          color: "#777",
          display: "flex",
          alignItems: "center",
          gap: 6,
          userSelect: "none",
          padding: "4px 0",
        }}
      >
        {expandable ? (
          <span
            onClick={() => setOpen((o) => !o)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              padding: "4px 48px 4px 0",
              margin: "-4px 0",
            }}
          >
            {summary}
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
            {hovered && !open && (
              <span style={{ fontSize: 14, color: "#555" }}>expand</span>
            )}
          </span>
        ) : (
          <span>{summary}</span>
        )}
      </div>
      <AnimatePresence>
        {open && detail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.1 }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                fontSize: 13,
                lineHeight: 1.5,
                color: "#666",
                padding: "6px 0 4px 20px",
                borderLeft: "2px solid #222",
                marginLeft: 4,
                marginTop: 4,
              }}
            >
              {detail}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
