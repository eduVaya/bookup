import { Hono } from 'hono'
import prisma from '../lib/prisma';
import authMiddleware from '../middleware/auth';
import { AppVariables } from '../types';
import { errorResponse, successResponse } from '../lib/response';
import { HTTP } from '../lib/httpCodes';
import { isClubAdmin, parseParams } from '../lib/utlis';
import { BOOK_STATUS } from '../lib/bookStatus';

const voteRouter = new Hono<{ Variables: AppVariables }>;

// POST — vote for a book
voteRouter.post('/clubs/:id/books/:bookId/votes', authMiddleware, async (context) => {
    const userId = context.get('userId');

    const { params, errors } = parseParams({
        clubId: context.req.param('id'),
        bookId: context.req.param('bookId')
    });

    if (errors.length > 0) {
        return errorResponse(context, errors, HTTP.BAD_REQUEST)
    }
    const { clubId, bookId } = params;

    const isAdmin = await isClubAdmin(userId, clubId);
    if (!isAdmin) {
        return errorResponse(context, 'Unauthorized', HTTP.UNAUTHORIZED);
    }
    const book = await prisma.book.findFirst({
        where: {
            id: bookId,
            clubId,
            deletedAt: null
        }
    });

    if (!book) {
        return errorResponse(context, 'Book not found', HTTP.BAD_REQUEST)
    }
    if (book.status !== BOOK_STATUS.PROPOSED) {
        return errorResponse(context, `Only vote for book that are in ${BOOK_STATUS.PROPOSED} status`, HTTP.BAD_REQUEST);
    }

});


// DELETE /clubs/:id/books/:bookId/votes — remove vote
// GET /clubs/:id/books/:bookId/votes — get all votes


export default voteRouter;