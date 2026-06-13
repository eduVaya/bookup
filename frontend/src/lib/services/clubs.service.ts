import api from '@/lib/api';
import handleError from '@/lib/services/handleError';
import type { ApiResponse, Club } from '@/types';

interface CreateClubParams {
    name: string;
    description: string;
    isPublic: boolean;
}
interface UpdateClubParams {
    name?: string;
    description?: string;
    isPublic?: boolean;
}

interface ClubsResponse {
    clubs: Club[];
    total: number;
    page: number;
    totalPages: number;
}

interface ClubsResponse {
    clubs: Club[];
    total: number;
    page: number;
    totalPages: number;
}

const getPublicClubs = async (search?: string, page: number = 1): Promise<ClubsResponse> => {
    try {
        const params: Record<string, string | number> = { page };
        if (search) params.search = search;
        const response = await api.get<ApiResponse<ClubsResponse>>('/clubs', { params });
        return response.data.data;
    } catch (error) {
        return handleError(error);
    }
};


const getMyClubs = async (page: number = 1): Promise<ClubsResponse> => {
    try {
        const response = await api.get<ApiResponse<ClubsResponse>>('/clubs/mine', { params: { page } });
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

const updateClub = async (clubId: number, params: UpdateClubParams): Promise<Club> => {
    try {
        const response = await api.patch<ApiResponse<Club>>(`/clubs/${clubId}`, params);
        return response.data.data;
    } catch (error) {
        return handleError(error);
    }
};

const joinClub = async (inviteCode: string): Promise<Club> => {
    try {
        const response = await api.post<ApiResponse<Club>>('/clubs/join', { inviteCode });
        return response.data.data;
    } catch (error) {
        return handleError(error);
    }
};

export const clubsService = {
    getPublicClubs,
    getMyClubs,
    createClub,
    getClub,
    updateClub,
    joinClub
};