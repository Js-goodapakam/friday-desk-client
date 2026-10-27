import { useState } from "react";
const STAFF_ROLES=["Admin","Manager","Front Desk"];
import { Field } from "../Common.jsx";

export default function UserEditor({initial,onClose,onSave}){
 const [f,setF]=useState(initial||{name:"",email:"",role:"Front Desk",extension:""});
 const [error,setError]=useState("");
 const u=(k,v)=>setF(x=>({...x,[k]:v}));
 const submit=()=>{
  if(!f.name.trim()||!f.email.trim()){setError("Enter a name and email.");return}
  onSave({...f,name:f.name.trim(),email:f.email.trim()});
 };
 return <div className="modal-backdrop" onClick={onClose}><section className="modal card" style={{width:"min(480px, 92vw)"}} onClick={e=>e.stopPropagation()}>
  <div className="modal-head"><div><div className="eyebrow">{initial?"EDIT STAFF":"NEW STAFF"}</div><h2>{initial?"Edit staff member":"Add staff member"}</h2></div><button type="button" className="icon-button" onClick={onClose}>×</button></div>
  <div className="form-grid">
   <Field label="Full name *"><input value={f.name} onChange={e=>u("name",e.target.value)}/></Field>
   <Field label="Email *"><input type="email" value={f.email} onChange={e=>u("email",e.target.value)}/></Field>
   <Field label="Role"><select value={f.role} onChange={e=>u("role",e.target.value)}>{STAFF_ROLES.map(r=><option key={r}>{r}</option>)}</select></Field>
   <Field label="Telephony extension"><input value={f.extension} onChange={e=>u("extension",e.target.value)} placeholder="Optional"/></Field>
  </div>
  {error&&<div className="security-note"><b>Check the details</b><span>{error}</span></div>}
  <div className="modal-actions"><button type="button" className="subtle" onClick={onClose}>Cancel</button><button type="button" className="primary" onClick={submit}>{initial?"Save changes":"Add Staff"}</button></div>
 </section></div>;
}
