import React, { useState, useEffect } from 'react';
import { X, Calendar, Mail, Linkedin, Check, AlertCircle } from 'lucide-react';
import { calendarIntegration, emailIntegration, linkedinIntegration } from '../utils/integrations';

const IntegrationManager = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [calendarAuth, setCalendarAuth] = useState(false);
  const [emailAuth, setEmailAuth] = useState(false);
  const [linkedinAuth, setLinkedinAuth] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Base API URL - to handle different deployment environments
  const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';

  // Process OAuth callback and check existing tokens
  useEffect(() => {
    // First check if we're returning from an OAuth flow
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      // Get the service that initiated this auth flow
      const authService = localStorage.getItem('integration_auth_service');
      const returnUrl = localStorage.getItem('integration_auth_return_url');
      const token = hash.split('access_token=')[1].split('&')[0];
      
      console.log('Received OAuth callback with token');
      
      if (authService === 'calendar') {
        calendarIntegration.init(token)
          .then(() => {
            setCalendarAuth(true);
            showMessage('Google Calendar connected successfully', 'success');
          })
          .catch(err => {
            showMessage(`Failed to connect Calendar: ${err.message}`, 'error');
            console.error('Calendar error:', err);
          });
      } else if (authService === 'email') {
        emailIntegration.init(token)
          .then(() => {
            setEmailAuth(true);
            showMessage('Gmail connected successfully', 'success');
          })
          .catch(err => {
            showMessage(`Failed to connect Gmail: ${err.message}`, 'error');
            console.error('Gmail error:', err);
          });
      } else if (authService === 'linkedin') {
        linkedinIntegration.init(token)
          .then(() => {
            setLinkedinAuth(true);
            showMessage('LinkedIn connected successfully', 'success');
          })
          .catch(err => {
            showMessage(`Failed to connect LinkedIn: ${err.message}`, 'error');
            console.error('LinkedIn error:', err);
          });
      }
      
      // Clean up localStorage and URL hash
      localStorage.removeItem('integration_auth_service');
      localStorage.removeItem('integration_auth_timestamp');
      localStorage.removeItem('integration_auth_return_url');
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // If we have a return URL, navigate back (but give time for the success message to show)
      if (returnUrl) {
        setTimeout(() => {
          window.location.href = returnUrl;
        }, 2000);
      }
    }
    
    // Check if there are existing tokens stored
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
    try {
      // Request client ID from backend
      showMessage('Connecting to backend...', 'info');
      const configUrl = `${apiBaseUrl}/integrations/auth-config`;
      console.log('Fetching auth config from:', configUrl);
      const response = await fetch(configUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        showMessage(`API Error: ${response.status} ${errorText}`, 'error');
        return;
      }
      
      const config = await response.json();
      
      if (!config.googleClientId) {
        showMessage('Google Client ID not configured on server', 'error');
        return;
      }
      
      const clientId = config.googleClientId;

      // Scopes needed for calendar and email
      const scopes = service === 'calendar'
        ? 'https://www.googleapis.com/auth/calendar'
        : 'https://www.googleapis.com/auth/gmail.send';

      // Create OAuth URL - redirect to same page
      const redirectUri = window.location.href.split('#')[0]; // Remove any existing hash
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scopes}`;

      // Store the requested service to handle the callback
      sessionStorage.setItem('auth_service', service);

      // Instead of using a popup window, redirect the user directly
      // Store state in localStorage to handle the redirect
      localStorage.setItem('integration_auth_service', service);
      localStorage.setItem('integration_auth_timestamp', Date.now());
      localStorage.setItem('integration_auth_return_url', window.location.href);
      
      // Display message
      showMessage('Redirecting to authorization page...', 'info');
      
      // Wait a moment then redirect
      setTimeout(() => {
        // Redirect to the OAuth page
        window.location.href = authUrl;
      }, 1000);
      
      // The code below will not execute due to the redirect
      // It's kept for reference in case we need to go back to popup approach
      if (false) { // Never executes
        const token = '';
        if (service === 'calendar') {
              calendarIntegration.init(token)
                .then(() => {
                  setCalendarAuth(true);
                  showMessage('Google Calendar connected successfully');
                })
                .catch(err => {
                  showMessage(`Failed to connect Calendar: ${err.message}`, 'error');
                  console.error('Calendar error:', err);
                });
            } else {
              emailIntegration.init(token)
                .then(() => {
                  setEmailAuth(true);
                  showMessage('Gmail connected successfully');
                })
                .catch(err => {
                  showMessage(`Failed to connect Gmail: ${err.message}`, 'error');
                  console.error('Gmail error:', err);
                });
            }
            
            // Clean up the URL hash
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      }, 500);
    } catch (error) {
      showMessage(`Authentication error: ${error.message}`, 'error');
      console.error('Google auth error:', error);
    }
  };

  // Handle OAuth for LinkedIn
  const handleLinkedinAuth = async () => {
    try {
      // Request client ID from backend
      showMessage('Connecting to backend...', 'info');
      const configUrl = `${apiBaseUrl}/integrations/auth-config`;
      console.log('Fetching auth config from:', configUrl);
      const response = await fetch(configUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        showMessage(`API Error: ${response.status} ${errorText}`, 'error');
        return;
      }
      
      const config = await response.json();
      
      if (!config.linkedinClientId) {
        showMessage('LinkedIn Client ID not configured on server', 'error');
        return;
      }
      
      const clientId = config.linkedinClientId;

      // Create OAuth URL - redirect to same page
      const redirectUri = window.location.href.split('#')[0]; // Remove any existing hash
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=r_liteprofile,r_emailaddress,w_member_social`;

      // Store the requested service to handle the callback
      sessionStorage.setItem('auth_service', 'linkedin');

      // Instead of using a popup window, redirect the user directly
      // Store state in localStorage to handle the redirect
      localStorage.setItem('integration_auth_service', 'linkedin');
      localStorage.setItem('integration_auth_timestamp', Date.now());
      localStorage.setItem('integration_auth_return_url', window.location.href);
      
      // Display message
      showMessage('Redirecting to authorization page...', 'info');
      
      // Wait a moment then redirect
      setTimeout(() => {
        // Redirect to the OAuth page
        window.location.href = authUrl;
      }, 1000);
      
      // The code below will not execute due to the redirect
      // It's kept for reference in case we need to go back to popup approach
      if (false) { // Never executes
        const token = '';
        linkedinIntegration.init(token)
              .then(() => {
                setLinkedinAuth(true);
                showMessage('LinkedIn connected successfully');
              })
              .catch(err => {
                showMessage(`Failed to connect LinkedIn: ${err.message}`, 'error');
                console.error('LinkedIn error:', err);
              });
            
            // Clean up the URL hash
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      }, 500);
    } catch (error) {
      showMessage(`Authentication error: ${error.message}`, 'error');
      console.error('LinkedIn auth error:', error);
    }
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

  // Test API connection
  const testApiConnection = async () => {
    try {
      showMessage('Testing API connection...', 'info');
      const debugUrl = `${apiBaseUrl}/integrations/debug`;
      console.log('Testing connection to:', debugUrl);
      
      const response = await fetch(debugUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Debug API Error:', response.status, errorText);
        showMessage(`API Test Failed: ${response.status} ${errorText}`, 'error');
        return;
      }
      
      const data = await response.json();
      console.log('Debug API response:', data);
      showMessage(`API connection successful: ${data.message}`, 'success');
    } catch (error) {
      console.error('API test error:', error);
      showMessage(`API test error: ${error.message}`, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-gradient-to-b from-purple-900/95 to-purple-800/95 rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-800/90 to-purple-700/90 border-b border-purple-700/50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-purple-100">
            Integrations
            <button 
              onClick={testApiConnection}
              className="ml-2 text-xs bg-purple-700/50 hover:bg-purple-600/50 px-2 py-0.5 rounded text-purple-300 hover:text-purple-200"
              title="Test API Connection"
            >
              Test API
            </button>
          </h2>
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
              message.type === 'error' ? 'bg-red-900/30 text-red-300' : 
              message.type === 'info' ? 'bg-blue-900/30 text-blue-300' :
              'bg-green-900/30 text-green-300'
            }`}>
              {message.type === 'error' ? (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              ) : message.type === 'info' ? (
                <div className="h-5 w-5 flex-shrink-0 animate-spin border-2 border-blue-300 border-t-transparent rounded-full" />
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