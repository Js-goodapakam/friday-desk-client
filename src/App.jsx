import FridayOnboarding from "./Onboarding.jsx";

console.log("%cFriday AI - Desk build: call-widget-v5-incoming (2026-09-26)", "background:#1557D6;color:#fff;padding:4px 10px;border-radius:6px;font-weight:700");
import Dashboard from "./Dashboard.jsx";
import { Component, useEffect, useMemo, useState, useRef, useCallback } from "react";
import PIOPIY from "@telecmi/piopiyjs";
import "./index.css";
import FridayLogin from "./Friday.jsx";
import { authRequest } from "./services/auth.js";
import Properties from "./pages/PortfolioWorkspace.jsx";
import {workspaceRequest} from "./services/workspace.js";
import DemoOperations from "./pages/DemoOperations.jsx";
import BusinessOperations from "./pages/BusinessOperations.jsx";
import ReservationActions from "./pages/ReservationActions.jsx";
import RatePlans from "./pages/RatePlans.jsx";
import ChannelMappings from "./pages/ChannelMappings.jsx";
import RoomManagement from "./pages/RoomManagement.jsx";
import FolioActions from "./pages/FolioActions.jsx";
import CreateReservation from "./pages/CreateReservation.jsx";
import OwnerAdmin from "./pages/OwnerAdmin.jsx";
import "./pages/demo.css";
import "./pages/demo-extra.css";
import {loadPropertyWorkspace,propertyStorageKey} from "./core/propertyWorkspace.js";
import { KEY,HOTEL,offset,stamp,fmt,date,money,nights,total,balance,initials,uid,load,seed } from "./core/data.js";
import { Badge,Field } from "./components/Common.jsx";
import Reservations from "./pages/Reservations.jsx";
import Guests from "./pages/Guests.jsx";
import CalendarPage from "./pages/Calendar.jsx";
import ReportsPage from "./pages/Reports.jsx";
import RequestsPage from "./pages/Requests.jsx";
import Settings from "./pages/Settings.jsx";
import InvoicesPage from "./pages/Invoices.jsx";
import Rooms from "./pages/Rooms.jsx";
import Finance from "./pages/Finance.jsx";
import Help from "./pages/Help.jsx";
import ChannelManager from "./pages/ChannelManager.jsx";
import { reservationError } from "./core/reservationRules.js";
import RatesInventory from "./pages/RatesInventory.jsx";
import "./design-system.css";


const piopiy = new PIOPIY({
  name: "Friday AI - Desk",
  debug: true,
  autoplay: true,
  ringTime: 40,
});

window.piopiy = piopiy;

let teleCMISDKStatus = "disconnected"; // "disconnected" | "connecting" | "connected" | "failed"
const teleCMISDKListeners = new Set();
function setTeleCMISDKStatus(next) {
  teleCMISDKStatus = next;
  window.__teleCMISDKStatus = next;
  window.dispatchEvent(new CustomEvent("telecmi-status", { detail: next }));
  teleCMISDKListeners.forEach((fn) => fn(next));
}
function useTeleCMISDKStatus() {
  const [status, setStatus] = useState(teleCMISDKStatus);
  useEffect(() => {
    teleCMISDKListeners.add(setStatus);
    return () => teleCMISDKListeners.delete(setStatus);
  }, []);
  return status;
}

async function loginToTeleCMI() {
  const userId = import.meta.env.VITE_TELECMI_AGENT_USER_ID;
  const password = import.meta.env.VITE_TELECMI_AGENT_PASSWORD;
  const sbc = import.meta.env.VITE_TELECMI_SBC;

  if (!userId || !password || !sbc) {
    console.error("TeleCMI agent credentials are missing. Set VITE_TELECMI_AGENT_USER_ID, VITE_TELECMI_AGENT_PASSWORD and VITE_TELECMI_SBC in your .env file.");
    return;
  }

  console.log("Starting TeleCMI Browser SDK login...");
  setTeleCMISDKStatus("connecting");

  piopiy.login(userId, password, sbc);
}

window.loginToTeleCMI = loginToTeleCMI;

// Attempt to log the browser calling SDK in as soon as the app loads.
// Safe no-op if the .env credentials above aren't set yet.
loginToTeleCMI().catch((error) => {
  console.error("TeleCMI Browser SDK: initial login attempt failed", error);
});

piopiy.on("login", () => {
  console.log("TeleCMI Browser SDK: Login successful");
  setTeleCMISDKStatus("connected");
});

piopiy.on("loginFailed", (error) => {
  console.error("TeleCMI Browser SDK: Login failed", error);
  setTeleCMISDKStatus("failed");
});

let activeTeleCMICall = null;
let teleCMICallStartedAt = null;
let currentIncomingTeleCMICall = null;
const incomingTeleCMIListeners = new Set();

function subscribeIncomingTeleCMI(listener){
  incomingTeleCMIListeners.add(listener);
  if(currentIncomingTeleCMICall) listener(currentIncomingTeleCMICall);
  return () => incomingTeleCMIListeners.delete(listener);
}

function emitIncomingTeleCMI(call){
  currentIncomingTeleCMICall = call || null;
  incomingTeleCMIListeners.forEach(fn => fn(call || null));
}

window.teleCMIIncomingCall = null;

piopiy.on("trying", (data) => {
  console.log("Friday AI - Desk: outgoing call state -> trying", data);
  activeTeleCMICall?.setStatus?.("trying");
});

piopiy.on("ringing", (data) => {
  console.log("Friday AI - Desk: outgoing call state -> ringing", data);
  activeTeleCMICall?.setStatus?.("ringing");
});

piopiy.on("answered", (data) => {
  console.log("Friday AI - Desk: outgoing call state -> answered", data);
  activeTeleCMICall?.setStatus?.("connected");
  activeTeleCMICall?.setAnsweredAt?.(new Date());
});

// IMPORTANT: TeleCMI Browser SDK uses the exact event name `inComingCall`.
// This event is emitted when the logged-in browser agent receives an inbound call.
piopiy.on("inComingCall", (data) => {
  console.log("============================================");
  console.log("📞 TELECMI INCOMING CALL RECEIVED");
  console.log("From:", data?.from);
  console.log("Name:", data?.name);
  console.log("Call ID:", data?.call_id);
  console.log("To:", data?.to_number);
  console.log("Team:", data?.team_name);
  console.log("Payload:", data);
  console.log("============================================");
  window.teleCMIIncomingCall = data || null;
  emitIncomingTeleCMI(data);
});

piopiy.on("callStream", (data) => {
  console.log("TeleCMI call: media stream established", data);
  activeTeleCMICall?.setMediaReady?.(true);
});

piopiy.on("ended", (data) => {
  console.log("Friday AI - Desk: outgoing call state -> ended", data);
  activeTeleCMICall?.setStatus?.("ended");
  activeTeleCMICall?.setEndedAt?.(new Date());

  // Do NOT switch straight to the summary here.
  // Keep the floating call widget visible so the user can see
  // the final call state and explicitly save/close it.
});

piopiy.on("hangup", (data) => {
  console.log("TeleCMI call: hangup", data);
  activeTeleCMICall?.setStatus?.("ended");
  activeTeleCMICall?.setEndedAt?.(new Date());
});

piopiy.on("error", (error) => {
  console.error("TeleCMI call: error", error);
  activeTeleCMICall?.setStatus?.("error");
  activeTeleCMICall?.setErrorMessage?.(describeCallError(error));
});


function TajLogo({compact=false}){return <a className={`taj-logo ${compact?"compact":""}`} href="https://www.tajhotels.com/en-in/hotels/taj-tirupati" target="_blank" rel="noreferrer" aria-label="Taj official website"><span className="taj-mark">TAJ</span><span>TIRUPATI</span></a>}

/* Optional F logo: save it as src/assets/friday-f-logo.png (or .svg / .webp). Without it, the "F" letter mark shows. */
const brandLogoFiles = import.meta.glob("./assets/friday-f-logo.{png,svg,webp}", { eager: true, import: "default" });
const FRIDAY_MARK = Object.values(brandLogoFiles)[0] || null;
function Brand({className="brand"}){return <div className={className}>{FRIDAY_MARK?<img className="brand-logo" src={FRIDAY_MARK} alt=""/>:<span className="brand-mark">F</span>}<b>Friday AI - Desk</b></div>}

/* TeleCMI provider logo: place the file at src/assets/telecmi logo.png (or .svg/.webp). Falls back to a "T" mark if not found. */
const telecmiLogoFiles = import.meta.glob("./assets/telecmi logo.{png,svg,webp}", { eager: true, import: "default" });
const TELECMI_LOGO = Object.values(telecmiLogoFiles)[0] || null;

/* WhatsApp provider logo: place the file at src/assets/whatsapp.png (or .svg/.webp). Falls back to a "W" mark if not found. */
const whatsappLogoFiles = import.meta.glob("./assets/whatsapp.{png,svg,webp}", { eager: true, import: "default" });
const WHATSAPP_LOGO = Object.values(whatsappLogoFiles)[0] || null;

/* RCS provider logo: place the file at src/assets/Rcs.png (or .svg/.webp, any case). Falls back to an "R" mark if not found. */
const rcsLogoFiles = import.meta.glob("./assets/{Rcs,rcs,RCS}.{png,svg,webp,PNG}", { eager: true, import: "default" });
const RCS_LOGO = Object.values(rcsLogoFiles)[0] || null;

/* ---------- Small "create/edit" modals reused by Settings ---------- */



function Login({kind,onLogin,onSwitch}){
 const admin=kind==="admin"; const [email,setEmail]=useState(admin?"admin@tajtirupati.local":"jaya@example.com"); const [pw,setPw]=useState(""); const [showPassword,setShowPassword]=useState(false);
 return <div className="login-shell"><Brand className="login-brand"/><div className="login-card"><div className="eyebrow">{admin?"HOTEL ADMIN":"GUEST PORTAL"}</div><h1>{admin?"Welcome back.":"Access your stay."}</h1><p className="muted">{admin?"Manage Taj Tirupati from one simple workspace.":"View your reservation, stay details and requests."}</p><form onSubmit={e=>{e.preventDefault();onLogin(admin?"admin":"guest",email)}}><Field label={admin?"Admin email":"Guest email"}><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></Field><Field label="Password"><div className="password-field"><input type={showPassword?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)} required/><button type="button" className="password-eye" aria-label={showPassword?"Hide password":"Show password"} title={showPassword?"Hide password":"Show password"} onClick={()=>setShowPassword(v=>!v)}>{showPassword?"◉":"◌"}</button></div></Field>{!admin&&<Field label="Reservation ID"><input placeholder="e.g. R-1001"/></Field>}<div className="login-row"><label><input type="checkbox" defaultChecked/> Remember me</label><button className="link-button" type="button">Forgot password?</button></div><button className="primary wide">Sign in</button></form></div><button className="switch-login" onClick={()=>onSwitch(admin?"guest":"admin")}>{admin?"Guest Login →":"Admin Login →"}</button></div>
}

