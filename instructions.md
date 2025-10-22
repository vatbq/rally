# Service Re-Engagement Email Agent

## Goal

Build a small product that automatically re-engages past service customers by email on a configurable cadence (e.g., every 6 months for maintenance, 12 months for brake inspection, etc.). The app should let a dealer define rules, target cohorts, send emails (simulation is fine), and convert replies into booked service appointments.

No real email is required, you can simulate it all.

---

## What you’ll deliver

### 1. The automation (scheduler + agent)

- Rule-based re-engagement (every X months per service type).
- Email generation with personalization.
- Inbound handling for common replies.

### 2. A schema

- Customers, vehicles, service history, rules, cohorts, emails, appointments.

### 3. A simple UI

- Rules & Cohorts (define cadence, eligibility, preview who qualifies next run).
- Campaign Console/Dashboard.
- Conversations/Bookings.

### 4. A short 3–5 min Loom/Zoom

- Walk through the UX and the tradeoffs you made.

Use any stack and any AI you want. Keep it small and realistic.

---

## Core flow (happy path)

### 1. Import data

- Customers/vehicles/service history.
- Map columns, validate emails/required fields, dedupe.

### 2. Create a re-engagement rule

- Example: “Routine Maintenance every 6 months if no service since last_contact_at and no upcoming appointment.”
- Choose service type, cadence (months), send window (days/hours), timezone, and template.

### 3. Preview & cohort

- Show who’s eligible now.

### 4. Launch / schedule

- Either Run once now or Enable recurring (e.g., daily at 10:00 local).
- Simulate sends with statuses (queued → sent → delivered).

### 5. Customer engages

- Allow them to schedule an appointment.
- Remove from future sends until the next cadence window.
