# O.P.A (Odesha Personal Assistant)

An AI chatbot built with React and Claude API, featuring real-time interaction, syntax-highlighted Markdown responses, and responsive design.

---

## Project Structure
```
opa-chatbot/
├── src/
│   ├── components/
│   │   └── OPAChatbot.jsx    # Main chatbot component
│   ├── App.jsx              # Root component
│   ├── index.css            # Global styles and animations
│   └── main.jsx            # Entry point
├── public/
│   └── ...                 # Static assets
├── server.js               # Backend server
├── .env                    # Environment variables
├── package.json           # Project dependencies
└── README.md             # This file
```

---

## Technologies Used

### Frontend:
- React (Vite)
- Tailwind CSS (with Typography plugin)
- Axios
- Lucide React (icons)
- React Markdown
- Highlight.js (for code syntax highlighting)

### Backend:
- Express.js
- CORS
- Axios
- dotenv

---

## Setup Instructions

### 1. Install Dependencies
```bash
# Create new Vite project
npm create vite@latest opa-chatbot -- --template react
cd opa-chatbot

# Install frontend dependencies
npm install axios lucide-react react-markdown remark-gfm rehype-highlight highlight.js

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install backend dependencies
npm install express cors dotenv axios
```

### 2. Configure Environment
Create `.env` file in project root:
```
ANTHROPIC_API_KEY=your_api_key_here
```

### 3. Configure Tailwind
Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

### 4. Add CSS Styles
Update `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom animations */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pop {
  0% {
    transform: scale(0.95);
  }
  40% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

/* Syntax highlighting */
@import 'highlight.js/styles/dracula.css';
```

### 5. Configure Vite
Update `vite.config.js` to support proxying API requests:
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: [
      'oscardevos.com',
      'www.oscardevos.com',
      'localhost',
    ],
  },
});
```

### 6. Running the Application

1. Start the backend server:
```bash
node server.js
```

2. Start the frontend development server:
```bash
npm run dev
```

---

## Markdown and Code Highlighting

- **React Markdown**: Enables Markdown rendering in chat messages.
- **Highlight.js**: Provides syntax highlighting for code blocks.
- **Tailwind Typography**: Applies beautiful styles to Markdown content.

Ensure the chatbot handles Markdown responses with code formatting:

Example response:
```markdown
Here’s a Python script:

```python
for i in range(5):
    print(i)
```
```

Rendered code blocks use the Dracula theme from Highlight.js.

---

## Deployment Instructions

### 1. Server Setup
```bash
sudo apt update
sudo apt install nginx net-tools
sudo ufw enable
sudo ufw allow 'Nginx Full'
sudo ufw allow 80
sudo ufw allow 443
```

### 2. Configure Nginx

Update Nginx configuration for API proxying:
```nginx
server {
    listen 443 ssl http2;
    server_name oscardevos.com www.oscardevos.com;

    ssl_certificate /etc/letsencrypt/live/oscardevos.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/oscardevos.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
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
sudo nginx -t
sudo systemctl restart nginx
```

### 3. SSL Certificate Setup
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d oscardevos.com -d www.oscardevos.com
```

### 4. Process Management
```bash
npm install -g pm2
pm2 start server.js --name "opa-backend"
pm2 start npm --name "opa-frontend" -- run dev
pm2 save
```

---

## Features

- **Real-time chat** with Markdown support.
- **Code syntax highlighting** with Highlight.js.
- **Responsive design** for laptops and mobile.
- **Interactive reactions** (thumbs up/down).
- **Message animations**.

---

## Future Improvements

- Add message persistence.
- Enable file uploads.
- Add typing indicators.
- Implement authentication.

---

## Troubleshooting

1. **502 Bad Gateway**:
   - Check Nginx configuration.
   - Confirm backend server is running.

2. **Highlight.js not working**:
   - Ensure Dracula CSS is imported in `index.css`.

3. **Markdown rendering issues**:
   - Ensure messages are properly formatted with triple backticks.

# O.P.A (Odesha Personal Assistant)

An AI chatbot built with React and Claude API, featuring real-time interaction, syntax-highlighted Markdown responses, and responsive design.

---

## Project Structure
```
opa-chatbot/
├── src/
│   ├── components/
│   │   ├── OPAChatbot.jsx    # Main chatbot component
│   │   └── OdeshaLogo.jsx    # Logo component
│   ├── App.jsx              # Root component
│   ├── index.css            # Global styles and animations
│   └── main.jsx            # Entry point
├── public/
│   ├── cv/                 # CV storage directory
│   │   └── oscar_cv.pdf    # Your CV file
│   └── ...                 # Other static assets
├── server.js               # Backend server
├── .env                    # Environment variables
├── package.json           # Project dependencies
└── README.md             # This file
```

[Previous sections remain the same until Features...]

## Features

- **Real-time chat** with Markdown support.
- **Code syntax highlighting** with Highlight.js.
- **Responsive design** for laptops and mobile.
- **Interactive reactions** (thumbs up/down).
- **Message animations**.
- **CV download functionality** for easy resume access.

---

## CV Download Feature Setup

1. Create the CV directory structure:
```bash
mkdir -p public/cv
```

2. Place your CV file:
```bash
# Move your CV to the public directory
mv your_cv.pdf public/cv/oscar_cv.pdf

# Set proper permissions
chmod 755 public/cv
chmod 644 public/cv/oscar_cv.pdf
```

3. Configure the CV endpoint in server.js:
```javascript
import { dirname, join } from 'path';  // Add join import

// Add CV download endpoint
app.get('/api/download-cv', (req, res) => {
  try {
    const cvPath = join(__dirname, 'public', 'cv', 'oscar_cv.pdf');
    res.download(cvPath, 'Oscar_DevOs_CV.pdf');
  } catch (err) {
    console.error('CV download error:', err);
    res.status(500).send('Error downloading CV');
  }
});
```

4. Update Nginx configuration to handle CV downloads:
```nginx
location /api/ {
    proxy_pass         http://localhost:3000/api/;
    proxy_http_version 1.1;
    proxy_set_header   Upgrade $http_upgrade;
    proxy_set_header   Connection "upgrade";
    proxy_set_header   Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

---

## Server Management

### When to Restart Services

You need to restart the services in the following situations:
1. After modifying server.js
2. After updating Nginx configuration
3. After adding new environment variables
4. After installing new npm packages
5. When experiencing 502 Bad Gateway errors
6. When the application becomes unresponsive

### Restart Procedure

Always restart services in this specific order:

```bash
# 1. Stop all PM2 processes
pm2 stop all

# 2. Delete all PM2 processes
pm2 delete all

# 3. If you modified Nginx configuration:
sudo nginx -t                  # Test configuration
sudo systemctl restart nginx   # Restart if test passes

# 4. Start backend server
pm2 start server.js --name "opa-backend"

# 5. Start frontend development server
pm2 start npm --name "opa-frontend" -- run dev

# 6. Save PM2 process list
  pm2 save

# 7. Check if everything is running
pm2 list
```

### Quick Health Check

To verify your services are running correctly:

```bash
# Check PM2 processes
pm2 list

# Check PM2 logs
pm2 logs opa-backend

# Check Nginx status
sudo systemctl status nginx

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check if ports are being used
sudo netstat -tlpn | grep -E ':80|:443|:3000|:5173'
```

---

[Rest of the README remains the same...]