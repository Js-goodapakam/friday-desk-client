import {useState} from 'react';
import OwnerStaff from './OwnerStaff.jsx';
import PermissionCatalogue from './PermissionCatalogue.jsx';
export default function EnterpriseTeam(props){
 const [tab,setTab]=useState('staff');
 return <section className="ea-team"><nav className="ea-tabs" aria-label="Team sections"><button aria-pressed={tab==='staff'} onClick={()=>setTab('staff')}>Staff directory</button><button aria-pressed={tab==='permissions'} onClick={()=>setTab('permissions')}>Team & Permissions</button></nav>{tab==='staff'?<OwnerStaff {...props}/>:<PermissionCatalogue/>}</section>;
}
