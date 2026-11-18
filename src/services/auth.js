import {API_BASE as base} from './apiBase.js';
export async function authRequest(path, body) {
  let response;
  try { response=await fetch(`${base}/api/auth/${path}`, {method:body ? 'POST':'GET',credentials:'include',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined}); }
  catch {throw new Error('Unable to reach the authentication server. Check that the API is running.');}
  const result=await response.json().catch(()=>({error:'Authentication server is unavailable. Check your API configuration.'}));
  if(!response.ok || !result || (path!=='logout' && !result.user)) throw new Error(result.error || 'Authentication failed.');
  if(result.user?.name === 'Friday Administrator') result.user.name = 'Engage Administrator';
  if(result.user?.email === 'info@friday.com') result.user.email = 'info@engagehubs.com';
  return result;
}

// New customer accounts are authenticated by Supabase. Legacy PMS accounts
// retain their existing endpoint during the controlled migration.
export async function loginWithIdentityBridge(credentials) {
  try { return await authRequest('login', credentials); }
  catch (legacyError) {
    if (!/Incorrect email or password/.test(legacyError.message || '')) throw legacyError;
    return authRequest('supabase/login', credentials);
  }
}
