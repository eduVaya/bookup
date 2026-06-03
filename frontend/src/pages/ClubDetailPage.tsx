import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { clubsService } from '@/lib/services/clubs.service';
import { booksService } from '@/lib/services/books.service';
import ProposeBookModal from '@/components/shared/ProposeBookModal';
import LoadingScreen from '@/components/shared/LoadingScreen';
import { useState } from 'react';
import { toast } from 'sonner';
import { getErrors } from '@/lib/services/handleError';

function ClubDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const clubId = Number(id);
    const [proposeBookOpen, setProposeBookOpen] = useState(false);

    const { data: club, isLoading } = useQuery({
        queryKey: ['club', clubId],
        queryFn: () => clubsService.getClub(clubId),
    });
    const { data: books, isLoading: isLoadingBooks } = useQuery({
        queryKey: ['clubBooks', clubId],
        queryFn: () => booksService.getClubBooks(clubId),
    });

    const voteMutation = useMutation({
        mutationFn: (bookId: number) => booksService.voteBook(clubId, bookId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clubBooks', clubId] });
            toast.success('Vote added!');
        },
        onError: (error) => {
            toast.error(getErrors(error)[0]);
        }
    });
    const changeStatusMutation = useMutation({
        mutationFn: ({ bookId, newStatus }: { bookId: number; newStatus: 'READING' | 'COMPLETED' }) =>
            booksService.changeBookStatus(clubId, bookId, newStatus),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clubBooks', clubId] });
            toast.success('Book status updated!');
        },
        onError: (error) => {
            toast.error(getErrors(error)[0]);
        }
    });
    const unvoteMutation = useMutation({
        mutationFn: (bookId: number) => booksService.unVoteBook(clubId, bookId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clubBooks', clubId] });
            toast.success('Vote removed!');
        },
        onError: (error) => {
            toast.error(getErrors(error)[0]);
        }
    });
    if (isLoading) return <LoadingScreen />;

    if (!club) return (
        <div className="px-4 py-6 max-w-2xl mx-auto">
            <p style={{ color: 'var(--bk-text-muted)' }}>Club not found.</p>
        </div>
    );

    const myMembership = club.clubMembers?.find(m => m.user.id === user?.id);
    const isAdmin = myMembership?.role === 'ADMIN';
    const isMember = !!myMembership;

    return (
        <div className="px-4 py-6 max-w-2xl mx-auto">

            {/* Header */}
            <div
                className="rounded-xl p-5 mb-4"
                style={{ background: 'var(--bk-bg-card)', border: '1px solid var(--bk-border)' }}
            >
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h1
                            className="text-[22px] font-bold mb-1"
                            style={{ fontFamily: 'var(--font-serif)', color: 'var(--bk-text-primary)' }}
                        >
                            {club.name}
                        </h1>
                        <p
                            className="text-[13px]"
                            style={{ color: 'var(--bk-text-muted)' }}
                        >
                            {club.description}
                        </p>
                    </div>

                    {isMember && (
                        <span
                            className="text-[11px] font-semibold px-3 py-1 rounded-full flex-shrink-0 ml-3"
                            style={{
                                background: isAdmin ? 'var(--bk-accent)' : 'var(--bk-toggle-bg)',
                                color: isAdmin ? 'var(--bk-bg)' : 'var(--bk-accent)',
                            }}
                        >
                            {isAdmin ? 'Admin' : 'Member'}
                        </span>
                    )}
                </div>

                <div
                    className="flex items-center justify-between pt-3"
                    style={{ borderTop: '0.5px solid var(--bk-border)' }}
                >
                    <p
                        className="text-[12px]"
                        style={{ color: 'var(--bk-text-muted)' }}
                    >
                        {club._count?.clubMembers ?? club.clubMembers?.length ?? 0} members · Created by {club.creator.name}
                    </p>

                    {!user && (
                        <button
                            onClick={() => navigate('/login')}
                            className="text-[12px] font-semibold px-3 py-1 rounded-lg"
                            style={{ background: 'var(--bk-accent)', color: 'var(--bk-bg)' }}
                        >
                            Join
                        </button>
                    )}
                </div>

                {/* Invite code — only admin */}
                {isAdmin && club.inviteCode && (
                    <div
                        className="mt-3 p-3 rounded-lg flex items-center justify-between"
                        style={{ background: 'var(--bk-bg)', border: '1px solid var(--bk-border)' }}
                    >
                        <div>
                            <p
                                className="text-[10px] uppercase tracking-wider mb-1"
                                style={{ color: 'var(--bk-text-muted)' }}
                            >
                                Invite code
                            </p>
                            <p
                                className="text-[14px] font-semibold tracking-widest"
                                style={{ fontFamily: 'var(--font-serif)', color: 'var(--bk-text-primary)' }}
                            >
                                {club.inviteCode}
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(club.inviteCode!);
                            }}
                            className="text-[12px] font-semibold px-3 py-1 rounded-lg"
                            style={{ border: '1px solid var(--bk-border)', color: 'var(--bk-text-secondary)' }}
                        >
                            Copy
                        </button>
                    </div>
                )}
            </div>

            {/* Books section */}
            <div
                className="rounded-xl p-5 mb-4"
                style={{ background: 'var(--bk-bg-card)', border: '1px solid var(--bk-border)' }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2
                        className="text-[16px] font-semibold"
                        style={{ fontFamily: 'var(--font-serif)', color: 'var(--bk-text-primary)' }}
                    >
                        Books
                    </h2>
                    {isMember && (
                        <button
                            onClick={() => setProposeBookOpen(true)}
                            className="text-[12px] font-semibold px-3 py-1 rounded-lg"
                            style={{ border: '1px solid var(--bk-accent)', color: 'var(--bk-accent)' }}
                        >
                            + Propose book
                        </button>
                    )}
                </div>

                {isLoadingBooks && (
                    <div className="flex justify-center py-6">
                        <div
                            className="w-5 h-5 rounded-full border-2 animate-spin"
                            style={{ borderColor: 'var(--bk-accent)', borderTopColor: 'transparent' }}
                        />
                    </div>
                )}

                {!isLoadingBooks && books && (
                    <>
                        {/* Books in READING */}
                        {books.filter(b => b.status === 'READING').map(book => (
                            <div
                                key={book.id}
                                className="flex gap-3 p-3 rounded-xl mb-3"
                                style={{ background: 'var(--bk-bg)', border: '1px solid var(--bk-border)' }}
                            >
                                {book.coverUrl && (
                                    <img
                                        src={book.coverUrl}
                                        alt={book.title}
                                        className="w-[48px] h-[70px] rounded-lg object-cover flex-shrink-0"
                                    />
                                )}
                                <div className="flex-1">
                                    <span
                                        className="text-[10px] font-semibold uppercase tracking-wider"
                                        style={{ color: 'var(--bk-accent)' }}
                                    >
                                        Currently reading
                                    </span>
                                    <p
                                        className="text-[15px] font-medium mt-1"
                                        style={{ fontFamily: 'var(--font-serif)', color: 'var(--bk-text-primary)' }}
                                    >
                                        {book.title}
                                    </p>
                                    <p
                                        className="text-[12px]"
                                        style={{ color: 'var(--bk-text-muted)' }}
                                    >
                                        {book.author}
                                    </p>
                                </div>
                                {isAdmin && (
                                    <button
                                        onClick={() => changeStatusMutation.mutate({ bookId: book.id, newStatus: 'COMPLETED' })}
                                        disabled={changeStatusMutation.isPending}
                                        className="text-[11px] font-semibold px-3 py-1 rounded-lg self-start flex-shrink-0"
                                        style={{ border: '1px solid var(--bk-border)', color: 'var(--bk-text-secondary)' }}
                                    >
                                        Mark complete
                                    </button>
                                )}
                            </div>
                        ))}

                        {/* Books PROPOSED */}
                        {books.filter(b => b.status === 'PROPOSED').length > 0 && (
                            <div>
                                <p
                                    className="text-[11px] font-semibold uppercase tracking-wider mb-2"
                                    style={{ color: 'var(--bk-text-muted)' }}
                                >
                                    Proposed
                                </p>
                                {books.filter(b => b.status === 'PROPOSED').map(book => (
                                    <div
                                        key={book.id}
                                        className="flex items-center gap-3 py-2"
                                        style={{ borderBottom: '0.5px solid var(--bk-border)' }}
                                    >
                                        {book.coverUrl && (
                                            <img
                                                src={book.coverUrl}
                                                alt={book.title}
                                                className="w-[36px] h-[52px] rounded object-cover flex-shrink-0"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <p
                                                className="text-[13px] font-medium"
                                                style={{ color: 'var(--bk-text-primary)' }}
                                            >
                                                {book.title}
                                            </p>
                                            <p
                                                className="text-[11px]"
                                                style={{ color: 'var(--bk-text-muted)' }}
                                            >
                                                {book.author} · {book._count?.bookVotes ?? 0} votes
                                            </p>
                                        </div>
                                        {isMember && (
                                            <button
                                                onClick={() => book.userVoted
                                                    ? unvoteMutation.mutate(book.id)
                                                    : voteMutation.mutate(book.id)
                                                }
                                                disabled={voteMutation.isPending || unvoteMutation.isPending}
                                                className="text-[11px] font-semibold px-3 py-1 rounded-lg flex-shrink-0"
                                                style={{
                                                    background: book.userVoted ? 'var(--bk-accent)' : 'transparent',
                                                    color: book.userVoted ? 'var(--bk-bg)' : 'var(--bk-accent)',
                                                    border: '1px solid var(--bk-accent)',
                                                }}
                                            >
                                                {book.userVoted ? '✓ Voted' : 'Vote'}
                                            </button>
                                        )}
                                        {isAdmin && (
                                            <button
                                                onClick={() => changeStatusMutation.mutate({ bookId: book.id, newStatus: 'READING' })}
                                                disabled={changeStatusMutation.isPending}
                                                className="text-[11px] font-semibold px-3 py-1 rounded-lg flex-shrink-0"
                                                style={{ background: 'var(--bk-accent)', color: 'var(--bk-bg)', border: 'none' }}
                                            >
                                                Start reading
                                            </button>
                                        )}

                                    </div>
                                ))}
                            </div>
                        )}

                        {books.length === 0 && (
                            <p
                                className="text-center py-6 text-[13px]"
                                style={{ color: 'var(--bk-text-muted)' }}
                            >
                                No books yet. Propose the first one!
                            </p>
                        )}
                        {/* Libros COMPLETED */}
                        {books.filter(b => b.status === 'COMPLETED').length > 0 && (
                            <div className="mt-3">
                                <p
                                    className="text-[11px] font-semibold uppercase tracking-wider mb-2"
                                    style={{ color: 'var(--bk-text-muted)' }}
                                >
                                    Completed
                                </p>
                                {books.filter(b => b.status === 'COMPLETED').map(book => (
                                    <div
                                        key={book.id}
                                        className="flex items-center gap-3 py-2"
                                        style={{ borderBottom: '0.5px solid var(--bk-border)' }}
                                    >
                                        {book.coverUrl && (
                                            <img
                                                src={book.coverUrl}
                                                alt={book.title}
                                                className="w-[36px] h-[52px] rounded object-cover flex-shrink-0"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <p
                                                className="text-[13px] font-medium"
                                                style={{ color: 'var(--bk-text-primary)' }}
                                            >
                                                {book.title}
                                            </p>
                                            <p
                                                className="text-[11px]"
                                                style={{ color: 'var(--bk-text-muted)' }}
                                            >
                                                {book.author}
                                            </p>
                                        </div>
                                        <span
                                            className="text-[10px] font-semibold px-2 py-1 rounded-full flex-shrink-0"
                                            style={{ background: 'var(--bk-toggle-bg)', color: 'var(--bk-accent)' }}
                                        >
                                            ✓ Done
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            <ProposeBookModal
                open={proposeBookOpen}
                onClose={() => setProposeBookOpen(false)}
                clubId={clubId}
            />

        </div>
    );
}

export default ClubDetailPage;