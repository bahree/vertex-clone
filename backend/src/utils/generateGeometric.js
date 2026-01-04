#!/usr/bin/env node

/**
 * Geometric Puzzle Generator
 * Generates puzzles based on geometric patterns (grids, stars, hexagons, etc.)
 */

const fs = require('fs');
const path = require('path');

// Vertex color palette
const COLORS = ['#f7da21', '#b5e352', '#e05c56', '#00a2b3', '#fb9b00'];

// Get random color
function getRandomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

// Generate triangle grid puzzles
function generateTriangleGrid(size, name) {
    const vertices = [];
    const triangles = [];
    let vertexId = 0;
    
    const spacing = 90 / size;
    
    // Create grid of vertices
    for (let row = 0; row <= size; row++) {
        for (let col = 0; col <= size - row; col++) {
            const x = 5 + col * spacing + (row * spacing / 2);
            const y = 5 + row * spacing;
            
            // Calculate connections
            let connections = 0;
            if (row < size && col < size - row) connections++; // bottom-right
            if (row < size && col > 0) connections++; // bottom-left
            if (row > 0 && col <= size - row) connections++; // top
            if (row > 0 && col < size - row + 1) connections++; // top-left
            if (row < size && col < size - row - 1) connections++; // right
            if (col > 0) connections++; // left
            
            vertices.push({ id: vertexId++, x, y, connections: Math.min(connections, 6) });
        }
    }
    
    // Create triangles
    let vIndex = 0;
    for (let row = 0; row < size; row++) {
        const rowWidth = size - row + 1;
        for (let col = 0; col < size - row; col++) {
            // Upward triangle
            triangles.push({
                v1: vIndex + col,
                v2: vIndex + col + 1,
                v3: vIndex + rowWidth + col,
                color: getRandomColor()
            });
            
            // Downward triangle (if not last in row)
            if (col < size - row - 1) {
                triangles.push({
                    v1: vIndex + col + 1,
                    v2: vIndex + rowWidth + col + 1,
                    v3: vIndex + rowWidth + col,
                    color: getRandomColor()
                });
            }
        }
        vIndex += rowWidth;
    }
    
    return {
        name: `${name} (${size}x${size})`,
        difficulty: size <= 3 ? 'easy' : size <= 5 ? 'medium' : 'hard',
        theme: 'geometric',
        json_data: { vertices, triangles }
    };
}

// Generate square grid puzzles
function generateSquareGrid(size, name) {
    const vertices = [];
    const triangles = [];
    let vertexId = 0;
    
    const spacing = 90 / size;
    
    // Create grid vertices
    for (let row = 0; row <= size; row++) {
        for (let col = 0; col <= size; col++) {
            const x = 5 + col * spacing;
            const y = 5 + row * spacing;
            
            // Calculate connections (each interior vertex connects to 4 neighbors)
            let connections = 0;
            if (row > 0) connections++;
            if (row < size) connections++;
            if (col > 0) connections++;
            if (col < size) connections++;
            
            vertices.push({ id: vertexId++, x, y, connections });
        }
    }
    
    // Create triangles (2 per square)
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const topLeft = row * (size + 1) + col;
            const topRight = topLeft + 1;
            const bottomLeft = (row + 1) * (size + 1) + col;
            const bottomRight = bottomLeft + 1;
            
            triangles.push({
                v1: topLeft,
                v2: topRight,
                v3: bottomLeft,
                color: getRandomColor()
            });
            
            triangles.push({
                v1: topRight,
                v2: bottomRight,
                v3: bottomLeft,
                color: getRandomColor()
            });
        }
    }
    
    return {
        name: `${name} (${size}x${size})`,
        difficulty: size <= 3 ? 'easy' : size <= 5 ? 'medium' : 'hard',
        theme: 'geometric',
        json_data: { vertices, triangles }
    };
}

