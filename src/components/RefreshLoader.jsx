import logo from '../assets/friday-f-logo.png';
export let isBrowserRefresh=performance.getEntriesByType('navigation')[0]?.type==='reload';
export function finishBrowserRefresh(){isBrowserRefresh=false;}
export default function RefreshLoader(){
 return <div className="friday-refresh-screen" role="status" aria-live="polite"><div className="friday-refresh-mark" aria-hidden="true"><img className="friday-refresh-intact" src={logo} alt=""/></div><p>Getting things ready…</p></div>;
}
