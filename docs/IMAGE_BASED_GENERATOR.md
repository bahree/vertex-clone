# Image-Based Puzzle Generator Guide

## Overview

This guide explains how to create Vertex puzzles from images, just like the original NYTimes Vertex game where completed puzzles reveal recognizable pictures (emoji, icons, objects, etc.).

## Prerequisites

```bash
npm install sharp  # Image processing library
# or
npm install jimp   # Alternative image processing library
```

## Approach

### 1. Image Preparation

**Select Good Source Images:**
- Simple, recognizable shapes (heart, star, coffee cup, umbrella)
- High contrast and bold colors
- Minimal detail (works better with triangulation)
- SVG or PNG with transparent background preferred

**Image Size:**
- Start with 200x200px to 500x500px
- Will be downsampled for vertex placement

### 2. Image Processing Pipeline

```
Source Image → Simplify → Edge Detection → Vertex Placement → 
Delaunay Triangulation → Color Sampling → Puzzle JSON
```

## Implementation Example

```javascript
const sharp = require('sharp');
const fs = require('fs');

async function imageToVertices(imagePath) {
  // 1. Load and resize image
  const image = sharp(imagePath)
    .resize(100, 100)
    .greyscale();
  
  const { data, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  // 2. Edge detection (simple threshold)
  const vertices = [];
  const threshold = 128;
  let vertexId = 0;
  
  for (let y = 0; y < info.height; y += 10) {
    for (let x = 0; x < info.width; x += 10) {
      const idx = (y * info.width + x);
      const pixel = data[idx];
      
      // Check if this is an edge (high contrast with neighbors)
      const isEdge = checkEdge(data, x, y, info.width, info.height, threshold);
      
      if (isEdge) {
        vertices.push({
          id: vertexId++,
          x: x,
          y: y,
          connections: 0  // Will calculate later
        });
      }
    }
  }
  
  return vertices;
}

function checkEdge(data, x, y, width, height, threshold) {
  const idx = y * width + x;
  const current = data[idx];
  
  // Check neighbors for contrast
  const neighbors = [
    [x-1, y], [x+1, y], [x, y-1], [x, y+1]
  ];
  
  for (const [nx, ny] of neighbors) {
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      const nIdx = ny * width + nx;
      if (Math.abs(current - data[nIdx]) > threshold) {
        return true;
      }
    }
  }
  
  return false;
}
```

### 3. Color Sampling

```javascript
async function sampleColors(imagePath, triangles, vertices) {
  const image = await sharp(imagePath).raw().toBuffer({ resolveWithObject: true });
  const { data, info } = image;
  
  return triangles.map(tri => {
    // Get center point of triangle
    const v1 = vertices[tri.v1];
    const v2 = vertices[tri.v2];
    const v3 = vertices[tri.v3];
    
    const centerX = Math.floor((v1.x + v2.x + v3.x) / 3);
    const centerY = Math.floor((v1.y + v2.y + v3.y) / 3);
    
    // Sample color at center
    const idx = (centerY * info.width + centerX) * 3;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    
    // Convert to closest Vertex palette color
    const color = closestPaletteColor(r, g, b);
    
    return { ...tri, color };
  });
}

function closestPaletteColor(r, g, b) {
  const palette = [
    { hex: '#f7da21', r: 247, g: 218, b: 33 },
    { hex: '#b5e352', r: 181, g: 227, b: 82 },
    { hex: '#e05c56', r: 224, g: 92, b: 86 },
    { hex: '#00a2b3', r: 0, g: 162, b: 179 },
    { hex: '#fb9b00', r: 251, g: 155, b: 0 }
  ];
  
  let minDist = Infinity;
  let closest = palette[0].hex;
  
  palette.forEach(color => {
    const dist = Math.sqrt(
      Math.pow(r - color.r, 2) +
      Math.pow(g - color.g, 2) +
      Math.pow(b - color.b, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      closest = color.hex;
    }
  });
  
  return closest;
}
```

## Quick Start Methods

### Method 1: Use Online Tools

