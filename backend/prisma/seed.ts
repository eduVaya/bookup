import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

const booksByGenre = {
    scifi: [
        { googleBooksId: '9780441013593', title: 'Dune', author: 'Frank Herbert', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780441013593-M.jpg' },
        { googleBooksId: '9780553293357', title: 'Foundation', author: 'Isaac Asimov', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780553293357-M.jpg' },
        { googleBooksId: '9780812550702', title: "Ender's Game", author: 'Orson Scott Card', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780812550702-M.jpg' },
        { googleBooksId: '9780441569595', title: 'Neuromancer', author: 'William Gibson', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780441569595-M.jpg' },
        { googleBooksId: '9780345391803', title: 'The Hitchhiker\'s Guide to the Galaxy', author: 'Douglas Adams', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780345391803-M.jpg' },
    ],
    fantasy: [
        { googleBooksId: '9780618640157', title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780618640157-M.jpg' },
        { googleBooksId: '9780439708180', title: "Harry Potter and the Sorcerer's Stone", author: 'J.K. Rowling', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780439708180-M.jpg' },
        { googleBooksId: '9780765326355', title: 'The Way of Kings', author: 'Brandon Sanderson', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780765326355-M.jpg' },
        { googleBooksId: '9780553573398', title: 'A Game of Thrones', author: 'George R.R. Martin', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780553573398-M.jpg' },
        { googleBooksId: '9780060256654', title: 'The Name of the Wind', author: 'Patrick Rothfuss', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780060256654-M.jpg' },
    ],
    mystery: [
        { googleBooksId: '9780307588371', title: 'Gone Girl', author: 'Gillian Flynn', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780307588371-M.jpg' },
        { googleBooksId: '9780307454546', title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780307454546-M.jpg' },
        { googleBooksId: '9781400031702', title: 'The Secret History', author: 'Donna Tartt', coverUrl: 'https://covers.openlibrary.org/b/isbn/9781400031702-M.jpg' },
        { googleBooksId: '9780425274866', title: 'Big Little Lies', author: 'Liane Moriarty', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780425274866-M.jpg' },
        { googleBooksId: '9780312942434', title: 'And Then There Were None', author: 'Agatha Christie', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780312942434-M.jpg' },
    ],
    nonfiction: [
        { googleBooksId: '9780393355420', title: 'Sapiens', author: 'Yuval Noah Harari', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780393355420-M.jpg' },
        { googleBooksId: '9780062316097', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg' },
        { googleBooksId: '9780735224292', title: 'Atomic Habits', author: 'James Clear', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780735224292-M.jpg' },
        { googleBooksId: '9781501156700', title: 'The Body Keeps the Score', author: 'Bessel van der Kolk', coverUrl: 'https://covers.openlibrary.org/b/isbn/9781501156700-M.jpg' },
        { googleBooksId: '9780743273565', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg' },
    ],
    classic: [
        { googleBooksId: '9780143035008', title: 'Anna Karenina', author: 'Leo Tolstoy', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780143035008-M.jpg' },
        { googleBooksId: '9780141439518', title: 'Pride and Prejudice', author: 'Jane Austen', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439518-M.jpg' },
        { googleBooksId: '9780486415871', title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780486415871-M.jpg' },
        { googleBooksId: '9780060883287', title: 'One Hundred Years of Solitude', author: 'Gabriel García Márquez', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780060883287-M.jpg' },
        { googleBooksId: '9780374529208', title: 'Ficciones', author: 'Jorge Luis Borges', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780374529208-M.jpg' },
    ],
};

const clubTemplates = [
    { name: 'Sci-Fi Explorers', description: 'Exploring the frontiers of science fiction from classic space operas to hard sci-fi.', genre: 'scifi' },
    { name: 'Fantasy Realm', description: 'Dragons, magic, and epic quests. All fantasy subgenres welcome.', genre: 'fantasy' },
    { name: 'Mystery Lovers', description: 'Whodunit enthusiasts united. Thrillers and mystery novels only.', genre: 'mystery' },
    { name: 'Non-Fiction Nerds', description: 'Because reality is stranger than fiction. Science, history, and biography.', genre: 'nonfiction' },
    { name: 'Classic Lit Society', description: 'Timeless works that shaped literature. From Tolstoy to García Márquez.', genre: 'classic' },
    { name: 'Space Cadets', description: 'For those who dream of the stars. Hard sci-fi and space exploration stories.', genre: 'scifi' },
    { name: 'The Magic Circle', description: 'Urban fantasy, high fantasy, and everything in between.', genre: 'fantasy' },
    { name: 'Crime Scene Readers', description: 'Dark plots, unreliable narrators, and shocking twists.', genre: 'mystery' },
    { name: 'Mind Expanders', description: 'Books that challenge how you think about the world.', genre: 'nonfiction' },
    { name: 'The Literary Canon', description: 'Reading through the greatest works ever written.', genre: 'classic' },
    { name: 'Galaxy Brains', description: 'Thought-provoking science fiction that asks the big questions.', genre: 'scifi' },
    { name: 'Sword & Sorcery Club', description: 'Epic battles, legendary heroes, and dark magic.', genre: 'fantasy' },
    { name: 'The Noir Society', description: 'Dark mysteries, femme fatales, and morally grey detectives.', genre: 'mystery' },
    { name: 'True Story Collective', description: 'Memoirs, biographies, and narrative nonfiction.', genre: 'nonfiction' },
    { name: 'The Dusty Pages Club', description: 'Revisiting the classics that everyone says they have read.', genre: 'classic' },
    { name: 'Cyberpunk Central', description: 'High tech, low life. Dystopian futures and digital rebellion.', genre: 'scifi' },
    { name: 'World Builders Anonymous', description: 'For readers obsessed with richly detailed fictional worlds.', genre: 'fantasy' },
    { name: 'Cozy Mysteries Corner', description: 'Gentle mysteries with charming detectives and small-town settings.', genre: 'mystery' },
    { name: 'The Science Shelf', description: 'Popular science, physics, biology, and the natural world.', genre: 'nonfiction' },
    { name: 'Lost in Translation', description: 'Classic works from around the world in translation.', genre: 'classic' },
    { name: 'Time Travelers Book Club', description: 'Time travel, alternate history, and parallel universes.', genre: 'scifi' },
    { name: 'The Enchanted Library', description: 'Magical realism and fairy tale retellings for adults.', genre: 'fantasy' },
    { name: 'Cold Case Files', description: 'True crime, forensic thrillers, and psychological suspense.', genre: 'mystery' },
    { name: 'Philosophy & Ideas', description: 'Books that make you question everything you thought you knew.', genre: 'nonfiction' },
    { name: 'The Victorian Reading Room', description: 'Dickens, Hardy, Eliot, and the great Victorian novelists.', genre: 'classic' },
    { name: 'First Contact Club', description: 'Alien encounters, SETI, and the search for extraterrestrial life.', genre: 'scifi' },
    { name: 'Epic Fantasy Readers', description: 'Long series, massive worlds, and stories that span generations.', genre: 'fantasy' },
    { name: 'Psychological Thrillers', description: 'Unreliable narrators, twisted minds, and shocking revelations.', genre: 'mystery' },
    { name: 'History Buffs Book Club', description: 'Narrative history, historical biography, and military history.', genre: 'nonfiction' },
    { name: 'The Latin American Shelf', description: 'Magical realism and literary fiction from Latin America.', genre: 'classic' },
];

const reviews = [
    'A masterpiece. Changed how I see the world.',
    'Could not put it down. Read it in two days.',
    'Dense but rewarding. Every page made me think.',
    'Beautifully written. The characters feel so real.',
    'Slow start but the payoff is incredible.',
    'One of the best books I have ever read.',
    'Thought-provoking and deeply moving.',
    'Not my usual genre but I loved it.',
    'The prose is stunning. Will read again.',
    'A bit overrated but still a great read.',
];

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
        prisma.user.create({ data: { name: 'Benjamin Taylor', email: 'benjamin@demo.com', password: hashedPassword } }),
        prisma.user.create({ data: { name: 'Charlotte Davis', email: 'charlotte@demo.com', password: hashedPassword } }),
        prisma.user.create({ data: { name: 'James Smith', email: 'james@demo.com', password: hashedPassword } }),
        prisma.user.create({ data: { name: 'William Miller', email: 'william@demo.com', password: hashedPassword } }),
        prisma.user.create({ data: { name: 'Michael Wilson', email: 'michael@demo.com', password: hashedPassword } }),
        prisma.user.create({ data: { name: 'Ava Martinez', email: 'ava@demo.com', password: hashedPassword } }),
        prisma.user.create({ data: { name: 'Liam Anderson', email: 'liam@demo.com', password: hashedPassword } }),
    ]);

    console.log(`✅ Created ${users.length} users`);

    for (let i = 0; i < clubTemplates.length; i++) {
        const template = clubTemplates[i];
        const creatorIndex = i % users.length;
        const creator = users[creatorIndex];
        const genreBooks = booksByGenre[template.genre as keyof typeof booksByGenre];

        const memberIndices = Array.from({ length: 4 }, (_, j) => (creatorIndex + j + 1) % users.length);
        const uniqueMemberIndices = [...new Set(memberIndices)].filter(idx => idx !== creatorIndex);

        const club = await prisma.club.create({
            data: {
                name: template.name,
                description: template.description,
                isPublic: true,
                inviteCode: nanoid(8),
                createdBy: creator.id,
                clubMembers: {
                    create: [
                        { userId: creator.id, role: 'ADMIN' },
                        ...uniqueMemberIndices.map(idx => ({ userId: users[idx].id, role: 'MEMBER' as const })),
                    ],
                },
            },
        });

        // Completed book
        const completedBook = await prisma.book.create({
            data: {
                clubId: club.id,
                proposedBy: creator.id,
                googleBooksId: genreBooks[0].googleBooksId,
                title: genreBooks[0].title,
                author: genreBooks[0].author,
                coverUrl: genreBooks[0].coverUrl,
                status: 'COMPLETED',
                startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
        });

        // Reviews for completed book
        for (let r = 0; r < Math.min(3, uniqueMemberIndices.length + 1); r++) {
            const reviewerIdx = r === 0 ? creatorIndex : uniqueMemberIndices[r - 1];
            await prisma.review.create({
                data: {
                    bookId: completedBook.id,
                    userId: users[reviewerIdx].id,
                    rating: Math.floor(Math.random() * 2) + 4,
                    content: reviews[Math.floor(Math.random() * reviews.length)],
                },
            });
        }

        // Reading book
        const readingBook = await prisma.book.create({
            data: {
                clubId: club.id,
                proposedBy: users[uniqueMemberIndices[0]].id,
                googleBooksId: genreBooks[1].googleBooksId,
                title: genreBooks[1].title,
                author: genreBooks[1].author,
                coverUrl: genreBooks[1].coverUrl,
                status: 'READING',
                startedAt: new Date(),
            },
        });

        // Session for reading book
        await prisma.session.create({
            data: {
                clubId: club.id,
                bookId: readingBook.id,
                title: `${template.name} — Monthly Discussion`,
                scheduledAt: new Date(Date.now() + (7 + i) * 24 * 60 * 60 * 1000),
                location: 'https://meet.google.com/bookup-demo',
            },
        });

        // Proposed books with votes
        for (let p = 2; p < Math.min(4, genreBooks.length); p++) {
            const proposedBook = await prisma.book.create({
                data: {
                    clubId: club.id,
                    proposedBy: users[uniqueMemberIndices[p % uniqueMemberIndices.length]].id,
                    googleBooksId: genreBooks[p].googleBooksId,
                    title: genreBooks[p].title,
                    author: genreBooks[p].author,
                    coverUrl: genreBooks[p].coverUrl,
                    status: 'PROPOSED',
                },
            });

            // Add votes
            const voterIndices = uniqueMemberIndices.slice(0, 2);
            for (const voterIdx of voterIndices) {
                await prisma.bookVote.create({
                    data: { bookId: proposedBook.id, userId: users[voterIdx].id },
                });
            }
        }

        console.log(`✅ Created club: ${template.name}`);
    }

    console.log('');
    console.log('🎉 Seeding complete!');
    console.log(`   ${clubTemplates.length} clubs created`);
    console.log('');
    console.log('Demo accounts (password: demo1234):');
    console.log('   emma@demo.com');
    console.log('   olivia@demo.com');
    console.log('   sophia@demo.com');
    console.log('   benjamin@demo.com');
    console.log('   charlotte@demo.com');
    console.log('   james@demo.com');
    console.log('   william@demo.com');
    console.log('   michael@demo.com');
    console.log('   ava@demo.com');
    console.log('   liam@demo.com');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });