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

const editUser = async (userId: number, params: EditUserParams): Promise<EditUserResponse> => {
    try {
        const response = await api.patch<ApiResponse<EditUserResponse>>(`users/${userId}`, params);
        return response.data.data;
    } catch (error) {
        return handleError(error);
    }
}

export const userService = {
    editUser
};