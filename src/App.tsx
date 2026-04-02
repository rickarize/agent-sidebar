import { useState, useEffect, type ReactNode } from "react";
import { PromptWithTongue } from "./PromptWithTongue";
import { DebugPanel } from "./DebugPanel";
import { MetaRow } from "./MetaRow";
import { EntityChip } from "./EntityChip";
import { DataPreview } from "./DataPreview";
import { useStickToBottom } from "./useStickToBottom";
import { PerfMonitor } from "./PerfMonitor";
import type { ChecklistState, ItemStatus, ElicitationQuestion } from "./types";

// ---------------------------------------------------------------------------
// Message types
// ---------------------------------------------------------------------------
type Msg =
  | { type: "user"; text: string }
  | { type: "agent"; text: string }
  | { type: "agent-rich"; content: ReactNode }
  | { type: "meta"; summary: string; detail?: string }
  | { type: "agent-streaming"; text: string };

// ---------------------------------------------------------------------------
// Plan items (tongue checklist)
// ---------------------------------------------------------------------------
const planItems = [
  { id: "1", text: "Investigate current playground" },
  { id: "2", text: "Gather dataset requirements" },
  { id: "3", text: "Generate dataset" },
  { id: "4", text: "Load dataset" },
  { id: "5", text: "Run playground" },
];

function plan(statuses: ItemStatus[]): ChecklistState {
  return { items: statuses.map((s, i) => ({ ...planItems[i], status: s })) };
}

// ---------------------------------------------------------------------------
// Elicitation questions (shown during "Gather dataset requirements")
// ---------------------------------------------------------------------------
const datasetQuestions: ElicitationQuestion[] = [
  {
    id: "q-count",
    prompt: "How many examples should the dataset contain?",
    type: "single",
    options: [
      { id: "50", label: "50 — quick test" },
      { id: "200", label: "200 — small but meaningful" },
      { id: "500", label: "500 — solid baseline" },
      { id: "custom", label: "", hasTextEntry: true },
    ],
  },
  {
    id: "q-content",
    prompt: "What type of content should the examples cover?",
    type: "multi",
    options: [
      { id: "open-ended", label: "Open-ended questions" },
      { id: "multiple-choice", label: "Multiple choice" },
      { id: "factual", label: "Factual Q&A" },
      { id: "custom", label: "", hasTextEntry: true },
    ],
  },
  {
    id: "q-splits",
    prompt: "Should the dataset include splits?",
    type: "single",
    options: [
      { id: "standard", label: "Train / validate / test" },
      { id: "train-test", label: "Train / test only" },
      { id: "none", label: "No splits — single file" },
      { id: "custom", label: "", hasTextEntry: true },
    ],
  },
  {
    id: "q-extra",
    prompt: "Any other requirements?",
    type: "freeform",
  },
];

// ---------------------------------------------------------------------------
// Sample dataset rows for data preview
// ---------------------------------------------------------------------------
const dataColumns = [
  { key: "id", label: "ID", width: 50 },
  { key: "question", label: "Question" },
  { key: "type", label: "Type", width: 80 },
  { key: "difficulty", label: "Diff", width: 50 },
];

const sampleTrainRows = [
  { id: "001", question: "What causes ocean tides?", type: "factual", difficulty: "easy" },
  { id: "002", question: "Explain how neural networks learn", type: "open", difficulty: "hard" },
  { id: "003", question: "What is the capital of France?", type: "factual", difficulty: "easy" },
  { id: "004", question: "Describe the water cycle in detail", type: "open", difficulty: "med" },
  { id: "005", question: "How does photosynthesis work?", type: "factual", difficulty: "med" },
  { id: "006", question: "Compare TCP and UDP protocols", type: "open", difficulty: "hard" },
  { id: "007", question: "What is the speed of light?", type: "factual", difficulty: "easy" },
];

