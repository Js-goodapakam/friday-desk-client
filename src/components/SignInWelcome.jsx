import engageLogo from "../assets/engage-logo.png";
export default function SignInWelcome({name,onComplete}){
 return <div className="friday-welcome" role="status" aria-live="polite"><div className="friday-welcome-halo" aria-hidden="true"/><img src={engageLogo} alt="" /><span className="friday-welcome-brand">ENGAGE AI – DESK</span><h1>Welcome back{name?`, ${name.split(' ')[0]}`:''}.</h1><p>Your hospitality workspace awaits.</p><button type="button" onClick={onComplete}>Continue to workspace <span aria-hidden="true">→</span></button></div>;
}
