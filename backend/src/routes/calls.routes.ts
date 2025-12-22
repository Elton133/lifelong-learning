import express from 'express';
import { authenticateRequest } from '../utils/auth';
import { supabaseAdmin } from '../utils/supabase';
import {
  makeVoiceCall,
  generateReminderTwiML,
  generateMicroLessonTwiML,
  generateAudioTwiML,
  handleCallResponse,
  updateCallStatus,
} from '../services/twilio.service';

const router = express.Router();

/**
 * Get user's call preferences
 * GET /api/calls/preferences
 */
router.get('/preferences', async (req, res) => {
  const user = await authenticateRequest(req, res);
  if (!user) return;

  try {
    const { data, error } = await supabaseAdmin!
      .from('user_preferences')
      .select('calls_enabled, call_time_start, call_time_end, call_frequency, preferred_call_duration, quiet_days')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching call preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

/**
 * Update call preferences
 * PATCH /api/calls/preferences
 */
router.patch('/preferences', async (req, res) => {
  const user = await authenticateRequest(req, res);
  if (!user) return;

  try {
    const updates = req.body;

    const { data, error } = await supabaseAdmin!
      .from('user_preferences')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating call preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

/**
 * Get call history
 * GET /api/calls/history
 */
router.get('/history', async (req, res) => {
  const user = await authenticateRequest(req, res);
  if (!user) return;

  try {
    const limit = parseInt(req.query.limit as string) || 50;

    const { data, error } = await supabaseAdmin!
      .from('call_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching call history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

/**
 * TwiML endpoint for reminder calls
 * POST /api/calls/twiml/reminder
 */
router.post('/twiml/reminder', (req, res) => {
  const { callLogId } = req.query;
  const message = req.query.message as string || 'You have pending lessons waiting for you.';

  const twiml = generateReminderTwiML(message);
  
  res.type('text/xml');
  res.send(twiml);

  // Update call status asynchronously
  if (callLogId) {
    updateCallStatus(callLogId as string, 'in_progress', undefined, supabaseAdmin!);
  }
});

/**
 * TwiML endpoint for micro-lesson calls
 * POST /api/calls/twiml/micro_lesson
 */
router.post('/twiml/micro_lesson', async (req, res) => {
  const { callLogId, contentId } = req.query;

  try {
    let lessonContent = 'Here is your learning tip for today.';

    // Get lesson content if contentId provided
    if (contentId) {
      const { data: content } = await supabaseAdmin!
        .from('learning_content')
        .select('title, description')
        .eq('id', contentId as string)
        .single();

      if (content) {
        lessonContent = `${content.title}. ${content.description}`;
      }
    }

    const twiml = generateMicroLessonTwiML(lessonContent);
    
    res.type('text/xml');
    res.send(twiml);

    // Update call status asynchronously
    if (callLogId) {
      updateCallStatus(callLogId as string, 'in_progress', undefined, supabaseAdmin!);
    }
  } catch (error) {
    console.error('Error generating micro-lesson TwiML:', error);
    res.status(500).send('Error generating call content');
  }
});

/**
 * TwiML endpoint for playing audio
 * POST /api/calls/twiml/audio
 */
router.post('/twiml/audio', (req, res) => {
  const { callLogId, audioUrl } = req.query;

  if (!audioUrl) {
    res.status(400).send('Missing audio URL');
    return;
  }

  const twiml = generateAudioTwiML(audioUrl as string);
  
  res.type('text/xml');
  res.send(twiml);

  // Update call status asynchronously
  if (callLogId) {
    updateCallStatus(callLogId as string, 'in_progress', undefined, supabaseAdmin!);
  }
});

/**
 * Handle user response during call
 * POST /api/calls/response
 */
router.post('/response', async (req, res) => {
  const { Digits, CallSid } = req.body;

  try {
    // Find call log by SID
    const { data: callLog } = await supabaseAdmin!
      .from('call_logs')
      .select('*')
      .eq('call_sid', CallSid)
      .single();

    if (callLog) {
      // Update call log with user response
      await supabaseAdmin!
        .from('call_logs')
        .update({
          user_responded: true,
          response_data: { digit: Digits },
        })
        .eq('id', callLog.id);
    }

    const twiml = handleCallResponse(Digits);
    
    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('Error handling call response:', error);
    res.status(500).send('Error processing response');
  }
});

/**
 * Twilio status callback
 * POST /api/calls/status/:callLogId
 */
router.post('/status/:callLogId', async (req, res) => {
  const { callLogId } = req.params;
  const { CallStatus, CallDuration } = req.body;

  try {
    const duration = CallDuration ? parseInt(CallDuration) : undefined;
    await updateCallStatus(callLogId, CallStatus, duration, supabaseAdmin!);

    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating call status:', error);
    res.sendStatus(500);
  }
});

/**
 * Test voice call (for development)
 * POST /api/calls/test
 */
router.post('/test', async (req, res) => {
  const user = await authenticateRequest(req, res);
  if (!user) return;

  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      res.status(400).json({ error: 'Missing phone number' });
      return;
    }

    const result = await makeVoiceCall(
      {
        userId: user.id,
        phoneNumber,
        callType: 'reminder',
        message: 'This is a test call from your Lifelong Learning Platform.',
      },
      supabaseAdmin!
    );

    res.json(result);
  } catch (error) {
    console.error('Error making test call:', error);
    res.status(500).json({ error: 'Failed to make test call' });
  }
});

export default router;
