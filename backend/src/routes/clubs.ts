import { Hono } from 'hono'
import { nanoid } from 'nanoid';
import { AppVariables, UpdateClubPayload } from '../types'
import authMiddleware from '../middleware/auth';
import { errorResponse, successResponse } from '../lib/response';
import prisma from '../lib/prisma';
import { isClubAdmin, isString, parseValidNumber } from '../lib/utlis';

const clubsRouter = new Hono<{ Variables: AppVariables }>();

// POST /clubs PRIVATE
clubsRouter.post('/', authMiddleware, async (context) => {
    const userId = context.get('userId');
    const { name, description, isPublic } = await context.req.json();
    const errors = [];

    if (!name) errors.push('name is required');
    if (!description) errors.push('description is required');

    if (errors.length > 0) {
        return errorResponse(context, errors, 400);
    }

    const club = await prisma.club.create({
        data: {
            name,
            description,
            isPublic: isPublic ?? true,
            inviteCode: nanoid(),
            createdBy: userId,
            clubMembers: {
                create: {
                    userId,
                    role: 'ADMIN'
                }
            }
        },
        include: {
            clubMembers: true
        }
    });

    return successResponse(context, {
        club
    });

});

// PATCH /clubs/:id PRIVATE
clubsRouter.patch('/:id', authMiddleware, async (context) => {
    const userId = context.get('userId');
    const id = parseValidNumber(context.req.param('id'));
    if (!id) {
        return errorResponse(context, 'Invalid number', 400);
    }
    const isAdmin = await isClubAdmin(userId, id);

    if (!isAdmin) {
        return errorResponse(context, 'Unauthorized', 403);
    }
    const { name, description, isPublic } = await context.req.json();
    const data: UpdateClubPayload = {};

    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (isPublic !== undefined) data.isPublic = isPublic;

    const updatedClub = await prisma.club.update({
        where: { id },
        data,
        select: {
            name: true,
            description: true,
            isPublic: true,
            createdAt: true,
        }
    });

    return successResponse(context, updatedClub);
});

// DELETE /clubs/:id
clubsRouter.delete('/:id', authMiddleware, async (context) => {
    const userId = context.get('userId');
    const id = parseValidNumber(context.req.param('id'));
    if (!id) {
        return errorResponse(context, 'Invalid number', 400);
    }
    const isAdmin = await isClubAdmin(userId, id);

    if (!isAdmin) {
        return errorResponse(context, 'Unauthorized', 403);
    }

    const deletedClub = await prisma.club.delete({
        where: { id },
        select: {
            id: true
        }
    });
    return successResponse(context, deletedClub);
});

// POST /clubs/join

// DELETE /clubs/:id/members/:userId

// GET /clubs PUBLIC
clubsRouter.get('/', async (context) => {

    const clubs = await prisma.club.findMany({
        where: {
            isPublic: true,
            deletedAt: null
        },
        select: {
            id: true,
            name: true,
            description: true,
            isPublic: true,
            createdAt: true,
            creator: {
                select: {
                    name: true,
                    avatar: true
                }
            },
            _count: {
                select: {
                    clubMembers: true
                }
            }
        }
    });

    return successResponse(context, clubs);
});

// GET /clubs/mine PRIVATE
clubsRouter.get('/mine', authMiddleware, async (context) => {
    const userId = context.get('userId');

    const myClubs = await prisma.club.findMany({
        where: {
            clubMembers: {
                some: {
                    userId,
                    deletedAt: null
                }

            }
        },
        select: {
            id: true,
            name: true,
            description: true,
            isPublic: true,
            createdAt: true,
            clubMembers: {
                where: { userId, deletedAt: null },
                select: { role: true }
            }
        }
    })

    return successResponse(context, myClubs);
});

// GET /clubs/:id
clubsRouter.get('/:id', async (context) => {
    const id = parseValidNumber(context.req.param('id'));
    if (!id) {
        return errorResponse(context, 'Invalid number', 400);
    }
    const club = await prisma.club.findUnique({
        where: {
            id,
            deletedAt: null
        },
        select: {
            name: true,
            description: true,
            isPublic: true,
            createdAt: true,
            creator: {
                select: {
                    name: true,
                    avatar: true
                }
            },
            clubMembers: {
                select: {
                    role: true,
                    joinedAt: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true
                        }
                    }
                }
            }
        }
    });

    return successResponse(context, club);
});

// GET /clubs/:id/members
clubsRouter.get('/:id/members', async (context) => {
    const id = parseValidNumber(context.req.param('id'));
    if (!id) {
        return errorResponse(context, 'Invalid number', 400);
    }

    const members = await prisma.clubMember.findMany({
        where: {
            clubId: id,
            deletedAt: null
        },
        select: {
            role: true,
            joinedAt: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    avatar: true
                }
            }
        }
    });

    return successResponse(context, members);

});

export default clubsRouter;