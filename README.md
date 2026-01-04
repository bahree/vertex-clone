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

#### Linux (Ubuntu/Debian) Setup

1. **Install Docker and Docker Compose**:
   ```bash
   # Update package index
   sudo apt-get update
   
   # Install Docker
   sudo apt-get install -y docker.io docker-compose
   
   # Add your user to docker group (to run without sudo)
   sudo usermod -aG docker $USER
   
   # Log out and back in for group changes to take effect
   ```

2. **Clone the repository**:
   ```bash
   git clone https://github.com/bahree/vertex-clone.git
   cd vertex-clone
   ```

3. **Build and start**:
   ```bash
   docker-compose up --build
   ```
   
   First run will take a few minutes to build images and seed puzzles.

4. **Access the game**: `http://localhost:8888`

5. **To run in background**:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

#### macOS Setup

1. **Install Docker Desktop**:
   - Download [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)
   - Install and start Docker Desktop
   - Wait for Docker to be running (whale icon in menu bar)

2. **Clone the repository**:
   ```bash
   git clone https://github.com/bahree/vertex-clone.git
   cd vertex-clone
   ```

3. **Build and start**:
   ```bash
   docker-compose up --build
   ```

4. **Access the game**: `http://localhost:8888`

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

## Adding Puzzles

### Method 1: Quick Add (Recommended for Testing)

1. **Edit the puzzle JSON file**:
   ```bash
   # Open the sample puzzles file
   nano frontend/puzzles/sample-puzzles.json
   # or use your preferred editor
   ```

2. **Add your puzzle** following this format:
   ```json
   {
     "name": "Your Puzzle Name",
     "difficulty": "easy",  // or "medium", "hard"
     "theme": "shapes",     // or "objects", "nature", "animals", etc.
     "json_data": {
       "vertices": [
         { "id": 0, "x": 50, "y": 20, "connections": 2 },
         { "id": 1, "x": 20, "y": 80, "connections": 2 },
         { "id": 2, "x": 80, "y": 80, "connections": 2 }
       ],
       "triangles": [
         { "v1": 0, "v2": 1, "v3": 2, "color": "#f7da21" }
       ]
     }
   }
   ```

3. **Restart the application**:
   ```bash
   docker-compose down
   docker-compose up --build
   ```
   
   The seed script automatically imports new puzzles on startup.

### Method 2: Database Direct Insert (For Production)

1. **Access the database**:
   ```bash
   docker-compose exec db psql -U vertex_user -d vertex_db
   ```

2. **Insert a puzzle**:
   ```sql
   INSERT INTO puzzles (name, difficulty, theme, json_data)
   VALUES (
     'My Custom Puzzle',
     'medium',
     'custom',
     '{
       "vertices": [
         {"id": 0, "x": 50, "y": 20, "connections": 2},
         {"id": 1, "x": 20, "y": 80, "connections": 2},
         {"id": 2, "x": 80, "y": 80, "connections": 2}
       ],
       "triangles": [
         {"v1": 0, "v2": 1, "v3": 2, "color": "#f7da21"}
       ]
     }'::jsonb
   );
   ```

3. **Exit database**: `\q`

### Method 3: Bulk Import Script

1. **Create a new JSON file** with multiple puzzles:
   ```bash
   nano my-custom-puzzles.json
   ```

2. **Run the seed script with your file**:
   ```bash
   # Copy your file to the container
   docker cp my-custom-puzzles.json vertex-backend:/app/puzzles.json
   
   # Run a custom seed
   docker-compose exec backend node -e "
   const { Client } = require('pg');
   const fs = require('fs');
   (async () => {
     const client = new Client({ connectionString: process.env.DATABASE_URL });
     await client.connect();
     const puzzles = JSON.parse(fs.readFileSync('/app/puzzles.json'));
     for (const p of puzzles) {
       await client.query('INSERT INTO puzzles (name, difficulty, theme, json_data) VALUES (\$1, \$2, \$3, \$4)', 
         [p.name, p.difficulty, p.theme, p.json_data]);
       console.log('Added:', p.name);
     }
     await client.end();
   })();
   "
   ```

