// Integration utilities for Calendar, Email, and LinkedIn

// Calendar Integration for Google Calendar
export const calendarIntegration = {
  // Initialize Google Calendar API
  init: async (authToken) => {
    if (!authToken) {
      console.error('No auth token provided for calendar integration');
      return false;
    }
    
    // Store the auth token for future use
    localStorage.setItem('google_calendar_token', authToken);
    return true;
  },
  
  // Get the user's calendar events
  getEvents: async (startDate, endDate) => {
    const token = localStorage.getItem('google_calendar_token');
    if (!token) {
      throw new Error('Not authenticated with Google Calendar');
    }
    
    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startDate.toISOString()}&timeMax=${endDate.toISOString()}&singleEvents=true&orderBy=startTime`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Calendar API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  },
  
  // Add a new event to the calendar
  addEvent: async (eventDetails) => {
    const token = localStorage.getItem('google_calendar_token');
    if (!token) {
      throw new Error('Not authenticated with Google Calendar');
    }
    
    try {
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventDetails)
        }
      );
      
      if (!response.ok) {
        throw new Error(`Calendar API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  },
  
  // Check availability for a given time range
  checkAvailability: async (startTime, endTime) => {
    try {
      const events = await calendarIntegration.getEvents(new Date(startTime), new Date(endTime));
      // If there are no events, the time is available
      return events.length === 0;
    } catch (error) {
      console.error('Error checking availability:', error);
      throw error;
    }
  },
  
  // Format calendar events for display
  formatEventsForDisplay: (events) => {
    return events.map(event => ({
      title: event.summary,
      startTime: new Date(event.start.dateTime || event.start.date),
      endTime: new Date(event.end.dateTime || event.end.date),
      location: event.location || 'No location specified',
      description: event.description || 'No description'
    }));
  }
};

// Email Integration for Gmail
export const emailIntegration = {
  // Initialize Gmail API
  init: async (authToken) => {
    if (!authToken) {
      console.error('No auth token provided for email integration');
      return false;
    }
    
    // Store the auth token for future use
    localStorage.setItem('gmail_token', authToken);
    return true;
  },
  
  // Send an email using Gmail API
  sendEmail: async (email) => {
    const token = localStorage.getItem('gmail_token');
    if (!token) {
      throw new Error('Not authenticated with Gmail');
    }
    
    try {
      // Create the email content in base64 format (RFC 2822 format)
      const emailContent = [
        `To: ${email.to}`,
        `Subject: ${email.subject}`,
        'Content-Type: text/html; charset=utf-8',
        '',
        email.body
      ].join('\r\n');
      
      const encodedEmail = btoa(emailContent)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      const response = await fetch(
        'https://www.googleapis.com/gmail/v1/users/me/messages/send',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            raw: encodedEmail
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Gmail API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },
  
  // Validate an email address
  validateEmail: (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
};

// LinkedIn Integration
export const linkedinIntegration = {
  // Initialize LinkedIn API
  init: async (authToken) => {
    if (!authToken) {
      console.error('No auth token provided for LinkedIn integration');
      return false;
    }
    
    // Store the auth token for future use
    localStorage.setItem('linkedin_token', authToken);
    return true;
  },
  
  // Get basic profile information
  getProfile: async () => {
    const token = localStorage.getItem('linkedin_token');
    if (!token) {
      throw new Error('Not authenticated with LinkedIn');
    }
    
    try {
      const response = await fetch(
        'https://api.linkedin.com/v2/me', 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`LinkedIn API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching LinkedIn profile:', error);
      throw error;
    }
  },
  
  // Get user's connections
  getConnections: async () => {
    const token = localStorage.getItem('linkedin_token');
    if (!token) {
      throw new Error('Not authenticated with LinkedIn');
    }
    
    try {
      // LinkedIn API doesn't directly expose connections anymore, 
      // so this would need to be customized based on the specific permissions granted
      // This is a placeholder implementation
      const response = await fetch(
        'https://api.linkedin.com/v2/connections', 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`LinkedIn API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching LinkedIn connections:', error);
      throw error;
    }
  },
  
  // Share a post on LinkedIn
  sharePost: async (postContent) => {
    const token = localStorage.getItem('linkedin_token');
    if (!token) {
      throw new Error('Not authenticated with LinkedIn');
    }
    
    try {
      const response = await fetch(
        'https://api.linkedin.com/v2/shares', 
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
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
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`LinkedIn API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sharing post on LinkedIn:', error);
      throw error;
    }
  }
};