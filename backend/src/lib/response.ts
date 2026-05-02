import type { Context } from 'hono'

export const successResponse = (context: Context, data: unknown, status: number = 200) => {
    return context.json({ success: true, data }, status as any)
}

export const errorResponse = (context: Context, errors: string | string[], status: number = 400) => {
    const errorArray = Array.isArray(errors) ? errors : [errors]
    return context.json({ success: false, errors: errorArray }, status as any)
}