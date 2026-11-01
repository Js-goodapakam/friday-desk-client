import {useEffect,useState} from 'react';
import OwnerPie from './OwnerPie.jsx';
import OwnerSeriesGraph from './OwnerSeriesGraph.jsx';
import {workspaceRequest} from '../services/workspace.js';
import {formatPortfolioMoney as money} from '../core/portfolio.js';
import {futureBookingRows} from '../core/ownerBookings.js';
export default function OwnerBookingOutlook({properties,open,opening,period='7',view='data',revision=0}){
 const [records,setRecords]=useState(null),[error,setError]=useState(''),[retry,setRetry]=useState(0),[status,setStatus]=useState('confirmed');
 const ids=properties.map(p=>p.id).join(',');
 useEffect(()=>{let active=true;Promise.resolve().then(()=>{if(active){setRecords(null);setError('');}});Promise.all(ids.split(',').filter(Boolean).map(async id=>{const r=await workspaceRequest(id);if(!r.state)throw Error('Booking records unavailable.');return {id,state:r.state};})).then(r=>{if(active)setRecords(r);}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[ids,retry,revision]);
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata'}).format(new Date());
 const all=futureBookingRows(records||[],properties,today,period),confirmed=all.filter(r=>r.status!=='Pending'),pending=all.filter(r=>r.status==='Pending');
 const rows=status==='confirmed'?confirmed:status==='pending'?pending:all;
 const currencies=[...new Set(confirmed.map(r=>r.property?.currency||'INR'))];
 const last=period==='all'?(all.at(-1)?.arrival||today):new Date(Date.parse(today+'T00:00:00Z')+(Number(period)-1)*86400000).toISOString().slice(0,10);
 const days=Math.round((Date.parse(last)-Date.parse(today))/86400000)+1;
 const monthly=days>92;
 const buckets=monthly?[...new Set(all.map(r=>r.arrival.slice(0,7)))].sort():Array.from({length:days},(_,i)=>new Date(Date.parse(today+'T00:00:00Z')+i*86400000).toISOString().slice(0,10));
 const labels=buckets.map(d=>new Date(d+(monthly?'-01':'')+'T00:00:00Z').toLocaleDateString('en-IN',{day:monthly?undefined:'numeric',month:'short',year:monthly?'numeric':undefined,timeZone:'UTC'}));
 const series=properties.map(p=>({name:p.name,values:buckets.map(d=>rows.filter(r=>r.property?.id===p.id&&(monthly?r.arrival.slice(0,7):r.arrival)===d).length)}));
 return <section className="oi-panel oi-booking-outlook"><div className="oi-panel-title"><div><h2>Upcoming bookings</h2><span>{period==='all'?'Future Bookings':`Next ${period} Days`} · {today} – {last}</span></div><select aria-label="Booking status" value={status} onChange={e=>setStatus(e.target.value)}><option value="confirmed">Confirmed / modified</option><option value="pending">Pending</option><option value="all">All booking statuses</option></select></div>{error?<div className="oi-callout" role="alert">{error}<button className="pw-secondary" onClick={()=>setRetry(n=>n+1)}>Retry</button></div>:!records?<div className="oi-callout" role="status">Loading bookings…</div>:<><div className="oi-outlook-summary"><span><b>{confirmed.length}</b>Confirmed / modified</span><span><b>{pending.length}</b>Pending</span><span><b>{currencies.map(c=>money(confirmed.filter(r=>(r.property?.currency||'INR')===c).reduce((s,r)=>s+(Number(r.totalAmount)||0),0),c)).join(' · ')||'—'}</b>Confirmed booking value</span></div>{!rows.length?<p className="oi-callout">No bookings match this period and status.</p>:view==='chart'?<OwnerPie title="Bookings by branch" items={properties.map(p=>({label:p.name,value:rows.filter(r=>r.property?.id===p.id).length}))} format={v=>v+' bookings'}/>:view==='graph'?<OwnerSeriesGraph title="Upcoming arrivals by branch" labels={labels} series={series} counts/>:<div className="pw-table-scroll"><table className="pw-table"><thead><tr><th>Hotel branch</th><th>Guest</th><th>Arrival</th><th>Departure</th><th>Status</th><th>Booking value</th></tr></thead><tbody>{rows.map(r=><tr key={r.property?.id+'-'+r.id}><td><button className="pw-text-button" disabled={opening!==null} onClick={()=>r.property&&open(r.property,'reservations')}>{r.property?.name} →</button></td><td>{r.guest}</td><td>{r.arrival}</td><td>{r.departure}</td><td>{r.status}</td><td>{Number.isFinite(r.totalAmount)?money(r.totalAmount,r.property?.currency||'INR'):'—'}</td></tr>)}</tbody></table></div>}</>}</section>;
}