const sampleValRows = [
  { id: "351", question: "Why do leaves change color?", type: "factual", difficulty: "easy" },
  { id: "352", question: "Explain quantum entanglement", type: "open", difficulty: "hard" },
  { id: "353", question: "What is a black hole?", type: "factual", difficulty: "med" },
  { id: "354", question: "Describe the process of mitosis", type: "open", difficulty: "med" },
];

const sampleTestRows = [
  { id: "426", question: "How do vaccines work?", type: "factual", difficulty: "med" },
  { id: "427", question: "Explain the greenhouse effect", type: "open", difficulty: "med" },
  { id: "428", question: "What causes earthquakes?", type: "factual", difficulty: "easy" },
  { id: "429", question: "Describe how encryption works", type: "open", difficulty: "hard" },
];

// ---------------------------------------------------------------------------
// Reusable rich content fragments
// ---------------------------------------------------------------------------
const datasetPreviewContent = (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <div>Dataset ready — 500 examples across three splits:</div>
    <DataPreview
      name="output/train.jsonl"
      meta="350 examples"
      columns={dataColumns}
      rows={sampleTrainRows}
      maxRows={5}
    />
    <DataPreview
      name="output/val.jsonl"
      meta="75 examples"
      columns={dataColumns}
      rows={sampleValRows}
      maxRows={4}
    />
    <DataPreview
      name="output/test.jsonl"
      meta="75 examples"
      columns={dataColumns}
      rows={sampleTestRows}
      maxRows={4}
    />
    <div style={{ marginTop: 2 }}>Loading into the playground next.</div>
  </div>
);

// ---------------------------------------------------------------------------
// Scenario steps — each defines what the user sees at that moment
// ---------------------------------------------------------------------------
interface ScenarioStep {
  label: string;
  description?: string;
  promptText: string;        // what's in the textarea
  checklist: ChecklistState;
  elicitation: boolean;      // whether elicitation questions show
  messages: Msg[];           // conversation so far
}

