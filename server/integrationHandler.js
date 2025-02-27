// Integration Handler for OPA Chatbot
// Handles integration with Google Calendar, Gmail, and LinkedIn

import axios from 'axios';
import { google } from 'googleapis';
import { promises as fs } from 'fs';
import { join } from 'path';
import { OAuth2Client } from 'google-auth-library';

// Settings storage path
const SETTINGS_PATH = process.env.NODE_ENV === 'production'
  ? '/workspace/integration_settings.json'
  : join(process.cwd(), 'workspace', 'integration_settings.json');

// Initialize default settings
let settings = {
  calendar: {
    enabled: false,
    credentials: null,
    tokens: null
  },
  gmail: {
    enabled: false,
    credentials: null,
    tokens: null
  },
  linkedin: {
    enabled: false,
    credentials: null,
    tokens: null
  }
};

// Load settings if they exist
async function loadSettings() {
  try {
    const data = await fs.readFile(SETTINGS_PATH, 'utf8');
    settings = JSON.parse(data);
    console.log('Integration settings loaded');
  } catch (error) {
    console.log('No existing integration settings found, using defaults');
    // Save the default settings
    await saveSettings();
  }
}

// Save settings
async function saveSettings() {
  try {
    await fs.writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf8');
    console.log('Integration settings saved');
  } catch (error) {
    console.error('Error saving integration settings:', error);
  }
}

// Google OAuth client setup
function getGoogleOAuthClient() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth credentials not configured');
  }
  
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
  );
}

// Calendar functions
export const calendarHandler = {
  // Configure calendar integration
  async configure(credentials) {
    settings.calendar.credentials = credentials;
    settings.calendar.enabled = true;
    await saveSettings();
    return { success: true, message: 'Calendar integration configured' };
  },
  
  // Get user's upcoming events
  async getEvents(startTime, endTime) {
    if (!settings.calendar.enabled || !settings.calendar.tokens) {
      throw new Error('Calendar integration not configured');
    }
    
    try {
      const oAuth2Client = getGoogleOAuthClient();
      oAuth2Client.setCredentials(settings.calendar.tokens);
      
      const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startTime || new Date().toISOString(),
        timeMax: endTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });
      
      return response.data.items;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  },
  
  // Create a new calendar event
  async createEvent(eventDetails) {
    if (!settings.calendar.enabled || !settings.calendar.tokens) {
      throw new Error('Calendar integration not configured');
    }
    
    try {
      const oAuth2Client = getGoogleOAuthClient();
      oAuth2Client.setCredentials(settings.calendar.tokens);
      
      const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: eventDetails
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  },
  
  // Check availability for a given time range
  async checkAvailability(startTime, endTime) {
    try {
      const events = await this.getEvents(startTime, endTime);
      // If there are no events, the time is available
      return events.length === 0;
    } catch (error) {
      console.error('Error checking availability:', error);
      throw error;
    }
  }
};

// Gmail functions
export const gmailHandler = {
  // Configure Gmail integration
  async configure(credentials) {
    settings.gmail.credentials = credentials;
    settings.gmail.enabled = true;
    await saveSettings();
    return { success: true, message: 'Gmail integration configured' };
  },
  
  // Send an email
  async sendEmail(email) {
    if (!settings.gmail.enabled || !settings.gmail.tokens) {
      throw new Error('Gmail integration not configured');
    }
    
    try {
      const oAuth2Client = getGoogleOAuthClient();
      oAuth2Client.setCredentials(settings.gmail.tokens);
      
      const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
      
      // Create the email content
      const message = [
        `To: ${email.to}`,
        `Subject: ${email.subject}`,
        'Content-Type: text/html; charset=utf-8',
        '',
        email.body
      ].join('\r\n');
      
      // Encode the message in base64 format for Gmail API
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
};

// LinkedIn functions
export const linkedinHandler = {
  // Configure LinkedIn integration
  async configure(credentials) {
    settings.linkedin.credentials = credentials;
    settings.linkedin.enabled = true;
    await saveSettings();
    return { success: true, message: 'LinkedIn integration configured' };
  },
  
  // Get profile information
  async getProfile() {
    if (!settings.linkedin.enabled || !settings.linkedin.tokens) {
      throw new Error('LinkedIn integration not configured');
    }
    
    try {
      const response = await axios.get('https://api.linkedin.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${settings.linkedin.tokens.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching LinkedIn profile:', error);
      throw error;
    }
  },
  
  // Share a post on LinkedIn
  async sharePost(postContent) {
    if (!settings.linkedin.enabled || !settings.linkedin.tokens) {
      throw new Error('LinkedIn integration not configured');
    }
    
    try {
      const response = await axios.post(
        'https://api.linkedin.com/v2/shares',
        {
          content: {
            contentEntities: [
              {
                entityLocation: postContent.link || '',
                thumbnails: [
                  { resolvedUrl: postContent.thumbnail || '' }
                ]
              }
            ],
            title: postContent.title || '',
            description: postContent.description || ''
          },
          distribution: {
            linkedInDistributionTarget: {}
          },
          owner: 'urn:li:person:me',
          subject: postContent.subject || '',
          text: { text: postContent.text || '' }
        },
        {
          headers: {
            'Authorization': `Bearer ${settings.linkedin.tokens.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error sharing post on LinkedIn:', error);
      throw error;
    }
  }
};

// Initialize settings on module load
loadSettings();