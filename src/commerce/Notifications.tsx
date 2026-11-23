import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from './api';
import { Notice } from './Shell';
type Queue = {
  configured: boolean; sendingEnabled: boolean;
  items: {id:string;order_id:string|null;channel:string;template_key:string;status:string;attempts:number;last_error:string;created_at:string;sent_at:string|null}[];
};
export default function NotificationQueue() {
  const [data,setData]=useState<Queue|null>(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const load=useCallback(async () => {
    setError('');
    try {setData(await api<Queue>('notifications'));} catch(e){setError((e as Error).message);}
  },[]);
  useEffect(()=>{void load();},[load]);
  async function send(id:string) {
    setBusy(true);setError('');
    try {await api('send-notification',{id});await load();}
    catch(e){setError((e as Error).message);}
    finally {setBusy(false);}
  }
  return <section className="panel"><h2>Notification queue</h2>
    <p>Booking confirmations send automatically when email delivery is enabled. Review queued or failed messages here. “Accepted by email provider” confirms submission, not inbox delivery. Workspace records remain available in each order.</p>
    <button className="small-button" disabled={busy} onClick={()=>void load()}>Refresh status</button>
    {error && <Notice error>{error}</Notice>}
    {!data ? <p>Loading notification status…</p> : <>
      {!data.configured && <Notice>Email sending needs a verified sender and RESEND_API_KEY / NOTIFICATION_FROM in the hosting configuration.</Notice>}
      {!data.sendingEnabled && <Notice>External email is disabled in this sandbox. No QA customer messages will be sent unless ALLOW_SANDBOX_EMAIL is explicitly enabled.</Notice>}
      {!data.items.length ? <p>No notifications queued yet.</p> : <div className="orders-list">{data.items.map(item=><article className="panel" key={item.id}>
        <p className="eyebrow">{item.channel} · {item.template_key.replace(/_/g,' ')}</p>
        <h3>{item.channel==='workspace' ? 'Recorded in order workspace' : item.status==='sent' ? 'Accepted by email provider' : item.status}</h3>
        <p>{new Date(item.created_at).toLocaleString()} · {item.attempts} send attempts</p>
        {item.last_error && <p role="status">{item.last_error}</p>}
        <div className="actions">{item.order_id && <Link className="small-button" to={`/portal/orders/${item.order_id}`}>Open order</Link>}
        {item.channel==='email' && item.template_key==='appointment_booked' && ['queued','failed'].includes(item.status) && <button className="small-button" disabled={busy || !data.configured || !data.sendingEnabled || item.attempts>=3} onClick={()=>void send(item.id)}>{item.attempts ? 'Retry same email' : 'Send appointment email'}</button>}</div>
      </article>)}</div>}
    </>}
  </section>;
}
