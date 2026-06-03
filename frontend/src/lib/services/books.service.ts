import api from '@/lib/api';
import handleError from '@/lib/services/handleError';
import type { ApiResponse, Book } from '@/types';

interface GoogleBook {
    googleBooksId: string;
    title: string;
    author: string;
    coverUrl: string | null;
}

interface ProposeBookParams {
    googleBooksId: string;
    title: string;
    author: string;
    coverUrl?: string;
}

const getClubBooks = async (clubId: number, status?: string): Promise<Book[]> => {
    try {
        const params = status ? { status } : {};
        const response = await api.get<ApiResponse<Book[]>>(`/clubs/${clubId}/books`, { params });
        return response.data.data;
    } catch (error) {
        return handleError(error);
    }
};


const searchBooks = async (query: string): Promise<GoogleBook[]> => {
    try {
        const response = await api.get<ApiResponse<GoogleBook[]>>('/books/search', {
            params: { q: query }
        });
        return response.data.data;
    } catch (error) {
        return handleError(error);
    }
};

const proposeBook = async (clubId: number, params: ProposeBookParams): Promise<Book> => {
    try {
        const response = await api.post<ApiResponse<Book>>(`/clubs/${clubId}/books`, params);
        return response.data.data;
    } catch (error) {
        return handleError(error);
    }
};

const voteBook = async (clubId: number, bookId: number): Promise<void> => {
    try {
        await api.post(`/clubs/${clubId}/books/${bookId}/votes`);
    } catch (error) {
        return handleError(error);
    }
};

const unVoteBook = async (clubId: number, bookId: number): Promise<void> => {
    try {
        await api.delete(`/clubs/${clubId}/books/${bookId}/votes`);
    } catch (error) {
        return handleError(error);
    }
};

const changeBookStatus = async (clubId: number, bookId: number, newStatus: 'READING' | 'COMPLETED'): Promise<Book> => {
    try {
        const response = await api.patch<ApiResponse<Book>>(`/clubs/${clubId}/books/${bookId}`, { newStatus });
        return response.data.data;
    } catch (error) {
        return handleError(error);
    }
};

const deleteBook = async (clubId: number, bookId: number): Promise<void> => {
    try {
        await api.delete(`/clubs/${clubId}/books/${bookId}`);
    } catch (error) {
        return handleError(error);
    }
};
export const booksService = {
    getClubBooks,
    searchBooks,
    proposeBook,
    voteBook,
    unVoteBook,
    changeBookStatus,
    deleteBook
};