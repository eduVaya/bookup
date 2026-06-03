import { Hono } from 'hono'
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth.js'
import { AppVariables, UpdateReviewPayload } from '../types';
import { errorResponse, successResponse } from '../lib/response';
import { HTTP } from '../lib/httpCodes';
import { getBook, getClubMember, getReview, isClubMember, parseParams } from '../lib/utils';
import { BOOK_STATUS } from '../lib/bookStatus';


const reviewsRouter = new Hono<{ Variables: AppVariables }>;

// GET - Public
reviewsRouter.get('/:id/books/:bookId/reviews', async (context) => {

    const { params, errors } = parseParams({
        clubId: context.req.param('id'),
        bookId: context.req.param('bookId')
    });

    if (errors.length > 0) {
        return errorResponse(context, errors, HTTP.BAD_REQUEST)
    }
    const { clubId, bookId } = params;

    const book = await getBook(bookId, clubId)
    if (!book) {
        return errorResponse(context, 'Book not found', HTTP.NOT_FOUND)
    }
    const reviews = await prisma.review.findMany({
        where: {
            bookId,
            deletedAt: null
        },
        select: {
            id: true,
            bookId: true,
            rating: true,
            content: true,
            createdAt: true,
            user: {
                select: {
                    name: true,
                    avatar: true
                }
            }
        }
    });
    return successResponse(context, reviews);
});

reviewsRouter.post('/:id/books/:bookId/reviews', authMiddleware, async (context) => {
    const userId = context.get('userId');

    const { params, errors } = parseParams({
        clubId: context.req.param('id'),
        bookId: context.req.param('bookId')
    });

    if (errors.length > 0) {
        return errorResponse(context, errors, HTTP.BAD_REQUEST)
    }
    const { clubId, bookId } = params;

    const { rating, content } = await context.req.json();



    const member = await getClubMember(userId, clubId);
    if (!member) {
        return errorResponse(context, 'User is not a member', HTTP.FORBIDDEN)
    }

    if (!rating) {
        return errorResponse(context, 'rating is required', HTTP.BAD_REQUEST)
    }
    if (rating < 1 || rating > 5) {
        return errorResponse(context, 'Rating must be between 1 and 5', HTTP.BAD_REQUEST)
    }

    const book = await getBook(bookId, clubId);
    if (!book) {
        return errorResponse(context, 'Book not found', HTTP.NOT_FOUND);
    }
    if (book.status !== BOOK_STATUS.COMPLETED) {
        return errorResponse(context, `Book is not in status ${BOOK_STATUS.COMPLETED}`, HTTP.BAD_REQUEST);
    }

    try {
        const review = await prisma.review.create({
            data: {
                bookId,
                userId,
                rating,
                ...(content && { content })
            }
        });
        return successResponse(context, review);
    } catch (error) {
        return errorResponse(context, 'You have already reviewed this book', HTTP.CONFLICT);
    }

});

// PATCH - Private
reviewsRouter.patch('/:id/books/:bookId/reviews', authMiddleware, async (context) => {
    const userId = context.get('userId');

    const { params, errors } = parseParams({
        clubId: context.req.param('id'),
        bookId: context.req.param('bookId')
    });

    if (errors.length > 0) {
        return errorResponse(context, errors, HTTP.BAD_REQUEST)
    }
    const { clubId, bookId } = params;

    const { rating, content } = await context.req.json();

    const member = await getClubMember(userId, clubId);
    if (!member) {
        return errorResponse(context, 'User is not a member', HTTP.FORBIDDEN)
    }


    if (rating < 1 || rating > 5) {
        return errorResponse(context, 'Rating must be between 1 and 5', HTTP.BAD_REQUEST)
    }

    const book = await getBook(bookId, clubId);
    if (!book) {
        return errorResponse(context, 'Book not found', HTTP.NOT_FOUND);
    }
    if (book.status !== BOOK_STATUS.COMPLETED) {
        return errorResponse(context, `Book is not in status ${BOOK_STATUS.COMPLETED}`, HTTP.BAD_REQUEST);
    }

    const data: UpdateReviewPayload = {}
    if (rating !== undefined) data.rating = rating
    if (content !== undefined) data.content = content

    if (Object.keys(data).length === 0) {
        return errorResponse(context, 'No changes made', HTTP.BAD_REQUEST)
    }

    const updatedReview = await prisma.review.update({
        where: {
            bookId_userId: {
                bookId,
                userId
            }
        },
        data
    });

    return successResponse(context, updatedReview);
});

// DELETE - Private
reviewsRouter.delete('/:id/books/:bookId/reviews/:reviewId', authMiddleware, async (context) => {
    const userId = context.get('userId');

    const { params, errors } = parseParams({
        clubId: context.req.param('id'),
        bookId: context.req.param('bookId'),
        reviewId: context.req.param('reviewId')
    });
    const { clubId, bookId, reviewId } = params;

    if (errors.length > 0) {
        return errorResponse(context, errors, HTTP.BAD_REQUEST)
    }

    const isMember = await isClubMember(userId, clubId);
    if (!isMember) {
        return errorResponse(context, 'User is not a member', HTTP.FORBIDDEN);
    }

    const review = await getReview(bookId, userId);
    if (!review) {
        return errorResponse(context, 'review not found', HTTP.NOT_FOUND);
    }


    const deletedReview = await prisma.review.update({
        where: {
            id: reviewId,
            bookId,
            userId
        },
        data: {
            deletedAt: new Date(),
            deletedBy: userId
        }
    });

    return successResponse(context, deletedReview);
});

export default reviewsRouter;