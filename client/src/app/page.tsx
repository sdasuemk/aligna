'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/api';
import { useSocket } from '@/context/SocketContext';

import ProviderHero3D from '@/components/ProviderHero3D';
import ClientHero3D_Alpana from '@/components/ClientHero3D_Alpana';
import { motion } from 'framer-motion';
import GuestHero from '@/components/GuestHero';
import FeaturesSection from '@/components/FeaturesSection';
import CTASection from '@/components/CTASection';

export default function Home() {
  const { user, loading } = useAuth();
  const { socket } = useSocket();
  const [stats, setStats] = useState({ upcoming: 0, services: 0, today: 0, pending: 0, newServices: 0, recentActivities: [], growth: '' });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      console.log('Received appointment update, refreshing stats...');
      fetchStats();
    };

    socket.on('appointment_created', handleUpdate);
    socket.on('appointment_updated', handleUpdate);

    return () => {
      socket.off('appointment_created', handleUpdate);
      socket.off('appointment_updated', handleUpdate);
    };
  }, [socket, user]);

  const fetchStats = async () => {
    try {
      if (user?.role === 'PROVIDER') {
        const { data } = await api.get('/dashboard/stats', {
          params: { providerId: user.id }
        });

        setStats({
          services: data.totalServices,
          upcoming: data.upcomingAppointmentsCount,
          today: data.todayAppointments,
          pending: data.pendingAppointments,
          newServices: data.newServicesCount,
          recentActivities: data.recentActivities || [],
          growth: data.appointmentGrowth
        });
      } else if (user?.role === 'CLIENT') {
        const { data } = await api.get('/appointments');
        setStats({
          upcoming: data.filter((a: any) => new Date(a.startTime) > new Date() && a.status !== 'CANCELLED').length,
          services: 0,
          today: 0,
          pending: 0,
          newServices: 0,
          recentActivities: [],
          growth: ''
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '1.5rem', color: '#94a3b8' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)' }}>
      {/* Hero Section - Dynamic based on user role */}
      {!user ? <GuestHero /> : user.role === 'PROVIDER' ? <ProviderHero3D stats={stats} loading={loadingStats} user={user} /> : <ClientHero stats={stats} loading={loadingStats} user={user} />}

      {/* Features Section - Only show for guests */}
      {!user && (
        <>
          <FeaturesSection />

          <CTASection />
        </>
      )}
    </div>
  );
}



// Client Hero - For logged-in clients
function ClientHero({ stats, loading, user }: any) {
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
      overflow: 'hidden',
      background: 'transparent' // Ensure no background covers the 3D element
    }}>
      <ClientHero3D_Alpana />
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '2.5rem' }}
        >
          <h1 className="heading-xl" style={{ marginBottom: '0.5rem', fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{greeting()}, </span>
            <span className="text-gradient">
              {user?.profile?.name || 'Client'}
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
            Ready to book your next appointment? Here's a quick look at your schedule.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* Quick Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ padding: '2rem', background: 'transparent', border: 'none', boxShadow: 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                padding: '0.75rem',
                borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.1)',
                color: 'var(--brand-primary)'
              }}>
                <Calendar size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--dark-text-muted)', marginBottom: '0.25rem' }}>Upcoming</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'white' }}>
                  {loading ? '...' : stats.upcoming}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--dark-text-muted)' }}>
              {stats.upcoming === 0 ? 'No upcoming appointments scheduled.' : `You have ${stats.upcoming} appointment${stats.upcoming > 1 ? 's' : ''} coming up.`}
            </p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'transparent', border: 'none', boxShadow: 'none' }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '0.5rem' }}>Quick Actions</h3>

            <Link href="/services" className="glass-panel" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.5rem',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', }}>
                <GlassIcon icon={Search} size={20} />
                <span style={{ fontWeight: '600', color: 'white' }}>Browse Services</span>
              </div>
              <ArrowRight size={18} style={{ color: 'var(--dark-text-muted)' }} />
            </Link>

            <Link href="/my-appointments" className="glass-panel" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.5rem',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <GlassIcon icon={ClipboardList} size={20} />
                <span style={{ fontWeight: '600', color: 'white' }}>My Appointments</span>
              </div>
              <ArrowRight size={18} style={{ color: 'var(--dark-text-muted)' }} />
            </Link>
          </motion.div>

          {/* Personalized Tip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              padding: '2rem',
              background: 'transparent',
              border: 'none',
              boxShadow: 'none'
            }}
          >
            <div style={{ marginBottom: '1rem', color: '#fbbf24' }}>
              <Sparkles size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'white', marginBottom: '0.75rem' }}>Pro Tip</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--dark-text-muted)', lineHeight: '1.6' }}>
              Did you know? Booking appointments in advance helps you secure your preferred time slots and avoid last-minute rushes!
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

import { LayoutDashboard, Briefcase, Calendar, Clock, TrendingUp, Activity, CheckCircle, AlertCircle, ArrowRight, Star, Users, Sun, Zap, Sparkles, Search, ClipboardList, Moon } from 'lucide-react';
import GlassIcon from '@/components/ui/GlassIcon';

// ... (existing code)

// Provider Hero - For logged-in providers
function ProviderHero({ stats, loading, user }: any) {
  const greeting = () => {
    const hour = new Date().getHours();
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

      <div style={{ width: '100%', padding: '0 1rem', position: 'relative', zIndex: 1 }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 className="heading-xl" style={{ marginBottom: '1rem' }}>
            {greeting()}, <span className="text-gradient">{user?.profile?.name || 'Provider'}</span>
          </h1>
          <p className="text-muted" style={{ fontSize: '1.1rem', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
            {stats.upcoming === 0 ? (
              <>Your network is growing. You have <strong style={{ color: 'var(--brand-primary)' }}>0 upcoming appointments</strong> today.</>
            ) : (
              <>Here's what's happening with your business today. You have <strong style={{ color: 'var(--brand-primary)' }}>{stats.upcoming} upcoming</strong> appointments.</>
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
            trend={stats.newServices > 0 ? `+${stats.newServices} new` : undefined}
            color="blue"
          />
          <DashboardCard
            icon={Calendar}
            label="Today's Appointments"
            value={loading ? '...' : stats.today}
            trend="On track"
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

// Helper Components
function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.25rem', color: 'white' }}>{value}</div>
      <div style={{ fontSize: '0.9rem', opacity: 0.9, color: 'rgba(255,255,255,0.8)' }}>{label}</div>
    </div>
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


