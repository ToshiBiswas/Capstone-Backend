// controllers/puzzlesController.js

const knex = require('../db/knex'); // Adjust the path based on your project structure

exports.getRandomPuzzle = async (req, res, next) => {
  try {
    // For PostgreSQL use RANDOM(); for MySQL use RAND()
    const puzzle = await knex('puzzles')
      .orderByRaw('RANDOM()')
      .first();

    if (!puzzle) {
      return res.status(404).json({ error: 'No puzzle found' });
    }
    res.json(puzzle);
  } catch (error) {
    next(error);
  }
};
