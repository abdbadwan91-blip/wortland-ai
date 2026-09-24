/** Painted forest vista — hero art with soft path guide for node readability. */
export function ForestScene() {
  return (
    <div className="scene-bg scene-painted" aria-hidden>
      <img
        className="scene-art scene-art-forest"
        src="/map/forest-bg.png"
        alt=""
        draggable={false}
      />
      <div className="scene-vignette" />
      <svg
        className="scene-path-overlay"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="frPathStroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8d4a8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#c4a574" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <path
          d="M45 14 C 55 20, 68 28, 72 34 S 58 44, 42 50 S 48 56, 58 60 S 70 68, 52 74 S 36 82, 50 90"
          fill="none"
          stroke="url(#frPathStroke)"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.65"
        />
        <path
          d="M45 14 C 55 20, 68 28, 72 34 S 58 44, 42 50 S 48 56, 58 60 S 70 68, 52 74 S 36 82, 50 90"
          fill="none"
          stroke="#f0e4c0"
          strokeWidth="0.85"
          strokeLinecap="round"
          strokeDasharray="2 3.2"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}
