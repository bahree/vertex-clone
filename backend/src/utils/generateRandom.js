#!/usr/bin/env node

/**
 * Delaunay Random Puzzle Generator
 * Generates puzzles using random point placement and Delaunay triangulation
 * 
 * Note: This is a simplified Delaunay implementation.
 * For production, consider using a library like delaunator or d3-delaunay
 */

const fs = require('fs');
const path = require('path');

// Vertex color palette
const COLORS = ['#f7da21', '#b5e352', '#e05c56', '#00a2b3', '#fb9b00'];

// Get random color
function getRandomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

// Generate random points with some structure (grid + jitter)
function generateRandomPoints(count, gridSize = 10) {
    const points = [];
    const cellSize = 90 / gridSize;
    
    // Create structured grid with jitter
    for (let i = 0; i < count; i++) {
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        
        const baseX = 10 + col * cellSize;
        const baseY = 10 + row * cellSize;
        
        // Add random jitter (up to 50% of cell size)
        const jitterX = (Math.random() - 0.5) * cellSize * 0.5;
        const jitterY = (Math.random() - 0.5) * cellSize * 0.5;
        
        points.push({
            x: Math.max(5, Math.min(95, baseX + jitterX)),
            y: Math.max(5, Math.min(95, baseY + jitterY))
        });
    }
    
    return points;
}

// Simple Delaunay triangulation using Bowyer-Watson algorithm
// This is a simplified version for demonstration
function simpleTriangulation(points) {
    const triangles = [];
    
    // For simplicity, create triangles between nearby points
    // In production, use a proper Delaunay library
    for (let i = 0; i < points.length - 2; i++) {
        for (let j = i + 1; j < points.length - 1; j++) {
            for (let k = j + 1; k < points.length; k++) {
                const p1 = points[i];
                const p2 = points[j];
                const p3 = points[k];
                
                // Calculate distances
                const d12 = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
                const d23 = Math.sqrt(Math.pow(p2.x - p3.x, 2) + Math.pow(p2.y - p3.y, 2));
                const d31 = Math.sqrt(Math.pow(p3.x - p1.x, 2) + Math.pow(p3.y - p1.y, 2));
                
                // Only create triangle if points are close enough
                const maxDist = 30;
                if (d12 < maxDist && d23 < maxDist && d31 < maxDist) {
                    // Check if triangle is not too thin
                    const area = Math.abs((p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y)) / 2;
                    if (area > 20) {
                        triangles.push({ v1: i, v2: j, v3: k });
                    }
                }
            }
        }
    }
    
    return triangles;
}

// Calculate connection count for each vertex
function calculateConnections(points, triangles) {
    const connections = new Array(points.length).fill(0);
    const connectedPairs = new Set();
    
    triangles.forEach(tri => {
        const pairs = [
            [tri.v1, tri.v2],
            [tri.v2, tri.v3],
            [tri.v3, tri.v1]
        ];
        
        pairs.forEach(([a, b]) => {
            const key = a < b ? `${a}-${b}` : `${b}-${a}`;
            if (!connectedPairs.has(key)) {
                connectedPairs.add(key);
                connections[a]++;
                connections[b]++;
            }
        });
    });
    
    return connections;
}

// Generate a random Delaunay puzzle
function generateRandomDelaunayPuzzle(vertexCount, name) {
    // Generate random points
    const points = generateRandomPoints(vertexCount, Math.ceil(Math.sqrt(vertexCount)));
    
    // Create triangulation
    let triangles = simpleTriangulation(points);
    
    // Limit number of triangles for playability
    const maxTriangles = Math.min(triangles.length, vertexCount * 2);
    triangles = triangles.slice(0, maxTriangles);
    
    // Calculate connections
    const connections = calculateConnections(points, triangles);
    
    // Create vertices with connection counts
    const vertices = points.map((point, id) => ({
        id,
        x: Math.round(point.x * 10) / 10,
        y: Math.round(point.y * 10) / 10,
        connections: connections[id] || 2
    }));
    
    // Add colors to triangles
    const coloredTriangles = triangles.map(tri => ({
        ...tri,
        color: getRandomColor()
    }));
    
    // Determine difficulty
    let difficulty = 'medium';
    if (vertexCount < 15) difficulty = 'easy';
    else if (vertexCount > 25) difficulty = 'hard';
    
    return {
        name: `${name} #${Math.floor(Math.random() * 1000)}`,
        difficulty,
        theme: 'random',
        json_data: {
            vertices,
            triangles: coloredTriangles
        }
    };
}

// Main generation function
function generateDelaunayPuzzles() {
    const puzzles = [];
    
    console.log('🎲 Generating Random Delaunay Puzzles...');
    
    // Easy puzzles (10-15 vertices)
    console.log('  Easy puzzles...');
    for (let i = 0; i < 5; i++) {
        puzzles.push(generateRandomDelaunayPuzzle(10 + Math.floor(Math.random() * 5), 'Random Easy'));
    }
    
    // Medium puzzles (15-25 vertices)
    console.log('  Medium puzzles...');
    for (let i = 0; i < 5; i++) {
        puzzles.push(generateRandomDelaunayPuzzle(15 + Math.floor(Math.random() * 10), 'Random Medium'));
    }
    
    // Hard puzzles (25-35 vertices)
    console.log('  Hard puzzles...');
    for (let i = 0; i < 5; i++) {
        puzzles.push(generateRandomDelaunayPuzzle(25 + Math.floor(Math.random() * 10), 'Random Hard'));
    }
    
    return puzzles;
}

// Run generator
if (require.main === module) {
    const puzzles = generateDelaunayPuzzles();
    
    const outputPath = path.join(__dirname, '../frontend/puzzles/generated-random.json');
    fs.writeFileSync(outputPath, JSON.stringify(puzzles, null, 2));
    
    console.log(`\n✅ Generated ${puzzles.length} random Delaunay puzzles!`);
    console.log(`📁 Saved to: ${outputPath}`);
    console.log(`\nTo import these puzzles:`);
    console.log(`  docker-compose down`);
    console.log(`  docker-compose up --build`);
}

module.exports = { generateDelaunayPuzzles };
