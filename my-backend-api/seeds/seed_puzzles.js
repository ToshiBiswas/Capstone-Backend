const fs = require('fs');
const csv = require('csv-parser');

exports.seed = async function(knex) {
  // Delete any existing entries in the puzzles table
  await knex('puzzles').del();

  return new Promise((resolve, reject) => {
    const BATCH_SIZE = 1000;
    let batch = [];
    let idCounter = 1; // Start counter at 1

    const stream = fs.createReadStream('./lichess_db_puzzle.csv')
      .pipe(csv());

    stream.on('data', (data) => {
      // Only keep the FEN and Moves, and auto-generate an ID
      batch.push({
        id: idCounter++, // Increment counter for each entry
        fen: data.FEN,
        moves: data.Moves
      });

      if (batch.length >= BATCH_SIZE) {
        stream.pause(); // Pause the stream while inserting
        knex.batchInsert('puzzles', batch, BATCH_SIZE)
          .then(() => {
            batch = [];
            stream.resume(); // Resume after insert
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
