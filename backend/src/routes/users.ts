import { Hono } from 'hono'
import prisma from '../lib/prisma.js'
import type { AppVariables, UpdateUserPayload } from '../types/index.js'
import { errorResponse, successResponse } from '../lib/response.js'
import authMiddleware from '../middleware/auth.js'
import { parseValidNumber } from '../lib/utils.js'
import { HTTP } from '../lib/httpCodes.js'

const usersRouter = new Hono<{ Variables: AppVariables }>();


// GET - Public
usersRouter.get('/:id', async (context) => {
    const id = parseValidNumber(context.req.param('id'));
    if (!id) {
        return errorResponse(context, 'Invalid number', HTTP.BAD_REQUEST);
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
        return errorResponse(context, 'User not found', HTTP.NOT_FOUND);
    }
    return successResponse(context, user);
});


// PATCH - Private
usersRouter.patch('/:id', authMiddleware, async (context) => {
    const { name, avatar } = await context.req.json();
    const id = parseValidNumber(context.req.param('id'));
    const userId = context.get('userId');

    if (!id) {
        return errorResponse(context, 'Invalid number', HTTP.BAD_REQUEST);
    }
    if (id !== userId) {
        return errorResponse(context, 'Unauthorized', HTTP.UNAUTHORIZED)
    }
    if (name == null && avatar == null) {
        return errorResponse(context, 'No changes made', HTTP.BAD_REQUEST)
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

// GET - Private
usersRouter.get('/:id/stats', async (context) => {
    const id = parseValidNumber(context.req.param('id'));
    if (!id) {
        HTTP
        return errorResponse(context, 'Invalid id', HTTP.BAD_REQUEST);
    }

    const [clubs, books, reviews] = await Promise.all([
        prisma.clubMember.count({ where: { userId: id, deletedAt: null } }),
        prisma.book.count({ where: { proposedBy: id, deletedAt: null } }),
        prisma.review.count({ where: { userId: id, deletedAt: null } }),
    ]);

    return successResponse(context, { clubs, books, reviews });
});

// DELETE - Private
usersRouter.delete('/:id', authMiddleware, async (context) => {
    const userId = context.get('userId');
    const id = parseValidNumber(context.req.param('id'));

    if (!id) {
        return errorResponse(context, 'Invalid id', HTTP.BAD_REQUEST);
    }

    if (userId !== id) {
        return errorResponse(context, 'Unauthorized', HTTP.UNAUTHORIZED);
    }

    await prisma.user.update({
        where: { id },
        data: {
            deletedAt: new Date(),
            deletedBy: userId
        }
    });

    return successResponse(context, { message: 'Account deleted successfully' });
});
export default usersRouter