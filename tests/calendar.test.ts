import { describe, expect, it } from 'vitest';
import { appointmentCalendar } from '../src/commerce/calendar.js';
import type { Appointment } from '../src/commerce/types.js';

const appointment = {
  id: 'test-appointment', starts_at: '2026-12-01T14:00:00+04:00', ends_at: '2026-12-01T14:45:00+04:00',
  status: 'scheduled', meeting_url: 'https://example.com/meeting',
} as Appointment;
describe('consultation calendar export', () => {
  it('preserves the instant across timezones and includes a stable event identity', () => {
    const calendar = appointmentCalendar(appointment, 'CAP-TEST');
    expect(calendar).toContain('DTSTART:20261201T100000Z');
    expect(calendar).toContain('DTEND:20261201T104500Z');
    expect(calendar).toContain('UID:test-appointment@capistor.com');
    expect(calendar).toContain('LOCATION:https://example.com/meeting');
  });
  it('escapes input and folds long unicode lines without exceeding 75 bytes', () => {
    const calendar = appointmentCalendar(appointment, 'Order\r\nBEGIN:VEVENT,' + 'تصميم'.repeat(50));
    expect(calendar).not.toContain('Order\r\nBEGIN:VEVENT');
    for (const line of calendar.split('\r\n')) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  });
  it('marks cancellation and excludes unsafe meeting links', () => {
    const calendar = appointmentCalendar({...appointment,status:'cancelled',meeting_url:'javascript:alert(1)'},'CAP-TEST');
    expect(calendar).toContain('STATUS:CANCELLED');
    expect(calendar).not.toContain('javascript:');
  });
});
