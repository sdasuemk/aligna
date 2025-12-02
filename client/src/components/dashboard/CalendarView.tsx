'use client';

import { useState, useEffect } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday
} from 'date-fns';
import api from '@/api';
import { useSocket } from '@/context/SocketContext';

interface Appointment {
    _id: string;
    startTime: string;
    endTime: string;
    status: string;
    client: {
        profile?: {
            name: string;
        };
        email: string;
    };
    service: {
        name: string;
        duration: number;
    };
}

export default function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();

    useEffect(() => {
        fetchAppointments();
    }, [currentDate]);

    useEffect(() => {
        if (!socket) return;

        socket.on('appointment_created', fetchAppointments);
        socket.on('appointment_updated', fetchAppointments);

        return () => {
            socket.off('appointment_created', fetchAppointments);
            socket.off('appointment_updated', fetchAppointments);
        };
    }, [socket, currentDate]);

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

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const daysInMonth = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    // Calculate number of weeks to determine row height distribution
    const weeksCount = daysInMonth.length / 7;

    const getDayAppointments = (date: Date) => {
        return appointments.filter(apt => {
            const aptDate = new Date(apt.startTime);
            return isSameDay(aptDate, date);
        });
    };

    const formatTime = (dateString: string) => {
        return format(new Date(dateString), 'h:mm a');
    };

    return (
        <div style={{
            background: '#0f172a',
            height: 'calc(100vh - 70px)', // Subtract navbar height
            color: 'white',
            padding: '1rem',
            fontFamily: "'Inter', sans-serif",
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                background: 'rgba(30, 41, 59, 0.5)',
                backdropFilter: 'blur(10px)',
                padding: '1rem 1.5rem',
                borderRadius: '1rem',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    background: 'linear-gradient(to right, #818cf8, #c084fc)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: 0
                }}>
                    {format(currentDate, "MMMM yyyy")}
                </h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={prevMonth} style={navButtonStyle}>←</button>
                    <button onClick={() => setCurrentDate(new Date())} style={todayButtonStyle}>Today</button>
                    <button onClick={nextMonth} style={navButtonStyle}>→</button>
                </div>
            </div>

            {/* Calendar Container */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(148, 163, 184, 0.05)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                borderRadius: '1rem',
                overflow: 'hidden'
            }}>
                {/* Days Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                    background: 'rgba(30, 41, 59, 0.8)'
                }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
                        <div key={dayName} style={{
                            padding: '0.75rem',
                            textAlign: 'center',
                            color: '#94a3b8',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            {dayName}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div style={{
                    flex: 1,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gridTemplateRows: `repeat(${weeksCount}, minmax(120px, 1fr))`,
                    gap: '1px',
                    background: 'rgba(148, 163, 184, 0.1)', // Gap color
                    overflowY: 'auto'
                }}>
                    {daysInMonth.map((day, idx) => {
                        const dayAppointments = getDayAppointments(day);
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isTodayDate = isToday(day);

                        return (
                            <div key={day.toString()} style={{
                                background: isCurrentMonth ? 'rgba(30, 41, 59, 0.4)' : 'rgba(15, 23, 42, 0.6)',
                                padding: '0.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem',
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                                ...(isTodayDate ? { background: 'rgba(45, 55, 72, 0.6)' } : {})
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '0.25rem'
                                }}>
                                    <span style={{
                                        fontSize: '0.85rem',
                                        fontWeight: isTodayDate ? '700' : '500',
                                        color: isTodayDate ? '#c084fc' : (isCurrentMonth ? '#e2e8f0' : '#475569'),
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                        background: isTodayDate ? 'rgba(192, 132, 252, 0.1)' : 'transparent'
                                    }}>
                                        {format(day, "d")}
                                    </span>
                                    {dayAppointments.length > 0 && (
                                        <span style={{
                                            fontSize: '0.65rem',
                                            background: 'rgba(148, 163, 184, 0.1)',
                                            padding: '0.1rem 0.3rem',
                                            borderRadius: '1rem',
                                            color: '#94a3b8'
                                        }}>
                                            {dayAppointments.length}
                                        </span>
                                    )}
                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.15rem',
                                    overflowY: 'auto',
                                    flex: 1,
                                    // Hide scrollbar but keep functionality
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none'
                                }}>
                                    {dayAppointments.map(apt => (
                                        <div key={apt._id} style={{
                                            fontSize: '0.7rem',
                                            padding: '0.15rem 0.4rem',
                                            borderRadius: '0.2rem',
                                            background: getStatusColor(apt.status),
                                            color: 'white',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            borderLeft: `2px solid ${getStatusBorderColor(apt.status)}`,
                                            flexShrink: 0
                                        }}>
                                            {formatTime(apt.startTime)} - {apt.client?.profile?.name || 'Client'}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

const navButtonStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'white',
    width: '32px',
    height: '32px',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    fontSize: '1rem'
};

const todayButtonStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    color: 'white',
    padding: '0.4rem 0.8rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
    boxShadow: '0 4px 6px -1px rgba(102, 126, 234, 0.4)'
};

function getStatusColor(status: string) {
    switch (status) {
        case 'confirmed': return 'rgba(16, 185, 129, 0.2)';
        case 'pending': return 'rgba(245, 158, 11, 0.2)';
        case 'cancelled': return 'rgba(239, 68, 68, 0.2)';
        case 'completed': return 'rgba(59, 130, 246, 0.2)';
        default: return 'rgba(148, 163, 184, 0.2)';
    }
}

function getStatusBorderColor(status: string) {
    switch (status) {
        case 'confirmed': return '#10b981';
        case 'pending': return '#f59e0b';
        case 'cancelled': return '#ef4444';
        case 'completed': return '#3b82f6';
        default: return '#94a3b8';
    }
}
