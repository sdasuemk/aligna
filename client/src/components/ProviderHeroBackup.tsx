import Link from 'next/link';
import { LayoutDashboard, Briefcase, Calendar, Clock, TrendingUp, Activity, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import GlassIcon from '@/components/ui/GlassIcon';

// Provider Hero - For logged-in providers
export default function ProviderHeroBackup({ stats, loading, user }: any) {
    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 5) return 'Good evening';
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <section className="page-container" style={{
            paddingTop: '8rem',
            minHeight: '100vh',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Gradients */}
            <div style={{
                position: 'absolute',
                top: '10%',
                right: '5%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                filter: 'blur(60px)',
                zIndex: 0
            }} />
            <div style={{
                position: 'absolute',
                bottom: '10%',
                left: '5%',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
                filter: 'blur(80px)',
                zIndex: 0
            }} />

            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Welcome Section */}
                <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <h1 className="heading-xl" style={{ marginBottom: '1rem' }}>
                        {greeting()}, <span style={{
                            background: 'linear-gradient(to bottom right, #FFD700, #FF8C00, #FF4500)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            display: 'inline-block'
                        }}>{user?.profile?.name || 'Provider'}</span>
                    </h1>
                    <p className="text-muted" style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        {stats.upcoming === 0 ? (
                            "You have no upcoming appointments today yet. Keep pacence"
                        ) : (
                            <>
                                Here's what's happening with your business today. You have <strong style={{ color: 'var(--brand-primary)' }}>{stats.upcoming} upcoming</strong> appointments.
                            </>
                        )}
                    </p>
                </div>

                {/* Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '3rem'
                }}>
                    <DashboardCard
                        icon={Briefcase}
                        label="Active Services"
                        value={loading ? '...' : stats.services}
                        trend={stats.newServices > 0 ? `+${stats.newServices} new` : 'No new'}
                        color="blue"
                    />
                    <DashboardCard
                        icon={Calendar}
                        label="Today's Appointments"
                        value={loading ? '...' : stats.today}
                        trend={stats.growth || 'On track'}
                        color="green"
                    />
                    <DashboardCard
                        icon={Clock}
                        label="Upcoming"
                        value={loading ? '...' : stats.upcoming}
                        trend="Next 7 days"
                        color="purple"
                    />
                    <DashboardCard
                        icon={AlertCircle}
                        label="Pending Requests"
                        value={loading ? '...' : stats.pending}
                        trend="Action needed"
                        color="red"
                        highlight={stats.pending > 0}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                    {/* Quick Actions */}
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <GlassIcon icon={TrendingUp} size={20} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--dark-text-main)' }}>Quick Actions</h3>
                        </div>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <Link href="/dashboard" className="glass-panel" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem 1.5rem',
                                textDecoration: 'none',
                                transition: 'transform 0.2s, background 0.2s'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--brand-primary)'
                                    }}>
                                        <LayoutDashboard size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', color: 'var(--dark-text-main)' }}>Go to Dashboard</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--dark-text-muted)' }}>View full analytics & reports</div>
                                    </div>
                                </div>
                                <ArrowRight size={18} style={{ color: 'var(--dark-text-muted)' }} />
                            </Link>

                            <Link href="/dashboard/services" className="glass-panel" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem 1.5rem',
                                textDecoration: 'none',
                                transition: 'transform 0.2s, background 0.2s'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: 'rgba(168, 85, 247, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--brand-secondary)'
                                    }}>
                                        <Briefcase size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', color: 'var(--dark-text-main)' }}>Manage Services</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--dark-text-muted)' }}>Update prices & duration</div>
                                    </div>
                                </div>
                                <ArrowRight size={18} style={{ color: 'var(--dark-text-muted)' }} />
                            </Link>

                            <Link href="/dashboard/appointments" className="glass-panel" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem 1.5rem',
                                textDecoration: 'none',
                                transition: 'transform 0.2s, background 0.2s'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--success)'
                                    }}>
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', color: 'var(--dark-text-main)' }}>View Schedule</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--dark-text-muted)' }}>Check upcoming bookings</div>
                                    </div>
                                </div>
                                <ArrowRight size={18} style={{ color: 'var(--dark-text-muted)' }} />
                            </Link>
                        </div>
                    </div>

                    {/* Recent Activity (New Feature) */}
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <GlassIcon icon={Activity} size={20} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--dark-text-main)' }}>Recent Activity</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {stats.recentActivities && stats.recentActivities.length > 0 ? (
                                stats.recentActivities.map((activity: any, index: number) => {
                                    let icon = Calendar;
                                    let color = 'var(--brand-primary)';
                                    let title = 'Appointment Update';
                                    let desc = `${activity.serviceId?.name || 'Service'} with ${activity.clientId?.profile?.name || 'Client'}`;

                                    if (activity.status === 'COMPLETED') {
                                        icon = CheckCircle;
                                        color = 'var(--success)';
                                        title = 'Appointment Completed';
                                    } else if (activity.status === 'PENDING') {
                                        icon = AlertCircle;
                                        color = 'var(--warning)';
                                        title = 'Pending Request';
                                    } else if (activity.status === 'CONFIRMED') {
                                        icon = Calendar;
                                        color = 'var(--brand-primary)';
                                        title = 'New Booking';
                                    } else if (activity.status === 'CANCELLED') {
                                        icon = AlertCircle;
                                        color = 'var(--error)';
                                        title = 'Appointment Cancelled';
                                    }

                                    // Calculate time ago
                                    const timeAgo = (date: string) => {
                                        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
                                        let interval = seconds / 31536000;
                                        if (interval > 1) return Math.floor(interval) + " years ago";
                                        interval = seconds / 2592000;
                                        if (interval > 1) return Math.floor(interval) + " months ago";
                                        interval = seconds / 86400;
                                        if (interval > 1) return Math.floor(interval) + " days ago";
                                        interval = seconds / 3600;
                                        if (interval > 1) return Math.floor(interval) + " hours ago";
                                        interval = seconds / 60;
                                        if (interval > 1) return Math.floor(interval) + " minutes ago";
                                        return Math.floor(seconds) + " seconds ago";
                                    };

                                    return (
                                        <ActivityItem
                                            key={index}
                                            icon={icon}
                                            color={color}
                                            title={title}
                                            desc={desc}
                                            time={timeAgo(activity.updatedAt)}
                                        />
                                    );
                                })
                            ) : (
                                <div style={{ textAlign: 'center', color: 'var(--dark-text-muted)', padding: '1rem' }}>
                                    No recent activity
                                </div>
                            )}
                            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                <Link href="/dashboard/analytics" style={{ fontSize: '0.9rem', color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: '500' }}>
                                    View all activity
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function DashboardCard({ icon: Icon, label, value, trend, color, highlight }: any) {
    const getColor = (c: string) => {
        switch (c) {
            case 'blue': return 'var(--brand-primary)';
            case 'purple': return 'var(--brand-secondary)';
            case 'green': return 'var(--success)';
            case 'red': return 'var(--error)';
            default: return 'var(--brand-primary)';
        }
    };

    const themeColor = getColor(color);

    return (
        <div className="glass-card" style={{
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
            border: highlight ? `1px solid ${themeColor}` : '1px solid rgba(148, 163, 184, 0.1)',
            boxShadow: highlight ? `0 0 20px ${themeColor}20` : 'none'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{
                    padding: '0.75rem',
                    borderRadius: '12px',
                    background: `${themeColor}15`,
                    color: themeColor
                }}>
                    <Icon size={24} />
                </div>
                {highlight && (
                    <span style={{
                        background: themeColor,
                        color: 'white',
                        fontSize: '0.7rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '999px',
                        fontWeight: '600'
                    }}>
                        Action Required
                    </span>
                )}
            </div>

            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--dark-text-main)', marginBottom: '0.25rem' }}>
                {value}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--dark-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{label}</span>
                {trend && <span style={{ fontSize: '0.8rem', color: themeColor, background: `${themeColor}10`, padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{trend}</span>}
            </div>
        </div>
    );
}

function ActivityItem({ icon: Icon, color, title, desc, time }: any) {
    return (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(30, 41, 59, 0.3)' }}>
            <div style={{
                marginTop: '0.25rem',
                color: color
            }}>
                <Icon size={18} />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--dark-text-main)' }}>{title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--dark-text-muted)' }}>{desc}</div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--dark-text-muted)', whiteSpace: 'nowrap' }}>
                {time}
            </div>
        </div>
    );
}
