import {test} from 'node:test';
import assert from 'node:assert/strict';
import {portfolioTotals} from './portfolio.js';

test('portfolio occupancy is weighted by rooms, with blocked rooms distinct',()=>{
 const t=portfolioTotals([{totalRooms:80,occupiedRooms:40,availableRooms:35,bookingValue:100,currency:'INR'},{totalRooms:20,occupiedRooms:2,availableRooms:16,bookingValue:50,currency:'INR'}]);
 assert.equal(t.occupancy,42);assert.equal(t.available,51);assert.equal(t.unavailable,7);assert.equal(t.bookingValue.INR,150);
});
test('missing snapshots do not become zero occupancy; currencies stay separate',()=>{
 const t=portfolioTotals([{name:'Unconfigured'},{totalRooms:10,occupiedRooms:5,availableRooms:4,bookingValue:100,currency:'INR',asOf:'2026-10-26'},{bookingValue:2,currency:'USD',openRequests:3,maintenanceRooms:1,asOf:'2026-10-26'}]);
 assert.equal(t.knownCount,1);assert.equal(t.occupancy,50);assert.deepEqual(t.bookingValue,{INR:100,USD:2});assert.deepEqual(t.dates,['2026-10-26']);assert.equal(t.openRequests,3);assert.equal(t.maintenanceRooms,1);
 assert.equal(portfolioTotals([]).knownCount,0);
});
