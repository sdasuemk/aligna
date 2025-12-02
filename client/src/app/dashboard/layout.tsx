'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    LayoutDashboard, Briefcase, Calendar, ClipboardList, BarChart3, Users, Settings,
    ChevronRight, ChevronLeft, Search, Bell, LogOut, HelpCircle, Menu, Layers
} from 'lucide-react';

import GlassIcon from '@/components/ui/GlassIcon';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white' }}>Loading...</div>;
    }

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: <GlassIcon icon={LayoutDashboard} size={15} /> },
        { href: '/dashboard/services', label: 'Services', icon: <GlassIcon icon={Briefcase} size={15} /> },
        { href: '/dashboard/calendar', label: 'Calendar', icon: <GlassIcon icon={Calendar} size={15} /> },
        { href: '/dashboard/appointments', label: 'Appointments', icon: <GlassIcon icon={ClipboardList} size={15} /> },
        { href: '/dashboard/analytics', label: 'Analytics', icon: <GlassIcon icon={BarChart3} size={15} /> },
        { href: '/dashboard/clients', label: 'Clients', icon: <GlassIcon icon={Users} size={15} /> },
        { href: '/dashboard/settings', label: 'Settings', icon: <GlassIcon icon={Settings} size={15} /> },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--dark-bg)' }}>
            {/* Top Navigation Bar */}
            <header style={{
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
                {/* Left: Brand / Logo */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '240px', textDecoration: 'none' }}>
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
                        backgroundClip: 'text',
                        display: 'block'
                    }}>
                        Aligna
                    </span>
                </Link>

                {/* Right Side: Search + Actions + Profile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, justifyContent: 'flex-end' }}>

                    {/* Search Bar - Small and One Sided */}
                    <div style={{ position: 'relative', width: '250px', marginRight: '1rem' }}>
                        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--dark-text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="input-dark"
                            style={{
                                width: '100%',
                                paddingLeft: '2.5rem',
                                paddingRight: '1rem',
                                paddingTop: '0.5rem',
                                paddingBottom: '0.5rem',
                                background: 'rgba(30, 41, 59, 0.4)',
                                border: '1px solid rgba(148, 163, 184, 0.1)',
                                borderRadius: '9999px',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>

                    <div style={{ width: '1px', height: '24px', background: 'var(--dark-border)', margin: '0 0.25rem' }} />

                    <button className="btn btn-ghost" style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--dark-text-muted)' }} title="Help & Support">
                        <HelpCircle size={20} />
                    </button>
                    <button className="btn btn-ghost" style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--dark-text-muted)', position: 'relative' }} title="Notifications">
                        <Bell size={20} />
                        <span style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            width: '8px',
                            height: '8px',
                            background: 'var(--brand-primary)',
                            borderRadius: '50%',
                            boxShadow: '0 0 8px var(--brand-primary)'
                        }} />
                    </button>

                    <div style={{ width: '1px', height: '24px', background: 'var(--dark-border)', margin: '0 0.25rem' }} />

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
                            {user?.profile?.name?.charAt(0) || 'P'}
                        </div>
                        <span style={{ fontWeight: '500' }}>{user?.profile?.name || 'Provider'}</span>
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
                </div>
            </header >

            <div style={{ display: 'flex', paddingTop: '70px', minHeight: '100vh' }}>
                {/* Collapsible Sidebar */}
                <aside style={{
                    width: isCollapsed ? '70px' : '240px',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)', // More transparent
                    backdropFilter: 'blur(12px)',
                    borderRight: '1px solid rgba(148, 163, 184, 0.1)',
                    color: 'var(--dark-text-main)',
                    position: 'fixed',
                    top: '70px',
                    bottom: 0,
                    left: 0,
                    transition: 'width 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 90
                }}>
                    {/* Toggle Button */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        style={{
                            position: 'absolute',
                            right: '-12px',
                            top: '20px',
                            background: 'var(--brand-primary)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white',
                            zIndex: 60,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                    >
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>

                    {/* Navigation */}
                    <nav style={{ flex: 1, padding: '1.5rem 0', overflowY: 'auto' }}>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsCollapsed(true)} // Auto-collapse on click
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: isCollapsed ? '0.75rem 0' : '0.75rem 1.5rem',
                                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                                        color: isActive ? 'white' : 'var(--dark-text-muted)',
                                        backgroundColor: isActive ? 'rgba(129, 140, 248, 0.1)' : 'transparent',
                                        borderLeft: isActive && !isCollapsed ? '3px solid var(--brand-primary)' : '3px solid transparent',
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: isActive ? '600' : '400',
                                        transition: 'all 0.2s',
                                        position: 'relative',
                                        marginBottom: '0.25rem'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'rgba(148, 163, 184, 0.05)';
                                            e.currentTarget.style.color = 'white';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = 'var(--dark-text-muted)';
                                        }
                                    }}
                                    title={isCollapsed ? item.label : ''}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', color: isActive ? 'var(--brand-primary)' : 'inherit' }}>
                                        {item.icon}
                                    </span>
                                    {!isCollapsed && (
                                        <span style={{ whiteSpace: 'nowrap', opacity: isCollapsed ? 0 : 1, transition: 'opacity 0.2s' }}>
                                            {item.label}
                                        </span>
                                    )}
                                    {isActive && isCollapsed && (
                                        <div style={{
                                            position: 'absolute',
                                            left: 0,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: '3px',
                                            height: '24px',
                                            background: 'var(--brand-primary)',
                                            borderTopRightRadius: '4px',
                                            borderBottomRightRadius: '4px'
                                        }} />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Actions */}
                    <div style={{ padding: '1rem', borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
                        <button
                            onClick={logout}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: isCollapsed ? 'center' : 'flex-start',
                                gap: '0.75rem',
                                padding: '0.75rem',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--error)',
                                cursor: 'pointer',
                                borderRadius: '0.5rem',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            title="Logout"
                        >
                            <LogOut size={18} />
                            {!isCollapsed && <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Logout</span>}
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main style={{
                    flex: 1,
                    marginLeft: isCollapsed ? '70px' : '240px',
                    width: `calc(100% - ${isCollapsed ? '70px' : '240px'})`,
                    transition: 'margin-left 0.3s ease, width 0.3s ease',
                    minHeight: 'calc(100vh - 70px)',
                    overflowX: 'hidden',
                    padding: '1.5rem'
                }}>
                    {children}
                </main>
            </div>
        </div >
    );
}
