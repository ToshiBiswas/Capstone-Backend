import express from "express";
import * as puzzleController from "../controllers/puzzleController.js";

// routes/puzzles.js

const router = express.Router();

// REMEMBER TO CHANGE THE "PLACEHOLDER" TO THE NAME OF YOUR FUNCTION
router
  .route("/")
  .get(puzzleController.inventories) // GET all inventory items

export default router;