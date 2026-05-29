import type { Club } from '@/types';

interface ClubCardProps {
    club: Club;
}

function ClubCard({ club }: ClubCardProps) {
    return (
        <div
            className="rounded-xl overflow-hidden"
            style={{ background: 'var(--bk-bg-card)', border: '1px solid var(--bk-border)' }}
        >
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <span
                        className="text-[11px] font-semibold px-2 py-1 rounded-full"
                        style={{
                            background: 'var(--bk-toggle-bg)',
                            color: 'var(--bk-accent)',
                        }}
                    >
                        {club._count?.clubMembers ?? 0} members
                    </span>
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: 'var(--bk-accent)' }}
                    />
                </div>

                <h3
                    className="text-[16px] font-medium mb-1"
                    style={{ fontFamily: 'var(--font-serif)', color: 'var(--bk-text-primary)' }}
                >
                    {club.name}
                </h3>

                <p
                    className="text-[12px] mb-3 line-clamp-2"
                    style={{ color: 'var(--bk-text-muted)' }}
                >
                    {club.description}
                </p>

                <div
                    className="flex items-center justify-between pt-3"
                    style={{ borderTop: '0.5px solid var(--bk-border)' }}
                >
                    <div>
                        <p
                            className="text-[9px] uppercase tracking-wider mb-1"
                            style={{ color: 'var(--bk-text-muted)' }}
                        >
                            Created by
                        </p>
                        <p
                            className="text-[12px] font-medium"
                            style={{ color: 'var(--bk-text-primary)' }}
                        >
                            {club.creator.name}
                        </p>
                    </div>

                    <button
                        className="text-[12px] font-semibold px-4 py-2 rounded-lg transition-colors"
                        style={{
                            border: '1px solid var(--bk-accent)',
                            color: 'var(--bk-accent)',
                            background: 'transparent',
                        }}
                    >
                        Join
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ClubCard;