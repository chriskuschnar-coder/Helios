# Didit KYC Integration Setup Instructions

## 🔧 Environment Variables Required

You must set these environment variables in your **Supabase Edge Functions** environment:

```bash
DIDIT_API_KEY=your_actual_didit_api_key_here
DIDIT_WEBHOOK_SECRET=KcTr4GhFOOHDNlJDuvY3EAOwoPXfoYPB092L1HpXr00
```

## 📍 How to Set Environment Variables in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** in the sidebar
3. Click on **Settings** or **Environment Variables**
4. Add the following variables:
   - `DIDIT_API_KEY` = Your actual Didit API key
   - `DIDIT_WEBHOOK_SECRET` = `KcTr4GhFOOHDNlJDuvY3EAOwoPXfoYPB092L1HpXr00`

## 🔄 Redeploy Edge Functions

After setting environment variables, you need to redeploy the Edge Functions:

1. In Supabase dashboard, go to **Edge Functions**
2. Find `didit-create-session` function
3. Click **Deploy** or **Redeploy**
4. Find `didit-webhook` function  
5. Click **Deploy** or **Redeploy**

## 🌐 Webhook Configuration in Didit Dashboard

Configure this webhook URL in your Didit dashboard:

```
https://upevugqarcvxnekzddeh.supabase.co/functions/v1/didit-webhook
```

## 🔒 Security Features

- ✅ API key is never exposed to frontend
- ✅ All Didit API calls happen server-side
- ✅ Webhook signature verification using HMAC-SHA256
- ✅ User authentication required for session creation
- ✅ Compliance records stored securely in database

## 📱 Frontend Usage

The frontend calls the Edge Function like this:

```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/didit-create-session`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
    'apikey': anonKey,
    'origin': window.location.origin
  },
  body: JSON.stringify({
    user_id: user.id,
    return_url: `${window.location.origin}/kyc/callback`
  })
})
```

## 🐛 Debugging

If you still get authentication errors:

1. **Check Edge Function logs** in Supabase dashboard
2. **Verify API key** is correctly set (no extra spaces/characters)
3. **Test API key** directly with Didit's API documentation
4. **Check webhook secret** matches exactly: `KcTr4GhFOOHDNlJDuvY3EAOwoPXfoYPB092L1HpXr00`

## ✅ Expected Flow

1. User clicks "Start Identity Verification"
2. Frontend calls `didit-create-session` Edge Function
3. Edge Function creates Didit session using server-side API key
4. Frontend receives `client_url` and displays verification iframe
5. User completes verification in Didit interface
6. Didit sends webhook to `didit-webhook` Edge Function
7. Webhook updates user's KYC status in database
8. Frontend polls for status updates and proceeds when verified

## 🚨 Common Issues

- **"You must be authenticated"** = API key not set in Supabase Edge Functions environment
- **"Invalid signature"** = Webhook secret mismatch
- **"Session creation failed"** = Check API key validity and payload format
- **"Webhook not received"** = Check webhook URL configuration in Didit dashboard