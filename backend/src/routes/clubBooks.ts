import { Hono } from 'hono'
import prisma from '../lib/prisma';
import authMiddleware from '../middleware/auth';
import { AppVariables } from '../types';
import { errorResponse, successResponse } from '../lib/response';
import { HTTP } from '../lib/httpCodes';
import { isClubMember, parseValidNumber } from '../lib/utlis';
import { BookStatus } from '@prisma/client';


const clubBooksRouter = new Hono<{ Variables: AppVariables }>


// GET /clubs/:id/books
clubBooksRouter.get('/:id/books', async (context) => {
    const clubId = parseValidNumber(context.req.param('id'));
    if (!clubId) {
        return errorResponse(context, 'Invalid number', 400);
    }
    const status = context.req.query('status') as BookStatus | undefined;


    const books = await prisma.book.findMany({
        where: {
            clubId,
            deletedAt: null,
            ...(status && { status })
        },
        select: {
            clubId: true,
            googleBooksId: true,
            title: true,
            author: true,
            coverUrl: true,
            status: true,
            proposer: {
                select: {
                    name: true,
                    avatar: true
                }
            },
            _count: {
                select: {
                    bookVotes: true
                }
            }
        }
    });

    return successResponse(context, books);
});

// POST /clubs/:id/books - propose book
clubBooksRouter.post('/:id/books', authMiddleware, async (context) => {
    const userId = context.get('userId');
    const clubId = parseValidNumber(context.req.param('id'));
    if (!clubId) {
        return errorResponse(context, 'Invalid number', 400);
    }
    const { googleBooksId, title, author, coverUrl } = await context.req.json();
    if (!googleBooksId || !title || !author) {
        return errorResponse(context, 'googleBooksId, title and author are required', HTTP.BAD_REQUEST)
    }
    const isMember = await isClubMember(userId, clubId);
    if (!isMember) {
        return errorResponse(context, 'User is not a member', HTTP.CONFLICT);
    }

    const book = await prisma.book.create({
        data: {
            clubId,
            proposedBy: userId,
            googleBooksId,
            title,
            author,
            coverUrl
        }
    });

    return successResponse(context, book);

});
// PATCH /clubs/:id/books/:bookId
// DELETE /clubs/:id/books/:bookId


export default clubBooksRouter;