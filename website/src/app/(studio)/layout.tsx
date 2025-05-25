"use client";

function StudioLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <div suppressHydrationWarning>{children}</div>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudioLayoutWrapper>{children}</StudioLayoutWrapper>;
}
