'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';

interface Appointment {
    _id: string;
    serviceId: {
        _id: string;
        name: string;
        description: string;
        duration: number;
        price: number;
        category: string;
        deliveryType?: string;
    };
    providerId: {
        _id: string;
        profile: { name: string };
        email: string;
    };
    startTime: string;
    status: string;
    notes?: string;
    createdAt: string;
}

export default function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchAppointment();
        }
    }, [authLoading, user, id]);

    const fetchAppointment = async () => {
        try {
            const { data } = await api.get('/appointments');
            const apt = data.find((a: Appointment) => a._id === id);
            setAppointment(apt || null);
        } catch (error) {
            console.error('Error fetching appointment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        const confirmed = await confirm({
            title: 'Cancel Appointment',
            message: 'Are you sure you want to cancel this appointment? This action cannot be undone.',
            confirmText: 'Yes, Cancel',
            cancelText: 'No, Keep it',
            type: 'danger'
        });

        if (!confirmed) return;

        setCancelling(true);
        try {
            await api.put(`/appointments/${id}/status`, { status: 'CANCELLED' });
            showToast('Appointment cancelled successfully', 'success');
            router.push('/my-appointments');
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            showToast('Failed to cancel appointment', 'error');
            setCancelling(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div style={{ fontSize: '1.5rem', color: 'white' }}>Loading...</div>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
                    <h2 style={{ fontSize: '2rem', color: 'white', marginBottom: '1rem' }}>Appointment not found</h2>
                    <button onClick={() => router.push('/my-appointments')} className="btn btn-primary" style={{ background: 'white', color: '#667eea' }}>
                        Back to My Appointments
                    </button>
                </div>
            </div>
        );
    }

    const startDate = new Date(appointment.startTime);
    const endTime = new Date(startDate.getTime() + (appointment.serviceId?.duration || 60) * 60000);
    const isUpcoming = startDate > new Date() && appointment.status !== 'CANCELLED';
    const isPast = startDate <= new Date() && appointment.status !== 'CANCELLED';
    const isCancelled = appointment.status === 'CANCELLED';

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Compact Header - Only Title */}
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '1.5rem 0' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => router.back()}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        ← Back
                    </button>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'white', margin: 0 }}>
                        Appointment Details
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
                {/* Status Badge - Outside Header */}
                <div style={{ marginBottom: '2rem' }}>
                    {isUpcoming && (
                        <span style={{
                            background: '#10b981',
                            padding: '0.5rem 1.25rem',
                            borderRadius: '50px',
                            fontSize: '0.9rem',
                            color: 'white',
                            fontWeight: '700',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                        }}>
                            ✓ Upcoming
                        </span>
                    )}
                    {isPast && (
                        <span style={{
                            background: '#64748b',
                            padding: '0.5rem 1.25rem',
                            borderRadius: '50px',
                            fontSize: '0.9rem',
                            color: 'white',
                            fontWeight: '700',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 2px 8px rgba(100, 116, 139, 0.3)'
                        }}>
                            ✓ Completed
                        </span>
                    )}
                    {isCancelled && (
                        <span style={{
                            background: '#ef4444',
                            padding: '0.5rem 1.25rem',
                            borderRadius: '50px',
                            fontSize: '0.9rem',
                            color: 'white',
                            fontWeight: '700',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                        }}>
                            ✗ Cancelled
                        </span>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
                    {/* Main Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Service Info Card */}
                        <div style={{
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '1rem',
                            padding: '2rem',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', marginBottom: '1rem' }}>
                                {appointment.serviceId?.name || 'Service'}
                            </h2>
                            {appointment.serviceId?.description && (
                                <p style={{ color: '#64748b', fontSize: '1.05rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                                    {appointment.serviceId.description}
                                </p>
                            )}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                <Badge label={appointment.serviceId?.category || 'Service'} bgColor="#dbeafe" textColor="#1e40af" />
                                {appointment.serviceId?.deliveryType && (
                                    <Badge label={appointment.serviceId.deliveryType} bgColor="#e9d5ff" textColor="#6b21a8" />
                                )}
                                <Badge label={`${appointment.serviceId?.duration || 60} minutes`} bgColor="#d1fae5" textColor="#065f46" />
                                <Badge label={`$${appointment.serviceId?.price || 0}`} bgColor="#fef3c7" textColor="#92400e" />
                            </div>
                        </div>

                        {/* Provider Info Card */}
                        <div style={{
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '1rem',
                            padding: '2rem',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'white', marginBottom: '1rem' }}>
                                Provider Information
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <InfoRow label="Name" value={appointment.providerId?.profile?.name || appointment.providerId?.email || 'Provider'} />
                                <InfoRow label="Email" value={appointment.providerId?.email || 'N/A'} />
                            </div>
                        </div>

                        {/* Notes Card */}
                        {appointment.notes && (
                            <div style={{
                                background: 'white',
                                borderRadius: '1rem',
                                padding: '2rem',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                border: '1px solid #e2e8f0'
                            }}>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem' }}>
                                    Your Notes
                                </h3>
                                <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: '1.6' }}>
                                    {appointment.notes}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div style={{ position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Date/Time Card */}
                        <div style={{
                            background: 'white',
                            borderRadius: '1rem',
                            padding: '2rem',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            border: '1px solid #e2e8f0',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem', textTransform: 'uppercase', fontWeight: '600' }}>
                                Appointment Time
                            </div>
                            <div style={{ fontSize: '3rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>
                                {startDate.getDate()}
                            </div>
                            <div style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '1.5rem' }}>
                                {startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </div>
                            <div style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                marginBottom: '0.75rem'
                            }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
                                    {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)', marginTop: '0.25rem' }}>
                                    to {endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                {startDate.toLocaleDateString('en-US', { weekday: 'long' })}
                            </div>
                        </div>

                        {/* Actions Card */}
                        {isUpcoming && (
                            <div style={{
                                background: 'white',
                                borderRadius: '1rem',
                                padding: '1.5rem',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                border: '1px solid #e2e8f0'
                            }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem' }}>
                                    Actions
                                </h3>
                                <button
                                    onClick={handleCancel}
                                    disabled={cancelling}
                                    className="btn"
                                    style={{
                                        width: '100%',
                                        background: 'white',
                                        color: '#ef4444',
                                        padding: '1rem',
                                        fontWeight: '700',
                                        border: '2px solid #ef4444',
                                        marginBottom: '0.75rem'
                                    }}
                                >
                                    {cancelling ? 'Cancelling...' : '✗ Cancel Appointment'}
                                </button>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
                                    Cancellations may be subject to provider policies
                                </div>
                            </div>
                        )}

                        {/* Booking Info */}
                        <div style={{
                            background: 'white',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                Booked on
                            </div>
                            <div style={{ fontSize: '1rem', color: '#1e293b', fontWeight: '600' }}>
                                {new Date(appointment.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Badge({ label, bgColor, textColor }: { label: string; bgColor: string; textColor: string }) {
    return (
        <span style={{
            background: bgColor,
            padding: '0.5rem 1rem',
            borderRadius: '50px',
            fontSize: '0.9rem',
            color: textColor,
            fontWeight: '700',
            border: 'none'
        }}>
            {label}
        </span>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>{label}:</span>
            <span style={{ color: 'white', fontWeight: '600', fontSize: '1.05rem' }}>{value}</span>
        </div>
    );
}
