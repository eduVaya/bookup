import { Hono } from 'hono'
import prisma from '../lib/prisma';
import authMiddleware from '../middleware/auth';
import { AppVariables, UpdateSessionPayload } from '../types';
import { errorResponse, successResponse } from '../lib/response';
import { HTTP } from '../lib/httpCodes';
import { getBook, getSession, isClubAdmin, parseParams } from '../lib/utils';
import { BOOK_STATUS } from '../lib/bookStatus';


const sessionRouter = new Hono<{ Variables: AppVariables }>;

// GET /clubs/:id/sessions
sessionRouter.get('/:id/sessions', async (context) => {

    const { params, errors } = parseParams({
        clubId: context.req.param('id'),
    });
    if (errors.length > 0) {
        return errorResponse(context, errors, HTTP.BAD_REQUEST);
    }
    const { clubId } = params;
    const sessions = await prisma.session.findMany({
        where: {
            clubId,
            deletedAt: null
        },
        select: {
            title: true,
            scheduledAt: true,
            book: {
                select: {
                    title: true,
                    coverUrl: true
                }
            },
            _count: {
                select: {
                    attendances: true
                }
            }
        }
    });
    return successResponse(context, sessions);

});

// POST /clubs/:id/sessions
sessionRouter.post('/:id/sessions', authMiddleware, async (context) => {
    const userId = context.get('userId');
    const { params, errors } = parseParams({
        clubId: context.req.param('id'),
    });
    if (errors.length > 0) {
        return errorResponse(context, errors, HTTP.BAD_REQUEST);
    }


    const { clubId } = params;
    const { bookId, title, scheduledAt, location } = await context.req.json();
    const propertiesError = [];

    if (!bookId) propertiesError.push('bookId is required');
    if (!title) propertiesError.push('title is required');
    if (!scheduledAt) propertiesError.push('scheduledAt is required');

    if (propertiesError.length > 0) {
        return errorResponse(context, propertiesError, HTTP.BAD_REQUEST);
    }

    const isAdmin = await isClubAdmin(userId, clubId);
    if (!isAdmin) {
        return errorResponse(context, 'Unauthorized', HTTP.UNAUTHORIZED);
    }
    const book = await prisma.book.findFirst({
        where: {
            id: bookId,
            clubId,
            deletedAt: null
        },
        select: {
            status: true
        }
    });
    if (!book) {
        return errorResponse(context, 'Book not found', HTTP.NOT_FOUND);
    }
    if (book.status === BOOK_STATUS.PROPOSED) {
        return errorResponse(context, `Only can create session for book in status ${BOOK_STATUS.COMPLETED} or ${BOOK_STATUS.READING}`, HTTP.CONFLICT);
    }

    const session = await prisma.session.create({
        data: {
            clubId,
            bookId,
            title,
            scheduledAt,
            ...(location && { location }),
            createdAt: new Date(),
        }
    });

    return successResponse(context, session, HTTP.CREATED);
});

// PATCH  /clubs/:id/sessions/:sessionId
sessionRouter.patch('/:id/sessions/:sessionId', authMiddleware, async (context) => {
    const userId = context.get('userId');
    const { params, errors } = parseParams({
        clubId: context.req.param('id'),
        sessionId: context.req.param('sessionId'),
    });
    if (errors.length > 0) {
        return errorResponse(context, errors, HTTP.BAD_REQUEST);
    }

    const { clubId, sessionId } = params;
    const { title, scheduledAt, location } = await context.req.json();

    const isAdmin = await isClubAdmin(userId, clubId);
    if (!isAdmin) {
        return errorResponse(context, 'Unauthorized', HTTP.UNAUTHORIZED);
    }

    if (!title && !scheduledAt && !location) {
        return errorResponse(context, 'No changes made', HTTP.BAD_REQUEST)
    }

    const session = await getSession(sessionId, clubId);
    if (!session) {
        return errorResponse(context, 'session not found', HTTP.NOT_FOUND);
    }
    const data: UpdateSessionPayload = {}

    if (title !== undefined) data.title = title;
    if (scheduledAt !== undefined) data.scheduledAt = scheduledAt;
    if (location !== undefined) data.location = location;

    const updatedSession = await prisma.session.update({
        where: {
            id: sessionId,
            clubId
        },
        data
    });

    return successResponse(context, updatedSession);
});

// DELETE /clubs/:id/sessions/:sessionId
sessionRouter.delete('/:id/sessions/:sessionId', authMiddleware, async (context) => {
    const userId = context.get('userId');
    const { params, errors } = parseParams({
        clubId: context.req.param('id'),
        sessionId: context.req.param('sessionId'),
    });
    if (errors.length > 0) {
        return errorResponse(context, errors, HTTP.BAD_REQUEST);
    }

    const { clubId, sessionId } = params;

    const isAdmin = await isClubAdmin(userId, clubId);
    if (!isAdmin) {
        return errorResponse(context, 'Unauthorized', HTTP.UNAUTHORIZED);
    }
    const session = await getSession(sessionId, clubId);
    if (!session) {
        return errorResponse(context, 'session not found', HTTP.NOT_FOUND);
    }
    const deletedSession = await prisma.session.update({
        where: {
            id: sessionId,
            clubId
        },
        data: {
            deletedAt: new Date(),
            deletedBy: userId
        }
    });

    return successResponse(context, deletedSession);
});



export default sessionRouter;