const steps: ScenarioStep[] = [
  // 0 — Empty state, user hasn't typed yet
  {
    label: "Empty",
    description: "Fresh lane, no conversation yet",
    promptText: "",
    checklist: { items: [] },
    elicitation: false,
    messages: [],
  },

  // 1 — User is composing their prompt
  {
    label: "User typing prompt",
    description: "User is drafting a request in the textarea",
    promptText: "Help me build a Q&A evaluation dataset for the playground",
    checklist: { items: [] },
    elicitation: false,
    messages: [],
  },

  // 2 — Prompt submitted, agent is thinking
  {
    label: "Submitted — agent thinking",
    description: "Prompt sent, plan appears with first item active",
    promptText: "",
    checklist: plan(["active", "pending"]),
    elicitation: false,
    messages: [
      { type: "user", text: "Help me build a Q&A evaluation dataset for the playground" },
      { type: "meta", summary: "Thinking...", detail: "The user wants a Q&A evaluation dataset for the playground. I should first look at how the playground is configured — what format it expects, what schema, whether it supports splits. Let me read the config and loader." },
    ],
  },

  // 3 — Agent investigated playground, reports findings
  {
    label: "Investigated playground",
    description: "Agent read files and reports what it found",
    promptText: "",
    checklist: plan(["done", "active"]),
    elicitation: false,
    messages: [
      { type: "user", text: "Help me build a Q&A evaluation dataset for the playground" },
      { type: "meta", summary: "Thought for 12 seconds", detail: "The user wants a Q&A evaluation dataset for the playground. I should first look at how the playground is configured — what format it expects, what schema, whether it supports splits. Let me read the config and loader." },
      { type: "meta", summary: "Read src/playground/config.ts" },
      { type: "meta", summary: "Read src/playground/loader.ts" },
      { type: "agent-rich", content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>I've looked at the playground setup. It expects JSONL files with <code style={{ color: "#aaa", fontSize: 13 }}>question</code>, <code style={{ color: "#aaa", fontSize: 13 }}>answer</code>, and <code style={{ color: "#aaa", fontSize: 13 }}>metadata</code> fields, and supports train/val/test splits via filename convention.</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <EntityChip name="config.ts" meta="src/playground" />
            <EntityChip name="loader.ts" meta="src/playground" />
          </div>
          <div>I have a few questions about what you'd like in the dataset.</div>
        </div>
      ) },
    ],
  },

  // 4 — Elicitation: agent asks dataset questions
  {
    label: "Elicitation — dataset requirements",
    description: "Agent needs input — elicitation carousel replaces textarea",
    promptText: "",
    checklist: plan(["done", "active"]),
    elicitation: true,
    messages: [
      { type: "user", text: "Help me build a Q&A evaluation dataset for the playground" },
      { type: "meta", summary: "Thought for 12 seconds", detail: "The user wants a Q&A evaluation dataset for the playground. I should first look at how the playground is configured — what format it expects, what schema, whether it supports splits. Let me read the config and loader." },
      { type: "meta", summary: "Read src/playground/config.ts" },
      { type: "meta", summary: "Read src/playground/loader.ts" },
      { type: "agent-rich", content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>I've looked at the playground setup. It expects JSONL files with <code style={{ color: "#aaa", fontSize: 13 }}>question</code>, <code style={{ color: "#aaa", fontSize: 13 }}>answer</code>, and <code style={{ color: "#aaa", fontSize: 13 }}>metadata</code> fields, and supports train/val/test splits via filename convention.</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <EntityChip name="config.ts" meta="src/playground" />
            <EntityChip name="loader.ts" meta="src/playground" />
          </div>
          <div>I have a few questions about what you'd like in the dataset.</div>
        </div>
      ) },
    ],
  },

  // 5 — Requirements gathered, plan expands, generation begins
  {
    label: "Generating dataset",
    description: "User answered questions, agent is generating",
    promptText: "",
    checklist: plan(["done", "done", "active", "pending", "pending"]),
    elicitation: false,
    messages: [
      { type: "user", text: "Help me build a Q&A evaluation dataset for the playground" },
      { type: "meta", summary: "Thought for 12 seconds", detail: "The user wants a Q&A evaluation dataset for the playground. I should first look at how the playground is configured — what format it expects, what schema, whether it supports splits. Let me read the config and loader." },
      { type: "meta", summary: "Read src/playground/config.ts" },
      { type: "meta", summary: "Read src/playground/loader.ts" },
      { type: "agent-rich", content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>I've looked at the playground setup. It expects JSONL files with <code style={{ color: "#aaa", fontSize: 13 }}>question</code>, <code style={{ color: "#aaa", fontSize: 13 }}>answer</code>, and <code style={{ color: "#aaa", fontSize: 13 }}>metadata</code> fields, and supports train/val/test splits via filename convention.</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <EntityChip name="config.ts" meta="src/playground" />
            <EntityChip name="loader.ts" meta="src/playground" />
          </div>
          <div>I have a few questions about what you'd like in the dataset.</div>
        </div>
      ) },
      { type: "meta", summary: "User selected: 500 examples, open-ended + factual, train/val/test splits" },
      { type: "meta", summary: "Thought for 8 seconds", detail: "500 examples with 70/15/15 split → 350 train, 75 val, 75 test. I'll include metadata: unique ID, source tag, difficulty rating. Mix of open-ended and factual Q&A. Let me generate these now." },
      { type: "agent", text: "Got it — 500 examples, open-ended and factual questions, with standard three-way splits. Generating now." },
      { type: "meta", summary: "Ran generate_dataset.py" },
      { type: "agent-streaming", text: "Writing the dataset files" },
    ],
  },

  // 6 — Dataset generated, summary shown
  {
    label: "Dataset generated",
    description: "Files written, agent shows summary",
    promptText: "",
    checklist: plan(["done", "done", "done", "active", "pending"]),
    elicitation: false,
    messages: [
      { type: "user", text: "Help me build a Q&A evaluation dataset for the playground" },
      { type: "meta", summary: "Thought for 12 seconds", detail: "The user wants a Q&A evaluation dataset for the playground. I should first look at how the playground is configured — what format it expects, what schema, whether it supports splits. Let me read the config and loader." },
      { type: "meta", summary: "Read src/playground/config.ts" },
      { type: "meta", summary: "Read src/playground/loader.ts" },
      { type: "agent-rich", content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>I've looked at the playground setup. It expects JSONL files with <code style={{ color: "#aaa", fontSize: 13 }}>question</code>, <code style={{ color: "#aaa", fontSize: 13 }}>answer</code>, and <code style={{ color: "#aaa", fontSize: 13 }}>metadata</code> fields, and supports train/val/test splits via filename convention.</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <EntityChip name="config.ts" meta="src/playground" />
            <EntityChip name="loader.ts" meta="src/playground" />
          </div>
          <div>I have a few questions about what you'd like in the dataset.</div>
        </div>
      ) },
      { type: "meta", summary: "User selected: 500 examples, open-ended + factual, train/val/test splits" },
      { type: "meta", summary: "Thought for 8 seconds", detail: "500 examples with 70/15/15 split → 350 train, 75 val, 75 test. I'll include metadata: unique ID, source tag, difficulty rating. Mix of open-ended and factual Q&A. Let me generate these now." },
      { type: "agent", text: "Got it — 500 examples, open-ended and factual questions, with standard three-way splits. Generating now." },
      { type: "meta", summary: "Ran generate_dataset.py" },
      { type: "meta", summary: "Wrote output/train.jsonl (350 examples)" },
      { type: "meta", summary: "Wrote output/val.jsonl (75 examples)" },
      { type: "meta", summary: "Wrote output/test.jsonl (75 examples)" },
      { type: "agent-rich", content: datasetPreviewContent },
    ],
  },

  // 7 — Loading dataset into playground
  {
    label: "Loading into playground",
    description: "Agent editing config to load the dataset",
    promptText: "",
    checklist: plan(["done", "done", "done", "active", "pending"]),
    elicitation: false,
    messages: [
      { type: "user", text: "Help me build a Q&A evaluation dataset for the playground" },
      { type: "meta", summary: "Thought for 12 seconds", detail: "The user wants a Q&A evaluation dataset for the playground. I should first look at how the playground is configured — what format it expects, what schema, whether it supports splits. Let me read the config and loader." },
      { type: "meta", summary: "Read src/playground/config.ts" },
      { type: "meta", summary: "Read src/playground/loader.ts" },
      { type: "agent-rich", content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>I've looked at the playground setup. It expects JSONL files with <code style={{ color: "#aaa", fontSize: 13 }}>question</code>, <code style={{ color: "#aaa", fontSize: 13 }}>answer</code>, and <code style={{ color: "#aaa", fontSize: 13 }}>metadata</code> fields, and supports train/val/test splits via filename convention.</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <EntityChip name="config.ts" meta="src/playground" />
            <EntityChip name="loader.ts" meta="src/playground" />
          </div>
          <div>I have a few questions about what you'd like in the dataset.</div>
        </div>
      ) },
      { type: "meta", summary: "User selected: 500 examples, open-ended + factual, train/val/test splits" },
      { type: "meta", summary: "Thought for 8 seconds", detail: "500 examples with 70/15/15 split → 350 train, 75 val, 75 test. I'll include metadata: unique ID, source tag, difficulty rating. Mix of open-ended and factual Q&A. Let me generate these now." },
      { type: "agent", text: "Got it — 500 examples, open-ended and factual questions, with standard three-way splits. Generating now." },
      { type: "meta", summary: "Ran generate_dataset.py" },
      { type: "agent-rich", content: datasetPreviewContent },
      { type: "meta", summary: "Edited src/playground/config.ts" },
      { type: "meta", summary: "Ran npm run playground:load" },
      { type: "agent-streaming", text: "The dataset is loaded. I'm starting the playground server so you can" },
    ],
  },

  // 8 — Running playground
  {
    label: "Running playground",
    description: "Playground starting up with the new dataset",
    promptText: "",
    checklist: plan(["done", "done", "done", "done", "active"]),
    elicitation: false,
    messages: [
      { type: "user", text: "Help me build a Q&A evaluation dataset for the playground" },
      { type: "meta", summary: "Thought for 12 seconds", detail: "The user wants a Q&A evaluation dataset for the playground. I should first look at how the playground is configured — what format it expects, what schema, whether it supports splits. Let me read the config and loader." },
      { type: "meta", summary: "Read src/playground/config.ts" },
      { type: "meta", summary: "Read src/playground/loader.ts" },
      { type: "agent-rich", content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>I've looked at the playground setup. It expects JSONL files with <code style={{ color: "#aaa", fontSize: 13 }}>question</code>, <code style={{ color: "#aaa", fontSize: 13 }}>answer</code>, and <code style={{ color: "#aaa", fontSize: 13 }}>metadata</code> fields, and supports train/val/test splits via filename convention.</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <EntityChip name="config.ts" meta="src/playground" />
            <EntityChip name="loader.ts" meta="src/playground" />
          </div>
          <div>I have a few questions about what you'd like in the dataset.</div>
        </div>
      ) },
      { type: "meta", summary: "User selected: 500 examples, open-ended + factual, train/val/test splits" },
      { type: "agent", text: "Got it — 500 examples, open-ended and factual questions, with standard three-way splits. Generating now." },
      { type: "meta", summary: "Ran generate_dataset.py" },
      { type: "agent-rich", content: datasetPreviewContent },
      { type: "meta", summary: "Edited src/playground/config.ts" },
      { type: "meta", summary: "Ran npm run playground:load" },
      { type: "agent", text: "Dataset loaded. Starting the playground server now." },
      { type: "meta", summary: "Ran npm run playground:start" },
      { type: "agent-streaming", text: "Playground is starting on http://localhost:3000 — it should open in your browser" },
    ],
  },

  // 9 — All done
  {
    label: "Complete",
    description: "All steps done, playground running",
    promptText: "",
    checklist: plan(["done", "done", "done", "done", "done"]),
    elicitation: false,
    messages: [
      { type: "user", text: "Help me build a Q&A evaluation dataset for the playground" },
      { type: "meta", summary: "Thought for 12 seconds", detail: "The user wants a Q&A evaluation dataset for the playground. I should first look at how the playground is configured — what format it expects, what schema, whether it supports splits. Let me read the config and loader." },
      { type: "meta", summary: "Read src/playground/config.ts" },
      { type: "meta", summary: "Read src/playground/loader.ts" },
      { type: "agent-rich", content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>I've looked at the playground setup. It expects JSONL files with <code style={{ color: "#aaa", fontSize: 13 }}>question</code>, <code style={{ color: "#aaa", fontSize: 13 }}>answer</code>, and <code style={{ color: "#aaa", fontSize: 13 }}>metadata</code> fields, and supports train/val/test splits via filename convention.</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <EntityChip name="config.ts" meta="src/playground" />
            <EntityChip name="loader.ts" meta="src/playground" />
          </div>
          <div>I have a few questions about what you'd like in the dataset.</div>
        </div>
      ) },
      { type: "meta", summary: "User selected: 500 examples, open-ended + factual, train/val/test splits" },
      { type: "agent", text: "Got it — 500 examples, open-ended and factual questions, with standard three-way splits. Generating now." },
      { type: "meta", summary: "Ran generate_dataset.py" },
      { type: "agent-rich", content: datasetPreviewContent },
      { type: "meta", summary: "Edited src/playground/config.ts" },
      { type: "meta", summary: "Ran npm run playground:load" },
      { type: "agent", text: "Dataset loaded. Starting the playground server now." },
      { type: "meta", summary: "Ran npm run playground:start" },
      { type: "agent", text: "All done. The playground is running at http://localhost:3000 with your 500-example dataset loaded. You can evaluate the Q&A model from there." },
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
                    <MetaRow key={i} summary={msg.summary} detail={msg.detail} />
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
                        maxWidth: "90%",
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
                questions={step.elicitation ? datasetQuestions : undefined}
                defaultPrompt={step.promptText}
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
