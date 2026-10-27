import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bookedRooms, inventoryError } from './inventory.js';

const data = { rooms: [{number:'101',type:'Deluxe'},{number:'102',type:'Deluxe'}], reservations: [{room:'101',status:'Confirmed',arrival:'2026-10-26',departure:'2026-10-28'}, {room:'102',status:'Cancelled',arrival:'2026-10-26',departure:'2026-10-28'}] };
test('booked inventory excludes cancellations and departure day', () => {
  assert.equal(bookedRooms(data,'Deluxe','2026-10-26'),1);
  assert.equal(bookedRooms(data,'Deluxe','2026-10-28'),0);
});
test('inventory cannot fall below confirmed allocations', () => {
  assert.match(inventoryError(data,'Deluxe','2026-10-26',4200,0),/already booked/);
  assert.equal(inventoryError(data,'Deluxe','2026-10-26',4200,1),'');
});
test('inventory rejects invalid rates, fractional rooms and overselling', () => {
  assert.match(inventoryError(data,'Deluxe','2026-10-26',NaN,2),/rate/);
  assert.match(inventoryError(data,'Deluxe','2026-10-26',-1,2),/rate/);
  assert.match(inventoryError(data,'Deluxe','2026-10-26',4200,3),/between/);
  assert.match(inventoryError(data,'Deluxe','2026-10-26',4200,1.5),/between/);
});