const RESERVATION_COUNTRIES = [
  ["India","IN","+91","🇮🇳"],["Afghanistan","AF","+93","🇦🇫"],["Albania","AL","+355","🇦🇱"],["Algeria","DZ","+213","🇩🇿"],["Andorra","AD","+376","🇦🇩"],["Angola","AO","+244","🇦🇴"],["Antigua and Barbuda","AG","+1","🇦🇬"],["Argentina","AR","+54","🇦🇷"],["Armenia","AM","+374","🇦🇲"],["Australia","AU","+61","🇦🇺"],["Austria","AT","+43","🇦🇹"],["Azerbaijan","AZ","+994","🇦🇿"],
  ["Bahamas","BS","+1","🇧🇸"],["Bahrain","BH","+973","🇧🇭"],["Bangladesh","BD","+880","🇧🇩"],["Barbados","BB","+1","🇧🇧"],["Belarus","BY","+375","🇧🇾"],["Belgium","BE","+32","🇧🇪"],["Belize","BZ","+501","🇧🇿"],["Benin","BJ","+229","🇧🇯"],["Bhutan","BT","+975","🇧🇹"],["Bolivia","BO","+591","🇧🇴"],["Bosnia and Herzegovina","BA","+387","🇧🇦"],["Botswana","BW","+267","🇧🇼"],["Brazil","BR","+55","🇧🇷"],["Brunei","BN","+673","🇧🇳"],["Bulgaria","BG","+359","🇧🇬"],["Burkina Faso","BF","+226","🇧🇫"],["Burundi","BI","+257","🇧🇮"],
  ["Cambodia","KH","+855","🇰🇭"],["Cameroon","CM","+237","🇨🇲"],["Canada","CA","+1","🇨🇦"],["Cape Verde","CV","+238","🇨🇻"],["Central African Republic","CF","+236","🇨🇫"],["Chad","TD","+235","🇹🇩"],["Chile","CL","+56","🇨🇱"],["China","CN","+86","🇨🇳"],["Colombia","CO","+57","🇨🇴"],["Comoros","KM","+269","🇰🇲"],["Congo","CG","+242","🇨🇬"],["Costa Rica","CR","+506","🇨🇷"],["Croatia","HR","+385","🇭🇷"],["Cuba","CU","+53","🇨🇺"],["Cyprus","CY","+357","🇨🇾"],["Czech Republic","CZ","+420","🇨🇿"],
  ["Denmark","DK","+45","🇩🇰"],["Djibouti","DJ","+253","🇩🇯"],["Dominica","DM","+1","🇩🇲"],["Dominican Republic","DO","+1","🇩🇴"],["Ecuador","EC","+593","🇪🇨"],["Egypt","EG","+20","🇪🇬"],["El Salvador","SV","+503","🇸🇻"],["Estonia","EE","+372","🇪🇪"],["Eswatini","SZ","+268","🇸🇿"],["Ethiopia","ET","+251","🇪🇹"],
  ["Fiji","FJ","+679","🇫🇯"],["Finland","FI","+358","🇫🇮"],["France","FR","+33","🇫🇷"],["Gabon","GA","+241","🇬🇦"],["Gambia","GM","+220","🇬🇲"],["Georgia","GE","+995","🇬🇪"],["Germany","DE","+49","🇩🇪"],["Ghana","GH","+233","🇬🇭"],["Greece","GR","+30","🇬🇷"],["Grenada","GD","+1","🇬🇩"],["Guatemala","GT","+502","🇬🇹"],["Guinea","GN","+224","🇬🇳"],["Guyana","GY","+592","🇬🇾"],
  ["Haiti","HT","+509","🇭🇹"],["Honduras","HN","+504","🇭🇳"],["Hong Kong","HK","+852","🇭🇰"],["Hungary","HU","+36","🇭🇺"],["Iceland","IS","+354","🇮🇸"],["Indonesia","ID","+62","🇮🇩"],["Iran","IR","+98","🇮🇷"],["Iraq","IQ","+964","🇮🇶"],["Ireland","IE","+353","🇮🇪"],["Israel","IL","+972","🇮🇱"],["Italy","IT","+39","🇮🇹"],["Jamaica","JM","+1","🇯🇲"],["Japan","JP","+81","🇯🇵"],["Jordan","JO","+962","🇯🇴"],
  ["Kazakhstan","KZ","+7","🇰🇿"],["Kenya","KE","+254","🇰🇪"],["Kiribati","KI","+686","🇰🇮"],["Kuwait","KW","+965","🇰🇼"],["Kyrgyzstan","KG","+996","🇰🇬"],["Laos","LA","+856","🇱🇦"],["Latvia","LV","+371","🇱🇻"],["Lebanon","LB","+961","🇱🇧"],["Lesotho","LS","+266","🇱🇸"],["Liberia","LR","+231","🇱🇷"],["Libya","LY","+218","🇱🇾"],["Liechtenstein","LI","+423","🇱🇮"],["Lithuania","LT","+370","🇱🇹"],["Luxembourg","LU","+352","🇱🇺"],
  ["Madagascar","MG","+261","🇲🇬"],["Malawi","MW","+265","🇲🇼"],["Malaysia","MY","+60","🇲🇾"],["Maldives","MV","+960","🇲🇻"],["Mali","ML","+223","🇲🇱"],["Malta","MT","+356","🇲🇹"],["Marshall Islands","MH","+692","🇲🇭"],["Mauritania","MR","+222","🇲🇷"],["Mauritius","MU","+230","🇲🇺"],["Mexico","MX","+52","🇲🇽"],["Micronesia","FM","+691","🇫🇲"],["Moldova","MD","+373","🇲🇩"],["Monaco","MC","+377","🇲🇨"],["Mongolia","MN","+976","🇲🇳"],["Montenegro","ME","+382","🇲🇪"],["Morocco","MA","+212","🇲🇦"],["Mozambique","MZ","+258","🇲🇿"],["Myanmar","MM","+95","🇲🇲"],
  ["Namibia","NA","+264","🇳🇦"],["Nauru","NR","+674","🇳🇷"],["Nepal","NP","+977","🇳🇵"],["Netherlands","NL","+31","🇳🇱"],["New Zealand","NZ","+64","🇳🇿"],["Nicaragua","NI","+505","🇳🇮"],["Niger","NE","+227","🇳🇪"],["Nigeria","NG","+234","🇳🇬"],["North Korea","KP","+850","🇰🇵"],["North Macedonia","MK","+389","🇲🇰"],["Norway","NO","+47","🇳🇴"],["Oman","OM","+968","🇴🇲"],["Pakistan","PK","+92","🇵🇰"],["Palau","PW","+680","🇵🇼"],["Palestine","PS","+970","🇵🇸"],["Panama","PA","+507","🇵🇦"],["Papua New Guinea","PG","+675","🇵🇬"],["Paraguay","PY","+595","🇵🇾"],["Peru","PE","+51","🇵🇪"],["Philippines","PH","+63","🇵🇭"],["Poland","PL","+48","🇵🇱"],["Portugal","PT","+351","🇵🇹"],
  ["Qatar","QA","+974","🇶🇦"],["Romania","RO","+40","🇷🇴"],["Russia","RU","+7","🇷🇺"],["Rwanda","RW","+250","🇷🇼"],["Saint Kitts and Nevis","KN","+1","🇰🇳"],["Saint Lucia","LC","+1","🇱🇨"],["Saint Vincent and the Grenadines","VC","+1","🇻🇨"],["Samoa","WS","+685","🇼🇸"],["San Marino","SM","+378","🇸🇲"],["Sao Tome and Principe","ST","+239","🇸🇹"],["Saudi Arabia","SA","+966","🇸🇦"],["Senegal","SN","+221","🇸🇳"],["Serbia","RS","+381","🇷🇸"],["Seychelles","SC","+248","🇸🇨"],["Sierra Leone","SL","+232","🇸🇱"],["Singapore","SG","+65","🇸🇬"],["Slovakia","SK","+421","🇸🇰"],["Slovenia","SI","+386","🇸🇮"],["Solomon Islands","SB","+677","🇸🇧"],["Somalia","SO","+252","🇸🇴"],["South Africa","ZA","+27","🇿🇦"],["South Korea","KR","+82","🇰🇷"],["South Sudan","SS","+211","🇸🇸"],["Spain","ES","+34","🇪🇸"],["Sri Lanka","LK","+94","🇱🇰"],["Sudan","SD","+249","🇸🇩"],["Suriname","SR","+597","🇸🇷"],["Sweden","SE","+46","🇸🇪"],["Switzerland","CH","+41","🇨🇭"],["Syria","SY","+963","🇸🇾"],
  ["Taiwan","TW","+886","🇹🇼"],["Tajikistan","TJ","+992","🇹🇯"],["Tanzania","TZ","+255","🇹🇿"],["Thailand","TH","+66","🇹🇭"],["Timor-Leste","TL","+670","🇹🇱"],["Togo","TG","+228","🇹🇬"],["Tonga","TO","+676","🇹🇴"],["Trinidad and Tobago","TT","+1","🇹🇹"],["Tunisia","TN","+216","🇹🇳"],["Turkey","TR","+90","🇹🇷"],["Turkmenistan","TM","+993","🇹🇲"],["Tuvalu","TV","+688","🇹🇻"],["Uganda","UG","+256","🇺🇬"],["Ukraine","UA","+380","🇺🇦"],["United Arab Emirates","AE","+971","🇦🇪"],["United Kingdom","GB","+44","🇬🇧"],["United States","US","+1","🇺🇸"],["Uruguay","UY","+598","🇺🇾"],["Uzbekistan","UZ","+998","🇺🇿"],["Vanuatu","VU","+678","🇻🇺"],["Vatican City","VA","+39","🇻🇦"],["Venezuela","VE","+58","🇻🇪"],["Vietnam","VN","+84","🇻🇳"],["Yemen","YE","+967","🇾🇪"],["Zambia","ZM","+260","🇿🇲"],["Zimbabwe","ZW","+263","🇿🇼"]
].map(([name,iso,code,flag])=>({name,iso,code,flag}));

function findReservationCountry(phone){
  const digits=String(phone||"").replace(/\D/g,"");
  if(!digits)return RESERVATION_COUNTRIES[0];
  return [...RESERVATION_COUNTRIES].sort((a,b)=>b.code.replace(/\D/g,"").length-a.code.replace(/\D/g,"").length).find(c=>digits.startsWith(c.code.replace(/\D/g,""))) || RESERVATION_COUNTRIES[0];
}

