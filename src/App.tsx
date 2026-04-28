import { useState, useEffect, type ReactNode } from "react";
import { motion } from "motion/react";
import { PromptWithTongue } from "./PromptWithTongue";
import { DebugPanel } from "./DebugPanel";
import { MetaRow } from "./MetaRow";
import { DataPreview } from "./DataPreview";
import { PendingToolCall, ToolApprovalButtons } from "./PendingToolCall";
import { NextStepsStack } from "./NextStepsStack";
import { useStickToBottom } from "./useStickToBottom";
import { useUISettings } from "./UISettingsContext";
import { PerfMonitor } from "./PerfMonitor";
import type { ChecklistState, ElicitationQuestion, ElicitationAnswers } from "./types";

// ---------------------------------------------------------------------------
// Message types
// ---------------------------------------------------------------------------
type Msg =
  | { type: "user"; text: string }
  | { type: "agent"; text: string }
  | { type: "agent-rich"; content: ReactNode }
  | { type: "meta"; summary: string; detail?: string; pending?: boolean }
  | { type: "agent-streaming"; text: string };

// ---------------------------------------------------------------------------
// Elicitation questions — Tool permission (option 3b)
// ---------------------------------------------------------------------------
const toolPermissionQuestions: ElicitationQuestion[] = [
  {
    id: "q-permission",
    prompt: <>Allow tool <code style={{ color: "#aaa", fontSize: 13 }}>px_filter_set</code>?</>,
    type: "single",
    options: [
      { id: "approve-once", label: "Approve this time" },
      { id: "always-allow", label: "Always allow 'Change page filter'" },
      { id: "deny", label: "Deny" },
      { id: "custom", label: "Other", hasTextEntry: true, placeholder: "What should PXI do?" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Sample data — frustrated customers
// ---------------------------------------------------------------------------
const frustratedColumns = [
  { key: "session", label: "Session", width: 100 },
  { key: "user", label: "User" },
  { key: "sentiment", label: "Sentiment", width: 80 },
  { key: "issue", label: "Issue" },
];

const frustratedCustomerRows = [
  { session: "sess_8a2f", user: "alice@acme.co", sentiment: "angry", issue: "Payment failed 3 times" },
  { session: "sess_9c3d", user: "bob@example.com", sentiment: "frustrated", issue: "Can't access dashboard" },
  { session: "sess_1e4a", user: "carol@corp.io", sentiment: "annoyed", issue: "Slow response times" },
  { session: "sess_7b5c", user: "dave@startup.co", sentiment: "angry", issue: "Data export broken" },
  { session: "sess_2f6e", user: "eve@bigco.com", sentiment: "frustrated", issue: "Missing invoices" },
  { session: "sess_4d8g", user: "frank@tech.io", sentiment: "annoyed", issue: "API rate limiting" },
  { session: "sess_5e9h", user: "grace@retail.co", sentiment: "angry", issue: "Order stuck in processing" },
];

// ---------------------------------------------------------------------------
// Reusable rich content fragments
// ---------------------------------------------------------------------------

const pendingToolNoButtonsContent = (
  <PendingToolCall
    toolName="bash"
    command="px filter set --range=30d --type=traces"
    hideButtons
  />
);

function PendingToolWithExternalButtons() {
  const { buttonAlign } = useUISettings();
  const isRight = buttonAlign === "right";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <PendingToolCall
        toolName="bash"
        command="px filter set --range=30d --type=traces"
        hideButtons
      />
      <div style={{ display: "flex", alignItems: "center", padding: "4px 0 8px", flexDirection: isRight ? "row" : "row-reverse" }}>
        <span style={{ fontSize: 14, color: "#ccc" }}>
          Allow tool <code style={{ color: "#aaa", fontSize: 13 }}>px_filter_set</code>?
        </span>
        <div style={{ flex: 1 }} />
        <ToolApprovalButtons onApprove={() => {}} onDeny={() => {}} onModify={() => {}} />
      </div>
    </div>
  );
}

function ColoredApprovalButtons() {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <motion.button
        whileTap={{ scale: 0.97 }}
        style={{
          padding: "5px 12px",
          fontSize: 12,
          fontFamily: "inherit",
          background: "transparent",
          border: "1px solid #333",
          borderRadius: 6,
          color: "#999",
          cursor: "pointer",
        }}
      >
        Deny
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.97 }}
        style={{
          padding: "5px 12px",
          fontSize: 12,
          fontFamily: "inherit",
          background: "#1a3d1a",
          border: "1px solid #2d5a2d",
          borderRadius: 6,
          color: "#7fbf7f",
          cursor: "pointer",
        }}
      >
        Approve
      </motion.button>
    </div>
  );
}

