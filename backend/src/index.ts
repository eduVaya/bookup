import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import 'dotenv/config'
import authRouter from './routes/auth.js'
import usersRouter from './routes/users.js'
import { errorResponse } from './lib/response.js'
import clubsRouter from './routes/clubs.js'
import booksRouter from './routes/books.js'
import clubBooksRouter from './routes/clubBooks.js'



const app = new Hono();

// Middleware
app.use('*', logger())
app.use('*', cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));

// Global error handler
app.onError((error, context) => {
    // TODO: show error in development. in prod just server error and log somewhere. Maybe made a ui.
    if (process.env.NODE_ENV === 'development') {
        console.trace();
        return errorResponse(context, error.message, 500)
    }
    return errorResponse(context, 'Internal server error', 500)
})

// Not found handler
app.notFound((context) => {
    return context.json({
        success: false,
        errors: ['Route not found']
    }, 404)
})

// routes
app.route('/auth', authRouter);
app.route('/users', usersRouter);
app.route('/clubs', clubsRouter);
app.route('/clubs', clubBooksRouter);
app.route('/books', booksRouter);


app.get('/', (context) => {
    return context.json({ message: 'BookUp API runnig' });
});

const PORT = Number(process.env.PORT) || 3000;


serve({
    fetch: app.fetch,
    port: PORT
},
    (information) => {
        console.log(`Bookup API running on http://localhost:${information.port}`);
    }
);

export default app;