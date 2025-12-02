'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { useSocket } from '@/context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Clock,
    MapPin,
    User,
    ArrowLeft,
    Search,
    Filter,
    AlertCircle,
    CheckCircle,
    XCircle,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    History
} from 'lucide-react';

interface Appointment {
    _id: string;
    serviceId: {
        _id: string;
        name: string;
        duration: number;
        price: number;
        category: string;
    };
    providerId: {
        _id: string;
        profile: { name: string };
        email: string;
    };
    startTime: string;
    status: string;
    notes?: string;
}

const ITEMS_PER_PAGE = 6;

export default function MyAppointmentsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const { socket } = useSocket();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled' | 'history'>('upcoming');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?redirect=/my-appointments');
        } else if (user) {
            fetchAppointments();
        }
    }, [authLoading, user]);

    useEffect(() => {
        if (!socket) return;

        const handleUpdate = () => {
            console.log('Received appointment update, refreshing list...');
            fetchAppointments();
        };

        socket.on('appointment_updated', handleUpdate);

        return () => {
            socket.off('appointment_updated', handleUpdate);
        };
    }, [socket, user]);

    // Reset page when tab changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const fetchAppointments = async () => {
        try {
            const { data } = await api.get('/appointments');
            setAppointments(data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterAppointments = () => {
        const now = new Date();

        switch (activeTab) {
            case 'upcoming':
                return appointments.filter(apt =>
                    new Date(apt.startTime) > now && apt.status !== 'CANCELLED'
                );
            case 'completed':
                return appointments.filter(apt =>
                    new Date(apt.startTime) <= now && apt.status !== 'CANCELLED'
                );
            case 'cancelled':
                return appointments.filter(apt => apt.status === 'CANCELLED');
            case 'history':
                return appointments.filter(apt =>
                    new Date(apt.startTime) <= now || apt.status === 'CANCELLED'
                );
            default:
                return appointments;
        }
    };

    const cancelAppointment = async (id: string) => {
        const confirmed = await confirm({
            title: 'Cancel Appointment',
            message: 'Are you sure you want to cancel this appointment?',
            confirmText: 'Yes, Cancel',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            await api.put(`/appointments/${id}/status`, { status: 'CANCELLED' });
            showToast('Appointment cancelled successfully', 'success');
            fetchAppointments();
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            showToast('Failed to cancel appointment', 'error');
        }
    };

    if (authLoading || loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dark-bg)' }}>
                <div className="loading-spinner" />
            </div>
        );
    }

    if (!user) return null;

    const filteredAppointments = filterAppointments();
    const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);
    const paginatedAppointments = filteredAppointments.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const stats = {
        upcoming: appointments.filter(a => new Date(a.startTime) > new Date() && a.status !== 'CANCELLED').length,
        completed: appointments.filter(a => new Date(a.startTime) <= new Date() && a.status !== 'CANCELLED').length,
        cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
        history: appointments.filter(a => new Date(a.startTime) <= new Date() || a.status === 'CANCELLED').length
    };

    return (
        <div className="page-container" style={{ paddingTop: '6rem', width: '100%', maxWidth: '100%', paddingLeft: '2rem', paddingRight: '2rem' }}>
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="btn btn-ghost"
                style={{
                    position: 'absolute',
                    top: '6rem',
                    left: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--dark-text-muted)',
                    zIndex: 10
                }}
            >
                <ArrowLeft size={20} />
                <span>Back</span>
            </button>

            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                    textAlign: 'center',
                    marginBottom: '3rem',
                    position: 'relative'
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '600px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    zIndex: -1
                }} />

                <h1 className="heading-xl" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                    My Appointments
                </h1>
                <p className="text-muted" style={{ fontSize: '1.1rem', margin: '0 auto', whiteSpace: 'nowrap' }}>
                    Manage your upcoming and past bookings
                </p>
            </motion.div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid var(--dark-border)',
                paddingBottom: '0.75rem',
                overflowX: 'auto'
            }}>
                <TabButton
                    label="Upcoming"
                    count={stats.upcoming}
                    active={activeTab === 'upcoming'}
                    onClick={() => setActiveTab('upcoming')}
                    icon={<Calendar size={16} />}
                />
                <TabButton
                    label="Completed"
                    count={stats.completed}
                    active={activeTab === 'completed'}
                    onClick={() => setActiveTab('completed')}
                    icon={<CheckCircle size={16} />}
                />
                <TabButton
                    label="Cancelled"
                    count={stats.cancelled}
                    active={activeTab === 'cancelled'}
                    onClick={() => setActiveTab('cancelled')}
                    icon={<XCircle size={16} />}
                />
                <TabButton
                    label="History"
                    count={stats.history}
                    active={activeTab === 'history'}
                    onClick={() => setActiveTab('history')}
                    icon={<History size={16} />}
                />
            </div>

            {/* Appointments Grid */}
            <AnimatePresence mode="wait">
                {filteredAppointments.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{
                            textAlign: 'center',
                            padding: '4rem 2rem',
                            background: 'rgba(15, 23, 42, 0.3)',
                            borderRadius: '1rem',
                            border: '1px solid var(--dark-border)'
                        }}
                    >
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'rgba(129, 140, 248, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem'
                        }}>
                            <Calendar size={40} className="text-brand-primary" />
                        </div>
                        <h3 className="heading-lg" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                            No {activeTab} appointments
                        </h3>
                        <p style={{ color: 'var(--dark-text-muted)', marginBottom: '2rem' }}>
                            {activeTab === 'upcoming' && "You don't have any upcoming appointments yet."}
                            {activeTab === 'completed' && "You haven't completed any appointments yet."}
                            {activeTab === 'cancelled' && "You don't have any cancelled appointments."}
                            {activeTab === 'history' && "You don't have any appointment history."}
                        </p>
                        {activeTab === 'upcoming' && (
                            <button
                                onClick={() => router.push('/services')}
                                className="btn btn-primary"
                            >
                                Browse Services
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <>
                        <motion.div
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
                                gap: '1.5rem'
                            }}
                        >
                            {paginatedAppointments.map((appointment, index) => (
                                <AppointmentCard
                                    key={appointment._id}
                                    appointment={appointment}
                                    onCancel={cancelAppointment}
                                    onView={() => router.push(`/appointments/${appointment._id}`)}
                                    isUpcoming={activeTab === 'upcoming'}
                                    index={index}
                                />
                            ))}
                        </motion.div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="btn btn-ghost"
                                    style={{ padding: '0.5rem', opacity: currentPage === 1 ? 0.5 : 1 }}
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span style={{ color: 'var(--dark-text-muted)', fontSize: '0.9rem' }}>
                                    Page <strong style={{ color: 'white' }}>{currentPage}</strong> of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="btn btn-ghost"
                                    style={{ padding: '0.5rem', opacity: currentPage === totalPages ? 0.5 : 1 }}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

