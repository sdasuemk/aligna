'use client';

import { useNotifications } from '@/context/NotificationContext';
import { Check, Clock, Calendar, AlertCircle, Info, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationList({ onClose }: { onClose: () => void }) {
    const { notifications, markAsRead, markAllAsRead, subscribeToPush, isPushSubscribed } = useNotifications();

    const getIcon = (type: string) => {
        switch (type) {
            case 'APPOINTMENT_NEW':
            case 'APPOINTMENT_CONFIRMED':
                return <Calendar size={18} />;
            case 'APPOINTMENT_CANCELLED':
                return <AlertCircle size={18} />;
            case 'APPOINTMENT_COMPLETED':
                return <Check size={18} />;
            default:
                return <Info size={18} />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'APPOINTMENT_NEW':
            case 'APPOINTMENT_CONFIRMED':
                return 'var(--brand-primary)';
            case 'APPOINTMENT_CANCELLED':
                return 'var(--error)';
            case 'APPOINTMENT_COMPLETED':
                return 'var(--success)';
            default:
                return 'var(--brand-secondary)';
        }
    };

    return (
        <div className="glass-card" style={{
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            maxHeight: '500px',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem',
                borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'white', margin: 0 }}>Notifications</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!isPushSubscribed && (
                        <button
                            onClick={subscribeToPush}
                            style={{
                                fontSize: '0.75rem',
                                padding: '0.25rem 0.5rem',
                                background: 'rgba(99, 102, 241, 0.2)',
                                color: 'var(--brand-primary)',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Enable Push
                        </button>
                    )}
                    <button
                        onClick={markAllAsRead}
                        style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            background: 'transparent',
                            color: 'var(--dark-text-muted)',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Mark all read
                    </button>
                </div>
            </div>

            {/* List */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
                {notifications.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--dark-text-muted)' }}>
                        No notifications
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification._id}
                            onClick={() => markAsRead(notification._id)}
                            style={{
                                padding: '1rem',
                                borderBottom: '1px solid rgba(148, 163, 184, 0.05)',
                                background: notification.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                                display: 'flex',
                                gap: '0.75rem'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(148, 163, 184, 0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = notification.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.05)'}
                        >
                            <div style={{
                                marginTop: '0.25rem',
                                color: getColor(notification.type)
                            }}>
                                {getIcon(notification.type)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: notification.isRead ? '500' : '600', color: 'var(--dark-text-main)', marginBottom: '0.25rem' }}>
                                    {notification.title}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--dark-text-muted)', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                                    {notification.message}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(148, 163, 184, 0.5)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Clock size={12} />
                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </div>
                            </div>
                            {!notification.isRead && (
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: 'var(--brand-primary)',
                                    marginTop: '0.5rem'
                                }} />
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
