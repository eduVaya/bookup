import api from '@/lib/api';
import handleError from '@/lib/services/handleError';
import type { ApiResponse, Review } from '@/types';

interface CreateReviewParams {
    rating: number;
    content?: string;
}

const getBookReviews = async (clubId: number, bookId: number): Promise<Review[]> => {
    try {
        const response = await api.get<ApiResponse<Review[]>>(`/clubs/${clubId}/books/${bookId}/reviews`);
        return response.data.data;
    } catch (error) {
        return handleError(error);
    }
};

const createReview = async (clubId: number, bookId: number, params: CreateReviewParams): Promise<Review> => {
    try {
        const response = await api.post<ApiResponse<Review>>(`/clubs/${clubId}/books/${bookId}/reviews`, params);
        return response.data.data;
    } catch (error) {
        return handleError(error);
    }
};

const deleteReview = async (clubId: number, bookId: number, reviewId: number): Promise<void> => {
    try {
        await api.delete(`/clubs/${clubId}/books/${bookId}/reviews/${reviewId}`);
    } catch (error) {
        return handleError(error);
    }
};

const updateReview = async (clubId: number, bookId: number, params: CreateReviewParams): Promise<Review> => {
    try {
        const response = await api.patch<ApiResponse<Review>>(
            `/clubs/${clubId}/books/${bookId}/reviews`,
            params
        );
        return response.data.data;
    } catch (error) {
        return handleError(error);
    }
};

export const reviewsService = {
    getBookReviews,
    createReview,
    deleteReview,
    updateReview
};