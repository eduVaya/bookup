import { useState, useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { clubsService } from '@/lib/services/clubs.service';
import ClubCard from '@/components/shared/ClubCard';
import { Input } from '@/components/ui/input';

function HomePage() {
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);

    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['clubs', query],
        queryFn: ({ pageParam }) => clubsService.getPublicClubs(query || undefined, pageParam),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.totalPages) {
                return lastPage.page + 1;
            }
            return undefined;
        },
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

    const handleSearch = () => {
        setQuery(search);
    };


    const clubs = data?.pages.flatMap(page => page.clubs) ?? [];
    return (
        <div className="px-4 py-5 max-w-5xl mx-auto">
            <div className="mb-6">
                <h1
                    className="text-2xl md:text-3xl font-bold mb-1 leading-tight"
                    style={{ fontFamily: 'var(--font-serif)', color: 'var(--bk-text-primary)' }}
                >
                    Discover <em style={{ color: 'var(--bk-accent)' }}>book clubs</em> you'll love
                </h1>
                <p className="text-sm md:text-base mb-4" style={{ color: 'var(--bk-text-muted)' }}>
                    Join a community, vote for the next book, and share your thoughts.
                </p>

                <div
                    className="flex overflow-hidden rounded-xl"
                    style={{ border: '1px solid var(--bk-border)', background: 'var(--bk-bg-card)' }}
                >
                    <Input
                        type="text"
                        placeholder="Search clubs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <button
                        onClick={handleSearch}
                        className="px-4 text-sm font-semibold shrink-0"
                        style={{ background: 'var(--bk-accent)', color: 'var(--bk-bg)' }}
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Feed header */}
            <div className="flex items-center justify-between mb-3">
                <h2
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--bk-text-muted)' }}
                >
                    Public clubs
                </h2>
            </div>

            {/* initial Loading */}
            {isLoading && (
                <div className="flex justify-center py-12">
                    <div
                        className="w-6 h-6 rounded-full border-2 animate-spin"
                        style={{ borderColor: 'var(--bk-accent)', borderTopColor: 'transparent' }}
                    />
                </div>
            )}

            {/* Clubs */}
            {!isLoading && (
                <>
                    {clubs.length === 0 ? (
                        <p
                            className="text-center py-12 text-sm"
                            style={{ color: 'var(--bk-text-muted)' }}
                        >
                            No clubs found.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {clubs.map((club) => (
                                <ClubCard key={club.id} club={club} />
                            ))}
                        </div>
                    )}

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
        </div>
    );
}

export default HomePage;