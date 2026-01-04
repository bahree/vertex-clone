const bcrypt = require('bcryptjs');
const db = require('./db');

class User {
  static async create(email, password, username = null) {
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Check if this is the first user
    const countResult = await db.query('SELECT COUNT(*) FROM users');
    const isFirstUser = parseInt(countResult.rows[0].count) === 0;
    const isAdmin = isFirstUser && process.env.FIRST_USER_IS_ADMIN === 'true';
    
    const result = await db.query(
      'INSERT INTO users (email, password_hash, username, is_admin) VALUES ($1, $2, $3, $4) RETURNING id, email, username, is_admin, created_at',
      [email, passwordHash, username, isAdmin]
    );
    
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query(
      'SELECT id, email, username, is_admin, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateUsername(userId, username) {
    const result = await db.query(
      'UPDATE users SET username = $1 WHERE id = $2 RETURNING id, email, username',
      [username, userId]
    );
    return result.rows[0];
  }

  static async getAll() {
    const result = await db.query(
      'SELECT id, email, username, is_admin, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  }
}

module.exports = User;
