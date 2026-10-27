import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reservationError} from './reservationRules.js';
const data={rooms:[{number:'101',type:'Deluxe',capacity:2},{number:'102',type:'Deluxe',capacity:2}], reservations:[{id:'R1',room:'101',status:'Confirmed',arrival:'2026-10-26',departure:'2026-10-28'}]};
const stay={room:'102',arrival:'2026-10-26',departure:'2026-10-28',rate:4200,adults:2,children:0};
test('valid stays pass and overlapping room allocations fail',()=>{
 assert.equal(reservationError(data,stay),'');
 assert.match(reservationError(data,{...stay,room:'101'}),/overlapping/);
 assert.equal(reservationError(data,{...stay,room:'101',arrival:'2026-10-28',departure:'2026-10-29'}),'');
});
test('dates, capacity and rates are validated',()=>{
 assert.match(reservationError(data,{...stay,departure:stay.arrival}),/after/);
 assert.match(reservationError(data,{...stay,adults:3}),/capacity/);
 assert.match(reservationError(data,{...stay,rate:-1}),/rate/);
 assert.match(reservationError(data,{...stay,arrival:'2026-99-01'}),/date|after/);
});
test('inventory closures block new bookings',()=>{
 assert.match(reservationError({...data,inventoryOverrides:{'Deluxe|2026-10-26':{sellable:1}}},stay),/No sellable/);
});
