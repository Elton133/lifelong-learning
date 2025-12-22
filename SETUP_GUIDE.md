# Setup Guide: PWA, Push Notifications & Voice Calls

This guide will help you set up the PWA features, push notifications, and voice call capabilities for the Lifelong Learning Platform.

## Prerequisites

- Node.js 18+ and npm
- Supabase account (for database)
- Twilio account (for voice calls - optional)
- HTTPS domain (required for PWA and push notifications in production)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the contents of `backend/src/database/schema.sql`
   - This will create all necessary tables including the new PWA tables
   - Tables created: `user_preferences`, `push_subscriptions`, `notification_logs`, `call_logs`, `pwa_installations`, `scheduled_events`

### 3. Generate VAPID Keys for Push Notifications

VAPID keys are required for web push notifications:

```bash
npx web-push generate-vapid-keys
```

This will output something like:
```
Public Key: BKxN8uV...
Private Key: dR3yPW...
```

**Important**: 
- The **public key** goes in BOTH frontend and backend .env files
- The **private key** goes ONLY in the backend .env file (keep it secret!)

### 4. Configure Environment Variables

#### Frontend (.env.local)

Create `/home/runner/work/lifelong-learning/lifelong-learning/.env.local`:

```env
# Supabase (public keys - safe for browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:4000

# VAPID Public Key (from step 3)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
```

#### Backend (.env)

Create `/home/runner/work/lifelong-learning/lifelong-learning/backend/.env`:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Server
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000

# Twilio (optional - for voice calls)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# VAPID Keys (from step 3)
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:your-email@example.com
```

### 5. Generate PWA Icons

You need to create icons for the PWA. Three options:

#### Option A: Using ImageMagick (Recommended)

```bash
cd public/icons

# Install ImageMagick
sudo apt-get install imagemagick

# Generate all sizes from SVG
convert icon.svg -resize 72x72 icon-72x72.png
convert icon.svg -resize 96x96 icon-96x96.png
convert icon.svg -resize 128x128 icon-128x128.png
convert icon.svg -resize 144x144 icon-144x144.png
convert icon.svg -resize 152x152 icon-152x152.png
convert icon.svg -resize 192x192 icon-192x192.png
convert icon.svg -resize 384x384 icon-384x384.png
convert icon.svg -resize 512x512 icon-512x512.png
```

#### Option B: Using Online Tool

1. Go to https://realfavicongenerator.net/
2. Upload `public/icons/icon.svg`
3. Download the generated package
4. Extract PNG files to `public/icons/`

#### Option C: Manual Creation

Create PNG images at the following sizes and save them in `public/icons/`:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

### 6. (Optional) Set Up Twilio for Voice Calls

Voice calls are optional. If you want to enable them:

1. Sign up at https://www.twilio.com
2. Get your Account SID and Auth Token from the Twilio Console
3. Purchase a phone number
4. Add credentials to `backend/.env` (see step 4)

### 7. Start the Development Servers

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## Testing the Features

### Test PWA Installation

1. Open the app in Chrome or Edge
2. You should see an install prompt
3. Click "Install" to add it to your device
4. The app icon should appear on your desktop/home screen

**Note**: PWA installation requires HTTPS in production. In development, localhost is allowed.

### Test Push Notifications

1. Go to Settings → Notifications tab
2. Click "Enable Push Notifications"
3. Grant permission when prompted
4. Configure your preferences
5. Click "Send Test Notification"
6. You should see a notification appear

**Troubleshooting**:
- Ensure VAPID keys are correctly set
- Check browser console for errors
- Verify service worker is active (DevTools → Application → Service Workers)

### Test Voice Calls

1. Ensure Twilio is configured (step 6)
2. Go to Settings → Voice Calls tab
3. Enable voice calls
4. Set your preferences
5. Use the backend test endpoint:

```bash
curl -X POST http://localhost:4000/api/calls/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"phoneNumber": "+1234567890"}'
```

**Note**: Voice calls require a Twilio account and will incur charges based on Twilio pricing.

## Production Deployment

### Pre-Deployment Checklist

- [ ] Configure production environment variables
- [ ] Generate production VAPID keys (different from development)
- [ ] Set up HTTPS (required for PWA and push notifications)
- [ ] Generate high-quality PWA icons (minimum 512x512)
- [ ] Test on various devices and browsers
- [ ] Configure proper CORS settings
- [ ] Set up error monitoring
- [ ] Review privacy policy and terms of service

### Deployment Steps

1. **Build the applications**:
```bash
# Frontend
npm run build

