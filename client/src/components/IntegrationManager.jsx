import React, { useState, useEffect } from 'react';
import { X, Calendar, Mail, Linkedin, Check, AlertCircle } from 'lucide-react';
import { calendarIntegration, emailIntegration, linkedinIntegration } from '../utils/integrations';

const IntegrationManager = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [calendarAuth, setCalendarAuth] = useState(false);
  const [emailAuth, setEmailAuth] = useState(false);
  const [linkedinAuth, setLinkedinAuth] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Check if there are existing tokens stored
  useEffect(() => {
    const calendarToken = localStorage.getItem('google_calendar_token');
    const emailToken = localStorage.getItem('gmail_token');
    const linkedinToken = localStorage.getItem('linkedin_token');

    setCalendarAuth(!!calendarToken);
    setEmailAuth(!!emailToken);
    setLinkedinAuth(!!linkedinToken);
  }, []);

  // Display a status message
  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  // Handle OAuth flow for Google services (Calendar & Gmail)
  const handleGoogleAuth = async (service) => {
    // Google OAuth client ID
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
    if (!clientId) {
      showMessage('Google Client ID not configured', 'error');
      return;
    }

    // Scopes needed for calendar and email
    const scopes = service === 'calendar'
      ? 'https://www.googleapis.com/auth/calendar'
      : 'https://www.googleapis.com/auth/gmail.send';

    // Create OAuth URL
    const redirectUri = window.location.origin;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scopes}`;

    // Store the requested service to handle the callback
    sessionStorage.setItem('auth_service', service);

    // Open the OAuth popup
    const popup = window.open(authUrl, 'oauth', 'width=500,height=600');
    
    // Poll to check if popup closed
    const checkPopup = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(checkPopup);

        // Check if we got a token from URL hash
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          const token = hash.split('access_token=')[1].split('&')[0];
          
          if (service === 'calendar') {
            calendarIntegration.init(token)
              .then(() => {
                setCalendarAuth(true);
                showMessage('Google Calendar connected successfully');
              })
              .catch(err => {
                showMessage(`Failed to connect Calendar: ${err.message}`, 'error');
              });
          } else {
            emailIntegration.init(token)
              .then(() => {
                setEmailAuth(true);
                showMessage('Gmail connected successfully');
              })
              .catch(err => {
                showMessage(`Failed to connect Gmail: ${err.message}`, 'error');
              });
          }
          
          // Clean up the URL hash
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }, 500);
  };

  // Handle OAuth for LinkedIn
  const handleLinkedinAuth = async () => {
    // LinkedIn OAuth client ID
    const clientId = process.env.REACT_APP_LINKEDIN_CLIENT_ID || '';
    if (!clientId) {
      showMessage('LinkedIn Client ID not configured', 'error');
      return;
    }

    // Create OAuth URL
    const redirectUri = window.location.origin;
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=r_liteprofile,r_emailaddress,w_member_social`;

    // Store the requested service to handle the callback
    sessionStorage.setItem('auth_service', 'linkedin');

    // Open the OAuth popup
    const popup = window.open(authUrl, 'oauth', 'width=500,height=600');
    
    // Poll to check if popup closed
    const checkPopup = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(checkPopup);

        // Check if we got a token from URL hash
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          const token = hash.split('access_token=')[1].split('&')[0];
          
          linkedinIntegration.init(token)
            .then(() => {
              setLinkedinAuth(true);
              showMessage('LinkedIn connected successfully');
            })
            .catch(err => {
              showMessage(`Failed to connect LinkedIn: ${err.message}`, 'error');
            });
          
          // Clean up the URL hash
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }, 500);
  };

  // Disconnect integration
  const handleDisconnect = (service) => {
    if (service === 'calendar') {
      localStorage.removeItem('google_calendar_token');
      setCalendarAuth(false);
      showMessage('Google Calendar disconnected');
    } else if (service === 'email') {
      localStorage.removeItem('gmail_token');
      setEmailAuth(false);
      showMessage('Gmail disconnected');
    } else if (service === 'linkedin') {
      localStorage.removeItem('linkedin_token');
      setLinkedinAuth(false);
      showMessage('LinkedIn disconnected');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-gradient-to-b from-purple-900/95 to-purple-800/95 rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-800/90 to-purple-700/90 border-b border-purple-700/50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-purple-100">Integrations</h2>
          <button
            onClick={onClose}
            className="p-1 text-purple-300 hover:text-purple-100 hover:bg-purple-700/50 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-purple-700/50">
          <button
            className={`px-4 py-3 flex items-center space-x-2 transition-colors ${
              activeTab === 'calendar'
                ? 'bg-purple-700/50 text-purple-100 border-b-2 border-purple-400'
                : 'text-purple-300 hover:bg-purple-800/40 hover:text-purple-200'
            }`}
            onClick={() => setActiveTab('calendar')}
          >
            <Calendar className="h-4 w-4" />
            <span>Calendar</span>
          </button>
          <button
            className={`px-4 py-3 flex items-center space-x-2 transition-colors ${
              activeTab === 'email'
                ? 'bg-purple-700/50 text-purple-100 border-b-2 border-purple-400'
                : 'text-purple-300 hover:bg-purple-800/40 hover:text-purple-200'
            }`}
            onClick={() => setActiveTab('email')}
          >
            <Mail className="h-4 w-4" />
            <span>Email</span>
          </button>
          <button
            className={`px-4 py-3 flex items-center space-x-2 transition-colors ${
              activeTab === 'linkedin'
                ? 'bg-purple-700/50 text-purple-100 border-b-2 border-purple-400'
                : 'text-purple-300 hover:bg-purple-800/40 hover:text-purple-200'
            }`}
            onClick={() => setActiveTab('linkedin')}
          >
            <Linkedin className="h-4 w-4" />
            <span>LinkedIn</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Status message */}
          {message.text && (
            <div className={`mb-4 px-4 py-3 rounded-lg flex items-center space-x-2 ${
              message.type === 'error' ? 'bg-red-900/30 text-red-300' : 'bg-green-900/30 text-green-300'
            }`}>
              {message.type === 'error' ? (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <Check className="h-5 w-5 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Calendar Settings */}
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-purple-100">Google Calendar Integration</h3>
                <p className="text-sm text-purple-300">
                  Connect your Google Calendar to view your schedule and create events directly from chat.
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-800/40 rounded-xl border border-purple-700/50">
                <div className="flex items-center space-x-3">
                  <Calendar className={`h-6 w-6 ${calendarAuth ? 'text-green-400' : 'text-purple-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-purple-100">Google Calendar</p>
                    <p className="text-xs text-purple-300">
                      {calendarAuth ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                </div>
                
                {calendarAuth ? (
                  <button
                    onClick={() => handleDisconnect('calendar')}
                    className="px-3 py-1.5 bg-purple-700/60 hover:bg-purple-600/60 text-purple-200 
                             rounded-lg text-sm transition-colors border border-purple-600/30"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleGoogleAuth('calendar')}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 
                             hover:to-purple-500 text-purple-100 rounded-lg text-sm transition-colors 
                             shadow-md hover:shadow-purple-500/20 border border-purple-600/30"
                  >
                    Connect
                  </button>
                )}
              </div>

              <div className="text-sm text-purple-300 p-4 bg-purple-800/20 rounded-lg">
                <p className="font-medium text-purple-200 mb-2">What you can do:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Ask for your upcoming meetings and events</li>
                  <li>Check your availability for specific times</li>
                  <li>Schedule new events directly from chat</li>
                  <li>Get reminders about upcoming events</li>
                </ul>
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-purple-100">Gmail Integration</h3>
                <p className="text-sm text-purple-300">
                  Connect your Gmail account to send emails directly from the chat interface.
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-800/40 rounded-xl border border-purple-700/50">
                <div className="flex items-center space-x-3">
                  <Mail className={`h-6 w-6 ${emailAuth ? 'text-green-400' : 'text-purple-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-purple-100">Gmail</p>
                    <p className="text-xs text-purple-300">
                      {emailAuth ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                </div>
                
                {emailAuth ? (
                  <button
                    onClick={() => handleDisconnect('email')}
                    className="px-3 py-1.5 bg-purple-700/60 hover:bg-purple-600/60 text-purple-200 
                             rounded-lg text-sm transition-colors border border-purple-600/30"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleGoogleAuth('email')}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 
                             hover:to-purple-500 text-purple-100 rounded-lg text-sm transition-colors 
                             shadow-md hover:shadow-purple-500/20 border border-purple-600/30"
                  >
                    Connect
                  </button>
                )}
              </div>

              <div className="text-sm text-purple-300 p-4 bg-purple-800/20 rounded-lg">
                <p className="font-medium text-purple-200 mb-2">What you can do:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Compose and send emails directly from chat</li>
                  <li>Format your messages with rich text</li>
                  <li>Send follow-up emails to contacted users</li>
                  <li>Schedule emails to be sent later (with Calendar integration)</li>
                </ul>
              </div>
            </div>
          )}

          {/* LinkedIn Settings */}
          {activeTab === 'linkedin' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-purple-100">LinkedIn Integration</h3>
                <p className="text-sm text-purple-300">
                  Connect your LinkedIn profile to enhance your professional networking capabilities.
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-800/40 rounded-xl border border-purple-700/50">
                <div className="flex items-center space-x-3">
                  <Linkedin className={`h-6 w-6 ${linkedinAuth ? 'text-green-400' : 'text-purple-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-purple-100">LinkedIn</p>
                    <p className="text-xs text-purple-300">
                      {linkedinAuth ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                </div>
                
                {linkedinAuth ? (
                  <button
                    onClick={() => handleDisconnect('linkedin')}
                    className="px-3 py-1.5 bg-purple-700/60 hover:bg-purple-600/60 text-purple-200 
                             rounded-lg text-sm transition-colors border border-purple-600/30"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={handleLinkedinAuth}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 
                             hover:to-purple-500 text-purple-100 rounded-lg text-sm transition-colors 
                             shadow-md hover:shadow-purple-500/20 border border-purple-600/30"
                  >
                    Connect
                  </button>
                )}
              </div>

              <div className="text-sm text-purple-300 p-4 bg-purple-800/20 rounded-lg">
                <p className="font-medium text-purple-200 mb-2">What you can do:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>View your LinkedIn profile information</li>
                  <li>Share professional updates directly to LinkedIn</li>
                  <li>Access your professional network connections</li>
                  <li>Find professional opportunities and insights</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-purple-800/30 border-t border-purple-700/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-700/60 hover:bg-purple-600/60 text-purple-200 
                     rounded-lg text-sm transition-colors border border-purple-600/30"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationManager;