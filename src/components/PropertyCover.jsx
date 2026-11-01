import {useState} from 'react';
const bundled=new Set(['TAJ-MUM-001','TAJ-BLR-002','TAJ-UDR-003']);
const uploaded={'TAJ-GOA-004':'/demo-hotels/TAJ-GOA-004-uploaded.jpg','TAJ-MAA-005':'/demo-hotels/TAJ-MAA-005-uploaded.jpg'};
export default function PropertyCover({property}){
 const [failed,setFailed]=useState(false);
 const src=property.cover?.smallUrl||property.cover?.url||uploaded[property.code]||(bundled.has(property.code)?`/demo-hotels/${property.code}-640.webp`:null);
 if(src&&!failed)return <img className="oi-property-cover" src={src} alt={property.name} loading="lazy" onError={()=>setFailed(true)}/>;
 return <div className="oi-property-cover oi-property-placeholder" aria-label={property.name+' — photo unavailable'}><svg viewBox="0 0 64 64" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M14 55V19L32 9l18 10v36M9 55h46M26 55V42h12v13M23 23h5m8 0h5M23 32h5m8 0h5"/></svg><span>{property.city||'Hotel branch'}</span></div>;
}
