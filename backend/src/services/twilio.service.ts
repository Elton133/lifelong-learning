/**
 * Twilio Voice Call Service
 * Handles automated voice calls for reminders and micro-lessons
 */

import twilio from 'twilio';
import { SupabaseClient } from '@supabase/supabase-js';

const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';
const baseUrl = process.env.BACKEND_URL || 'http://localhost:4000';

// Initialize Twilio client
let twilioClient: twilio.Twilio | null = null;

try {
  if (accountSid && authToken) {
    twilioClient = twilio(accountSid, authToken);
    console.log('Twilio client initialized successfully');
  } else {
    console.warn('Twilio credentials not configured. Voice calls will be disabled.');
  }
} catch (error) {
  console.error('Failed to initialize Twilio client:', error);
}

export interface CallOptions {
  userId: string;
  phoneNumber: string;
  callType: 'reminder' | 'micro_lesson';
  contentId?: string;
  message?: string;
  audioUrl?: string;
}

export interface CallResult {
  success: boolean;
  callSid?: string;
  error?: string;
}

/**
 * Make an automated voice call
 */
export async function makeVoiceCall(
  options: CallOptions,
  supabase: SupabaseClient
): Promise<CallResult> {
  if (!twilioClient) {
    return {
      success: false,
      error: 'Twilio not configured',
    };
  }

  try {
    // Create call log entry
    const { data: callLog } = await supabase
      .from('call_logs')
      .insert({
        user_id: options.userId,
        call_type: options.callType,
        phone_number: options.phoneNumber,
        content_id: options.contentId,
        status: 'queued',
      })
      .select()
      .single();

    const callLogId = callLog?.id;

    // Determine TwiML URL based on call type
    const twimlUrl = options.audioUrl
      ? `${baseUrl}/api/calls/twiml/audio?callLogId=${callLogId}&audioUrl=${encodeURIComponent(options.audioUrl)}`
      : `${baseUrl}/api/calls/twiml/${options.callType}?callLogId=${callLogId}&contentId=${options.contentId || ''}`;

    // Make the call
    const call = await twilioClient.calls.create({
      to: options.phoneNumber,
      from: twilioPhoneNumber,
      url: twimlUrl,
      statusCallback: `${baseUrl}/api/calls/status/${callLogId}`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      method: 'POST',
    });

    // Update call log with SID
    await supabase
      .from('call_logs')
      .update({
        call_sid: call.sid,
        status: 'initiated',
      })
      .eq('id', callLogId);

    console.log(`Voice call initiated: ${call.sid}`);

    return {
      success: true,
      callSid: call.sid,
    };
  } catch (error) {
    console.error('Failed to make voice call:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate TwiML for a reminder call
 */
export function generateReminderTwiML(message: string): string {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();

  response.say(
    {
      voice: 'Polly.Joanna',
      language: 'en-US',
    },
    `Hello! This is a friendly reminder from your Lifelong Learning Platform. ${message}`
  );

  response.say(
    {
      voice: 'Polly.Joanna',
      language: 'en-US',
    },
    'Visit your dashboard to continue your learning journey. Goodbye!'
  );

  response.hangup();

  return response.toString();
}

/**
 * Generate TwiML for a micro-lesson call
 */
export function generateMicroLessonTwiML(lessonContent: string): string {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();

  response.say(
    {
      voice: 'Polly.Joanna',
      language: 'en-US',
    },
    "Hello! Here's your micro-lesson for today from Lifelong Learning Platform."
  );

  response.pause({ length: 1 });

  response.say(
    {
      voice: 'Polly.Joanna',
      language: 'en-US',
    },
    lessonContent
  );

  response.pause({ length: 1 });

  // Add interactive option
  const gather = response.gather({
    numDigits: 1,
    timeout: 5,
    action: `${baseUrl}/api/calls/response`,
    method: 'POST',
  });

  gather.say(
    {
      voice: 'Polly.Joanna',
      language: 'en-US',
    },
    'Press 1 to save this lesson to your dashboard, or press 2 to hear it again.'
  );

  response.say(
    {
      voice: 'Polly.Joanna',
      language: 'en-US',
    },
    'Thank you for learning with us. Goodbye!'
  );

  response.hangup();

  return response.toString();
}

/**
 * Generate TwiML for playing a pre-recorded audio file
 */
export function generateAudioTwiML(audioUrl: string): string {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();

  response.say(
    {
      voice: 'Polly.Joanna',
      language: 'en-US',
    },
    'Hello! Here is your lesson audio from Lifelong Learning Platform.'
  );

  response.play(audioUrl);

  response.say(
    {
      voice: 'Polly.Joanna',
      language: 'en-US',
    },
    'Thank you for listening. Visit your dashboard for more content. Goodbye!'
  );

  response.hangup();

  return response.toString();
}

/**
 * Handle user response during call
 */
export function handleCallResponse(digit: string): string {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();

  if (digit === '1') {
    response.say(
      {
        voice: 'Polly.Joanna',
        language: 'en-US',
      },
      'Great! This lesson has been saved to your dashboard.'
    );
  } else if (digit === '2') {
    response.say(
      {
        voice: 'Polly.Joanna',
        language: 'en-US',
      },
      'Let me repeat the lesson for you.'
    );
    response.redirect(`${baseUrl}/api/calls/twiml/micro_lesson`);
    return response.toString();
  } else {
    response.say(
      {
        voice: 'Polly.Joanna',
        language: 'en-US',
      },
      'Invalid option.'
    );
  }

  response.hangup();
  return response.toString();
}

/**
 * Update call status
 */
export async function updateCallStatus(
  callLogId: string,
  status: string,
  duration?: number,
  supabase?: SupabaseClient
): Promise<void> {
  if (!supabase) return;

  try {
    const updateData: Record<string, unknown> = {
      status,
    };

    if (duration !== undefined) {
      updateData.duration = duration;
    }

    if (status === 'completed' || status === 'failed' || status === 'no_answer' || status === 'busy') {
      updateData.completed_at = new Date().toISOString();
    }

    await supabase
      .from('call_logs')
      .update(updateData)
      .eq('id', callLogId);

    console.log(`Call status updated: ${callLogId} -> ${status}`);
  } catch (error) {
    console.error('Failed to update call status:', error);
  }
}

/**
 * Check if user can receive calls based on preferences
 */
export async function canReceiveCalls(
  userId: string,
  supabase: SupabaseClient
): Promise<boolean> {
  try {
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('calls_enabled, call_time_start, call_time_end, timezone, quiet_days')
      .eq('user_id', userId)
      .single();

    if (!preferences || !preferences.calls_enabled) {
      return false;
    }

    // Check if current time is within allowed window
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });

    // Check quiet days
    if (preferences.quiet_days && preferences.quiet_days.includes(currentDay)) {
      return false;
    }

    // Check time window (simplified - should account for timezone)
    const currentTime = now.toTimeString().slice(0, 8);
    if (currentTime < preferences.call_time_start || currentTime > preferences.call_time_end) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to check call permissions:', error);
    return false;
  }
}

/**
 * Generate text-to-speech audio for a lesson
 * Uses Twilio's Text-to-Speech capabilities
 */
export async function generateLessonAudio(
  lessonText: string,
  voiceId: string = 'Polly.Joanna'
): Promise<string | null> {
  // For Twilio, audio is generated dynamically via TwiML
  // This function could be extended to use AWS Polly or Google TTS
  // to pre-generate and store audio files
  
  // For now, return a TwiML endpoint that will generate the audio
  return `${baseUrl}/api/calls/twiml/text?text=${encodeURIComponent(lessonText)}&voice=${voiceId}`;
}
