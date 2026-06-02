import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, useAuthUser } from "@/context/AuthContext";
import { getErrors } from "@/lib/services/handleError";
import { userService } from "@/lib/services/user.service";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { uploadAvatar } from '@/lib/cloudinary';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { useNavigate } from "react-router-dom";

function ProfilePage() {
    const navigate = useNavigate()
    const { user, updateUser, logout } = useAuthUser();

    const [name, setName] = useState(user.name);
    const [avatar, setAvatar] = useState(user.avatar);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const url = await uploadAvatar(file);
            await userService.editUser(user.id, { avatar: url });
            updateUser({ avatar: url });
            setAvatar(url);
            toast.success('Avatar updated');
        } catch {
            toast.error('Failed to upload avatar');
        }
    };
    const editUserMutation = useMutation({
        mutationFn: () => userService.editUser(user.id, { name }),
        onSuccess: () => {
            updateUser({ name: name });
            toast.success('Profile updated successfully');
        },
        onError: (error) => {
            const errors = getErrors(error);
            toast.error(errors[0]);
        }
    });
    const deleteAccountMutation = useMutation({
        mutationFn: () => userService.deleteAccount(user.id),
        onSuccess: () => {
            logout();
            navigate('/');
        },
        onError: (error) => {
            toast.error(getErrors(error)[0]);
        }
    });
    const handleSaveProfile = () => {
        if (!name || name.trim() === '') {
            toast.error('Name cannot be empty');
            return;
        }

        if (name === user.name) {
            toast.info('No changes made');
            return;
        }
        editUserMutation.mutate();
    }

    const { data: stats, isLoading } = useQuery({
        queryKey: ['userStats', user.id],
        queryFn: () => userService.getUserStats(user.id)
    });

    return (
        <div className="flex flex-col items-center justify-center px-4 py-12 max-w-md mx-auto">
            <div className="flex flex-col items-center mb-6">
                <div
                    className="w-[80px] h-[80px] rounded-full flex items-center justify-center mb-3 relative cursor-pointer"
                    style={{ background: 'var(--bk-accent)' }}
                >
                    {avatar ? (
                        <img
                            src={avatar}
                            alt={user.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <h1
                            className="text-[28px] font-bold"
                            style={{ fontFamily: 'var(--font-serif)', color: 'var(--bk-bg)' }}
                        >
                            {user.name.charAt(0).toUpperCase()}
                        </h1>
                    )}
                    <div
                        className="absolute bottom-0 right-0 w-[24px] h-[24px] rounded-full flex items-center justify-center text-[11px]"
                        style={{ background: 'var(--bk-bg-card)', border: '1.5px solid var(--bk-border)' }}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="avatar-input"
                            onChange={handleAvatarChange}
                        />
                        <label
                            htmlFor="avatar-input"
                            className="absolute bottom-0 right-0 w-[24px] h-[24px] rounded-full flex items-center justify-center text-[11px] cursor-pointer"
                            style={{ background: 'var(--bk-bg-card)', border: '1.5px solid var(--bk-border)' }}
                        >
                            ✏️
                        </label>
                    </div>
                </div>
                <p
                    className="text-[18px] font-medium mb-1"
                    style={{ fontFamily: 'var(--font-serif)', color: 'var(--bk-text-primary)' }}
                >
                    {name}
                </p>
                <p
                    className="text-[12px]"
                    style={{ color: 'var(--bk-text-muted)' }}
                >
                    {user.email}
                </p>
            </div>

            <div
                className="flex w-full rounded-xl overflow-hidden mb-6"
                style={{ background: 'var(--bk-bg-card)', border: '1px solid var(--bk-border)' }}
            >
                {[
                    { value: isLoading ? '...' : stats?.clubs ?? 0, label: 'Clubs' },
                    { value: isLoading ? '...' : stats?.books ?? 0, label: 'Books' },
                    { value: isLoading ? '...' : stats?.reviews ?? 0, label: 'Reviews' },
                ].map((stat, index, arr) => (
                    <div
                        key={stat.label}
                        className="flex-1 flex flex-col items-center py-4"
                        style={{
                            borderRight: index < arr.length - 1 ? '1px solid var(--bk-border)' : 'none',
                            fontFamily: 'var(--font-serif)',
                        }}
                    >
                        <p
                            className="text-[20px] font-bold"
                            style={{ color: 'var(--bk-accent)' }}
                        >
                            {stat.value}
                        </p>
                        <p
                            className="text-[10px] uppercase tracking-wider"
                            style={{ color: 'var(--bk-text-muted)' }}
                        >
                            {stat.label}
                        </p>
                    </div>
                ))}
            </div>
            {/* Edit Profile */}
            <div className="w-full mb-4">
                <p
                    className="text-[11px] font-semibold uppercase tracking-wider mb-2"
                    style={{ color: 'var(--bk-text-muted)' }}
                >
                    Edit Profile
                </p>
                <div
                    className="rounded-xl p-4 flex flex-col gap-3"
                    style={{ background: 'var(--bk-bg-card)', border: '1px solid var(--bk-border)' }}
                >
                    <div className="flex flex-col gap-1">
                        <label
                            className="text-[11px]"
                            style={{ color: 'var(--bk-text-secondary)' }}
                        >
                            Name
                        </label>
                        <Input
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label
                            className="text-[11px]"
                            style={{ color: 'var(--bk-text-secondary)' }}
                        >
                            Email
                        </label>
                        <Input
                            type="email"
                            disabled
                            placeholder="your@email.com"
                            className="opacity-50 cursor-not-allowed"
                            value={user?.email}
                        />
                    </div>

                    <Button
                        className="w-full font-semibold"
                        style={{ background: 'var(--bk-accent)', color: 'var(--bk-bg)' }}
                        onClick={handleSaveProfile}
                    >
                        Save changes
                    </Button>
                </div>
            </div>
            {/* Account */}
            <div className="w-full">
                <p
                    className="text-[11px] font-semibold uppercase tracking-wider mb-2"
                    style={{ color: 'var(--bk-text-muted)' }}
                >
                    Account
                </p>
                <div
                    className="rounded-xl p-4"
                    style={{ background: 'var(--bk-bg-card)', border: '1px solid var(--bk-border)' }}
                >
                    <Button
                        variant="outline"
                        className="w-full font-semibold"
                        style={{ borderColor: '#C4A89A', color: '#8B5E52' }}
                        onClick={() => setDeleteDialogOpen(true)}
                    >
                        Delete account
                    </Button>
                </div>
            </div>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent style={{ background: 'var(--bk-bg-card)', border: '1px solid var(--bk-border)' }}>
                    <DialogHeader>
                        <DialogTitle
                            style={{ fontFamily: 'var(--font-serif)', color: 'var(--bk-text-primary)' }}
                        >
                            Delete account
                        </DialogTitle>
                        <DialogDescription style={{ color: 'var(--bk-text-muted)' }}>
                            Are you sure you want to delete your account? This action cannot be undone.
                            All your clubs, books and reviews will be permanently deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            style={{ borderColor: 'var(--bk-border)', color: 'var(--bk-text-secondary)' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => deleteAccountMutation.mutate()}
                            disabled={deleteAccountMutation.isPending}
                            style={{ background: '#8B5E52', color: '#fff', border: 'none' }}
                        >
                            {deleteAccountMutation.isPending ? 'Deleting...' : 'Yes, delete account'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}

export default ProfilePage;