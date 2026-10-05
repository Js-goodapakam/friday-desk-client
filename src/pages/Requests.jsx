import { useState } from "react";
import { fmt } from "../core/data.js";
import { Badge } from "../components/Common.jsx";

export default function RequestsPage({data,setData}){
 const [q,setQ]=useState(""),[filter,setFilter]=useState("All Status");
 const rows=data.requests.filter(item=>{
   const g=data.guests.find(x=>x.id===item.guestId);
   const room=data.reservations.find(r=>r.id===item.reservationId)?.room||"";
   const text=`${g?.name||""} ${room} ${item.text}`.toLowerCase();
   return text.includes(q.toLowerCase()) && (filter==="All Status"||item.status===filter);
 });
 const count=s=>data.requests.filter(x=>x.status===s).length;
 const resolve=id=>setData(d=>({...d,requests:d.requests.map(x=>x.id===id?{...x,status:x.status==="Open"?"Resolved":"Open"}:x)}));
 return <div className="requests-page">
   <div className="page-heading requests-heading">
     <div><div className="eyebrow">SERVICE DESK</div><h1>Guest Requests</h1><p className="muted">Manage and track guest requests from check-in to check-out</p></div>
     <button className="primary" onClick={()=>alert("New request flow is available from the Guest Portal.")}>＋ New Request</button>
   </div>
   <div className="request-summary">
     <div className="request-stat open"><span className="request-icon">◌</span><div><b>{count("Open")}</b><span>Open</span><small>Needs attention</small></div></div>
     <div className="request-stat progress"><span className="request-icon">◷</span><div><b>{count("In Progress")}</b><span>In Progress</span><small>Being handled</small></div></div>
     <div className="request-stat resolved"><span className="request-icon">✓</span><div><b>{count("Resolved")}</b><span>Resolved</span><small>Completed</small></div></div>
     <div className="request-stat closed"><span className="request-icon">×</span><div><b>{count("Closed")}</b><span>Closed</span><small>No recent issues</small></div></div>
   </div>
   <section className="card request-table-card">
     <div className="request-filters">
       <input value={q} onChange={e=>setQ(e.target.value)} placeholder="⌕  Search by guest name, room, or request…"/>
       <label><span>Status</span><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All Status</option><option>Open</option><option>In Progress</option><option>Resolved</option><option>Closed</option></select></label>
       <label><span>Request Type</span><select><option>All Types</option><option>Housekeeping</option><option>Extra Towels</option><option>Maintenance</option></select></label>
       <label><span>Date Range</span><select><option>All Time</option><option>Today</option><option>Last 7 Days</option><option>Last 30 Days</option></select></label>
     </div>
     <div className="table-scroll">
       <table className="request-table"><thead><tr><th>#</th><th>Guest</th><th>Room</th><th>Request Type</th><th>Description</th><th>Status</th><th>Requested On</th><th>Assigned To</th><th>Action</th></tr></thead>
       <tbody>{rows.length?rows.map((item,i)=>{const g=data.guests.find(x=>x.id===item.guestId);const room=data.reservations.find(r=>r.id===item.reservationId)?.room||"—";return <tr key={item.id}><td>{i+1}</td><td><strong>{g?.name}</strong></td><td>{room}</td><td><span className="request-type">{item.text.toLowerCase().includes("towel")?"Extra Towels":"Guest Request"}</span></td><td>{item.text}</td><td><Badge>{item.status}</Badge></td><td>{fmt(item.created)}</td><td>Front Desk</td><td><button className="subtle table-action" onClick={()=>resolve(item.id)}>{item.status==="Open"?"Resolve":"View"}</button></td></tr>}) : <tr><td colSpan="9" className="empty-cell">No guest requests match your filters.</td></tr>}</tbody></table>
     </div>
     <div className="table-footer"><span>Showing {rows.length} of {data.requests.length} requests</span><div className="pagination"><button disabled>‹</button><button className="current">1</button><button disabled>›</button></div></div>
   </section>
 </div>
}