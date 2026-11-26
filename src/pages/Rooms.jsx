import { useState } from "react";
import { SimplePage } from "./SimplePage.jsx";
export default function Rooms({data, onAddRoom, housekeeping, onCleaningStatus}) {
 const [pending,setPending]=useState(false);
 const [error,setError]=useState("");
 async function addRoom(event) {
  event.preventDefault();
  if(pending)return;
  const form=event.currentTarget;
  const fields=new FormData(form);
  const number=fields.get("number").trim(),type=fields.get("type").trim();
  if(!number||!type){setError("Enter a room number and type.");return;}
  if(data.rooms.some(room=>room.number===number)){setError("That room number already exists.");return;}
  setPending(true);
  setError("");
  try {
   if(await onAddRoom({number,type,floor:fields.get("floor").trim(),capacity:Number(fields.get("capacity"))}))form.reset();
  } finally {
   setPending(false);
  }
 }
 async function markRoom(number,status) {
  if(pending)return;
  setPending(true);
  try { await onCleaningStatus(number,status); }
  finally { setPending(false); }
 }
 return <SimplePage title={housekeeping?"Housekeeping":"Rooms"} eyebrow={housekeeping?"PROPERTY OPERATIONS":"ROOM INVENTORY"}>
  <section className="card property-card"><div className="property-main"><div><h2>{data.property?.name}</h2><p className="muted">{data.rooms.length} rooms · one operating location</p></div><span className="pill">1 Location</span></div>
  <div className="room-grid large">{data.rooms.map(rm=>{
   const guest=data.reservations.find(r=>r.room===rm.number&&r.status==="Checked In");
   const status=rm.housekeepingStatus;
   return <div className={`room-tile ${guest?"occupied":""}`} key={rm.number}>
    <strong>Room {rm.number}</strong>
    <span>{guest?`Occupied · ${data.guests.find(g=>g.id===guest.guestId)?.name||"Guest"}`:"Vacant"}</span>
    <small>{rm.type}</small>
    {housekeeping&&<><span>{status||"Unrecorded"}</span>{!guest&&status!=="Inspected"&&
     <button className="subtle" disabled={pending} onClick={()=>markRoom(rm.number,status==="Clean"?"Inspected":"Clean")}>
      {status==="Clean"?"Mark inspected":"Mark clean"}
     </button>}</>}
   </div>;
  })}</div>
  </section>
  {onAddRoom&&<section className="card property-card"><h2>Add room</h2>
   <form onSubmit={addRoom}>
    <label>Room number <input name="number" required maxLength={32}/></label>
    <label>Room type <input name="type" required maxLength={80}/></label>
    <label>Floor <input name="floor" maxLength={32}/></label>
    <label>Capacity <input name="capacity" type="number" min="1" required defaultValue="2"/></label>
    {error&&<p role="alert">{error}</p>}
    <button className="primary" disabled={pending}>{pending?"Saving…":"Add room"}</button>
   </form>
  </section>}
 </SimplePage>;
}
