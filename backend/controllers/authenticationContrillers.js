import bcrypt from 'bcrypt';
import { query } from '../config/database.js';


const signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const existing = await query('SELECT u.email FROM users u WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const result = await query(
            'INSERT INTO users (username, email, passwordHash) VALUES (?, ?, ?)',
            [username, email, passwordHash]
        );
        return res.status(201).json({ message: 'User created', userId: Number(result.insertId) });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}

export { signup }