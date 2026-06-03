import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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


    const { data: clubs, isLoading } = useQuery({
        queryKey: ['myClubs', user.id],
        queryFn: () => clubsService.getMyClubs(),
    });

    return (
        <div className="px-4 py-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1
                    className="text-[22px] font-bold"
                    style={{ fontFamily: 'var(--font-serif)', color: 'var(--bk-text-primary)' }}
                >
                    My clubs
                </h1>
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
                    className="rounded-xl p-8 text-center"
                    style={{ background: 'var(--bk-bg-card)', border: '1px solid var(--bk-border)' }}
                >
                    <p
                        className="text-[14px] mb-3"
                        style={{ color: 'var(--bk-text-muted)' }}
                    >
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
                <div className="flex flex-col gap-3">
                    {clubs.map((club) => (
                        <div
                            key={club.id}
                            onClick={() => navigate(`/clubs/${club.id}`)}
                            className="rounded-xl p-4 cursor-pointer flex items-center justify-between"
                            style={{ background: 'var(--bk-bg-card)', border: '1px solid var(--bk-border)' }}
                        >
                            <div>
                                <h3
                                    className="text-[16px] font-medium mb-1"
                                    style={{ fontFamily: 'var(--font-serif)', color: 'var(--bk-text-primary)' }}
                                >
                                    {club.name}
                                </h3>
                                <p
                                    className="text-[12px]"
                                    style={{ color: 'var(--bk-text-muted)' }}
                                >
                                    {club._count?.clubMembers ?? 0} members
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {club.clubMembers?.[0]?.role && (
                                    <span
                                        className="text-[11px] font-semibold px-2 py-1 rounded-full"
                                        style={{
                                            background: club.clubMembers[0].role === 'ADMIN' ? 'var(--bk-accent)' : 'var(--bk-toggle-bg)',
                                            color: club.clubMembers[0].role === 'ADMIN' ? 'var(--bk-bg)' : 'var(--bk-accent)',
                                        }}
                                    >
                                        {club.clubMembers[0].role === 'ADMIN' ? 'Admin' : 'Member'}
                                    </span>
                                )}
                                <span style={{ color: 'var(--bk-text-muted)' }}>›</span>
                            </div>
                        </div>
                    ))}
                </div>
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