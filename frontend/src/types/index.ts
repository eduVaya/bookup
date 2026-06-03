export interface User {
    id: number
    email: string
    name: string
    avatar: string | null
    createdAt?: string
}

export interface Club {
    id: number;
    name: string;
    description: string;
    isPublic: boolean;
    inviteCode?: string;
    createdAt: string;
    creator: {
        name: string;
        avatar: string | null;
    };
    clubMembers?: {
        role: 'ADMIN' | 'MEMBER';
        joinedAt: string;
        user: {
            id: number;
            name: string;
            avatar: string | null;
        };
    }[];
    _count?: {
        clubMembers: number;
    };
}

export interface Book {
    id: number
    clubId: number
    googleBooksId: string
    title: string
    author: string
    coverUrl: string | null
    status: 'PROPOSED' | 'READING' | 'COMPLETED'
    proposedAt: string
    startedAt: string | null
    completedAt: string | null
    userVoted?: boolean;
    proposer: {
        name: string
        avatar: string | null
    }
    _count?: {
        bookVotes: number
    }
}

export interface Session {
    id: number
    clubId: number
    bookId: number
    title: string
    scheduledAt: string
    location: string | null
    createdAt: string,
    userAttendance: 'ATTENDING' | 'NOT_ATTENDING' | 'MAYBE' | null;
    book: {
        title: string
        coverUrl: string | null
    }
    _count?: {
        attendances: number
    }
}

export interface Review {
    id: number
    bookId: number
    rating: number
    content: string | null
    createdAt: string
    user: {
        name: string
        avatar: string | null
    }
}


//Apis
export interface ApiResponse<T> {
    success: boolean
    data: T
}

export interface ApiError {
    success: false
    errors: string[]
}