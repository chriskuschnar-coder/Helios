# 📥 How to Download Your Hedge Fund Platform

Since WebContainer doesn't have a visible download button, here's how to manually copy your project files:

## Method 1: Copy-Paste Individual Files (Most Reliable)

### Step 1: Create Local Project Folder
1. **Create a folder** on your computer called `hedge-fund-platform`
2. **Create the same folder structure**:
   ```
   hedge-fund-platform/
   ├── src/
   │   ├── components/
   │   │   └── auth/
   │   └── lib/
   └── supabase/
       ├── functions/
       │   ├── api-proxy/
       │   └── hedge-fund-api/
       └── migrations/
   ```

### Step 2: Copy Files One by One
For each file in the WebContainer:
1. **Click on the file** in the file explorer (left sidebar)
2. **Select all content** (Ctrl+A / Cmd+A)
3. **Copy** (Ctrl+C / Cmd+C)
4. **Create the same file** on your computer
5. **Paste the content** (Ctrl+V / Cmd+V)

### 🎯 Essential Files to Copy (in order):

#### Root Files:
- ✅ `package.json` - Dependencies and scripts
- ✅ `.env` - **CRITICAL** - Contains your Supabase credentials
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ `vite.config.ts` - Vite build configuration
- ✅ `tailwind.config.js` - Styling configuration
- ✅ `postcss.config.js` - CSS processing
- ✅ `eslint.config.js` - Code linting
- ✅ `index.html` - Main HTML file

#### Source Files (src/):
- ✅ `src/main.tsx` - App entry point
- ✅ `src/App.tsx` - Main app component
- ✅ `src/index.css` - Global styles
- ✅ `src/vite-env.d.ts` - TypeScript definitions

#### Components (src/components/):
- ✅ `src/components/Hero.tsx`
- ✅ `src/components/About.tsx`
- ✅ `src/components/Services.tsx`
- ✅ `src/components/Performance.tsx`
- ✅ `src/components/Contact.tsx`
- ✅ `src/components/Header.tsx`
- ✅ `src/components/Footer.tsx`
- ✅ `src/components/InvestmentPlatform.tsx`
- ✅ `src/components/DashboardSelector.tsx`
- ✅ `src/components/InvestorDashboard.tsx`
- ✅ `src/components/HeliosDashboard.tsx`

#### Auth Components (src/components/auth/):
- ✅ `src/components/auth/AuthProvider.tsx`
- ✅ `src/components/auth/LoginForm.tsx`
- ✅ `src/components/auth/SignupForm.tsx`

#### Libraries (src/lib/):
- ✅ `src/lib/supabase-client.ts` - Main Supabase client
- ✅ `src/lib/supabase.ts` - Direct Supabase connection
- ✅ `src/lib/supabase-proxy.ts` - WebContainer proxy
- ✅ `src/lib/mock-data.ts` - Demo data

#### Supabase Files:
- ✅ `supabase/migrations/20250829180131_little_flower.sql` - Database schema
- ✅ `supabase/functions/hedge-fund-api/index.ts` - Main Edge Function
- ✅ `supabase/functions/api-proxy/index.ts` - Proxy Edge Function

## 💡 Pro Tips:

### Start with Core Files:
If you want to test quickly, copy these first:
1. `package.json`
2. `.env` (CRITICAL!)
3. `src/main.tsx`
4. `src/App.tsx`
5. `src/index.css`
6. `index.html`

Then run `npm install && npm run dev` to test basic functionality.

### Copy Strategy:
- **Copy root files first** (package.json, .env, etc.)
- **Then src/ folder contents**
- **Finally supabase/ folder contents**

## ⚡ Quick Test After Copying:

Once you have the essential files:
```bash
cd hedge-fund-platform
npm install
npm run dev
```

Open http://localhost:5173 and you should see:
- ✅ **No more fetch errors** (real Supabase connection)
- ✅ **Demo mode** working: `demo@globalmarket.com` / `demo123456`
- ✅ **Real user registration** capability

## 🆘 If You Get Stuck:

The **most critical file** is `.env` - it contains your Supabase credentials. Even if you only copy a few files initially, make sure `.env` is one of them!

Start with the core files, test locally, then copy the rest once you confirm it's working.