import React, { ReactNode } from "react";
import { ThemeMode } from "./theme";
type ThemeModeContextValue = {
    mode: ThemeMode;
    toggle: () => void;
    setMode: (m: ThemeMode) => void;
};
export default function ThemeModeProvider({ children, }: {
    children: ReactNode;
}): React.JSX.Element;
export declare function useThemeMode(): ThemeModeContextValue;
export {};
//# sourceMappingURL=ThemeModeProvider.d.ts.map