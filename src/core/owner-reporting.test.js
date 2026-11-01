import test from 'node:test';
import assert from 'node:assert/strict';
import {timelineBuckets,aggregateTimeline} from './ownerTimeline.js';
import {futureBookingRows} from './ownerBookings.js';
test('calendar periods include every hour/day and leap-day',()=>{
 assert.equal(timelineBuckets('today','','','2026-10-31').length,24);
 assert.deepEqual(timelineBuckets('week','2026-W44','','').map(r=>r.key),['2026-10-26','2026-10-27','2026-10-28','2026-10-29','2026-10-30','2026-10-31','2026-11-01']);
 assert.equal(timelineBuckets('month','2024-02','','').length,29);
 assert.equal(timelineBuckets('year','2026','','').length,12);
 assert.equal(timelineBuckets('custom','2026-10-30','2026-11-01','').length,3);
 assert.equal(timelineBuckets('custom','2026-11-01','2026-10-30','').length,0);
});
test('hourly receipts use India time and refunds reduce totals',()=>{
 const b=timelineBuckets('today','','','2026-10-31');
 const state={payments:[{paidAt:'2026-10-30T19:00:00Z',amount:100,type:'Payment'},{paidAt:'2026-10-31T00:00:00Z',amount:20,type:'Refund'},{paidAt:'2026-10-31T00:00:00Z',amount:500,status:'Failed'}],reservations:[{bookingDate:'2026-10-31'}]};
 const {rows}=aggregateTimeline([state],b,'today');assert.equal(rows[0].collections,100);assert.equal(rows[5].collections,-20);assert.equal(rows.reduce((s,r)=>s+r.bookings,0),0);
});
test('future arrivals respect branch scope, boundaries and status',()=>{
 const properties=[{id:1,name:'A'}],make=(id,arrival,status)=>({id,arrival,status,totalAmount:100});
 const state={guests:[],reservations:[make('a','2026-10-31','Confirmed'),make('b','2026-11-06','Pending'),make('c','2026-11-07','Confirmed'),make('d','2026-11-01','Cancelled'),make('e','2026-10-30','Confirmed'),make('f','2026-11-02','Checked In')]};
 const records=[{id:'1',state}];const week=futureBookingRows(records,properties,'2026-10-31','7');assert.deepEqual(week.map(r=>r.id),['a','b']);assert.equal(week[0].property.name,'A');assert.equal(futureBookingRows(records,properties,'2026-10-31','all').length,3);
});
