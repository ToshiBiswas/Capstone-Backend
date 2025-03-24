import fs from 'fs';

const csv = await import('csv-parser');

export async function seed(knex) {
  try {
    // Check if the 'puzzles' table exists before deleting entries.
    const tableExists = await knex.schema.hasTable('puzzles');
    if (tableExists) {
      await knex('puzzles').del();
      console.log('Puzzles table cleared.');
    } else {
      console.warn('Puzzles table does not exist. Skipping deletion.');
    }

    const BATCH_SIZE = 1000;
    let batch = [];
    let idCounter = 1; // Auto-generate our own ID (if not using auto-increment)

    await new Promise((resolve, reject) => {
      const stream = fs
        .createReadStream('./lichess_db_puzzle.csv')
        .pipe(csv.default());

      stream.on('data', (data) => {
        // If the "Moves" field is null or empty, skip this row.
        if (!data.Moves || !data.Moves.trim()) {
          return;
        }

        batch.push({
          id: idCounter++, // Auto-generated ID; remove if your table uses auto-increment.
          fen: data.FEN ? data.FEN.trim() : '',
          moves: data.Moves.trim(),
          rating: parseInt(data.Rating, 10) || 0,
          rating_deviation: parseInt(data.RatingDeviation, 10) || 0,
          popularity: parseInt(data.Popularity, 10) || 0,
          nb_plays: parseInt(data.NbPlays, 10) || 0,
          themes: data.Themes ? data.Themes.trim() : null,
          opening_tags: data.OpeningTags ? data.OpeningTags.trim() : null,
          // Ignoring PuzzleId and GameUrl fields.
        });

        if (batch.length >= BATCH_SIZE) {
          stream.pause(); // Pause stream to avoid memory overflow.
          knex
            .batchInsert('puzzles', batch, BATCH_SIZE)
            .then(() => {
              batch = [];
              stream.resume(); // Resume stream after insertion.
            })
            .catch((err) => reject(err));
        }
      });

      stream.on('end', async () => {
        if (batch.length > 0) {
          await knex.batchInsert('puzzles', batch, BATCH_SIZE);
        }
        console.log('Seeding complete.');
        resolve();
      });

      stream.on('error', (error) => reject(error));
    });

  } catch (error) {
    console.error('Seeding error:', error);
    throw error;
  }
}
