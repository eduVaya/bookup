import { Hono } from 'hono'
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth.js'
import { AppVariables } from '../types';
import { errorResponse, successResponse } from '../lib/response';
import { HTTP } from '../lib/httpCodes';
import { getSession, isClubMember, parseParams } from '../lib/utils';
import { ATTENDANCE_STATUS } from '../lib/attendanceStatus';


const attendanceRouter = new Hono<{ Variables: AppVariables }>;

// POST - Private
attendanceRouter.post('/:id/sessions/:sessionId/attendance', authMiddleware, async (context) => {
    const userId = context.get('userId');
    const { status } = await context.req.json();
    const { params, errors } = parseParams({
        clubId: context.req.param('id'),
        sessionId: context.req.param('sessionId')
    });
    const { clubId, sessionId } = params;
    if (errors.length > 0) {
        return errorResponse(context, errors, HTTP.BAD_REQUEST)
    }
    if (!status) {
        return errorResponse(context, 'status is required', HTTP.BAD_REQUEST);
    }
    const isMember = await isClubMember(userId, clubId);
    if (!isMember) {
        return errorResponse(context, 'User not a member', HTTP.FORBIDDEN);
    }

    if (!(status in ATTENDANCE_STATUS)) {
        return errorResponse(context, 'Invalid attendance status', HTTP.BAD_REQUEST);
    }

    const session = await getSession(sessionId, clubId);
    if (!session) {
        return errorResponse(context, 'Session not found', HTTP.NOT_FOUND);
    }

    if (new Date().getTime() > session.scheduledAt.getTime()) {
        return errorResponse(context, 'Session expired', HTTP.CONFLICT);
    }

    try {
        const attendance = await prisma.attendance.create({
            data: {
                sessionId: sessionId,
                userId,
                status
            }
        });
        return successResponse(context, attendance, HTTP.CREATED);

    } catch (error) {
        return errorResponse(context, 'You have already submit your attendance', HTTP.CONFLICT);
    }

});

// PATCH - Private
attendanceRouter.patch('/:id/sessions/:sessionId/attendance', authMiddleware, async (context) => {
    const userId = context.get('userId');
    const { status } = await context.req.json();
    const { params, errors } = parseParams({
        clubId: context.req.param('id'),
        sessionId: context.req.param('sessionId')
    });
    const { clubId, sessionId } = params;
    if (errors.length > 0) {
        return errorResponse(context, errors, HTTP.BAD_REQUEST)
    }
    if (!status) {
        return errorResponse(context, 'status is required', HTTP.BAD_REQUEST);
    }
    const isMember = await isClubMember(userId, clubId);
    if (!isMember) {
        return errorResponse(context, 'User not a member', HTTP.FORBIDDEN);
    }

    if (!(status in ATTENDANCE_STATUS)) {
        return errorResponse(context, 'Invalid attendance status', HTTP.BAD_REQUEST);
    }

    const session = await getSession(sessionId, clubId);
    if (!session) {
        return errorResponse(context, 'Session not found', HTTP.NOT_FOUND);
    }

    if (new Date().getTime() > session.scheduledAt.getTime()) {
        return errorResponse(context, 'Session expired', HTTP.CONFLICT);
    }


    const attendance = await prisma.attendance.update({
        where: {
            sessionId_userId: {
                sessionId,
                userId
            }
        },
        data: {
            status
        }
    });
    return successResponse(context, attendance);

});

// GET - Public
attendanceRouter.get('/:id/sessions/:sessionId/attendance', async (context) => {
    const { params, errors } = parseParams({
        clubId: context.req.param('id'),
        sessionId: context.req.param('sessionId')
    });
    const { clubId, sessionId } = params;
    if (errors.length > 0) {
        return errorResponse(context, errors, HTTP.BAD_REQUEST)
    }
    const session = await getSession(sessionId, clubId);
    if (!session) {
        return errorResponse(context, 'Session not found', HTTP.NOT_FOUND);
    }
    const attendances = await prisma.attendance.findMany({
        where: {
            sessionId,
            deletedAt: null
        },
        select: {
            id: true,
            sessionId: true,
            status: true,
            user: {
                select: {
                    name: true,
                    avatar: true
                }
            }
        }
    });

    return successResponse(context, attendances);
});

export default attendanceRouter;