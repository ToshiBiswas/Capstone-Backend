/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// migrations/20230323120000_create_puzzles_table.js

exports.up = function(knex) {
    return knex.schema.createTable('puzzles', (table) => {
      table.increments('id').primary(); // Auto-incrementing ID
      table.string('fen').notNullable(); // FEN position
      table.string('moves').notNullable(); // Moves
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('puzzles');
  };