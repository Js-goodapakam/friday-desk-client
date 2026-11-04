import {API_BASE as base} from './apiBase.js';
import {workspacePayload} from '../core/workspacePayload.js';
export async function workspaceRequest(id,method='GET',body,path='workspace'){
 const payload=method==='PUT'&&path==='workspace'?workspacePayload(body):body;
 const response=await fetch(`${base}/api/properties/${id}/${path}`,{method,credentials:'include',headers:body?{'Content-Type':'application/json'}:undefined,body:payload?JSON.stringify(payload):undefined});
 const result=await response.json().catch(()=>({error:'Workspace service unavailable.'}));
 if(!response.ok)throw new Error(result.error||'Unable to save workspace.');
 return result;
}
