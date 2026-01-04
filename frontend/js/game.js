// Main game controller
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.vertices = [];
        this.triangles = [];
        this.connections = []; // Store line connections for rendering
        this.currentPuzzle = null;
        this.inputHandler = null;
        this.scale = 1;
        this.startTime = null;
        this.history = []; // For undo functionality

        this.init();
    }

    async init() {
        // Check authentication
        if (!Storage.isAuthenticated()) {
            this.showAuthScreen();
            return;
        }

        this.hideLoadingScreen();
        this.showGameScreen();
        this.setupEventListeners();
        await this.loadNextPuzzle();
    }

    setupEventListeners() {
        // Auth buttons
        document.getElementById('show-signup')?.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('login-form').classList.add('hidden');
            document.getElementById('signup-form').classList.remove('hidden');
        });

        document.getElementById('show-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('signup-form').classList.add('hidden');
            document.getElementById('login-form').classList.remove('hidden');
        });

        document.getElementById('signup-btn')?.addEventListener('click', () => this.handleSignup());
        document.getElementById('login-btn')?.addEventListener('click', () => this.handleLogin());

        // Game controls
        document.getElementById('undo-btn')?.addEventListener('click', () => this.undo());
        document.getElementById('reset-btn')?.addEventListener('click', () => this.reset());
        document.getElementById('menu-btn')?.addEventListener('click', () => this.showMenu());
        document.getElementById('new-puzzle-btn')?.addEventListener('click', () => {
            this.closeAllModals();
            this.loadNextPuzzle();
        });
        document.getElementById('stats-btn')?.addEventListener('click', () => this.showStats());
        document.getElementById('logout-btn')?.addEventListener('click', () => Auth.logout());
        document.getElementById('victory-next-btn')?.addEventListener('click', () => {
            this.closeAllModals();
            this.loadNextPuzzle();
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.add('hidden');
            });
        });

        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        });
    }

    async handleSignup() {
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const username = document.getElementById('signup-username').value;

        try {
            await Auth.signup(email, password, username);
            window.location.reload();
        } catch (error) {
            this.showError(error.message);
        }
    }

    async handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            await Auth.login(email, password);
            window.location.reload();
        } catch (error) {
            this.showError(error.message);
        }
    }

    showError(message) {
        const errorEl = document.getElementById('auth-error');
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
        setTimeout(() => errorEl.classList.add('hidden'), 5000);
    }

    async loadNextPuzzle() {
        try {
            const response = await Auth.request('/puzzles/random/next');
            this.currentPuzzle = response.puzzle;
            this.loadPuzzle(this.currentPuzzle);
        } catch (error) {
            console.error('Failed to load puzzle:', error);
            alert('Failed to load puzzle. Please try again.');
        }
    }

    loadPuzzle(puzzleData) {
        // Parse puzzle data
        const data = puzzleData.json_data;
        this.vertices = [];
        this.triangles = [];
        this.connections = [];
        this.history = [];
        this.startTime = Date.now();

        // Create vertices
        data.vertices.forEach(v => {
            this.vertices.push(new Vertex(v.id, v.x, v.y, v.connections));
        });

        // Create triangles
        data.triangles.forEach(t => {
            this.triangles.push(new Triangle(t.v1, t.v2, t.v3, t.color));
        });

        // Update UI
        document.getElementById('puzzle-name').textContent = puzzleData.name;
        const difficultyBadge = document.getElementById('puzzle-difficulty');
        difficultyBadge.textContent = puzzleData.difficulty;
        difficultyBadge.className = `difficulty-badge difficulty-${puzzleData.difficulty}`;

        // Setup canvas
        this.resizeCanvas();
        this.setupInputHandler();
        this.updateProgress();
        this.render();
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const size = Math.min(container.clientWidth, container.clientHeight, 600);
        
        this.canvas.width = size;
        this.canvas.height = size;
        
        // Calculate scale based on puzzle bounds
        if (this.vertices.length > 0) {
            const maxX = Math.max(...this.vertices.map(v => v.x));
            const maxY = Math.max(...this.vertices.map(v => v.y));
            const maxDim = Math.max(maxX, maxY);
            this.scale = (size * 0.9) / maxDim;
        }
    }

    setupInputHandler() {
        if (this.inputHandler) {
            this.inputHandler.destroy();
        }

        this.inputHandler = new InputHandler(this.canvas, {
            onStart: (x, y) => {
                const vertex = this.findVertexAt(x, y);
                if (vertex && vertex.canConnect()) {
                    return vertex;
                }
                return null;
            },
            onMove: (x, y, startVertex) => {
                this.tempLine = { x, y };
                this.render();
            },
            onEnd: (x, y, startVertex) => {
                this.tempLine = null;
                const endVertex = this.findVertexAt(x, y);
                
                if (endVertex && endVertex.id !== startVertex.id && endVertex.canConnect()) {
                    this.connectVertices(startVertex, endVertex);
                }
                this.render();
            }
        });
    }

    findVertexAt(x, y) {
        for (const vertex of this.vertices) {
            if (vertex.containsPoint(x, y, this.scale)) {
                return vertex;
            }
        }
        return null;
    }

    connectVertices(v1, v2) {
        // Check if already connected
        if (v1.isConnectedTo(v2.id)) {
            return;
        }

        // Save state for undo
        this.history.push({
            v1: v1.id,
            v2: v2.id,
            action: 'connect'
        });

        // Add connections
        v1.addConnection(v2.id);
        v2.addConnection(v1.id);

        // Check for completed triangles
        const vertexMap = {};
        this.vertices.forEach(v => {
            vertexMap[v.id] = v;
        });

        this.triangles.forEach(triangle => {
            if (triangle.isComplete(vertexMap) && !triangle.filled) {
                triangle.fill();
            }
        });

        this.updateProgress();
        this.checkVictory();
        this.render();
    }

    undo() {
        if (this.history.length === 0) return;

        const lastAction = this.history.pop();
        const v1 = this.vertices.find(v => v.id === lastAction.v1);
        const v2 = this.vertices.find(v => v.id === lastAction.v2);

        if (v1 && v2) {
            v1.removeConnection(v2.id);
            v2.removeConnection(v1.id);

            // Unmark triangles
            const vertexMap = {};
            this.vertices.forEach(v => {
                vertexMap[v.id] = v;
            });

            this.triangles.forEach(triangle => {
                if (!triangle.isComplete(vertexMap)) {
                    triangle.filled = false;
                }
            });

            this.updateProgress();
            this.render();
        }
    }

    reset() {
        while (this.history.length > 0) {
            this.undo();
        }
    }

    updateProgress() {
        const completed = this.triangles.filter(t => t.filled).length;
        const total = this.triangles.length;
        
        document.getElementById('triangles-completed').textContent = completed;
        document.getElementById('triangles-total').textContent = total;
    }

    async checkVictory() {
        const allComplete = this.triangles.every(t => t.filled);
        
        if (allComplete) {
            const completionTime = Math.floor((Date.now() - this.startTime) / 1000);
            
            // Save progress to server
            try {
                await Auth.request(`/puzzles/${this.currentPuzzle.id}/progress`, {
                    method: 'POST',
                    body: JSON.stringify({
                        completed: true,
                        completionTime
                    })
                });
            } catch (error) {
                console.error('Failed to save progress:', error);
            }

            this.showVictory(completionTime);
        }
    }

    showVictory(time) {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

        document.getElementById('victory-message').textContent = 
            `You completed "${this.currentPuzzle.name}"!`;
        document.getElementById('victory-time').textContent = `Time: ${timeStr}`;
        document.getElementById('victory-modal').classList.remove('hidden');
    }

    async showStats() {
        try {
            const stats = await Auth.getStats();
            
            document.getElementById('stat-completed').textContent = stats.completed_count || 0;
            document.getElementById('stat-avg-time').textContent = 
                stats.avg_time ? `${Math.floor(stats.avg_time)}s` : '-';
            document.getElementById('stat-best-time').textContent = 
                stats.best_time ? `${Math.floor(stats.best_time)}s` : '-';
            document.getElementById('stat-attempts').textContent = stats.total_attempts || 0;
            
            document.getElementById('stats-modal').classList.remove('hidden');
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    showMenu() {
        document.getElementById('menu-modal').classList.remove('hidden');
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw filled triangles
        this.triangles.forEach(triangle => {
            const vertexMap = {};
            this.vertices.forEach(v => {
                vertexMap[v.id] = v;
            });
            triangle.draw(this.ctx, vertexMap, this.scale);
        });

        // Draw connections
        this.vertices.forEach(v1 => {
            v1.connections.forEach(v2Id => {
                const v2 = this.vertices.find(v => v.id === v2Id);
                if (v2 && v1.id < v2.id) { // Draw each line only once
                    this.ctx.beginPath();
                    this.ctx.moveTo(v1.x * this.scale, v1.y * this.scale);
                    this.ctx.lineTo(v2.x * this.scale, v2.y * this.scale);
                    this.ctx.strokeStyle = '#ffffff';
                    this.ctx.lineWidth = 2;
                    this.ctx.stroke();
                }
            });
        });

        // Draw temporary line while dragging
        if (this.tempLine && this.inputHandler?.startVertex) {
            const v = this.inputHandler.startVertex;
            this.ctx.beginPath();
            this.ctx.moveTo(v.x * this.scale, v.y * this.scale);
            this.ctx.lineTo(this.tempLine.x, this.tempLine.y);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.setLineDash([5, 5]);
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }

        // Draw vertices
        this.vertices.forEach(vertex => {
            vertex.draw(this.ctx, this.scale);
        });
    }

    // UI Helper methods
    showLoadingScreen() {
        document.getElementById('loading-screen').classList.remove('hidden');
    }

    hideLoadingScreen() {
        document.getElementById('loading-screen').classList.add('hidden');
    }

    showAuthScreen() {
        this.hideLoadingScreen();
        document.getElementById('auth-screen').classList.remove('hidden');
    }

    showGameScreen() {
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
