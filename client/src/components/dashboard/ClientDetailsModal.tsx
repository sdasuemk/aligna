import { format } from 'date-fns';
import GlassIcon from '@/components/ui/GlassIcon';
import { FileText, MessageSquare, Star } from 'lucide-react';

interface Booking {
    _id: string;
    service: string;
    date: string;
    status: string;
    price: number;
}

interface Client {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    totalVisits: number;
    totalRevenue: number;
    lastVisit?: string;
    bookings: Booking[];
}

interface ClientDetailsModalProps {
    client: Client | null;
    onClose: () => void;
}

export default function ClientDetailsModal({ client, onClose }: ClientDetailsModalProps) {
    if (!client) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 50,
            padding: '1rem'
        }} onClick={onClose}>
            <div className="glass-panel" style={{
                width: '100%',
                maxWidth: '800px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                padding: 0
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid var(--dark-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start'
                }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: 'var(--gradient-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: 'white'
                        }}>
                            {client.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="heading-lg" style={{ margin: 0, fontSize: '1.5rem' }}>{client.name}</h2>
                            <div style={{ color: 'var(--dark-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{client.email}</div>
                            {client.phone && <div style={{ color: 'var(--dark-text-muted)', fontSize: '0.9rem' }}>{client.phone}</div>}
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--dark-text-muted)',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        lineHeight: 1
                    }}>×</button>
                </div>

                {/* Content */}
                <div style={{ overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        <StatCard label="Total Visits" value={client.totalVisits} />
                        <StatCard label="Total Revenue" value={`₹${client.totalRevenue}`} />
                        <StatCard label="Last Visit" value={client.lastVisit ? format(new Date(client.lastVisit), 'MMM d, yyyy') : 'N/A'} />
                    </div>

                    {/* Booking History */}
                    <div>
                        <h3 className="heading-lg" style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'white' }}>Booking History</h3>
                        <div style={{
                            background: 'rgba(30, 41, 59, 0.5)',
                            borderRadius: '0.5rem',
                            overflow: 'hidden'
                        }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e2e8f0', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(148, 163, 184, 0.1)', textAlign: 'left' }}>
                                        <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Service</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Price</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {client.bookings.map(booking => (
                                        <tr key={booking._id} style={{ borderTop: '1px solid rgba(148, 163, 184, 0.05)' }}>
                                            <td style={{ padding: '0.75rem 1rem' }}>{format(new Date(booking.date), 'MMM d, yyyy')}</td>
                                            <td style={{ padding: '0.75rem 1rem' }}>{booking.service}</td>
                                            <td style={{ padding: '0.75rem 1rem' }}>₹{booking.price}</td>
                                            <td style={{ padding: '0.75rem 1rem' }}>
                                                <span className="badge" style={{
                                                    background: getStatusColor(booking.status),
                                                    color: 'white',
                                                    border: 'none'
                                                }}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Future Scope / Coming Soon */}
                    <div>
                        <h3 className="heading-lg" style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'white' }}>More Features</h3>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <ComingSoonBadge label="Documents" icon={<GlassIcon icon={FileText} size={16} />} />
                            <ComingSoonBadge label="Chat" icon={<GlassIcon icon={MessageSquare} size={16} />} />
                            <ComingSoonBadge label="Loyalty Points" icon={<GlassIcon icon={Star} size={16} />} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value }: { label: string, value: string | number }) {
    return (
        <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            padding: '1rem',
            borderRadius: '0.75rem',
            border: '1px solid var(--dark-border)'
        }}>
            <div style={{ color: 'var(--dark-text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>{label}</div>
            <div style={{ color: 'white', fontSize: '1.25rem', fontWeight: 'bold' }}>{value}</div>
        </div>
    );
}

function ComingSoonBadge({ label, icon }: { label: string, icon: React.ReactNode }) {
    return (
        <div style={{
            background: 'rgba(148, 163, 184, 0.05)',
            border: '1px dashed rgba(148, 163, 184, 0.2)',
            padding: '0.75rem 1.25rem',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--dark-text-muted)',
            cursor: 'not-allowed',
            userSelect: 'none'
        }}>
            <span>{icon}</span>
            <span>{label}</span>
            <span style={{ fontSize: '0.65rem', background: '#334155', padding: '0.1rem 0.3rem', borderRadius: '0.25rem', marginLeft: '0.5rem' }}>SOON</span>
        </div>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'CONFIRMED': return 'rgba(16, 185, 129, 0.5)';
        case 'PENDING': return 'rgba(245, 158, 11, 0.5)';
        case 'CANCELLED': return 'rgba(239, 68, 68, 0.5)';
        case 'COMPLETED': return 'rgba(59, 130, 246, 0.5)';
        default: return 'rgba(148, 163, 184, 0.5)';
    }
}
