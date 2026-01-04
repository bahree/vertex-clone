const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function seedPuzzles() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Load sample puzzles
        const puzzlesPath = path.join(__dirname, '../../frontend/puzzles/sample-puzzles.json');
        const puzzlesData = JSON.parse(fs.readFileSync(puzzlesPath, 'utf-8'));

        console.log(`📦 Loading ${puzzlesData.length} sample puzzles...`);

        for (const puzzle of puzzlesData) {
            // Check if puzzle already exists
            const existingResult = await client.query(
                'SELECT id FROM puzzles WHERE name = $1',
                [puzzle.name]
            );

            if (existingResult.rows.length > 0) {
                console.log(`⏭️  Skipping: ${puzzle.name} (already exists)`);
                continue;
            }

            await client.query(
                'INSERT INTO puzzles (name, difficulty, theme, json_data) VALUES ($1, $2, $3, $4)',
                [puzzle.name, puzzle.difficulty, puzzle.theme, puzzle.json_data]
            );

            console.log(`✅ Added: ${puzzle.name}`);
        }

        console.log('🎉 Puzzle seeding completed!');
    } catch (error) {
        console.error('❌ Seeding error:', error);
        throw error;
    } finally {
        await client.end();
    }
}

// Run if called directly
if (require.main === module) {
    seedPuzzles()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { seedPuzzles };
