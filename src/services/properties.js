const base=(import.meta.env.VITE_API_URL || '').replace(/\/$/,'');
export async function propertyRequest(path='',body) {
 let response;
 try {response=await fetch(`${base}/api/properties${path}`,{credentials:'include',method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});}
 catch {throw new Error('Unable to reach the property service. Check that the API is running.');}
 const result=await response.json().catch(()=>({error:'The property service is unavailable.'}));
 if(!response.ok)throw new Error(result.error || 'Unable to load properties.');
 return result;
}
