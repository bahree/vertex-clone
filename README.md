# Vertex Clone

A modern clone of the discontinued NYTimes Vertex puzzle game. Connect numbered vertices to form triangles and reveal beautiful images!

## Features

- 🎮 **Interactive Puzzle Game**: Connect dots to form colorful triangles
- 🎨 **Beautiful Color Palettes**: Authentic NYTimes Vertex color schemes
- 📱 **Multi-Device Support**: Optimized for desktop, tablet, and mobile
- 👤 **User Management**: Authentication, progress tracking, and statistics
- 🔒 **Admin Panel**: User invitation and management system
- 🐳 **Docker Deployment**: Easy deployment with Docker Compose
- 🌐 **Caddy Compatible**: Works seamlessly behind Caddy reverse proxy

## Tech Stack

- **Frontend**: HTML5 Canvas, JavaScript, CSS3, PWA
- **Backend**: Node.js, Express, JWT authentication
- **Database**: PostgreSQL
- **Deployment**: Docker, Docker Compose, Nginx

## Quick Start

### Prerequisites

- **Docker Desktop** (Windows, Mac, Linux) or Docker + Docker Compose
- **WSL2** (for Windows users)
- **Git**

### Using Docker (Recommended)

#### Windows with WSL2 Setup

1. **Install WSL2 and Docker Desktop**:
   - Enable WSL2 in Windows Features
   - Install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
   - Enable WSL2 integration in Docker Desktop settings

2. **Open WSL2 terminal** (Ubuntu or your preferred distro):
   ```bash
   wsl
   ```

3. **Clone the repository inside WSL2**:
   ```bash
   git clone https://github.com/bahree/vertex-clone.git
   cd vertex-clone
   ```

4. **No .env file needed!** The application uses sensible defaults from `docker-compose.yml`. The `.env.example` file is just for reference if you want to customize settings later.

5. **Build and start the application**:
   ```bash
   docker-compose up --build
   ```
   
   First run will take a few minutes to:
   - Build the backend Docker image
   - Pull PostgreSQL and Nginx images
   - Run database migrations
   - Seed sample puzzles

6. **Access the game**:
   - Open browser: `http://localhost:8888`
   - Sign up to create an account (first user becomes admin)
   - Start playing!

7. **To run in background** (after first successful build):
   ```bash
   docker-compose down
   docker-compose up -d
   ```

#### Mac/Linux Setup

1. Clone the repository:
```bash
git clone https://github.com/bahree/vertex-clone.git
cd vertex-clone
```

2. Build and start:
```bash
docker-compose up --build
```

3. Access the game at `http://localhost:8888`

### Manual Setup

#### Backend

```bash
cd backend
npm install
npm run migrate
npm start
```

#### Frontend

The frontend is served by Nginx in Docker, or you can serve it with any static file server:

```bash
cd frontend
# Using Python
python3 -m http.server 8080

# Using Node.js serve
npx serve -p 8080
```

## Configuration

### Environment Variables

**Note:** For quick testing, **no `.env` file is required!** The `docker-compose.yml` contains sensible defaults that work out of the box.

The `backend/.env.example` file is provided for reference if you want to customize settings. To use custom configuration, create `backend/.env` file:

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@db:5432/vertex

# JWT
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRY=7d

# Admin
ADMIN_INVITATION_REQUIRED=true
```

**Important:** If you create a `.env` file, you must also update `docker-compose.yml` to use it. By default, `docker-compose.yml` has all required environment variables configured inline.

### Docker Compose

The application runs on port 8888 by default. To change this, edit `docker-compose.yml`:

```yaml
services:
  nginx:
    ports:
      - "8888:80"
```

## Troubleshooting

### Windows WSL2 Issues

**Problem: Docker commands not working in WSL2**
```bash
# Solution: Ensure Docker Desktop is running and WSL2 integration is enabled
# Go to Docker Desktop -> Settings -> Resources -> WSL Integration
# Enable integration for your WSL2 distro
```

**Problem: "Cannot connect to Docker daemon"**
```bash
# Solution: Start Docker Desktop on Windows
# Wait for Docker to fully start (whale icon in system tray)
```

**Problem: Port 8888 already in use**
```bash
# Solution 1: Find and stop the process using port 8888
netstat -ano | findstr :8888
taskkill /PID <process_id> /F

# Solution 2: Change the port in docker-compose.yml
# Edit the nginx ports section to use a different port like 8889:80
```

**Problem: Slow performance on Windows**
```bash
# Solution: Ensure repository is cloned inside WSL2 filesystem, not on /mnt/c/
# WSL2 paths: /home/username/vertex-clone (FAST)
# Windows paths: /mnt/c/Users/... (SLOW)
```

**Problem: "npm run setup" fails during docker-compose up**
```bash
# Solution: Check the backend container logs
docker-compose logs backend

