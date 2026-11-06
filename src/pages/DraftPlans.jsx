import {useState} from 'react';
import './enterprise-access.css';

const defaults=[
 {name:'Basic',description:'Daily operations for one hotel.',properties:1,rooms:50,staff:10,connect:false,features:'Reservations, front desk, guest profiles, housekeeping, billing and standard reports'},
 {name:'Premium',description:'Connected teams and growing hotel groups.',properties:5,rooms:500,staff:50,connect:true,features:'Basic features, multi-property analytics, revenue workflows, advanced reports and Connect'},
 {name:'Enterprise',description:'Flexible controls for larger hotel groups.',properties:20,rooms:2000,staff:200,connect:true,features:'Premium features, custom roles, organisation controls and integration management'},
];
export default function DraftPlans(){
 const [plans,setPlans]=useState(()=>{try{const saved=JSON.parse(sessionStorage.getItem('engagestay-plan-review'));return Array.isArray(saved)&&saved.length===3?saved:defaults;}catch{return defaults;}});
 const [notice,setNotice]=useState('');
 function update(index,key,value){setPlans(plans.map((plan,i)=>i===index?{...plan,[key]:value}:plan));setNotice('');}
 function save(){try{sessionStorage.setItem('engagestay-plan-review',JSON.stringify(plans));setNotice('Draft saved in this browser session.');}catch{setNotice('Unable to save the draft in this browser.');}}
 return <section className="ea-catalogue"><header className="ea-heading"><div><h2>Plan design</h2><p>Review the proposed packages and adjust the allowances.</p></div><span className="ea-review">Draft for review</span></header>
 <div className="ea-plan-grid">{plans.map((plan,index)=><article className="ea-plan" key={plan.name}><h3>{plan.name}</h3><p>{plan.description}</p><p>{plan.features}</p><div className="ea-plan-fields">{[['properties','Hotel branches'],['rooms','Rooms'],['staff','Staff accounts']].map(([key,label])=><label key={key}>{label}<input type="number" min="1" max="100000" step="1" value={plan[key]} onChange={e=>update(index,key,e.target.value===''?'':Math.max(1,Math.min(100000,Math.trunc(Number(e.target.value)))))} /></label>)}</div><p><strong>Connect:</strong> {plan.connect?'Included':'Not included'}</p></article>)}</div>
 <p className="ea-note">Proposed allowances only. Saving this draft does not activate a subscription or change staff permissions.</p><div className="ea-tabs"><button className="pw-primary" onClick={save} disabled={plans.some(p=>['properties','rooms','staff'].some(k=>!Number.isInteger(Number(p[k]))||Number(p[k])<1))}>Save review draft</button><button onClick={()=>{setPlans(defaults);setNotice('Draft reset. Save to keep these changes.');}}>Reset draft</button></div>{notice&&<p role="status" className="ea-note">{notice}</p>}
 </section>;
}
