import { SimplePage } from "./SimplePage.jsx";
export default function Rooms({data}) {
 return <SimplePage title="Rooms" eyebrow="ROOM INVENTORY">
  <section className="card property-card"><div className="property-main"><div><h2>{data.property?.name}</h2><p className="muted">{data.rooms.length} rooms · one operating location</p></div><span className="pill">1 Location</span></div>
  <div className="room-grid large">{data.rooms.map(rm=>{const s=data.reservations.find(r=>r.room===rm.number&&r.status==="Checked In");return <div className={`room-tile ${s?"occupied":""}`} key={rm.number}><strong>Room {rm.number}</strong><span>{s?`Occupied · ${data.guests.find(g=>g.id===s.guestId)?.name||"Guest"}`:"Available"}</span><small>{rm.type}</small></div>})}</div>
  </section>
 </SimplePage>;
}
