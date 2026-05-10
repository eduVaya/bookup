import prisma from '../lib/prisma';

export const parseValidNumber = (number: unknown): number | null => {
    const parsedNumber = Number(number);
    return Number.isNaN(parsedNumber) ? null : parsedNumber;
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

export const softDelete = async (model: any, id: number, deletedBy: number) => {
    return await model.update({
        where: { id },
        data: {
            deletedAt: new Date(),
            deletedBy
        }
    });
}