import { createContext, useContext, useState, type ReactNode } from "react";

export type ButtonAlign = "left" | "right";
export type NextStepsStyle = "minimal" | "bundled" | "unbundled";
export type ChartColorScheme = "mono" | "phoenix" | "generic";

export const chartColorPalettes: Record<ChartColorScheme, {
  primary: string[];
  highlight: string;
  base: string;
}> = {
  mono: {
    primary: ["#ffffff", "#e0e0e0", "#c0c0c0", "#a0a0a0", "#808080"],
    highlight: "#ffffff",
    base: "#808080",
  },
  phoenix: {
    primary: ["#5899da", "#e8743b", "#19a979", "#ed4a7b", "#945ecf"],
    highlight: "#ed4a7b",
    base: "#5899da",
  },
  generic: {
    primary: ["#c45c5c", "#c4955c", "#5c8ac4", "#7c5cc4", "#5cc4a8"],
    highlight: "#c45c5c",
    base: "#5c8ac4",
  },
};

interface UISettingsContextValue {
  buttonAlign: ButtonAlign;
  setButtonAlign: (align: ButtonAlign) => void;
  nextStepsStyle: NextStepsStyle;
  setNextStepsStyle: (style: NextStepsStyle) => void;
  chartColors: ChartColorScheme;
  setChartColors: (scheme: ChartColorScheme) => void;
}

const UISettingsContext = createContext<UISettingsContextValue>({
  buttonAlign: "right",
  setButtonAlign: () => {},
  nextStepsStyle: "minimal",
  setNextStepsStyle: () => {},
  chartColors: "mono",
  setChartColors: () => {},
});

export function UISettingsProvider({ children }: { children: ReactNode }) {
  const [buttonAlign, setButtonAlign] = useState<ButtonAlign>("right");
  const [nextStepsStyle, setNextStepsStyle] = useState<NextStepsStyle>("minimal");
  const [chartColors, setChartColors] = useState<ChartColorScheme>("mono");

  return (
    <UISettingsContext.Provider value={{ buttonAlign, setButtonAlign, nextStepsStyle, setNextStepsStyle, chartColors, setChartColors }}>
      {children}
    </UISettingsContext.Provider>
  );
}

export function useUISettings() {
  return useContext(UISettingsContext);
}
