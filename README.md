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

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/bahree/vertex-clone.git
cd vertex-clone
```

2. Create environment file:
```bash
cp backend/.env.example backend/.env
# Edit .env with your configuration
```

3. Start the application:
```bash
docker-compose up -d
```

4. Access the game at `http://localhost:8888`

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

Create `backend/.env` file:

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

### Docker Compose

The application runs on port 8888 by default. To change this, edit `docker-compose.yml`:

```yaml
services:
  nginx:
    ports:
      - "8888:80"
```

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
