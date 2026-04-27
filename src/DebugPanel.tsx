import { motion } from "motion/react";
import { useFonts, type FontPreset } from "./FontContext";
import { useUISettings, type ButtonAlign } from "./UISettingsContext";

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

const fontOptions: { value: FontPreset; label: string }[] = [
  { value: "system", label: "System" },
  { value: "geist", label: "Geist (metrics)" },
  { value: "geist-native", label: "Geist (lh)" },
];

const buttonAlignOptions: { value: ButtonAlign; label: string }[] = [
  { value: "right", label: "Right" },
  { value: "left", label: "Left" },
];

function SettingsToggle({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      style={{
        marginTop: 12,
        padding: 10,
        border: "1px solid #222",
        borderRadius: 8,
        background: "#0d0d0d",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: "#555",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              padding: "5px 8px",
              fontSize: 11,
              fontFamily: "inherit",
              background: value === opt.value ? "#2a2a2a" : "transparent",
              border: `1px solid ${value === opt.value ? "#444" : "#222"}`,
              borderRadius: 6,
              color: value === opt.value ? "#e0e0e0" : "#666",
              cursor: "pointer",
              transition: "all 0.12s",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function FontToggle() {
  const { preset, setPreset } = useFonts();
  return (
    <SettingsToggle
      label="Font"
      options={fontOptions}
      value={preset}
      onChange={(v) => setPreset(v as FontPreset)}
    />
  );
}

function ButtonAlignToggle() {
  const { buttonAlign, setButtonAlign } = useUISettings();
  return (
    <SettingsToggle
      label="Approve btn align"
      options={buttonAlignOptions}
      value={buttonAlign}
      onChange={(v) => setButtonAlign(v as ButtonAlign)}
    />
  );
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

      {/* Settings toggles */}
      <FontToggle />
      <ButtonAlignToggle />

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
