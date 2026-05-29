import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');


    await prisma.review.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.session.deleteMany();
    await prisma.bookVote.deleteMany();
    await prisma.book.deleteMany();
    await prisma.clubMember.deleteMany();
    await prisma.club.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash('1234567', 10);


    const users = await Promise.all([
        prisma.user.create({ data: { name: 'Eduardo', email: 'eduardo@test.com', password: hashedPassword } }),
        prisma.user.create({ data: { name: 'María López', email: 'maria@test.com', password: hashedPassword } }),
        prisma.user.create({ data: { name: 'Carlos Rivera', email: 'carlos@test.com', password: hashedPassword } }),
        prisma.user.create({ data: { name: 'Ana García', email: 'ana@test.com', password: hashedPassword } }),
        prisma.user.create({ data: { name: 'Luis Martínez', email: 'luis@test.com', password: hashedPassword } }),
        prisma.user.create({ data: { name: 'Sofia Chen', email: 'sofia@test.com', password: hashedPassword } }),
    ]);

    console.log(`Created ${users.length} users`);


    const clubs = [
        {
            name: 'Sci-Fi Readers',
            description: 'A club for fans of science fiction and speculative fiction.',
            creatorIndex: 0,
            members: [1, 2, 3],
        },
        {
            name: 'Classic Literature',
            description: 'Exploring the greatest works of classic literature from around the world.',
            creatorIndex: 1,
            members: [0, 3, 4],
        },
        {
            name: 'Mystery Club',
            description: 'Whodunit lovers unite. Thrillers and mystery novels only.',
            creatorIndex: 2,
            members: [0, 1, 5],
        },
        {
            name: 'Fantasy World',
            description: 'Dragons, magic and epic adventures. All fantasy subgenres welcome.',
            creatorIndex: 3,
            members: [2, 4, 5],
        },
        {
            name: 'Non-Fiction Nerds',
            description: 'Because reality is stranger than fiction. Science, history, biography.',
            creatorIndex: 4,
            members: [0, 2, 3],
        },
    ];

    for (const clubData of clubs) {
        const creator = users[clubData.creatorIndex];

        const club = await prisma.club.create({
            data: {
                name: clubData.name,
                description: clubData.description,
                isPublic: true,
                inviteCode: nanoid(8),
                createdBy: creator.id,
                clubMembers: {
                    create: [
                        { userId: creator.id, role: 'ADMIN' },
                        ...clubData.members.map(i => ({ userId: users[i].id, role: 'MEMBER' as const })),
                    ],
                },
            },
        });


        await prisma.book.createMany({
            data: [
                {
                    clubId: club.id,
                    proposedBy: creator.id,
                    googleBooksId: 'abc123',
                    title: 'Dune',
                    author: 'Frank Herbert',
                    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780441013593-M.jpg',
                    status: 'COMPLETED',
                    completedAt: new Date(),
                },
                {
                    clubId: club.id,
                    proposedBy: users[clubData.members[0]].id,
                    googleBooksId: 'def456',
                    title: 'Foundation',
                    author: 'Isaac Asimov',
                    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780553293357-M.jpg',
                    status: 'READING',
                    startedAt: new Date(),
                },
                {
                    clubId: club.id,
                    proposedBy: users[clubData.members[1]].id,
                    googleBooksId: 'ghi789',
                    title: "Ender's Game",
                    author: 'Orson Scott Card',
                    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780812550702-M.jpg',
                    status: 'PROPOSED',
                },
            ],
        });

        console.log(`Created club: ${club.name}`);
    }

    console.log('Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });