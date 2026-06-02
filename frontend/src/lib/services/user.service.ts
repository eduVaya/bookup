import api from "../api"
import handleError from "./handleError"
import { ApiResponse } from "@/types"

interface EditUserParams {
    name?: string
    avatar?: string
}

interface EditUserResponse {
    id: string
    email: string
    name: string
    avatar: string | null
}

interface GetUserStatsResponse {
    clubs: number
    books: number
    reviews: number
}

const editUser = async (userId: number, params: EditUserParams): Promise<EditUserResponse> => {
    try {
        const response = await api.patch<ApiResponse<EditUserResponse>>(`users/${userId}`, params);
        return response.data.data;
    } catch (error) {
        return handleError(error);
    }
}

const getUserStats = async (userId: number): Promise<GetUserStatsResponse> => {
    try {
        const response = await api.get<ApiResponse<GetUserStatsResponse>>(`users/${userId}/stats`);
        return response.data.data;
    } catch (error) {
        return handleError(error);
    }
}

const deleteAccount = async (userId: number): Promise<void> => {
    try {
        await api.delete(`/users/${userId}`);
    } catch (error) {
        return handleError(error);
    }
};

export const userService = {
    editUser,
    getUserStats,
    deleteAccount
};