function ReservationEditor({data,onClose,onSave}){
 const [mode,setMode]=useState("new");
 const [kycUploading,setKycUploading]=useState(false);
 const [country,setCountry]=useState(RESERVATION_COUNTRIES[0]);
 const [countrySearch,setCountrySearch]=useState("");
 const [countryOpen,setCountryOpen]=useState(false);
 const [phoneLocal,setPhoneLocal]=useState("");
 const [f,setF]=useState({guestId:"",firstName:"",lastName:"",email:"",phone:"",nationality:"Indian",idType:"Aadhaar",idNumber:"",address:"",idAttachment:null,room:"101",arrival:offset(1),departure:offset(3),expectedIn:"14:00",expectedOut:"12:00",rate:3500,paid:0,source:"Direct",adults:1,children:0});
 const u=(k,v)=>setF(x=>({...x,[k]:v}));
 const setPhoneValue=(value)=>{
   const digits=String(value||"").replace(/\D/g,"").slice(0,country.code==="+91"?10:15);
   setPhoneLocal(digits);
   u("phone",`${country.code}${digits}`);
 };
 const selectCountry=(next)=>{
   setCountry(next);
   setCountryOpen(false);
   setCountrySearch("");
   const digits=phoneLocal.replace(/\D/g,"").slice(0,next.code==="+91"?10:15);
   setPhoneLocal(digits);
   u("phone",`${next.code}${digits}`);
 };
 const filteredCountries=RESERVATION_COUNTRIES.filter(c=>`${c.name} ${c.code} ${c.iso}`.toLowerCase().includes(countrySearch.toLowerCase()));
 const phoneValid=country.code==="+91" ? phoneLocal.length===10 : phoneLocal.length>=1&&phoneLocal.length<=15;
 const uploadKycAttachment=(file)=>{
   if(!file){u("idAttachment",null);return}
   const allowed=["application/pdf","image/jpeg","image/png"];
   if(!allowed.includes(file.type)){alert("Please upload a PDF, JPG or PNG file.");return}
   if(file.size>2*1024*1024){alert("KYC attachment must be 2 MB or smaller in this local version.");return}
   setKycUploading(true);
   const reader=new FileReader();
   reader.onload=()=>{u("idAttachment",{name:file.name,type:file.type,size:file.size,dataUrl:reader.result});setKycUploading(false)};
   reader.onerror=()=>{setKycUploading(false);alert("Unable to read the selected file. Please try again.")};
   reader.readAsDataURL(file);
 };
 const selected=data.guests.find(g=>g.id===f.guestId);
 useEffect(()=>{if(mode==="existing"&&selected){
   const guestPhone=String(selected.phone||"");
   const nextCountry=findReservationCountry(guestPhone);
   const allDigits=guestPhone.replace(/\D/g,"");
   const codeDigits=nextCountry.code.replace(/\D/g,"");
   const local=allDigits.startsWith(codeDigits)?allDigits.slice(codeDigits.length):allDigits;
   setCountry(nextCountry);
   setPhoneLocal(local.slice(0,nextCountry.code==="+91"?10:15));
   setF(x=>({...x,firstName:selected.name.split(" ")[0]||"",lastName:selected.name.split(" ").slice(1).join(" "),email:selected.email||"",phone:guestPhone,nationality:selected.nationality||"Indian",idType:selected.idType||"Aadhaar",idNumber:selected.idNumber||"",address:selected.address||"",idAttachment:selected.idAttachment||null}));
 }},[mode,f.guestId]);
 const submit=()=>{
   if(kycUploading){alert("Please wait for the KYC attachment to finish uploading.");return}
   if(!f.firstName.trim()||!f.lastName.trim()||!f.email.trim()||!phoneLocal||!f.room||!f.arrival||!f.departure){alert("Complete the guest and reservation details.");return}
   if(!phoneValid){alert(country.code==="+91"?"India mobile numbers must contain exactly 10 digits.":"Mobile number must contain between 1 and 15 digits for the selected country.");return}
   if(!f.idAttachment){alert(`Please upload the ${f.idType} KYC attachment before creating the reservation.`);return}
   onSave({...f,phone:`${country.code}${phoneLocal}`,guestMode:mode});
 };
 return <div className="modal-backdrop"><style>{`
   .reservation-modal{position:relative}
   .reservation-modal-close{width:34px;height:34px;min-width:34px;border:1px solid #d8e4f2;border-radius:9px;background:#f7faff;color:#52657c;display:grid;place-items:center;font:600 20px/1 "Poppins",sans-serif;cursor:pointer;transition:all .18s ease}
   .reservation-modal-close:hover{background:#eaf2ff;color:#1557d6;border-color:#bcd4ff}
   .reservation-phone-field{position:relative}
   .reservation-phone-control{position:relative;display:flex;align-items:stretch;width:100%;min-height:46px;border:1px solid #d7e1ee;border-radius:9px;background:#fff;overflow:visible}
   .reservation-phone-control:focus-within{border-color:#8bb4ed;box-shadow:0 0 0 3px rgba(37,99,235,.07)}
   .reservation-country-button{display:flex;align-items:center;gap:7px;width:148px;min-width:148px;height:44px;padding:0 10px;border:0;border-right:1px solid #dfe6ef;border-radius:8px 0 0 8px;background:#fbfcfe;color:#172b4d;cursor:pointer;font:500 12px/1 "Poppins",sans-serif;text-align:left}
   .reservation-country-button:hover{background:#f5f8fc}
   .reservation-country-flag-wrap{width:24px;height:18px;display:grid;place-items:center;flex:0 0 24px;overflow:hidden;border-radius:2px;background:#eef2f7}
   .reservation-country-flag-img{width:22px;height:15px;display:block;object-fit:cover;border-radius:2px}
   .reservation-country-flag-fallback{font-size:16px;line-height:1}
   .reservation-country-name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:62px;color:#263a57;font-weight:500}
   .reservation-country-code{margin-left:auto;font-weight:700;color:#173d72;white-space:nowrap}
   .reservation-country-chevron{margin-left:1px;color:#788ba4;font-size:12px;line-height:1}
   .reservation-phone-input{flex:1;min-width:0;height:44px;border:0!important;outline:0!important;box-shadow:none!important;border-radius:0 8px 8px 0!important;background:#fff!important;padding:0 13px!important;font:500 12.5px "Poppins",sans-serif!important;color:#17305f!important}
   .reservation-phone-input::placeholder{color:#8190a5;opacity:1}
   .reservation-country-menu{position:absolute;z-index:100;top:calc(100% + 6px);left:0;width:315px;max-height:300px;overflow:auto;border:1px solid #d8e3ef;border-radius:9px;background:#fff;box-shadow:0 12px 28px rgba(25,53,92,.14);padding:6px}
   .reservation-country-search{width:100%;height:38px;border:1px solid #b9cce3;border-radius:7px;padding:0 11px;outline:0;font:500 12px "Poppins",sans-serif;color:#17305f;margin-bottom:5px}
   .reservation-country-search:focus{border-color:#78a8e8;box-shadow:0 0 0 2px rgba(37,99,235,.08)}
   .reservation-country-option{display:flex;align-items:center;gap:9px;width:100%;min-height:36px;padding:6px 8px;border:0;border-radius:6px;background:#fff;color:#17305f;text-align:left;cursor:pointer;font:500 11.5px "Poppins",sans-serif}
   .reservation-country-option:hover,.reservation-country-option.active{background:#f2f7ff}
   .reservation-country-option .country-name{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
   .reservation-country-option .country-code{font-weight:700;color:#5c7392}
   .reservation-country-empty{padding:12px 8px;color:#7b8ca5;font-size:11px}
   .reservation-phone-help{margin-top:5px;font-size:10px;color:#7a8ba1}
   .reservation-phone-error{color:#c44848}
   .kyc-upload-field{grid-column:1/-1}
   .kyc-upload-label{display:flex;align-items:center;gap:12px;min-height:66px;padding:12px 14px;border:1px dashed #bcd4ff;border-radius:10px;background:#f8fbff;color:#1a3157;cursor:pointer}
   .kyc-upload-label:hover{background:#f1f7ff;border-color:#79a9f5}
   .kyc-upload-box > input[type="file"]{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
   .kyc-upload-icon{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;background:#eaf3ff;color:#1557d6;font-size:20px;font-weight:700}
   .kyc-upload-label span:nth-child(2){display:flex;flex-direction:column;gap:3px}
   .kyc-upload-label strong{font-size:12px}
   .kyc-upload-label small{font-size:10px;color:#71829a}
   .required-mark{color:#d84b4b}
   .kyc-upload-box.has-file .kyc-upload-label{border-style:solid;background:#f6fbff}
   .kyc-file-row{display:flex;align-items:center;gap:8px;margin-top:8px;padding:8px 10px;border:1px solid #e0e9f4;border-radius:8px;background:#fff}
   .kyc-file-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:600;color:#263c5d}
   .kyc-file-size{font-size:10px;color:#7a8ba1;white-space:nowrap}
   .kyc-remove{border:0;background:transparent;color:#c44848;font:600 10px "Poppins",sans-serif;cursor:pointer}
   .kyc-remove:hover{text-decoration:underline}
 `}</style><section className="modal card reservation-modal"><div className="modal-head"><div><div className="eyebrow">NEW RESERVATION</div><h2>Create reservation</h2><p className="muted small">Capture the complete guest profile before confirming the stay.</p></div><button type="button" className="reservation-modal-close" onClick={onClose} aria-label="Close reservation form" title="Close">×</button></div>
   <div className="reservation-step"><button className={mode==="existing"?"subtle active-choice":"subtle"} type="button" onClick={()=>setMode("existing")}>Existing guest</button><button className={mode==="new"?"subtle active-choice":"subtle"} type="button" onClick={()=>setMode("new")}>New guest</button></div>
   {mode==="existing"&&<div className="form-grid"><Field label="Existing guest"><select value={f.guestId} onChange={e=>u("guestId",e.target.value)}><option value="">Select guest</option>{data.guests.map(g=><option key={g.id} value={g.id}>{g.name} · {g.phone}</option>)}</select></Field></div>}
   <div className="settings-section-label reservation-section-label">Guest details</div><div className="form-grid"><Field label="First name *"><input value={f.firstName} onChange={e=>u("firstName",e.target.value)} placeholder="First name"/></Field><Field label="Last name *"><input value={f.lastName} onChange={e=>u("lastName",e.target.value)} placeholder="Last name"/></Field><Field label="Email *"><input type="email" value={f.email} onChange={e=>u("email",e.target.value)} placeholder="guest@example.com"/></Field><div className="field reservation-phone-field"><label className="field-label">Mobile number <span className="required-mark">*</span></label><div className="reservation-phone-control"><button type="button" className="reservation-country-button" onClick={()=>setCountryOpen(v=>!v)} aria-label="Select country"><span className="reservation-country-flag-wrap"><img className="reservation-country-flag-img" src={`https://flagcdn.com/w40/${country.iso.toLowerCase()}.png`} alt="" onError={e=>{e.currentTarget.style.display="none";e.currentTarget.nextElementSibling.style.display="inline"}}/><span className="reservation-country-flag-fallback" style={{display:"none"}}>{country.flag}</span></span><span className="reservation-country-name">{country.name}</span><span className="reservation-country-code">{country.code}</span><span className="reservation-country-chevron">⌄</span></button><input className="reservation-phone-input" inputMode="numeric" autoComplete="tel-national" value={phoneLocal} onChange={e=>setPhoneValue(e.target.value)} placeholder={country.code==="+91"?"10 digit mobile number":"Mobile number"} maxLength={country.code==="+91"?10:15}/></div>{countryOpen&&<div className="reservation-country-menu"><input autoFocus className="reservation-country-search" value={countrySearch} onChange={e=>setCountrySearch(e.target.value)} placeholder="Search country..."/>{filteredCountries.length?filteredCountries.map(c=><button type="button" key={`${c.iso}-${c.code}`} className={`reservation-country-option${country.iso===c.iso?" active":""}`} onClick={()=>selectCountry(c)}><span className="reservation-country-flag-wrap"><img className="reservation-country-flag-img" src={`https://flagcdn.com/w40/${c.iso.toLowerCase()}.png`} alt="" onError={e=>{e.currentTarget.style.display="none";e.currentTarget.nextElementSibling.style.display="inline"}}/><span className="reservation-country-flag-fallback" style={{display:"none"}}>{c.flag}</span></span><span className="country-name">{c.name}</span><span className="country-code">{c.code}</span></button>):<div className="reservation-country-empty">No country found.</div>}</div>}{phoneLocal&&!phoneValid&&<div className="reservation-phone-help reservation-phone-error">Please enter a valid mobile number.</div>}</div><Field label="Nationality"><input value={f.nationality} onChange={e=>u("nationality",e.target.value)}/></Field><Field label="ID type"><select value={f.idType} onChange={e=>u("idType",e.target.value)}><option>Aadhaar</option><option>Passport</option><option>Driving Licence</option><option>Voter ID</option><option>Other</option></select></Field><Field label="ID number"><input value={f.idNumber} onChange={e=>u("idNumber",e.target.value)} placeholder="Government ID number"/></Field><Field label="Address"><input value={f.address} onChange={e=>u("address",e.target.value)} placeholder="Address"/></Field><div className="kyc-upload-field"><label className="field-label">{f.idType} attachment <span className="required-mark">*</span></label><div className={`kyc-upload-box${f.idAttachment?" has-file":""}`}><input id="kyc-attachment-input" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={e=>uploadKycAttachment(e.target.files?.[0])}/><label htmlFor="kyc-attachment-input" className="kyc-upload-label"><span className="kyc-upload-icon">↑</span><span><strong>{kycUploading ? "Uploading…" : f.idAttachment ? "Replace attachment" : `Upload ${f.idType} document`}</strong><small>PDF, JPG or PNG · Max 2 MB</small></span></label>{f.idAttachment&&<div className="kyc-file-row"><span className="kyc-file-name" title={f.idAttachment.name}>{f.idAttachment.name}</span><span className="kyc-file-size">{(f.idAttachment.size/1024/1024).toFixed(2)} MB</span><button type="button" className="kyc-remove" onClick={()=>u("idAttachment",null)}>Remove</button></div>}</div></div><Field label="Adults"><input type="number" min="1" value={f.adults} onChange={e=>u("adults",e.target.value)}/></Field><Field label="Children"><input type="number" min="0" value={f.children} onChange={e=>u("children",e.target.value)}/></Field></div>
   <div className="settings-section-label reservation-section-label">Stay details</div><div className="form-grid"><Field label="Room *"><select value={f.room} onChange={e=>u("room",e.target.value)}>{(data.rooms||[]).map(r=><option key={r.number}>{r.number}</option>)}</select></Field><Field label="Booking source"><select value={f.source} onChange={e=>u("source",e.target.value)}><option>Direct</option><option>OTA</option><option>Corporate</option><option>Travel Agent</option></select></Field><Field label="Check-in date *"><input type="date" value={f.arrival} onChange={e=>u("arrival",e.target.value)}/></Field><Field label="Check-in time"><input type="time" value={f.expectedIn} onChange={e=>u("expectedIn",e.target.value)}/></Field><Field label="Check-out date *"><input type="date" value={f.departure} onChange={e=>u("departure",e.target.value)}/></Field><Field label="Check-out time"><input type="time" value={f.expectedOut} onChange={e=>u("expectedOut",e.target.value)}/></Field><Field label="Nightly rate"><input type="number" min="0" value={f.rate} onChange={e=>u("rate",e.target.value)}/></Field><Field label="Advance paid"><input type="number" min="0" value={f.paid} onChange={e=>u("paid",e.target.value)}/></Field></div>
   <div className="modal-actions"><button type="button" className="subtle" onClick={onClose}>Cancel</button><button type="button" className="primary" onClick={submit}>Create Reservation</button></div>
 </section></div>
}


