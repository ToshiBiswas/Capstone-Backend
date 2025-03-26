/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    return knex.schema.createTable('puzzles', (table) => {
      // Primary key, auto-incremented
      table.increments('id').primary();
      
      // Puzzle data columns
      table.string('fen').notNullable();
      table.string('moves').notNullable();
      table.integer('rating').defaultTo(0);
      table.integer('rating_deviation').defaultTo(0);
      table.integer('popularity').defaultTo(0);
      table.integer('nb_plays').defaultTo(0);
      table.string('themes').nullable();
      table.string('opening_tags').nullable();
      
      // Timestamps for created_at and updated_at
      table.timestamps(true, true);
    });
  }
  
  export async function down(knex) {
    return knex.schema.dropTableIfExists('puzzles');
  }
  