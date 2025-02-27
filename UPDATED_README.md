# O.P.A (Odesha Personal Assistant)

An AI chatbot built with React and Claude API, featuring real-time interaction, syntax-highlighted Markdown responses, file management, image gallery, Google Calendar/Gmail integration, LinkedIn integration, and responsive design.

---

## Project Structure
```
opa-chatbot/
├── client/                    # Frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── OPAChatbot.jsx       # Main chatbot interface
│   │   │   ├── FileManager.jsx      # JavaScript file editor
│   │   │   ├── Gallery.jsx          # Image gallery
│   │   │   ├── Lightbox.jsx         # Image lightbox
│   │   │   ├── OdeshaLogo.jsx       # Landing screen
│   │   │   └── IntegrationManager.jsx # Integration management UI
│   │   ├── utils/                 # Utility functions
│   │   │   └── integrations.js     # Integration utilities
│   │   ├── App.jsx                # Root component
│   │   ├── index.css              # Global styles and animations
│   │   └── main.jsx               # Entry point
│   ├── public/
│   │   ├── cv/                    # CV storage
│   │   ├── images/                # Image gallery assets
│   │   └── ...                    # Other static assets
│   └── vite.config.js            # Vite configuration
├── server/                        # Backend
│   ├── server.js                  # Express server
│   ├── imageHelper.js             # Image search utility
│   ├── integrationHandler.js      # Integration API handlers
│   ├── routes/
│   │   └── integrationRoutes.js   # Integration API routes
│   └── workspace/                 # User file storage
├── .env                           # Environment variables
├── package.json                   # Project dependencies
├── INTEGRATION_SETUP.md           # Integration setup guide
└── README.md                      # This file
```

---

## Technologies Used

### Frontend:
- React (Vite)
- Tailwind CSS (with Typography plugin)
- Axios for API requests
- Lucide React for icons
- React Markdown with remark-gfm
- Highlight.js for code syntax highlighting
- CodeMirror for code editing

### Backend:
- Express.js for server framework
- Claude API (Anthropic) for AI capabilities
- VM2 for sandboxed JavaScript execution
- Google API client libraries for Calendar/Gmail
- LinkedIn API for professional networking
- CORS for cross-origin handling
- dotenv for environment management

---

## Features

- **AI-powered chat** with Claude API integration and conversation memory
- **Markdown rendering** with code syntax highlighting
- **File management system** for creating, editing, and executing JavaScript files
- **Image gallery** with search and lightbox functionality
- **CV download** for easy resume access
- **Google Calendar integration** for scheduling and availability checking
- **Gmail integration** for sending emails directly from chat
- **LinkedIn integration** for professional networking
- **Responsive design** for desktop and mobile
- **Interactive UI** with animations and loading indicators
- **Secure code execution** in a sandboxed environment
- **Multi-user support** with unique session tracking

---

## Setup Instructions

### 1. Install Dependencies
```bash
# Clone the repository
git clone https://github.com/yourusername/opa-chatbot.git
cd opa-chatbot

# Install backend dependencies
cd server
npm install
cd ..

# Install frontend dependencies
cd client
npm install
```

### 2. Configure Environment
Create `.env` file in the project root directory:
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

### 3. Integration Setup
For detailed instructions on setting up Google Calendar, Gmail, and LinkedIn integrations, see the [INTEGRATION_SETUP.md](INTEGRATION_SETUP.md) file.

### 4. Running the Application

#### Development Mode
1. Start the backend server:
```bash
cd server
npm run dev
```

2. Start the frontend development server:
```bash
cd client
npm run dev
```

The application will be available at `http://localhost:5173`

---

## Deployment

### Development Mode
For local development:
```bash
# Terminal 1: Start backend with nodemon for auto-reloading
cd server
npm run dev

# Terminal 2: Start frontend with Vite dev server
cd client
npm run dev
```

### Production Deployment

#### 1. Build Frontend
```bash
cd client
npm run build
```

#### 2. Server Setup (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install nginx net-tools
sudo ufw enable
sudo ufw allow 'Nginx Full'
sudo ufw allow 80
sudo ufw allow 443
```

#### 3. Configure Nginx

Create Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/oscardevos.com
```

Add the following content:
```nginx
server {
    listen 443 ssl http2;
    server_name oscardevos.com www.oscardevos.com;

    ssl_certificate /etc/letsencrypt/live/oscardevos.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/oscardevos.com/privkey.pem;

    # Serve frontend static files
    location / {
        root /path/to/opa-chatbot/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name oscardevos.com www.oscardevos.com;
    return 301 https://$server_name$request_uri;
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/oscardevos.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default  # Optional: remove default site
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

#### 4. SSL Certificate Setup
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d oscardevos.com -d www.oscardevos.com
```

#### 5. Process Management with PM2
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the backend server
cd /path/to/opa-chatbot/server
pm2 start server.js --name "opa-backend"

# Configure PM2 to start on system boot
pm2 startup
pm2 save
```

---

## Server Management

### Service Restart Procedure

When you need to restart services:

```bash
# Restart backend only
pm2 restart opa-backend

# View logs
pm2 logs opa-backend

# If you modified Nginx configuration:
sudo nginx -t                  # Test configuration
sudo systemctl restart nginx   # Restart if test passes

# Health check
pm2 list
sudo systemctl status nginx
```

### Troubleshooting

1. **502 Bad Gateway**:
   - Check if backend server is running: `pm2 list`
   - Check PM2 logs: `pm2 logs opa-backend`
   - Verify Nginx configuration: `sudo nginx -t`

2. **Frontend not loading**:
   - Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
   - Verify that dist files are correctly built and accessible

3. **Integration issues**:
   - Check OAuth credentials are set in .env file
   - Verify redirect URIs match your domain
   - Check browser console for OAuth errors
   - Examine server logs for API errors

---

## Using Integrations

### Calendar Features
- Check your schedule: "What's on my calendar today?"
- Check availability: "Am I available tomorrow at 2pm?"
- Create events: "Schedule a meeting with John on Friday at 10am"
- Get reminders about upcoming events

### Email Features
- Send emails: "Send an email to john@example.com about the project update"
- Format emails with proper structure
- Follow-up reminders

### LinkedIn Features
- View profile information
- Share updates on LinkedIn
- Network with professional connections

Each integration requires connecting the respective service through the Integrations panel (click the link icon in the top navigation bar).

---

## Future Improvements and Plans

### Additional Integrations
- **WhatsApp integration** for messaging
- **Notion integration** for knowledge management
- **Zoom integration** for meeting scheduling

### Enhanced AI Capabilities
- **Voice input/output** capabilities
- **PDF file parsing** for document analysis
- **Image recognition** for visual inputs

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Contact

Oscar Devos - [website](https://oscardevos.com)