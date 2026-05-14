import { Hono } from 'hono'
import prisma from '../lib/prisma';
import authMiddleware from '../middleware/auth';
import { AppVariables } from '../types';
import { errorResponse, successResponse } from '../lib/response';
import { HTTP } from '../lib/httpCodes';


const booksRouter = new Hono<{ Variables: AppVariables }>

// GET /clubs/:id/books - list all club books
// POST /clubs/:id/books - propose book. Must be a clubMember
// PATCH /clubs/:id/books/:bookId - change status. Only Admin
// DELETE /clubs/:id/books/:bookId - soft delete. Only Admin

// GET /books/search?q= — search in Google Books API
booksRouter.get('/search', async (context) => {
    const search = context.req.query('q');
    if (!search) {
        return errorResponse(context, 'value is empty', HTTP.BAD_REQUEST);
    }
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(search)}&maxResults=10&key=${process.env.GOOGLE_BOOKS_API_KEY}`);
    const data = await response.json();

    const parseData = data.items?.map((book: any) => {
        return {
            googleBooksId: book.id,
            title: book.volumeInfo?.title,
            author: book.volumeInfo?.authors?.join(', '),
            coverUrl: book.volumeInfo?.imageLinks?.thumbnail
        }
    });
    return successResponse(context, parseData);
});

export default booksRouter;