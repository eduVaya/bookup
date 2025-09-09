import mariadb from 'mariadb';

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'localpassword',
    database: 'test_db',
    connectionLimit: 5
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