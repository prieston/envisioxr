export function AmbientField() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <svg
        className="absolute left-[58%] top-[56%] h-[220%] w-[220%] -translate-x-1/2 -translate-y-1/2 opacity-[0.38] mix-blend-screen animate-ambient"
        viewBox="0 0 1200 1200"
        fill="none"
      >
        <defs>
          <radialGradient
            id="ambient-halo"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(600 520) scale(520)"
          >
            <stop stopColor="#4C7FFF" stopOpacity="0.44" />
            <stop offset="1" stopColor="#4C7FFF" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ambient-lines" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4C7FFF" stopOpacity="0.18" />
            <stop offset="1" stopColor="#4C7FFF" stopOpacity="0" />
          </linearGradient>
          <filter
            id="ambient-blur"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="40" />
          </filter>
        </defs>
        <rect width="1200" height="1200" fill="url(#ambient-halo)" />
        <circle
          cx="600"
          cy="520"
          r="280"
          fill="#1b4576"
          fillOpacity="0.36"
        />
        <circle
          cx="630"
          cy="480"
          r="230"
          fill="#102341"
          fillOpacity="0.46"
        />
        <g filter="url(#ambient-blur)" opacity="0.35">
          <path
            d="M160 720C320 520 520 460 760 520C960 572 1120 500 1120 500"
            stroke="url(#ambient-lines)"
            strokeWidth="2.2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M80 540C220 360 420 320 660 380C860 432 1000 396 1120 320"
            stroke="url(#ambient-lines)"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M160 940C360 820 540 780 760 820C950 854 1060 800 1140 720"
            stroke="url(#ambient-lines)"
            strokeWidth="1.8"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </g>
        <g stroke="#4C7FFF" strokeOpacity="0.34" strokeWidth="0.65">
          {Array.from({ length: 12 }).map((_, index) => (
            <circle
              key={index}
              cx="600"
              cy="520"
              r={180 + index * 60}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
        <g fill="#4C7FFF" fillOpacity="0.32">
          {[{ x: 340, y: 630 }, { x: 540, y: 420 }, { x: 780, y: 680 }, { x: 980, y: 460 }, { x: 860, y: 860 }, { x: 420, y: 820 }].map(
            (point, index) => (
              <circle key={index} cx={point.x} cy={point.y} r={6} />
            )
          )}
        </g>
      </svg>
    </div>
  );
}

