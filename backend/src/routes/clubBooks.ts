import { Hono } from 'hono'
import prisma from '../lib/prisma';
import authMiddleware from '../middleware/auth';
import { AppVariables } from '../types';
import { errorResponse, successResponse } from '../lib/response';
import { HTTP } from '../lib/httpCodes';
import { getClubMember, isClubAdmin, isClubMember, parseParams, parseValidNumber } from '../lib/utils';
import { BookStatus } from '@prisma/client';
import { BOOK_STATUS } from '../lib/bookStatus';
import { CLUB_MEMBER_ROLES } from '../lib/clubMemberRoles';


const clubBooksRouter = new Hono<{ Variables: AppVariables }>


// GET - Public
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

// POST - Private
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

// PATCH - Private
clubBooksRouter.patch('/:id/books/:bookId', authMiddleware, async (context) => {
    const userId = context.get('userId');

    const { params, errors } = parseParams({
        clubId: context.req.param('id'),
        bookId: context.req.param('bookId')
    })

    if (errors.length > 0) {
        return errorResponse(context, errors, HTTP.BAD_REQUEST)
    }

    const { clubId, bookId } = params
    const { newStatus } = await context.req.json();
    if (!newStatus) {
        return errorResponse(context, 'newStatus is required', HTTP.BAD_REQUEST)
    }
    const isAdmin = await isClubAdmin(userId, clubId);
    if (!isAdmin) {
        return errorResponse(context, 'Unauthorized', HTTP.UNAUTHORIZED);
    }

    if (newStatus != BOOK_STATUS.READING && newStatus != BOOK_STATUS.COMPLETED) {
        return errorResponse(context, `Only ${BOOK_STATUS.READING} and ${BOOK_STATUS.COMPLETED} permitted`, HTTP.BAD_REQUEST);
    }

    const currentBook = await prisma.book.findFirst({
        where: {
            id: bookId,
            clubId,
            deletedAt: null
        }
    });
    if (!currentBook) {
        return errorResponse(context, 'book not found', HTTP.BAD_REQUEST)
    }
    if (currentBook.status === BOOK_STATUS.COMPLETED) {
        return errorResponse(context, 'Book is completed', HTTP.BAD_REQUEST);
    }
    if (currentBook.status === BOOK_STATUS.READING && newStatus === BOOK_STATUS.READING) {
        return errorResponse(context, 'Book is READING status ', HTTP.BAD_REQUEST);
    }

    if (currentBook.status === BOOK_STATUS.PROPOSED && newStatus === BOOK_STATUS.COMPLETED) {
        return errorResponse(context, 'Transition Error. Only can make a transition from PROPOSED to READING. book is in PROPOSED status', HTTP.BAD_REQUEST);
    }

    const data = {
        status: newStatus,
        ...(newStatus === BOOK_STATUS.READING ? { startedAt: new Date() } : { completedAt: new Date() })
    }
    if (newStatus === BOOK_STATUS.READING) {
        const readingBook = await prisma.book.findFirst({
            where: {
                clubId,
                status: BOOK_STATUS.READING,
                deletedAt: null
            }
        })

        if (readingBook) {
            return errorResponse(context, 'There is already a book being read', HTTP.CONFLICT)
        }
    }
    const updatedBook = await prisma.book.update({
        where: {
            id: bookId
        },
        data
    });
    return successResponse(context, updatedBook);
});

// DELETE - Private
clubBooksRouter.delete('/:id/books/:bookId', authMiddleware, async (context) => {
    const userId = context.get('userId');

    const { params, errors } = parseParams({
        clubId: context.req.param('id'),
        bookId: context.req.param('bookId')
    });

    if (errors.length > 0) {
        return errorResponse(context, errors, HTTP.BAD_REQUEST)
    }

    const { clubId, bookId } = params;

    const clubMember = await getClubMember(userId, clubId);
    if (!clubMember) {
        return errorResponse(context, 'User is not a member', HTTP.FORBIDDEN);
    }

    const book = await prisma.book.findFirst({
        where: {
            id: bookId,
            clubId,
            deletedAt: null
        }
    });

    if (!book) {
        return errorResponse(context, 'Book not found', HTTP.BAD_REQUEST);
    }

    const isAdmin = clubMember.role === CLUB_MEMBER_ROLES.ADMIN;

    if (book.proposedBy !== userId && !isAdmin) {
        return errorResponse(context, 'Unauthorized', HTTP.UNAUTHORIZED);
    }
    if (book.status === BOOK_STATUS.READING) {
        return errorResponse(context, `Cannot delete books that are in ${BOOK_STATUS.READING} state`, HTTP.BAD_REQUEST);
    }

    const deletedBook = await prisma.book.update({
        where: {
            id: bookId,
            clubId: clubId
        },
        data: {
            deletedAt: new Date(),
            deletedBy: userId
        }
    });
    return successResponse(context, deletedBook);

});


export default clubBooksRouter;