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

    const hashedPassword = await bcrypt.hash('demo1234', 10);

    const users = await Promise.all([
        prisma.user.create({ data: { name: 'Emma Johnson', email: 'emma@demo.com', password: hashedPassword } }),
        prisma.user.create({ data: { name: 'Olivia Williams', email: 'olivia@demo.com', password: hashedPassword } }),
        prisma.user.create({ data: { name: 'Sophia Brown', email: 'sophia@demo.com', password: hashedPassword } }),
        prisma.user.create({ data: { name: 'benjamin Taylor', email: 'benjamin@demo.com', password: hashedPassword } }),
        prisma.user.create({ data: { name: 'Charlotte Davis', email: 'charlotte@demo.com', password: hashedPassword } }),
        prisma.user.create({ data: { name: 'James Smith', email: 'james@demo.com', password: hashedPassword } }),
        prisma.user.create({ data: { name: 'william Miller', email: 'william@demo.com', password: hashedPassword } }),
        prisma.user.create({ data: { name: 'Michael Wilson', email: 'michael@demo.com', password: hashedPassword } }),
    ]);

    console.log(`✅ Created ${users.length} users`);

    const clubsData = [
        {
            name: 'Sci-Fi Readers',
            description: 'A club for fans of science fiction and speculative fiction. We explore the future through literature.',
            creatorIndex: 0,
            members: [1, 2, 3, 4],
            books: [
                {
                    googleBooksId: '9780441013593',
                    title: 'Dune',
                    author: 'Frank Herbert',
                    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780441013593-M.jpg',
                    status: 'COMPLETED' as const,
                    proposerIndex: 0,
                },
                {
                    googleBooksId: '9780553293357',
                    title: 'Foundation',
                    author: 'Isaac Asimov',
                    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780553293357-M.jpg',
                    status: 'READING' as const,
                    proposerIndex: 1,
                },
                {
                    googleBooksId: '9780812550702',
                    title: "Ender's Game",
                    author: 'Orson Scott Card',
                    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780812550702-M.jpg',
                    status: 'PROPOSED' as const,
                    proposerIndex: 2,
                },
                {
                    googleBooksId: '9780441569595',
                    title: 'Neuromancer',
                    author: 'William Gibson',
                    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780441569595-M.jpg',
                    status: 'PROPOSED' as const,
                    proposerIndex: 3,
                },
            ],
        },
        {
            name: 'Classic Literature',
            description: 'Exploring the greatest works of classic literature from around the world.',
            creatorIndex: 1,
            members: [0, 3, 4, 5],
            books: [
                {
                    googleBooksId: '9780143035008',
                    title: 'Anna Karenina',
                    author: 'Leo Tolstoy',
                    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780143035008-M.jpg',
                    status: 'COMPLETED' as const,
                    proposerIndex: 1,
                },
                {
                    googleBooksId: '9780141439518',
                    title: 'Pride and Prejudice',
                    author: 'Jane Austen',
                    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439518-M.jpg',
                    status: 'READING' as const,
                    proposerIndex: 0,
                },
                {
                    googleBooksId: '9780486415871',
                    title: 'Crime and Punishment',
                    author: 'Fyodor Dostoevsky',
                    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780486415871-M.jpg',
                    status: 'PROPOSED' as const,
                    proposerIndex: 3,
                },
            ],
        },
        {
            name: 'Mystery Club',
            description: 'Whodunit lovers unite. Thrillers and mystery novels only. Can you guess the ending?',
            creatorIndex: 2,
            members: [0, 1, 5, 6],
            books: [
                {
                    googleBooksId: '9780307588371',
                    title: 'Gone Girl',
                    author: 'Gillian Flynn',
                    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780307588371-M.jpg',
                    status: 'COMPLETED' as const,
                    proposerIndex: 2,
                },
                {
                    googleBooksId: '9780307454546',
                    title: 'The Girl with the Dragon Tattoo',
                    author: 'Stieg Larsson',
                    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780307454546-M.jpg',
                    status: 'READING' as const,
                    proposerIndex: 1,
                },
                {
                    googleBooksId: '9781400031702',
                    title: 'The Secret History',
                    author: 'Donna Tartt',
                    coverUrl: 'https://covers.openlibrary.org/b/isbn/9781400031702-M.jpg',
                    status: 'PROPOSED' as const,
                    proposerIndex: 0,
                },
                {
                    googleBooksId: '9780425274866',
                    title: 'Big Little Lies',
                    author: 'Liane Moriarty',
                    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780425274866-M.jpg',
                    status: 'PROPOSED' as const,
                    proposerIndex: 5,
                },
            ],
        },
        {
            name: 'Fantasy World',
            description: 'Dragons, magic and epic adventures. All fantasy subgenres welcome — high fantasy, urban fantasy, and beyond.',
            creatorIndex: 3,
            members: [2, 4, 6, 7],
            books: [
                {
                    googleBooksId: '9780618640157',
                    title: 'The Lord of the Rings',
                    author: 'J.R.R. Tolkien',
                    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780618640157-M.jpg',
                    status: 'COMPLETED' as const,
                    proposerIndex: 3,
                },
                {
                    googleBooksId: '9780439708180',
                    title: "Harry Potter and the Sorcerer's Stone",
                    author: 'J.K. Rowling',
                    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780439708180-M.jpg',
                    status: 'READING' as const,
                    proposerIndex: 2,
                },
                {
                    googleBooksId: '9780765326355',
                    title: 'The Way of Kings',
                    author: 'Brandon Sanderson',
                    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780765326355-M.jpg',
                    status: 'PROPOSED' as const,
                    proposerIndex: 4,
                },
            ],
        },
        {
            name: 'Non-Fiction Nerds',
            description: 'Because reality is stranger than fiction. Science, history, biography, and everything in between.',
            creatorIndex: 4,
            members: [0, 2, 5, 7],
            books: [
                {
                    googleBooksId: '9780393355420',
                    title: 'Sapiens',
                    author: 'Yuval Noah Harari',
                    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780393355420-M.jpg',
                    status: 'COMPLETED' as const,
                    proposerIndex: 4,
                },
                {
                    googleBooksId: '9780062316097',
                    title: 'Thinking, Fast and Slow',
                    author: 'Daniel Kahneman',
                    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg',
                    status: 'READING' as const,
                    proposerIndex: 0,
                },
                {
                    googleBooksId: '9780735224292',
                    title: 'Atomic Habits',
                    author: 'James Clear',
                    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780735224292-M.jpg',
                    status: 'PROPOSED' as const,
                    proposerIndex: 2,
                },
                {
                    googleBooksId: '9781501156700',
                    title: 'The Body Keeps the Score',
                    author: 'Bessel van der Kolk',
                    coverUrl: 'https://covers.openlibrary.org/b/isbn/9781501156700-M.jpg',
                    status: 'PROPOSED' as const,
                    proposerIndex: 5,
                },
            ],
        },
        {
            name: 'Literature',
            description: 'Literature in all its forms.',
            creatorIndex: 5,
            members: [0, 1, 6, 7],
            books: [
                {
                    googleBooksId: '9780060883287',
                    title: 'One Hundred Years of Solitude',
                    author: 'Gabriel García Márquez',
                    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780060883287-M.jpg',
                    status: 'COMPLETED' as const,
                    proposerIndex: 5,
                },
                {
                    googleBooksId: '9780374529208',
                    title: 'Ficciones',
                    author: 'Jorge Luis Borges',
                    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780374529208-M.jpg',
                    status: 'READING' as const,
                    proposerIndex: 1,
                },
                {
                    googleBooksId: '9780385721134',
                    title: 'The House on Mango Street',
                    author: 'Sandra Cisneros',
                    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780385721134-M.jpg',
                    status: 'PROPOSED' as const,
                    proposerIndex: 6,
                },
            ],
        },
    ];

    for (const clubData of clubsData) {
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


        for (const bookData of clubData.books) {
            const proposer = users[clubData.members[0]];
            const book = await prisma.book.create({
                data: {
                    clubId: club.id,
                    proposedBy: proposer.id,
                    googleBooksId: bookData.googleBooksId,
                    title: bookData.title,
                    author: bookData.author,
                    coverUrl: bookData.coverUrl,
                    status: bookData.status,
                    startedAt: bookData.status === 'READING' || bookData.status === 'COMPLETED' ? new Date() : null,
                    completedAt: bookData.status === 'COMPLETED' ? new Date() : null,
                },
            });


            if (bookData.status === 'PROPOSED') {
                const voters = clubData.members.slice(0, 2);
                for (const voterIndex of voters) {
                    await prisma.bookVote.create({
                        data: {
                            bookId: book.id,
                            userId: users[voterIndex].id,
                        },
                    });
                }
            }


            if (bookData.status === 'COMPLETED') {
                const reviewers = [clubData.creatorIndex, ...clubData.members.slice(0, 2)];
                const ratings = [5, 4, 4];
                const contents = [
                    'Absolutely loved this book. A masterpiece that changed how I see the world.',
                    'Really enjoyed it. The characters were so well developed.',
                    'Great read! Looking forward to discussing it at our next session.',
                ];
                for (let i = 0; i < reviewers.length; i++) {
                    await prisma.review.create({
                        data: {
                            bookId: book.id,
                            userId: users[reviewers[i]].id,
                            rating: ratings[i],
                            content: contents[i],
                        },
                    });
                }
            }
        }

        await prisma.session.create({
            data: {
                clubId: club.id,
                bookId: (await prisma.book.findFirst({
                    where: { clubId: club.id, status: 'READING' },
                }))!.id,
                title: `${clubData.name} — Monthly Discussion`,
                scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                location: 'https://meet.google.com/bookup-demo',
            },
        });

        console.log(`✅ Created club: ${club.name}`);
    }

    console.log('🎉 Seeding complete!');
    console.log('');
    console.log('Demo accounts (password: demo1234):');
    console.log('  eduardo@demo.com — Admin of Sci-Fi Readers');
    console.log('  maria@demo.com — Admin of Classic Literature');
    console.log('  carlos@demo.com — Admin of Mystery Club');
    console.log('  ana@demo.com — Admin of Fantasy World');
    console.log('  luis@demo.com — Admin of Non-Fiction Nerds');
    console.log('  sofia@demo.com — Admin of Latino Literature');
    console.log('  miguel@demo.com — Member');
    console.log('  isabella@demo.com — Member');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });