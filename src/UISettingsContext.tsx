import { createContext, useContext, useState, type ReactNode } from "react";

export type ButtonAlign = "left" | "right";

interface UISettingsContextValue {
  buttonAlign: ButtonAlign;
  setButtonAlign: (align: ButtonAlign) => void;
}

const UISettingsContext = createContext<UISettingsContextValue>({
  buttonAlign: "right",
  setButtonAlign: () => {},
});

export function UISettingsProvider({ children }: { children: ReactNode }) {
  const [buttonAlign, setButtonAlign] = useState<ButtonAlign>("right");

  return (
    <UISettingsContext.Provider value={{ buttonAlign, setButtonAlign }}>
      {children}
    </UISettingsContext.Provider>
  );
}

export function useUISettings() {
  return useContext(UISettingsContext);
}
