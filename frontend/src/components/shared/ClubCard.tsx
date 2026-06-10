import { useNavigate } from 'react-router-dom';
import type { Club } from '@/types';

interface ClubCardProps {
    club: Club;
}

function ClubCard({ club }: ClubCardProps) {
    const navigate = useNavigate();

    return (
        <div
            className="rounded-xl overflow-hidden cursor-pointer"
            onClick={() => navigate(`/clubs/${club.id}`)}
            style={{ background: 'var(--bk-bg-card)', border: '1px solid var(--bk-border)' }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 24px rgba(87,113,70,0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
        >
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <span
                        className="text-sm font-semibold px-2 py-1 rounded-full"
                        style={{ background: 'var(--bk-toggle-bg)', color: 'var(--bk-accent)' }}
                    >
                        {club._count?.clubMembers ?? 0} members
                    </span>
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: 'var(--bk-accent)' }}
                    />
                </div>

                <h3
                    className="text-2xl font-medium mb-1"
                    style={{ fontFamily: 'var(--font-serif)', color: 'var(--bk-text-primary)' }}
                >
                    {club.name}
                </h3>

                <p
                    className="text-base mb-3 line-clamp-2"
                    style={{ color: 'var(--bk-text-muted)' }}
                >
                    {club.description}
                </p>

                <div
                    className="flex items-center justify-between pt-3"
                    style={{ borderTop: '0.5px solid var(--bk-border)' }}
                >
                    <p
                        className="text-base"
                        style={{ color: 'var(--bk-text-muted)' }}
                    >
                        By {club.creator.name}
                    </p>
                    <span
                        className="text-base font-semibold"
                        style={{ color: 'var(--bk-accent)' }}
                    >
                        View →
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ClubCard;