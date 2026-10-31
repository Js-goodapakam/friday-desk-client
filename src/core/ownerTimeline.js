export const indiaDate=value=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata'}).format(new Date(value));
const add=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
export function timelineBuckets(mode,start,end,today){
 if(mode==='today')return Array.from({length:24},(_,h)=>({key:today+'T'+String(h).padStart(2,'0'),label:String(h).padStart(2,'0')+':00'}));
 if(mode==='week'&&start){const [y,w]=start.split('-W').map(Number);const jan=new Date(Date.UTC(y,0,4));start=add(jan.toISOString().slice(0,10),-((jan.getUTCDay()+6)%7)+(w-1)*7);end=add(start,6);}
 if(mode==='month'&&start){const [y,m]=start.split('-').map(Number);start+='-01';end=new Date(Date.UTC(y,m,0)).toISOString().slice(0,10);}
 if(mode==='year'&&start)return Array.from({length:12},(_,m)=>({key:start+'-'+String(m+1).padStart(2,'0'),label:new Date(Date.UTC(2020,m,1)).toLocaleString('en-IN',{month:'short',timeZone:'UTC'})}));
 if(!start||!end||end<start)return [];
 const n=Math.round((Date.parse(end)-Date.parse(start))/86400000)+1;
 if(n>366)return [];
 return Array.from({length:n},(_,i)=>{const key=add(start,i);return {key,label:new Date(key+'T00:00:00Z').toLocaleDateString('en-IN',{day:'numeric',month:'short',weekday:mode==='week'?'short':undefined,timeZone:'UTC'})};});
}
export function aggregateTimeline(states,buckets,mode){
 const rows=buckets.map(b=>({...b,collections:0,bookings:0,checkins:0,checkouts:0}));const map=new Map(rows.map(r=>[r.key,r]));let undated=0;
 function slot(value){if(!value)return null;if(mode==='today'&&!value.includes('T')){undated++;return null;}const date=value.includes('T')?indiaDate(value):value.slice(0,10);let key=date;if(mode==='year')key=date.slice(0,7);if(mode==='today'){const hour=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',hour:'2-digit',hourCycle:'h23'}).format(new Date(value));key=date+'T'+hour;}return map.get(key);}
 for(const state of states){for(const p of state.payments||[]){if(['Failed','Pending','Cancelled'].includes(p.status))continue;const r=slot(p.paidAt);if(r)r.collections+=(p.type==='Refund'?-1:1)*(Number(p.amount)||0);}for(const r of state.reservations||[]){const booked=slot(r.bookingDate);if(booked)booked.bookings++;const ci=slot(r.actualCheckIn);if(ci)ci.checkins++;const co=slot(r.actualCheckOut);if(co)co.checkouts++;}}
 return {rows,undated};
}
