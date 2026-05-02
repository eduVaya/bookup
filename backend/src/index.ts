import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import 'dotenv/config'
import authRouter from './routes/auth.js'



const app = new Hono();

// Middleware
app.use('*', logger())
app.use('*', cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));

// Global error handler
app.onError((error, context) => {
    console.error(error)
    return context.json({
        success: false,
        errors: ['Internal server error']
    }, 500)
})

// Not found handler
app.notFound((context) => {
    return context.json({
        success: false,
        errors: ['Route not found']
    }, 404)
})

// routes
app.route('/auth', authRouter)

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