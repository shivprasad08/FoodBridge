# Database Setup

## Quick Start

1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Copy and paste `schema.sql`
4. Run the script

## Schema Overview

### Tables

#### 1. `users`
Extends Supabase auth with application data.
- Role-based access (provider, volunteer, recipient)
- Location information
- Verification status

#### 2. `food_listings`
Food surplus posts from providers.
- Quantity, pickup location, time windows
- Status workflow: Available → Reserved → Collected → Delivered → Expired

#### 3. `tasks`
Volunteer delivery assignments.
- Links listings to volunteers and recipients
- Tracks pickup and delivery confirmation
- Status: Assigned → PickedUp → Delivered → Confirmed

#### 4. `audit_logs`
Immutable event log for compliance and debugging.

## Security

- **Row Level Security (RLS)** enabled on all tables
- Policies enforce role-based access
- Audit logs are insert-only

## Migrations

For future schema changes, create versioned migration files:
```
migrations/
  001_initial_schema.sql
  002_add_rating_system.sql
```

## Testing Data

Use Supabase Auth UI to create test users, then insert sample data via SQL editor or API.
