import { useState } from "react";
import { uid } from "../../core/data.js";
import { Field } from "../Common.jsx";

export default function PropertyEditor({onClose,onSave}){
 const [f,setF]=useState({name:"",type:"Hotel",address:"",phone:"",email:"",gstNumber:"",managerName:""});
 const [error,setError]=useState("");
 const u=(k,v)=>setF(x=>({...x,[k]:v}));
 const submit=()=>{
  if(!f.name.trim()||!f.address.trim()){setError("Enter at least a hotel name and address.");return}
  onSave({...f,id:uid("PROP"),name:f.name.trim(),address:f.address.trim()});
 };
 return <div className="modal-backdrop" onClick={onClose}><section className="modal card" style={{width:"min(560px, 92vw)"}} onClick={e=>e.stopPropagation()}>
  <div className="modal-head"><div><div className="eyebrow">NEW PROPERTY</div><h2>Add property</h2><p className="muted small">Add another hotel location you manage.</p></div><button type="button" className="icon-button" onClick={onClose}>×</button></div>
  <div className="form-grid">
   <Field label="Hotel name *"><input value={f.name} onChange={e=>u("name",e.target.value)}/></Field>
   <Field label="Property type"><select value={f.type} onChange={e=>u("type",e.target.value)}><option>Hotel</option><option>Resort</option><option>Homestay</option></select></Field>
   <Field label="Address *"><input value={f.address} onChange={e=>u("address",e.target.value)}/></Field>
   <Field label="Phone"><input value={f.phone} onChange={e=>u("phone",e.target.value)}/></Field>
   <Field label="Email"><input type="email" value={f.email} onChange={e=>u("email",e.target.value)}/></Field>
   <Field label="GST Number"><input value={f.gstNumber} onChange={e=>u("gstNumber",e.target.value)}/></Field>
   <Field label="Manager name"><input value={f.managerName} onChange={e=>u("managerName",e.target.value)}/></Field>
  </div>
  {error&&<div className="security-note"><b>Check the details</b><span>{error}</span></div>}
  <div className="modal-actions"><button type="button" className="subtle" onClick={onClose}>Cancel</button><button type="button" className="primary" onClick={submit}>Add Property</button></div>
 </section></div>;
}
