// Missing metrics are not zero. Only complete snapshots contribute to room totals.
export function portfolioTotals(properties) {
 const t={rooms:0,available:0,occupied:0,unavailable:0,occupancy:0,knownCount:0,bookingValue:{},outstanding:{},maintenanceRooms:0,openRequests:0,maintenanceKnown:false,requestsKnown:false,dates:[]};
 for(const p of properties){
  if([p.totalRooms,p.availableRooms,p.occupiedRooms].every(Number.isFinite)){
   t.knownCount++;t.rooms+=p.totalRooms;t.available+=p.availableRooms;t.occupied+=p.occupiedRooms;t.unavailable+=Math.max(0,p.totalRooms-p.availableRooms-p.occupiedRooms);
  }
  const currency=p.currency||'INR';
  for(const key of ['bookingValue','outstanding'])if(Number.isFinite(p[key]))t[key][currency]=(t[key][currency]||0)+p[key];
  if(Number.isFinite(p.maintenanceRooms)){t.maintenanceRooms+=p.maintenanceRooms;t.maintenanceKnown=true;}
  if(Number.isFinite(p.openRequests)){t.openRequests+=p.openRequests;t.requestsKnown=true;}
  if(p.asOf&&!t.dates.includes(p.asOf))t.dates.push(p.asOf);
 }
 t.occupancy=t.rooms?100*t.occupied/t.rooms:0;return t;
}
export function formatPortfolioMoney(value,currency='INR') {
 try{return new Intl.NumberFormat('en-IN',{style:'currency',currency,maximumFractionDigits:2,notation:'compact'}).format(value);}
 catch{return `${currency} ${new Intl.NumberFormat('en-IN',{maximumFractionDigits:0}).format(value)}`;}
}
