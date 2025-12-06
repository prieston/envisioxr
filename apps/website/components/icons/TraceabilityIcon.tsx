export function TraceabilityIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Timeline nodes */}
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="24" cy="20" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="36" cy="28" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="24" cy="36" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />

      {/* Timeline path */}
      <path
        d="M12 12 L24 20 L36 28"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      <path
        d="M36 28 L24 36"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Chain links / Audit trail */}
      <path
        d="M8 24 Q12 20 16 24 T24 24 T32 24 T40 24"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />

      {/* Arrow indicating direction */}
      <path
        d="M38 26 L36 28 L38 30"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}

