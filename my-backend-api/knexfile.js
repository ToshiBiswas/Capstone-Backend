// knexfile.js
export default {
  development: {
    client: 'mysql2',  // Make sure this is set to your intended client (e.g., 'mysql2')
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    migrations: {
      directory: './migrations'
    }
  }
  // Add other environments if needed.
};