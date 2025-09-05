# Global Market Consulting - Hedge Fund Website

A professional, full-stack Next.js website for Global Market Consulting, featuring both a public corporate website and a secure investor portal.

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
- **Protected Dashboard**: Account summaries, performance metrics, and document access
- **Role-based Access**: Different access levels for investors and administrators
- **Document Management**: PDF reports, compliance documents, and investor letters

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: Prisma with SQLite (easily configurable for PostgreSQL)
- **Authentication**: NextAuth.js
- **UI Components**: Custom components with Headless UI
- **Icons**: Lucide React

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   Copy `.env.local` and update with your values:
   ```bash
   # Database
   DATABASE_URL="file:./dev.db"
   
   # NextAuth.js
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Stripe (optional)
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   ```

3. **Initialize Database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Public website: http://localhost:3000
   - Investor portal: http://localhost:3000/portal (requires authentication)

## Database Schema

The application includes a comprehensive database schema with:
- **User Management**: Users, accounts, sessions with role-based access
- **Investment Tracking**: Investment records with performance metrics
- **Authentication**: NextAuth.js integration with Prisma adapter

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
- **Role-based Access**: Different permissions for investors vs. administrators
- **Secure Forms**: CSRF protection and input validation
- **Data Encryption**: Passwords hashed with bcrypt

## Deployment

The application is ready to deploy to:
- **Vercel**: Optimized for Next.js deployment
- **Netlify**: Static site generation support
- **Railway/Render**: Full-stack deployment with database

### Environment Setup for Production
1. Set up a PostgreSQL database
2. Update `DATABASE_URL` in environment variables
3. Set secure `NEXTAUTH_SECRET`
4. Configure Stripe keys if using payment features

## Custom Dashboard Integration

The investor dashboard is currently using placeholder data. To integrate your custom dashboard:

1. Replace the placeholder data fetching in `InvestorDashboard.tsx`
2. Update the API routes to connect with your data sources
3. Modify the dashboard components to match your specific requirements

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
```

## Support

For questions about implementation or customization, refer to the documentation or contact the development team.