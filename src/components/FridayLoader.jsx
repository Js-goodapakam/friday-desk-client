import logo from '../assets/engage-logo.png';
import RefreshLoader from './RefreshLoader.jsx';
import {isBrowserRefresh} from '../core/refreshState.js';
export default function FridayLoader({fullscreen=false}){
 if(fullscreen&&isBrowserRefresh)return <RefreshLoader/>;
 return <div className={fullscreen?'friday-page-loader':'friday-inline-loader'} role="status" aria-live="polite" aria-label="Loading workspace"><div className="oi-branded-loader"><img src={logo} alt="Engage AI"/><strong>Preparing your overview…</strong><div className="oi-load-progress"><i/></div></div></div>;
}
