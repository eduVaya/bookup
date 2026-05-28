import api from '@/lib/api';
import type { ApiResponse, User } from '@/types';
import handleError from './handleError';

interface LoginParams {
    email: string;
    password: string;
}

interface RegisterParams {
    email: string;
    password: string;
    name: string;
}

interface AuthResponse {
    token: string;
    user: User;
}


const login = async (params: LoginParams): Promise<AuthResponse> => {
    try {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', params);
        return response.data.data;
    } catch (error) {
        return handleError(error);
    }
};

const register = async (params: RegisterParams): Promise<AuthResponse> => {
    try {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', params);
        return response.data.data;
    } catch (error) {
        return handleError(error);
    }
};

const me = async (): Promise<User> => {
    try {
        const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
        return response.data.data.user;
    } catch (error) {
        return handleError(error);
    }
};

export const authService = {
    login,
    register,
    me,
};