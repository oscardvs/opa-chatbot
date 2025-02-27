# Render Deployment Guide for O.P.A Chatbot

This guide explains how to deploy the O.P.A Chatbot application on Render.com using a two-service architecture.

## Architecture

The application uses two separate services on Render:

1. **Backend Service (Web Service)**: Node.js Express server with API endpoints
2. **Frontend Service (Static Site)**: React static files served via Render's static site hosting

## Setup Instructions

### 1. Backend Service Setup

1. Go to [Render Dashboard](https://dashboard.render.com) and create a new Web Service:
   - Connect your GitHub repository
   - Name: `opa-backend` (or your preferred name)
   - Build Command: `cd server && npm install`
   - Start Command: `node server.js`
   - Environment Variables:
     ```
     ANTHROPIC_API_KEY=your_claude_api_key
     NODE_ENV=production
     GOOGLE_CLIENT_ID=your_google_oauth_client_id
     GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
     GOOGLE_REDIRECT_URI=https://YOUR_BACKEND_URL/api/integrations/auth/google/callback
     LINKEDIN_CLIENT_ID=your_linkedin_client_id
     LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
     LINKEDIN_REDIRECT_URI=https://YOUR_BACKEND_URL/api/integrations/auth/linkedin/callback
     ```

2. Create the service and wait for it to deploy
3. Note the URL assigned to this service (e.g., `https://opa-backend.onrender.com`)

### 2. Configure Client for Production

Before deploying the frontend, update the `.env.production` file in the client directory:

```
# Production environment variables for client
VITE_API_URL=https://opa-backend.onrender.com/api
```

Replace `https://opa-backend.onrender.com` with your actual backend URL.

### 3. Frontend Service Setup

1. Go to [Render Dashboard](https://dashboard.render.com) and create a new Static Site:
   - Connect your GitHub repository
   - Name: `opa-frontend` (or your preferred name)
   - Build Command: `cd client && npm install && npx vite build`
   - Publish Directory: `client/dist`
   - No environment variables needed (handled through .env.production)

2. Create the service and wait for it to deploy
3. Note the URL assigned to this service (e.g., `https://opa-frontend.onrender.com`)

### 4. CORS Configuration

Your backend is already configured with CORS to allow requests from your frontend domain.

### 5. API Debugging

If you encounter integration API issues, try the "Test API" button in the Integrations panel, which will show detailed error messages about the connection to your backend API.

Common issues to check:
- Ensure your backend URL in `.env.production` is correct
- Verify all environment variables are set correctly on the backend
- Check CORS settings in the server.js file
- Ensure the OAuth redirect URIs match exactly in both your OAuth providers and environment variables

## Custom Domain Setup (Optional)

If you want to use a custom domain:

1. Configure your DNS provider to point to Render's IP addresses
2. Add your custom domain in the Render dashboard for both services
3. Update `.env.production` to use your custom domain for the backend API URL
4. Update OAuth redirect URIs to use your custom domain

## Monitoring and Logs

- Use the Render dashboard to monitor your services
- Check logs for any errors during deployment or runtime
- Use the "Test API" feature in the integration panel for direct API debugging