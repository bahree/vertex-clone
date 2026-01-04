#!/usr/bin/env node

/**
 * Master Puzzle Generator
 * Runs all puzzle generators and combines output
 */

const fs = require('fs');
const path = require('path');
const { generateGeometricPuzzles } = require('./generateGeometric');
const { generateDelaunayPuzzles } = require('./generateRandom');

console.log('🎮 Vertex Clone - Master Puzzle Generator\n');
console.log('=' .repeat(50));

// Generate all puzzles
console.log('\n📐 Step 1: Generating Geometric Puzzles...');
const geometricPuzzles = generateGeometricPuzzles();
console.log(`   ✅ Created ${geometricPuzzles.length} geometric puzzles`);

console.log('\n🎲 Step 2: Generating Random Delaunay Puzzles...');
const randomPuzzles = generateDelaunayPuzzles();
console.log(`   ✅ Created ${randomPuzzles.length} random puzzles`);

// Combine all puzzles
const allPuzzles = [...geometricPuzzles, ...randomPuzzles];

console.log('\n📊 Summary:');
console.log(`   Total Puzzles: ${allPuzzles.length}`);
console.log(`   - Geometric: ${geometricPuzzles.length}`);
console.log(`   - Random: ${randomPuzzles.length}`);

// Count by difficulty
const byDifficulty = {
    easy: allPuzzles.filter(p => p.difficulty === 'easy').length,
    medium: allPuzzles.filter(p => p.difficulty === 'medium').length,
    hard: allPuzzles.filter(p => p.difficulty === 'hard').length
};

console.log(`\n   By Difficulty:`);
console.log(`   - Easy: ${byDifficulty.easy}`);
console.log(`   - Medium: ${byDifficulty.medium}`);
console.log(`   - Hard: ${byDifficulty.hard}`);

// Save combined output
const outputPath = path.join(__dirname, '../frontend/puzzles/generated-all.json');
fs.writeFileSync(outputPath, JSON.stringify(allPuzzles, null, 2));

console.log(`\n💾 Saved all puzzles to: ${outputPath}`);

// Also save separately
const geomPath = path.join(__dirname, '../frontend/puzzles/generated-geometric.json');
const randPath = path.join(__dirname, '../frontend/puzzles/generated-random.json');

fs.writeFileSync(geomPath, JSON.stringify(geometricPuzzles, null, 2));
fs.writeFileSync(randPath, JSON.stringify(randomPuzzles, null, 2));

console.log(`💾 Saved geometric puzzles to: ${geomPath}`);
console.log(`💾 Saved random puzzles to: ${randPath}`);

console.log('\n' + '='.repeat(50));
console.log('✨ Puzzle generation complete!\n');
console.log('📋 Next Steps:');
console.log('   1. Review generated puzzles in frontend/puzzles/');
console.log('   2. Import to database with:');
console.log('      docker-compose down');
console.log('      docker-compose up --build');
console.log('   3. Or manually import with seed script\n');
console.log('💡 Tip: For image-based puzzles, see docs/IMAGE_BASED_GENERATOR.md');
