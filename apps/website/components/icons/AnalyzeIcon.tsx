export function AnalyzeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Graph/Network nodes */}
      <circle cx="12" cy="20" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="24" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="36" cy="20" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="24" cy="32" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="36" cy="36" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />

      {/* Connection lines */}
      <path
        d="M12 20 L24 12 L36 20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      <path
        d="M24 12 L24 32"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M36 20 L36 36"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M24 32 L36 36"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Graph line overlay */}
      <path
        d="M8 28 Q16 24 24 26 T40 28"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
    </svg>
  );
}



