// Integration Routes for OPA Chatbot
// Handles endpoints for Calendar, Gmail and LinkedIn integrations

import express from 'express';
import { calendarHandler, gmailHandler, linkedinHandler } from '../integrationHandler.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Debug endpoint
router.get('/debug', (req, res) => {
  res.json({
    message: 'Integration routes are working',
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      googleConfigured: !!process.env.GOOGLE_CLIENT_ID,
      linkedinConfigured: !!process.env.LINKEDIN_CLIENT_ID
    }
  });
});

// Endpoint to securely provide client IDs to the frontend
router.get('/auth-config', (req, res) => {
  console.log('Auth config requested');
  // Log environment variables (without exposing secrets)
  console.log('GOOGLE_CLIENT_ID present:', !!process.env.GOOGLE_CLIENT_ID);
  console.log('LINKEDIN_CLIENT_ID present:', !!process.env.LINKEDIN_CLIENT_ID);
  
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    linkedinClientId: process.env.LINKEDIN_CLIENT_ID || ''
  });
});

// SPA OAuth Handling
// For SPA apps, we don't use server-side callbacks since the token is handled directly by the frontend
// These routes are kept for reference in case they're needed later
router.get('/auth/google/callback', async (req, res) => {
  res.send(`
    <html>
      <head><title>Authentication Complete</title></head>
      <body>
        <h1>Authentication Complete</h1>
        <p>You can close this window and return to the application.</p>
        <script>
          window.close();
        </script>
      </body>
    </html>
  `);
});

router.get('/auth/linkedin/callback', async (req, res) => {
  res.send(`
    <html>
      <head><title>Authentication Complete</title></head>
      <body>
        <h1>Authentication Complete</h1>
        <p>You can close this window and return to the application.</p>
        <script>
          window.close();
        </script>
      </body>
    </html>
  `);
});

// Calendar endpoints
router.get('/calendar/events', async (req, res) => {
  try {
    const { startTime, endTime } = req.query;
    const events = await calendarHandler.getEvents(startTime, endTime);
    res.json(events);
  } catch (error) {
    console.error('Calendar events error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/calendar/events', async (req, res) => {
  try {
    const eventDetails = req.body;
    const event = await calendarHandler.createEvent(eventDetails);
    res.json(event);
  } catch (error) {
    console.error('Calendar create event error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/calendar/availability', async (req, res) => {
  try {
    const { startTime, endTime } = req.query;
    const available = await calendarHandler.checkAvailability(startTime, endTime);
    res.json({ available });
  } catch (error) {
    console.error('Calendar availability error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Gmail endpoints
router.post('/gmail/send', async (req, res) => {
  try {
    const emailDetails = req.body;
    const result = await gmailHandler.sendEmail(emailDetails);
    res.json(result);
  } catch (error) {
    console.error('Gmail send error:', error);
    res.status(500).json({ error: error.message });
  }
});

// LinkedIn endpoints
router.get('/linkedin/profile', async (req, res) => {
  try {
    const profile = await linkedinHandler.getProfile();
    res.json(profile);
  } catch (error) {
    console.error('LinkedIn profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/linkedin/share', async (req, res) => {
  try {
    const postContent = req.body;
    const result = await linkedinHandler.sharePost(postContent);
    res.json(result);
  } catch (error) {
    console.error('LinkedIn share error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Integration status endpoint
router.get('/status', async (req, res) => {
  res.json({
    calendar: !!calendarHandler.settings?.calendar?.enabled,
    gmail: !!gmailHandler.settings?.gmail?.enabled,
    linkedin: !!linkedinHandler.settings?.linkedin?.enabled
  });
});

export default router;