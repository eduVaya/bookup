import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { clubsService } from '@/lib/services/clubs.service';
import { booksService } from '@/lib/services/books.service';
import { sessionsService } from '@/lib/services/sessions.service';
import ProposeBookModal from '@/components/shared/ProposeBookModal';
import LoadingScreen from '@/components/shared/LoadingScreen';
import { useState } from 'react';
import { toast } from 'sonner';
import { getErrors } from '@/lib/services/handleError';
import CreateSessionModal from '@/components/shared/CreateSessionModal';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import ReviewModal from '@/components/shared/ReviewModal';
import CompletedBook from '@/components/shared/CompletedBook';



function ClubDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const clubId = Number(id);
    const [proposeBookOpen, setProposeBookOpen] = useState(false);
    const [createSessionOpen, setCreateSessionOpen] = useState(false);
    const [bookToDelete, setBookToDelete] = useState<number | null>(null);
    const [sessionToDelete, setSessionToDelete] = useState<number | null>(null);
    const [reviewBook, setReviewBook] = useState<{
        id: number;
        title: string;
        existingReview?: { id: number; rating: number; content: string | null };
    } | null>(null);
    const [sessionToEdit, setSessionToEdit] = useState<{
        id: number;
        title: string;
        scheduledAt: string;
        location: string | null;
        bookId: number;
    } | null>(null);


    //queries
    const { data: club, isLoading } = useQuery({
        queryKey: ['club', clubId],
        queryFn: () => clubsService.getClub(clubId),
    });
    const { data: books, isLoading: isLoadingBooks } = useQuery({
        queryKey: ['clubBooks', clubId],
        queryFn: () => booksService.getClubBooks(clubId),
    });
    const { data: sessions, isLoading: isLoadingSessions } = useQuery({
        queryKey: ['clubSessions', clubId],
        queryFn: () => sessionsService.getClubSessions(clubId),
    });
    //mutations
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
    const unVoteMutation = useMutation({
        mutationFn: (bookId: number) => booksService.unVoteBook(clubId, bookId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clubBooks', clubId] });
            toast.success('Vote removed!');
        },
        onError: (error) => {
            toast.error(getErrors(error)[0]);
        }
    });
    const rsvpMutation = useMutation({
        mutationFn: ({ sessionId, status }: { sessionId: number; status: 'ATTENDING' | 'NOT_ATTENDING' | 'MAYBE' }) => {
            const session = sessions?.find(s => s.id === sessionId);
            if (session?.userAttendance) {
                return sessionsService.updateAttendance(clubId, sessionId, status);
            }
            return sessionsService.submitAttendance(clubId, sessionId, status);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clubSessions', clubId] });
            toast.success('RSVP updated!');
        },
        onError: (error) => {
            toast.error(getErrors(error)[0]);
        }
    });
    const deleteBookMutation = useMutation({
        mutationFn: (bookId: number) => booksService.deleteBook(clubId, bookId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clubBooks', clubId] });
            setBookToDelete(null);
            toast.success('Book removed');
        },
        onError: (error) => {
            toast.error(getErrors(error)[0]);
        }
    });

    const deleteSessionMutation = useMutation({
        mutationFn: (sessionId: number) => sessionsService.deleteSession(clubId, sessionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clubSessions', clubId] });
            setSessionToDelete(null);

            toast.success('Session removed');
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
                                                    ? unVoteMutation.mutate(book.id)
                                                    : voteMutation.mutate(book.id)
                                                }
                                                disabled={voteMutation.isPending || unVoteMutation.isPending}
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
                                        {isAdmin && (
                                            <button
                                                onClick={() => setBookToDelete(book.id)}
                                                disabled={deleteBookMutation.isPending}
                                                className="text-[11px] font-semibold px-2 py-1 rounded-lg flex-shrink-0"
                                                style={{ border: '1px solid #C4A89A', color: '#8B5E52' }}
                                            >
                                                ✕
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
                        {/* books COMPLETED */}
                        {books.filter(b => b.status === 'COMPLETED').length > 0 && (
                            <div className="mt-3">
                                <p
                                    className="text-[11px] font-semibold uppercase tracking-wider mb-2"
                                    style={{ color: 'var(--bk-text-muted)' }}
                                >
                                    Completed
                                </p>
                                {books.filter(b => b.status === 'COMPLETED').map(book => (
                                    <CompletedBook
                                        key={book.id}
                                        book={book}
                                        clubId={clubId}
                                        isMember={isMember}
                                        isAdmin={isAdmin}
                                        onReview={setReviewBook}
                                        onDelete={setBookToDelete}
                                        isDeleting={deleteBookMutation.isPending}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            {/* Sessions section */}
            <div
                className="rounded-xl p-5 mb-4"
                style={{ background: 'var(--bk-bg-card)', border: '1px solid var(--bk-border)' }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2
                        className="text-[16px] font-semibold"
                        style={{ fontFamily: 'var(--font-serif)', color: 'var(--bk-text-primary)' }}
                    >
                        Sessions
                    </h2>
                    {isAdmin && (
                        <button
                            onClick={() => setCreateSessionOpen(true)}
                            className="text-[12px] font-semibold px-3 py-1 rounded-lg"
                            style={{ border: '1px solid var(--bk-accent)', color: 'var(--bk-accent)' }}
                        >
                            + Add session
                        </button>
                    )}
                </div>

                {isLoadingSessions && (
                    <div className="flex justify-center py-6">
                        <div
                            className="w-5 h-5 rounded-full border-2 animate-spin"
                            style={{ borderColor: 'var(--bk-accent)', borderTopColor: 'transparent' }}
                        />
                    </div>
                )}

                {!isLoadingSessions && sessions && (
                    <>
                        {sessions.length === 0 && (
                            <p
                                className="text-center py-6 text-[13px]"
                                style={{ color: 'var(--bk-text-muted)' }}
                            >
                                No sessions scheduled yet.
                            </p>
                        )}

                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className="py-3"
                                style={{ borderBottom: '0.5px solid var(--bk-border)' }}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <p
                                            className="text-[14px] font-medium mb-1"
                                            style={{ color: 'var(--bk-text-primary)' }}
                                        >
                                            {session.title}
                                        </p>
                                        <p
                                            className="text-[12px] mb-1"
                                            style={{ color: 'var(--bk-text-muted)' }}
                                        >
                                            📅 {new Date(session.scheduledAt).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                        {session.location && (
                                            session.location.startsWith('http') ? (
                                                <a
                                                    href={session.location}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[12px] font-medium"
                                                    style={{ color: 'var(--bk-accent)' }}
                                                >
                                                    📍 View location
                                                </a>
                                            ) : (
                                                <p
                                                    className="text-[12px]"
                                                    style={{ color: 'var(--bk-text-muted)' }}
                                                >
                                                    📍 {session.location}
                                                </p>
                                            )
                                        )}
                                        <p
                                            className="text-[11px] mt-1"
                                            style={{ color: 'var(--bk-text-muted)' }}
                                        >
                                            {session._count?.attendances ?? 0} attending
                                        </p>
                                    </div>

                                    {isMember && (
                                        <div className="flex flex-col gap-1 flex-shrink-0">
                                            {(['ATTENDING', 'MAYBE', 'NOT_ATTENDING'] as const).map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => rsvpMutation.mutate({ sessionId: session.id, status })}
                                                    disabled={rsvpMutation.isPending}
                                                    className="text-[10px] font-semibold px-2 py-1 rounded-lg"
                                                    style={{
                                                        background: session.userAttendance === status ? 'var(--bk-accent)' : 'transparent',
                                                        color: session.userAttendance === status ? 'var(--bk-bg)' : 'var(--bk-text-muted)',
                                                        border: `1px solid ${session.userAttendance === status ? 'var(--bk-accent)' : 'var(--bk-border)'}`,
                                                    }}
                                                >
                                                    {status === 'ATTENDING' ? '✓ Yes' : status === 'MAYBE' ? '? Maybe' : '✗ No'}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {isAdmin && (
                                        <button
                                            onClick={() => setSessionToEdit({
                                                id: session.id,
                                                title: session.title,
                                                scheduledAt: session.scheduledAt,
                                                location: session.location,
                                                bookId: session.bookId,
                                            })}
                                            className="text-[10px] px-2 py-1 rounded"
                                            style={{ color: 'var(--bk-text-muted)' }}
                                        >
                                            Edit
                                        </button>
                                    )}
                                    {isAdmin && (
                                        <button
                                            onClick={() => setSessionToDelete(session.id)}
                                            disabled={deleteSessionMutation.isPending}
                                            className="text-[11px] font-semibold px-2 py-1 rounded-lg flex-shrink-0"
                                            style={{ border: '1px solid #C4A89A', color: '#8B5E52' }}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
            <ProposeBookModal
                open={proposeBookOpen}
                onClose={() => setProposeBookOpen(false)}
                clubId={clubId}
            />
            <CreateSessionModal
                open={createSessionOpen || sessionToEdit !== null}
                onClose={() => {
                    setCreateSessionOpen(false);
                    setSessionToEdit(null);
                }}
                clubId={clubId}
                books={books ?? []}
                existingSession={sessionToEdit ?? undefined}
            />
            <ConfirmDialog
                open={bookToDelete !== null}
                onClose={() => setBookToDelete(null)}
                onConfirm={() => bookToDelete && deleteBookMutation.mutate(bookToDelete)}
                title="Remove book"
                description="Are you sure you want to remove this book from the club?"
                isLoading={deleteBookMutation.isPending}
            />
            <ConfirmDialog
                open={sessionToDelete !== null}
                onClose={() => setSessionToDelete(null)}
                onConfirm={() => sessionToDelete && deleteSessionMutation.mutate(sessionToDelete)}
                title="Delete session"
                description="Are you sure you want to delete this session?"
                isLoading={deleteSessionMutation.isPending}
            />
            <ReviewModal
                open={reviewBook !== null}
                onClose={() => setReviewBook(null)}
                clubId={clubId}
                bookId={reviewBook?.id ?? 0}
                bookTitle={reviewBook?.title ?? ''}
                existingReview={reviewBook?.existingReview}
            />
        </div>
    );
}

export default ClubDetailPage;