function GuestProfile({g,data,onClose,onCall}){
 const stays=data.reservations.filter(r=>r.guestId===g.id);
 const calls=(data.callActivities||[]).filter(c=>c.guestId===g.id).sort((a,b)=>new Date(b.startedAt)-new Date(a.startedAt));
 const current=stays.find(r=>r.status==="Checked In");
 const status=current?"Checked In":stays.some(r=>["Confirmed","Upcoming"].includes(r.status))?"Upcoming":"Checked Out";
 return <div className="modal-backdrop"><section className="modal card guest-profile-modal"><div className="modal-head"><div className="guest-cell"><span className="avatar large-avatar">{initials(g.name)}</span><div><div className="eyebrow">GUEST PROFILE</div><h2>{g.name}</h2><small className="muted">{g.email} · {g.phone}</small></div></div><div className="modal-head-actions"><button className="call-button" onClick={()=>onCall(g)}>☎ Call</button><button className="icon-button" onClick={onClose}>×</button></div></div><div className="profile-summary"><div><span>Guest ID</span><strong>{g.id}</strong></div><div><span>Stays</span><strong>{stays.length}</strong></div><div><span>Current status</span><strong>{status}</strong></div></div><h3>Stay history</h3>{stays.map(r=><div className="history-row" key={r.id}><div><strong>{r.id} · Room {r.room}</strong><small>Expected {date(r.arrival)} → {date(r.departure)}</small></div><div>{r.actualCheckIn&&<small>Check-in: {fmt(r.actualCheckIn)}</small>}{r.actualCheckOut&&<small>Check-out: {fmt(r.actualCheckOut)}</small>}</div><Badge>{r.status}</Badge></div>)}<div className="profile-section-divider"><div className="section-title compact-title"><div><div className="eyebrow">TELEPHONY</div><h3>Communication history</h3></div><button className="text-button" onClick={()=>onCall(g)}>Call guest →</button></div>{calls.length?calls.slice(0,5).map(c=><div className="call-history-row" key={c.id}><span className="call-history-icon">☎</span><div><strong>{c.direction} call · {fmt(c.startedAt)}</strong><small>{c.durationLabel} · {c.outcome || c.status} · Agent {c.agentName}</small></div><span className="call-id">{c.callId}</span></div>):<div className="empty-call-history">No calls recorded for this guest yet.</div>}</div></section></div>
}

class CallErrorBoundary extends Component{
 constructor(props){super(props);this.state={error:null}}
 static getDerivedStateFromError(error){return {error}}
 componentDidCatch(error,info){console.error("Friday AI - Desk: CallPopup crashed while rendering:",error,info)}
 render(){
  if(this.state.error){
   return <div className="call-widget call-widget--error">
    <b>Call widget failed to render</b>
    <small>{String(this.state.error?.message||this.state.error)}</small>
    <button type="button" className="subtle" onClick={()=>{this.setState({error:null});this.props.onClose?.()}}>Close</button>
   </div>;
  }
  return this.props.children;
 }
}
/* TeleCMI/JsSIP errors can arrive as plain strings, Error objects, or SIP
   response-like objects ({cause, status_code, reason_phrase}). Pull out
   whatever readable text is actually available so the widget can show a
   real reason instead of a generic "could not start" message. */
function describeCallError(error){
  if(!error)return "Unknown error";
  if(typeof error==="string")return error;
  if(error.cause)return String(error.cause);
  if(error.reason_phrase)return `${error.status_code?error.status_code+" ":""}${error.reason_phrase}`;
  if(error.message)return error.message;
  try{return JSON.stringify(error)}catch{return String(error)}
}

const CallIconW=({d,fill="currentColor",stroke,sw=1.6,size=18})=>
  <svg
    viewBox="0 0 20 20"
    width={size}
    height={size}
    fill={stroke?"none":fill}
    stroke={stroke}
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={d}/>
  </svg>;

const CALL_ICONS={
  hangup:"M6.6 10.8c1.4 1.4 3 2.5 4.9 3.3l1.6-1.6c.2-.2.5-.3.8-.2 1 .3 2 .5 3.1.5.6 0 1 .4 1 1v2.7c0 .6-.4 1-1 1C9.5 17.5 2.5 10.5 2.5 2c0-.6.4-1 1-1h2.7c.6 0 1 .4 1 1 0 1.1.2 2.1.5 3.1.1.3 0 .6-.2.8L6.6 10.8z",
  transfer:"M12 4l5 5-5 5M17 9H3"
};

const CALL_DIALPAD_KEYS=[
  ["1",""],
  ["2","ABC"],
  ["3","DEF"],
  ["4","GHI"],
  ["5","JKL"],
  ["6","MNO"],
  ["7","PQRS"],
  ["8","TUV"],
  ["9","WXYZ"],
  ["*",""],
  ["0","+"],
  ["#",""]
];

/* Shared mid-call control row (Hold / Mute / Record / Transfer / Dial pad) used by
   both the outgoing (CallPopup) and incoming (IncomingCallPopup) call widgets, so
   both have identical in-call functions. */
