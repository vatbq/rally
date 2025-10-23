# Scheduled Campaigns Feature

## Overview

This feature allows users to schedule email campaigns to run at a specific date and time, rather than only sending immediately.

## What Was Implemented

### 1. Database Schema (`prisma/schema.prisma`)

- **New Enum**: `ScheduledCampaignStatus` (PENDING, EXECUTING, COMPLETED, CANCELLED, FAILED)
- **New Model**: `ScheduledCampaign`
  - Links to a `Rule` and optionally to a `RuleRun` when executed
  - Stores scheduled time, timezone, and status
  - Tracks when it was created, executed, and cancelled

### 2. Service Layer (`src/server/services/campaigns.ts`)

- `scheduleEmailCampaign(ruleId, scheduledFor, timezone)` - Create a scheduled campaign
- `getScheduledCampaigns()` - Fetch pending/executing campaigns
- `getAllScheduledCampaigns()` - Fetch all campaigns (any status)
- `executeScheduledCampaign(scheduledCampaignId)` - Execute a scheduled campaign
- `cancelScheduledCampaign(scheduledCampaignId)` - Cancel a pending campaign

### 3. Server Actions (`src/app/_actions/campaigns.ts`)

- `scheduleEmailCampaignAction` - Schedule a campaign
- `getScheduledCampaignsAction` - Get pending campaigns
- `getAllScheduledCampaignsAction` - Get all campaigns
- `cancelScheduledCampaignAction` - Cancel a campaign

### 4. UI Components

#### Updated: `SendCampaignDialog.tsx`

- Added toggle between "Send Now" and "Schedule" modes
- Date and time picker inputs for scheduling
- Validation for future dates
- Different button text based on mode

#### New: `ScheduledCampaignsSection.tsx`

- Displays all pending scheduled campaigns
- Shows countdown until execution
- Cancel button for each scheduled campaign
- Auto-hides when no scheduled campaigns exist

#### Updated: `campaigns/page.tsx`

- Fetches and displays scheduled campaigns
- Shows them at the top of the campaigns dashboard
- Organized layout with sections

### 5. Scheduler (`src/server/services/campaign-scheduler.ts`)

- Uses `node-cron` to check every minute for due campaigns
- Automatically executes campaigns when their scheduled time arrives
- Handles errors gracefully with status tracking
- Logging with color-coded console output

### 6. Instrumentation (`src/instrumentation.ts`)

- Next.js instrumentation hook to start the scheduler on app startup
- Only runs in Node.js runtime (not Edge)

## How It Works

### User Flow:

1. User opens "Send Campaign" dialog from a rule
2. User toggles to "Schedule" mode
3. User selects date and time
4. User clicks "Schedule Campaign"
5. Campaign is saved with PENDING status
6. Campaign appears in the "Scheduled Campaigns" section

### Scheduler Flow:

1. Every minute, the scheduler checks for campaigns where `scheduledFor <= now` and `status = PENDING`
2. For each due campaign:
   - Marks it as EXECUTING
   - Fetches eligible cohort
   - Creates RuleRun and emails in a transaction
   - Links the run to the scheduled campaign
   - Marks as COMPLETED
   - Triggers email simulation worker
3. If any step fails, marks campaign as FAILED

### Cancellation Flow:

1. User clicks cancel button on a scheduled campaign
2. Campaign status is set to CANCELLED
3. Scheduler skips it in future checks
4. Campaign disappears from the UI

## Testing

To test the scheduled campaigns feature:

1. **Schedule a campaign for 2 minutes in the future**

   ```
   - Go to Rules page
   - Click "Send Campaign" on any rule
   - Toggle to "Schedule" mode
   - Select today's date
   - Select a time 2 minutes from now
   - Click "Schedule Campaign"
   ```

2. **Verify it appears in the dashboard**

   ```
   - Go to Campaigns page
   - Should see "Scheduled Campaigns" section
   - Should show countdown timer
   ```

3. **Wait for execution**

   ```
   - Wait 2+ minutes
   - Scheduler will automatically execute it
   - It will move to "Active & Completed Campaigns" section
   - Emails will go through queued → sent → delivered states
   ```

4. **Test cancellation**
   ```
   - Schedule another campaign
   - Click the X button to cancel
   - Campaign should disappear from the list
   ```

## Technical Details

- **Timezone Handling**: Currently defaults to "America/Los_Angeles" but is stored per campaign
- **Transaction Safety**: Campaign execution uses database transactions to ensure consistency
- **Worker Integration**: Scheduled campaigns use the same email simulation worker as immediate campaigns
- **Status Tracking**: Comprehensive status tracking (PENDING → EXECUTING → COMPLETED/FAILED/CANCELLED)
- **Error Handling**: Failed executions are marked as FAILED and logged

## Future Enhancements

- [ ] Add timezone selector in UI
- [ ] Add recurring schedule support (weekly/monthly)
- [ ] Add ability to edit scheduled campaigns
- [ ] Add email notifications when campaigns execute
- [ ] Add estimated cohort size preview for scheduled campaigns
- [ ] Add bulk scheduling from CSV/calendar integration
