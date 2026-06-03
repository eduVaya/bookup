import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { clubsService } from '@/lib/services/clubs.service';
import { getErrors } from '@/lib/services/handleError';
import { toast } from 'sonner';

interface JoinClubModalProps {
    open: boolean;
    onClose: () => void;
}

function JoinClubModal({ open, onClose }: JoinClubModalProps) {
    const [inviteCode, setInviteCode] = useState('');
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const joinMutation = useMutation({
        mutationFn: () => clubsService.joinClub(inviteCode.trim()),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['myClubs'] });
            toast.success('Joined club!');
            onClose();
            navigate(`/clubs/${data.id}`);
        },
        onError: (error) => {
            toast.error(getErrors(error)[0]);
        }
    });

    const handleClose = () => {
        setInviteCode('');
        joinMutation.reset();
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent
                style={{ background: 'var(--bk-bg-card)', border: '1px solid var(--bk-border)' }}
            >
                <DialogHeader>
                    <DialogTitle
                        style={{ fontFamily: 'var(--font-serif)', color: 'var(--bk-text-primary)' }}
                    >
                        Join a club
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 mt-2">
                    <div className="flex flex-col gap-1">
                        <label
                            className="text-[12px]"
                            style={{ color: 'var(--bk-text-secondary)' }}
                        >
                            Invite code
                        </label>
                        <Input
                            placeholder="Paste invite code here..."
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && joinMutation.mutate()}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleClose}
                            style={{ borderColor: 'var(--bk-border)', color: 'var(--bk-text-secondary)' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 font-semibold"
                            onClick={() => joinMutation.mutate()}
                            disabled={joinMutation.isPending || !inviteCode.trim()}
                            style={{ background: 'var(--bk-accent)', color: 'var(--bk-bg)' }}
                        >
                            {joinMutation.isPending ? 'Joining...' : 'Join club'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default JoinClubModal;