function CallControlsRow({held,onToggleHold,muted,onToggleMute,recording,onToggleRecording,showTransfer,onToggleTransfer,showDialpad,onToggleDialpad}){
  return <div className="call-widget-controls">
    <button
      type="button"
      className={held?"call-widget-btn active":"call-widget-btn"}
      onClick={onToggleHold}
      title={held?"Resume call":"Hold call"}
      aria-label={held?"Resume call":"Hold call"}
    >
      {held
        ? <CallIconW d="M7 5l8 5-8 5V5z" fill="currentColor" size={19}/>
        : <CallIconW d="M6 4v12M14 4v12" stroke="currentColor" sw={2} size={19}/>}
    </button>

    <button
      type="button"
      className={muted?"call-widget-btn active":"call-widget-btn"}
      onClick={onToggleMute}
      title={muted?"Unmute":"Mute"}
      aria-label={muted?"Unmute":"Mute"}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="2" width="6" height="12" rx="3"/>
        <path d="M5 10a7 7 0 0 0 14 0"/>
        <path d="M12 19v3M8 22h8"/>
        {muted&&<path d="M4 4l16 16" strokeWidth="2"/>}
      </svg>
    </button>

    <button
      type="button"
      className={recording?"call-widget-btn active call-widget-btn--rec":"call-widget-btn"}
      onClick={onToggleRecording}
      title={recording?"Stop recording":"Call recording"}
      aria-label={recording?"Stop recording":"Call recording"}
    >
      <span className="call-widget-record-icon">
        <span/>
      </span>
    </button>

    <button
      type="button"
      className={showTransfer?"call-widget-btn active":"call-widget-btn"}
      onClick={onToggleTransfer}
      title="Transfer"
      aria-label="Transfer"
    >
      <CallIconW d={CALL_ICONS.transfer} stroke="currentColor" size={20}/>
    </button>

    <button
      type="button"
      className={showDialpad?"call-widget-btn active":"call-widget-btn"}
      onClick={onToggleDialpad}
      title="Dialpad"
      aria-label="Dialpad"
    >
      <svg viewBox="0 0 24 24" width="21" height="21" fill="currentColor" aria-hidden="true">
        {[5,12,19].flatMap(cy=>[5,12,19].map(cx=>
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.7"/>
        ))}
      </svg>
    </button>
  </div>;
}

function CallDialpadPanel({dtmfSent,onPress}){
  return <div className="call-widget-dialpad">
    <div className="call-widget-dtmf-out">{dtmfSent}</div>
    <div className="call-widget-dialgrid">
      {CALL_DIALPAD_KEYS.map(([digit,letters])=>
        <button
          type="button"
          key={digit}
          onClick={()=>onPress(digit)}
          aria-label={`Dial ${digit}`}
        >
          <strong>{digit}</strong>
          {letters&&<small>{letters}</small>}
        </button>
      )}
    </div>
  </div>;
}

function CallTransferPanel({transferTarget,onChangeTarget,onConfirm,transferNote}){
  return <div className="call-widget-transfer">
    <input
      placeholder="Extension or phone number"
      value={transferTarget}
      onChange={e=>onChangeTarget(e.target.value)}
    />
    <button type="button" className="primary" onClick={onConfirm}>
      Transfer
    </button>
    {transferNote&&<small>{transferNote}</small>}
  </div>;
}

function IncomingCallPopup({call,guest,onClose,onSave}){
  const [status,setStatus]=useState("ringing");
  const [answeredAt,setAnsweredAt]=useState(null);
  const [endedAt,setEndedAt]=useState(null);
  const [mediaReady,setMediaReady]=useState(false);
  const [seconds,setSeconds]=useState(0);
  const [notes,setNotes]=useState("");
  const [saving,setSaving]=useState(false);
  const [muted,setMuted]=useState(false);
  const [held,setHeld]=useState(false);
  const [recording,setRecording]=useState(false);
  const [showDialpad,setShowDialpad]=useState(false);
  const [dtmfSent,setDtmfSent]=useState("");
  const [showTransfer,setShowTransfer]=useState(false);
  const [transferTarget,setTransferTarget]=useState("");
  const [transferNote,setTransferNote]=useState("");

  const toggleMute=()=>{
    try{
      if(muted)piopiy.unMute();
      else piopiy.mute();
      setMuted(v=>!v);
    }catch(error){
      console.error("TeleCMI mute/unmute failed",error);
    }
  };

  const toggleHold=()=>{
    try{
      if(held)piopiy.unHold();
      else piopiy.hold();
      setHeld(v=>!v);
    }catch(error){
      console.error("TeleCMI hold/unhold failed",error);
    }
  };

  const toggleRecording=()=>setRecording(v=>!v);

  const pressDigit=(d)=>{
    try{
      piopiy.sendDtmf(d);
      setDtmfSent(s=>(s+d).slice(-16));
    }catch(error){
      console.error("TeleCMI sendDtmf failed",error);
    }
  };

  const confirmTransfer=()=>{
    if(!transferTarget.trim())return;
    try{
      piopiy.transfer(transferTarget.trim());
      setTransferNote(`Transferring to ${transferTarget.trim()}…`);
    }catch(error){
      console.error("TeleCMI transfer failed",error);
      setTransferNote("Transfer failed. Check the extension/number and try again.");
    }
  };

  const caller = guest || {
    id:null,
    name:call?.name || "Unknown caller",
    phone:call?.from || "Unknown number"
  };

  useEffect(()=>{
    activeTeleCMICall={setStatus,setAnsweredAt,setEndedAt,setMediaReady};
    teleCMICallStartedAt=new Date();
    return()=>{ if(activeTeleCMICall?.setStatus===setStatus) activeTeleCMICall=null; };
  },[]);

  useEffect(()=>{
    if(status!=="connected" || held) return;
    const t=setInterval(()=>setSeconds(x=>x+1),1000);
    return()=>clearInterval(t);
  },[status,held]);

  const mm=String(Math.floor(seconds/60)).padStart(2,"0");
  const ss=String(seconds%60).padStart(2,"0");

  const answer=()=>{
    try{
      console.log("Friday AI - Desk: Answering incoming TeleCMI call");
      piopiy.answer();
    }catch(error){
      console.error("TeleCMI answer failed",error);
      setStatus("error");
    }
  };

  const reject=()=>{
    try{
      console.log("Friday AI - Desk: Rejecting incoming TeleCMI call");
      piopiy.reject();
    }catch(error){
      console.error("TeleCMI reject failed",error);
    }
    setStatus("ended");
    setEndedAt(new Date());
  };

  const save=()=>{
    if(saving)return;
    setSaving(true);
    const realCallId = call?.call_id || piopiy.getCallId?.() || "";
    onSave?.({
      id:`CALL-${Date.now()}`,
      callId:realCallId,
      guestId:caller.id || null,
      guestName:caller.name,
      phone:caller.phone,
      direction:"Incoming",
      status:"Completed",
      startedAt:teleCMICallStartedAt ? stamp(teleCMICallStartedAt) : stamp(),
      answeredAt:answeredAt ? stamp(answeredAt) : null,
      endedAt:endedAt ? stamp(endedAt) : stamp(),
      durationSeconds:seconds,
      recording,
      notes
    });
    setSaving(false);
    onClose?.();
  };

  if(status==="error"){
    return <div className="call-widget call-widget--incoming call-widget--error" role="alert">
      <div className="call-widget-incoming-head"><span className="call-widget-incoming-dot call-widget-incoming-dot--error"/><div><b>Incoming call error</b><span>TeleCMI could not answer the call.</span></div></div>
      <button type="button" className="call-widget-ended-close" onClick={onClose}>Close</button>
    </div>;
  }

  if(status==="ended"){
    return <div className="call-widget call-widget--incoming call-widget--ended" role="dialog" aria-label="Incoming call ended">
      <div className="call-widget-incoming-head"><span className="call-widget-incoming-dot"/><div><b>Call ended</b><span>{caller.name} · {caller.phone}</span></div></div>
      <div className="call-widget-ended-actions">
        <button type="button" className="call-widget-ended-close" onClick={onClose}>Close</button>
        <button type="button" className="call-widget-ended-save" onClick={save} disabled={saving}>{saving?"Saving…":"Save Call Activity"}</button>
      </div>
    </div>;
  }

  return <div className={`call-widget call-widget--incoming ${status==="connected"?"call-widget--incoming-connected":""} ${showDialpad&&status==="connected"?"call-widget--dialpad-open":""}`} role="dialog" aria-label={`Incoming call from ${caller.name}`}>
    <div className="call-widget-incoming-head">
      <span className="call-widget-incoming-dot"/>
      <div><b>{status==="connected"?(held?"On Hold":"Connected"):"Incoming call"}</b><span>{status==="connected" ? `${mm}:${ss}${mediaReady?" · Audio ready":""}` : "TeleCMI Browser · Ringing"}</span></div>
      {status==="connected" && <button type="button" className="call-widget-close" onClick={onClose} title="Minimize call">×</button>}
    </div>

    <div className="call-widget-incoming-person">
      <span className="call-widget-avatar">{initials(caller.name || "?")}</span>
      <div><strong>{caller.name}</strong><span>{caller.phone}</span>{caller.id&&<small>Guest · {caller.id}</small>}</div>
    </div>

    {status==="ringing" ? <div className="call-widget-incoming-actions">
      <button type="button" className="call-incoming-reject" onClick={reject}>Reject</button>
      <button type="button" className="call-incoming-answer" onClick={answer}>Answer</button>
    </div> : <>
      <CallControlsRow
        held={held} onToggleHold={toggleHold}
        muted={muted} onToggleMute={toggleMute}
        recording={recording} onToggleRecording={toggleRecording}
        showTransfer={showTransfer} onToggleTransfer={()=>{setShowTransfer(v=>!v);setShowDialpad(false)}}
        showDialpad={showDialpad} onToggleDialpad={()=>{setShowDialpad(v=>!v);setShowTransfer(false)}}
      />

      {showDialpad && <CallDialpadPanel dtmfSent={dtmfSent} onPress={pressDigit}/>}
      {showTransfer && <CallTransferPanel transferTarget={transferTarget} onChangeTarget={setTransferTarget} onConfirm={confirmTransfer} transferNote={transferNote}/>}

      <div className="call-widget-incoming-connected-actions">
        <Field label="Call notes"><textarea rows="2" placeholder="Add notes from the conversation…" value={notes} onChange={e=>setNotes(e.target.value)}/></Field>
        <button type="button" className="call-widget-hangup call-widget-incoming-end" onClick={()=>{try{piopiy.terminate()}catch{};setStatus("ended");setEndedAt(new Date())}} title="End call"><span className="call-widget-hangup-icon"><CallIconW d={CALL_ICONS.hangup} fill="#fff" size={21}/></span></button>
      </div>
    </>}
  </div>;
}

