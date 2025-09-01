# Deployment Instructions

## Manual Netlify Deployment

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Upload to Netlify:**
   - Go to https://app.netlify.com/drop
   - Drag and drop the `dist` folder
   - Or use Netlify CLI: `netlify deploy --prod --dir=dist`

3. **Set Environment Variables in Netlify:**
   - Go to Site settings → Environment variables
   - Add: `VITE_SUPABASE_URL` = your Supabase URL
   - Add: `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

4. **Redeploy after setting environment variables**

## Alternative: Use Bolt's "Connect to Supabase" Button

Click the "Connect to Supabase" button in the top right of Bolt to automatically configure everything.

## Current Status

- ✅ Build process fixed (no more duplicate signOut errors)
- ✅ WebContainer proxy code removed
- ✅ Direct Supabase client implemented
- ❌ Environment variables need to be set in Netlify
- ❌ Cross-device authentication requires Supabase connection

## Test URLs

After deployment with proper environment variables:
- Login should work across all devices
- No more "Supabase not configured" errors
- Real database authentication instead of localStorage