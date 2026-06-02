import { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/types';
import { authService } from '@/lib/services/auth.service';

interface AuthContextType {
    user: User | null
    token: string | null
    login: (token: string, user: User) => void
    logout: () => void
    updateUser: (updates: Partial<User>) => void;
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const savedToken = localStorage.getItem('token')
        if (savedToken) {
            authService.me()
                .then((user) => {
                    setUser(user)
                    setToken(savedToken)
                })
                .catch(() => {
                    localStorage.removeItem('token')
                })
                .finally(() => {
                    setIsLoading(false)
                })
        } else {
            setIsLoading(false)
        }
    }, [])

    const login = (token: string, user: User) => {
        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);
    }

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    }

    const updateUser = (updates: Partial<User>) => {
        setUser((currentUser) => {
            if (!currentUser) return null;
            return { ...currentUser, ...updates };
        });
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function useAuthUser(): AuthContextType & { user: User } {
    const context = useContext(AuthContext);
    if (!context || !context.user) {
        throw new Error('useAuthUser must be used within an authenticated route');
    }
    return context as AuthContextType & { user: User };
}