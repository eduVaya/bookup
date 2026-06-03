import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { booksService } from '@/lib/services/books.service';
import { getErrors } from '@/lib/services/handleError';
import { toast } from 'sonner';

interface ProposeBookModalProps {
    open: boolean;
    onClose: () => void;
    clubId: number;
}

function ProposeBookModal({ open, onClose, clubId }: ProposeBookModalProps) {
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const queryClient = useQueryClient();

    const { data: results, isLoading: isSearching } = useQuery({
        queryKey: ['bookSearch', query],
        queryFn: () => booksService.searchBooks(query),
        enabled: query.length > 0,
    });

    const proposeMutation = useMutation({
        mutationFn: (book: { googleBooksId: string; title: string; author: string; coverUrl: string | null }) =>
            booksService.proposeBook(clubId, {
                googleBooksId: book.googleBooksId,
                title: book.title,
                author: book.author,
                coverUrl: book.coverUrl ?? undefined,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clubBooks', clubId] });
            toast.success('Book proposed!');
            handleClose();
        },
        onError: (error) => {
            toast.error(getErrors(error)[0]);
        }
    });

    const handleSearch = () => {
        if (search.trim()) {
            setQuery(search.trim());
        }
    };

    const handleClose = () => {
        setSearch('');
        setQuery('');
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
                        Propose a book
                    </DialogTitle>
                </DialogHeader>

                {/* Search */}
                <div
                    className="flex overflow-hidden rounded-xl"
                    style={{ border: '1px solid var(--bk-border)' }}
                >
                    <Input
                        placeholder="Search by title or author..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="border-none focus-visible:ring-0"
                    />
                    <button
                        onClick={handleSearch}
                        className="px-4 text-[13px] font-semibold flex-shrink-0"
                        style={{ background: 'var(--bk-accent)', color: 'var(--bk-bg)' }}
                    >
                        Search
                    </button>
                </div>

                {/* Results */}
                <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto mt-1">
                    {isSearching && (
                        <div className="flex justify-center py-6">
                            <div
                                className="w-5 h-5 rounded-full border-2 animate-spin"
                                style={{ borderColor: 'var(--bk-accent)', borderTopColor: 'transparent' }}
                            />
                        </div>
                    )}

                    {!isSearching && results?.length === 0 && (
                        <p
                            className="text-center py-6 text-[13px]"
                            style={{ color: 'var(--bk-text-muted)' }}
                        >
                            No books found. Try a different search.
                        </p>
                    )}

                    {!isSearching && results?.map((book) => (
                        <div
                            key={book.googleBooksId}
                            onClick={() => proposeMutation.mutate(book)}
                            className="flex gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                            style={{
                                background: 'var(--bk-bg)',
                                border: '1px solid var(--bk-border)',
                                opacity: proposeMutation.isPending ? 0.6 : 1,
                            }}
                        >
                            {book.coverUrl ? (
                                <img
                                    src={book.coverUrl}
                                    alt={book.title}
                                    className="w-[40px] h-[58px] rounded object-cover flex-shrink-0"
                                />
                            ) : (
                                <div
                                    className="w-[40px] h-[58px] rounded flex-shrink-0"
                                    style={{ background: 'var(--bk-border)' }}
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <p
                                    className="text-[13px] font-medium truncate"
                                    style={{ color: 'var(--bk-text-primary)' }}
                                >
                                    {book.title}
                                </p>
                                <p
                                    className="text-[11px]"
                                    style={{ color: 'var(--bk-text-muted)' }}
                                >
                                    {book.author}
                                </p>
                            </div>
                            <span
                                className="text-[11px] font-semibold px-2 py-1 rounded-lg self-center flex-shrink-0"
                                style={{ border: '1px solid var(--bk-accent)', color: 'var(--bk-accent)' }}
                            >
                                Propose
                            </span>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default ProposeBookModal;