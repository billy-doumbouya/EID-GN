// src/components/GearPattern.jsx
export function GearPattern({ className = "" }) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="gearPattern" width="80" height="80" patternUnits="userSpaceOnUse">
          <circle cx="40" cy="40" r="3" fill="currentColor" opacity="0.15" />
          <circle cx="0" cy="0" r="3" fill="currentColor" opacity="0.15" />
          <circle cx="80" cy="0" r="3" fill="currentColor" opacity="0.15" />
          <circle cx="0" cy="80" r="3" fill="currentColor" opacity="0.15" />
          <circle cx="80" cy="80" r="3" fill="currentColor" opacity="0.15" />
          <path
            d="M40 20 L44 30 L54 30 L46 36 L49 46 L40 40 L31 46 L34 36 L26 30 L36 30 Z"
            fill="currentColor"
            opacity="0.08"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#gearPattern)" />
    </svg>
  );
}