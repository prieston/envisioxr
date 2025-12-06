type GeometricHintVariant =
  | "horizontal-line"
  | "diagonal-line"
  | "radial-vignette"
  | "horizontal-curved"
  | "vignette-accent"
  | "minimal-line"
  | "light-vignette";

interface GeometricHintProps {
  variant: GeometricHintVariant;
  className?: string;
}

export function GeometricHint({ variant, className = "" }: GeometricHintProps) {
  const baseColors = {
    primary: "#4C7FFF",
    secondary: "#1b4576",
    tertiary: "#102341",
  };

  const renderHint = () => {
    switch (variant) {
      case "horizontal-line":
        // Thin horizontal gradient line at bottom
        return (
          <div className="absolute bottom-0 left-0 right-0 h-px">
            <div className="h-full w-full bg-gradient-to-r from-transparent via-[#4C7FFF]/[0.06] to-transparent" />
          </div>
        );

      case "diagonal-line":
        // Thin diagonal gradient line
        return (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute bottom-0 left-0 h-px w-[60%] origin-bottom-left rotate-[-2deg] bg-gradient-to-r from-transparent via-[#4C7FFF]/[0.05] to-transparent" />
          </div>
        );

      case "radial-vignette":
        // Light radial vignette
        return (
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 opacity-[0.04]"
              style={{
                background: `radial-gradient(circle, ${baseColors.primary} 0%, transparent 70%)`,
              }}
            />
          </div>
        );

      case "horizontal-curved":
        // Thin horizontal gradient with slight curve
        return (
          <div className="absolute bottom-0 left-0 right-0 h-px overflow-hidden">
            <svg
              className="absolute bottom-0 left-0 right-0 h-full w-full"
              viewBox="0 0 1200 1"
              preserveAspectRatio="none"
            >
              <path
                d="M0,1 Q300,0.3 600,0.5 T1200,1"
                stroke={`url(#curved-gradient-${variant})`}
                strokeWidth="1"
                fill="none"
              />
              <defs>
                <linearGradient id={`curved-gradient-${variant}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={baseColors.primary} stopOpacity="0" />
                  <stop offset="50%" stopColor={baseColors.primary} stopOpacity="0.06" />
                  <stop offset="100%" stopColor={baseColors.primary} stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        );

      case "vignette-accent":
        // Light vignette with horizontal accent
        return (
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute left-1/2 top-1/2 h-[100%] w-[100%] -translate-x-1/2 -translate-y-1/2 opacity-[0.03]"
              style={{
                background: `radial-gradient(circle, ${baseColors.primary} 0%, transparent 65%)`,
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-px">
              <div className="h-full w-full bg-gradient-to-r from-transparent via-[#4C7FFF]/[0.04] to-transparent" />
            </div>
          </div>
        );

      case "minimal-line":
        // Minimal horizontal gradient line
        return (
          <div className="absolute bottom-0 left-0 right-0 h-px">
            <div className="h-full w-full bg-gradient-to-r from-transparent via-[#4C7FFF]/[0.04] to-transparent" />
          </div>
        );

      case "light-vignette":
        // Light vignette
        return (
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute left-1/2 top-1/2 h-[110%] w-[110%] -translate-x-1/2 -translate-y-1/2 opacity-[0.035]"
              style={{
                background: `radial-gradient(circle, ${baseColors.secondary} 0%, transparent 60%)`,
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
    >
      {renderHint()}
    </div>
  );
}

