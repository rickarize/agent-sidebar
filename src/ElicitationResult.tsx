import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface ElicitationAnswer {
  question: string;
  selected: string[];
  type: "single" | "multi" | "freeform";
}

interface ElicitationResultProps {
  /** One-line summary shown in collapsed state */
  summary: string;
  questions?: string[];
  answers?: ElicitationAnswer[];
  duration?: string;
  status?: "in-progress" | "complete" | "canceled";
  layout?: "stacked" | "side-by-side";
  onRetry?: () => void;
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

function FormIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 5.5h6M5 8h6M5 10.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function AnswerTag({ text }: { text: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 6,
        border: "1px solid #333",
        background: "#1a1a1a",
        color: "#bbb",
        fontSize: 12,
        fontFamily: "var(--font-mono)",
      }}
    >
      {text}
    </span>
  );
}

function StatusBadge({
  status,
  onRetry,
}: {
  status: "in-progress" | "complete" | "canceled";
  onRetry?: () => void;
}) {
  if (status === "in-progress") {
    const text = "In progress";
    return (
      <span style={{ fontSize: 11, flexShrink: 0, fontStyle: "italic" }}>
        {[...text].map((char, ci) => (
          <motion.span
            key={ci}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: ci * 0.06,
            }}
            style={{ color: "#888" }}
          >
            {char}
          </motion.span>
        ))}
      </span>
    );
  }

  if (status === "canceled") {
    return (
      <span style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {onRetry && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRetry();
            }}
            style={{
              fontSize: 11,
              fontFamily: "inherit",
              background: "transparent",
              border: "1px solid #333",
              color: "#999",
              cursor: "pointer",
              padding: "3px 10px",
              borderRadius: 6,
              transition: "color 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#ccc"; e.currentTarget.style.borderColor = "#555"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#999"; e.currentTarget.style.borderColor = "#333"; }}
          >
            Retry
          </button>
        )}
        <span style={{ fontSize: 11, color: "#666" }}>Canceled</span>
      </span>
    );
  }

  return (
    <span style={{ fontSize: 11, color: "#555", flexShrink: 0 }}>Complete</span>
  );
}

function QuestionsOnly({ questions }: { questions: string[] }) {
  return (
    <div
      style={{
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {questions.map((q, i) => (
        <div
          key={i}
          style={{
            fontSize: 13,
            color: "#777",
            display: "flex",
            gap: 8,
            alignItems: "baseline",
          }}
        >
          <span style={{ fontSize: 11, color: "#555", flexShrink: 0 }}>{i + 1}.</span>
          {q}
        </div>
      ))}
    </div>
  );
}

function AnswersStacked({ answers }: { answers: ElicitationAnswer[] }) {
  return (
    <div
      style={{
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {answers.map((a, i) => (
        <div key={i}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#666",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: 6,
            }}
          >
            {a.question}
          </div>
          {a.type === "freeform" ? (
            <div
              style={{
                fontSize: 13,
                color: "#aaa",
                fontStyle: "italic",
                padding: "4px 0",
              }}
            >
              {a.selected[0] || "—"}
            </div>
          ) : (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {a.selected.map((s, j) => (
                <AnswerTag key={j} text={s} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AnswersSideBySide({ answers }: { answers: ElicitationAnswer[] }) {
  return (
    <div
      style={{
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {answers.map((a, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 12,
            padding: "6px 0",
            borderTop: i > 0 ? "1px solid #1a1a1a" : "none",
            alignItems: "baseline",
          }}
        >
          <div
            style={{
              flex: "0 0 40%",
              fontSize: 12,
              color: "#666",
              lineHeight: 1.4,
            }}
          >
            {a.question}
          </div>
          <div
            style={{
              flex: 1,
              fontSize: 13,
              color: "#aaa",
              lineHeight: 1.4,
              fontStyle: a.type === "freeform" ? "italic" : "normal",
            }}
          >
            {a.selected.join(", ") || "—"}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ElicitationResult({
  summary,
  questions,
  answers,
  duration,
  status = "complete",
  layout = "stacked",
  onRetry,
}: ElicitationResultProps) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const showAnswers = status === "complete" && answers && answers.length > 0;
  const showQuestions = !showAnswers && questions && questions.length > 0;

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
      {/* Collapsed header */}
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
          fontSize: 13,
          transition: "color 0.12s",
        }}
      >
        <FormIcon />
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {summary}
        </span>
        {duration && status === "complete" && (
          <span style={{ fontSize: 11, color: "#555", flexShrink: 0 }}>{duration}</span>
        )}
        <StatusBadge status={status} onRetry={onRetry} />
        <ChevronIcon open={open} />
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {open && (showAnswers || showQuestions) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.12 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ borderTop: "1px solid #222" }}>
              {showQuestions && <QuestionsOnly questions={questions} />}
              {showAnswers && layout === "stacked" && <AnswersStacked answers={answers} />}
              {showAnswers && layout === "side-by-side" && <AnswersSideBySide answers={answers} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
