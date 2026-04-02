import { motion } from "motion/react";

interface Step {
  label: string;
  description?: string;
}

interface Props {
  steps: Step[];
  activeIndex: number;
  onSelect: (index: number) => void;
  children?: React.ReactNode;
}

export function DebugPanel({ steps, activeIndex, onSelect, children }: Props) {
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
        Debug &middot; Scenario Steps
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <button
          onClick={() => onSelect((activeIndex - 1 + steps.length) % steps.length)}
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
          {activeIndex + 1} / {steps.length}
        </span>
        <button
          onClick={() => onSelect((activeIndex + 1) % steps.length)}
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

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {steps.map((step, i) => {
          const isActive = i === activeIndex;
          const isPast = i < activeIndex;
          return (
            <motion.button
              key={i}
              onClick={() => onSelect(i)}
              whileTap={{ scale: 0.98 }}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "8px 10px",
                background: isActive ? "#1e1e1e" : "transparent",
                border: isActive ? "1px solid #333" : "1px solid transparent",
                borderRadius: 8,
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                transition: "background 0.15s, border-color 0.15s",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: isActive ? "#fff" : isPast ? "#555" : "#444",
                  minWidth: 20,
                  flexShrink: 0,
                  paddingTop: 1,
                }}
              >
                {i + 1}.
              </span>
              <div>
                <div
                  style={{
                    fontSize: 13,
                    color: isActive ? "#e0e0e0" : isPast ? "#777" : "#555",
                    fontWeight: isActive ? 500 : 400,
                    lineHeight: 1.3,
                  }}
                >
                  {step.label}
                </div>
                {step.description && isActive && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "#666",
                      marginTop: 4,
                      lineHeight: 1.4,
                    }}
                  >
                    {step.description}
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

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
