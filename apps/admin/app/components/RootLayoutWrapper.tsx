"use client";

import { ScrollableContainer } from "./ScrollableContainer";

export function RootLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <ScrollableContainer>{children}</ScrollableContainer>;
}

