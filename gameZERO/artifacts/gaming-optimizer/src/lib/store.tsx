import { createContext, useContext, useState, ReactNode } from "react";

export type RiskLevel = "Low" | "Medium" | "High";

export interface GameProfile {
  id: string;
  name: string;
  preset: string;
  fpsTarget: number;
  size: number;
  path?: string;
}

interface AppState {
  theme: "dark" | "light";
  compactMode: boolean;
  profiles: GameProfile[];
  setTheme: (theme: "dark" | "light") => void;
  setCompactMode: (compact: boolean) => void;
  setProfiles: (profiles: GameProfile[]) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [compactMode, setCompactMode] = useState(false);
  const [profiles, setProfiles] = useState<GameProfile[]>([]);

  return (
    <AppContext.Provider
      value={{
        theme,
        compactMode,
        profiles,
        setTheme,
        setCompactMode,
        setProfiles,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppStore must be used within an AppProvider");
  }
  return context;
}
