import { useState } from "react";
import { uid } from "../../core/data.js";
import { Field } from "../Common.jsx";

export default function RoomEditor({existingNumbers,initial,onClose,onSave}){
 const [f,setF]=useState(initial||{number:"",type:"Deluxe Room",floor:"1",capacity:2});
 const [error,setError]=useState("");
 const u=(k,v)=>setF(x=>({...x,[k]:v}));
 const submit=()=>{
  if(!f.number.trim()){setError("Enter a room number.");return}
  if(!initial&&existingNumbers.includes(f.number.trim())){setError("A room with this number already exists.");return}
  onSave({...f,number:f.number.trim(),floor:String(f.floor||f.number[0]||"1"),capacity:Number(f.capacity)||2});
 };
 return <div className="modal-backdrop" onClick={onClose}><section className="modal card" style={{width:"min(480px, 92vw)"}} onClick={e=>e.stopPropagation()}>
  <div className="modal-head"><div><div className="eyebrow">{initial?"EDIT ROOM":"NEW ROOM"}</div><h2>{initial?`Room ${initial.number}`:"Add room"}</h2></div><button type="button" className="icon-button" onClick={onClose}>×</button></div>
  <div className="form-grid">
   <Field label="Room number *"><input value={f.number} onChange={e=>u("number",e.target.value)} placeholder="e.g. 401" disabled={!!initial}/></Field>
   <Field label="Room type"><select value={f.type} onChange={e=>u("type",e.target.value)}><option>Deluxe Room</option><option>Premium Room</option><option>Executive Room</option><option>Suite</option></select></Field>
   <Field label="Floor"><input value={f.floor} onChange={e=>u("floor",e.target.value)} placeholder="e.g. 4"/></Field>
   <Field label="Capacity (guests)"><input type="number" min="1" value={f.capacity} onChange={e=>u("capacity",e.target.value)}/></Field>
  </div>
  {error&&<div className="security-note"><b>Check the details</b><span>{error}</span></div>}
  <div className="modal-actions"><button type="button" className="subtle" onClick={onClose}>Cancel</button><button type="button" className="primary" onClick={submit}>{initial?"Save changes":"Add Room"}</button></div>
 </section></div>;
}
const STAFF_ROLES=["Admin","Manager","Front Desk"];
