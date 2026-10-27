const base=(import.meta.env.VITE_API_URL || '').replace(/\/$/,'');
export async function authRequest(path, body) {
  let response;
  try { response=await fetch(`${base}/api/auth/${path}`, {method:body ? 'POST':'GET',credentials:'include',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined}); }
  catch {throw new Error('Unable to reach the authentication server. Check that the API is running.');}
  const result=await response.json().catch(()=>({error:'Authentication server is unavailable. Check your API configuration.'}));
  if(!response.ok || !result || (path!=='logout' && !result.user)) throw new Error(result.error || 'Authentication failed.');
  return result;
}
