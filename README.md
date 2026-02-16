# AdReport - Advertising Analytics Dashboard

A comprehensive demo application showcasing modern web development with Next.js, React Hook Form, Zod validation, and MySQL database integration.

## Features

### TailwindCSS Implementation
- ✅ Media queries for responsive design
- ✅ Pseudo-classes (hover, active, focus, etc.)
- ✅ Container class usage
- ✅ Group class for interactive elements
- ✅ Custom animations (slide-in, fade-in, pulse)

### TypeScript
- ✅ Union and Intersection types
- ✅ Built-in generic types (Partial, Omit, Record, etc.)
- ✅ Function overloads
- ✅ Type definitions for states and references
- ✅ Type predicates

### React Hook Form & Zod
- ✅ Multi-step form with useForm
- ✅ Zod schema validation
- ✅ Navigation between form steps
- ✅ Custom range slider control
- ✅ Regex validation and refine methods

### Shadcn UI Components
- ✅ React Hook Form integration
- ✅ Dialog for modals
- ✅ Card components
- ✅ Table for data display
- ✅ Tooltip for helpful hints
- ✅ Dropdown Menu
- ✅ Area and Bar Charts

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

The application connects to a MySQL database at `database.401-me.tech`.

**Run the database schema:**

You can execute the `database-schema.sql` file on your MySQL server:

```bash
mysql -h database.401-me.tech -u api -p < database-schema.sql
# When prompted, enter password: MocneHaslo123!
```

Or manually create the database using any MySQL client with the credentials:
- Host: `database.401-me.tech`
- User: `api`
- Password: `MocneHaslo123!`
- Database: `adreport`

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Account

- **Username:** `demo`
- **Password:** `demo123`

## Application Structure

### Pages
- `/` - Redirects to login
- `/login` - Authentication page
- `/dashboard` - Main analytics dashboard

### API Routes
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/ads` - Fetch user's ads
- `POST /api/ads` - Create new ad
- `GET /api/stats` - Fetch dashboard statistics

### Components
- `components/ui/*` - Shadcn UI components
- `components/add-ad-form.tsx` - Multi-step form for creating ads

### Database Schema

**Users Table:**
- id, username, email, password, created_at

**Ads Table:**
- id, user_id, campaign_name, platform, ad_type, budget, target_audience
- start_date, end_date, status, impressions, clicks, conversions, cost
- created_at, updated_at

**Ad Analytics Table:**
- id, ad_id, date, impressions, clicks, conversions, cost

## Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS 4
- **Forms:** React Hook Form + Zod
- **UI Components:** Shadcn UI + Radix UI
- **Charts:** Recharts
- **Database:** MySQL 2
- **Authentication:** bcryptjs

## Features Demonstrated

### Multi-Step Form
The "Add Ad" form demonstrates:
1. **Step 1:** Campaign basic information
2. **Step 2:** Budget and scheduling (with custom range slider)
3. **Step 3:** Targeting and status selection

Each step:
- Validates independently
- Prevents progression until valid
- Allows navigation back to previous steps
- Shows visual progress indicator

### Dashboard Analytics
- Real-time statistics display
- Interactive charts (Area and Bar charts)
- Data table with campaign details
- Responsive grid layout

### Validation Examples
- Regex pattern matching for usernames and campaign names
- Zod refine for custom validation logic
- Date range validation
- Budget constraints

## Development Notes

This is a demo application showcasing various modern web development patterns and best practices. The database contains sample data for demonstration purposes.

## License

MIT
