export function CollaborationIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Network nodes */}
      <circle cx="12" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="24" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="36" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="18" cy="30" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="30" cy="30" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="24" cy="38" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />

      {/* Network connections */}
      <path
        d="M12 18 L24 12 L36 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      <path
        d="M24 12 L18 30"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M24 12 L30 30"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M18 30 L24 38"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M30 30 L24 38"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Central hub emphasis */}
      <circle cx="24" cy="24" r="1" stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

