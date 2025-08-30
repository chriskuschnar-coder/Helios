# ⚡ Quick Start - 2 Minutes to Local Deployment

## Prerequisites
- Node.js 18+ installed
- The project files downloaded from WebContainer

## Steps

1. **Open terminal** in your project folder

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** to: http://localhost:5173

## ⚠️ Important: Get Your Supabase Anon Key

Before running, you need to update your `.env` file:

1. **Go to**: https://supabase.com/dashboard
2. **Select your project**: upevugqarcvxnekzddeh  
3. **Go to Settings** → **API**
4. **Copy the "anon public" key** (starts with `eyJ...`)
5. **Replace `your_anon_key_here`** in `.env` with your actual key

## That's It! 🎉

Your hedge fund platform is now running locally with:

- ✅ **Real Supabase connection** (no WebContainer restrictions)
- ✅ **Demo mode**: `demo@globalmarket.com` / `demo123456`
- ✅ **Real user registration** (creates actual accounts)
- ✅ **Working charts** and real-time data
- ✅ **Both dashboards**: Investor Portal + Helios Trading

## Environment Already Configured

Your `.env` file already contains:
- Supabase URL
- Supabase anon key
- Database schema is deployed
- Edge Functions are ready

## Test Both Modes

1. **Demo Mode**: Use demo credentials to explore
2. **Real Mode**: Create a new account with your email

Everything persists to your Supabase database when running locally!

## Deploy to Production

Once working locally:
```bash
npm run build
```

Upload the `dist` folder to any hosting provider (Vercel, Netlify, etc.).