import type { Appointment } from './types.js';

function escapeText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}
function utc(value: string) {
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) throw new Error('Invalid appointment date');
  return parsed.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}
function fold(line: string) {
  const encoder = new TextEncoder();
  const lines: string[] = [];
  let current = '', bytes = 0;
  for (const character of line) {
    const size = encoder.encode(character).length;
    if (bytes + size > 75) { lines.push(current); current = ' '; bytes = 1; }
    current += character; bytes += size;
  }
  lines.push(current);
  return lines.join('\r\n');
}
export function appointmentCalendar(appointment: Appointment, reference: string, now = new Date()) {
  const meeting = /^https:\/\//i.test(appointment.meeting_url) ? appointment.meeting_url : '';
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Capistor//Consultations//EN', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT', `UID:${escapeText(appointment.id)}@capistor.com`, `DTSTAMP:${utc(now.toISOString())}`,
    `DTSTART:${utc(appointment.starts_at)}`, `DTEND:${utc(appointment.ends_at)}`,
    `SUMMARY:${escapeText(`Capistor consultation · ${reference}`)}`,
    `DESCRIPTION:${escapeText(`Order ${reference}. Check your Capistor order workspace for the latest appointment details.${meeting ? ` Join: ${meeting}` : ' The joining link will be added to your order workspace.'}`)}`,
    ...(meeting ? [`LOCATION:${escapeText(meeting)}`] : []),
    `STATUS:${appointment.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'}`,
    'END:VEVENT', 'END:VCALENDAR', '',
  ].map(fold).join('\r\n');
}
export function downloadAppointment(appointment: Appointment, reference: string) {
  const url = URL.createObjectURL(new Blob([appointmentCalendar(appointment, reference)], {type:'text/calendar;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url; link.download = `${reference}-consultation.ics`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
