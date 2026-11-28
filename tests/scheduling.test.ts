import {afterEach,describe,expect,it,vi} from 'vitest';
import {dailyConsultationSlots,newMeetingUrl,prepareAppointmentMeeting,replenishConsultationSlots} from '../server/scheduling.js';
import type {Context} from '../server/auth.js';
afterEach(()=>vi.unstubAllEnvs());
describe('consultation scheduling',()=>{
 it('uses UAE daytime hours, 45-minute calls and at least 24 hours notice',()=>{
  const now=new Date('2026-11-27T14:30:00Z');
  const slots=dailyConsultationSlots(now,3);
  expect(slots.length).toBeGreaterThan(0);
  for(const s of slots){
   const start=Date.parse(s.starts_at),local=new Date(start+4*3600000);
   expect(start-now.getTime()).toBeGreaterThanOrEqual(86400000);
   expect(local.getUTCHours()).toBeGreaterThanOrEqual(10);
   expect(local.getUTCHours()).toBeLessThanOrEqual(20);
   expect(Date.parse(s.ends_at)-start).toBe(45*60000);
  }
  expect(new Set(slots.map(s=>s.starts_at)).size).toBe(slots.length);
 });
 it('generates unguessable room links without customer or project details',()=>{
  const a=newMeetingUrl(),b=newMeetingUrl();
  expect(a).toMatch(/^https:\/\/meet\.jit\.si\/Capistor-[a-f0-9-]{36}$/);
  expect(a).not.toBe(b);
 });
 it('does not provision a provider unless configured',async()=>{
  vi.stubEnv('MEETING_PROVIDER','');const from=vi.fn();
  await prepareAppointmentMeeting({from} as unknown as Context['db'],'appointment');expect(from).not.toHaveBeenCalled();
 });
 it('only fills an empty URL on the same scheduled appointment',async()=>{
  vi.stubEnv('MEETING_PROVIDER','jitsi');const filters:unknown[]=[];
  const chain={eq:(...a:unknown[])=>{filters.push(a);return chain;},then:(resolve:(v:unknown)=>unknown)=>Promise.resolve({data:null,error:null}).then(resolve)};
  const update=vi.fn(()=>chain);await prepareAppointmentMeeting({from:()=>({update})} as unknown as Context['db'],'appointment');
  expect(filters).toEqual([['id','appointment'],['meeting_url',''],['status','scheduled']]);
 });
 it('never overwrites booked or staff-blocked slots when replenishing',async()=>{
  vi.stubEnv('CONSULTATION_SCHEDULE','daily-10-21-dubai');
  const chain:Record<string,unknown>={};for(const m of ['select','eq','order','limit'])chain[m]=()=>chain;
  chain.maybeSingle=async()=>({data:{user_id:'owner'},error:null});
  const upsert=vi.fn().mockResolvedValue({data:null,error:null});
  await replenishConsultationSlots({from:(table:string)=>table==='staff_members'?chain:{upsert}} as unknown as Context['db']);
  expect(upsert).toHaveBeenCalledWith(expect.any(Array),{onConflict:'starts_at,ends_at',ignoreDuplicates:true});
 });
});
