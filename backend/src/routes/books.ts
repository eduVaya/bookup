import { Hono } from 'hono'
import prisma from '../lib/prisma';
import authMiddleware from '../middleware/auth';
import { AppVariables } from '../types';


const booksRouter = new Hono<{ Variables: AppVariables }>

// GET /clubs/:id/books - list all club books
// POST /clubs/:id/books - propose book. Must be a clubMember
// PATCH /clubs/:id/books/:bookId - change status. Only Admin
// DELETE /clubs/:id/books/:bookId - soft delete. Only Admin
// GET /books/search?q= — search in Google Books API

export default booksRouter;