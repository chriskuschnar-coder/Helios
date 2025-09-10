# Didit KYC Edge Functions Deployment Guide

## 🚀 Deployment Steps

### 1. Environment Variables Required

Set these in your **Supabase Edge Functions** environment:

```bash
DIDIT_API_KEY=your_actual_didit_api_key_here
DIDIT_WEBHOOK_SECRET=KcTr4GhFOOHDNlJDuvY3EAOwoPXfoYPB092L1HpXr00
```

### 2. Deploy Edge Functions

Run these commands to deploy all 3 functions:

```bash
# Deploy session creation function
supabase functions deploy didit-create-session --no-verify-jwt

# Deploy webhook handler
supabase functions deploy didit-webhook --no-verify-jwt

# Deploy status checker
supabase functions deploy check-kyc-status --no-verify-jwt
```

### 3. Configure Webhook URL in Didit Dashboard

Add this webhook URL to your Didit dashboard:

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
  -d '{"user_id": "test-user-123", "return_url": "https://yoursite.com/kyc/callback"}'
```

**Expected Success Response:**
```json
{
  "session_id": "didit_session_xxx",
  "client_url": "https://verify.didit.me/session/xxx",
  "expires_at": "2025-01-31T12:00:00.000Z",
  "message": "Verification session created successfully"
}
```

**Expected Error (if API key missing):**
```json
{
  "error": "Missing DIDIT_API_KEY in secrets",
  "type": "didit_session_creation_failed"
}
```

### Test 2: Check KYC Status

```bash
curl -X GET "https://upevugqarcvxnekzddeh.supabase.co/functions/v1/check-kyc-status" \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY"
```

### Test 3: Webhook Simulation

```bash
curl -X POST "https://upevugqarcvxnekzddeh.supabase.co/functions/v1/didit-webhook" \
  -H "Content-Type: application/json" \
  -H "x-didit-signature: test_signature" \
  -d '{"session_id": "test_session", "applicant_id": "test_user", "status": "verified"}'
```

## 🔧 Troubleshooting

### Error: "Missing DIDIT_API_KEY in secrets"
- Go to Supabase Dashboard → Edge Functions → Settings
- Add `DIDIT_API_KEY` environment variable
- Redeploy the functions

### Error: "You must be authenticated with a valid access token"
- This means the API key is not being sent correctly
- Verify the API key is set in Supabase (not just local .env)
- Check that you're using `X-API-Key` header (not Authorization)

### Error: "Invalid webhook signature"
- Verify `DIDIT_WEBHOOK_SECRET` matches exactly
- Check that Didit is sending the signature in the correct header

## 📋 Frontend Integration

The frontend should call the Edge Function like this:

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

## ✅ Success Indicators

1. **Session Creation**: Returns `client_url` without errors
2. **Webhook Processing**: Logs show "Compliance record updated"
3. **Status Updates**: User's `kyc_status` changes to 'verified'
4. **Frontend Flow**: Verification iframe loads and completes successfully

## 🚨 Security Notes

- ✅ API key is never exposed to frontend
- ✅ All Didit API calls happen server-side
- ✅ Webhook signature verification using HMAC-SHA256
- ✅ User authentication required for session creation
- ✅ Compliance records stored securely in database