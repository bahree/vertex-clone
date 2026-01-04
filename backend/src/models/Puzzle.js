const db = require('./db');

class Puzzle {
  static async create(name, difficulty, theme, jsonData) {
    const result = await db.query(
      'INSERT INTO puzzles (name, difficulty, theme, json_data) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, difficulty, theme, jsonData]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query(
      'SELECT * FROM puzzles WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async getAll(filters = {}) {
    let query = 'SELECT * FROM puzzles WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.difficulty) {
      query += ` AND difficulty = $${paramIndex}`;
      params.push(filters.difficulty);
      paramIndex++;
    }

    if (filters.theme) {
      query += ` AND theme = $${paramIndex}`;
      params.push(filters.theme);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    return result.rows;
  }

  static async getRandomPuzzle(userId, excludeIds = []) {
    let query = `
      SELECT p.* FROM puzzles p
      LEFT JOIN user_progress up ON p.id = up.puzzle_id AND up.user_id = $1
      WHERE (up.completed IS NULL OR up.completed = FALSE)
    `;
    const params = [userId];

    if (excludeIds.length > 0) {
      query += ' AND p.id NOT IN (' + excludeIds.map((_, i) => `$${i + 2}`).join(',') + ')';
      params.push(...excludeIds);
    }

    query += ' ORDER BY RANDOM() LIMIT 1';

    const result = await db.query(query, params);
    return result.rows[0];
  }

  static async getUserProgress(userId, puzzleId) {
    const result = await db.query(
      'SELECT * FROM user_progress WHERE user_id = $1 AND puzzle_id = $2',
      [userId, puzzleId]
    );
    return result.rows[0];
  }

  static async saveProgress(userId, puzzleId, completed, completionTime = null, attempts = 1) {
    const result = await db.query(
      `INSERT INTO user_progress (user_id, puzzle_id, completed, completion_time, attempts)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, puzzle_id)
       DO UPDATE SET completed = $3, completion_time = $4, attempts = user_progress.attempts + 1
       RETURNING *`,
      [userId, puzzleId, completed, completionTime, attempts]
    );
    return result.rows[0];
  }

  static async getUserStats(userId) {
    const result = await db.query(
      `SELECT 
        COUNT(*) FILTER (WHERE completed = TRUE) as completed_count,
        COUNT(*) as total_attempts,
        AVG(completion_time) FILTER (WHERE completed = TRUE) as avg_time,
        MIN(completion_time) FILTER (WHERE completed = TRUE) as best_time
       FROM user_progress WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0];
  }
}

module.exports = Puzzle;
