/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// migrations/20230323120000_create_puzzles_table.js

exports.up = function(knex) {
  return knex.schema.createTable('puzzles', (table) => {
    table.increments('id').primary();
    table.integer('puzzle_id').notNullable().unique();
    table.string('fen').notNullable();
    table.text('moves');
    table.float('rating');
    table.float('rating_deviation');
    table.float('popularity');
    table.integer('nb_plays');
    table.text('themes');
    table.string('game_url');
    table.text('opening_tags');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('puzzles');
};

