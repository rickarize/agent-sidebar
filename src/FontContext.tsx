import { createContext, useContext, useState, type ReactNode } from "react";

export type FontPreset = "system" | "geist" | "geist-native";

interface FontConfig {
  sans: string;
  mono: string;
  lineHeightScale: number;
}

const presets: Record<FontPreset, FontConfig> = {
  system: {
    sans: "system-ui, -apple-system, sans-serif",
    mono: "'SF Mono', 'Fira Code', ui-monospace, monospace",
    lineHeightScale: 1,
  },
  geist: {
    sans: "'Geist', system-ui, sans-serif",
    mono: "'Geist Mono', ui-monospace, monospace",
    lineHeightScale: 1,
  },
  "geist-native": {
    sans: "'Geist Native', system-ui, sans-serif",
    mono: "'Geist Mono Native', ui-monospace, monospace",
    lineHeightScale: 0.92,
  },
};

interface FontContextValue {
  preset: FontPreset;
  setPreset: (p: FontPreset) => void;
  fonts: FontConfig;
}

const FontContext = createContext<FontContextValue>({
  preset: "system",
  setPreset: () => {},
  fonts: presets.system,
});

export function FontProvider({ children }: { children: ReactNode }) {
  const [preset, setPreset] = useState<FontPreset>("system");

  return (
    <FontContext.Provider value={{ preset, setPreset, fonts: presets[preset] }}>
      <div
        style={{
          fontFamily: presets[preset].sans,
          lineHeight: presets[preset].lineHeightScale !== 1 ? 1.25 : undefined,
          // @ts-expect-error CSS custom properties
          "--font-mono": presets[preset].mono,
          height: "100%",
        }}
      >
        {children}
      </div>
    </FontContext.Provider>
  );
}

export function useFonts() {
  return useContext(FontContext);
}
