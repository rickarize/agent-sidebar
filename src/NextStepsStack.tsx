import { useState } from "react";
import { motion } from "motion/react";

interface NextStep {
  id: string;
  label: string;
  description?: string;
  icon?: "chart" | "export" | "filter" | "alert" | "share";
}

interface NextStepsStackProps {
  steps: NextStep[];
  onSelect?: (id: string) => void;
}

function ChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 14V6l4 4 3-6 5 5v5H2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2v8M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 10v3a1 1 0 001 1h8a1 1 0 001-1v-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 3h12l-4 5v4l-4 2V8L2 3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2L2 13h12L8 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M8 6v3M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6 7l4-2M6 9l4 2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function getIcon(icon: NextStep["icon"]) {
  switch (icon) {
    case "chart": return <ChartIcon />;
    case "export": return <ExportIcon />;
    case "filter": return <FilterIcon />;
    case "alert": return <AlertIcon />;
    case "share": return <ShareIcon />;
    default: return <ChartIcon />;
  }
}

function StepRow({ step, onSelect, isLast }: { step: NextStep; onSelect?: (id: string) => void; isLast: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect?.(step.id)}
      whileTap={{ scale: 0.995 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        cursor: "pointer",
        background: hovered ? "#1a1a1a" : "transparent",
        borderBottom: isLast ? "none" : "1px solid #1a1a1a",
        transition: "background 0.12s",
      }}
    >
      <div
        style={{
          color: hovered ? "#aaa" : "#666",
          transition: "color 0.12s",
          display: "flex",
          alignItems: "center",
        }}
      >
        {getIcon(step.icon)}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 13,
            color: hovered ? "#ccc" : "#999",
            fontWeight: 500,
            transition: "color 0.12s",
          }}
        >
          {step.label}
        </div>
        {step.description && (
          <div
            style={{
              fontSize: 12,
              color: "#555",
              marginTop: 2,
            }}
          >
            {step.description}
          </div>
        )}
      </div>
      <motion.div
        animate={{ x: hovered ? 2 : 0 }}
        transition={{ duration: 0.1 }}
        style={{ color: hovered ? "#666" : "#444", transition: "color 0.12s" }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

export function NextStepsStack({ steps, onSelect }: NextStepsStackProps) {
  return (
    <div
      style={{
        borderRadius: 10,
        border: "1px solid #222",
        background: "#0f0f0f",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "8px 14px",
          fontSize: 11,
          fontWeight: 600,
          color: "#555",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          borderBottom: "1px solid #1a1a1a",
        }}
      >
        Suggested next steps
      </div>
      {steps.map((step, i) => (
        <StepRow
          key={step.id}
          step={step}
          onSelect={onSelect}
          isLast={i === steps.length - 1}
        />
      ))}
    </div>
  );
}

function UnbundledStepCard({ step, onSelect }: { step: NextStep; onSelect?: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect?.(step.id)}
      whileTap={{ scale: 0.98 }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: "8px 12px",
        cursor: "pointer",
        background: hovered ? "#151515" : "#111",
        border: "1px solid #222",
        borderRadius: 8,
        transition: "background 0.12s",
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: hovered ? "#ccc" : "#999",
          fontWeight: 500,
          transition: "color 0.12s",
        }}
      >
        {step.label}
      </div>
      {step.description && (
        <div
          style={{
            fontSize: 12,
            color: "#555",
          }}
        >
          {step.description}
        </div>
      )}
    </motion.div>
  );
}

export function NextStepsUnbundled({ steps, onSelect }: NextStepsStackProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {steps.map((step) => (
        <UnbundledStepCard key={step.id} step={step} onSelect={onSelect} />
      ))}
    </div>
  );
}

function MinimalStepLink({ step, onSelect, isLast }: { step: NextStep; onSelect?: (id: string) => void; isLast: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        borderBottom: isLast ? "none" : "1px solid #1a1a1a",
      }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onSelect?.(step.id)}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px 0",
          cursor: "pointer",
          fontSize: 13,
          color: hovered ? "#ccc" : "#888",
          transition: "color 0.12s",
        }}
      >
        <span style={{ flex: 1 }}>{step.label}</span>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ opacity: hovered ? 0.6 : 0.3, transition: "opacity 0.12s" }}>
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

export function NextStepsMinimal({ steps, onSelect }: NextStepsStackProps) {
  return (
    <div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#ccc",
          marginTop: 12,
          marginBottom: 2,
        }}
      >
        Next steps
      </div>
      {steps.map((step, i) => (
        <MinimalStepLink
          key={step.id}
          step={step}
          onSelect={onSelect}
          isLast={i === steps.length - 1}
        />
      ))}
    </div>
  );
}