# Common fixes:
# 1. Database not ready - wait a few more seconds and try again
# 2. Network issues - restart Docker Desktop
```

### General Troubleshooting

**View logs for specific services:**
```bash
docker-compose logs backend    # Backend API logs
docker-compose logs db         # Database logs
docker-compose logs nginx      # Nginx logs
docker-compose logs -f         # Follow all logs
```

**Restart a specific service:**
```bash
docker-compose restart backend
docker-compose restart db
```

**Clean restart (removes all data):**
```bash
docker-compose down -v         # Removes volumes (database data)
docker-compose up --build      # Rebuild and start fresh
```

**Check if containers are running:**
```bash
docker-compose ps
```

**Access backend container shell:**
```bash
docker-compose exec backend sh
```

**Access database directly:**
```bash
docker-compose exec db psql -U vertex_user -d vertex_db
```

### Browser Issues

**Problem: Can't access http://localhost:8888**
- Verify containers are running: `docker-compose ps`
- Check if port is bound: `docker-compose ps` (should show `0.0.0.0:8888->80/tcp`)
- Try `http://127.0.0.1:8888` instead
- Clear browser cache and cookies
- Try a different browser

**Problem: Login/Signup not working**
- Open browser console (F12) to check for errors
- Verify backend is running: `docker-compose logs backend`
- Check API endpoint: `curl http://localhost:8888/api/health`

## Architecture

```
vertex-clone/
├── frontend/          # Game UI (HTML/CSS/JS)
├── backend/          # API server (Node.js/Express)
├── nginx.conf        # Nginx configuration
├── docker-compose.yml # Docker orchestration
└── README.md         # This file
```

### Multi-Container Setup

- **Nginx**: Serves frontend, proxies `/api/*` to backend
- **Backend**: Node.js API server (port 3000 internal)
- **PostgreSQL**: Database (port 5432 internal)

Only Nginx is exposed on port 8888.

## Game Mechanics

### How to Play

1. **Connect Vertices**: Click/tap a numbered dot, drag to another dot, release to connect
2. **Form Triangles**: Connect three dots to create a triangle
3. **Fill Colors**: Correctly formed triangles fill with color
4. **Reveal Image**: Complete all triangles to reveal the hidden image
5. **Numbers Matter**: Each vertex number shows how many connections it needs

### Puzzle Features

- Multiple difficulty levels (easy, medium, hard)
- Themed puzzles (food, nature, objects, animals, emoji)
- Daily puzzle challenges
- Progress tracking and statistics

## Development

### Project Structure

```
frontend/
├── index.html              # Main game page
├── css/
│   ├── styles.css         # Core styles
│   └── responsive.css     # Mobile/tablet styles
├── js/
│   ├── game.js           # Game engine
│   ├── vertex.js         # Vertex logic
│   ├── triangle.js       # Triangle detection
│   ├── inputHandler.js   # Touch/mouse handling
│   ├── storage.js        # Local storage
│   └── auth.js           # Authentication
└── manifest.json         # PWA manifest

backend/
├── src/
│   ├── server.js         # Express server
│   ├── auth.js           # JWT authentication
│   ├── routes/           # API routes
│   ├── models/           # Database models
│   └── utils/
│       └── puzzleGenerator.js  # Image-to-puzzle tool
├── migrations/           # Database migrations
└── package.json
```

### Database Schema

```sql
-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Puzzles
CREATE TABLE puzzles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  difficulty VARCHAR(20),
  theme VARCHAR(50),
  json_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Progress
CREATE TABLE user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  puzzle_id INTEGER REFERENCES puzzles(id),
  completed BOOLEAN DEFAULT FALSE,
  completion_time INTEGER,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, puzzle_id)
);

-- User Queue
CREATE TABLE user_queue (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  puzzle_order INTEGER[] NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Deployment

### Behind Caddy Reverse Proxy

Add to your Caddyfile:

```
vertex.yourdomain.com {
    reverse_proxy localhost:8888
}
```

### SSL/HTTPS

Caddy automatically handles SSL certificates. For manual setup:

```
vertex.yourdomain.com {
    reverse_proxy localhost:8888
    tls your@email.com
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

See [LICENSE](LICENSE) file for details.

## Acknowledgments

- Original Vertex game by The New York Times
- Delaunay triangulation algorithms
- Open source icon libraries for puzzle images

## Support

For issues, questions, or suggestions, please open an issue on GitHub.
