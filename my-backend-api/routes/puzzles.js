import express from 'express';
import getRandomPuzzle from '../controllers/puzzleController.js'; // Import the default export

const router = express.Router();

router.get('/', getRandomPuzzle);

export default router;
