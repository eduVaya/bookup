import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useAuthUser } from '@/context/AuthContext';
import CreateClubModal from '@/components/shared/CreateClubModal';
import { clubsService } from '@/lib/services/clubs.service';
import JoinClubModal from '@/components/shared/JoinClubModal';

function DashboardPage() {
    const { user } = useAuthUser();
    const navigate = useNavigate();
    const [createClubOpen, setCreateClubOpen] = useState(false);
    const [joinClubOpen, setJoinClubOpen] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['clubs', user.id],
        queryFn: ({ pageParam }) => clubsService.getMyClubs(pageParam),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.totalPages) {
                return lastPage.page + 1;
            }
            return undefined;
        }
    });

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        if (bottomRef.current) {
            observer.observe(bottomRef.current);
        }

        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const clubs = data?.pages.flatMap(page => page.clubs) ?? [];


    return (
        <div className="px-6 py-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1
                    className="text-3xl font-bold"
                    style={{ fontFamily: 'var(--font-serif)', color: 'var(--bk-text-primary)' }}
                >
                    My clubs
                </h1>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setJoinClubOpen(true)}
                        style={{ borderColor: 'var(--bk-accent)', color: 'var(--bk-accent)' }}
                    >
                        Join club
                    </Button>
                    <Button
                        onClick={() => setCreateClubOpen(true)}
                        style={{ background: 'var(--bk-accent)', color: 'var(--bk-bg)' }}
                    >
                        + Create club
                    </Button>
                </div>
            </div>

            {isLoading && (
                <div className="flex justify-center py-12">
                    <div
                        className="w-6 h-6 rounded-full border-2 animate-spin"
                        style={{ borderColor: 'var(--bk-accent)', borderTopColor: 'transparent' }}
                    />
                </div>
            )}

            {!isLoading && clubs?.length === 0 && (
                <div
                    className="rounded-xl p-12 text-center"
                    style={{ background: 'var(--bk-bg-card)', border: '1px solid var(--bk-border)' }}
                >
                    <p className="text-base mb-4" style={{ color: 'var(--bk-text-muted)' }}>
                        You haven't joined any clubs yet.
                    </p>
                    <Button
                        onClick={() => setCreateClubOpen(true)}
                        style={{ background: 'var(--bk-accent)', color: 'var(--bk-bg)' }}
                    >
                        Create your first club
                    </Button>
                </div>
            )}

            {!isLoading && clubs && clubs.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {clubs.map((club) => ( // TODO: Make this a component
                            <div
                                key={club.id}
                                onClick={() => navigate(`/clubs/${club.id}`)}
                                className="rounded-xl p-5 cursor-pointer transition-all duration-200 flex flex-col gap-3"
                                style={{ background: 'var(--bk-bg-card)', border: '1px solid var(--bk-border)' }}
                                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 24px rgba(87,113,70,0.15)'}
                                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                            >
                                <div className="flex items-start justify-between">
                                    <h3
                                        className="text-2xl font-medium"
                                        style={{ fontFamily: 'var(--font-serif)', color: 'var(--bk-text-primary)' }}
                                    >
                                        {club.name}
                                    </h3>
                                    {club.clubMembers?.[0]?.role && (
                                        <span
                                            className="text-sm font-semibold px-2 py-1 rounded-full flex-shrink-0 ml-2"
                                            style={{
                                                background: club.clubMembers[0].role === 'ADMIN' ? 'var(--bk-accent)' : 'var(--bk-toggle-bg)',
                                                color: club.clubMembers[0].role === 'ADMIN' ? 'var(--bk-bg)' : 'var(--bk-accent)',
                                            }}
                                        >
                                            {club.clubMembers[0].role === 'ADMIN' ? 'Admin' : 'Member'}
                                        </span>
                                    )}
                                </div>

                                <p
                                    className="text-base line-clamp-2 flex-1"
                                    style={{ color: 'var(--bk-text-muted)' }}
                                >
                                    {club.description}
                                </p>

                                <div
                                    className="flex items-center justify-between pt-3"
                                    style={{ borderTop: '0.5px solid var(--bk-border)' }}
                                >
                                    <p className="text-base" style={{ color: 'var(--bk-text-muted)' }}>
                                        {club._count?.clubMembers ?? 0} members
                                    </p>
                                    <span className="text-base font-medium" style={{ color: 'var(--bk-accent)' }}>
                                        View →
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Trigger infinite scroll */}
                    <div ref={bottomRef} className="py-4 flex justify-center">
                        {isFetchingNextPage && (
                            <div
                                className="w-5 h-5 rounded-full border-2 animate-spin"
                                style={{ borderColor: 'var(--bk-accent)', borderTopColor: 'transparent' }}
                            />
                        )}
                    </div>
                </>
            )}

            <CreateClubModal
                open={createClubOpen}
                onClose={() => setCreateClubOpen(false)}
            />
            <JoinClubModal
                open={joinClubOpen}
                onClose={() => setJoinClubOpen(false)}
            />
        </div>
    );
}

export default DashboardPage;