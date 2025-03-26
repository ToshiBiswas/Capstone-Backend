import React, { useState } from 'react';
// Import the stockfish engine. Ensure your bundler or setup supports this import.
import stockfish from 'stockfish';

const getEngine = () => {
  // If the imported 'stockfish' is callable directly, use it.
  if (typeof stockfish === 'function') {
    return stockfish();
  } 
  // Otherwise, check if the module provides a STOCKFISH() function.
  else if (stockfish && typeof stockfish.STOCKFISH === 'function') {
    return stockfish.STOCKFISH();
  }
  // If neither is available, throw an error.
  throw new Error("Stockfish engine not available");
};

const evaluatePosition = (fen) => {
  return new Promise((resolve, reject) => {
    const engine = getEngine();
    let evaluation = null;

    // Initialize UCI protocol and set the position
    engine.postMessage('uci');
    engine.postMessage(`position fen ${fen}`);
    engine.postMessage('go depth 15');

    engine.onmessage = (event) => {
      if (typeof event.data === 'string') {
        const line = event.data;
        // Check for evaluation score in centipawns
        if (line.includes('score cp')) {
          const parts = line.split(' ');
          const cpIndex = parts.indexOf('cp');
          if (cpIndex !== -1 && parts[cpIndex + 1]) {
            evaluation = parseInt(parts[cpIndex + 1], 10);
          }
        }
        // When best move is sent, we assume the calculation is done.
        if (line.startsWith('bestmove')) {
          engine.terminate();
          resolve(evaluation);
        }
      }
    };

    engine.onerror = (err) => {
      engine.terminate();       
      reject(err);
    };
  });
};

export default evaluatePosition;
