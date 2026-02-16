import mysql from 'mysql2/promise';

// Use demo mode by default, or if explicitly set to 'true'
// Set USE_DEMO_MODE=false in environment to use real database
const USE_DEMO_MODE = process.env.USE_DEMO_MODE !== 'false';

// Database connection pool (only if not in demo mode)
const pool = USE_DEMO_MODE ? null : mysql.createPool({
  host: process.env.DB_HOST || 'database.401-me.tech',
  user: process.env.DB_USER || 'api',
  password: process.env.DB_PASSWORD || 'MocneHaslo123!',
  database: process.env.DB_NAME || 'adreport',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the connection only if not in demo mode
if (!USE_DEMO_MODE && pool) {
  pool.getConnection()
    .then(connection => {
      console.log('Database connected successfully');
      connection.release();
    })
    .catch(err => {
      console.error('Database connection failed:', err);
      console.log('Falling back to demo mode');
    });
} else {
  console.log('Running in DEMO MODE - using mock data');
}

export default pool;
export { USE_DEMO_MODE };
