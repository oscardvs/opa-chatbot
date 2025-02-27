# O.P.A (Odesha Personal Assistant) Integration Setup Guide

This guide will help you set up the external integrations for your O.P.A chatbot, including Google Calendar, Gmail, and LinkedIn.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google Integration Setup (Calendar & Gmail)](#google-integration-setup-calendar--gmail)
3. [LinkedIn Integration Setup](#linkedin-integration-setup)
4. [Environment Variables](#environment-variables)
5. [Troubleshooting](#troubleshooting)

## Prerequisites

Before setting up the integrations, make sure you have:

- A Google account (for Calendar and Gmail)
- A LinkedIn account (for LinkedIn integration)
- Access to the Google Cloud Console and LinkedIn Developer Portal
- Node.js and npm installed (if running locally)

## Google Integration Setup (Calendar & Gmail)

### Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Give your project a meaningful name (e.g., "OPA Assistant")

### Step 2: Enable Required APIs

1. Navigate to the "APIs & Services" > "Library" section
2. Search for and enable the following APIs:
   - Google Calendar API
   - Gmail API
   - Google People API (for contacts)

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (unless you're using a Google Workspace)
3. Fill in the required information:
   - App name: "OPA Assistant"
   - User support email: Your email
   - Developer contact information: Your email
4. Add the following scopes to your OAuth consent screen:
   - `https://www.googleapis.com/auth/calendar` (Calendar access)
   - `https://www.googleapis.com/auth/calendar.events` (Calendar events)
   - `https://www.googleapis.com/auth/gmail.send` (Send emails)
5. Add any test users (including your own email address)
6. Complete the registration process

### Step 4: Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" and select "OAuth client ID"
3. Application type: "Web application"
4. Name: "OPA Assistant Web Client"
5. Authorized JavaScript origins:
   - `http://localhost:3000` (for local development)
   - `https://yourdomain.com` (if you have a live deployment)
6. Authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (for local development)
   - `https://yourdomain.com/auth/google/callback` (if you have a live deployment)
7. Click "Create" and note down the Client ID and Client Secret

## LinkedIn Integration Setup

### Step 1: Create a LinkedIn Developer Application

1. Go to the [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps/)
2. Click "Create App"
3. Fill in the required information:
   - App name: "OPA Assistant"
   - LinkedIn Page: Your LinkedIn page (or create one)
   - App logo: Upload a logo
   - Legal Agreement: Accept terms
4. Click "Create App"

### Step 2: Configure Auth Settings

1. In your app's dashboard, go to "Auth" tab
2. Under "OAuth 2.0 settings", add Redirect URLs:
   - `http://localhost:3000/auth/linkedin/callback` (for local development)
   - `https://yourdomain.com/auth/linkedin/callback` (if you have a live deployment)

### Step 3: Request Products Access

1. Go to the "Products" tab
2. Request access to the following products:
   - Sign In with LinkedIn
   - Share on LinkedIn
   - Marketing Developer Platform (if needed for more advanced features)

### Step 4: Get Credentials

1. Go to the "Auth" tab
2. Note down the Client ID and Client Secret

## Environment Variables

After obtaining all necessary credentials, update your `.env` file with the following:

```
# Anthropic API Key (required)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Server port
PORT=3000

# Google OAuth Credentials for Calendar and Gmail integration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# LinkedIn OAuth Credentials
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
LINKEDIN_REDIRECT_URI=http://localhost:3000/auth/linkedin/callback
```

For production deployment, update the redirect URIs to your actual domain.

## Using the Integrations

Once the integrations are set up:

1. Log in to the O.P.A chatbot interface
2. Click the "Integrations" button in the top navigation bar
3. Connect each service by clicking the respective "Connect" buttons
4. Follow the OAuth flow to authorize the application
5. Once connected, you can use the following features:

### Calendar Features

- Ask about your schedule: "What's on my calendar today?"
- Check availability: "Am I available tomorrow at 2pm?"
- Create events: "Schedule a meeting with John on Friday at 10am"
- Get reminders: "Remind me about my upcoming meetings"

### Email Features

- Send emails: "Send an email to john@example.com about the project update"
- Format emails: "Send a formatted email to the team with the meeting agenda"
- Follow-up reminders: "Remind me to follow up with Sarah if she doesn't respond by Friday"

### LinkedIn Features

- Profile information: "Show me my LinkedIn profile"
- Share updates: "Share a post on LinkedIn about the new project launch"
- Check connections: "Do I have any LinkedIn connections at Company X?"

## Troubleshooting

### Common Issues

1. **OAuth Errors**: Ensure your redirect URIs are correctly configured in both the provider console and your .env file

2. **Scope Permission Issues**: If certain features don't work, check that you've enabled the correct API scopes:
   - For Calendar: `https://www.googleapis.com/auth/calendar` and `https://www.googleapis.com/auth/calendar.events`
   - For Gmail: `https://www.googleapis.com/auth/gmail.send`
   - For LinkedIn: Ensure the correct products are enabled

3. **Integration Not Working**: Check the browser console for errors, and server logs for backend issues

4. **"Not Authorized" Errors**: The auth token may have expired. Try disconnecting and reconnecting the service

### Getting Help

If you encounter any issues, please:

1. Check the server logs for detailed error messages
2. Consult the API documentation for each provider:
   - [Google Calendar API](https://developers.google.com/calendar/api)
   - [Gmail API](https://developers.google.com/gmail/api)
   - [LinkedIn API](https://docs.microsoft.com/en-us/linkedin/)