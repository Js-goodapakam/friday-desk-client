import RefreshLoader from './RefreshLoader.jsx';
import {isBrowserRefresh} from '../core/refreshState.js';

const logo = '/engage-app-icon.svg';

export default function FridayLoader({fullscreen=false}) {
  if (fullscreen && isBrowserRefresh) return <RefreshLoader />;
  return (
    <div className={fullscreen ? 'friday-page-loader' : 'friday-inline-loader'}
      role="status" aria-live="polite" aria-label="Loading Engage Stay workspace">
      <div className="oi-branded-loader">
        <img src={logo} alt="" aria-hidden="true" />
        <strong>Preparing your Engage Stay workspace…</strong>
        <div className="oi-load-progress" aria-hidden="true"><i /></div>
      </div>
    </div>
  );
}
