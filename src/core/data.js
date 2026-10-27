export const KEY = "staydesk-taj-v4";
export const HOTEL = { id:"taj-tirupati", name:"Taj", location:"Tirupati, Andhra Pradesh", rooms:["101","102","103","104","105","201","202","203","204","205","301","302"], checkIn:"2:00 PM", checkOut:"12:00 PM", wifi:"Taj-Guest" };
export const PEOPLE = [
  {id:"G-1001",name:"Jaya Sankar",email:"jaya@example.com",phone:"+91 86883 15966",nationality:"Indian",idType:"Aadhaar",idNumber:"",address:"Tirupati, Andhra Pradesh"},
  {id:"G-1002",name:"Yuvaraj",email:"yuvaraj@example.com",phone:"+91 90000 00002",nationality:"Indian",idType:"Aadhaar",idNumber:"",address:"Tirupati, Andhra Pradesh"},
  {id:"G-1003",name:"Bharath",email:"bharath@example.com",phone:"+91 90000 00003",nationality:"Indian",idType:"Aadhaar",idNumber:"",address:"Tirupati, Andhra Pradesh"},
  {id:"G-1004",name:"Jagadeesh",email:"jagadeesh@example.com",phone:"+91 90000 00004",nationality:"Indian",idType:"Aadhaar",idNumber:"",address:"Tirupati, Andhra Pradesh"},
  {id:"G-1005",name:"Sasidhar",email:"sasidhar@example.com",phone:"+91 90000 00005",nationality:"Indian",idType:"Aadhaar",idNumber:"",address:"Tirupati, Andhra Pradesh"}
];
export const iso = d => new Date(d).toISOString().slice(0,10);
export const offset = n => { const d=new Date(); d.setDate(d.getDate()+n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
export const stamp = (d=new Date()) => d.toISOString();
export const fmt = s => s ? new Date(s).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "—";
export const date = s => new Date(`${s}T12:00:00`).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
export const money = n => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);
export const nights = s => Math.max(1,Math.round((Date.parse(`${s.departure}T12:00:00`)-Date.parse(`${s.arrival}T12:00:00`))/86400000));
export const total = s => Number.isFinite(s.folioTotal)?s.folioTotal:nights(s)*Number(s.rate);
export const balance = s => Math.max(0,total(s)-Number(s.paid));
export const initials = n => n.split(" ").map(x=>x[0]).slice(0,2).join("");
export const uid = p => `${p}-${crypto.randomUUID().slice(0,7).toUpperCase()}`;

/* ---- CSV export helpers (used by Reports) ---- */
export function toCSV(rows,headers){
 const esc=v=>{const s=String(v??"");return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s};
 const lines=[headers.join(","),...rows.map(r=>headers.map(h=>esc(r[h])).join(","))];
 return lines.join("\r\n");
}
export function downloadCSV(filename,csv){
 const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");
 a.href=url;a.download=filename;document.body.appendChild(a);a.click();document.body.removeChild(a);
 URL.revokeObjectURL(url);
}

export function seed(){
  return {
    guests:PEOPLE,
    reservations:[
      {id:"R-1001",guestId:"G-1001",room:"101",arrival:offset(0),departure:offset(2),expectedIn:"14:00",expectedOut:"12:00",status:"Checked In",rate:4200,paid:8400,bookingDate:offset(-2),source:"Direct",actualCheckIn:stamp(new Date(Date.now()-45*60000)),actualCheckOut:null},
      {id:"R-1002",guestId:"G-1002",room:"102",arrival:offset(1),departure:offset(3),expectedIn:"14:00",expectedOut:"12:00",status:"Confirmed",rate:3000,paid:3000,bookingDate:offset(-1),source:"Direct",actualCheckIn:null,actualCheckOut:null},
      {id:"R-1003",guestId:"G-1003",room:"201",arrival:offset(-1),departure:offset(1),expectedIn:"14:00",expectedOut:"12:00",status:"Checked In",rate:4500,paid:4500,bookingDate:offset(-4),source:"OTA",actualCheckIn:stamp(new Date(Date.now()-24*60*60000)),actualCheckOut:null},
      {id:"R-1004",guestId:"G-1004",room:"202",arrival:offset(2),departure:offset(4),expectedIn:"14:00",expectedOut:"12:00",status:"Confirmed",rate:3800,paid:0,bookingDate:offset(-2),source:"Direct",actualCheckIn:null,actualCheckOut:null},
      {id:"R-1005",guestId:"G-1005",room:"301",arrival:offset(-4),departure:offset(-2),expectedIn:"14:00",expectedOut:"12:00",status:"Checked Out",rate:3500,paid:7000,bookingDate:offset(-7),source:"Direct",actualCheckIn:stamp(new Date(Date.now()-4*86400000)),actualCheckOut:stamp(new Date(Date.now()-2*86400000))}
    ],
    requests:[{id:"Q-1001",guestId:"G-1001",reservationId:"R-1001",text:"Two extra towels",status:"Open",created:stamp()}],
    property:{name:"Taj Tirupati",type:"Hotel",address:"Tirupati, Andhra Pradesh",phone:"+91 87777 00000",email:"frontdesk@tajtirupati.local",timezone:"Asia/Kolkata (IST)",gstNumber:"",managerName:"Ratan Tata"},
    properties:[{id:"taj-tirupati",name:"Taj Tirupati",type:"Hotel",address:"Tirupati, Andhra Pradesh",phone:"+91 87777 00000",email:"frontdesk@tajtirupati.local",gstNumber:"",managerName:"Ratan Tata"}],
    rooms:HOTEL.rooms.map((n,i)=>({number:n,type:i<4?"Deluxe Room":i<8?"Premium Room":"Executive Room",floor:n[0],capacity:2})),
    users:[{id:"admin-001",name:"Ratan Tata",email:"admin@tajtirupati.local",role:"Admin",extension:"1001"}],
    invoiceSettings:{prefix:"INV",nextNumber:1,taxRate:12,terms:"Thank you for staying with us. Payment is due within 7 days of checkout.",bankDetails:"",template:"classic"},
    invoices:[],
    telecmi:{enabled:false,appId:"",appSecret:"",region:"India",sbc:"sbcind.telecmi.com",status:"Not connected",agents:[],userMappings:{"admin-001":""}},
    whatsapp:{connected:false,phoneId:"",wabaId:"",userMappings:{"admin-001":""}},
    meta:{connected:false,pageId:"",igId:"",userMappings:{"admin-001":""}},
    rcs:{connected:false,agentId:"",brandId:"",userMappings:{"admin-001":""}},
    channelManager:{channels:[],syncEvents:[]},
    inventoryOverrides:{},
    inventoryAudit:[],
    callActivities:[]
  };
}
export function load(){try{const x=JSON.parse(localStorage.getItem(KEY));if(x?.guests&&x?.reservations)return {...seed(),...x,property:{...seed().property,...(x.property||{})},properties:x.properties&&x.properties.length?x.properties:seed().properties,rooms:x.rooms&&x.rooms.length?x.rooms:seed().rooms,users:x.users&&x.users.length?x.users:seed().users,invoiceSettings:{...seed().invoiceSettings,...(x.invoiceSettings||{})},invoices:x.invoices||[],telecmi:{...seed().telecmi,...(x.telecmi||{})},whatsapp:{...seed().whatsapp,...(x.whatsapp||{})},meta:{...seed().meta,...(x.meta||{})},rcs:{...seed().rcs,...(x.rcs||{})},channelManager:{...seed().channelManager,...(x.channelManager||{}),channels:x.channelManager?.channels||[],syncEvents:x.channelManager?.syncEvents||[]},inventoryOverrides:x.inventoryOverrides||{},inventoryAudit:x.inventoryAudit||[],callActivities:x.callActivities||[]}}catch{}return seed()}
