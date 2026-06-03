import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import prisma from '../lib/prisma';
import { errorResponse, successResponse } from '../lib/response';
import { isClubAdmin, isClubMember, parseValidNumber } from '../lib/utils';
import { authMiddleware } from '../middleware/auth.js'
import { AppVariables, UpdateClubPayload } from '../types';
import { HTTP } from '../lib/httpCodes.js';

const clubsRouter = new Hono<{ Variables: AppVariables }>();

// POST - Private
clubsRouter.post('/', authMiddleware, async (context) => {
    const userId = context.get('userId');
    const { name, description, isPublic } = await context.req.json();
    const errors = [];

    if (!name) errors.push('name is required');
    if (!description) errors.push('description is required');

    if (errors.length > 0) {
        return errorResponse(context, errors, HTTP.BAD_REQUEST);
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

// PATCH - Private
clubsRouter.patch('/:id', authMiddleware, async (context) => {
    const userId = context.get('userId');
    const id = parseValidNumber(context.req.param('id'));
    if (!id) {
        return errorResponse(context, 'Invalid number', HTTP.BAD_REQUEST);
    }
    const isAdmin = await isClubAdmin(userId, id);

    if (!isAdmin) {
        return errorResponse(context, 'Unauthorized', HTTP.FORBIDDEN);
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

// DELETE - Private
clubsRouter.delete('/:id', authMiddleware, async (context) => {
    const userId = context.get('userId');
    const id = parseValidNumber(context.req.param('id'));
    if (!id) {
        return errorResponse(context, 'Invalid number', HTTP.BAD_REQUEST);
    }
    const isAdmin = await isClubAdmin(userId, id);

    if (!isAdmin) {
        return errorResponse(context, 'Unauthorized', HTTP.UNAUTHORIZED);
    }

    const deletedClub = await prisma.club.update({
        where: { id },
        data: {
            deletedAt: new Date(),
            deletedBy: userId
        }
    });
    return successResponse(context, deletedClub);
});

// POST - Private
clubsRouter.post('/join', authMiddleware, async (context) => {
    const userId = context.get('userId');
    const { inviteCode } = await context.req.json();

    const club = await prisma.club.findUnique({
        where: {
            inviteCode,
            deletedAt: null
        },
        select: {
            id: true
        }
    });
    if (!club) {
        return errorResponse(context, 'Club not found or incorrect invite code', HTTP.NOT_FOUND);
    }
    const existingMember = await prisma.clubMember.findUnique({
        where: {
            userId_clubId: { userId, clubId: club.id }
        }
    })

    if (existingMember) {
        return errorResponse(context, 'You are already a member of this club', HTTP.CONFLICT)
    }
    const clubMember = await prisma.clubMember.create({
        data: {
            userId: userId,
            clubId: club.id,
            role: 'MEMBER'
        },
        select: {
            userId: true,
            role: true
        }
    });
    return successResponse(context, { id: club.id });
});

// DELETE - Private
clubsRouter.delete('/:id/member/:userId', authMiddleware, async (context) => {
    const userId = context.get('userId');

    const clubId = parseValidNumber(context.req.param('id'));
    if (!clubId) {
        return errorResponse(context, 'Invalid clubId number', HTTP.BAD_REQUEST);
    }
    const memberUserId = parseValidNumber(context.req.param('userId'));
    if (!memberUserId) {
        return errorResponse(context, 'Invalid member number', HTTP.BAD_REQUEST);
    }

    const isAdmin = await isClubAdmin(userId, clubId);
    if (!isAdmin) {
        return errorResponse(context, 'Unauthorized', HTTP.UNAUTHORIZED);
    }
    if (memberUserId === userId) {
        return errorResponse(context, 'You cannot remove yourself from the club', HTTP.BAD_REQUEST)
    }
    const isMember = await isClubMember(memberUserId, clubId);
    if (!isMember) {
        return errorResponse(context, 'User is not a member', HTTP.CONFLICT);
    }

    const deletedMember = await prisma.clubMember.update({
        where: {
            userId_clubId: { userId: memberUserId, clubId }
        },
        data: { deletedAt: new Date(), deletedBy: userId }
    })

    return successResponse(context, deletedMember);

});

// GET - Public
clubsRouter.get('/', async (context) => {
    const search = context.req.query('search');

    const clubs = await prisma.club.findMany({
        where: {
            isPublic: true,
            deletedAt: null,
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ]
            })
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

// GET - Private
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
            },
            _count: {
                select: {
                    clubMembers: {
                        where: { deletedAt: null }
                    }
                }
            }
        }
    })

    return successResponse(context, myClubs);
});

// GET - Public
clubsRouter.get('/:id', async (context) => {
    const id = parseValidNumber(context.req.param('id'));
    if (!id) {
        return errorResponse(context, 'Invalid number', HTTP.BAD_REQUEST);
    }
    const club = await prisma.club.findUnique({
        where: {
            id,
            deletedAt: null
        },
        select: {
            id: true,
            name: true,
            description: true,
            isPublic: true,
            inviteCode: true,
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

// GET - Public
clubsRouter.get('/:id/members', async (context) => {
    const id = parseValidNumber(context.req.param('id'));
    if (!id) {
        return errorResponse(context, 'Invalid number', HTTP.BAD_REQUEST);
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