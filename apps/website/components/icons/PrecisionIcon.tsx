export function PrecisionIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Crosshairs/Target */}
      <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="24" cy="24" r="1.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" />

      {/* Crosshair lines */}
      <path
        d="M24 8 L24 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M24 32 L24 40"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8 24 L16 24"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M32 24 L40 24"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Alignment indicators */}
      <path
        d="M12 12 L16 16"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M36 36 L32 32"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

