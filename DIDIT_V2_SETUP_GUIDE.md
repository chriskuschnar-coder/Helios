# Didit v2 API Integration Setup Guide

## 🔧 Environment Variables Required

Set these in your **Supabase Edge Functions** environment:

```bash
DIDIT_API_KEY=your_actual_didit_api_key_here
DIDIT_WORKFLOW_ID=your_workflow_id_from_business_console
DIDIT_WEBHOOK_SECRET=your_webhook_secret_here
```

## 📍 How to Set Environment Variables in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** in the sidebar
3. Click on **Secrets**
4. Add these variables:
   - `DIDIT_API_KEY` = Your actual Didit API key
   - `DIDIT_WORKFLOW_ID` = Your workflow ID from Didit Business Console
   - `DIDIT_WEBHOOK_SECRET` = Your webhook secret for signature verification

## 🏗️ CRITICAL: Create Workflow in Didit Business Console

**This is the most important step that's likely missing:**

1. Visit https://business.didit.me
2. Log in to your Didit Business Console
3. Navigate to **Workflows** section
4. Click **Create New Workflow**
5. Choose **KYC Verification** workflow type
6. Configure verification settings:
   - Document types (passport, driver's license, etc.)
   - Countries to support
   - Verification methods (liveness detection, etc.)
   - Security settings
7. **Copy the Workflow ID** - this is required for API calls
8. Set webhook URL to: `https://upevugqarcvxnekzddeh.supabase.co/functions/v1/didit-webhook`

## 🔄 Proper V2 API Usage

### Session Creation Format:
```javascript
const sessionPayload = {
  workflow_id: "your_workflow_id_here", // REQUIRED - from Business Console
  callback: "https://yourapp.com/webhook",
  vendor_data: "user-uuid", // Your user identifier
  metadata: {
    user_type: "investor",
    account_id: "user-uuid"
  },
  contact_details: {
    email: "user@example.com",
    email_lang: "en"
  }
}

const response = await fetch('https://verification.didit.me/v2/session/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Api-Key': process.env.DIDIT_API_KEY // Note: X-Api-Key, not Authorization
  },
  body: JSON.stringify(sessionPayload)
})
```

### Expected Success Response:
```json
{
  "session_id": "11111111-2222-3333-4444-555555555555",
  "session_number": 1234,
  "session_token": "abcdef123456",
  "vendor_data": "user-123",
  "status": "Not Started",
  "workflow_id": "your_workflow_id",
  "callback": "https://yourapp.com/webhook",
  "url": "https://verify.didit.me/session/abcdef123456"
}
```

## 🌐 Webhook Configuration

Configure this webhook URL in your Didit Business Console:

```
https://upevugqarcvxnekzddeh.supabase.co/functions/v1/didit-webhook
```

### Webhook Event Format:
```json
{
  "session_id": "11111111-2222-3333-4444-555555555555",
  "vendor_data": "user-uuid",
  "status": "Approved", // or "Rejected", "Expired"
  "workflow_id": "your_workflow_id",
  "timestamp": "2025-01-30T12:00:00Z"
}
```

## 🧪 Testing the Integration

### Test 1: Verify Environment Variables

```bash
# Check if variables are set in Supabase Edge Functions
curl -X POST "https://upevugqarcvxnekzddeh.supabase.co/functions/v1/didit-create-session" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "user_id": "test-user-id",
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### Expected Error Messages:
- **"Missing DIDIT_API_KEY"** = API key not set in Supabase secrets
- **"Missing DIDIT_WORKFLOW_ID"** = Workflow not created or ID not set
- **"Invalid workflow configuration"** = Workflow ID doesn't exist in your console
- **"Invalid API credentials"** = API key is incorrect

## 🚨 Common Issues & Solutions

### Issue 1: "Failed to create verification session"
**Cause:** Missing workflow configuration
**Solution:** Create workflow in Business Console and set DIDIT_WORKFLOW_ID

### Issue 2: "Invalid API credentials" 
**Cause:** Wrong API key or header format
**Solution:** Use `X-Api-Key` header, verify key in Business Console

### Issue 3: "Workflow not found"
**Cause:** Workflow ID doesn't exist or is incorrect
**Solution:** Copy exact workflow ID from Business Console

### Issue 4: White screen in verification iframe
**Cause:** Invalid verification URL or CORS issues
**Solution:** Ensure workflow is properly configured and active

## 📋 Verification Flow

1. **Frontend** calls Edge Function to create session
2. **Edge Function** calls Didit v2 API with workflow_id
3. **Didit** returns session with verification URL
4. **User** completes verification in iframe
5. **Didit** sends webhook to your endpoint
6. **Webhook** updates compliance_records and users tables
7. **Frontend** polls database for status updates

## ✅ Success Indicators

1. **Session Creation**: Returns `session_id` and `url` without errors
2. **Iframe Loading**: Verification interface loads in iframe
3. **Webhook Processing**: Logs show "Compliance record updated"
4. **Status Updates**: User's `kyc_status` changes to 'verified'
5. **Frontend Flow**: User proceeds to funding after verification

## 🔧 Troubleshooting Checklist

- [ ] API key set in Supabase Edge Functions secrets
- [ ] Workflow created in Didit Business Console
- [ ] Workflow ID copied to DIDIT_WORKFLOW_ID environment variable
- [ ] Webhook URL configured in Business Console
- [ ] Webhook secret set in DIDIT_WEBHOOK_SECRET
- [ ] Using correct v2 API endpoints
- [ ] Using X-Api-Key header format
- [ ] Workflow is active and properly configured

The most common issue is missing workflow configuration. **You must create a workflow in the Didit Business Console before the API will work.**