### Puzzle Format Specification

**Vertices:**
- `id`: Unique identifier (0, 1, 2, ...)
- `x`, `y`: Coordinates (0-100 range recommended for scaling)
- `connections`: Number of lines this vertex must have when complete

**Triangles:**
- `v1`, `v2`, `v3`: Vertex IDs that form the triangle
- `color`: Hex color code from the Vertex palette

**Available Colors:**
- `#f7da21` - Bright yellow
- `#b5e352` - Fresh green
- `#e05c56` - Lively red/pink
- `#00a2b3` - Striking teal/blue
- `#fb9b00` - Vivid orange

**Difficulty Guidelines:**
- **Easy**: 3-5 vertices, 1-3 triangles
- **Medium**: 6-10 vertices, 4-8 triangles
- **Hard**: 10+ vertices, 8+ triangles

### Tips for Creating Great Puzzles

1. **Start Simple**: Begin with basic shapes (triangle, square, diamond)
2. **Use Symmetry**: Symmetrical designs are more visually appealing
3. **Test Connection Counts**: Each vertex's `connections` value must equal the number of lines it will have
4. **Color Strategy**: Use contrasting colors for adjacent triangles
5. **Theme Consistency**: Group similar puzzles by theme
6. **Validation**: Test your puzzle in the game to ensure it's solvable

### Example: Creating a Pentagon Puzzle

```json
{
  "name": "Pentagon",
  "difficulty": "medium",
  "theme": "shapes",
  "json_data": {
    "vertices": [
      { "id": 0, "x": 50, "y": 10, "connections": 2 },
      { "id": 1, "x": 10, "y": 35, "connections": 2 },
      { "id": 2, "x": 20, "y": 80, "connections": 2 },
      { "id": 3, "x": 80, "y": 80, "connections": 2 },
      { "id": 4, "x": 90, "y": 35, "connections": 2 },
      { "id": 5, "x": 50, "y": 50, "connections": 5 }
    ],
    "triangles": [
      { "v1": 0, "v2": 1, "v3": 5, "color": "#f7da21" },
      { "v1": 1, "v2": 2, "v3": 5, "color": "#b5e352" },
      { "v1": 2, "v2": 3, "v3": 5, "color": "#00a2b3" },
      { "v1": 3, "v2": 4, "v3": 5, "color": "#e05c56" },
      { "v1": 4, "v2": 0, "v3": 5, "color": "#fb9b00" }
    ]
  }
}
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

Contributions are welcome! This project is open source and available for others to use, modify, and distribute.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Test thoroughly**: Ensure Docker build and game functionality work
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Contribution Ideas

- Add more puzzle designs
- Improve UI/UX
- Add new game features (hints, timer, leaderboards)
- Enhance mobile responsiveness
- Add puzzle generator tool
- Improve documentation
- Fix bugs
- Add translations

### Development Setup

For local development without Docker:

```bash
# Backend
cd backend
npm install
# Set up local PostgreSQL and configure .env
npm run migrate
npm run seed
npm run dev

# Frontend
cd frontend
# Serve with any static file server
python3 -m http.server 8080
```

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**What this means:**
- ✅ **Free to use** for personal or commercial projects
- ✅ **Free to modify** and create derivative works
- ✅ **Free to distribute** original or modified versions
- ✅ **Free to sublicense** under different terms
- ℹ️ **Requires** attribution to original authors
- ℹ️ **Provided "as-is"** without warranties

### MIT License Summary

```
MIT License

Copyright (c) 2026 Amit Bahree

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND...
```

See the full [LICENSE](LICENSE) file for complete terms.

## Acknowledgments

- Original Vertex game by The New York Times
- Delaunay triangulation algorithms
- Open source icon libraries for puzzle images

## Support

For issues, questions, or suggestions, please open an issue on GitHub.
