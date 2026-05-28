import axios from 'axios';

export class ApiError extends Error {
    errors: string[];

    constructor(errors: string[]) {
        super(errors.join(', '));
        this.errors = errors;
    }
}

const handleError = (error: unknown): never => {
    if (axios.isAxiosError(error)) {
        const errors = error.response?.data?.errors;
        if (errors && Array.isArray(errors)) {
            throw new ApiError(errors);
        }
    }
    throw new ApiError(['Something went wrong. Please try again.']);
};

export const getErrors = (error: unknown): string[] => {
    if (error instanceof ApiError) {
        return error.errors;
    }
    if (error) {
        return ['Something went wrong. Please try again.'];
    }
    return [];
};

export default handleError;