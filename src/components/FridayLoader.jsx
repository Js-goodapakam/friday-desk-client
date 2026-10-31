import logo from '../assets/friday-f-logo.png';
import RefreshLoader,{isBrowserRefresh} from './RefreshLoader.jsx';
export default function FridayLoader({fullscreen=false}){
 if(fullscreen&&isBrowserRefresh)return <RefreshLoader/>;
 return <div className={fullscreen?'friday-page-loader':'friday-inline-loader'} role="status" aria-live="polite" aria-label="Loading workspace"><div className="oi-branded-loader"><img src={logo} alt="Friday"/><strong>Preparing your overview…</strong><div className="oi-load-progress"><i/></div></div></div>;
}
