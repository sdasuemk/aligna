'use client';

import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/api';
import GlassIcon from '@/components/ui/GlassIcon';
import { Calendar, Clock, Sparkles, IndianRupee, Gem, CalendarDays, CalendarRange, Sun, Zap, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

interface Stats {
    totalAppointments: number;
    todayAppointments: number;
    pendingAppointments: number;
    totalServices: number;
    weekRevenue: number;
    growth?: string;
}

interface Appointment {
    _id: string;
    startTime: string;
    endTime: string;
    status: string;
    serviceId: {
        name: string;
        price: number;
    };
    clientId: {
        profile: {
            name: string;
        };
        email: string;
    };
}

export default function DashboardPage() {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [stats, setStats] = useState<Stats>({
        totalAppointments: 0,
        todayAppointments: 0,
        pendingAppointments: 0,
        totalServices: 0,
        weekRevenue: 0
    });
    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.role === 'PROVIDER') {
            fetchDashboardData();
        }
    }, [user]);

    useEffect(() => {
        if (!socket) return;

        const handleUpdate = () => {
            console.log('Received appointment update on dashboard, refreshing...');
            fetchDashboardData();
        };

        socket.on('appointment_created', handleUpdate);
        socket.on('appointment_updated', handleUpdate);

        return () => {
            socket.off('appointment_created', handleUpdate);
            socket.off('appointment_updated', handleUpdate);
        };
    }, [socket, user]);

    const fetchDashboardData = async () => {
        try {
            // Fetch Stats
            const statsRes = await api.get('/dashboard/stats', {
                params: { providerId: user?.id }
            });
            const dashboardStats = statsRes.data;

            setStats({
                totalAppointments: 0, // Not used in UI currently or can be fetched if needed
                todayAppointments: dashboardStats.todayAppointments,
                pendingAppointments: dashboardStats.pendingAppointments,
                totalServices: dashboardStats.totalServices,
                weekRevenue: dashboardStats.weekRevenue,
                growth: dashboardStats.appointmentGrowth // Add this to state
            });

            // Fetch Upcoming Appointments (Keep existing logic or move to backend if needed)
            const appointmentsRes = await api.get('/appointments');
            const appointments = appointmentsRes.data;

            const upcoming = appointments
                .filter((apt: Appointment) => {
                    const aptDate = new Date(apt.startTime);
                    const sevenDaysLater = new Date();
                    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
                    return aptDate > new Date() && aptDate <= sevenDaysLater && apt.status !== 'CANCELLED';
                })
                .sort((a: Appointment, b: Appointment) =>
                    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                )
                .slice(0, 5);

            setUpcomingAppointments(upcoming);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return '#10b981';
            case 'PENDING': return '#f59e0b';
            case 'COMPLETED': return '#3b82f6';
            case 'CANCELLED': return '#ef4444';
            default: return '#6b7280';
        }
    };

    if (loading) {
        return (
            <div style={{
                background: 'var(--dark-bg)',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--dark-text-muted)'
            }}>
                Loading dashboard...
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{ marginBottom: '2.5rem' }}
            >
                <h1 className="heading-xl" style={{ marginBottom: '0.5rem', fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>
                        {(() => {
                            const hour = new Date().getHours();
                            if (hour < 5) return 'Magic in the Making, ';
                            if (hour < 12) return 'Rise & Shine, ';
                            if (hour < 18) return 'Conquer the Day, ';
                            return 'Magic in the Making, ';
                        })()}
                    </span>
                    <span className="text-gradient">
                        {user?.profile?.name?.split(' ')[0] || 'Provider'}
                    </span>
                    <motion.span
                        animate={{ rotate: [0, 10, 0], scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, repeatDelay: 3, duration: 2 }}
                        style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '0.25rem' }}
                    >
                        {(() => {
                            const hour = new Date().getHours();
                            if (hour < 5) return <Moon size={36} color="#c084fc" fill="#c084fc" style={{ filter: 'drop-shadow(0 0 8px rgba(192, 132, 252, 0.5))' }} />;
                            if (hour < 12) return <Sun size={36} color="#fbbf24" fill="#fbbf24" style={{ filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))' }} />;
                            if (hour < 18) return <Zap size={36} color="#f59e0b" fill="#f59e0b" style={{ filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.5))' }} />;
                            return <Moon size={36} color="#c084fc" fill="#c084fc" style={{ filter: 'drop-shadow(0 0 8px rgba(192, 132, 252, 0.5))' }} />;
                        })()}
                    </motion.span>
                </h1>
                <p className="text-muted" style={{ fontSize: '1.1rem', maxWidth: '600px' }}>
                    Your studio is ready. Here's your daily snapshot.
                </p>
            </motion.div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <StatCard
                    title="Today's Appointments"
                    value={stats.todayAppointments}
                    icon={<GlassIcon icon={Calendar} />}
                    trend={stats.growth || "Calculating..."}
                    gradient="linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)"
                    borderColor="rgba(129, 140, 248, 0.2)"
                    textColor="#818cf8"
                />
                <StatCard
                    title="Pending Requests"
                    value={stats.pendingAppointments}
                    icon={<GlassIcon icon={Clock} />}
                    trend="Requires attention"
                    gradient="linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)"
                    borderColor="rgba(251, 191, 36, 0.2)"
                    textColor="#fbbf24"
                />
                <StatCard
                    title="Active Services"
                    value={stats.totalServices}
                    icon={<GlassIcon icon={Sparkles} />}
                    trend="All systems go"
                    gradient="linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)"
                    borderColor="rgba(52, 211, 153, 0.2)"
                    textColor="#34d399"
                />
                <StatCard
                    title="Weekly Revenue"
                    value={`₹${stats.weekRevenue}`}
                    icon={<GlassIcon icon={IndianRupee} />}
                    trend="On track"
                    gradient="linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)"
                    borderColor="rgba(96, 165, 250, 0.2)"
                    textColor="#60a5fa"
                />
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '1.5rem'
            }}>
                {/* Quick Actions */}
                <div className="glass-card">
                    <h2 className="heading-lg" style={{ color: 'white', fontSize: '1.1rem' }}>
                        Quick Actions
                    </h2>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        <QuickActionButton
                            href="/dashboard/services"
                            icon={<GlassIcon icon={Gem} size={20} />}
                            title="New Service"
                            subtitle="Add a new offering to your menu"
                        />
                        <QuickActionButton
                            href="/dashboard/appointments"
                            icon={<GlassIcon icon={CalendarDays} size={20} />}
                            title="Manage Appointments"
                            subtitle="View and update bookings"
                        />
                        <QuickActionButton
                            href="/dashboard/calendar"
                            icon={<GlassIcon icon={CalendarRange} size={20} />}
                            title="View Calendar"
                            subtitle="Check your schedule"
                        />
                    </div>
                </div>

                {/* Upcoming Appointments */}
                <div className="glass-card" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 className="heading-lg" style={{ color: 'white', fontSize: '1.1rem', margin: 0 }}>
                            Upcoming Appointments
                        </h2>
                        <Link href="/dashboard/appointments" style={{ fontSize: '0.85rem', color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: '600' }}>
                            View All →
                        </Link>
                    </div>

                    {upcomingAppointments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--dark-text-muted)', background: 'rgba(15, 23, 42, 0.3)', borderRadius: '0.5rem' }}>
                            <p>No upcoming appointments this week.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {upcomingAppointments.map((apt) => (
                                <div
                                    key={apt._id}
                                    style={{
                                        padding: '1rem',
                                        background: 'rgba(15, 23, 42, 0.3)',
                                        border: '1px solid var(--dark-border)',
                                        borderRadius: '0.75rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{
                                            background: 'rgba(30, 41, 59, 0.5)',
                                            padding: '0.5rem',
                                            borderRadius: '0.5rem',
                                            textAlign: 'center',
                                            minWidth: '3.5rem'
                                        }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--dark-text-muted)', fontWeight: '600' }}>
                                                {new Date(apt.startTime).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                                            </div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'white' }}>
                                                {new Date(apt.startTime).getDate()}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: 'white', marginBottom: '0.25rem' }}>
                                                {apt.serviceId?.name || 'Service'}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--dark-text-muted)' }}>
                                                with {apt.clientId?.profile?.name || apt.clientId?.email || 'Client'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.9rem', color: 'white', fontWeight: '600', marginBottom: '0.25rem' }}>
                                            {formatTime(apt.startTime)}
                                        </div>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '1rem',
                                            background: getStatusColor(apt.status) + '20',
                                            color: getStatusColor(apt.status),
                                            fontWeight: '600',
                                            border: `1px solid ${getStatusColor(apt.status)}40`
                                        }}>
                                            {apt.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}

