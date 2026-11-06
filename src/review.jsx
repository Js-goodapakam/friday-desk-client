import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import DraftPlans from './pages/DraftPlans.jsx';
import PermissionCatalogue from './pages/PermissionCatalogue.jsx';
import catalogue from './pages/permission-review.json';
import './index.css';
export function Review(){
 const [tab,setTab]=useState('plans');
 return <main style={{maxWidth:1400,margin:'0 auto',padding:'clamp(16px,3vw,40px)',fontFamily:'Inter, Arial, sans-serif','--fr-ink':'#193253','--fr-muted':'#667c98','--fr-border':'#dbe5f3','--fr-primary':'#155ce0','--fr-soft':'#edf4ff'}}><h1 style={{fontSize:26,color:'#193253'}}>EngageStay design review</h1><p style={{color:'#667c98',fontSize:13}}>Preview only · No customer records or live access changes</p><nav className="ea-tabs" aria-label="Review sections"><button aria-pressed={tab==='plans'} onClick={()=>setTab('plans')}>Subscription plans</button><button aria-pressed={tab==='permissions'} onClick={()=>setTab('permissions')}>Permission catalogue</button></nav><div style={{marginTop:20}}>{tab==='plans'?<DraftPlans/>:<PermissionCatalogue initialData={catalogue}/>}</div></main>;
}
createRoot(document.getElementById('root')).render(<Review/>);
