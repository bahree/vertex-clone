const express = require('express');
const Puzzle = require('../models/Puzzle');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all puzzles (with optional filters)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { difficulty, theme } = req.query;
    const puzzles = await Puzzle.getAll({ difficulty, theme });
    
    res.json({
      puzzles: puzzles.map(p => ({
        id: p.id,
        name: p.name,
        difficulty: p.difficulty,
        theme: p.theme
      }))
    });
  } catch (error) {
    console.error('Get puzzles error:', error);
    res.status(500).json({ error: 'Failed to fetch puzzles' });
  }
});

// Get a specific puzzle
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const puzzle = await Puzzle.findById(req.params.id);
    
    if (!puzzle) {
      return res.status(404).json({ error: 'Puzzle not found' });
    }

    res.json({ puzzle });
  } catch (error) {
    console.error('Get puzzle error:', error);
    res.status(500).json({ error: 'Failed to fetch puzzle' });
  }
});

// Get a random puzzle for the user
router.get('/random/next', authenticateToken, async (req, res) => {
  try {
    const puzzle = await Puzzle.getRandomPuzzle(req.user.id);
    
    if (!puzzle) {
      return res.status(404).json({ error: 'No more puzzles available' });
    }

    res.json({ puzzle });
  } catch (error) {
    console.error('Get random puzzle error:', error);
    res.status(500).json({ error: 'Failed to fetch puzzle' });
  }
});

// Save puzzle progress
router.post('/:id/progress', authenticateToken, async (req, res) => {
  try {
    const { completed, completionTime } = req.body;
    const puzzleId = req.params.id;

    const progress = await Puzzle.saveProgress(
      req.user.id,
      puzzleId,
      completed,
      completionTime
    );

    res.json({
      message: 'Progress saved',
      progress
    });
  } catch (error) {
    console.error('Save progress error:', error);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

// Get user statistics
router.get('/stats/me', authenticateToken, async (req, res) => {
  try {
    const stats = await Puzzle.getUserStats(req.user.id);
    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