function CallPopup({guest,onClose,onSave,telecmi}){
  console.log("Friday AI - Desk: CallPopup mounting for", guest?.name, guest?.phone);

  const [status,setStatus]=useState("trying");
  const [seconds,setSeconds]=useState(0);
  const [muted,setMuted]=useState(false);
  const [held,setHeld]=useState(false);
  const [notes,setNotes]=useState("");
  const [finished,setFinished]=useState(false);
  const [answeredAt,setAnsweredAt]=useState(null);
  const [endedAt,setEndedAt]=useState(null);
  const [recording,setRecording]=useState(false);
  const [showDialpad,setShowDialpad]=useState(false);
  const [dtmfSent,setDtmfSent]=useState("");
  const [showTransfer,setShowTransfer]=useState(false);
  const [transferTarget,setTransferTarget]=useState("");
  const [transferNote,setTransferNote]=useState("");
  const [errorMessage,setErrorMessage]=useState("");

  useEffect(()=>{
    if(status!=="connected" || held)return;
    const t=setInterval(()=>setSeconds(x=>x+1),1000);
    return()=>clearInterval(t);
  },[status,held]);

  useEffect(()=>{
    activeTeleCMICall={
      setStatus,
      setAnsweredAt,
      setEndedAt,
      setFinished,
      setErrorMessage
    };
    console.log("Friday AI - Desk: Outgoing CallPopup is now persistent.");

    teleCMICallStartedAt=new Date();

    console.log("Friday AI - Desk: Starting real TeleCMI call to",guest.phone);

    const startCall=()=>{
      try{
        if(!piopiy.isLogedIn()){
          console.log("Friday AI - Desk: Not logged in to TeleCMI yet — retrying login before starting call...");
          piopiy.once("login",()=>{
            console.log("Friday AI - Desk: TeleCMI login completed, starting call...");
            piopiy.call(guest.phone.replace(/\D/g,""));
          });
          piopiy.once("loginFailed",(error)=>{
            console.error("Friday AI - Desk: TeleCMI login failed",error);
            setErrorMessage(`Login failed: ${describeCallError(error)}`);
            setStatus("error");
            // Keep the CallPopup visible. Do not auto-close it.
          });
          loginToTeleCMI().catch((error)=>{
            console.error("Friday AI - Desk: TeleCMI retry login failed",error);
            setErrorMessage(`Login failed: ${describeCallError(error)}`);
            setStatus("error");
            // Keep the CallPopup visible. Do not auto-close it.
          });
          return;
        }

        console.log("Friday AI - Desk: TeleCMI already logged in, starting call...");
        piopiy.call(guest.phone.replace(/\D/g,""));
      }catch(error){
        console.error("TeleCMI call failed to start",error);
        setErrorMessage(describeCallError(error));
        setStatus("error");
        // Keep the CallPopup visible so the error can be diagnosed.
      }
    };

    startCall();

    return()=>{
      activeTeleCMICall=null;
    };
  },[guest.phone]);

  const mm=String(Math.floor(seconds/60)).padStart(2,"0");
  const ss=String(seconds%60).padStart(2,"0");

  const end=()=>{
    try{
      piopiy.terminate();
    }catch(error){
      console.error("TeleCMI terminate failed",error);
    }

    setStatus("ended");
    setEndedAt(new Date());
  };

  const toggleMute=()=>{
    try{
      if(muted)piopiy.unMute();
      else piopiy.mute();
      setMuted(v=>!v);
    }catch(error){
      console.error("TeleCMI mute/unmute failed",error);
    }
  };

  const toggleHold=()=>{
    try{
      if(held)piopiy.unHold();
      else piopiy.hold();
      setHeld(v=>!v);
    }catch(error){
      console.error("TeleCMI hold/unhold failed",error);
    }
  };

  const toggleRecording=()=>{
    /*
      Keep this state as the UI control for now.
      Actual recording is controlled by the TeleCMI
      account/recording configuration.
    */
    setRecording(v=>!v);
  };

  const pressDigit=(d)=>{
    try{
      piopiy.sendDtmf(d);
      setDtmfSent(s=>(s+d).slice(-16));
    }catch(error){
      console.error("TeleCMI sendDtmf failed",error);
    }
  };

  const confirmTransfer=()=>{
    if(!transferTarget.trim())return;

    try{
      piopiy.transfer(transferTarget.trim());
      setTransferNote(`Transferring to ${transferTarget.trim()}…`);
    }catch(error){
      console.error("TeleCMI transfer failed",error);
      setTransferNote("Transfer failed. Check the extension/number and try again.");
    }
  };

  const countryCode=(guest.phone.match(/^\+?(\d{1,3})/)||[])[1]||"";

  const save=()=>{
    onSave({
      id:uid("C"),
      guestId:guest.id,
      reservationId:null,
      stayId:null,
      callId:`TC-${Date.now()}`,
      direction:"Outgoing",
      status:"Completed",
      startedAt:new Date(Date.now()-seconds*1000).toISOString(),
      answeredAt:answeredAt?.toISOString()||null,
      endedAt:endedAt?.toISOString()||stamp(),
      duration:seconds,
      durationLabel:`${mm}:${ss}`,
      outcome:"Guest conversation",
      notes,
      recorded:recording,
      agentName:"Ratan Tata",
      agentExtension:1001
    });

    onClose();
  };

  if(finished){
    return <div className="call-overlay call-overlay--summary">
      <section className="call-popup call-finished">
        <div className="call-top">
          <div>
            <span className="call-kicker">CALL COMPLETED</span>
            <h2>Call summary</h2>
          </div>
          <button className="icon-button dark-icon" onClick={onClose}>×</button>
        </div>

        <div className="call-summary-grid">
          <div><span>Direction</span><b>Outgoing</b></div>
          <div><span>Duration</span><b>{mm}:{ss}</b></div>
          <div><span>Agent</span><b>Ratan Tata · 1001</b></div>
          <div><span>Recorded</span><b>{recording?"Yes":"No"}</b></div>
        </div>

        <Field label="Call notes">
          <textarea
            rows="3"
            placeholder="Add notes from the conversation…"
            value={notes}
            onChange={e=>setNotes(e.target.value)}
          />
        </Field>

        <div className="modal-actions">
          <button className="subtle" onClick={onClose}>Discard</button>
          <button className="primary" onClick={save}>Save Call Activity</button>
        </div>
      </section>
    </div>;
  }

  if(status==="ended" || status==="error"){
    const isError=status==="error";

    return <div className={`call-widget call-widget--ended ${isError?"call-widget--error-state":""}`} role="dialog" aria-label={`Call ${isError?"error":"ended"} with ${guest.name}`}>
      <div className="call-widget-idrow">
        <span className="call-widget-pill">
          <span className="call-widget-flag">🇮🇳</span>
          +{guest.phone.replace(/\D/g,"")}
        </span>
        <span className="call-widget-pill call-widget-pill--name">
          {guest.name.replace(/\s+/g,"")}
        </span>
      </div>

      <div className="call-widget-main">
        <span className="call-widget-avatar">{countryCode||initials(guest.name)}</span>

        <div className="call-widget-info">
          <b>{guest.phone.replace(/\D/g,"")}</b>
          <span>{isError ? "Call could not start" : "Call ended"}</span>
        </div>

        <button
          type="button"
          className="call-widget-hangup"
          onClick={onClose}
          title="Close call"
          aria-label="Close call"
        >
          <span className="call-widget-hangup-icon">
            <svg viewBox="0 0 20 20" width="21" height="21" fill="#fff" aria-hidden="true">
              <path d="M6.6 10.8c1.4 1.4 3 2.5 4.9 3.3l1.6-1.6c.2-.2.5-.3.8-.2 1 .3 2 .5 3.1.5.6 0 1 .4 1 1v2.7c0 .6-.4 1-1 1C9.5 17.5 2.5 10.5 2.5 2c0-.6.4-1 1-1h2.7c.6 0 1 .4 1 1 0 1.1.2 2.1.5 3.1.1.3 0 .6-.2.8L6.6 10.8z"/>
            </svg>
          </span>
        </button>
      </div>

      {isError && <div className="call-widget-error-detail"><b>Reason:</b> {errorMessage||"No further detail was reported by TeleCMI."}</div>}

      <div className="call-widget-ended-actions">
        <button type="button" className="call-widget-ended-close" onClick={onClose}>Close</button>
        <button type="button" className="call-widget-ended-save" onClick={save}>Save Call Activity</button>
      </div>
    </div>;
  }

  const connected=status==="connected";

  return <div
    className={`call-widget ${showDialpad&&connected?"call-widget--dialpad-open":""}`}
    role="dialog"
    aria-label={`Call with ${guest.name}`}
  >
    <div className="call-widget-idrow">
      <span className="call-widget-pill">
        <span className="call-widget-flag">🇮🇳</span>
        +{guest.phone.replace(/\D/g,"")}
      </span>

      <span className="call-widget-pill call-widget-pill--name">
        {guest.name.replace(/\s+/g,"")}
      </span>
    </div>

    <div className="call-widget-main">
      <span className="call-widget-avatar">
        {countryCode||initials(guest.name)}
      </span>

      <div className="call-widget-info">
        <b>{guest.phone.replace(/\D/g,"")}</b>
        <span>
          {connected
            ? (held ? "On Hold" : `${mm}:${ss}`)
            : status==="ringing"
              ? "Ringing…"
              : status==="ended"
                ? "Call ended"
                : "Calling…"}
        </span>
      </div>

      <button
        type="button"
        className="call-widget-hangup"
        onClick={end}
        title="End call"
        aria-label="End call"
      >
        <span className="call-widget-hangup-icon">
          <CallIconW d={CALL_ICONS.hangup} fill="#fff" size={21}/>
        </span>
      </button>
    </div>

    {connected&&showDialpad&&<CallDialpadPanel dtmfSent={dtmfSent} onPress={pressDigit}/>}

    {connected&&showTransfer&&<CallTransferPanel transferTarget={transferTarget} onChangeTarget={setTransferTarget} onConfirm={confirmTransfer} transferNote={transferNote}/>}

    {connected&&
      <CallControlsRow
        held={held} onToggleHold={toggleHold}
        muted={muted} onToggleMute={toggleMute}
        recording={recording} onToggleRecording={toggleRecording}
        showTransfer={showTransfer} onToggleTransfer={()=>{setShowTransfer(v=>!v);setShowDialpad(false)}}
        showDialpad={showDialpad} onToggleDialpad={()=>{setShowDialpad(v=>!v);setShowTransfer(false)}}
      />
    }
  </div>;
}





/* =========================================================
   Reports: snapshot + downloadable date-range export
   ========================================================= */

