import api from '@/lib/api';
import handleError from '@/lib/services/handleError';
import type { ApiResponse, Club } from '@/types';

interface CreateClubParams {
    name: string;
    description: string;
    isPublic: boolean;
}

const getPublicClubs = async (search?: string): Promise<Club[]> => {
    try {
        const params = search ? { search } : {};
        const response = await api.get<ApiResponse<Club[]>>('/clubs', { params });
        return response.data.data;
    } catch (error) {
        return handleError(error);
    }
};

const getMyClubs = async (): Promise<Club[]> => {
    try {
        const response = await api.get<ApiResponse<Club[]>>('/clubs/mine',);
        return response.data.data;
    } catch (error) {
        return handleError(error);
    }
}

const createClub = async (params: CreateClubParams): Promise<Club> => {
    try {
        const response = await api.post<ApiResponse<Club>>('/clubs', params);
        return response.data.data;
    } catch (error) {
        return handleError(error);
    }
};

const getClub = async (id: number): Promise<Club> => {
    try {
        const response = await api.get<ApiResponse<Club>>(`/clubs/${id}`);
        return response.data.data;
    } catch (error) {
        return handleError(error);
    }
};

export const clubsService = {
    getPublicClubs,
    getMyClubs,
    createClub,
    getClub
};