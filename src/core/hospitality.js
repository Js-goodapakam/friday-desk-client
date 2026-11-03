const validDay=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d))&&new Date(d+'T12:00:00Z').toISOString().slice(0,10)===d;
const round=n=>Math.round(n*100)/100;
const bounded=(n,min=0,max=10000000)=>Number.isFinite(n)&&n>=min&&n<=max;
function orderTotal(order){
 if(!Array.isArray(order.items)||!order.items.length||order.items.some(i=>!i.name?.trim()||!Number.isInteger(i.quantity)||i.quantity<1||i.quantity>999||!bounded(i.price)))throw Error('Choose valid order items.');
 if(!bounded(order.discountPercent,0,100)||!bounded(order.servicePercent,0,100)||!bounded(order.taxPercent,0,100))throw Error('Invalid order discount or tax.');
 const subtotal=round(order.items.reduce((s,i)=>s+i.price*i.quantity,0)),discount=round(subtotal*order.discountPercent/100),service=round((subtotal-discount)*order.servicePercent/100),tax=round((subtotal-discount+service)*order.taxPercent/100);
 return {subtotal,discount,service,tax,total:round(subtotal-discount+service+tax)};
}
function stockBalance(item,movements){return Math.round((item.opening+(movements||[]).filter(m=>m.itemId===item.id).reduce((s,m)=>s+(m.kind==='Receipt'?m.quantity:-m.quantity),0))*1000000)/1000000;}
function auditMetrics(state,date){
 if(!validDay(date))throw Error('Choose a valid business date.');
 const stays=state.reservations.filter(r=>!['Cancelled','No Show','Pending'].includes(r.status)&&r.arrival<=date&&date<r.departure),occupied=new Set(stays.map(r=>r.room)).size;
 const arrivals=state.reservations.filter(r=>r.arrival===date&&['Confirmed','Modified'].includes(r.status)),departures=state.reservations.filter(r=>r.departure<=date&&r.status==='Checked In');
 const receipts=(state.payments||[]).filter(p=>{if(!p.paidAt||!Number.isFinite(Date.parse(p.paidAt)))return false;return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata'}).format(new Date(p.paidAt))===date;}).reduce((s,p)=>s+(p.type==='Refund'?-p.amount:p.amount),0)+(state.hospitality?.posOrders||[]).filter(o=>o.status==='Settled'&&o.settledDate===date).reduce((s,o)=>s+o.paid,0);
 const missingFolios=state.reservations.filter(r=>!['Cancelled','No Show'].includes(r.status)&&!(state.folios||[]).some(f=>f.reservationId===r.id)).length;
 return {date,occupied,rooms:state.rooms.length,occupancy:state.rooms.length?round(100*occupied/state.rooms.length):0,roomValue:round(stays.reduce((s,r)=>s+(Number(r.rate)||0),0)),receipts:round(receipts),pendingArrivals:arrivals.length,overdueDepartures:departures.length,missingFolios,ready:!arrivals.length&&!departures.length&&!missingFolios};
}
function validateHospitality(state){
 const h=state.hospitality;if(h===undefined)return state;
 if(!h||typeof h!=='object'||Array.isArray(h))throw Error('Invalid hospitality records.');
 const keys=['expenses','cashMovements','accounts','stockItems','stockMovements','posItems','posOrders','reviews','audits'];
 if(Object.keys(h).some(k=>!keys.includes(k)))throw Error('Unknown hospitality section.');
 for(const key of keys){if(!Array.isArray(h[key]||[])||(h[key]||[]).length>5000)throw Error('Invalid '+key);const ids=new Set();for(const x of h[key]||[]){if(typeof x.id!=='string'||!x.id||ids.has(x.id))throw Error('Duplicate record.');ids.add(x.id);}}
 for(const e of h.expenses||[])if(!validDay(e.date)||!e.category?.trim()||!e.description?.trim()||!bounded(e.amount,.01)||!['Cash','UPI','Card','Bank transfer'].includes(e.method))throw Error('Invalid expense.');
 for(const m of h.cashMovements||[])if(!validDay(m.date)||!['Top-up','Withdrawal'].includes(m.kind)||!bounded(m.amount,.01)||!m.note?.trim())throw Error('Invalid cash movement.');
 for(const a of h.accounts||[])if(!a.name?.trim()||!bounded(a.creditLimit)||!Number.isInteger(a.creditDays)||a.creditDays<0||a.creditDays>365||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email))throw Error('Invalid direct billing account.');
 const accounts=new Set((h.accounts||[]).map(a=>a.id));
 for(const r of state.reservations)if(r.directBillingAccountId&&!accounts.has(r.directBillingAccountId))throw Error('Unknown billing account.');
 const itemIds=new Set((h.stockItems||[]).map(i=>i.id));
 for(const i of h.stockItems||[])if(!i.name?.trim()||!i.unit?.trim()||!bounded(i.opening)||!bounded(i.reorder)||stockBalance(i,h.stockMovements)<0)throw Error('Invalid or negative stock balance.');
 for(const m of h.stockMovements||[])if(!itemIds.has(m.itemId)||!['Receipt','Issue','Wastage'].includes(m.kind)||!bounded(m.quantity,.001)||!validDay(m.date)||!m.note?.trim())throw Error('Invalid stock movement.');
 for(const i of h.posItems||[])if(!i.name?.trim()||!i.category?.trim()||!bounded(i.price)||typeof i.available!=='boolean')throw Error('Invalid menu item.');
 for(const o of h.posOrders||[]){const expected=orderTotal(o);if(!['Open','Settled','Posted'].includes(o.status)||!validDay(o.date)||!o.table?.trim()||Math.abs(expected.total-o.total)>.01||!bounded(o.paid,0,expected.total))throw Error('Invalid POS order totals.');if(o.status==='Settled'&&(Math.abs(o.paid-o.total)>.01||!['Cash','UPI','Card','Bank transfer'].includes(o.method)))throw Error('Settle the full order amount.');if(o.status==='Posted'){const f=(state.folios||[]).find(f=>f.reservationId===o.reservationId);if(!f||f.charges.find(c=>c.sourceOrderId===o.id)?.quantity!==1||f.charges.filter(c=>c.sourceOrderId===o.id).length!==1||Math.abs(f.charges.find(c=>c.sourceOrderId===o.id).rate-(expected.subtotal-expected.discount+expected.service))>.01||Number(f.taxRate??state.invoiceSettings?.taxRate??0)!==o.taxPercent)throw Error('Room posting must match one folio charge.');}}
 for(const r of h.reviews||[])if(!r.guest?.trim()||!r.source?.trim()||!validDay(r.date)||!Number.isInteger(r.rating)||r.rating<1||r.rating>5||!r.text?.trim()||!['New','In progress','Resolved'].includes(r.status))throw Error('Invalid guest review.');
 for(const a of h.audits||[])if(!validDay(a.date)||!Number.isFinite(Date.parse(a.createdAt))||a.status!=='Reviewed'||!a.metrics||['occupied','rooms','occupancy','roomValue','receipts','pendingArrivals','overdueDepartures','missingFolios'].some(k=>!Number.isFinite(a.metrics[k])))throw Error('Invalid audit snapshot.');
 return state;
}
export {orderTotal,stockBalance,auditMetrics,validateHospitality};
