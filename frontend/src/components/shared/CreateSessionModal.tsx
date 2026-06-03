import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { sessionsService } from '@/lib/services/sessions.service';
import { getErrors } from '@/lib/services/handleError';
import { toast } from 'sonner';
import type { Book } from '@/types';

interface CreateSessionModalProps {
    open: boolean;
    onClose: () => void;
    clubId: number;
    books: Book[];
    existingSession?: {
        id: number;
        title: string;
        scheduledAt: string;
        location: string | null;
        bookId: number;
    };
}

function CreateSessionModal({ open, onClose, clubId, books, existingSession }: CreateSessionModalProps) {

    const queryClient = useQueryClient();
    const [title, setTitle] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [location, setLocation] = useState('');
    const [bookId, setBookId] = useState<number | null>(null);
    useEffect(() => {
        if (existingSession) {
            console.log(existingSession);
            setTitle(existingSession.title);
            setScheduledAt(existingSession.scheduledAt.slice(0, 16));
            setLocation(existingSession.location ?? '');
            setBookId(existingSession.bookId);
        } else {
            setTitle('');
            setScheduledAt('');
            setLocation('');
            setBookId(null);
        }
    }, [existingSession]);

    const eligibleBooks = books.filter(b => b.status === 'READING' || b.status === 'COMPLETED');

    const createMutation = useMutation({
        mutationFn: () => sessionsService.createSession(clubId, {
            title,
            scheduledAt: new Date(scheduledAt).toISOString(),
            location: location || undefined,
            bookId: bookId!,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clubSessions', clubId] });
            toast.success('Session created!');
            handleClose();
        },
        onError: (error) => {
            toast.error(getErrors(error)[0]);
        }
    });
    const updateMutation = useMutation({
        mutationFn: () => sessionsService.updateSession(clubId, existingSession!.id, {
            title,
            scheduledAt: new Date(scheduledAt).toISOString(),
            location: location || undefined,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clubSessions', clubId] });
            toast.success('Session updated!');
            handleClose();
        },
        onError: (error) => {
            toast.error(getErrors(error)[0]);
        }
    });

    const handleSubmit = () => {
        if (!title.trim()) {
            toast.error('Title is required');
            return;
        }
        if (!scheduledAt) {
            toast.error('Date is required');
            return;
        }
        if (!bookId) {
            toast.error('Please select a book');
            return;
        }
        if (existingSession) {
            updateMutation.mutate();
        } else {
            createMutation.mutate();
        }
    };

    const handleClose = () => {
        setTitle('');
        setScheduledAt('');
        setLocation('');
        setBookId(null);
        createMutation.reset();
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
                        {existingSession ? 'Edit session' : 'Schedule a session'}

                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 mt-2">
                    <div className="flex flex-col gap-1">
                        <label
                            className="text-[12px]"
                            style={{ color: 'var(--bk-text-secondary)' }}
                        >
                            Title
                        </label>
                        <Input
                            placeholder="e.g. Chapters 1-5 discussion"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label
                            className="text-[12px]"
                            style={{ color: 'var(--bk-text-secondary)' }}
                        >
                            Book
                        </label>
                        <select
                            value={bookId ?? ''}
                            onChange={(e) => setBookId(Number(e.target.value))}
                            className="w-full text-[14px] px-3 py-2 rounded-lg outline-none"
                            style={{
                                background: 'var(--bk-bg)',
                                border: '1px solid var(--bk-border)',
                                color: bookId ? 'var(--bk-text-primary)' : 'var(--bk-text-muted)',
                            }}
                        >
                            <option value="">Select a book...</option>
                            {eligibleBooks.map(book => (
                                <option key={book.id} value={book.id}>
                                    {book.title} ({book.status})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label
                            className="text-[12px]"
                            style={{ color: 'var(--bk-text-secondary)' }}
                        >
                            Date & Time
                        </label>
                        <Input
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label
                            className="text-[12px]"
                            style={{ color: 'var(--bk-text-secondary)' }}
                        >
                            Location <span style={{ color: 'var(--bk-text-muted)' }}>(optional)</span>
                        </label>
                        <Input
                            placeholder="e.g. Link or Place"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
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
                            disabled={createMutation.isPending}
                            style={{ background: 'var(--bk-accent)', color: 'var(--bk-bg)' }}
                        >
                            {createMutation.isPending || updateMutation.isPending
                                ? 'Saving...'
                                : existingSession ? 'Save changes' : 'Create session'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default CreateSessionModal;