# Backend
cd backend
npm run build
```

2. **Deploy to your hosting platform** (e.g., Vercel, Netlify, Railway)

3. **Configure environment variables** in your hosting platform

4. **Test all features** in production environment

5. **Monitor logs** for any issues

## Important Security Notes

### API Keys

- ✅ **DO**: Keep `SUPABASE_SERVICE_ROLE_KEY` and `VAPID_PRIVATE_KEY` secret
- ✅ **DO**: Use different VAPID keys for development and production
- ✅ **DO**: Store Twilio credentials only in backend environment
- ❌ **DON'T**: Commit `.env` files to version control
- ❌ **DON'T**: Expose service role keys in frontend code
- ❌ **DON'T**: Share Twilio credentials

### HTTPS Requirement

- PWA features require HTTPS in production
- Push notifications require HTTPS
- Service workers require HTTPS (except localhost)
- Use Let's Encrypt for free SSL certificates

## Feature Configuration

### Customizing Notifications

Edit notification types in `backend/src/services/push-notification.service.ts`:

```typescript
// Add new notification type
export async function sendCustomNotification(
  userId: string,
  message: string,
  supabase: SupabaseClient
): Promise<SendNotificationResult> {
  // Implementation
}
```

### Customizing Voice Calls

Edit TwiML generation in `backend/src/services/twilio.service.ts`:

```typescript
// Customize call content
export function generateCustomTwiML(content: string): string {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();
  
  // Your custom TwiML logic
  
  return response.toString();
}
```

### Customizing Scheduler

Edit cron schedules in `backend/src/utils/scheduler.ts`:

```typescript
// Change schedule (cron format)
cron.schedule('0 9 * * *', async () => {
  // Runs daily at 9 AM
});
```

## Troubleshooting

### Service Worker Not Registering

1. Check browser console for errors
2. Ensure service worker file is at `/sw.js`
3. Verify HTTPS in production
4. Clear browser cache and reload

### Push Notifications Not Working

1. Verify VAPID keys match in frontend and backend
2. Check notification permission status
3. Ensure service worker is active
4. Test with local notification first
5. Check browser compatibility

### Voice Calls Failing

1. Verify Twilio credentials
2. Check phone number format (+1234567890)
3. Ensure backend URL is accessible from Twilio
4. Check Twilio console logs for errors
5. Verify account has sufficient balance

### Database Errors

1. Verify RLS policies are correct
2. Check if tables exist
3. Ensure user has proper permissions
4. Review Supabase logs

## Browser Compatibility

### PWA Support
- ✅ Chrome 67+
- ✅ Edge 79+
- ✅ Safari 16.4+ (limited support)
- ✅ Firefox 90+ (limited support)
- ✅ Opera 54+

### Push Notifications
- ✅ Chrome 50+
- ✅ Firefox 44+
- ✅ Edge 79+
- ✅ Safari 16+ (macOS 13+, iOS 16.4+)
- ❌ iOS Safari < 16.4

### Service Workers
- ✅ Chrome 40+
- ✅ Firefox 44+
- ✅ Edge 17+
- ✅ Safari 11.1+
- ✅ Opera 27+

## Getting Help

If you encounter issues:

1. Check the [PWA_NOTIFICATIONS_CALLS.md](./PWA_NOTIFICATIONS_CALLS.md) documentation
2. Review browser console for errors
3. Check Supabase logs
4. Review Twilio console logs (for call issues)
5. Ensure all environment variables are set correctly

## Next Steps

After setup:

1. Customize notification messages
2. Configure call schedules
3. Test on real devices
4. Monitor user engagement
5. Gather feedback and iterate

## Resources

- [Web Push Protocol](https://developers.google.com/web/fundamentals/push-notifications)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Twilio Voice API](https://www.twilio.com/docs/voice)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Supabase Documentation](https://supabase.com/docs)
