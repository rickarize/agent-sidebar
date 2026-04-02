import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useIsPresent } from "motion/react";
import type { ChecklistItem, ChecklistState, ItemStatus, ElicitationQuestion, ElicitationAnswers } from "./types";

function Spinner() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        opacity: { duration: 0.12, ease: "easeOut" },
        scale: {
          type: "spring",
          stiffness: 240,
          damping: 16,
          mass: 0.55,
        },
      }}
      style={{
        width: 18,
        height: 18,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        style={{ display: "block", transform: "translateY(0.5px)" }}
      >
        <circle cx="8" cy="8" r="6" stroke="#333" strokeWidth="2.2" />
        <path
          d="M8 2A6 6 0 0 1 14 8"
          stroke="#999"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </motion.svg>
    </motion.div>
  );
}

function ChecklistRow({ item, completionStagger, entryDelay }: { item: ChecklistItem; completionStagger: number; entryDelay: number }) {
  const isPresent = useIsPresent();
  const initialStatusRef = useRef(item.status);
  const prevStatusRef = useRef(item.status);
  const [justCompleted, setJustCompleted] = useState(false);
  const [showActive, setShowActive] = useState(item.status === "active");

  const isDone = item.status === "done";
  const arrivedDone = initialStatusRef.current === "done";

  useEffect(() => {
    const wasStatus = prevStatusRef.current;
    prevStatusRef.current = item.status;

    if (item.status === "done" && wasStatus !== "done") {
      setJustCompleted(true);
      setShowActive(false);
      const timer = setTimeout(() => setJustCompleted(false), 600 + completionStagger * 1000);
      return () => clearTimeout(timer);
    }

    if (item.status === "active" && wasStatus !== "active") {
      setShowActive(false);
      const timer = setTimeout(() => setShowActive(true), 2000);
      return () => clearTimeout(timer);
    }

    if (item.status !== "active") {
      setShowActive(false);
    }
  }, [item.status, completionStagger]);

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{
        type: "spring",
        stiffness: 700,
        damping: 24,
        mass: 0.6,
        delay: entryDelay,
        opacity: { duration: 0.12, delay: entryDelay },
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        paddingBlock: 3,
        fontSize: 14,
        borderRadius: 4,
        position: isPresent ? "relative" : "absolute",
        top: isPresent ? undefined : 0,
        left: isPresent ? undefined : 0,
        right: isPresent ? undefined : 0,
      }}
    >
      <motion.span
        animate={{
          scale: justCompleted ? [0.4, 1.5, 0.9, 1.1, 1] : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 10,
          mass: 0.4,
          delay: completionStagger,
        }}
        style={{
          width: 18,
          height: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {isDone ? (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8.5L6.5 12L13 4"
              stroke="#34d399"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : showActive ? (
          <Spinner />
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="#555" strokeWidth="1.8" />
          </svg>
        )}
      </motion.span>
      <motion.span
        animate={{
          color: isDone ? "#666" : showActive ? "#e0e0e0" : "#999",
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          position: "relative",
        }}
      >
        <span style={{ position: "relative", display: "inline-block" }}>
          {item.text}
          {arrivedDone ? (
            <span
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "52%",
                height: 2,
                background: "#686868",
                pointerEvents: "none",
              }}
            />
          ) : isDone ? (
            <motion.span
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              animate={{ clipPath: "inset(0 0% 0 0)" }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 30,
                mass: 0.5,
                delay: 0.2 + completionStagger,
              }}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "52%",
                height: 2,
                background: "#686868",
                pointerEvents: "none",
              }}
            />
          ) : null}
        </span>
      </motion.span>
    </motion.li>
  );
}

const COMPLETION_STAGGER = 0.15;

