import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clubsService } from '@/lib/services/clubs.service';
import ClubCard from '@/components/shared/ClubCard';
import { Input } from '@/components/ui/input';

function HomePage() {
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');

    const { data: clubs, isLoading } = useQuery({
        queryKey: ['clubs', query],
        queryFn: () => clubsService.getPublicClubs(query || undefined),
    });

    const handleSearch = () => {
        setQuery(search);
    };

    return (
        <div className="px-4 py-5 max-w-4xl mx-auto">
            {/* Hero */}
            <div className="mb-6">
                <h1
                    className="text-2xl font-bold mb-1 leading-tight"
                    style={{ fontFamily: 'var(--font-serif)', color: 'var(--bk-text-primary)' }}
                >
                    Discover <em style={{ color: 'var(--bk-accent)' }}>book clubs</em> you'll love
                </h1>
                <p
                    className="text-base mb-4"
                    style={{ color: 'var(--bk-text-muted)' }}
                >
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
                        className="px-4 text-base font-semibold shrink-0"
                        onClick={handleSearch}
                        style={{ background: 'var(--bk-accent)', color: 'var(--bk-bg)' }}
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Feed header */}
            <div className="flex items-center justify-between mb-3">
                <h2
                    className="text-base font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--bk-text-muted)' }}
                >
                    Public clubs
                </h2>
                {clubs && (
                    <span
                        className="text-base"
                        style={{ color: 'var(--bk-text-muted)' }}
                    >
                        {clubs.length} clubs
                    </span>
                )}
            </div>

            {isLoading && (
                <div className="flex justify-center py-12">
                    <div
                        className="w-6 h-6 rounded-full border-2 animate-spin"
                        style={{ borderColor: 'var(--bk-accent)', borderTopColor: 'transparent' }}
                    />
                </div>
            )}

            {!isLoading && clubs && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {clubs.length === 0 ? (
                        <p
                            className="text-center py-12 text-base"
                            style={{ color: 'var(--bk-text-muted)' }}
                        >
                            No clubs found.
                        </p>
                    ) : (
                        clubs.map((club) => (
                            <ClubCard key={club.id} club={club} />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default HomePage;