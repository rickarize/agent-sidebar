import { useState, useEffect } from "react";
import { PromptWithTongue } from "./PromptWithTongue";
import { DebugPanel } from "./DebugPanel";
import { MetaRow } from "./MetaRow";
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

type FakeMessage =
  | { type: "user"; text: string }
  | { type: "agent"; text: string }
  | { type: "meta"; summary: string; detail?: string }
  | { type: "agent-streaming"; text: string };

const fakeMessages: FakeMessage[] = [
  { type: "user", text: "Can you help me set up a new dataset for evaluating our Q&A model?" },
  { type: "meta", summary: "Thought for 12 seconds", detail: "I need to understand what format the playground expects. Let me check the config and loader files to see what schema they use for datasets. The user wants Q&A evaluation, so I should look for existing dataset conventions and any validation logic that might constrain the format." },
  { type: "agent", text: "I'll look into the current playground setup and figure out what format works best for your evaluation pipeline." },
  { type: "meta", summary: "Read src/playground/config.ts" },
  { type: "meta", summary: "Read src/playground/loader.ts" },
  { type: "agent", text: "The playground expects JSONL with `question`, `answer`, and `metadata` fields. It also supports train/val/test splits via filename convention." },
  { type: "user", text: "Great. Let's do 500 examples with standard splits." },
  { type: "meta", summary: "Thought for 8 seconds", detail: "500 examples with a standard 70/15/15 split gives 350 train, 75 val, 75 test. I should include metadata fields that are useful for evaluation — source, difficulty, and a unique ID for dedup. The generation script needs to produce diverse question types: open-ended, factual, and multiple-choice." },
  { type: "agent", text: "I'll generate 350 train, 75 validation, and 75 test examples. Each will have a unique ID, source tag, and difficulty rating." },
  { type: "meta", summary: "Ran generate_dataset.py" },
  { type: "meta", summary: "Wrote output/train.jsonl (350 examples)" },
  { type: "meta", summary: "Wrote output/val.jsonl (75 examples)" },
  { type: "meta", summary: "Wrote output/test.jsonl (75 examples)" },
  { type: "agent", text: "All three files are ready. The examples cover open-ended, factual, and multiple-choice questions with a roughly even distribution." },
  { type: "user", text: "Can you check if there are any duplicates across splits?" },
  { type: "meta", summary: "Ran dedup_check.py" },
  { type: "agent", text: "No duplicates found. All 500 examples have unique question text and unique IDs." },
  { type: "user", text: "Perfect. Load them into the playground." },
  { type: "meta", summary: "Thought for 3 seconds", detail: "I need to update the playground config to point at the new dataset files. The config uses a datasets array where each entry has a path and split name." },
  { type: "meta", summary: "Edited src/playground/config.ts" },
  { type: "agent-streaming", text: "Loading the dataset now. I've updated the config to point at the new files and" },
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
                gap: 2,
              }}
            >
              {fakeMessages.map((msg, i) => {
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
