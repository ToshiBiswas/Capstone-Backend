// controllers/puzzlesController.js

import knex from '../db/knex.js'; // Ensure this path and file extension is correct

const getRandomPuzzle = async (req, res, next) => {
  try {
    // Use RAND() for MySQL random ordering
    const puzzle = await knex('puzzles')
      .orderByRaw('RAND()')
      .first();

    if (!puzzle) {
      return res.status(404).json({ error: 'No puzzle found' });
    }
    res.json(puzzle);
  } catch (error) {
    next(error);
  }
};

export default getRandomPuzzle;
