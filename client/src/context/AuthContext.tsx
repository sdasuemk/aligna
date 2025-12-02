'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import api from '@/api';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    role: 'CLIENT' | 'PROVIDER';
    type?: 'INDIVIDUAL' | 'ORGANIZATION';
    profile?: any;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string, user: User, redirectPath?: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const token = Cookies.get('token');
            if (token) {
                try {
                    const { data } = await api.get('/users/profile');
                    setUser({ ...data, id: data._id || data.id });
                } catch (error) {
                    Cookies.remove('token');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = (token: string, userData: User, redirectPath?: string) => {
        Cookies.set('token', token, { expires: 7 });
        setUser(userData);
        if (redirectPath) {
            router.push(redirectPath);
        } else {
            router.push(userData.role === 'PROVIDER' ? '/dashboard' : '/services');
        }
    };

    const logout = () => {
        Cookies.remove('token');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
