export function OperateIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Network/Map control nodes */}
      <rect x="10" y="10" width="12" height="12" stroke="currentColor" strokeWidth="1.5" fill="none" rx="1" />
      <rect x="26" y="10" width="12" height="12" stroke="currentColor" strokeWidth="1.5" fill="none" rx="1" />
      <rect x="10" y="26" width="12" height="12" stroke="currentColor" strokeWidth="1.5" fill="none" rx="1" />
      <rect x="26" y="26" width="12" height="12" stroke="currentColor" strokeWidth="1.5" fill="none" rx="1" />

      {/* Connection lines between nodes */}
      <path
        d="M22 16 L26 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M16 22 L16 26"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M38 16 L38 26"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M22 32 L26 32"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Command lines */}
      <path
        d="M6 6 L10 10"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M42 6 L38 10"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M6 42 L10 38"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M42 42 L38 38"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}

