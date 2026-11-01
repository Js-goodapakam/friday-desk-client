import {useState} from 'react';
import {formatPortfolioMoney as money} from '../core/portfolio.js';
const metrics={occupancy:'Occupancy',roomRevenue:'Room revenue',cashCollected:'Net collections',outstanding:'Guest dues',availableRooms:'Available rooms'};
export default function OwnerComparisonViews({properties,mode,open,opening}){
 const [metric,setMetric]=useState('occupancy');
 const rows=[...properties].sort((a,b)=>(b[metric]??-Infinity)-(a[metric]??-Infinity));
 const max=Math.max(1,...rows.map(p=>Math.max(0,p[metric]||0)));
 const value=(p,k)=>!Number.isFinite(p[k])?'—':k==='occupancy'?p[k].toFixed(1)+'%':['roomRevenue','cashCollected','outstanding'].includes(k)?money(p[k],p.currency||'INR'):String(p[k]);
 return <section className="oi-panel"><div className="oi-panel-title"><h2>{mode==='ranked'?'Branch rankings':'Branch scorecard'}</h2><select aria-label="Compare metric" value={metric} onChange={e=>setMetric(e.target.value)}>{Object.entries(metrics).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>{mode==='ranked'?<div className="oi-bars">{rows.map((p,i)=><button key={p.id} disabled={opening!==null} onClick={()=>open(p)}><span className="oi-bar-name"><b>{i+1}. {p.name}</b><small>{p.city}</small></span><span className="oi-track"><i style={{width:`${Math.max(0,Number(p[metric])||0)/max*100}%`}}/></span><strong>{value(p,metric)}</strong></button>)}</div>:<div className="pw-table-scroll"><table className="pw-table"><thead><tr><th>Branch</th>{Object.values(metrics).map(m=><th key={m}>{m}</th>)}</tr></thead><tbody>{rows.map(p=><tr key={p.id}><td><button className="pw-table-property" disabled={opening!==null} onClick={()=>open(p)}><span><b>{p.name} →</b><small>{p.city}</small></span></button></td>{Object.keys(metrics).map(k=><td key={k}>{value(p,k)}</td>)}</tr>)}</tbody></table></div>}</section>;
}
