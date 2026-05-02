import { Hono } from 'hono'
import prisma from '../lib/prisma.js'
import type { AppVariables } from '../types/index.js'
import { errorResponse, successResponse } from '../lib/response.js'
const usersRouter = new Hono<{ Variables: AppVariables }>();

// GET /users/:id
usersRouter.get('/:id', async (context) => {
    const id = Number(context.req.param('id'));
    if (Number.isNaN(id)) {
        return errorResponse(context, 'Invalid number', 400);
    }
    const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        select: {
            id: true,
            email: true,
            name: true,
            avatar: true
        }
    });
    if (!user) {
        return errorResponse(context, 'User not found', 404);
    }
    return successResponse(context, user);
});


export default usersRouter