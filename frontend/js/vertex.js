// Vertex class - represents a node/dot in the puzzle
class Vertex {
    constructor(id, x, y, maxConnections) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.maxConnections = maxConnections;
        this.connections = [];
        this.radius = 8 + (maxConnections * 2); // Larger dots for more connections
    }

    // Check if vertex can accept more connections
    canConnect() {
        return this.connections.length < this.maxConnections;
    }

    // Add a connection to another vertex
    addConnection(vertexId) {
        if (!this.connections.includes(vertexId) && this.canConnect()) {
            this.connections.push(vertexId);
            return true;
        }
        return false;
    }

    // Remove a connection
    removeConnection(vertexId) {
        const index = this.connections.indexOf(vertexId);
        if (index > -1) {
            this.connections.splice(index, 1);
            return true;
        }
        return false;
    }

    // Check if connected to another vertex
    isConnectedTo(vertexId) {
        return this.connections.includes(vertexId);
    }

    // Check if vertex is complete
    isComplete() {
        return this.connections.length === this.maxConnections;
    }

    // Draw the vertex on canvas
    draw(ctx, scale = 1) {
        const x = this.x * scale;
        const y = this.y * scale;
        const radius = this.radius * scale;

        // Draw circle
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.isComplete() ? '#00a2b3' : '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 2 * scale;
        ctx.stroke();

        // Draw connection number
        ctx.fillStyle = '#1a1a2e';
        ctx.font = `bold ${Math.floor(14 * scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.maxConnections, x, y);
    }

    // Check if point is inside vertex
    containsPoint(x, y, scale = 1) {
        const dx = x - (this.x * scale);
        const dy = y - (this.y * scale);
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= (this.radius * scale);
    }
}
