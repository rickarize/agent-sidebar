import { motion } from "motion/react";
import type { ChecklistState } from "./types";

interface Props {
  presets: { label: string; state: ChecklistState }[];
  activeIndex: number;
  onSelect: (index: number) => void;
  children?: React.ReactNode;
}

export function DebugPanel({ presets, activeIndex, onSelect, children }: Props) {
  return (
    <div
      style={{
        width: 320,
        borderLeft: "1px solid #222",
        background: "#111",
        display: "flex",
        flexDirection: "column",
        padding: 20,
        overflow: "auto",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#666",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 12,
        }}
      >
        Debug &middot; State Carousel
      </div>

      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        {presets.map((p, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            style={{
              background: i === activeIndex ? "#333" : "#1a1a1a",
              color: i === activeIndex ? "#fff" : "#888",
              border: `1px solid ${i === activeIndex ? "#555" : "#2a2a2a"}`,
              borderRadius: 6,
              padding: "4px 10px",
              fontSize: 12,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <button
          onClick={() => onSelect((activeIndex - 1 + presets.length) % presets.length)}
          style={{
            background: "none",
            border: "1px solid #333",
            color: "#aaa",
            borderRadius: 6,
            padding: "4px 12px",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          ← Prev
        </button>
        <span style={{ color: "#666", fontSize: 12 }}>
          {activeIndex + 1} / {presets.length}
        </span>
        <button
          onClick={() => onSelect((activeIndex + 1) % presets.length)}
          style={{
            background: "none",
            border: "1px solid #333",
            color: "#aaa",
            borderRadius: 6,
            padding: "4px 12px",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Next →
        </button>
      </div>

      <motion.pre
        key={activeIndex}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{
          background: "#0d0d0d",
          border: "1px solid #222",
          borderRadius: 8,
          padding: 14,
          fontSize: 11,
          color: "#8be9fd",
          overflow: "auto",
          flex: 1,
          margin: 0,
          whiteSpace: "pre-wrap",
          fontFamily: "'SF Mono', 'Fira Code', monospace",
        }}
      >
        {JSON.stringify(presets[activeIndex].state, null, 2)}
      </motion.pre>

      <div
        style={{
          marginTop: 12,
          fontSize: 11,
          color: "#444",
          textAlign: "center",
        }}
      >
        ← → arrow keys to switch states
      </div>

      {children}
    </div>
  );
}
