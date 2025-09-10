# Didit KYC Simple Setup Guide

## 🔧 Environment Variables Required

Set this in your **Supabase Edge Functions** environment:

```bash
DIDIT_API_KEY=your_actual_didit_api_key_here
```

## 📍 How to Set Environment Variables in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** in the sidebar
3. Click on **Settings** or **Environment Variables**
4. Add: `DIDIT_API_KEY` = Your actual Didit API key

## 🔄 Deploy the Edge Function

```bash
supabase functions deploy didit-create-session --no-verify-jwt
```

## 🧪 Test the Integration

```bash
curl -X POST "https://your-project.supabase.co/functions/v1/didit-create-session" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test-user-123"}'
```

**Expected Success Response:**
```json
{
  "session_id": "didit_session_xxx",
  "client_url": "https://verify.didit.me/session/xxx",
  "expires_at": "2025-01-31T12:00:00.000Z"
}
```

**Expected Error (if API key missing):**
```json
{
  "error": "Missing DIDIT_API_KEY in secrets"
}
```

## 🔒 Security

- ✅ API key is never exposed to frontend
- ✅ All Didit API calls happen server-side
- ✅ Frontend only calls your Edge Function
- ✅ No credentials in browser code

## 📱 Frontend Usage

```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/didit-create-session`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
    'apikey': anonKey,
  },
  body: JSON.stringify({
    user_id: user.id,
    return_url: `${window.location.origin}/kyc/callback`
  })
})

const sessionData = await response.json()
// Use sessionData.client_url for verification iframe
```

## 🚨 Common Issues

- **"Missing DIDIT_API_KEY"** = Environment variable not set in Supabase
- **"Invalid API key"** = Wrong API key value or expired key
- **"Failed to create session"** = Check API key permissions and payload format

## ✅ Success Indicators

1. **No "Missing credentials" errors**
2. **Session creation returns `client_url`**
3. **Verification iframe loads successfully**
4. **Webhook receives completion events**