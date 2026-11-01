import OwnerSeriesGraph from './OwnerSeriesGraph.jsx';
import fridayLogo from '../assets/friday-f-logo.png';
import OwnerPie from './OwnerPie.jsx';
import {useEffect,useState} from 'react';
import {workspaceRequest} from '../services/workspace.js';
import {timelineBuckets,aggregateTimeline} from '../core/ownerTimeline.js';
import {formatPortfolioMoney as money} from '../core/portfolio.js';
export default function OwnerTimeline({properties,mode,start,end,today,view,page,revision=0}){
 const [result,setResult]=useState(null),[error,setError]=useState(''),[metric,setMetric]=useState(page==='calendar'?'checkins':page==='sales'?'bookings':'collections');
 const [loadedIds,setLoadedIds]=useState('');
 const [pending,setPending]=useState(true),[retry,setRetry]=useState(0);
 const loadingLabel=(properties.length===1?properties[0].name:'All selected branches')+' · '+(mode==='today'?today:mode==='custom'?start+' – '+end:start||mode);
 const loader=<div className="oi-branded-loader" role="status" aria-live="polite"><img src={fridayLogo} alt="Friday"/><strong>Preparing your overview…</strong><span>{loadingLabel}</span><div className="oi-load-progress"><i/></div></div>;
 const ids=properties.map(p=>p.id).join(',');
 useEffect(()=>{let active=true;Promise.resolve().then(()=>{if(active){setPending(true);setError('');}});if(!ids)return;Promise.all(ids.split(',').map(id=>workspaceRequest(id))).then(r=>{if(r.some(x=>!x.state))throw Error('Historical records are unavailable for one or more selected branches.');if(active){setResult(r.map(x=>x.state));setLoadedIds(ids);setPending(false);}}).catch(e=>{if(active){setError(e.message);setPending(false);}});return()=>{active=false;};},[ids,retry,revision]);
 const buckets=timelineBuckets(mode,start,end,today);
 if(!buckets.length)return <section className="oi-panel oi-callout">Choose a complete reporting period (up to 366 days) to display the timeline.</section>;
 if(error)return <section className="oi-panel oi-callout" role="alert">{error}<button className="pw-secondary" onClick={()=>setRetry(n=>n+1)}>Retry</button></section>;
 if(!result||loadedIds!==ids)return <section className="oi-panel oi-timeline-loading" role="status" aria-live="polite"><div className="oi-loading-chart"/>{loader}</section>;
 const {rows,undated}=aggregateTimeline(result,buckets,mode),labels={collections:'Net collections',bookings:'Bookings created',checkins:'Actual check-ins',checkouts:'Actual check-outs'};
 const currencies=[...new Set(properties.map(p=>p.currency||'INR'))],mixed=metric==='collections'&&currencies.length>1;
 const val=v=>metric==='collections'?money(v,currencies[0]):String(v);
 return <section className={`oi-panel oi-timeline oi-data-enter${pending?' oi-is-updating':''}`} aria-busy={pending}>{pending&&loader}<div className="oi-panel-title"><div><h2>{properties.length===1?properties[0].name:'Selected branches'} · {mode==='today'?'24-hour activity':mode==='year'?'Monthly activity':'Daily activity'}</h2><span>India time · {buckets[0].key} to {buckets.at(-1).key}</span></div><select aria-label="Timeline metric" value={metric} onChange={e=>setMetric(e.target.value)}>{Object.entries(labels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
 {mixed?<p className="oi-callout">Select branches with one currency for collections.</p>:<>{view==='data'?<div className="pw-table-scroll"><table className="pw-table"><thead><tr><th>Branch</th><th>{mode==='today'?'Hour (IST)':'Period'}</th>{Object.values(labels).map(l=><th key={l}>{l}</th>)}</tr></thead><tbody>{properties.flatMap((p,i)=>aggregateTimeline([result[i]],buckets,mode).rows.map(r=><tr key={p.id+'-'+r.key}><td>{p.name}</td><td>{r.label}</td><td>{currencies.length===1?money(r.collections,currencies[0]):'Mixed currencies'}</td><td>{r.bookings}</td><td>{r.checkins}</td><td>{r.checkouts}</td></tr>))}</tbody></table></div>:view==='chart'?<OwnerPie title={labels[metric]} items={properties.length>1?properties.map((p,i)=>({label:p.name,value:aggregateTimeline([result[i]],buckets,mode).rows.reduce((sum,r)=>sum+r[metric],0)})):rows.map(r=>({label:r.label,value:r[metric]}))} format={val}/>:<OwnerSeriesGraph title={labels[metric]} labels={rows.map(r=>r.label)} series={properties.map((p,i)=>({name:p.name,values:aggregateTimeline([result[i]],buckets,mode).rows.map(r=>r[metric])}))} format={val} counts={metric!=='collections'}/>}<p className="oi-plot-note">{labels[metric]} total: {val(rows.reduce((s,r)=>s+r[metric],0))}. Zero means no matching dated records. Date-only bookings cannot be allocated to an hour.{undated>0&&` ${undated} date-only booking records excluded from hourly allocation.`} These are transaction and guest-movement events; historical occupancy and dues balances are not inferred from the current snapshot.</p></>}
 </section>;
}
