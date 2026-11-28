import { randomUUID } from 'node:crypto';
import type { Context } from './auth.js';
import { check } from './runtime.js';

// Dubai has a fixed UTC+4 offset. Hourly starts leave a 15-minute buffer.
export function dailyConsultationSlots(now: Date, days = 30) {
  const dubai = new Date(now.getTime() + 4 * 3600000);
  const midnight = Date.UTC(dubai.getUTCFullYear(), dubai.getUTCMonth(), dubai.getUTCDate()) - 4 * 3600000;
  const slots = [];
  for (let day = 0; day < days; day++) {
    for (let hour = 10; hour <= 20; hour++) {
      const start = midnight + day * 86400000 + hour * 3600000;
      // Keep at least 24 hours' notice for newly generated appointments.
      if (start < now.getTime() + 86400000) continue;
      slots.push({starts_at:new Date(start).toISOString(), ends_at:new Date(start + 45 * 60000).toISOString()});
    }
  }
  return slots;
}

export async function replenishConsultationSlots(db: Context['db']) {
  if (process.env.CONSULTATION_SCHEDULE !== 'daily-10-21-dubai') return;
  const owner = check(await db.from('staff_members').select('user_id').eq('role','owner').eq('active',true).order('created_at').limit(1).maybeSingle());
  if (!owner) return;
  const slots = dailyConsultationSlots(new Date()).map(slot=>({...slot,created_by:owner.user_id}));
  // Existing booked or blocked slots must never reopen on a scheduler retry.
  if (slots.length) check(await db.from('availability_slots').upsert(slots,{onConflict:'starts_at,ends_at',ignoreDuplicates:true}));
}

export function newMeetingUrl() {
  // A room bearer link contains no customer name, order reference or project data.
  return `https://meet.jit.si/Capistor-${randomUUID()}`;
}

export async function prepareAppointmentMeeting(db: Context['db'], appointmentId: string) {
  if (process.env.MEETING_PROVIDER !== 'jitsi') return;
  // Never replace a staff-supplied URL or regenerate a room on a booking retry.
  check(await db.from('appointments').update({meeting_url:newMeetingUrl(),updated_at:new Date().toISOString()})
    .eq('id',appointmentId).eq('meeting_url','').eq('status','scheduled'));
}
