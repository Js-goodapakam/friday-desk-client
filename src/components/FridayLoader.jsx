import RefreshLoader from './RefreshLoader.jsx';
import EngageAnimatedLogo from './EngageAnimatedLogo.jsx';

export default function FridayLoader({fullscreen=false}) {
  if (fullscreen) return <RefreshLoader />;
  return (
    <div className="friday-inline-loader engage-motion-inline"
      role="status" aria-live="polite" aria-label="Loading Engage Stay workspace">
      <div className="oi-branded-loader">
        <div className="engage-inline-mark"><EngageAnimatedLogo /></div>
        <strong>Preparing your Engage Stay workspace…</strong>
        <div className="oi-load-progress" aria-hidden="true"><i /></div>
      </div>
    </div>
  );
}
