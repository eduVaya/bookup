import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import 'dotenv/config'


const app = new Hono();

// Middleware
app.use('*', logger())
app.use('*', cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));

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