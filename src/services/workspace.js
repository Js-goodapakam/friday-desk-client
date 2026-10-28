import {API_BASE as base} from './apiBase.js';
export async function workspaceRequest(id,method='GET',body,path='workspace'){
 const response=await fetch(`${base}/api/properties/${id}/${path}`,{method,credentials:'include',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});
 const result=await response.json().catch(()=>({error:'Workspace service unavailable.'}));
 if(!response.ok)throw new Error(result.error||'Unable to save workspace.');
 return result;
}
