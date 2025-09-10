# Didit OAuth Authentication Setup

## 🔧 Required Environment Variables

You need to set these in your **Supabase Edge Functions** environment:

```bash
DIDIT_CLIENT_ID=your_didit_client_id
DIDIT_CLIENT_SECRET=your_didit_client_secret
DIDIT_WEBHOOK_SECRET=your_webhook_secret
```

## 📍 How to Get Your Didit Credentials

1. **Log into Didit Business Console**
   - Go to https://business.didit.me/
   - Sign in to your account

2. **Navigate to Application Settings**
   - Find your application in the dashboard
   - Go to Settings or API Credentials section

3. **Copy Your Credentials**
   - **Client ID**: Usually starts with `didit_` or similar
   - **Client Secret**: Long alphanumeric string
   - **Webhook Secret**: For webhook signature verification

## 🔄 How the OAuth Flow Works

1. **Get Access Token** (Server-side only)
   ```bash
   POST https://apx.didit.me/auth/v2/token/
   Authorization: Basic base64(client_id:client_secret)
   Content-Type: application/x-www-form-urlencoded
   
   grant_type=client_credentials
   ```

2. **Create Verification Session**
   ```bash
   POST https://verification.didit.me/v2/session/
   Authorization: Bearer {access_token}
   Content-Type: application/json
   
   {
     "user_id": "your-user-id"
   }
   ```

3. **Frontend Embeds Verification**
   - Use the `client_url` returned from session creation
   - Embed in iframe or redirect user

4. **Webhook Receives Results**
   - Didit sends verification results to your webhook
   - Webhook validates signature and updates database

## 🚨 Security Notes

- ✅ Client ID and Secret are never exposed to frontend
- ✅ Access tokens are generated server-side only
- ✅ All Didit API calls happen in Edge Functions
- ✅ Webhook signature verification prevents tampering

## 🔧 Setting Environment Variables in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** in the sidebar
3. Click on **Settings** or **Environment Variables**
4. Add these variables:
   - `DIDIT_CLIENT_ID` = Your Didit Client ID
   - `DIDIT_CLIENT_SECRET` = Your Didit Client Secret
   - `DIDIT_WEBHOOK_SECRET` = Your webhook secret

## 🔄 Redeploy Edge Functions

After setting environment variables:

1. In Supabase dashboard, go to **Edge Functions**
2. Find `didit-create-session` function
3. Click **Deploy** or **Redeploy**
4. Find `didit-webhook` function  
5. Click **Deploy** or **Redeploy**

## 🧪 Testing the Integration

Once configured, test with:

```bash
curl -X POST "https://your-project.supabase.co/functions/v1/didit-create-session" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -d '{"user_id": "test-user-123"}'
```

**Expected Success Response:**
```json
{
  "session_id": "didit_session_xxx",
  "client_url": "https://verification.didit.me/session/xxx",
  "expires_at": "2025-01-31T12:00:00.000Z",
  "message": "Verification session created successfully"
}
```

## 🐛 Common Issues

- **"Missing credentials"** = Environment variables not set in Supabase
- **"Invalid credentials"** = Wrong Client ID/Secret values
- **"Token expired"** = Need to refresh OAuth token (handled automatically)
- **"Invalid user_id"** = User ID format not accepted by Didit