const NAV_ICON_PATHS = {
  dashboard: (<><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9 20v-5.5h6V20"/></>),
  calendar: (<><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M7 3.5v3M17 3.5v3M3.5 9h17"/><path d="M8 12.5h.01M12 12.5h.01M16 12.5h.01M8 16h.01M12 16h.01"/></>),
  reservations: (<><path d="M3 19v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8"/><path d="M5 9V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M3 17h18M7 14h.01M10 14h.01M13 14h.01"/></>),
  guests: (<><circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 6.5a2.7 2.7 0 0 1 0 5.1M16 14.5a4.6 4.6 0 0 1 4.5 5"/></>),
  invoices: (<><path d="M6 3h10l3 3v15H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M15 3v4h4M8 11h6M8 15h6M8 18h4"/></>),
  finance: (<><path d="M12 3v18M16 7.5c-.6-1.1-1.8-1.8-3.6-1.8-2.1 0-3.4 1-3.4 2.5 0 4 7 1.8 7 5.7 0 1.6-1.4 2.8-3.7 2.8-1.8 0-3.2-.7-4-2"/></>),
  reports: (<><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/><path d="m5 8 5-3 6 3 5-5"/></>),
  help: (<><circle cx="12" cy="12" r="9"/><path d="M9.6 9a2.6 2.6 0 1 1 4.7 1.6c-.9 1.1-2.3 1.5-2.3 3M12 17h.01"/></>),
  settings: (<><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M5.9 5.9l1.4 1.4M16.7 16.7l1.4 1.4M18.1 5.9l-1.4 1.4M7.3 16.7l-1.4 1.4"/><circle cx="12" cy="12" r="3.5"/><circle cx="12" cy="12" r="8"/></>)
};

function NavIcon({ name }) {
  return (
    <span className="nav-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {NAV_ICON_PATHS[name]}
      </svg>
    </span>
  );
}

function Admin({data,setData,onLogout,session,onBackToProperties,onReloadWorkspace,initialPage='dashboard'}){
 const [mobileNav,setMobileNav]=useState(false),[page,setPage]=useState(initialPage),[editingReservation,setEditingReservation]=useState(null),[editor,setEditor]=useState(false),[selected,setSelected]=useState(null),[callGuest,setCallGuest]=useState(null),[incomingCall,setIncomingCall]=useState(currentIncomingTeleCMICall);
 useEffect(()=>{if(!mobileNav||!window.matchMedia("(max-width:900px)").matches)return;const panel=document.getElementById("property-navigation"),trigger=document.querySelector(".mobile-menu-toggle");const items=()=>[...panel.querySelectorAll("button,a[href]")].filter(el=>!el.disabled&&el.getClientRects().length);items()[0]?.focus();const keys=e=>{if(e.key==="Escape"){e.preventDefault();setMobileNav(false);}if(e.key==="Tab"){const list=items(),first=list[0],last=list.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};panel.addEventListener("keydown",keys);return()=>{panel.removeEventListener("keydown",keys);trigger?.focus();};},[mobileNav]);
 useEffect(()=>{const open=e=>{if(Number(e.detail?.propertyId)===Number(data.property.id)){const record=data.reservations.find(r=>r.id===e.detail.id);if(record)setEditingReservation(record);}};window.addEventListener("friday:open-reservation",open);return()=>window.removeEventListener("friday:open-reservation",open);},[data.property.id,data.reservations]);
 useEffect(()=>subscribeIncomingTeleCMI(setIncomingCall),[]);
 useEffect(()=>{
   if(!incomingCall) return;
   setCallGuest(null);
 },[incomingCall]);
 const normalizePhone=value=>String(value||"").replace(/\D/g,"").slice(-10);
 const startOutgoingCall=(g)=>{
   if(data.demo){alert("Calling is disabled for fictional Sample data contacts.");return;}
   if(incomingCall){
     alert("You still have an active/unacknowledged incoming call. Please finish or close it before starting a new call — TeleCMI only supports one call at a time per agent.");
     return;
   }
   setCallGuest(g);
 };
 const incomingGuest=useMemo(()=>{
   if(!incomingCall) return null;
   const from=normalizePhone(incomingCall.from);
   return data.guests.find(g=>normalizePhone(g.phone)===from) || {id:null,name:incomingCall.name||"Unknown caller",phone:incomingCall.from||"Unknown number"};
 },[incomingCall,data.guests]);
 // Always open a selected module at its top; avoids the dashboard appearing clipped
 // when the browser preserves the previous page's scroll position.
 useEffect(()=>{window.scrollTo({top:0,left:0,behavior:"auto"});},[page]);
 const saveReservation=f=>{const validation=reservationError(data,f);if(validation){alert(validation);return}const overlap=data.reservations.some(r=>r.room===f.room&&["Confirmed","Checked In","Modified"].includes(r.status)&&f.arrival<r.departure&&f.departure>r.arrival);if(overlap){alert(`Room ${f.room} has an overlapping stay.`);return}setData(d=>{let guestId=f.guestId;let guests=d.guests;if(f.guestMode==="new"||!guestId){guestId=uid("G");guests=[...guests,{id:guestId,name:`${f.firstName.trim()} ${f.lastName.trim()}`,email:f.email.trim(),phone:f.phone.trim(),nationality:f.nationality,idType:f.idType,idNumber:f.idNumber,address:f.address,idAttachment:f.idAttachment||null}]}else if(f.idAttachment){guests=guests.map(g=>g.id===guestId?{...g,nationality:f.nationality,idType:f.idType,idNumber:f.idNumber,address:f.address,idAttachment:f.idAttachment}:g)}return {...d,guests,reservations:[...d.reservations,{id:uid("R"),guestId,room:f.room,arrival:f.arrival,departure:f.departure,expectedIn:f.expectedIn,expectedOut:f.expectedOut,status:"Confirmed",rate:Number(f.rate),paid:Number(f.paid),bookingDate:offset(0),source:f.source,adults:Number(f.adults),children:Number(f.children),actualCheckIn:null,actualCheckOut:null}]}});setEditor(false)};
 const checkIn=r=>{if(r.status!=="Confirmed"||r.arrival>offset(0)||r.departure<=offset(0)){alert("Only a confirmed reservation within its stay dates can check in.");return}if(data.reservations.some(x=>x.id!==r.id&&x.room===r.room&&x.status==="Checked In")){alert("This room already has an in-house guest.");return}const now=stamp();setData(d=>({...d,reservations:d.reservations.map(x=>x.id===r.id?{...x,status:"Checked In",actualCheckIn:now}:x)}));setPage("guests")};
 const checkOut=r=>{if(r.status!=="Checked In"){alert("Only an in-house reservation can check out.");return}if(balance(r)>0){alert("Settle the outstanding balance before check-out.");return}if(!window.confirm("Check out this guest?"))return;const now=stamp();setData(d=>({...d,reservations:d.reservations.map(x=>x.id===r.id?{...x,status:"Checked Out",actualCheckOut:now}:x)}));setPage("guests")};
 const requests=data.requests;
 const navGroups=[
  [["dashboard","Dashboard","dashboard"],["calendar","Calendar","calendar"],["reservations","Reservations","reservations"],["guests","Guests","guests"]],
  [["invoices","Invoices","invoices"],["payments","Finance","finance"],["rates-inventory","Rates & Inventory","reservations"],["channel-manager","Channel Manager","reports"],["reports","Reports","reports"]],
  ...(data.demo?[[["frontdesk","Front Desk","reservations"],["housekeeping","Housekeeping","reservations"],["folios","Guest folios","invoices"],["rateplans","Rate plans","finance"],["room-types","Room types & inventory","reservations"]]]:[]),
  [["enquiries","Enquiries","reservations"],["groups","Group Bookings","guests"],["communications","Communications","guests"],["worktasks","Tasks & follow-ups","reports"],["activity","Audit history","reports"],["team","Users & Roles","settings"]],
  [["help","Help","help"],["settings","Settings","settings"]],
 ];
 const currentLabel=navGroups.flat().find(n=>n[0]===page)?.[1]||({rooms:"Rooms",requests:"Guest Requests"}[page]||"Dashboard");
 return <div className={`app ${mobileNav?"mobile-nav-open":""}`}>{mobileNav&&<button className="mobile-nav-backdrop" aria-label="Close navigation" onClick={()=>setMobileNav(false)}/>}<aside className="sidebar" id="property-navigation" aria-label="Property navigation"><Brand/><button type="button" className="property-return" onClick={onBackToProperties}>← All properties</button><div className="workspace-label">ADMIN WORKSPACE</div><div className="property-chip"><span className="status-dot"/><div><b>Hello {(data.property?.name||"Taj").split(" ")[0]}</b><small>{(data.property?.address||"Tirupati").split(",")[0]}</small></div></div><nav className="sidebar-nav">{navGroups.map((group,gi)=><div className={`nav-group nav-group-${gi+1}`} key={gi}>{group.map(([k,l,ic])=><button key={k} className={page===k?"active":""} onClick={()=>{setPage(k);setMobileNav(false)}}><NavIcon name={ic}/><span className="nav-label">{l}</span></button>)}</div>)}</nav><div className="sidebar-bottom"><div className="owner-profile"><span className="avatar">{initials(session.name)}</span><div><b>{session.name}</b><small>{session.role.replaceAll("_"," ")}</small></div></div></div></aside><div className="main-shell"><header className="topbar"><button type="button" className="mobile-menu-toggle" aria-label="Toggle property navigation" aria-expanded={mobileNav} aria-controls="property-navigation" onClick={()=>setMobileNav(value=>!value)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button><span className="breadcrumb">{data.property?.name||"Taj Tirupati"} / {currentLabel}</span><div className="profile-menu"><button className="avatar-button" aria-label="Open profile menu">{initials(session.name)}</button><div className="profile-dropdown"><div className="profile-dropdown-head"><span className="avatar large-avatar">{initials(session.name)}</span><div><b>{session.name}</b><small>{session.email}</small></div></div><button onClick={()=>setPage("settings")}>⚙ <span>Settings</span></button><button onClick={onLogout}>↪ <span>Sign out</span></button></div></div></header><main>{data.demo&&<div className="demo-inline-disclaimer" role="note">{data.demo.disclaimer}</div>}
 {page==="dashboard"&&<Dashboard data={data} hotel={{...HOTEL,name:data.property?.name||HOTEL.name,location:data.property?.address||HOTEL.location,rooms:data.rooms.map(r=>r.number)}} utils={{offset,money,balance,initials,nights}} setPage={setPage} onNew={()=>setEditor(true)} onCheckIn={checkIn} onCheckOut={checkOut} onOpenGuest={setSelected}/>}
 {page==="reservations"&&<Reservations data={data} onCheckIn={checkIn} onEdit={setEditingReservation} onCall={startOutgoingCall}/>} 
 {page==="guests"&&<Guests data={data} setSelected={setSelected} setData={setData} onCall={startOutgoingCall}/>} 
 {page==="calendar"&&<CalendarPage data={data} onOpenGuest={setSelected} onNewReservation={()=>setEditor(true)}/>}
 {page==="invoices"&&<InvoicesPage data={data} setData={setData}/>} {page==="help"&&<Help setPage={setPage}/>} {page==="rooms"&&<Rooms data={data}/>} {page==="payments"&&<Finance data={data} setData={setData}/>} {page==="rates-inventory"&&<RatesInventory data={data} setData={setData}/>} {page==="channel-manager"&&<ChannelManager data={data} setData={setData} onReload={onReloadWorkspace}/>}
 {["enquiries","groups","communications","worktasks","activity"].includes(page)&&<BusinessOperations key={page} view={page} data={data} setData={setData}/>}
 
 {page==="rateplans"&&<RatePlans data={data} setData={setData}/>}
 {page==="channel-manager"&&<ChannelMappings data={data} setData={setData}/>}
 {page==="team"&&<><div className="page-heading"><div><div className="eyebrow">ADMINISTRATION</div><h1>Users &amp; Roles</h1><p className="muted">Staff accounts and property access.</p></div></div><OwnerAdmin view="team" session={session}/></>}
 {page==="room-types"&&<RoomManagement data={data} setData={setData}/>}
 {page==="requests"&&<RequestsPage data={data} setData={setData}/>}
 {page==="reports"&&<ReportsPage data={data} requests={requests}/>}
 {["frontdesk","housekeeping","folios","tasks"].includes(page)&&<DemoOperations key={page} view={page} data={data} setData={setData} onCheckIn={checkIn} onCheckOut={checkOut}/>}
 {page==="folios"&&<FolioActions data={data} setData={setData}/>}
 {page==="settings"&&<><div className="page-heading"><div><div className="eyebrow">ADMINISTRATION</div><h1>Property settings</h1><p className="muted">Property details, operational policies and integrations.</p></div></div><Settings data={data} setData={setData} session={session} onManageProperties={onBackToProperties}/></>}
 </main><footer>Friday AI - Desk · {data.property?.name} · Hospitality CRM</footer></div>{editingReservation&&<ReservationActions reservation={editingReservation} data={data} setData={setData} onClose={()=>setEditingReservation(null)}/>}{editor&&(data.demo?<CreateReservation data={data} setData={setData} onClose={()=>setEditor(false)}/>:<ReservationEditor data={data} onClose={()=>setEditor(false)} onSave={saveReservation}/>)} {selected&&<GuestProfile g={selected} data={data} onClose={()=>setSelected(null)} onCall={startOutgoingCall}/>} {incomingCall&&<CallErrorBoundary onClose={()=>{setIncomingCall(null);currentIncomingTeleCMICall=null;window.teleCMIIncomingCall=null}}><IncomingCallPopup call={incomingCall} guest={incomingGuest} onClose={()=>{setIncomingCall(null);currentIncomingTeleCMICall=null;window.teleCMIIncomingCall=null}} onSave={call=>setData(d=>({...d,callActivities:[...(d.callActivities||[]),call]}))}/></CallErrorBoundary>} {callGuest&&<CallErrorBoundary onClose={()=>setCallGuest(null)}><CallPopup guest={callGuest} telecmi={data.telecmi} onClose={()=>setCallGuest(null)} onSave={call=>setData(d=>({...d,callActivities:[...(d.callActivities||[]),call]}))}/></CallErrorBoundary>}</div>
}






function GuestPortal({data,onRequest,onLogout}){
 const r=data.reservations.find(x=>x.guestId==="G-1001"&&x.status==="Checked In")||data.reservations.find(x=>x.guestId==="G-1001")||data.reservations[0]; const g=data.guests.find(x=>x.id===r.guestId); const [text,setText]=useState("");
 return <div className="guest-app"><header className="guest-top"><Brand/><div><span className="guest-property">{data.property?.name}</span><button className="ghost" onClick={onLogout}>Sign out</button></div></header><main className="guest-main"><div className="guest-welcome"><div className="eyebrow">{(data.property?.name||"").toUpperCase()} · {(data.property?.address||"").split(",")[0].toUpperCase()}</div><h1>Welcome, {g.name.split(" ")[0]}.</h1><p className="muted">Your stay, payment and requests in one place.</p></div><div className="guest-grid"><section className="card stay-card"><div className="stay-banner"><span>YOUR STAY · {r.status}</span><Badge>{r.status}</Badge></div><h2>Room {r.room}</h2><div className="stay-dates"><div><span>Expected check-in</span><strong>{date(r.arrival)}</strong><small>{r.expectedIn}</small>{r.actualCheckIn&&<small>Actual: {fmt(r.actualCheckIn)}</small>}</div><div><span>Expected check-out</span><strong>{date(r.departure)}</strong><small>{r.expectedOut}</small>{r.actualCheckOut&&<small>Actual: {fmt(r.actualCheckOut)}</small>}</div></div></section><section className="card"><div className="eyebrow">PAYMENT</div><h2>{money(balance(r))}</h2><p className="muted">Outstanding balance</p><div className="payment-line"><span>Total stay</span><b>{money(total(r))}</b></div><div className="payment-line"><span>Paid</span><b>{money(r.paid)}</b></div></section></div><div className="guest-grid"><section className="card"><div className="eyebrow">REQUESTS</div><h2>Need anything?</h2><form className="request-form" onSubmit={e=>{e.preventDefault();if(text.trim()){onRequest(text);setText("")}}}><textarea rows="3" placeholder="Tell the hotel what you need…" value={text} onChange={e=>setText(e.target.value)}/><button className="primary">Send request</button></form>{data.requests.filter(q=>q.guestId===g.id).map(q=><div className="request-item" key={q.id}><b>{q.text}</b><Badge>{q.status}</Badge></div>)}</section><section className="card"><div className="eyebrow">PROPERTY INFORMATION</div><h2>{data.property?.name}</h2><p className="muted">{data.property?.address||HOTEL.location}</p><div className="info-list"><div><span>Wi-Fi</span><b>{HOTEL.wifi}</b></div><div><span>Check-in</span><b>{HOTEL.checkIn}</b></div><div><span>Check-out</span><b>{HOTEL.checkOut}</b></div></div><button className="subtle wide">Contact Host</button></section></div></main></div>
}

function PropertyWorkspace({property,session,onLogout,onBack}) {
 const [data,updateData]=useState(()=>loadPropertyWorkspace(property,session));
 const [loading,setLoading]=useState(true),[storageError,setStorageError]=useState(""),[saving,setSaving]=useState(false);
 const current=useRef(data),remote=useRef(false),version=useRef(0),queue=useRef(Promise.resolve()),mounted=useRef(true),failed=useRef(false);
 const loadRemote=async()=>{const result=await workspaceRequest(property.id);if(result.state){remote.current=true;version.current=result.version;current.current=result.state;updateData(result.state);}return result;};
 useEffect(()=>{mounted.current=true;loadRemote().catch(error=>{if(property.demo&&mounted.current)setStorageError(error.message);}).finally(()=>{if(mounted.current)setLoading(false);});return()=>{mounted.current=false;};},[property.id]);
 const setData=useCallback(change=>{
  const next=typeof change==="function"?change(current.current):change;current.current=next;updateData(next);setStorageError("");
  if(!remote.current){try{localStorage.setItem(propertyStorageKey(session.id,property.id),JSON.stringify(next));return Promise.resolve(true);}catch{setStorageError("Unable to save browser workspace.");return Promise.resolve(false);}}
  setSaving(true);failed.current=false;
  queue.current=queue.current.then(async()=>{
   const result=await workspaceRequest(property.id,"PUT",{state:next,version:version.current});version.current=result.version;
   if(current.current===next){current.current=result.state;if(mounted.current)updateData(result.state);}
  }).catch(error=>{failed.current=true;if(mounted.current)setStorageError(error.message+" Your changes remain on screen. Reload to resolve conflicting updates.");}).finally(()=>{if(mounted.current)setSaving(false);});
  return queue.current.then(()=>!failed.current);
 },[session.id,property.id]);
 const back=async()=>{await queue.current;if(!failed.current)onBack();};
 const reload=async()=>{await queue.current;await loadRemote();failed.current=false;setStorageError("");};
 if(loading)return <div role="status" style={{padding:32}}>Loading property records…</div>;
 if(property.demo&&!remote.current)return <div role="alert" style={{padding:32}}>{storageError||"Sample data workspace unavailable."}<button onClick={onBack}>Back to properties</button></div>;
 return <>{data.demo&&<div className="demo-notice" role="note">{data.demo.disclaimer} · Reference date: {data.demo.referenceDate} · {saving?"Saving to local database…":remote.current?"Database-backed Sample data":"Local workspace"}</div>}{storageError&&<div className="demo-error" role="alert">{storageError}<button type="button" onClick={()=>reload().catch(e=>setStorageError(e.message))}>Reload saved records</button></div>}<Admin initialPage={property.initialPage} data={data} setData={setData} session={{...session,propertyId:property.id}} onLogout={onLogout} onBackToProperties={back} onReloadWorkspace={reload}/></>;
}

export default function App(){
 const [session,setSession]=useState(null),[checkingSession,setCheckingSession]=useState(true),[selectedProperty,setSelectedProperty]=useState(null);
 useEffect(()=>{let active=true;authRequest("session").then(result=>{if(active)setSession(result.user)}).catch(()=>{}).finally(()=>{if(active)setCheckingSession(false)});return()=>{active=false};},[]);
 useEffect(()=>{if(!session)return;let active=true;const verify=()=>authRequest("session").catch(()=>{if(active)setSession(null);});const timer=setInterval(verify,300000);window.addEventListener("focus",verify);return()=>{active=false;clearInterval(timer);window.removeEventListener("focus",verify);};},[session]);
 const login=async credentials=>{const result=await authRequest("login",credentials);setSelectedProperty(null);setSession(result.user);};
 const logout=async()=>{try{await authRequest("logout",{});setSelectedProperty(null);setSession(null);}catch(error){alert(error.message);}};


 if(checkingSession)return <div role="status" style={{padding:32}}>Checking your session…</div>;
 if(!session)return <FridayLogin onLogin={login}/>;
 if(!selectedProperty)return <Properties session={session} onSelect={setSelectedProperty} onLogout={logout}/>;
 return <PropertyWorkspace key={selectedProperty.id} property={selectedProperty} session={session} onLogout={logout} onBack={()=>setSelectedProperty(null)}/>;
}
