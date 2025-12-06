export function OperationalCoordinationIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Control room / Command center */}
      <rect x="8" y="8" width="16" height="12" stroke="currentColor" strokeWidth="1.5" fill="none" rx="1" />
      <rect x="24" y="8" width="16" height="12" stroke="currentColor" strokeWidth="1.5" fill="none" rx="1" />
      <rect x="8" y="28" width="16" height="12" stroke="currentColor" strokeWidth="1.5" fill="none" rx="1" />
      <rect x="24" y="28" width="16" height="12" stroke="currentColor" strokeWidth="1.5" fill="none" rx="1" />

      {/* Connection lines between nodes */}
      <path
        d="M24 14 L24 28"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M16 20 L24 20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M32 20 L24 20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M16 34 L24 34"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M32 34 L24 34"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Central hub */}
      <circle cx="24" cy="24" r="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.4" />

      {/* Field device indicators */}
      <circle cx="12" cy="12" r="1.5" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
      <circle cx="36" cy="12" r="1.5" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
      <circle cx="12" cy="36" r="1.5" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
      <circle cx="36" cy="36" r="1.5" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5" />
    </svg>
  );
}

