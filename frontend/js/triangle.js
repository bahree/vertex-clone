// Triangle class - represents a triangle formed by three vertices
class Triangle {
    constructor(v1Id, v2Id, v3Id, color) {
        // Sort vertex IDs for consistent comparison
        this.vertices = [v1Id, v2Id, v3Id].sort((a, b) => a - b);
        this.color = color;
        this.filled = false;
    }

    // Get a unique ID for the triangle
    getId() {
        return this.vertices.join('-');
    }

    // Check if triangle contains a specific edge
    hasEdge(v1Id, v2Id) {
        return (
            (this.vertices.includes(v1Id) && this.vertices.includes(v2Id))
        );
    }

    // Check if triangle contains a vertex
    hasVertex(vId) {
        return this.vertices.includes(vId);
    }

    // Check if all edges of the triangle are connected
    isComplete(vertexMap) {
        const [v1, v2, v3] = this.vertices;
        
        const v1Obj = vertexMap[v1];
        const v2Obj = vertexMap[v2];
        const v3Obj = vertexMap[v3];

        if (!v1Obj || !v2Obj || !v3Obj) return false;

        // Check if all three edges exist
        return (
            v1Obj.isConnectedTo(v2) &&
            v2Obj.isConnectedTo(v3) &&
            v3Obj.isConnectedTo(v1)
        );
    }

    // Draw the triangle on canvas
    draw(ctx, vertexMap, scale = 1) {
        const [v1, v2, v3] = this.vertices;
        const v1Obj = vertexMap[v1];
        const v2Obj = vertexMap[v2];
        const v3Obj = vertexMap[v3];

        if (!v1Obj || !v2Obj || !v3Obj) return;

        const x1 = v1Obj.x * scale;
        const y1 = v1Obj.y * scale;
        const x2 = v2Obj.x * scale;
        const y2 = v2Obj.y * scale;
        const x3 = v3Obj.x * scale;
        const y3 = v3Obj.y * scale;

        // Fill triangle if complete
        if (this.filled) {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y3);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    // Mark triangle as filled
    fill() {
        this.filled = true;
    }
}

// Triangle detection utility
class TriangleDetector {
    // Find all possible triangles from vertex connections
    static findTriangles(vertices) {
        const triangles = new Set();
        const vertexMap = {};
        
        vertices.forEach(v => {
            vertexMap[v.id] = v;
        });

        // Check all combinations of three vertices
        for (let i = 0; i < vertices.length; i++) {
            for (let j = i + 1; j < vertices.length; j++) {
                for (let k = j + 1; k < vertices.length; k++) {
                    const v1 = vertices[i];
                    const v2 = vertices[j];
                    const v3 = vertices[k];

                    // Check if these three vertices form a triangle
                    if (
                        v1.isConnectedTo(v2.id) &&
                        v2.isConnectedTo(v3.id) &&
                        v3.isConnectedTo(v1.id)
                    ) {
                        const triId = [v1.id, v2.id, v3.id].sort((a, b) => a - b).join('-');
                        triangles.add(triId);
                    }
                }
            }
        }

        return Array.from(triangles);
    }

    // Check if adding an edge would complete any triangles
    static findCompletedTriangles(vertices, v1Id, v2Id, allTriangles) {
        const completed = [];
        
        for (const triangle of allTriangles) {
            if (triangle.hasEdge(v1Id, v2Id)) {
                const vertexMap = {};
                vertices.forEach(v => {
                    vertexMap[v.id] = v;
                });
                
                if (triangle.isComplete(vertexMap) && !triangle.filled) {
                    completed.push(triangle);
                }
            }
        }

        return completed;
    }
}
