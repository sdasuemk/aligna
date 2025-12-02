'use client';

import { useState, useEffect } from 'react';
import api from '@/api';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

interface Appointment {
    _id: string;
    startTime: string;
    endTime: string;
    status: string;
    serviceId: { name: string; price: number; currency: string };
    clientId: { profile: { name: string; phone?: string }; email: string };
}

export default function AppointmentsPage() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        if (user) {
            fetchAppointments();
        }
    }, [user]);

    const fetchAppointments = async () => {
        try {
            const { data } = await api.get('/appointments');
            setAppointments(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.put(`/appointments/${id}/status`, { status });
            fetchAppointments();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        const matchesFilter = filter === 'ALL' || apt.status === filter;
        const matchesSearch =
            apt.serviceId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.clientId?.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.clientId?.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
    const paginatedAppointments = filteredAppointments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="heading-xl" style={{ margin: 0 }}>
                    Appointments
                </h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Search appointments..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="input-dark"
                        style={{ width: '250px' }}
                    />
                    <div style={{ display: 'flex', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '0.5rem', padding: '4px', border: '1px solid var(--dark-border)' }}>
                        {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(status => (
                            <button
                                key={status}
                                onClick={() => { setFilter(status); setCurrentPage(1); }}
                                className="btn"
                                style={{
                                    background: filter === status ? 'var(--brand-primary)' : 'transparent',
                                    color: filter === status ? 'white' : 'var(--dark-text-muted)',
                                    border: 'none',
                                    borderRadius: '0.3rem',
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1fr 1fr', padding: '1rem 1.5rem', borderBottom: '1px solid var(--dark-border)', color: 'var(--dark-text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>
                    <div>SERVICE</div>
                    <div>CLIENT</div>
                    <div>DATE & TIME</div>
                    <div>PRICE</div>
                    <div>STATUS</div>
                    <div style={{ textAlign: 'right' }}>ACTIONS</div>
                </div>

                <div style={{ minHeight: '400px' }}>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--dark-text-muted)' }}>Loading appointments...</div>
                    ) : paginatedAppointments.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--dark-text-muted)' }}>No appointments found.</div>
                    ) : (
                        paginatedAppointments.map(apt => (
                            <div key={apt._id} style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1fr 1fr',
                                padding: '1rem 1.5rem',
                                borderBottom: '1px solid rgba(148, 163, 184, 0.05)',
                                alignItems: 'center',
                                fontSize: '0.9rem',
                                transition: 'background 0.2s',
                                cursor: 'default'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(129, 140, 248, 0.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{ fontWeight: '600', color: 'white' }}>{apt.serviceId?.name || 'Unknown Service'}</div>
                                <div>
                                    <div style={{ color: '#e2e8f0' }}>{apt.clientId?.profile?.name || 'Unknown'}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--dark-text-muted)' }}>{apt.clientId?.email}</div>
                                    {apt.clientId?.profile?.phone && (
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{apt.clientId.profile.phone}</div>
                                    )}
                                </div>
                                <div style={{ color: '#cbd5e1' }}>
                                    {format(new Date(apt.startTime), 'MMM d, yyyy')}
                                    <div style={{ fontSize: '0.8rem', color: 'var(--dark-text-muted)' }}>
                                        {format(new Date(apt.startTime), 'h:mm a')} - {format(new Date(apt.endTime), 'h:mm a')}
                                    </div>
                                </div>
                                <div style={{ fontWeight: '600', color: '#e2e8f0' }}>
                                    ₹{apt.serviceId?.price}
                                </div>
                                <div>
                                    <StatusBadge status={apt.status} />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <select
                                        value={apt.status}
                                        onChange={(e) => updateStatus(apt._id, e.target.value)}
                                        className="input-dark"
                                        style={{
                                            padding: '0.25rem 0.5rem',
                                            fontSize: '0.8rem',
                                            width: 'auto',
                                            display: 'inline-block'
                                        }}
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="CONFIRMED">Confirm</option>
                                        <option value="COMPLETED">Complete</option>
                                        <option value="CANCELLED">Cancel</option>
                                    </select>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid var(--dark-border)' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--dark-text-muted)' }}>
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAppointments.length)} of {filteredAppointments.length} results
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="btn"
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--dark-border)',
                                    color: currentPage === 1 ? 'var(--dark-text-muted)' : 'white',
                                    padding: '0.25rem 0.75rem',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    fontSize: '0.85rem'
                                }}
                            >
                                Previous
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => handlePageChange(i + 1)}
                                    className="btn"
                                    style={{
                                        background: currentPage === i + 1 ? 'var(--brand-primary)' : 'transparent',
                                        border: currentPage === i + 1 ? 'none' : '1px solid var(--dark-border)',
                                        color: currentPage === i + 1 ? 'white' : 'var(--dark-text-muted)',
                                        width: '2rem',
                                        height: '2rem',
                                        padding: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.85rem',
                                        fontWeight: currentPage === i + 1 ? '600' : '400'
                                    }}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="btn"
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--dark-border)',
                                    color: currentPage === totalPages ? 'var(--dark-text-muted)' : 'white',
                                    padding: '0.25rem 0.75rem',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    fontSize: '0.85rem'
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        PENDING: { bg: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.2)' },
        CONFIRMED: { bg: 'rgba(52, 211, 153, 0.1)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.2)' },
        COMPLETED: { bg: 'rgba(129, 140, 248, 0.1)', color: '#818cf8', border: '1px solid rgba(129, 140, 248, 0.2)' },
        CANCELLED: { bg: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.2)' },
    };

    const style = styles[status] || styles.PENDING;

    return (
        <span className="badge" style={{
            background: style.bg,
            color: style.color,
            border: style.border
        }}>
            {status}
        </span>
    );
}
