# PWA, Push Notifications, and Voice Calls Implementation

This document describes the implementation of Progressive Web App (PWA) features, push notifications, and automated voice calls for the Lifelong Learning Platform.

## Table of Contents

1. [Overview](#overview)
2. [Progressive Web App (PWA)](#progressive-web-app-pwa)
3. [Push Notifications](#push-notifications)
4. [Voice Calls](#voice-calls)
5. [Event-Driven Triggers](#event-driven-triggers)
6. [Setup Instructions](#setup-instructions)
7. [API Reference](#api-reference)
8. [Security Considerations](#security-considerations)

## Overview

The platform now includes three major enhancements:

1. **PWA Support**: Install the app on mobile/desktop devices with offline capabilities
2. **Push Notifications**: Receive lesson reminders, new content alerts, and achievement notifications
3. **Voice Calls**: Automated calls for reminders and micro-lessons via Twilio

All features respect user preferences, time windows, and privacy settings.

## Progressive Web App (PWA)

### Features

- ✅ Installable on iOS, Android, and Desktop
- ✅ Offline support with service worker caching
- ✅ App-like experience in standalone mode
- ✅ Fast loading with cached assets
- ✅ Background sync for offline actions

### Implementation Files

- `/public/manifest.json` - Web app manifest
- `/public/sw.js` - Service worker for caching and offline support
- `/lib/pwa.ts` - PWA utility functions
- `/components/pwa/PWAInstaller.tsx` - Install prompt component
- `/components/pwa/ServiceWorkerRegistration.tsx` - SW registration component

### Caching Strategy

- **Static Assets**: Cache-first strategy (fonts, images, CSS)
- **API Requests**: Network-first with cache fallback
- **Dynamic Content**: Runtime cache with automatic cleanup

### Installation

The app will automatically prompt users to install when:
- Using a supported browser (Chrome, Edge, Safari 16.4+)
- Not already installed
- User hasn't dismissed the prompt

To manually trigger installation, users can use the browser's install option.

## Push Notifications

### Features

- ✅ Web Push API for cross-platform notifications
- ✅ Customizable notification types (reminders, new content, achievements, insights)
- ✅ Time window settings (quiet hours)
- ✅ Quiet days configuration
- ✅ Click tracking and analytics
- ✅ Offline notification queuing

### Implementation Files

- `/lib/push-notifications.ts` - Frontend notification utilities
- `/backend/src/services/push-notification.service.ts` - Backend notification service
- `/backend/src/routes/notifications.routes.ts` - Notification API endpoints
- `/components/settings/NotificationSettings.tsx` - User settings UI

### Setup Requirements

1. **Generate VAPID Keys**:
```bash
npx web-push generate-vapid-keys
```

2. **Configure Environment Variables**:
```env
# Backend (.env)
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_SUBJECT=mailto:your-email@example.com

# Frontend (.env.local)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
```

### Notification Types

1. **Lesson Reminders**: Notify users about pending lessons
2. **New Content**: Alert users about new content matching their interests
3. **Achievements**: Celebrate when users unlock achievements
4. **Insights**: Share AI-generated learning insights

### User Preferences

Users can customize:
- Enable/disable push notifications
- Select which notification types to receive
- Set time window (e.g., 9 AM - 9 PM)
- Configure quiet days (e.g., weekends)

### API Endpoints

```typescript
POST /api/notifications/subscribe
POST /api/notifications/unsubscribe
GET /api/notifications/preferences
PATCH /api/notifications/preferences
GET /api/notifications/history
POST /api/notifications/track-click
```

## Voice Calls

### Features

- ✅ Automated voice calls via Twilio
- ✅ Two call types: Reminders and Micro-lessons
- ✅ Text-to-speech for dynamic content
- ✅ Pre-recorded audio support
- ✅ Interactive responses (IVR)
- ✅ Call analytics and tracking

### Implementation Files

- `/backend/src/services/twilio.service.ts` - Twilio integration
- `/backend/src/routes/calls.routes.ts` - Call API endpoints
- `/components/settings/VoiceCallSettings.tsx` - User settings UI

### Setup Requirements

1. **Twilio Account**:
   - Sign up at https://www.twilio.com
   - Get Account SID and Auth Token
   - Purchase a phone number

2. **Configure Environment Variables**:
```env
# Backend (.env)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Call Types

#### 1. Reminder Calls
- Purpose: Remind users about pending lessons or inactivity
- Duration: 30-60 seconds
- Content: Personalized message with user's name
- Example: "Hi John! You haven't completed your daily lesson yet."

#### 2. Micro-Lesson Calls
- Purpose: Deliver short educational content
- Duration: 60-120 seconds
- Content: Brief lesson summary with key takeaways
- Interactive: Users can press 1 to save or 2 to replay

### TwiML Endpoints

The system generates dynamic TwiML (Twilio Markup Language) for calls:

- `/api/calls/twiml/reminder` - Reminder call script
- `/api/calls/twiml/micro_lesson` - Micro-lesson call script
- `/api/calls/twiml/audio` - Play pre-recorded audio
- `/api/calls/response` - Handle user input during calls

### User Preferences

Users can customize:
- Enable/disable voice calls
- Call frequency (daily, weekly, biweekly, never)
- Preferred call duration (30s, 60s, 90s, 2min)
- Time window for calls
- Quiet days (no calls on weekends, etc.)

### Call Flow

1. System schedules a call based on user preferences
2. Twilio initiates the call at scheduled time
3. User answers and hears the message
4. (Optional) User can interact via keypad
5. Call status is tracked and logged
6. Analytics are updated

### Privacy & Security

- Phone numbers are stored securely
- All calls are encrypted via Twilio
- Users can opt-out anytime
- No sensitive information is transmitted
- Calls respect user time preferences

## Event-Driven Triggers

### Automated Events

The system automatically triggers notifications and calls based on:

1. **Inactivity Detection**:
   - Triggers after 2 days without activity
   - Sends reminder notification
   - Schedules call if enabled

2. **New Content**:
   - Matches content to user interests
   - Notifies interested users
   - Respects user preferences

3. **Daily Micro-Lessons**:
   - Scheduled based on call frequency
   - Uses user's daily playlist
   - Respects time windows

4. **Goal Achievements**:
   - Detects milestone completions
   - Sends celebration notifications

### Scheduler

Background jobs run at intervals:

- **Inactive Users Check**: Daily at 9 AM
- **Daily Micro-Lessons**: Daily at 8 AM
- **Process Scheduled Events**: Every 5 minutes
- **Goal Achievements**: Daily at 6 PM

Implementation: `/backend/src/utils/scheduler.ts`

## Setup Instructions

### 1. Database Setup

Run the updated schema SQL in your Supabase SQL Editor:

```bash
# Navigate to Supabase dashboard → SQL Editor
# Run: backend/src/database/schema.sql
```

This creates the following new tables:
- `user_preferences`
- `push_subscriptions`
- `notification_logs`
- `call_logs`
- `pwa_installations`
- `scheduled_events`

### 2. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

### 3. Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

Copy the output to your `.env` files.

### 4. Configure Environment Variables

Copy the example files and fill in your values:

```bash
# Frontend
cp .env.example .env.local

# Backend
cp backend/.env.example backend/.env
```

### 5. Generate PWA Icons

```bash
cd public/icons
# Use one of the methods in icons/README.md
# Or use an online tool like realfavicongenerator.net
```

### 6. Start the Development Servers

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev
```

### 7. Test the Features

1. **PWA Installation**:
   - Open app in Chrome/Edge
   - Look for install prompt
   - Click "Install"

2. **Push Notifications**:
   - Go to Settings
   - Enable notifications
   - Grant permission
   - Send test notification

3. **Voice Calls** (requires Twilio setup):
   - Go to Settings
   - Enable voice calls
   - Configure preferences
   - Use test endpoint (POST /api/calls/test)

## API Reference

### Notifications API

#### Subscribe to Push Notifications
```http
POST /api/notifications/subscribe
Content-Type: application/json
Authorization: Bearer <token>

{
  "endpoint": "https://...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  },
  "userAgent": "..."
}
```

#### Get Preferences
```http
GET /api/notifications/preferences
Authorization: Bearer <token>
```

#### Update Preferences
```http
PATCH /api/notifications/preferences
Authorization: Bearer <token>

{
  "notification_types": {
    "lesson_reminders": true,
    "new_content": false
  },
  "quiet_days": ["saturday", "sunday"]
}
```

### Calls API

#### Get Call Preferences
```http
GET /api/calls/preferences
Authorization: Bearer <token>
```

#### Update Call Preferences
```http
PATCH /api/calls/preferences
Authorization: Bearer <token>

{
  "calls_enabled": true,
  "call_frequency": "daily",
  "call_time_start": "10:00:00",
  "call_time_end": "18:00:00"
}
```

#### Get Call History
```http
GET /api/calls/history?limit=50
Authorization: Bearer <token>
```

### PWA API

#### Track Installation
```http
POST /api/pwa/track-install
Authorization: Bearer <token>

{
  "platform": "android"
}
```

## Security Considerations

### API Keys & Secrets

- ✅ Never expose service role keys in frontend
- ✅ Store Twilio credentials in backend `.env` only
- ✅ VAPID private key stays on server
- ✅ Use environment variables for all secrets

### User Privacy

- ✅ Phone numbers stored encrypted
- ✅ Users must opt-in for calls
- ✅ No sensitive data in call content
- ✅ Users can opt-out anytime
- ✅ Notification preferences respected

### Rate Limiting

- ✅ API endpoints have rate limits
- ✅ Max calls per user per day enforced
- ✅ Prevent notification spam

### Data Protection

- ✅ Row Level Security (RLS) enabled
- ✅ Users can only access own data
- ✅ Call logs are private
- ✅ Notification history is private

## Troubleshooting

### PWA Not Installing

1. Check manifest.json is accessible
2. Ensure HTTPS in production
3. Verify service worker registration
4. Check browser console for errors

### Push Notifications Not Working

1. Verify VAPID keys are correct
2. Check notification permission granted
3. Ensure service worker is active
4. Test with local notification first

### Voice Calls Failing

1. Verify Twilio credentials
2. Check phone number format (+1234567890)
3. Ensure backend URL is accessible
4. Review Twilio console logs

## Production Deployment

### Pre-deployment Checklist

- [ ] Generate production VAPID keys
- [ ] Set up Twilio production account
- [ ] Configure production environment variables
- [ ] Generate high-quality PWA icons
- [ ] Enable HTTPS for PWA features
- [ ] Set up proper domain for service worker
- [ ] Test push notifications end-to-end
- [ ] Test voice calls with real numbers
- [ ] Configure rate limiting appropriately
- [ ] Review and update privacy policy
- [ ] Test offline functionality
- [ ] Monitor error logs and analytics

### Deployment Steps

1. Build the frontend:
```bash
npm run build
```

2. Build the backend:
```bash
cd backend
npm run build
```

3. Deploy to your hosting platform
4. Configure environment variables
5. Test all features in production
6. Monitor logs and user feedback

## Support & Maintenance

### Monitoring

- Track notification delivery rates
- Monitor call success rates
- Review user opt-out patterns
- Analyze feature adoption

### Regular Tasks

- Clean up old notification logs (monthly)
- Review and optimize caching strategy
- Update service worker when needed
- Monitor Twilio usage and costs
- Check for browser compatibility issues

## Future Enhancements

Potential improvements:

- [ ] SMS notifications as an alternative to calls
- [ ] Email notifications integration
- [ ] Voice preferences (language, voice type)
- [ ] More interactive call options
- [ ] A/B testing for notification timing
- [ ] Advanced analytics dashboard
- [ ] Multi-language support for calls
- [ ] Custom audio uploads for lessons
- [ ] Notification templates customization

## Resources

- [Web Push Protocol](https://developers.google.com/web/fundamentals/push-notifications)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Twilio Voice API](https://www.twilio.com/docs/voice)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
