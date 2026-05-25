import { ClubMember } from '@prisma/client';
import prisma from '../lib/prisma';

export const parseValidNumber = (number: unknown): number | null => {
    const parsedNumber = Number(number);
    return Number.isNaN(parsedNumber) ? null : parsedNumber;
}
export const parseParams = (params: Record<string, string | undefined>) => {
    const result: Record<string, number> = {}
    const errors: string[] = []

    for (const [key, value] of Object.entries(params)) {
        const parsed = parseValidNumber(value)
        if (!parsed) {
            errors.push(`Invalid ${key}`)
        } else {
            result[key] = parsed
        }
    }

    return { params: result, errors }
}
export const isString = (value: unknown): boolean => {
    return typeof value === 'string';
};

// Databse Helper
export const isClubAdmin = async (userId: number, clubId: number): Promise<boolean> => {
    const member = await prisma.clubMember.findUnique({
        where: {
            userId_clubId: { userId, clubId }
        }
    });
    return member?.role === 'ADMIN'
}

export const isClubMember = async (userId: number, clubId: number): Promise<boolean> => {
    const existingMember = await prisma.clubMember.findFirst({
        where: {
            userId,
            clubId,
            deletedAt: null
        }
    });
    return !!existingMember;
}

export const getClubMember = async (userId: number, clubId: number): Promise<ClubMember | null> => {
    const clubMember = await prisma.clubMember.findFirst({
        where: {
            userId,
            clubId,
            deletedAt: null
        }
    });
    return clubMember;
}

export const getBook = async (bookId: number, clubId: number) => {
    return prisma.book.findFirst({
        where: {
            id: bookId,
            clubId,
            deletedAt: null
        },
        select: {
            status: true
        }
    });
}

export const getSession = async (sessionId: number, clubId: number) => {
    return await prisma.session.findFirst({
        where: {
            id: sessionId,
            clubId,
            deletedAt: null
        },
        select: {
            id: true,
            scheduledAt: true,
            title: true,
            location: true
        }
    });
}

export const softDelete = async (model: any, id: number, deletedBy: number) => {
    return await model.update({
        where: { id },
        data: {
            deletedAt: new Date(),
            deletedBy
        }
    });
}