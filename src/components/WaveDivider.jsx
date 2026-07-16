// Separateur de section en vague - SVG inline, zero JS runtime, zero dependance.
// flip=true retourne la vague (utile entre deux sections consecutives).
export function WaveDivider({ color = "#F7F7F5", flip = false, className = "" }) {
  return (
    <div
      className={`w-full overflow-hidden leading-none ${flip ? "rotate-180" : ""} ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        className="w-full h-16 md:h-24"
      >
        <path
          d="M0,40 C240,90 480,0 720,30 C960,60 1200,10 1440,50 L1440,100 L0,100 Z"
          fill={color}
        />
      </svg>
    </div>
  );
}
