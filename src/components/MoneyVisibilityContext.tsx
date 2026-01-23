import { createContext, useContext, useState, type ReactNode } from "react";

type MoneyVisibilityCtx = {
  show: boolean;
  toggle: () => void;
};

const MoneyVisibility = createContext<MoneyVisibilityCtx | null>(null);

export function MoneyVisibilityProvider({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(true);
  const toggle = () => setShow((s) => !s);

  return (
    <MoneyVisibility.Provider value={{ show, toggle }}>
      {children}
    </MoneyVisibility.Provider>
  );
}

export function useMoneyVisibility() {
  const ctx = useContext(MoneyVisibility);
  if (!ctx) throw new Error("useMoneyVisibility must be used inside Provider");
  return ctx;
}
