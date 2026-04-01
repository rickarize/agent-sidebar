import { useState, useEffect } from "react";
import { PromptWithTongue } from "./PromptWithTongue";
import { DebugPanel } from "./DebugPanel";
import { useStickToBottom } from "./useStickToBottom";
import type { ChecklistState, ItemStatus, ElicitationQuestion } from "./types";

const items = [
  { id: "1", text: "Investigate current playground" },
  { id: "2", text: "Gather dataset requirements" },
  { id: "3", text: "Generate dataset" },
  { id: "4", text: "Load dataset" },
  { id: "5", text: "Run playground" },
];

const presets: { label: string; state: ChecklistState }[] = [
  {
    label: "Empty",
    state: { items: [] },
  },
  {
    label: "Start",
    state: {
      items: items.slice(0, 2).map((it, i) => ({ ...it, status: i === 0 ? "active" as const : "pending" as const })),
    },
  },
  {
    label: "Step 1 done",
    state: {
      items: items.slice(0, 2).map((it, i) => ({ ...it, status: (["done", "active"] as const)[i] })),
    },
  },
  {
    label: "Expand",
    state: {
      items: items.map((it, i) => ({ ...it, status: (i < 2 ? "done" : i === 2 ? "active" : "pending") as ItemStatus })),
    },
  },
  {
    label: "Step 4 done",
    state: {
      items: items.map((it, i) => ({ ...it, status: (i < 4 ? "done" : "active") as ItemStatus })),
    },
  },
  {
    label: "Complete",
    state: {
      items: items.map((it) => ({ ...it, status: "done" as const })),
    },
  },
];

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

const LANE_WIDTH = 560;

const fakeMessages: { from: "user" | "assistant"; text: string }[] = [
  { from: "user", text: "Can you help me set up a new dataset?" },
  { from: "assistant", text: "Sure! What kind of data are you working with?" },
  { from: "user", text: "Mostly Q&A pairs for evaluating an LLM." },
  { from: "assistant", text: "Got it. How many examples are you targeting?" },
  { from: "user", text: "Somewhere around 500 to start." },
  { from: "assistant", text: "That's a solid baseline. Do you need train/test splits?" },
  { from: "user", text: "Yeah, standard three-way split would be great." },
  { from: "assistant", text: "I'll set up train, validation, and test. Any format preference?" },
  { from: "user", text: "JSONL if possible." },
  { from: "assistant", text: "Perfect, JSONL it is. One file per split?" },
  { from: "user", text: "Yep, three separate files." },
  { from: "assistant", text: "Working on that now. Should take a minute." },
  { from: "user", text: "Cool, thanks." },
  { from: "assistant", text: "Quick question — should I include metadata fields like source and difficulty?" },
  { from: "user", text: "Yes, both of those would be useful." },
  { from: "assistant", text: "Added. I'm also including a unique ID per example." },
  { from: "user", text: "Smart, that'll help with deduplication later." },
  { from: "assistant", text: "Exactly. The train split has 350 examples so far." },
  { from: "user", text: "What about the other two?" },
  { from: "assistant", text: "75 validation, 75 test. Want me to adjust the ratio?" },
  { from: "user", text: "No, that's fine. 70/15/15 works." },
  { from: "assistant", text: "All three files are ready. Want me to load them into the playground?" },
  { from: "user", text: "Not yet — let me review them first." },
  { from: "assistant", text: "Sure, they're in the output directory whenever you're ready." },
  { from: "user", text: "Looks good, let's load them up." },
];

export default function App() {
  const [presetIndex, setPresetIndex] = useState(1);
  const checklist = presets[presetIndex].state;
  const elicitationMode = presetIndex === 2;
  const messagesRef = useStickToBottom<HTMLDivElement>();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") {
        setPresetIndex((i) => (i - 1 + presets.length) % presets.length);
      } else if (e.key === "ArrowRight") {
        setPresetIndex((i) => (i + 1) % presets.length);
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
                gap: 8,
              }}
            >
              {fakeMessages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: msg.from === "user" ? "flex-end" : "flex-start",
                    maxWidth: "80%",
                    padding: "8px 12px",
                    borderRadius: 10,
                    fontSize: 14,
                    lineHeight: 1.4,
                    background: msg.from === "user" ? "#2a2a2a" : "transparent",
                    color: msg.from === "user" ? "#e0e0e0" : "#999",
                    border: msg.from === "user" ? "none" : "1px solid #222",
                  }}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Prompt + tongue — capped so it can't eat the whole lane */}
            <div style={{ flexShrink: 0, maxHeight: "50vh", overflowY: "auto" }}>
              <PromptWithTongue
                checklist={checklist}
                questions={elicitationMode ? datasetQuestions : undefined}
              />
            </div>
          </div>
        </div>
      </div>
      <DebugPanel
        presets={presets}
        activeIndex={presetIndex}
        onSelect={setPresetIndex}
      />
    </div>
  );
}
