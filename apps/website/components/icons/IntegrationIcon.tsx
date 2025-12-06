export function IntegrationIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Connected nodes */}
      <circle cx="16" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="32" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="24" cy="24" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="16" cy="32" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="32" cy="32" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />

      {/* Connection lines */}
      <path
        d="M16 16 L24 24"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M32 16 L24 24"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M24 24 L16 32"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M24 24 L32 32"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Merge symbol */}
      <path
        d="M8 24 Q16 20 24 24 T40 24"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
    </svg>
  );
}

