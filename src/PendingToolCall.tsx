import { motion } from "motion/react";
import { useUISettings } from "./UISettingsContext";

interface PendingToolCallProps {
  toolName: string;
  command: string;
  onApprove?: () => void;
  onDeny?: () => void;
  onModify?: () => void;
  status?: "pending" | "approved" | "denied";
  hideButtons?: boolean;
}

function WrenchIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M14.5 3.5L12 6l-2-2 2.5-2.5a4 4 0 00-5.19 5.19L2.5 11.5a1.41 1.41 0 002 2l4.81-4.81a4 4 0 005.19-5.19z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PendingToolCall({
  toolName,
  command,
  onApprove,
  onDeny,
  onModify,
  status = "pending",
  hideButtons = false,
}: PendingToolCallProps) {
  const { buttonAlign } = useUISettings();
  const isPending = status === "pending";

  const statusLabel = isPending
    ? "Awaiting approval"
    : status === "approved"
    ? "Approved"
    : "Denied";

  const statusColor = isPending
    ? "#777"
    : status === "approved"
    ? "#5a8a5a"
    : "#8a5a5a";

  return (
    <div
      style={{
        borderRadius: 8,
        border: "1px solid #222",
        background: "#111",
        overflow: "hidden",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          fontSize: 12,
          background: "#0d0d0d",
        }}
      >
        <WrenchIcon />
        <span style={{ color: "#999", fontWeight: 500, flexShrink: 0 }}>
          {toolName}
        </span>
        <span
          style={{
            flex: 1,
            fontFamily: "var(--font-mono)",
            color: "#777",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
          }}
        >
          {command}
        </span>
        <span
          style={{
            fontSize: 11,
            color: statusColor,
            flexShrink: 0,
          }}
        >
          {statusLabel}
        </span>
      </div>

      {/* Buttons */}
      {isPending && !hideButtons && (
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "8px 12px",
            borderTop: "1px solid #1a1a1a",
            justifyContent: buttonAlign === "right" ? "flex-end" : "flex-start",
          }}
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onDeny}
            style={{
              padding: "5px 12px",
              fontSize: 12,
              fontFamily: "inherit",
              background: "transparent",
              border: "1px solid #333",
              borderRadius: 6,
              color: "#999",
              cursor: "pointer",
              transition: "background 0.15s, border-color 0.15s",
            }}
          >
            Deny
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onModify}
            style={{
              padding: "5px 12px",
              fontSize: 12,
              fontFamily: "inherit",
              background: "transparent",
              border: "1px solid #333",
              borderRadius: 6,
              color: "#999",
              cursor: "pointer",
              transition: "background 0.15s, border-color 0.15s",
            }}
          >
            Modify
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onApprove}
            style={{
              padding: "5px 12px",
              fontSize: 12,
              fontFamily: "inherit",
              background: "#2a2a2a",
              border: "1px solid #444",
              borderRadius: 6,
              color: "#e0e0e0",
              cursor: "pointer",
              transition: "background 0.15s, border-color 0.15s",
            }}
          >
            Approve
          </motion.button>
        </div>
      )}
    </div>
  );
}

interface ToolApprovalButtonsProps {
  onApprove?: () => void;
  onDeny?: () => void;
  onModify?: () => void;
}

export function ToolApprovalButtons({ onApprove, onDeny, onModify }: ToolApprovalButtonsProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
      }}
    >
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onDeny}
        style={{
          padding: "5px 12px",
          fontSize: 12,
          fontFamily: "inherit",
          background: "transparent",
          border: "1px solid #333",
          borderRadius: 6,
          color: "#999",
          cursor: "pointer",
          transition: "background 0.15s, border-color 0.15s",
        }}
      >
        Deny
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onModify}
        style={{
          padding: "5px 12px",
          fontSize: 12,
          fontFamily: "inherit",
          background: "transparent",
          border: "1px solid #333",
          borderRadius: 6,
          color: "#999",
          cursor: "pointer",
          transition: "background 0.15s, border-color 0.15s",
        }}
      >
        Modify
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onApprove}
        style={{
          padding: "5px 12px",
          fontSize: 12,
          fontFamily: "inherit",
          background: "#2a2a2a",
          border: "1px solid #444",
          borderRadius: 6,
          color: "#e0e0e0",
          cursor: "pointer",
          transition: "background 0.15s, border-color 0.15s",
        }}
      >
        Approve
      </motion.button>
    </div>
  );
}
