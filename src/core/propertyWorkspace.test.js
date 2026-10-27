import {test} from 'node:test';
import assert from 'node:assert/strict';
import {emptyPropertyWorkspace,loadPropertyWorkspace,propertyStorageKey} from './propertyWorkspace.js';
const user={id:1,name:'Test Admin',email:'test@example.test',role:'ADMIN'};
const first={id:10,name:'Hotel A',city:'City A',country:'India',timezone:'Asia/Kolkata'};
const second={...first,id:20,name:'Hotel B'};
test('new properties do not inherit seeded guests, rooms or reservations',()=>{
 const data=emptyPropertyWorkspace(first,user);assert.equal(data.property.name,'Hotel A');
 for(const key of ['rooms','guests','reservations','requests','invoices'])assert.deepEqual(data[key],[]);
});
test('property workspaces use separate keys and preserve only matching records',()=>{
 const saved={...emptyPropertyWorkspace(first,user),rooms:[{number:'101'}]};
 const map=new Map([[propertyStorageKey(1,10),JSON.stringify(saved)]]);const storage={getItem:key=>map.get(key)};
 assert.equal(loadPropertyWorkspace(first,user,storage).rooms.length,1);
 assert.equal(loadPropertyWorkspace(second,user,storage).rooms.length,0);
 assert.notEqual(propertyStorageKey(1,10),propertyStorageKey(2,10));
 const wrong={getItem:()=>JSON.stringify(saved)};assert.equal(loadPropertyWorkspace(second,user,wrong).rooms.length,0);
});
