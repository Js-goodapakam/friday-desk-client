const indiaDay=value=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata'}).format(new Date(value));
export function requestType(item){return item.type||(String(item.text).toLowerCase().includes('towel')?'Extra Towels':'Guest Request');}
export function filterRequests(data,{q='',status='All Status',type='All Types',period='All Time'},today=indiaDay(new Date())){
 const count=period==='Today'?1:period==='Last 7 Days'?7:period==='Last 30 Days'?30:null;
 const from=count?new Date(Date.parse(today+'T12:00:00Z')-(count-1)*86400000).toISOString().slice(0,10):null;
 return data.requests.filter(item=>{
  const guest=data.guests.find(g=>g.id===item.guestId),reservation=data.reservations.find(r=>r.id===item.reservationId);
  let day='';try{day=indiaDay(item.created);}catch{/* Unknown dates do not match a dated filter. */}
  return (!q||`${guest?.name||''} ${reservation?.room||''} ${item.text}`.toLowerCase().includes(q.toLowerCase()))&&(status==='All Status'||item.status===status)&&(type==='All Types'||requestType(item)===type)&&(!from||(day>=from&&day<=today));
 });
}
