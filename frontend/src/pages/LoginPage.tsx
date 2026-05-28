import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/lib/services/auth.service';
import { getErrors } from '@/lib/services/handleError';

type Tab = 'signin' | 'register';

function LoginPage() {
    const [tab, setTab] = useState<Tab>('signin');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const mutation = useMutation({
        mutationFn: () => tab === 'signin' ? authService.login({ email, password }) : authService.register({ email, password, name }),
        onSuccess: (data) => {
            login(data.token, data.user);
            navigate('/');
        }
    });
    const { login } = useAuth();
    const navigate = useNavigate();

    const clearForm = () => {
        setName('');
        setEmail('');
        setPassword('');
    };

    const handleTabChange = (newTab: Tab) => {
        setTab(newTab);
        clearForm();
        mutation.reset();
    };

    const handleSubmit = () => {
        mutation.mutate();
    };

    const errors = getErrors(mutation.error);

    return (
        <div className="flex items-center justify-center px-4 py-12">
            <div
                className="w-full max-w-[340px] rounded-2xl p-6"
                style={{ background: 'var(--bk-bg-card)', border: '1px solid var(--bk-border)' }}
            >
                <div
                    className="flex mb-6"
                    style={{ borderBottom: '1px solid var(--bk-border)' }}
                >
                    {(['signin', 'register'] as Tab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className="text-[13px] px-4 py-2 font-medium transition-colors"
                            style={{
                                color: tab === tab ? 'var(--bk-accent)' : 'var(--bk-text-muted)',
                                borderBottom: tab === tab ? `2px solid var(--bk-accent)` : '2px solid transparent',
                            }}
                        >
                            {tab === 'signin' ? 'Sign in' : 'Register'}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col gap-3">
                    {tab === 'register' && (
                        <div className="flex flex-col gap-1">
                            <label
                                className="text-[12px]"
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
                    )}

                    <div className="flex flex-col gap-1">
                        <label
                            className="text-[12px]"
                            style={{ color: 'var(--bk-text-secondary)' }}
                        >
                            Email
                        </label>
                        <Input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label
                            className="text-[12px]"
                            style={{ color: 'var(--bk-text-secondary)' }}
                        >
                            Password
                        </label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {errors.length > 0 && (
                        <div
                            className="rounded-lg px-3 py-2"
                            style={{ background: '#FEE8E8', border: '1px solid #FCCACA' }}
                        >
                            {errors.map((error) => (
                                <p className="text-[12px]" style={{ color: '#C53030' }}>
                                    {error}
                                </p>
                            ))}
                        </div>
                    )}

                    <Button
                        onClick={handleSubmit}
                        disabled={mutation.isPending}
                        className="w-full mt-1 font-semibold"
                        style={{ background: 'var(--bk-accent)', color: 'var(--bk-bg)' }}
                    >
                        {mutation.isPending
                            ? 'Loading...'
                            : tab === 'signin' ? 'Sign in' : 'Create account'}
                    </Button>

                    <p
                        className="text-center text-[12px] mt-1"
                        style={{ color: 'var(--bk-text-muted)' }}
                    >
                        {tab === 'signin' ? 'No account? ' : 'Have an account? '}
                        <span
                            onClick={() => handleTabChange(tab === 'signin' ? 'register' : 'signin')}
                            className="cursor-pointer font-medium"
                            style={{ color: 'var(--bk-accent)' }}
                        >
                            {tab === 'signin' ? 'Register' : 'Sign in'}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;