function OptionButton({
  selected,
  type,
  label,
  hasTextEntry,
  textValue,
  onToggle,
  onTextChange,
}: {
  selected: boolean;
  type: "single" | "multi";
  label: string;
  hasTextEntry?: boolean;
  textValue?: string;
  onToggle: () => void;
  onTextChange?: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selected && hasTextEntry && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selected, hasTextEntry]);

  return (
    <motion.div
      onClick={onToggle}
      whileTap={{ scale: 0.98, transition: { type: "tween", duration: 0.06 } }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "10px 12px",
        background: selected ? "rgba(255, 255, 255, 0.08)" : "transparent",
        border: `1px solid ${selected ? "#888" : "#333"}`,
        borderRadius: 8,
        cursor: "pointer",
        color: selected ? "#e0e0e0" : "#999",
        fontSize: 14,
        fontFamily: "inherit",
        textAlign: "left",
        transition: "border-color 0.15s, background 0.15s, color 0.15s",
        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: type === "single" ? "50%" : 4,
          border: `2px solid ${selected ? "#e0e0e0" : "#555"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "border-color 0.15s",
        }}
      >
        {selected && type === "single" && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#e0e0e0",
            }}
          />
        )}
        {selected && type === "multi" && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M3 8.5L6.5 12L13 4"
              stroke="#e0e0e0"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </span>
      {hasTextEntry ? (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}
        >
          {label && <span style={{ flexShrink: 0 }}>{label}</span>}
          <input
            ref={inputRef}
            type="text"
            value={textValue || ""}
            placeholder="Enter a different value..."
            onMouseDown={() => { if (!selected) onToggle(); }}
            onChange={(e) => {
              if (!selected) onToggle();
              onTextChange?.(e.target.value);
            }}
            style={{
              flex: 1,
              minWidth: 0,
              background: "transparent",
              border: "none",
              borderBottom: `1px solid ${selected ? "#888" : "#444"}`,
              outline: "none",
              color: "#e0e0e0",
              fontSize: 14,
              fontFamily: "inherit",
              padding: "2px 4px",
              transition: "border-color 0.15s",
            }}
          />
        </div>
      ) : (
        label
      )}
    </motion.div>
  );
}

const ELICITATION_ENTRY_DELAY = 2.0; // seconds — synced with checklist spinner delay
const ELICITATION_STAGGER = 0.04; // seconds between each row

function ElicitationCarousel({
  questions,
  answers,
  customTexts,
  onAnswersChange,
  onCustomTextChange,
  onSubmit,
}: {
  questions: ElicitationQuestion[];
  answers: ElicitationAnswers;
  customTexts: Record<string, string>;
  onAnswersChange: (answers: ElicitationAnswers) => void;
  onCustomTextChange: (key: string, value: string) => void;
  onSubmit: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const isInitialMount = useRef(true);
  const total = questions.length;
  const question = questions[currentIndex];

  useEffect(() => {
    // After first question renders, clear the initial mount flag
    const timer = setTimeout(() => { isInitialMount.current = false; }, (ELICITATION_ENTRY_DELAY + 0.5) * 1000);
    return () => clearTimeout(timer);
  }, []);

  const goTo = (idx: number) => {
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  const toggleOption = (questionId: string, optionId: string, type: "single" | "multi") => {
    const current = (answers[questionId] as string[]) || [];
    let next: string[];
    if (type === "single") {
      next = current.includes(optionId) ? [] : [optionId];
    } else {
      next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
    }
    onAnswersChange({ ...answers, [questionId]: next });
  };

  const setFreeform = (questionId: string, value: string) => {
    onAnswersChange({ ...answers, [questionId]: value });
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 120 : -120, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -120 : 120, opacity: 0 }),
  };

  // On initial mount, stagger each element in from zero
  // On subsequent question navigations, no stagger
  const entryBase = 0;
  const stagger = isInitialMount.current ? ELICITATION_STAGGER : 0;

  // Chrome (nav, header) builds upward first, then content fills in top-to-bottom
  const navDelay = entryBase;
  const headerDelay = entryBase + stagger;
  const promptDelay = entryBase + 2 * stagger;
  const optionDelay = (i: number) => entryBase + (3 + i) * stagger;
  const freeformDelay = entryBase + 3 * stagger;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Header with step indicator */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 24,
          mass: 0.6,
          delay: headerDelay,
          opacity: { duration: 0.12, delay: headerDelay },
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px 4px",
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Question {currentIndex + 1} of {total}
        </span>
        {/* Dot indicators */}
        <div style={{ display: "flex", gap: 6 }}>
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: i === currentIndex ? "#e0e0e0" : "#444",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "background 0.2s",
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Question carousel */}
      <motion.div
        initial={isInitialMount.current ? { height: 90 } : false}
        animate={{ height: 230 }}
        transition={{ duration: 0.2, ease: [0.15, 0.6, 0.35, 1] }}
        style={{ position: "relative", overflow: "hidden" }}
      >
        <AnimatePresence custom={direction} mode="popLayout">
          <motion.div
            key={question.id}
            custom={direction}
            variants={variants}
            initial={isInitialMount.current ? false : "enter"}
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 400, damping: 32, mass: 0.8 }}
            style={{ padding: "8px 16px 12px" }}
          >
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 700,
                damping: 24,
                mass: 0.6,
                delay: promptDelay,
                opacity: { duration: 0.12, delay: promptDelay },
              }}
              style={{ fontSize: 15, color: "#e0e0e0", marginBottom: 12, fontWeight: 500 }}
            >
              {question.prompt}
            </motion.div>

            {question.type === "freeform" ? (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 700,
                  damping: 24,
                  mass: 0.6,
                  delay: freeformDelay,
                  opacity: { duration: 0.12, delay: freeformDelay },
                }}
              >
                <textarea
                  value={(answers[question.id] as string) || ""}
                  onChange={(e) => setFreeform(question.id, e.target.value)}
                  placeholder="Type your custom instructions..."
                  style={{
                    width: "100%",
                    height: 150,
                    background: "rgba(255,255,255,0.04)",
                    color: "#e0e0e0",
                    border: "1px solid #333",
                    borderRadius: 8,
                    outline: "none",
                    resize: "none",
                    padding: "10px 12px",
                    fontSize: 14,
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#888"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#333"; }}
                />
              </motion.div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {question.options?.map((opt, i) => (
                  <motion.div
                    key={opt.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 700,
                      damping: 24,
                      mass: 0.6,
                      delay: optionDelay(i),
                      opacity: { duration: 0.12, delay: optionDelay(i) },
                    }}
                  >
                    <OptionButton
                      selected={((answers[question.id] as string[]) || []).includes(opt.id)}
                      type={question.type as "single" | "multi"}
                      label={opt.label}
                      hasTextEntry={opt.hasTextEntry}
                      textValue={customTexts[`${question.id}:${opt.id}`]}
                      onToggle={() => toggleOption(question.id, opt.id, question.type as "single" | "multi")}
                      onTextChange={(v) => onCustomTextChange(`${question.id}:${opt.id}`, v)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Navigation buttons */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 24,
          mass: 0.6,
          delay: navDelay,
          opacity: { duration: 0.12, delay: navDelay },
        }}
        style={{ display: "flex", justifyContent: "space-between", padding: "4px 16px 12px" }}
      >
        <motion.button
          whileTap={currentIndex > 0 ? { scale: 0.97, transition: { type: "tween", duration: 0.06 } } : undefined}
          onClick={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0}
          style={{
            padding: "6px 14px",
            fontSize: 13,
            fontFamily: "inherit",
            background: "transparent",
            border: "1px solid #333",
            borderRadius: 6,
            color: currentIndex === 0 ? "#444" : "#999",
            cursor: currentIndex === 0 ? "default" : "pointer",
            transition: "color 0.15s, border-color 0.15s",
          }}
        >
          Back
        </motion.button>
        {currentIndex === total - 1 ? (
          <motion.button
            whileTap={{ scale: 0.97, transition: { type: "tween", duration: 0.06 } }}
            onClick={onSubmit}
            style={{
              padding: "6px 14px",
              fontSize: 13,
              fontFamily: "inherit",
              background: "#e0e0e0",
              border: "1px solid #e0e0e0",
              borderRadius: 6,
              color: "#111",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            Submit
          </motion.button>
        ) : (() => {
          const currentAnswers = answers[question.id];
          const hasAnswer = Array.isArray(currentAnswers) ? currentAnswers.length > 0 : !!currentAnswers;
          return (
            <motion.button
              whileTap={{ scale: 0.97, transition: { type: "tween", duration: 0.06 } }}
              onClick={() => goTo(currentIndex + 1)}
              style={{
                padding: "6px 14px",
                fontSize: 13,
                fontFamily: "inherit",
                background: hasAnswer ? "#e0e0e0" : "transparent",
                border: `1px solid ${hasAnswer ? "#e0e0e0" : "#555"}`,
                borderRadius: 6,
                color: hasAnswer ? "#111" : "#999",
                fontWeight: hasAnswer ? 600 : 400,
                cursor: "pointer",
                transition: "background 0.15s, color 0.15s, border-color 0.15s",
              }}
            >
              {hasAnswer ? "Next" : "Skip"}
            </motion.button>
          );
        })()}
      </motion.div>
    </div>
  );
}

export function PromptWithTongue({
  checklist,
  questions,
  defaultPrompt = "",
}: {
  checklist: ChecklistState;
  questions?: ElicitationQuestion[];
  defaultPrompt?: string;
}) {
  const [prompt, setPrompt] = useState(defaultPrompt);

  useEffect(() => {
    setPrompt(defaultPrompt);
  }, [defaultPrompt]);
  const [answers, setAnswers] = useState<ElicitationAnswers>({});
  const [customTexts, setCustomTexts] = useState<Record<string, string>>({});
  const [showElicitation, setShowElicitation] = useState(false);
  const hasItems = checklist.items.length > 0;
  const isElicitation = questions && questions.length > 0;

  // Delay the switch from textarea to elicitation to sync with the checklist spinner
  useEffect(() => {
    if (isElicitation) {
      const timer = setTimeout(() => setShowElicitation(true), ELICITATION_ENTRY_DELAY * 1000);
      return () => clearTimeout(timer);
    } else {
      setShowElicitation(false);
    }
  }, [isElicitation]);
  const prevStatusMapRef = useRef<Record<string, ItemStatus>>({});

  const completionStaggerMap: Record<string, number> = {};
  let newlyCompletedCount = 0;
  for (const item of checklist.items) {
    if (item.status === "done" && prevStatusMapRef.current[item.id] !== "done") {
      completionStaggerMap[item.id] = newlyCompletedCount * COMPLETION_STAGGER;
      newlyCompletedCount++;
    }
  }

  useEffect(() => {
    const map: Record<string, ItemStatus> = {};
    for (const item of checklist.items) {
      map[item.id] = item.status;
    }
    prevStatusMapRef.current = map;
  }, [checklist]);

  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", width: "100%" }}>
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 700, damping: 35, mass: 0.6 }}
        style={{
          position: "relative",
          zIndex: 0,
          overflow: "hidden",
          marginInline: 12,
        }}
      >
        {hasItems && (
          <div
            style={{
              background: "#111",
              border: "1px solid #333",
              borderBottom: "none",
              borderRadius: "10px 10px 0 0",
              padding: "14px 16px 20px",
              marginBottom: -6,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#888",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 8,
              }}
            >
              Plan
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, position: "relative" }}>
              <AnimatePresence initial>
                {checklist.items.map((item, i) => (
                  <ChecklistRow
                    key={item.id}
                    item={item}
                    completionStagger={completionStaggerMap[item.id] ?? 0}
                    entryDelay={i * 0.045}
                  />
                ))}
              </AnimatePresence>
            </ul>
          </div>
        )}
      </motion.div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: "#151515",
          border: "1px solid #444",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {showElicitation && isElicitation ? (
          <ElicitationCarousel
            questions={questions}
            answers={answers}
            customTexts={customTexts}
            onAnswersChange={setAnswers}
            onCustomTextChange={(key, value) => setCustomTexts((prev) => ({ ...prev, [key]: value }))}
            onSubmit={() => setShowElicitation(false)}
          />
        ) : (
          <div style={{ position: "relative" }}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type your prompt..."
              rows={4}
              style={{
                width: "100%",
                background: "transparent",
                color: "#e0e0e0",
                border: "none",
                outline: "none",
                resize: "none",
                padding: "14px 16px",
                paddingRight: 52,
                fontSize: 15,
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
            <motion.button
              whileTap={prompt.trim() ? { scale: 0.93, transition: { type: "tween", duration: 0.06 } } : undefined}
              style={{
                position: "absolute",
                right: 12,
                bottom: 12,
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "none",
                background: prompt.trim() ? "#e0e0e0" : "#333",
                color: prompt.trim() ? "#111" : "#666",
                cursor: prompt.trim() ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 13V3M4 7l4-4 4 4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
