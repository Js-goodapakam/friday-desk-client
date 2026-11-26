import assert from 'node:assert/strict';
import test from 'node:test';
import {managedWorkspaceChanges, managedWorkspaceView} from './propertyWorkspace.js';

test('a newly provisioned workspace renders with empty collections', () => {
 const property = {id: 1, name: 'Synthetic property', timezone: 'Asia/Kolkata'};
 const view = managedWorkspaceView({property: {id: 1, name: property.name}}, property, ['operations']);
 assert.deepEqual(view.property, property);
 for (const section of ['rooms', 'guests', 'reservations', 'requests', 'invoices']) assert.deepEqual(view[section], []);
 assert.equal(view.demo, undefined);
});

test('workspace saves send changed entitled sections only', () => {
 const modules = ['operations'];
 const previous = managedWorkspaceView({property: {id: 1}, invoices: [{id: 'hidden'}]}, {id: 1}, modules);
 assert.deepEqual(previous.invoices, []);
 const rooms = [{number: '101', type: 'Standard'}];
 assert.deepEqual(managedWorkspaceChanges({...previous, rooms}, previous, modules), {property: {id: 1}, rooms});
 assert.throws(() => managedWorkspaceChanges({...previous, invoices: [{id: 'invalid'}]}, previous, modules));
});
