/** Painted mountain vista — hero art with soft path guide for node readability. */
export function MountainScene() {
  return (
    <div className="scene-bg scene-painted" aria-hidden>
      <img
        className="scene-art scene-art-mountain"
        src="/map/mountain-bg.png"
        alt=""
        draggable={false}
      />
      <div className="scene-vignette" />
      {/* Light path guide so stage nodes read on the painted trail */}
      <svg
        className="scene-path-overlay"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="mtPathStroke" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#f5e6c8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffe9a8" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <path
          d="M18 92 C 28 86, 40 80, 48 76 S 60 70, 58 68 S 48 60, 42 54 S 36 48, 48 42 S 68 34, 66 28 S 60 18, 74 12"
          fill="none"
          stroke="url(#mtPathStroke)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />
        <path
          d="M18 92 C 28 86, 40 80, 48 76 S 60 70, 58 68 S 48 60, 42 54 S 36 48, 48 42 S 68 34, 66 28 S 60 18, 74 12"
          fill="none"
          stroke="#fff8e0"
          strokeWidth="0.9"
          strokeLinecap="round"
          strokeDasharray="2.2 3.5"
          opacity="0.45"
        />
      </svg>
    </div>
  );
}
