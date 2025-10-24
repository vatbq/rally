# Build Notes – Thinking & Decisions Log

> This doc captures my thinking and decisions while building this project. Raw notes for me, but also a window for reviewers to see how I reasoned through things.

---

## 1) Data Shape Decisions

### Service type: table or enum?

For a bigger/real project I'd use a **table** (dynamic, can hold metadata like price, duration, locale labels). For this take-home, an **enum** is fine—fast, type-safe. I understand the trade-off: enums are static and need migrations to add values; tables let admins add types at runtime.

### Email status lifecycle

**Take-home (simulated):** `QUEUED → SENT → DELIVERED` (fake transitions)

**Real case would be:**
- Set to `SENDING` while calling the provider (ESP)
- Move to `SENT` on 200 OK
- Update via webhook to `DELIVERED / BOUNCED / FAILED`
- Keep an `email_events` audit trail

### Cohort: vehicle + user or just vehicle?

Initial thought: "I need to group _user + vehicle_ for the cohort."

**After thinking about it:** Not necessarily. The **vehicle** is enough for eligibility (service type/cadence + appointments).
- What if the owner changes after? Does it matter?
- Pro including user: see exactly who I sent the email to
- But what matters for the rule is that the **vehicle** got the service, not the person

**Practical conclusion:** Keep the model **vehicle-centric** for eligibility. To simplify reads, I include both `customerId` and `vehicleId` in the email table (avoids extra joins in conversations).

Thought about storing everything in cohort by vehicle but it's messy. Better to have a dedicated **RuleTarget table** that materializes which vehicles participated in each cohort run.

### Can a vehicle have more than one user?

**Assumption for this challenge:** No (one `Vehicle` belongs to one `Customer`). In the real world, it'd be an **N:M** relationship with `CustomerVehicle` and `primaryContact`.

---

## 2) Key Queries That Need to Be Efficient

1. **Cohort preview (who's eligible today for a rule):**
   - By `serviceType` + "last service" ≥ `cadenceMonths`
   - No upcoming appointment

2. **Send/schedule:** Same as preview but materializing the cohort (creates `RuleRun` + `RuleTarget`) and queues emails

3. **Dashboard:**
   - Campaign stats
   - Email delivery status

4. **Conversations/Bookings:**
   - Recent emails/replies per customer
   - Upcoming appointments

---

## 3) Model Version I Chose

**Version 2 – Vehicle-Centric** (Customer 1:N Vehicle; `ServiceHistory`, `Appointment`, `RuleTarget` all go through `Vehicle`)

Why:
- Re-engagement rules are naturally evaluated **per vehicle**
- The eligibility query ("no service X in N months and no future appointment") has to go through vehicle anyway, so doesn't change much
- In emails I store `customerId` + `vehicleId` so conversations/dashboard can resolve without heavy joins

All schema versions I considered are in the [database diagram](./docs/rally.database.png).

---

## 4) Email Simulation & Workers

### Why use workers?

To not block the main thread and simulate realistic email sending. Added time delays between updates to simulate real time.

### Polling strategy

I first get all campaigns and then only poll for the ones that aren't completed. Doing polling now because of the simulation, but in production I'd use something like [Resend](https://resend.com/).

**Update:** Actually I have to fetch all campaigns always in case a scheduled one kicks off.

### Email threading

Adding `threadId` so I can group emails by campaign. It's like Reply-To, quick way to show them as conversations in the UI.

---

## 5) Scheduling

Built the scheduler natively here so I don't need an external service. That means checking once per minute if there are schedulers to run.

### Oh shit moment: recurring vs scheduled

When I thought I was almost done, I realized the requirement was **recurring**, just **scheduled**. Had to change the architecture but decided to build it above what I already had done, so it wasn't that bad.

### Database: RecurringSchedule table

**Decision:** New `RecurringSchedule` table, separate from `ScheduledCampaign`.

**Why not reuse ScheduledCampaign?**
- ScheduledCampaign is for **one-off** campaigns (schedule once, run once)
- RecurringSchedule is a **template/config** that generates multiple ScheduledCampaigns
- Separating concerns: RecurringSchedule has `frequency`, `timeOfDay`, `dayOfWeek/Month`, etc. ScheduledCampaign just has `scheduledFor`

**The relationship:**
- `RecurringSchedule` 1:N `ScheduledCampaign` (one recurring creates many scheduled)
- Each time the scheduler runs, it creates a new `ScheduledCampaign` with `recurringScheduleId` reference
- This way I can see **complete history** of executions (each ScheduledCampaign is a run)

**Alternative I considered:** An `isRecurring` boolean field in ScheduledCampaign with JSON config. Rejected because it's messy, hard to query, and mixes two different concepts.

---

## 6) Real-Time Updates / Polling

### Polling for recurring schedules

Using the same pattern as CampaignsDashboard: polling every 2 seconds with server actions. Super simple, no optimizations (no websockets, no server-sent events, nothing fancy).

**Why every 2 seconds?** So it feels real-time when `nextScheduledFor`, `lastExecutedAt`, etc. change.

**Trade-off:** Makes more requests but keeps everything simple. For a take-home it's ok.

**Real world:** I'd use optimistic updates + revalidateTag or websockets if there was a lot of traffic. But for an admin campaigns dashboard, polling is fine, not hundreds of users watching at the same time.

Keeps consistency with the rest of the app (CampaignsDashboard already does the same).

---

## Things That Don't Work Perfectly

- The dates are all messed up. I spent a little time trying to figure it out but I decided to just keep going.
