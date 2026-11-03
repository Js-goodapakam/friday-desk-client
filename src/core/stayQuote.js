export function stayQuote(data,type,plan,arrival,departure){
 if(!type||!plan||!arrival||!departure||!Number.isFinite(Date.parse(arrival))||!Number.isFinite(Date.parse(departure))||departure<=arrival)return {rate:0,nights:[],error:'Choose valid stay dates, a category and a rate plan.'};
 const count=Math.round((Date.parse(departure)-Date.parse(arrival))/86400000);
 if(count>365)return {rate:0,nights:[],error:'A stay may contain at most 365 nights.'};
 const planRate=plan.rates?.find(r=>r.roomTypeId===type.id)?.rate??type.baseRate;
 const supplement=planRate-type.baseRate,nights=[];
 for(let i=0;i<count;i++){
  const date=new Date(Date.parse(arrival+'T12:00:00Z')+i*86400000).toISOString().slice(0,10),daily=data.inventoryOverrides?.[`${type.name}|${date}`];
  if(daily?.stopSell)return {rate:0,nights:[],error:`Sales are closed for ${type.name} on ${date}.`};
  const rate=(daily?.rate??type.baseRate)+supplement;
  if(!Number.isFinite(rate)||rate<0)return {rate:0,nights:[],error:'A valid rate is required for every night.'};
  nights.push({date,rate});
 }
 return {rate:nights.reduce((s,n)=>s+n.rate,0)/nights.length,nights,error:''};
}
