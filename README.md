# Rally

Service Re-Engagement Email Agent for Automotive Dealerships

## Overview

Rally is an automated platform that helps car dealerships re-engage past service customers through intelligent, scheduled email campaigns. The system tracks service history, creates targeted cohorts, and manages email conversations with customers—complete with AI-powered reply simulation.

## Features

### 🎯 Rule-Based Campaigns

- Define service reminder rules (oil changes, tire rotations, brake inspections, etc.)
- Set custom cadences (every 3, 6, or 12 months)
- Configure send windows and timezones
- Enable/disable rules on the fly

### 👥 Customer & Vehicle Management

- Track customers, vehicles, and service history
- Vehicle identification via VIN and license plate
- Comprehensive service tracking
- Appointment scheduling

### 📧 Email Conversations

- Threaded email conversations
- Track email status (queued → sent → delivered)
- View full conversation history
- Reply count badges

### 🤖 AI-Powered Reply Simulation

- OpenAI-powered customer response generation
- Realistic, contextual replies
- Varied customer personalities (eager, hesitant, price-conscious, etc.)
- Fallback to preset responses if AI unavailable

### 📅 Campaign Scheduling

- Schedule campaigns for future dates
- Automatic execution via background worker
- Real-time campaign monitoring
- Live email sending simulation

## Tech Stack

- **Framework:** Next.js 16 with React 19
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **AI:** OpenAI GPT-4o-mini (optional)
- **Forms:** React Hook Form with Zod validation
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 20+ (or compatible runtime)
- PostgreSQL database
- pnpm package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd rally
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env` file:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/rally"
   NODE_ENV="development"

   # Optional: For AI-powered customer replies
   OPENAI_API_KEY="sk-your-api-key-here"
   ```

4. **Set up the database**

   ```bash
   # Run migrations
   pnpm db:migrate

   # Seed with sample data
   pnpm db:seed
   ```

5. **Start the development server**

   ```bash
   pnpm dev
   ```

6. **Visit the app**

   Open [http://localhost:3000](http://localhost:3000)

## AI Setup (Optional)

Rally supports AI-powered customer reply simulation using OpenAI. This is **completely optional**—the app works perfectly fine without it using preset responses.

To enable AI features:

1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to your `.env` file:
   ```env
   OPENAI_API_KEY="sk-your-api-key-here"
   ```

For detailed setup instructions, see [AI_SETUP.md](./AI_SETUP.md)

**Cost:** ~$0.0001 per simulated reply (less than 1/100th of a cent)

## Project Structure

```
rally/
├── prisma/
│   ├── migrations/        # Database migrations
│   ├── schema.prisma      # Database schema
│   └── seed.ts           # Seed data
├── src/
│   ├── app/
│   │   ├── _actions/     # Server actions
│   │   ├── _components/  # React components
│   │   ├── campaigns/    # Campaign pages
│   │   ├── conversations/# Conversation pages
│   │   └── rules/        # Rule management pages
│   ├── components/ui/    # Reusable UI components
│   ├── constants/        # App constants
│   ├── lib/             # Utility functions
│   ├── schemas/         # Zod validation schemas
│   └── server/
│       ├── db.ts        # Database client
│       ├── env.ts       # Environment validation
│       ├── services/    # Business logic
│       └── workers/     # Background jobs
└── public/              # Static assets
```

## Usage

### Creating a Rule

1. Navigate to **Rules** page
2. Click **Create New Rule**
3. Configure:
   - Rule name
   - Service type
   - Cadence (months between reminders)
   - Send window (days before/after due date)
   - Email template with placeholders
4. Preview eligible customers
5. Save rule

### Launching a Campaign

1. Go to **Rules** page
2. Click **Send Campaign** on a rule
3. Review the cohort preview
4. Choose:
   - **Send Now** - Immediate execution
   - **Schedule** - Set a future date/time
5. Monitor progress on **Campaigns** page

### Viewing Conversations

1. Navigate to **Campaigns**
2. Click on a campaign
3. See all email conversations
4. Click on any conversation to view thread
5. Use **Simulate Reply** to generate customer responses

## Database Schema

Key models:

- **Customer** - Customer information and contact details
- **Vehicle** - Vehicle details linked to customers
- **ServiceHistory** - Past service records
- **Rule** - Campaign rules and templates
- **RuleRun** - Campaign execution instances
- **Email** - Email messages with threading support
- **ScheduledCampaign** - Future campaign scheduling
- **Appointment** - Booked service appointments

See [prisma/schema.prisma](./prisma/schema.prisma) for full schema.

## Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm format           # Format with Prettier
pnpm type-check       # TypeScript type checking

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed database
pnpm db:studio        # Open Prisma Studio
pnpm db:reset         # Reset database (caution!)
```

## Environment Variables

| Variable         | Required | Description                                   |
| ---------------- | -------- | --------------------------------------------- |
| `DATABASE_URL`   | Yes      | PostgreSQL connection string                  |
| `NODE_ENV`       | Yes      | Environment: development, test, or production |
| `OPENAI_API_KEY` | No       | OpenAI API key for AI replies (optional)      |

## Documentation

- [AI Setup Guide](./AI_SETUP.md) - Configure OpenAI integration
- [Instructions](./instructions.md) - Original project requirements
- [Scheduled Campaigns](./SCHEDULED_CAMPAIGNS.md) - Campaign scheduling details

## Contributing

This is a demo project built as a technical assessment. Feel free to fork and modify for your needs.

## License

MIT
