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