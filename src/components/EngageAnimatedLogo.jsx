/* The three paths are identical to the official Engage EH monogram in public/engage-app-icon.svg. */
export default function EngageAnimatedLogo() {
  return (
    <svg className="engage-motion-svg" viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Engage brand logo">
      <defs>
        <linearGradient id="engage-motion-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#040D2E" />
          <stop offset="34%" stopColor="#061A58" />
          <stop offset="73%" stopColor="#135FDB" />
          <stop offset="100%" stopColor="#3BBFEE" />
        </linearGradient>
        <radialGradient id="engage-motion-highlight" cx="90%" cy="8%" r="88%">
          <stop offset="0%" stopColor="#3BBFEE" stopOpacity=".34" />
          <stop offset="66%" stopColor="#3BBFEE" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="44" y="44" width="936" height="936" rx="240" fill="url(#engage-motion-gradient)"/>
      <rect x="44" y="44" width="936" height="936" rx="240" fill="url(#engage-motion-highlight)"/>
      <g fill="#F4F1DE" transform="translate(-115 -105)">
        <path className="engage-mark-shape engage-mark-top" d="M671,323 385,464 385,565 670,423 Z"/>
        <path className="engage-mark-shape engage-mark-middle" d="M869,461 788,409 788,537 786,603 637,516 634,516 385,642 385,741 635,615 787,700 787,867 869,918 Z"/>
        <path className="engage-mark-shape engage-mark-bottom" d="M646,691 386,819 386,921 645,791 Z"/>
      </g>
    </svg>
  );
}
