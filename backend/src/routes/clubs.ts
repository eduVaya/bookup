import { Hono } from 'hono'
import { nanoid } from 'nanoid';
import { AppVariables } from '../types'
import authMiddleware from '../middleware/auth';
import { errorResponse, successResponse } from '../lib/response';
import prisma from '../lib/prisma';

const clubsRouter = new Hono<{ Variables: AppVariables }>();

// POST /clubs
clubsRouter.post('/', authMiddleware, async (context) => {
    const userId = context.get('userId');
    const { name, description, isPublic } = await context.req.json();
    const errors = [];

    if (!name) errors.push('name');
    if (!description) errors.push('description');
    if (!name || !description) {
        return errorResponse(context, errors.map(error => `${error} is required`), 400);
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