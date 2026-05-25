import { Hono } from 'hono'
import prisma from '../lib/prisma';
import authMiddleware from '../middleware/auth';
import { AppVariables } from '../types';
import { errorResponse, successResponse } from '../lib/response';
import { HTTP } from '../lib/httpCodes';
import { getClubMember, isClubAdmin, isClubMember, parseParams } from '../lib/utils';
import { BOOK_STATUS } from '../lib/bookStatus';

const voteRouter = new Hono<{ Variables: AppVariables }>;

// POST — vote for a book
voteRouter.post('/:id/books/:bookId/votes', authMiddleware, async (context) => {
    const userId = context.get('userId');

    const { params, errors } = parseParams({
        clubId: context.req.param('id'),
        bookId: context.req.param('bookId')
    });

    if (errors.length > 0) {
        return errorResponse(context, errors, HTTP.BAD_REQUEST)
    }
    const { clubId, bookId } = params;

    const isMember = await isClubMember(userId, clubId);
    if (!isMember) {
        return errorResponse(context, 'User is not a member', HTTP.FORBIDDEN)
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

    try {
        const bookVote = await prisma.bookVote.create({
            data: { bookId, userId }
        });
        return successResponse(context, bookVote)
    } catch (error) {
        return errorResponse(context, 'You have already voted for this book', HTTP.CONFLICT);
    }

});

// DELETE /clubs/:id/books/:bookId/votes — remove vote
voteRouter.delete('/:id/books/:bookId/votes', authMiddleware, async (context) => {
    const userId = context.get('userId');

    const { params, errors } = parseParams({
        clubId: context.req.param('id'),
        bookId: context.req.param('bookId')
    });

    if (errors.length > 0) {
        return errorResponse(context, errors, HTTP.BAD_REQUEST)
    }
    const { clubId, bookId } = params;

    const member = await getClubMember(userId, clubId);
    if (!member) {
        return errorResponse(context, 'User is not a member', HTTP.FORBIDDEN)
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
    const vote = await prisma.bookVote.findFirst({
        where: {
            userId,
            bookId,
            deletedAt: null
        },
        select: {
            userId: true,
            id: true
        }
    });

    if (!vote) {
        return errorResponse(context, 'Vote not found', HTTP.BAD_REQUEST)
    }

    const deletedVote = await prisma.bookVote.update({
        where: {
            id: vote.id
        },
        data: {
            deletedAt: new Date(),
            deletedBy: userId
        }
    });
    return successResponse(context, deletedVote);

});

// GET /clubs/:id/books/:bookId/votes — get all votes
voteRouter.get('/:id/books/:bookId/votes', async (context) => {
    const { params, errors } = parseParams({
        clubId: context.req.param('id'),
        bookId: context.req.param('bookId')
    });

    if (errors.length > 0) {
        return errorResponse(context, errors, HTTP.BAD_REQUEST);
    }
    const { clubId, bookId } = params;
    const book = await prisma.book.findFirst({
        where: {
            id: bookId,
            clubId,
            deletedAt: null
        },
        select: {
            id: true
        }
    });
    if (!book) {
        return errorResponse(context, 'Book not found', HTTP.BAD_REQUEST)
    }
    const bookVotes = await prisma.bookVote.findMany({
        where: {
            bookId: book.id,
            deletedAt: null
        },
        select: {
            id: true,
            bookId: true,
            userId: true,
            createdAt: true,
            user: {
                select: {
                    name: true,
                    avatar: true
                }
            }
        }
    });
    return successResponse(context, bookVotes);
});

export default voteRouter;