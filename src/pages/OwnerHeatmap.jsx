import {timelineBuckets} from '../core/ownerTimeline.js';
import {useEffect,useState} from 'react';
import {workspaceRequest} from '../services/workspace.js';
export default function OwnerHeatmap({properties,revision=0,mode='all',start='',end=''}){
 const [data,setData]=useState(null),[error,setError]=useState('');
 const ids=properties.map(p=>p.id).join(',');
 useEffect(()=>{let active=true;Promise.resolve().then(()=>{if(active){setData(null);setError('');}});Promise.all(ids.split(',').filter(Boolean).map(async id=>({id,state:(await workspaceRequest(id)).state}))).then(r=>{if(r.some(x=>!x.state))throw Error('Booking data unavailable.');if(active)setData(r);}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[ids,revision]);
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata'}).format(new Date());
 const defaultDays=Array.from({length:30},(_,i)=>new Date(Date.parse(today+'T00:00:00Z')+i*86400000).toISOString().slice(0,10));
 const days=mode==='all'?defaultDays:mode==='today'?[today]:mode.startsWith('future')?(mode==='futureAll'?defaultDays:defaultDays.slice(0,Number(mode.replace('future','')))):timelineBuckets(mode,start,end,today).map(b=>b.key);
 return <section className="oi-panel"><div className="oi-panel-title"><h2>Booking heatmap</h2><span>Confirmed / modified arrivals · darker = more bookings</span></div>{!days.length?<p className="oi-callout">Select a complete reporting period.</p>:error?<p className="oi-callout" role="alert">{error}</p>:!data?<p className="oi-callout" role="status">Loading bookings…</p>:<div className="pw-table-scroll"><table className="oi-heatmap"><thead><tr><th>Branch</th>{days.map(d=><th key={d}>{new Date(d+(d.length===7?'-01':'')+'T00:00:00Z').toLocaleDateString('en-IN',{day:'numeric',month:'short',timeZone:'UTC'})}</th>)}</tr></thead><tbody>{properties.map(p=><tr key={p.id}><th>{p.name}</th>{days.map(d=>{const count=(data.find(x=>x.id===String(p.id))?.state?.reservations||[]).filter(r=>['Confirmed','Modified'].includes(r.status)&&(d.length===7?r.arrival?.slice(0,7)===d:r.arrival===d)).length;return <td key={d} title={`${p.name} · ${d}: ${count} arrivals`} style={{background:count?`rgba(39,105,215,${Math.min(.9,.15+count*.12)})`:'#f0f4f9',color:count>=4?'white':'#244164'}}>{count}</td>;})}</tr>)}</tbody></table></div>}</section>;
}
