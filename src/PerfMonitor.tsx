import { useEffect, useRef, useState } from "react";

interface PerfStats {
  fps: number;
  domNodes: number;
  longTasks: number;
  resizeObserverFires: number;
}

// Global counter that useStickToBottom (or anything else) can bump
let _roFires = 0;
export function bumpResizeObserverFires() {
  _roFires++;
}

// Map a value to 0–1 where 0 = healthy, 1 = bad
function normalize(value: number, good: number, bad: number): number {
  if (good < bad) {
    // higher is worse (DOM nodes, long tasks, RO fires)
    return Math.max(0, Math.min(1, (value - good) / (bad - good)));
  }
  // lower is worse (FPS)
  return Math.max(0, Math.min(1, (good - value) / (good - bad)));
}

// 0 = grey, 0.5 = yellow, 1 = red
function heatColor(t: number): string {
  if (t <= 0) return "#444";
  if (t <= 0.5) {
    // grey → yellow
    const p = t / 0.5;
    const r = Math.round(0x44 + (0xcc - 0x44) * p);
    const g = Math.round(0x44 + (0xaa - 0x44) * p);
    const b = Math.round(0x44 + (0x22 - 0x44) * p);
    return `rgb(${r},${g},${b})`;
  }
  // yellow → red
  const p = (t - 0.5) / 0.5;
  const r = Math.round(0xcc + (0xe5 - 0xcc) * p);
  const g = Math.round(0xaa + (0x33 - 0xaa) * p);
  const b = Math.round(0x22 + (0x33 - 0x22) * p);
  return `rgb(${r},${g},${b})`;
}

const BAR_CHARS = "▏▎▍▌▋▊▉█";
const MAX_BARS = 12;

function bar(t: number): { text: string; color: string } {
  const filled = Math.max(1, Math.round(t * MAX_BARS));
  const color = heatColor(t);
  // Use full blocks for filled, nothing for empty
  let text = "";
  for (let i = 0; i < filled; i++) {
    text += BAR_CHARS[7]; // full block
  }
  return { text, color };
}

export function PerfMonitor() {
  const [stats, setStats] = useState<PerfStats>({
    fps: 0,
    domNodes: 0,
    longTasks: 0,
    resizeObserverFires: 0,
  });

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const longTaskCount = useRef(0);
  const lastROFires = useRef(0);

  useEffect(() => {
    let rafId = 0;
    const tick = () => {
      frameCount.current++;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    let longTaskObserver: PerformanceObserver | null = null;
    try {
      longTaskObserver = new PerformanceObserver((list) => {
        longTaskCount.current += list.getEntries().length;
      });
      longTaskObserver.observe({ type: "longtask", buffered: false });
    } catch {
      // not supported
    }

    const sample = () => {
      const now = performance.now();
      const elapsed = (now - lastTime.current) / 1000;
      const fps = elapsed > 0.5 ? Math.round(frameCount.current / elapsed) : 60;

      frameCount.current = 0;
      lastTime.current = now;

      const roFiresDelta = _roFires - lastROFires.current;
      lastROFires.current = _roFires;

      setStats({
        fps,
        domNodes: document.querySelectorAll("*").length,
        longTasks: longTaskCount.current,
        resizeObserverFires: roFiresDelta,
      });
    };

    // First sample after 1s, then every 2s
    const initialTimeout = setTimeout(sample, 1000);
    const interval = setInterval(sample, 2000);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(initialTimeout);
      clearInterval(interval);
      longTaskObserver?.disconnect();
    };
  }, []);

  const row = (label: string, value: string | number, t: number) => {
    const b = bar(t);
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "2px 0",
          fontSize: 11,
          fontFamily: "'SF Mono', 'Fira Code', ui-monospace, monospace",
        }}
      >
        <span style={{ color: "#e0e0e0", minWidth: 42, textAlign: "right" }}>{value}</span>
        <span
          style={{
            flex: 1,
            color: b.color,
            fontSize: 10,
            lineHeight: 1,
            letterSpacing: "-0.5px",
            overflow: "hidden",
          }}
        >
          {b.text}
        </span>
        <span style={{ color: "#666", textAlign: "right" }}>{label}</span>
      </div>
    );
  };

  // Ranges: good → bad
  const fpsT = normalize(stats.fps, 40, 5);
  const domT = normalize(stats.domNodes, 500, 3000);
  const ltT = normalize(stats.longTasks, 0, 10);
  const roT = normalize(stats.resizeObserverFires, 5, 50);

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
          marginBottom: 6,
        }}
      >
        Perf (2s window)
      </div>
      {row("FPS", stats.fps, fpsT)}
      {row("DOM", stats.domNodes, domT)}
      {row("Long", stats.longTasks, ltT)}
      {row("RO", `${stats.resizeObserverFires}/2s`, roT)}
    </div>
  );
}
