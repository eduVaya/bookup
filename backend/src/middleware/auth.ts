import { createMiddleware } from 'hono/factory'
import { verify } from 'hono/jwt'

import type { JwtPayload, AppVariables } from '../types/index.js'

const authMiddleware = createMiddleware<{ Variables: AppVariables }>(async (context, next) => {
    const authHeader = context.req.header('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return context.json({ error: 'Unauthorized' }, 401)
    }

    const token = authHeader.split(' ')[1]

    const payload = await verify(token, process.env.JWT_SECRET!, 'HS256') as JwtPayload

    context.set('userId', payload.userId)
    context.set('userEmail', payload.email)

    await next()
});

const optionalAuthMiddleware = createMiddleware<{ Variables: AppVariables }>(async (context, next) => {
    const authHeader = context.req.header('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const payload = await verify(token, process.env.JWT_SECRET!, 'HS256') as JwtPayload;
            context.set('userId', payload.userId);
            context.set('userEmail', payload.email);
        } catch {
            // Token inválido — continuamos sin usuario
        }
    }

    await next();
});

export { authMiddleware, optionalAuthMiddleware }
