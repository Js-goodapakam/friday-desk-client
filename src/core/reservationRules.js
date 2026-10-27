import { bookedRooms } from './inventory.js';

export function reservationError(data, stay) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(stay.arrival || '') || !/^\d{4}-\d{2}-\d{2}$/.test(stay.departure || '') || stay.departure <= stay.arrival) return 'Check-out must be after check-in.';
  if ([stay.arrival,stay.departure].some(day => !Number.isFinite(Date.parse(day)) || new Date(day).toISOString().slice(0,10) !== day)) return "Enter valid stay dates.";
  const room = data.rooms.find(room => String(room.number) === String(stay.room));
  if (!room) return 'Choose an existing room.';
  if (['Maintenance', 'Out of service'].includes(room.status)) return 'This room is unavailable for maintenance.';
  if (!Number.isFinite(Number(stay.rate)) || Number(stay.rate) < 0) return 'Enter a valid nightly rate.';
  const adults = Number(stay.adults ?? 1), children = Number(stay.children ?? 0);
  if (!Number.isInteger(adults) || adults < 1 || !Number.isInteger(children) || children < 0 || adults + children > Number(room.capacity || 2)) return 'Guest count exceeds room capacity or is invalid.';
  if (data.reservations.some(other => other.id !== stay.id && String(other.room) === String(stay.room) && ['Confirmed','Checked In'].includes(other.status) && stay.arrival < other.departure && stay.departure > other.arrival)) return `Room ${stay.room} has an overlapping stay.`;
  const existing = {...data, reservations:data.reservations.filter(other => other.id !== stay.id)};
  for (let day = stay.arrival; day < stay.departure;) {
    const override = data.inventoryOverrides?.[`${room.type}|${day}`];
    if (override && bookedRooms(existing, room.type, day) + 1 > override.sellable) return `No sellable inventory remains for ${room.type} on ${day}.`;
    const next = new Date(`${day}T12:00:00Z`); next.setUTCDate(next.getUTCDate()+1); day=next.toISOString().slice(0,10);
  }
  return '';
}