// Generate hexagon puzzles
function generateHexagon(layers, name) {
    const vertices = [];
    const triangles = [];
    const center = { x: 50, y: 50 };
    const radius = 40 / layers;
    
    let vertexId = 0;
    
    // Center vertex
    vertices.push({ id: vertexId++, x: center.x, y: center.y, connections: 6 });
    
    // Create hexagonal layers
    for (let layer = 1; layer <= layers; layer++) {
        const points = 6 * layer;
        const layerRadius = radius * layer;
        
        for (let i = 0; i < points; i++) {
            const angle = (Math.PI * 2 * i) / points - Math.PI / 2;
            const x = center.x + Math.cos(angle) * layerRadius;
            const y = center.y + Math.sin(angle) * layerRadius;
            
            const connections = layer === layers ? 3 : 6;
            vertices.push({ id: vertexId++, x, y, connections });
        }
    }
    
    // Create triangles connecting center to first layer
    for (let i = 0; i < 6; i++) {
        triangles.push({
            v1: 0,
            v2: 1 + i,
            v3: 1 + ((i + 1) % 6),
            color: getRandomColor()
        });
    }
    
    return {
        name: `${name} (${layers} layers)`,
        difficulty: layers <= 2 ? 'easy' : layers <= 3 ? 'medium' : 'hard',
        theme: 'geometric',
        json_data: { vertices, triangles }
    };
}

// Generate star pattern
function generateStar(points, name) {
    const vertices = [];
    const triangles = [];
    const center = { x: 50, y: 50 };
    const outerRadius = 40;
    const innerRadius = 20;
    
    let vertexId = 0;
    
    // Center vertex
    vertices.push({ id: vertexId++, x: center.x, y: center.y, connections: points * 2 });
    
    // Create star points (alternating outer and inner)
    for (let i = 0; i < points * 2; i++) {
        const angle = (Math.PI * 2 * i) / (points * 2) - Math.PI / 2;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = center.x + Math.cos(angle) * radius;
        const y = center.y + Math.sin(angle) * radius;
        
        vertices.push({ id: vertexId++, x, y, connections: 2 });
    }
    
    // Create triangles from center to each pair of adjacent points
    for (let i = 1; i <= points * 2; i++) {
        triangles.push({
            v1: 0,
            v2: i,
            v3: (i % (points * 2)) + 1,
            color: getRandomColor()
        });
    }
    
    return {
        name: `${name} (${points} points)`,
        difficulty: points <= 5 ? 'easy' : points <= 7 ? 'medium' : 'hard',
        theme: 'geometric',
        json_data: { vertices, triangles }
    };
}

// Main generation function
function generateGeometricPuzzles() {
    const puzzles = [];
    
    console.log('🔺 Generating Triangle Grid Puzzles...');
    for (let size = 3; size <= 6; size++) {
        puzzles.push(generateTriangleGrid(size, `Triangle Grid`));
    }
    
    console.log('🔷 Generating Square Grid Puzzles...');
    for (let size = 2; size <= 5; size++) {
        puzzles.push(generateSquareGrid(size, `Square Grid`));
    }
    
    console.log('⬡ Generating Hexagon Puzzles...');
    for (let layers = 2; layers <= 4; layers++) {
        puzzles.push(generateHexagon(layers, `Hexagon`));
    }
    
    console.log('⭐ Generating Star Puzzles...');
    for (let points = 5; points <= 8; points++) {
        puzzles.push(generateStar(points, `Star`));
    }
    
    return puzzles;
}

// Run generator
if (require.main === module) {
    const puzzles = generateGeometricPuzzles();
    
    const outputPath = path.join(__dirname, '../frontend/puzzles/generated-geometric.json');
    fs.writeFileSync(outputPath, JSON.stringify(puzzles, null, 2));
    
    console.log(`\n✅ Generated ${puzzles.length} geometric puzzles!`);
    console.log(`📁 Saved to: ${outputPath}`);
    console.log(`\nTo import these puzzles:`);
    console.log(`  docker-compose down`);
    console.log(`  docker-compose up --build`);
}

module.exports = { generateGeometricPuzzles };
