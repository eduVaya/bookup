import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma.js'
import { errorResponse, successResponse } from '../lib/response.js'
import type { JwtPayload, AppVariables } from '../types/index.js'
import authMiddleware from '../middleware/auth.js'


const generateExpiration = () => {
    return Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
}
const authRouter = new Hono<{ Variables: AppVariables }>()

// POST /auth/register
authRouter.post('/register', async (context) => {
    const { email, password, name } = await context.req.json();

    if (!email || !password || !name) {
        return errorResponse(context, 'Email already in use', 409)
    }

    if (password.length < 6) {
        return errorResponse(context, 'Password must be at least 6 characters.', 400);
    }

    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        return errorResponse(context, 'Email already in use', 409)
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name
        }
    });

    const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
        exp: generateExpiration()

    }
    const token = await sign(payload, process.env.JWT_SECRET!);
    return successResponse(context, {
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar
        }
    }, 201);
});

// POST /auth / login
authRouter.post('/login', async (context) => {
    const { email, password } = await context.req.json()

    if (!email || !password) {
        return context.json({ error: 'Email and password are required' }, 400)
    }

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        return context.json({ error: 'Invalid credentials' }, 401)
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
        return context.json({ error: 'Invalid credentials' }, 401)
    }

    const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
        exp: generateExpiration()
    }

    const token = await sign(payload, process.env.JWT_SECRET!)

    return successResponse(context, {
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar
        }
    }, 201);
})

// GET /auth/me
authRouter.get('/me', authMiddleware, async (context) => {
    const userId = context.get('userId')

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            createdAt: true,
        }
    })

    if (!user) {
        return context.json({ error: 'User not found' }, 404)
    }
    return successResponse(context, {
        user
    }, 201);
});

export default authRouter