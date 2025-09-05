# Global Market Consulting - Hedge Fund Website

A professional hedge fund platform featuring both a public corporate website and secure investor portal with integrated HELIOS trading terminal.

## Features

### Public Website
- **Home Page**: Hero section with mission statement and investment philosophy highlights
- **About Us**: Firm overview, corporate structure, and leadership team bios
- **Investment Approach**: Detailed investment strategies and risk management
- **Investor Relations**: Limited Partnership information and accredited investor inquiry form
- **Compliance & Disclosures**: Legal disclaimers, risk disclosures, and privacy policy
- **Contact**: Secure contact forms and office information

### Investor Portal
- **Secure Authentication**: NextAuth.js with credential-based login
- **Investor Dashboard**: Traditional investment overview with portfolio analytics
- **HELIOS Terminal**: Live trading terminal access (/helios)
- **Fund Integration**: All users access the same fund account terminal
- **Real-time Data**: Live MT5 integration with NAV updates
- **Payment Processing**: Stripe and crypto payment integration

## Tech Stack

- **Framework**: React with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: Supabase with PostgreSQL
- **Authentication**: Supabase Auth
- **Payments**: Stripe + NOWPayments (crypto)
- **Trading**: HELIOS Terminal Integration
- **Icons**: Lucide React

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Set up your `.env` file:
   ```bash
   # Supabase
   VITE_SUPABASE_URL="your-supabase-url"
   VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
   
   # Stripe
   VITE_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
   ```

3. **Database Setup**
   ```bash
   # Run Supabase migrations
   # Migrations are in supabase/migrations/
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Public website: http://localhost:5173
   - Investor portal: Login required
   - HELIOS Terminal: http://localhost:5173/helios

## HELIOS Terminal Integration

### Single Fund Account Access
- All users access the same HELIOS terminal at /helios
- Users see their proportional share of the fund performance
- No individual trading accounts - everyone invests in the main fund
- Real-time MT5 data integration for live performance tracking

### Fund Structure
- **Fund AUM**: $4.2M total assets under management
- **User Allocation**: Each user owns a percentage based on their investment
- **NAV Tracking**: Daily net asset value updates from MT5 trading system
- **Performance Sharing**: All users benefit from the same trading performance

## Database Schema

### Core Tables
- **users**: User authentication and profile data
- **accounts**: Individual user account balances and deposits
- **investor_units**: Fund unit allocation tracking (like mutual fund shares)
- **fund_nav**: Daily NAV updates from MT5 trading system
- **fund_transactions**: Subscription/redemption tracking
- **mt5_data_feed**: Live trading data from Python MT5 bot

## Design System

### Colors
- **Navy**: Primary brand color (#102a43 to #f0f4f8)
- **Charcoal**: Secondary neutral (#2d3748 to #f7f8f9)
- **Gold**: Accent color for highlights (#78350f to #fffdf7)

### Typography
- **Headings**: Georgia serif for institutional feel
- **Body**: Inter sans-serif for readability

## Security Features

- **Protected Routes**: All portal routes require authentication
- **Row Level Security**: Supabase RLS for data isolation
- **Secure Forms**: CSRF protection and input validation
- **Payment Security**: Stripe and NOWPayments integration

## Deployment

The application is ready to deploy to:
- **Bolt Hosting**: Optimized deployment
- **Netlify**: Static site with Supabase backend
- **Vercel**: Full-stack deployment

### Environment Setup for Production
1. Set up Supabase project and configure environment variables
2. Run database migrations
3. Configure Stripe webhook endpoints
4. Set up MT5 data feed integration

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## MT5 Integration

The platform is designed to receive live trading data from an MT5 Python bot:

1. **MT5 Bot**: Sends account data to `/functions/v1/mt5-data-processor`
2. **NAV Calculation**: Automatic NAV per unit calculation
3. **User Updates**: All investor allocations updated in real-time
4. **Dashboard Sync**: User dashboards show updated values immediately

## Support

For questions about implementation or customization, refer to the documentation or contact the development team.