function PendingToolWithColoredButtons() {
  const { buttonAlign } = useUISettings();
  const isRight = buttonAlign === "right";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <PendingToolCall
        toolName="bash"
        command="px filter set --range=30d --type=traces"
        hideButtons
      />
      <div style={{ display: "flex", alignItems: "center", padding: "4px 0 8px", flexDirection: isRight ? "row" : "row-reverse" }}>
        <span style={{ fontSize: 14, color: "#ccc" }}>
          Allow tool <code style={{ color: "#aaa", fontSize: 13 }}>px_filter_set</code>?
        </span>
        <div style={{ flex: 1 }} />
        <ColoredApprovalButtons />
      </div>
    </div>
  );
}

const approvedToolContent = (
  <PendingToolCall
    toolName="bash"
    command="px filter set --range=30d --type=traces"
    status="approved"
  />
);

const nextStepsContent = (
  <NextStepsStack
    steps={[
      { id: "viz", label: "Create a visualization", description: "Chart sentiment trends over time", icon: "chart" },
      { id: "export", label: "Export to CSV", description: "Download for external analysis", icon: "export" },
      { id: "alert", label: "Set up alerts", description: "Get notified when frustration spikes", icon: "alert" },
    ]}
    onSelect={() => {}}
  />
);

const resultsTableContent = (
  <DataPreview
    name="frustrated_customers.json"
    meta="47 matches · last 30 days"
    columns={frustratedColumns}
    rows={frustratedCustomerRows}
    maxRows={5}
    defaultOpen
    actionButton={{
      label: "Visualize",
      icon: "chart",
      onClick: () => {},
    }}
  />
);

const analysisContent = (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <div style={{ fontSize: 14, color: "#ccc", lineHeight: 1.5 }}>
      I found <strong style={{ color: "#e8c48a" }}>47 sessions</strong> with frustrated customers in the last 30 days.
      Common issues: payment failures (18), access problems (12), and slow performance (9).
    </div>
    {resultsTableContent}
    {nextStepsContent}
  </div>
);

function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {data.map((d) => (
        <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 100, fontSize: 12, color: "#999", textAlign: "right", flexShrink: 0 }}>
            {d.label}
          </span>
          <div style={{ flex: 1, height: 6, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(d.value / max) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ height: "100%", background: d.color, borderRadius: 3 }}
            />
          </div>
          <span style={{ width: 30, fontSize: 12, color: "#777", flexShrink: 0 }}>{d.value}</span>
        </div>
      ))}
    </div>
  );
}

function VerticalBarChart({ data }: { data: { value: number; color: string }[] }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 60 }}>
      {data.map((d, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(d.value / max) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.02 }}
          style={{ width: 6, background: d.color, borderRadius: 2, minHeight: 2 }}
        />
      ))}
    </div>
  );
}

