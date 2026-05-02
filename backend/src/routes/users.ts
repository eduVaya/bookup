import { Hono } from 'hono'
import prisma from '../lib/prisma.js'
import type { AppVariables, UpdateUserPayload } from '../types/index.js'
import { errorResponse, successResponse } from '../lib/response.js'
import authMiddleware from '../middleware/auth.js'

const usersRouter = new Hono<{ Variables: AppVariables }>();

const parseValidNumber = (number: any) => {
    const parsedNumber = Number(number);
    return Number.isNaN(parsedNumber) ? null : parsedNumber;
}

// GET /:id
usersRouter.get('/:id', async (context) => {
    const id = parseValidNumber(context.req.param('id'));
    if (!id) {
        return errorResponse(context, 'Invalid number', 400);
    }
    const user = await prisma.user.findUnique({
        where: { id: id },
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


// PATCH /:id
usersRouter.patch('/:id', authMiddleware, async (context) => {
    const { name, avatar } = await context.req.json();
    const id = parseValidNumber(context.req.param('id'));
    const userId = context.get('userId');

    if (!id) {
        return errorResponse(context, 'Invalid number', 400);
    }
    if (id !== userId) {
        return errorResponse(context, 'Unauthorized', 403)
    }
    if (name == null && avatar == null) {
        return errorResponse(context, 'No changes made', 400)
    }

    const data: UpdateUserPayload = {};

    if (name !== undefined) data.name = name;
    if (avatar !== undefined) data.avatar = avatar;

    const update = await prisma.user.update({
        where: { id: userId },
        data,
        select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
        }
    });

    return successResponse(context, update);
});


export default usersRouter