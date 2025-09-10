# Didit v2 API Integration Setup Guide

## 🔧 Environment Variables Required

Set these in your **Supabase Edge Functions** environment:

```bash
DIDIT_API_KEY=your_actual_didit_api_key_here
DIDIT_WEBHOOK_SECRET=your_webhook_secret_here
```

## 📍 How to Set Environment Variables in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** in the sidebar
3. Click on **Secrets**
4. Add these variables:
   - `DIDIT_API_KEY` = Your actual Didit API key
   - `DIDIT_WEBHOOK_SECRET` = Your webhook secret for signature verification

## 🔄 Deploy Edge Functions

```bash
# Deploy session creation function
supabase functions deploy didit-create-session --no-verify-jwt

# Deploy webhook handler
supabase functions deploy didit-webhook --no-verify-jwt
```

## 🌐 Webhook Configuration in Didit Dashboard

Configure this webhook URL in your Didit dashboard:

```
https://upevugqarcvxnekzddeh.supabase.co/functions/v1/didit-webhook
```

## 🧪 Testing the Integration

### Test 1: Manual Session Creation

```bash
curl -X POST "https://upevugqarcvxnekzddeh.supabase.co/functions/v1/didit-create-session" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "user_id": "77a1c31c-c52e-4ee4-bb7f-13a4c56375fc",
    "email": "blopbap@yahoo.com",
    "first_name": "Blop",
    "last_name": "Bap",
    "return_url": "https://yoursite.com/kyc/callback"
  }'
```

**Expected Success Response:**
```json
{
  "session_id": "didit_session_xxx",
  "client_url": "https://verification.didit.me/session/xxx",
  "expires_at": "2025-01-31T12:00:00.000Z",
  "message": "Didit v2 verification session created successfully"
}
```

**Expected Error (if API key missing):**
```json
{
  "error": "Missing DIDIT_API_KEY in secrets",
  "type": "didit_session_creation_failed"
}
```

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
    email: user.email,
    first_name: firstName,
    last_name: lastName,
    return_url: `${window.location.origin}/kyc/callback`
  })
})

const sessionData = await response.json()
// Use sessionData.client_url for verification iframe
```

## 🔒 Security Features

- ✅ API key is never exposed to frontend
- ✅ All Didit API calls happen server-side
- ✅ Webhook signature verification using HMAC-SHA256
- ✅ User authentication required for session creation
- ✅ Compliance records stored securely in database

## 📋 Didit v2 API Requirements

The v2 API requires these fields in the session creation:

```json
{
  "workflow": "kYC",
  "callback_url": "https://yourapp.com/webhook",
  "applicant": {
    "external_id": "user-uuid",
    "email": "user@example.com", 
    "first_name": "John",
    "last_name": "Doe"
  },
  "return_url": "https://yourapp.com/callback"
}
```

## 🚨 Common Issues

- **"Missing DIDIT_API_KEY"** = Environment variable not set in Supabase Edge Functions
- **"Invalid workflow"** = Workflow name doesn't match your Didit dashboard configuration
- **"Missing applicant fields"** = first_name, last_name, email are required
- **"Invalid callback_url"** = Webhook URL must be publicly accessible

## ✅ Success Indicators

1. **Session Creation**: Returns `client_url` without errors
2. **Webhook Processing**: Logs show "Compliance record updated"
3. **Status Updates**: User's `kyc_status` changes to 'verified'
4. **Frontend Flow**: Verification iframe loads and completes successfully

## 🔧 Troubleshooting

If you get a 400 error, check the Edge Function logs for the specific Didit API error message. Common issues:

1. **Wrong workflow name** - Update the `workflow` field to match your Didit dashboard
2. **Missing user data** - Ensure first_name and last_name are properly extracted
3. **Invalid callback URL** - Webhook URL must be publicly accessible
4. **API key permissions** - Verify your API key has session creation permissions

## 📝 Workflow Configuration

Make sure your Didit dashboard has a workflow named "kYC" (or update the workflow name in the Edge Function to match your actual workflow name).