import express from "express";
import * as inventoriesController from "../controllers/puzzleController.js";

// routes/puzzles.js

const express = require('express');
const router = express.Router();
const puzzlesController = require('../controllers/puzzlesController');

router.get('/random', puzzlesController.getRandomPuzzle);

module.exports = router;
