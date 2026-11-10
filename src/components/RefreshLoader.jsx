import logo from '../assets/engage-ai-mark.svg';
export default function RefreshLoader(){
 return <div className="friday-refresh-screen" role="status" aria-live="polite"><div className="friday-refresh-mark" aria-hidden="true"><img className="friday-refresh-intact" src={logo} alt=""/></div><p>Getting things ready…</p></div>;
}