function StackedBarChart({ data }: { data: { label: string; segments: { value: number; color: string }[] }[] }) {
  const totals = data.map((d) => d.segments.reduce((sum, s) => sum + s.value, 0));
  const max = Math.max(...totals);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {data.map((d, i) => (
        <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 60, fontSize: 11, color: "#999", textAlign: "right", flexShrink: 0 }}>
            {d.label}
          </span>
          <div style={{ flex: 1, height: 6, background: "#1a1a1a", borderRadius: 3, overflow: "hidden", display: "flex" }}>
            {d.segments.map((seg, j) => (
              <motion.div
                key={j}
                initial={{ width: 0 }}
                animate={{ width: `${(seg.value / max) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut", delay: j * 0.1 }}
                style={{ height: "100%", background: seg.color }}
              />
            ))}
          </div>
          <span style={{ width: 30, fontSize: 11, color: "#777", flexShrink: 0 }}>{totals[i]}</span>
        </div>
      ))}
    </div>
  );
}

function LineChart({ lines, width = 200, height = 60 }: { lines: { data: number[]; color: string }[]; width?: number; height?: number }) {
  const allValues = lines.flatMap((l) => l.data);
  const max = Math.max(...allValues);
  const min = Math.min(...allValues);
  const range = max - min || 1;

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      {lines.map((line, lineIndex) => {
        const points = line.data.map((v, i) => {
          const x = (i / (line.data.length - 1)) * width;
          const y = height - ((v - min) / range) * (height - 8) - 4;
          return `${x},${y}`;
        });
        return (
          <motion.polyline
            key={lineIndex}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: lineIndex * 0.2 }}
            points={points.join(" ")}
            fill="none"
            stroke={line.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}

const monthlyData = Array.from({ length: 30 }, (_, i) => ({
  value: Math.floor(Math.random() * 15) + 3,
  color: i < 10 ? "#5c8ac4" : i < 20 ? "#c4955c" : "#c45c5c",
}));

const stackedData = [
  { label: "Week 1", segments: [{ value: 5, color: "#c45c5c" }, { value: 3, color: "#c4955c" }, { value: 2, color: "#5c8ac4" }] },
  { label: "Week 2", segments: [{ value: 4, color: "#c45c5c" }, { value: 4, color: "#c4955c" }, { value: 3, color: "#5c8ac4" }] },
  { label: "Week 3", segments: [{ value: 6, color: "#c45c5c" }, { value: 2, color: "#c4955c" }, { value: 4, color: "#5c8ac4" }] },
  { label: "Week 4", segments: [{ value: 3, color: "#c45c5c" }, { value: 5, color: "#c4955c" }, { value: 2, color: "#5c8ac4" }] },
];

const lineData = {
  line1: [12, 15, 11, 18, 14, 20, 17, 22, 19, 25, 21, 18],
  line2: [8, 10, 9, 12, 11, 14, 12, 15, 13, 17, 14, 12],
};

const visualizationContent = (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ fontSize: 14, color: "#ccc", lineHeight: 1.5 }}>
      Here's a breakdown of frustrated customer issues over the last 30 days:
    </div>
    <div
      style={{
        padding: 12,
        background: "#111",
        border: "1px solid #222",
        borderRadius: 10,
      }}
    >
      <div style={{ fontSize: 11, color: "#666", marginBottom: 10, fontWeight: 500 }}>
        Issues by Category
      </div>
      <BarChart
        data={[
          { label: "Payment", value: 18, color: "#c45c5c" },
          { label: "Access", value: 12, color: "#c4955c" },
          { label: "Performance", value: 9, color: "#5c8ac4" },
          { label: "Data/Export", value: 5, color: "#7c5cc4" },
          { label: "Other", value: 3, color: "#5cc4a8" },
        ]}
      />
    </div>
    <div
      style={{
        padding: 12,
        background: "#111",
        border: "1px solid #222",
        borderRadius: 10,
      }}
    >
      <div style={{ fontSize: 11, color: "#666", marginBottom: 10, fontWeight: 500 }}>
        Daily Volume (30 days)
      </div>
      <VerticalBarChart data={monthlyData} />
    </div>
    <div
      style={{
        padding: 12,
        background: "#111",
        border: "1px solid #222",
        borderRadius: 10,
      }}
    >
      <div style={{ fontSize: 11, color: "#666", marginBottom: 10, fontWeight: 500 }}>
        Weekly Breakdown
      </div>
      <StackedBarChart data={stackedData} />
    </div>
    <div
      style={{
        padding: 12,
        background: "#111",
        border: "1px solid #222",
        borderRadius: 10,
      }}
    >
      <div style={{ fontSize: 11, color: "#666", marginBottom: 10, fontWeight: 500 }}>
        Trend Comparison
      </div>
      <LineChart
        lines={[
          { data: lineData.line1, color: "#c45c5c" },
          { data: lineData.line2, color: "#5c8ac4" },
        ]}
        width={480}
        height={60}
      />
    </div>
    <div style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>
      Payment failures are the top issue, accounting for 38% of frustrated sessions.
      Consider prioritizing payment flow improvements.
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Scenario steps — each defines what the user sees at that moment
// ---------------------------------------------------------------------------
interface ScenarioStep {
  label: string;
  description?: string;
  promptText: string;
  checklist: ChecklistState;
  elicitation: boolean;
  elicitationQuestions?: ElicitationQuestion[];
  elicitationDelay?: number;
  elicitationDefaultAnswers?: ElicitationAnswers;
  messages: Msg[];
}

const steps: ScenarioStep[] = [
  // 0 — Empty state
  {
    label: "Empty",
    description: "Fresh lane, no conversation yet",
    promptText: "",
    checklist: { items: [] },
    elicitation: false,
    messages: [],
  },

  // 1 — User typing prompt
  {
    label: "User typing",
    description: "User drafting request",
    promptText: "Find frustrated customers in the last month",
    checklist: { items: [] },
    elicitation: false,
    messages: [],
  },

  // 2 — Submitted, LLM thinking
  {
    label: "Thinking",
    description: "Request submitted, LLM processing",
    promptText: "",
    checklist: { items: [] },
    elicitation: false,
    messages: [
      { type: "user", text: "Find frustrated customers in the last month" },
      { type: "meta", summary: "Thinking", pending: true },
    ],
  },

  // 3a — Pending tool: Buttons outside card
  {
    label: "3a: Tool (external buttons)",
    description: "Approve/deny/modify below the card",
    promptText: "",
    checklist: { items: [] },
    elicitation: false,
    messages: [
      { type: "user", text: "Find frustrated customers in the last month" },
      { type: "meta", summary: "Thought for 3 seconds", detail: "The user wants to find frustrated customers from the last month. I need to adjust the page filter to show the last 30 days, then search for annotations with negative sentiment." },
      { type: "agent-rich", content: <PendingToolWithExternalButtons /> },
    ],
  },

  // 3b — Pending tool: Elicitation-style permission
  {
    label: "3b: Tool (elicitation)",
    description: "Permission via elicitation carousel",
    promptText: "",
    checklist: { items: [] },
    elicitation: true,
    elicitationQuestions: toolPermissionQuestions,
    elicitationDelay: 0,
    elicitationDefaultAnswers: { "q-permission": ["approve-once"] },
    messages: [
      { type: "user", text: "Find frustrated customers in the last month" },
      { type: "meta", summary: "Thought for 3 seconds", detail: "The user wants to find frustrated customers from the last month. I need to adjust the page filter to show the last 30 days, then search for annotations with negative sentiment." },
      { type: "agent-rich", content: pendingToolNoButtonsContent },
    ],
  },

  // 3c — Pending tool: Colored approve/deny buttons
  {
    label: "3c: Tool (colored buttons)",
    description: "Green approve, neutral deny",
    promptText: "",
    checklist: { items: [] },
    elicitation: false,
    messages: [
      { type: "user", text: "Find frustrated customers in the last month" },
      { type: "meta", summary: "Thought for 3 seconds", detail: "The user wants to find frustrated customers from the last month. I need to adjust the page filter to show the last 30 days, then search for annotations with negative sentiment." },
      { type: "agent-rich", content: <PendingToolWithColoredButtons /> },
    ],
  },

  // 4 — Tool approved, searching
  {
    label: "Searching",
    description: "Filter applied, searching annotations",
    promptText: "",
    checklist: { items: [] },
    elicitation: false,
    messages: [
      { type: "user", text: "Find frustrated customers in the last month" },
      { type: "meta", summary: "Thought for 3 seconds", detail: "The user wants to find frustrated customers from the last month. I need to adjust the page filter to show the last 30 days, then search for annotations with negative sentiment." },
      { type: "agent", text: "I'll need to adjust the page filters to show traces from the last 30 days." },
      { type: "agent-rich", content: approvedToolContent },
      { type: "meta", summary: "Changed filter to last 30 days" },
      { type: "meta", summary: "Searching annotations", pending: true },
    ],
  },

  // 5 — Analyzing traces
  {
    label: "Analyzing",
    description: "Analyzing trace patterns",
    promptText: "",
    checklist: { items: [] },
    elicitation: false,
    messages: [
      { type: "user", text: "Find frustrated customers in the last month" },
      { type: "meta", summary: "Thought for 3 seconds", detail: "The user wants to find frustrated customers from the last month. I need to adjust the page filter to show the last 30 days, then search for annotations with negative sentiment." },
      { type: "agent", text: "I'll need to adjust the page filters to show traces from the last 30 days." },
      { type: "agent-rich", content: approvedToolContent },
      { type: "meta", summary: "Changed filter to last 30 days" },
      { type: "meta", summary: "Found 47 sessions with negative sentiment" },
      { type: "meta", summary: "Analyzing trace patterns", pending: true },
    ],
  },

  // 6 — Results with table and next steps
  {
    label: "Results + next steps",
    description: "Table with visualize button, stacked suggestions",
    promptText: "",
    checklist: { items: [] },
    elicitation: false,
    messages: [
      { type: "user", text: "Find frustrated customers in the last month" },
      { type: "meta", summary: "Thought for 3 seconds", detail: "The user wants to find frustrated customers from the last month. I need to adjust the page filter to show the last 30 days, then search for annotations with negative sentiment." },
      { type: "agent", text: "I'll need to adjust the page filters to show traces from the last 30 days." },
      { type: "agent-rich", content: approvedToolContent },
      { type: "meta", summary: "Changed filter to last 30 days" },
      { type: "meta", summary: "Found 47 sessions with negative sentiment" },
      { type: "meta", summary: "Analyzed trace patterns" },
      { type: "agent-rich", content: analysisContent },
    ],
  },

  // 7 — Visualization
  {
    label: "Visualization",
    description: "Chart showing issue breakdown",
    promptText: "",
    checklist: { items: [] },
    elicitation: false,
    messages: [
      { type: "user", text: "Find frustrated customers in the last month" },
      { type: "meta", summary: "Thought for 3 seconds", detail: "The user wants to find frustrated customers from the last month. I need to adjust the page filter to show the last 30 days, then search for annotations with negative sentiment." },
      { type: "agent", text: "I'll need to adjust the page filters to show traces from the last 30 days." },
      { type: "agent-rich", content: approvedToolContent },
      { type: "meta", summary: "Changed filter to last 30 days" },
      { type: "meta", summary: "Found 47 sessions with negative sentiment" },
      { type: "meta", summary: "Analyzed trace patterns" },
      { type: "agent-rich", content: visualizationContent },
    ],
  },
];

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
const LANE_WIDTH = 560;

export default function App() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];
  const messagesRef = useStickToBottom<HTMLDivElement>();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowLeft") {
        setStepIndex((i) => (i - 1 + steps.length) % steps.length);
      } else if (e.key === "ArrowRight") {
        setStepIndex((i) => (i + 1) % steps.length);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0a0a0a" }}>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Agent messaging lane */}
        <div
          style={{
            width: LANE_WIDTH,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: "40px 0",
          }}
        >
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              border: "1px solid #222",
              borderRadius: 16,
              overflow: "hidden",
              background: "#0d0d0d",
            }}
          >
            {/* Messages */}
            <div
              ref={messagesRef}
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                scrollbarGutter: "stable",
                padding: "16px 16px 8px",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {step.messages.map((msg, i) => {
                if (msg.type === "user") {
                  return (
                    <div
                      key={i}
                      style={{
                        alignSelf: "flex-end",
                        maxWidth: "80%",
                        padding: "8px 12px",
                        borderRadius: 10,
                        fontSize: 14,
                        lineHeight: 1.4,
                        background: "#1a1a1a",
                        color: "#c0c0c0",
                        marginTop: 10,
                      }}
                    >
                      {msg.text}
                    </div>
                  );
                }
                if (msg.type === "meta") {
                  return (
                    <MetaRow key={i} summary={msg.summary} detail={msg.detail} pending={msg.pending} />
                  );
                }
                if (msg.type === "agent-streaming") {
                  return (
                    <div
                      key={i}
                      style={{
                        maxWidth: "90%",
                        padding: "6px 0",
                        fontSize: 14,
                        lineHeight: 1.5,
                        color: "#ccc",
                        marginTop: 4,
                      }}
                    >
                      {msg.text}
                      <span
                        style={{
                          display: "inline-block",
                          width: 6,
                          height: 16,
                          background: "#888",
                          borderRadius: 1,
                          marginLeft: 2,
                          verticalAlign: "text-bottom",
                          animation: "blink 1s steps(2) infinite",
                        }}
                      />
                    </div>
                  );
                }
                if (msg.type === "agent-rich") {
                  return (
                    <div
                      key={i}
                      style={{
                        width: "100%",
                        padding: "6px 0",
                        fontSize: 14,
                        lineHeight: 1.5,
                        color: "#ccc",
                        marginTop: 4,
                      }}
                    >
                      {msg.content}
                    </div>
                  );
                }
                // agent
                return (
                  <div
                    key={i}
                    style={{
                      maxWidth: "90%",
                      padding: "6px 0",
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: "#ccc",
                      marginTop: 4,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.text}
                  </div>
                );
              })}
            </div>

            {/* Prompt + tongue — capped so it can't eat the whole lane */}
            <div style={{ flexShrink: 0, maxHeight: "50vh", overflowY: "auto", padding: "0 10px 10px" }}>
              <PromptWithTongue
                checklist={step.checklist}
                questions={step.elicitation ? (step.elicitationQuestions || toolPermissionQuestions) : undefined}
                defaultPrompt={step.promptText}
                elicitationDelay={step.elicitationDelay}
                defaultAnswers={step.elicitationDefaultAnswers}
              />
            </div>
          </div>
        </div>
      </div>
      <DebugPanel
        steps={steps.map((s) => ({ label: s.label, description: s.description }))}
        activeIndex={stepIndex}
        onSelect={setStepIndex}
      >
        <PerfMonitor />
      </DebugPanel>
    </div>
  );
}
