import api from '@/lib/api';
import handleError from '@/lib/services/handleError';
import type { ApiResponse, Session } from '@/types';

interface CreateSessionParams {
    bookId: number;
    title: string;
    scheduledAt: string;
    location?: string;
}
interface UpdateSessionParams {
    title?: string;
    scheduledAt?: string;
    location?: string;
}

const getClubSessions = async (clubId: number): Promise<Session[]> => {
    try {
        const response = await api.get<ApiResponse<Session[]>>(`/clubs/${clubId}/sessions`);
        return response.data.data;
    } catch (error) {
        return handleError(error);
    }
};

const createSession = async (clubId: number, params: CreateSessionParams): Promise<Session> => {
    try {
        const response = await api.post<ApiResponse<Session>>(`/clubs/${clubId}/sessions`, params);
        return response.data.data;
    } catch (error) {
        return handleError(error);
    }
};

const submitAttendance = async (clubId: number, sessionId: number, status: 'ATTENDING' | 'NOT_ATTENDING' | 'MAYBE'): Promise<void> => {
    try {
        await api.post(`/clubs/${clubId}/sessions/${sessionId}/attendance`, { status });
    } catch (error) {
        return handleError(error);
    }
};

const updateAttendance = async (clubId: number, sessionId: number, status: 'ATTENDING' | 'NOT_ATTENDING' | 'MAYBE'): Promise<void> => {
    try {
        await api.patch(`/clubs/${clubId}/sessions/${sessionId}/attendance`, { status });
    } catch (error) {
        return handleError(error);
    }
};

const deleteSession = async (clubId: number, sessionId: number): Promise<void> => {
    try {
        await api.delete(`/clubs/${clubId}/sessions/${sessionId}`);
    } catch (error) {
        return handleError(error);
    }
};


const updateSession = async (clubId: number, sessionId: number, params: UpdateSessionParams): Promise<Session> => {
    try {
        const response = await api.patch<ApiResponse<Session>>(`/clubs/${clubId}/sessions/${sessionId}`, params);
        return response.data.data;
    } catch (error) {
        return handleError(error);
    }
};

export const sessionsService = {
    getClubSessions,
    createSession,
    submitAttendance,
    updateAttendance,
    deleteSession,
    updateSession
};