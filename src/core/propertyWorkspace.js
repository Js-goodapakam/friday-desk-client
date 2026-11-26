import {seed} from './data.js';

const managedSections = {
 operations: ['rooms', 'guests', 'reservations', 'requests', 'tasks', 'housekeeping'],
 finance: ['folios', 'payments', 'invoices', 'invoiceSettings'],
 inventory: ['ratePlans', 'inventoryOverrides', 'inventoryAudit', 'revenueManagement'],
 communications: ['communications', 'callActivities'],
};
const objectSections = new Set(['invoiceSettings', 'inventoryOverrides', 'revenueManagement']);

export function managedWorkspaceView(state, property, modules) {
 const view = {property: {...property, ...state.property}};
 for (const key of Object.values(managedSections).flat()) {
  view[key] = objectSections.has(key) ? {} : [];
 }
 for (const key of modules.flatMap(module => managedSections[module] || [])) {
  if (Object.hasOwn(state, key)) view[key] = state[key];
 }
 return view;
}

export function managedWorkspaceChanges(next, previous, modules) {
 const allowed = new Set(modules.flatMap(module => managedSections[module] || []));
 const patch = {property: {id: previous.property.id}};
 for (const [key, value] of Object.entries(next)) {
  if (JSON.stringify(value) === JSON.stringify(previous[key])) continue;
  if (!allowed.has(key)) throw new Error('This workspace section cannot be saved.');
  patch[key] = value;
 }
 return patch;
}

export const propertyStorageKey=(userId,propertyId)=>`friday-pms-user-${userId}-property-${propertyId}-v1`;
export function emptyPropertyWorkspace(property, user) {
 const defaults=seed();
 return {...defaults,
  property:{id:property.id,name:property.name,type:'Hotel',address:[property.city,property.state,property.country].filter(Boolean).join(', '),timezone:property.timezone,currency:'INR',phone:'',email:'',gstNumber:'',managerName:''},
  properties:[{id:property.id,name:property.name,type:'Hotel',address:[property.city,property.state,property.country].filter(Boolean).join(', ')}],
  rooms:[],guests:[],reservations:[],requests:[],invoices:[],callActivities:[],inventoryOverrides:{},inventoryAudit:[],
  users:[{id:user.id,name:user.name,email:user.email,role:user.role,extension:''}],
 };
}
export function loadPropertyWorkspace(property,user,storage=localStorage) {
 const fresh=emptyPropertyWorkspace(property,user);
 try{
  const saved=JSON.parse(storage.getItem(propertyStorageKey(user.id,property.id)) || 'null');
  if(saved && String(saved.property?.id)===String(property.id) && ['rooms','guests','reservations','requests'].every(key=>Array.isArray(saved[key])))return {...fresh,...saved,property:{...fresh.property,...saved.property,id:property.id},properties:fresh.properties};
 }catch{/* Unavailable or malformed browser storage starts an empty property workspace. */}
 return fresh;
}
