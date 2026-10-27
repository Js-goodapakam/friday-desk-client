export function bookedRooms(data, type, day) {
  const rooms = new Set(data.rooms.filter(room => room.type === type).map(room => String(room.number)));
  return new Set(data.reservations.filter(stay => rooms.has(String(stay.room)) && ["Confirmed", "Checked In", "Modified"].includes(stay.status) && stay.arrival <= day && day < stay.departure).map(stay => String(stay.room))).size;
}

export function inventoryError(data, type, day, rate, sellable) {
  const physical = data.rooms.filter(room => room.type === type).length;
  if (!Number.isFinite(rate) || rate < 0) return "Enter a valid non-negative rate.";
  if (!Number.isInteger(sellable) || sellable < 0 || sellable > physical) return `Sellable rooms must be between 0 and ${physical}.`;
  const booked = bookedRooms(data, type, day);
  if (sellable < booked) return `There are ${booked} rooms already booked. Sellable inventory cannot be lower than existing bookings.`;
  return "";
}
