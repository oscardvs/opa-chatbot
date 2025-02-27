// Integration Routes for OPA Chatbot
// Handles endpoints for Calendar, Gmail and LinkedIn integrations

import express from 'express';
import { calendarHandler, gmailHandler, linkedinHandler } from '../integrationHandler.js';

const router = express.Router();

// Authorization endpoints
router.get('/auth/google/callback', async (req, res) => {
  try {
    const { code, scope } = req.query;
    
    // Check what scope was granted to determine which service
    if (scope.includes('calendar')) {
      await calendarHandler.configure({ code });
      res.send('Calendar authorization successful! You can close this window.');
    } else if (scope.includes('gmail.send')) {
      await gmailHandler.configure({ code });
      res.send('Gmail authorization successful! You can close this window.');
    } else {
      res.status(400).send('Unknown scope requested');
    }
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).send('Authentication error');
  }
});

router.get('/auth/linkedin/callback', async (req, res) => {
  try {
    const { code } = req.query;
    await linkedinHandler.configure({ code });
    res.send('LinkedIn authorization successful! You can close this window.');
  } catch (error) {
    console.error('LinkedIn auth error:', error);
    res.status(500).send('Authentication error');
  }
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