1. **Convert image to low-poly art:**
   - Visit https://www.imgonline.com.ua/eng/low-poly-art.php
   - Upload your image
   - Set triangle count (50-200)
   - Download result
   - Manually create puzzle JSON from the result

### Method 2: Use Processing/p5.js

```javascript
// p5.js sketch to manually place vertices
let img;
let vertices = [];

function preload() {
  img = loadImage('your-image.png');
}

function setup() {
  createCanvas(400, 400);
  image(img, 0, 0, 400, 400);
}

function mouseClicked() {
  // Click to place vertices
  vertices.push({ x: mouseX, y: mouseY });
  ellipse(mouseX, mouseY, 10, 10);
}

function keyPressed() {
  if (key === 's') {
    // Save vertices as JSON
    saveJSON(vertices, 'vertices.json');
  }
}
```

### Method 3: Batch Processing

```bash
# Create a folder with your source images
mkdir source-images
# Place your PNGs/SVGs there

# Run batch processor (you would create this)
node generateFromImages.js source-images/
```

## Best Image Sources

**Free Icon Libraries:**
- Font Awesome (https://fontawesome.com) - thousands of icons
- Material Icons (https://fonts.google.com/icons)
- Noun Project (https://thenounproject.com) - free SVGs

**Emoji:**
- Twemoji (Twitter emoji as SVG)
- Noto Emoji (Google emoji)

**Public Domain:**
- OpenClipart (https://openclipart.org)
- Wikimedia Commons

## Tips for Success

1. **Start Simple**: Begin with basic shapes (heart, star, circle)
2. **High Contrast**: Black and white or bold colors work best
3. **Clean Edges**: Smooth, defined edges triangulate better
4. **Test Gradually**: Start with 20-30 vertices, increase as needed
5. **Manual Refinement**: Generated puzzles often need manual touch-ups

## Example Workflow

```bash
# 1. Generate geometric puzzles (quick win)
node backend/src/utils/generateGeometric.js

# 2. Generate random puzzles
node backend/src/utils/generateRandom.js

# 3. For image-based:
#    a) Manually create 5-10 puzzles from simple shapes
#    b) OR use the processing approach above
#    c) OR implement the full image pipeline

# 4. Import all puzzles
docker-compose down
docker-compose up --build
```

## Advanced: Full Implementation

For a complete image-to-puzzle generator, you would need:

1. **Edge Detection** - Canny or Sobel algorithm
2. **Vertex Placement** - Along detected edges + strategic interior points
3. **Delaunay Triangulation** - Use a library like `delaunator`
4. **Connection Counting** - Calculate from triangulation
5. **Color Sampling** - From original image regions
6. **Validation** - Ensure puzzle is solvable

**Recommended Libraries:**
```bash
npm install sharp delaunator
```

**Full Example:**
```javascript
const Delaunator = require('delaunator');

function fullImageToPuzzle(imagePath) {
  // 1. Load image and detect edges
  const vertices = await detectEdgesAndPlaceVertices(imagePath);
  
  // 2. Run Delaunay triangulation
  const points = vertices.map(v => [v.x, v.y]).flat();
  const delaunay = Delaunator.from(vertices.map(v => [v.x, v.y]));
  
  // 3. Extract triangles
  const triangles = [];
  for (let i = 0; i < delaunay.triangles.length; i += 3) {
    triangles.push({
      v1: delaunay.triangles[i],
      v2: delaunay.triangles[i + 1],
      v3: delaunay.triangles[i + 2]
    });
  }
  
  // 4. Calculate connections
  const connections = calculateConnections(triangles, vertices.length);
  vertices.forEach((v, i) => v.connections = connections[i]);
  
  // 5. Sample colors
  const coloredTriangles = await sampleColors(imagePath, triangles, vertices);
  
  return {
    name: path.basename(imagePath, path.extname(imagePath)),
    difficulty: 'medium',
    theme: 'image-based',
    json_data: { vertices, triangles: coloredTriangles }
  };
}
```

This approach would give you the most authentic Vertex experience, but requires more development time. Start with geometric and random generators for quick content!