function TabButton({ label, count, active, onClick, icon }: {
    label: string;
    count: number;
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1.5rem',
                background: active ? 'rgba(99, 102, 241, 0.1)' : 'rgba(15, 23, 42, 0.3)',
                color: active ? 'white' : 'var(--dark-text-muted)',
                border: active ? '1px solid var(--brand-primary)' : '1px solid var(--dark-border)',
                borderRadius: '50px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                boxShadow: active ? '0 0 15px rgba(99, 102, 241, 0.2)' : 'none'
            }}
        >
            {icon}
            <span>{label}</span>
            <span style={{
                background: active ? 'var(--brand-primary)' : 'rgba(255,255,255,0.05)',
                color: active ? 'white' : 'var(--dark-text-muted)',
                padding: '0.125rem 0.5rem',
                borderRadius: '50px',
                fontSize: '0.8rem',
                minWidth: '24px',
                textAlign: 'center'
            }}>
                {count}
            </span>
        </button>
    );
}

function AppointmentCard({ appointment, onCancel, onView, isUpcoming, index }: {
    appointment: Appointment;
    onCancel: (id: string) => void;
    onView: () => void;
    isUpcoming: boolean;
    index: number;
}) {
    const startDate = new Date(appointment.startTime);
    const isToday = startDate.toDateString() === new Date().toDateString();
    const isPast = new Date(appointment.startTime) <= new Date();
    const isCancelled = appointment.status === 'CANCELLED';

    let statusTag = null;
    if (isCancelled) {
        statusTag = (
            <span style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '0.25rem 0.75rem',
                borderRadius: '50px',
                fontSize: '0.75rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
            }}>
                <XCircle size={12} /> Cancelled
            </span>
        );
    } else if (isPast) {
        statusTag = (
            <span style={{
                background: 'rgba(34, 197, 94, 0.1)',
                color: '#22c55e',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                padding: '0.25rem 0.75rem',
                borderRadius: '50px',
                fontSize: '0.75rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
            }}>
                <CheckCircle size={12} /> Completed
            </span>
        );
    } else {
        statusTag = (
            <span style={{
                background: 'rgba(234, 179, 8, 0.1)',
                color: '#eab308',
                border: '1px solid rgba(234, 179, 8, 0.2)',
                padding: '0.25rem 0.75rem',
                borderRadius: '50px',
                fontSize: '0.75rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
            }}>
                <Calendar size={12} /> Scheduled
            </span>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card"
            style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                border: isToday ? '1px solid var(--brand-accent)' : '1px solid var(--dark-border)',
                position: 'relative',
                overflow: 'hidden',
                height: '100%'
            }}
        >
            {isToday && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    background: 'var(--brand-accent)',
                    color: 'white',
                    padding: '0.25rem 1rem',
                    borderBottomLeftRadius: '0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase'
                }}>
                    Today
                </div>
            )}

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                {/* Date Box */}
                <div style={{
                    background: 'rgba(15, 23, 42, 0.5)',
                    borderRadius: '1rem',
                    padding: '1rem 0.75rem',
                    textAlign: 'center',
                    minWidth: '80px',
                    border: '1px solid var(--dark-border)'
                }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        {startDate.toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'white', lineHeight: 1 }}>
                        {startDate.getDate()}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--dark-text-muted)', marginTop: '0.5rem' }}>
                        {startDate.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                </div>

                {/* Main Info */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'white', margin: 0, lineHeight: 1.3 }}>
                            {appointment.serviceId?.name || 'Service'}
                        </h3>
                        {statusTag}
                    </div>

                    <span className="badge" style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: 'var(--brand-primary)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        marginBottom: '1rem',
                        display: 'inline-block'
                    }}>
                        {appointment.serviceId?.category || 'General'}
                    </span>

                    <div style={{ display: 'grid', gap: '0.5rem', color: 'var(--dark-text-muted)', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={14} className="text-brand-secondary" />
                            {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            <span style={{ opacity: 0.5 }}>•</span>
                            {appointment.serviceId?.duration || 60} min
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={14} className="text-brand-secondary" />
                            {appointment.providerId?.profile?.name || 'Provider'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer / Actions */}
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--dark-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: '700', color: 'var(--brand-accent)', fontSize: '1.1rem' }}>
                    ₹{appointment.serviceId?.price || 0}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {/* <button
                        onClick={onView}
                        className="btn btn-ghost"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                        Details
                    </button> */}
                    {isUpcoming && (
                        <button
                            onClick={() => onCancel(appointment._id)}
                            className="btn btn-outline"
                            style={{
                                borderColor: '#ef4444',
                                color: '#ef4444',
                                padding: '0.5rem 1rem',
                                fontSize: '0.9rem'
                            }}
                        >
                            Cancel
                        </button>
                    )}

                </div>
            </div>
        </motion.div>
    );
}
