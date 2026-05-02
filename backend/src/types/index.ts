export interface JwtPayload {
    userId: number
    email: string
    exp: number
    [key: string]: unknown

}

export interface UpdateUserPayload {
    name?: string
    avatar?: string
}


export type AppVariables = {
    userId: number
    userEmail: string
}

