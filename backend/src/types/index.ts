export interface JwtPayload {
    userId: number
    email: string
    exp: number
    [key: string]: unknown

}

export type AppVariables = {
    userId: number
    userEmail: string
}

export interface UpdateUserPayload {
    name?: string
    avatar?: string
}


export interface UpdateClubPayload {
    name?: string
    description?: string
    isPublic?: boolean
}

export interface UpdateSessionPayload {
    title?: string
    scheduledAt?: Date
    location?: string
}

export interface UpdateReviewPayload {
    rating?: number
    content?: string
}

export interface PostVoteParams {
    bookId: number
    clubId: number
}