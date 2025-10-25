# Campaign Flow Diagram

This diagram shows the three different ways to execute email campaigns in the Rally system.

```mermaid
flowchart TD
    Start([User Action]) --> Choice{Campaign Type?}
    
    %% Send Now Path
    Choice -->|Send Now| SendNow[sendEmailCampaignAction]
    SendNow --> ExecuteImmediate[executeEmailCampaign]
    ExecuteImmediate --> CreateRun1[Create RuleRun]
    CreateRun1 --> CreateTargets1[Create RuleTargets]
    CreateTargets1 --> CreateEmails1[Create Emails]
    CreateEmails1 --> Simulate1[Simulate Email Sending]
    Simulate1 --> Done1([Done])
    
    %% Schedule Path
    Choice -->|Schedule Once| Schedule[scheduleEmailCampaignAction]
    Schedule --> CreateScheduled[Create ScheduledCampaign<br/>status: PENDING]
    CreateScheduled --> Wait1[Wait for scheduled time]
    Wait1 --> Cron1{Cron Scheduler<br/>checks every minute}
    Cron1 -->|Time reached| ExecuteScheduled[executeScheduledCampaign]
    ExecuteScheduled --> CreateRun2[Create RuleRun]
    CreateRun2 --> CreateTargets2[Create RuleTargets]
    CreateTargets2 --> CreateEmails2[Create Emails]
    CreateEmails2 --> MarkCompleted[Mark ScheduledCampaign<br/>as COMPLETED]
    MarkCompleted --> Simulate2[Simulate Email Sending]
    Simulate2 --> Done2([Done])
    
    %% Recurring Path
    Choice -->|Recurring| Recurring[createRecurringScheduleAction]
    Recurring --> CreateRecurring[Create RecurringSchedule<br/>isActive: true]
    CreateRecurring --> CalcNext1[Calculate Next Execution]
    CalcNext1 --> CreateFirst[Create First<br/>ScheduledCampaign]
    CreateFirst --> Wait2[Wait for scheduled time]
    Wait2 --> Cron2{Cron Scheduler<br/>checks every minute}
    Cron2 -->|Time reached| ExecuteRecurring[executeScheduledCampaign]
    ExecuteRecurring --> CreateRun3[Create RuleRun]
    CreateRun3 --> CreateTargets3[Create RuleTargets]
    CreateTargets3 --> CreateEmails3[Create Emails]
    CreateEmails3 --> Simulate3[Simulate Email Sending]
    Simulate3 --> CheckRecurring{Has Recurring<br/>Schedule?}
    CheckRecurring -->|Yes & Active| CalcNext2[Calculate Next Execution]
    CalcNext2 --> CreateNext[Create Next<br/>ScheduledCampaign]
    CreateNext --> Wait2
    CheckRecurring -->|No/Inactive| Done3([Done])
    
    style SendNow fill:#e1f5e1
    style Schedule fill:#e1e5f5
    style Recurring fill:#f5e1e5
```

## Campaign Types

### 1. Send Now (Green Path)
- **Action**: `sendEmailCampaignAction`
- **Behavior**: Immediate execution
- **Use Case**: Send campaign right away
- **Flow**: Direct execution without any scheduling

### 2. Schedule Once (Blue Path)
- **Action**: `scheduleEmailCampaignAction`
- **Behavior**: Execute once at a specific time
- **Use Case**: Plan a campaign for a future date/time
- **Flow**: 
  - Creates a `ScheduledCampaign` with status `PENDING`
  - Cron scheduler checks every minute for due campaigns
  - Executes when time is reached
  - Marks as `COMPLETED` after execution

### 3. Recurring (Red Path)
- **Action**: `createRecurringScheduleAction`
- **Behavior**: Execute repeatedly on a schedule (daily, weekly, monthly)
- **Use Case**: Automated campaigns that run on a regular basis
- **Flow**:
  - Creates a `RecurringSchedule` with `isActive: true`
  - Calculates next execution time
  - Creates a `ScheduledCampaign` for next run
  - After execution, automatically creates the next scheduled campaign
  - Continues indefinitely until paused or stopped

## Common Execution Flow

All three paths eventually go through the same core execution steps:
1. **Create RuleRun**: Creates a record of the campaign execution
2. **Create RuleTargets**: Identifies which vehicles/customers to target
3. **Create Emails**: Generates email records for each target
4. **Simulate Email Sending**: Simulates the actual sending process

## Key Components

- **Cron Scheduler**: Runs every minute checking for due scheduled campaigns
- **executeScheduledCampaign**: Common execution function for both scheduled and recurring campaigns
- **calculateNextExecution**: Determines the next run time for recurring schedules

