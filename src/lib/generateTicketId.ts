import crypto from 'crypto';

interface TicketIdParams {
  eventId: string;
  quantity: number;
  index: number;
  timestamp?: Date | string;
}

function padNumber(num: number, size: number = 3): string {
  return num.toString().padStart(size, '0');
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

function formatTime(date: Date): string {
  return date.toISOString().slice(11, 19).replace(/:/g, '');
}

function generateRandomString(length: number = 5): string {
  return crypto.randomBytes(length).toString('base64url').slice(0, length); 
}

function generateTicketId({ eventId, quantity, index, timestamp }: TicketIdParams): string {
  const dateObj = new Date(timestamp ?? Date.now());
  const date = formatDate(dateObj);
  const time = formatTime(dateObj);
  //const rand = generateRandomString(5);
  const paddedIndex = padNumber(index);

  return `MS-${eventId}-${date}-${quantity}-${paddedIndex}`;
}

module.exports = generateTicketId;
