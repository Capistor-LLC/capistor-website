# Appointment email dispatch

Staff → Notifications shows the latest 200 queue records. Booking automatically attempts the customer's confirmation after the appointment is committed, when email delivery is configured and enabled. Email failures never undo a booking. Owner, admin and support roles may inspect and retry queued appointment emails. Other roles and customers cannot access the queue.

Configure `RESEND_API_KEY` and `NOTIFICATION_FROM` with a sender on a verified Resend domain. These are server environment settings, never client variables. This sender is separate from Supabase authentication SMTP. Sandbox delivery is off unless `ALLOW_SANDBOX_EMAIL=true` is explicitly configured; leave it off for QA fixture accounts.

The send action uses the order customer's verified email, checks the paid order and scheduled appointment, freezes the outbound message on first attempt, and uses a provider idempotency key based on the notification ID. Retries are limited to three attempts within 23 hours of first dispatch. After that, reconcile the provider record before creating another notification. A timeout is an uncertain result, not proof that no email was sent.

The stored `sent` state means accepted by the provider, not inbox delivery. The UI states this explicitly. Delivery/bounce webhooks, scheduled retry jobs, SMS, and staff email recipients are not implemented by this dispatcher. Workspace entries are existing order records, not external messages. The current queue producer creates appointment-booked notices for the customer only.

Provider contract: https://resend.com/docs/dashboard/emails/idempotency-keys
