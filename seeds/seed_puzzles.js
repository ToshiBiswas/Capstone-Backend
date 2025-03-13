// seeds/seed_puzzles.js
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const fs = require('fs');
const csv = require('csv-parser');

exports.seed = async function(knex) {
  // Delete any existing entries in the puzzles table
  await knex('puzzles').del();

  return new Promise((resolve, reject) => {
    const BATCH_SIZE = 1000;
    let batch = [];

    // Update the file path to where your CSV is located
    const stream = fs.createReadStream('../sourceFiles/')
      .pipe(csv());

    stream.on('data', (data) => {
      // Map CSV columns to database columns.
      batch.push({
        puzzle_id: parseInt(data.PuzzleId, 10),
        fen: data.FEN,
        moves: data.Moves,
        rating: parseFloat(data.Rating),
        rating_deviation: parseFloat(data.RatingDeviation),
        popularity: parseFloat(data.Popularity),
        nb_plays: parseInt(data.NbPlays, 10),
        themes: data.Themes,
        game_url: data.GameUrl,
        opening_tags: data.OpeningTags,
      });

      if (batch.length >= BATCH_SIZE) {
        stream.pause();
        knex.batchInsert('puzzles', batch, BATCH_SIZE)
          .then(() => {
            batch = [];
            stream.resume();
          })
          .catch((err) => reject(err));
      }
    });

    stream.on('end', () => {
      if (batch.length > 0) {
        knex.batchInsert('puzzles', batch, BATCH_SIZE)
          .then(resolve)
          .catch(reject);
      } else {
        resolve();
      }
    });

    stream.on('error', (error) => reject(error));
  });
};
