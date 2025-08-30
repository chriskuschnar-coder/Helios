# Local Deployment Setup

## Prerequisites
- Node.js 18+ installed on your machine
- Git installed
- A Supabase account (free tier works)

## Step 1: Download the Project
1. Download all project files from this WebContainer
2. Create a new folder on your machine: `hedge-fund-platform`
3. Copy all files into this folder

## Step 2: Install Dependencies
```bash
cd hedge-fund-platform
npm install
```

## Step 3: Set up Supabase
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (2-3 minutes)
3. Go to Settings → API in your Supabase dashboard
4. Copy your Project URL and anon public key

## Step 4: Configure Environment Variables
Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace with your actual Supabase credentials.

## Step 5: Set up Database Schema
In your Supabase dashboard:
1. Go to SQL Editor
2. Run the migration file: `supabase/migrations/20250829180131_little_flower.sql`
3. This creates all the necessary tables (users, accounts, transactions, etc.)

## Step 6: Run Locally
```bash
npm run dev
```

Your site will be available at `http://localhost:5173`

## Step 7: Test Real Authentication
- The demo credentials will still work
- You can also create real accounts that get stored in Supabase
- All data will persist in your Supabase database

## Deployment Options
Once working locally, you can deploy to:
- **Vercel**: `npm run build` then deploy the `dist` folder
- **Netlify**: Connect your GitHub repo for auto-deployment
- **Railway/Render**: Full-stack deployment with database

## Troubleshooting
- If you get CORS errors, make sure you're running on `localhost:5173`
- Check that your Supabase URL and keys are correct in `.env`
- Ensure the database migration ran successfully