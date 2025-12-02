'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, LogOut, LogIn, UserPlus, Bell, HelpCircle, Layers } from 'lucide-react';

import GlassIcon from '@/components/ui/GlassIcon';
import NotificationBell from '@/components/NotificationBell';

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    // Don't render global navbar on dashboard routes as they have their own layout
    if (pathname?.startsWith('/dashboard')) {
        return null;
    }

    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '70px',
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 0 15px rgba(6, 182, 212, 0.5)'
                }}>
                    <Layers size={20} strokeWidth={2.5} />
                </div>
                <span style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    Aligna
                </span>
            </Link>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {user ? (
                    <>
                        {user.role === 'PROVIDER' && (
                            <Link href="/dashboard" className="btn btn-ghost" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: 'var(--dark-text-muted)',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                transition: 'all 0.2s'
                            }} title="Go to Dashboard">
                                <GlassIcon icon={LayoutDashboard} size={16} />
                                <span>Dashboard</span>
                            </Link>
                        )}

                        <div style={{ width: '1px', height: '24px', background: 'rgba(148, 163, 184, 0.2)', margin: '0 0.25rem' }} />

                        {/* Notification & Help Icons */}
                        <button className="btn btn-ghost" style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--dark-text-muted)' }} title="Help & Support">
                            <HelpCircle size={20} />
                        </button>

                        <NotificationBell />

                        <div style={{ width: '1px', height: '24px', background: 'rgba(148, 163, 184, 0.2)', margin: '0 0.25rem' }} />

                        <Link href="/profile" className="btn btn-ghost" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            color: 'var(--dark-text-main)',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            transition: 'all 0.2s'
                        }} title="View Profile">
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'var(--gradient-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1rem',
                                border: '2px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                {user.profile?.name?.charAt(0) || 'U'}
                            </div>
                            <span style={{ fontWeight: '500' }}>{user.profile?.name || 'User'}</span>
                        </Link>

                        <button onClick={logout} className="btn btn-ghost" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: '#ef4444',
                            background: 'transparent',
                            border: 'none',
                            fontSize: '0.9rem',
                            padding: '0.5rem 1rem',
                            cursor: 'pointer',
                            borderRadius: '0.5rem',
                            transition: 'all 0.2s'
                        }} title="Logout">
                            <LogOut size={16} />
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/login" className="btn btn-ghost" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--dark-text-main)',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                            padding: '0.5rem 1.25rem',
                            borderRadius: '0.5rem',
                            transition: 'all 0.2s'
                        }}>
                            <LogIn size={16} />
                            <span>Login</span>
                        </Link>
                        <Link href="/register" className="btn btn-primary" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'var(--brand-primary)',
                            color: 'white',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                            padding: '0.6rem 1.5rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            boxShadow: '0 4px 6px rgba(99, 102, 241, 0.25)',
                            transition: 'all 0.2s'
                        }}>
                            <UserPlus size={16} />
                            <span>Get Started</span>
                        </Link>
                    </>
                )}
            </div>
        </nav >
    );
}
