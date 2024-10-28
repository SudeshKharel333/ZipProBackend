const mysql = require('mysql2');

// Create a connection pool to reuse connections
const db = mysql.createPool({
    host: 'localhost',      // Database host
    user: 'root',           // Your MySQL username
    password: '',           // Your MySQL password (leave empty if not set)
    database: 'zippro',     // Your database name
    connectionLimit: 10     // Max number of connections in the pool
});

// Test the connection to the database
db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
    connection.release(); // Release the connection back to the pool
});

// Error handling for MySQL connection errors
db.on('error', (err) => {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Attempting to reconnect...');
        // The connection pool will handle the reconnection
    } else {
        throw err; // Throw other errors for debugging
    }
});

// Export the database pool for use in other files
module.exports = db;
