import EngageAnimatedLogo from './EngageAnimatedLogo.jsx';

export default function RefreshLoader() {
  return (
    <div className="friday-refresh-screen engage-motion-screen"
      role="status" aria-live="polite" aria-label="Loading Engage Stay workspace">
      <div className="engage-motion-aura" aria-hidden="true" />
      <div className="engage-motion-mark"><EngageAnimatedLogo /></div>
      <div className="engage-motion-copy">
        <span className="engage-motion-product">ENGAGE STAY</span>
        <p>Preparing your workspace…</p>
      </div>
      <div className="engage-motion-progress" aria-hidden="true"><span /></div>
    </div>
  );
}
