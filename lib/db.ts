import mysql from 'mysql2/promise';

const USE_DEMO_MODE = process.env.USE_DEMO_MODE === 'true' || process.env.NODE_ENV === 'development';

// Database connection pool (only if not in demo mode)
const pool = USE_DEMO_MODE ? null : mysql.createPool({
  host: 'database.401-me.tech',
  user: 'api',
  password: 'MocneHaslo123!',
  database: 'adreport',
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
