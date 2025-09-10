
import express from 'express';
import dotenv from 'dotenv';
import { query } from './config/database.js';

import authenticationRoutes from './routes/authenticationRoutes.js'

// Start App
dotenv.config(); // Start global env constats
const app = express();
app.use(express.json());

// app.get('/users', async (req, res) => {
//     try {
//         const rows = await query('SELECT * FROM users');
//         res.json(rows);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Database error' });
//     }
// });
app.use('/auth', authenticationRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});