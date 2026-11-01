import {useEffect} from 'react';
import logo from '../assets/friday-f-logo.png';
export default function SignInWelcome({name,onComplete}){
 useEffect(()=>{const timer=setTimeout(onComplete,1800);return()=>clearTimeout(timer);},[onComplete]);
 return <div className="friday-welcome" role="status" aria-live="polite"><div className="friday-welcome-halo" aria-hidden="true"/><img src={logo} alt="Friday"/><span className="friday-welcome-brand">FRIDAY AI – DESK</span><h1>Welcome back{name?`, ${name.split(' ')[0]}`:''}.</h1><p>Your hospitality workspace awaits.</p><button type="button" onClick={onComplete}>Continue to workspace <span aria-hidden="true">→</span></button></div>;
}
