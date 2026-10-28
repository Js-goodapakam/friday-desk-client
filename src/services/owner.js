import {API_BASE as base} from './apiBase.js';
export async function ownerRequest(method='GET',body,path=''){
 const response=await fetch(`${base}/api/owner${path}`,{method,credentials:'include',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});
 const result=await response.json().catch(()=>({error:'Owner service unavailable.'}));if(!response.ok)throw Error(result.error||'Unable to update owner workspace.');return result;
}
