import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { clubsService } from '@/lib/services/clubs.service';
import { getErrors } from '@/lib/services/handleError';
import { toast } from 'sonner';

interface CreateClubModalProps {
    open: boolean;
    onClose: () => void;
}

function CreateClubModal({ open, onClose }: CreateClubModalProps) {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    const createClubMutation = useMutation({
        mutationFn: () => clubsService.createClub({ name, description, isPublic }),
        onSuccess: (data) => {
            toast.success('Club created!');
            onClose();
            navigate(`/clubs/${data.id}`);
        },
        onError: (error) => {
            toast.error(getErrors(error)[0]);
        }
    });

    const handleSubmit = () => {
        if (!name.trim()) {
            toast.error('Club name is required');
            return;
        }
        if (!description.trim()) {
            toast.error('Description is required');
            return;
        }
        createClubMutation.mutate();
    };

    const handleClose = () => {
        setName('');
        setDescription('');
        setIsPublic(true);
        createClubMutation.reset();
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
                        Create a book club
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 mt-2">
                    <div className="flex flex-col gap-1">
                        <label
                            className="text-[12px]"
                            style={{ color: 'var(--bk-text-secondary)' }}
                        >
                            Club name
                        </label>
                        <Input
                            placeholder="e.g. Sci-Fi Readers"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label
                            className="text-[12px]"
                            style={{ color: 'var(--bk-text-secondary)' }}
                        >
                            Description
                        </label>
                        <textarea
                            placeholder="What is your club about?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full text-[14px] px-3 py-2 rounded-lg resize-none outline-none"
                            style={{
                                background: 'var(--bk-bg)',
                                border: '1px solid var(--bk-border)',
                                color: 'var(--bk-text-primary)',
                            }}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p
                                className="text-[13px] font-medium"
                                style={{ color: 'var(--bk-text-primary)' }}
                            >
                                Public club
                            </p>
                            <p
                                className="text-[11px]"
                                style={{ color: 'var(--bk-text-muted)' }}
                            >
                                Anyone can see and join this club
                            </p>
                        </div>
                        <button
                            onClick={() => setIsPublic(!isPublic)}
                            className="relative flex rounded-full p-[3px] flex-shrink-0 transition-colors duration-200"
                            style={{
                                background: isPublic ? 'var(--bk-accent)' : 'var(--bk-border)',
                                width: '44px',
                                height: '24px',
                            }}
                        >
                            <div
                                className="absolute top-[3px] rounded-full transition-transform duration-200"
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    background: 'white',
                                    transform: isPublic ? 'translateX(20px)' : 'translateX(0px)',
                                    left: '3px',
                                }}
                            />
                        </button>
                    </div>

                    <div className="flex gap-2 mt-2">
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
                            onClick={handleSubmit}
                            disabled={createClubMutation.isPending}
                            style={{ background: 'var(--bk-accent)', color: 'var(--bk-bg)' }}
                        >
                            {createClubMutation.isPending ? 'Creating...' : 'Create club'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default CreateClubModal;