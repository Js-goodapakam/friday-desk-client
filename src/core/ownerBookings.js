export function futureBookingRows(records,properties,today,period){
 const end=period==='all'?null:new Date(Date.parse(today+'T00:00:00Z')+(Number(period)-1)*86400000).toISOString().slice(0,10);
 return records.flatMap(({id,state})=>(state.reservations||[]).filter(r=>['Confirmed','Modified','Pending'].includes(r.status)&&r.arrival>=today&&(!end||r.arrival<=end)).map(r=>({...r,property:properties.find(p=>String(p.id)===String(id)),guest:(state.guests||[]).find(g=>g.id===r.guestId)?.name||'Guest'}))).sort((a,b)=>a.arrival.localeCompare(b.arrival));
}
