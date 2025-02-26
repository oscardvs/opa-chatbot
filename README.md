# O.P.A (Odesha Personal Assistant)

An AI chatbot built with React and Claude API, featuring real-time interaction, syntax-highlighted Markdown responses, file management, image gallery, and responsive design.

---

## Project Structure
```
opa-chatbot/
├── client/                    # Frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── OPAChatbot.jsx    # Main chatbot interface
│   │   │   ├── FileManager.jsx   # JavaScript file editor
│   │   │   ├── Gallery.jsx       # Image gallery
│   │   │   ├── Lightbox.jsx      # Image lightbox
│   │   │   └── OdeshaLogo.jsx    # Landing screen
│   │   ├── utils/               # Utility functions
│   │   ├── App.jsx              # Root component
│   │   ├── index.css            # Global styles and animations
│   │   └── main.jsx            # Entry point
│   ├── public/
│   │   ├── cv/                 # CV storage
│   │   ├── images/             # Image gallery assets
│   │   └── ...                 # Other static assets
│   └── vite.config.js          # Vite configuration
├── server/                     # Backend
│   ├── server.js               # Express server
│   ├── imageHelper.js          # Image search utility
│   └── workspace/              # User file storage
├── .env                        # Environment variables
├── package.json                # Project dependencies
└── README.md                   # This file
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
- CORS for cross-origin handling
- dotenv for environment management

---

## Features

- **AI-powered chat** with Claude API integration and conversation memory
- **Markdown rendering** with code syntax highlighting
- **File management system** for creating, editing, and executing JavaScript files
- **Image gallery** with search and lightbox functionality
- **CV download** for easy resume access
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
Create `.env` file in the server directory:
```
ANTHROPIC_API_KEY=your_api_key_here
PORT=3000
```

### 3. Running the Application

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

3. **File editor issues**:
   - Check permissions on the workspace directory
   - Verify VM2 sandbox configuration in server.js

---

## Future Improvements and Integrations

### Planned Features
- **Authentication system** for user accounts
- **Database integration** for persistent chat history
- **Voice input/output** capabilities
- **Mobile app** version using React Native
- **More tools integration** with Claude API

### Potential Integrations
- **GitHub integration** for code examples and project browsing
- **Calendar integration** for scheduling and reminders
- **Email integration** for sending messages directly from chat
- **Notion/Obsidian integration** for knowledge management
- **LinkedIn integration** for professional networking

### Development Roadmap
1. Implement authentication (Q2 2025)
2. Add database persistence (Q3 2025)
3. Create mobile application (Q4 2025)
4. Enhance AI capabilities with specialized tools (Ongoing)

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

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Contact

Oscar Devos - [website](https://oscardevos.com)