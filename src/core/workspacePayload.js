export function workspacePayload(body){
 if(!body?.state)return body;
 // The server rebuilds these fields from the saved business records.
 const records={...body.state};delete records.dailyInventory;delete records.metrics;
 return {...body,state:records};
}
