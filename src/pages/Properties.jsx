import {useEffect,useRef,useState} from 'react';
import {propertyRequest} from '../services/properties.js';
import './properties.css';

export function AddProperty({onClose,onSave}) {
 const [form,setForm]=useState({name:'',city:'',state:'',country:'India',timezone:'Asia/Kolkata'}),[saving,setSaving]=useState(false),[error,setError]=useState('');
 const first=useRef(null);
 useEffect(()=>{first.current?.focus();},[]);
 async function submit(event){event.preventDefault();if(saving)return;setSaving(true);setError('');try{const result=await propertyRequest('',form);onSave(result.property);}catch(error){setError(error.message);}finally{setSaving(false);}}
 function keys(event){if(event.key==='Escape'&&!saving)onClose();if(event.key==='Tab'){const items=[...event.currentTarget.querySelectorAll('input,button')].filter(e=>!e.disabled);const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}}
 return <div className="pg-backdrop"><form className="pg-modal" role="dialog" aria-modal="true" aria-labelledby="pg-add-title" onSubmit={submit} onKeyDown={keys}><div className="pg-eyebrow">GROW YOUR PORTFOLIO</div><h2 id="pg-add-title">Add a property</h2><p>Create a property and configure its rooms and operations.</p>{error&&<div className="pg-error" role="alert">{error}</div>}{Object.entries({name:'Property name',city:'City',state:'State / region',country:'Country',timezone:'Timezone'}).map(([key,label])=><label key={key}>{label}{['name','city','country','timezone'].includes(key)?' *':''}<input ref={key==='name'?first:undefined} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} required={key!=='state'} maxLength={key==='name'?120:100} placeholder={key==='timezone'?'Asia/Kolkata':label} disabled={saving}/></label>)}<div className="pg-modal-actions"><button type="button" className="pg-secondary" onClick={onClose} disabled={saving}>Cancel</button><button className="pg-primary" disabled={saving}>{saving?'Creating…':'Create property'}</button></div></form></div>;
}