function StatCard({
    title,
    value,
    icon,
    trend,
    gradient,
    borderColor,
    textColor
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend: string;
    gradient: string;
    borderColor: string;
    textColor: string;
}) {
    return (
        <div
            style={{
                background: gradient,
                backdropFilter: "blur(10px)",
                borderRadius: "1rem",
                border: `1px solid ${borderColor}`,
                padding: "1.5rem",
                position: "relative",
                overflow: "hidden"
            }}
        >
            {/* Decorative circle */}
            <div
                style={{
                    position: "absolute",
                    top: "-1rem",
                    right: "-1rem",
                    width: "6rem",
                    height: "6rem",
                    background: textColor,
                    opacity: 0.1,
                    borderRadius: "50%",
                    filter: "blur(20px)"
                }}
            />

            {/* ICON + VALUE ON ONE LINE */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1rem"
                }}
            >
                {icon}

                <div
                    style={{
                        fontSize: "2rem",
                        fontWeight: "800",
                        color: "white"
                    }}
                >
                    {value}
                </div>
            </div>

            {/* TITLE */}
            <div
                style={{
                    fontSize: "0.9rem",
                    color: "#cbd5e1",
                    fontWeight: "500"
                }}
            >
                {title}
            </div>

            {/* TREND */}
            <div
                style={{
                    fontSize: "0.8rem",
                    color: textColor,
                    marginTop: "0.5rem",
                    fontWeight: "600"
                }}
            >
                {trend}
            </div>
        </div>
    );
}


function QuickActionButton({ href, icon, title, subtitle }: { href: string, icon: React.ReactNode, title: string, subtitle: string }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link href={href} style={{ textDecoration: 'none' }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: isHovered ? 'rgba(30, 41, 59, 0.8)' : 'rgba(15, 23, 42, 0.3)',
                    border: isHovered ? '1px solid rgba(129, 140, 248, 0.3)' : '1px solid var(--dark-border)',
                    borderRadius: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {icon}
                <div>
                    <div style={{ fontWeight: '600', color: 'white' }}>{title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--dark-text-muted)' }}>{subtitle}</div>
                </div>
            </div>
        </Link>
    );
}
