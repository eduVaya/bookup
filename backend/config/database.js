import mariadb from 'mariadb';

const pool = mariadb.createPool({
    host: process.env.HOST,
    user: 'root',
    password: 'localpassword',
    database: 'bookup_development',
    connectionLimit: 10,
    // waitForConnections: true,
    // queueLimit: 0,
});

export async function query(sql, params) {
    let connection = await pool.getConnection();
    try {
        const rows = await connection.query(sql, params);
        return rows

    } catch (error) {
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// export async function getTransactionConnection() {
//     const connection = await pool.getConnection();
//     await connection.beginTransaction();
//     return connection;
//   }