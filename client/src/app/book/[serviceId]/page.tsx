'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Clock,
    CheckCircle,
    ArrowLeft,
    ChevronRight,
    Info,
    CreditCard,
    User,
    Shield
} from 'lucide-react';

interface Service {
    _id: string;
    name: string;
    description: string;
    category: string;
    subcategory?: string;
    deliveryType?: string;
    duration: number;
    price: number;
    currency: string;
    maxCapacity: number;
    availability?: { [key: string]: string[] };
    providerId: {
        _id: string;
        email: string;
        profile: { name: string };
    };
}

interface TimeSlot {
    time: string;
    available: boolean;
}

export default function BookServicePage({ params }: { params: Promise<{ serviceId: string }> }) {
    const { serviceId } = use(params);
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { showToast } = useToast();

    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [notes, setNotes] = useState('');
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push(`/login?redirect=/book/${serviceId}`);
        }
    }, [authLoading, user, router, serviceId]);

    useEffect(() => {
        if (user && serviceId) {
            loadService();
        }
    }, [user, serviceId]);

    const loadService = async () => {
        try {
            const { data } = await api.get(`/services/${serviceId}`);
            setService(data);
            setLoading(false);
        } catch (err) {
            console.error('Error loading service:', err);
            setLoading(false);
        }
    };

    const loadSlots = async (date: string) => {
        setLoadingSlots(true);
        try {
            const { data } = await api.get(`/services/${serviceId}/slots?date=${date}`);
            setSlots(data);
        } catch (err) {
            console.error('Error loading slots:', err);
            setSlots([]);
        }
        setLoadingSlots(false);
    };

    const selectDate = (date: string) => {
        setSelectedDate(date);
        setSelectedTime('');
        loadSlots(date);
        setStep(2);
    };

    const selectTime = (time: string) => {
        setSelectedTime(time);
        setStep(3);
    };

    const confirmBooking = async () => {
        if (!service || !selectedDate || !selectedTime) return;

        setSubmitting(true);
        try {
            const startTime = new Date(`${selectedDate}T${selectedTime}`);
            await api.post('/appointments', {
                serviceId: service._id,
                providerId: service.providerId._id,
                startTime: startTime.toISOString(),
                notes
            });
            showToast('Booking confirmed successfully!', 'success');
            setStep(4);
        } catch (err: any) {
            console.error('Booking error:', err);
            showToast(err.response?.data?.error || 'Failed to create booking', 'error');
        }
        setSubmitting(false);
    };

    const getDays = () => {
        const days = [];
        for (let i = 0; i < 14; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
            const isAvailable = service?.availability && service.availability[dayName] && service.availability[dayName].length > 0;
            days.push({
                date: d.toISOString().split('T')[0],
                day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                num: d.getDate(),
                month: d.toLocaleDateString('en-US', { month: 'short' }),
                available: isAvailable || false
            });
        }
        return days;
    };

    if (authLoading || loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dark-bg)' }}>
                <div style={{ fontSize: '1.5rem', color: 'var(--dark-text-muted)' }}>Loading...</div>
            </div>
        );
    }

    if (!user) return null;

    if (!service) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dark-bg)', flexDirection: 'column' }}>
                <h2 className="heading-lg" style={{ color: 'white', marginBottom: '1rem' }}>Service not found</h2>
                <button onClick={() => router.push('/services')} className="btn btn-primary">
                    Browse Services
                </button>
            </div>
        );
    }

    const days = getDays();

    return (
        <div className="page-container" style={{ paddingTop: '6rem' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '2rem' }}
            >
                <button
                    onClick={() => step > 1 && step < 4 ? setStep(step - 1) : router.back()}
                    className="btn btn-ghost"
                    style={{
                        padding: '0.5rem 0',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <ArrowLeft size={18} />
                    {step === 1 ? 'Cancel Booking' : 'Back'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <h1 className="heading-xl" style={{ fontSize: '2rem', marginBottom: 0 }}>
                        {step === 4 ? 'Booking Confirmed!' : `Book: ${service.name}`}
                    </h1>

                    {step < 4 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {[1, 2, 3].map(s => (
                                <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: step >= s ? 'var(--brand-primary)' : 'rgba(15, 23, 42, 0.5)',
                                        border: step >= s ? 'none' : '1px solid var(--dark-border)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '700',
                                        fontSize: '0.9rem',
                                        boxShadow: step >= s ? '0 0 10px rgba(99, 102, 241, 0.5)' : 'none',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        {step > s ? <CheckCircle size={16} /> : s}
                                    </div>
                                    {s < 3 && (
                                        <div style={{
                                            width: '40px',
                                            height: '2px',
                                            background: step > s ? 'var(--brand-primary)' : 'var(--dark-border)',
                                            margin: '0 0.5rem',
                                            transition: 'all 0.3s ease'
                                        }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '2rem', alignItems: 'start' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {step === 1 && (
                                <div className="glass-card" style={{ padding: '2rem' }}>
                                    <h2 className="heading-lg" style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <Calendar className="text-brand-primary" size={24} />
                                        Select a Date
                                    </h2>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem' }}>
                                        {days.map(d => (
                                            <button
                                                key={d.date}
                                                disabled={!d.available}
                                                onClick={() => d.available && selectDate(d.date)}
                                                style={{
                                                    padding: '1rem',
                                                    border: selectedDate === d.date ? '1px solid var(--brand-primary)' : '1px solid var(--dark-border)',
                                                    borderRadius: '0.75rem',
                                                    background: selectedDate === d.date ? 'rgba(99, 102, 241, 0.1)' : 'rgba(15, 23, 42, 0.3)',
                                                    cursor: d.available ? 'pointer' : 'not-allowed',
                                                    textAlign: 'center',
                                                    opacity: d.available ? 1 : 0.4,
                                                    transition: 'all 0.2s',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <div style={{ fontSize: '0.8rem', color: 'var(--dark-text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>{d.day}</div>
                                                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: d.available ? 'white' : 'var(--dark-text-muted)', marginBottom: '0.25rem' }}>{d.num}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--dark-text-muted)' }}>{d.month}</div>
                                                {selectedDate === d.date && (
                                                    <motion.div
                                                        layoutId="selected-date"
                                                        style={{
                                                            position: 'absolute',
                                                            inset: 0,
                                                            border: '2px solid var(--brand-primary)',
                                                            borderRadius: '0.75rem',
                                                            pointerEvents: 'none'
                                                        }}
                                                    />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    {service?.availability && Object.keys(service.availability).length > 0 && (
                                        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.75rem', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', gap: '0.75rem' }}>
                                            <Info size={20} className="text-brand-primary" style={{ flexShrink: 0 }} />
                                            <div>
                                                <div style={{ fontSize: '0.9rem', color: 'white', fontWeight: '600', marginBottom: '0.25rem' }}>Availability Info</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--dark-text-muted)' }}>
                                                    This service is generally available on: <span style={{ color: 'var(--brand-secondary)' }}>{Object.keys(service.availability).filter(day => service.availability![day].length > 0).map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === 2 && (
                                <div className="glass-card" style={{ padding: '2rem' }}>
                                    <h2 className="heading-lg" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <Clock className="text-brand-primary" size={24} />
                                        Select a Time
                                    </h2>
                                    <p style={{ color: 'var(--dark-text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
                                        for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>

                                    {loadingSlots ? (
                                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--dark-text-muted)' }}>
                                            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
                                            Checking availability...
                                        </div>
                                    ) : slots.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(15, 23, 42, 0.3)', borderRadius: '1rem' }}>
                                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '0.5rem' }}>No slots available</h3>
                                            <p style={{ color: 'var(--dark-text-muted)', marginBottom: '1.5rem' }}>Please select a different date</p>
                                            <button onClick={() => setStep(1)} className="btn btn-outline">Choose Another Date</button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '1rem' }}>
                                            {slots.map(slot => (
                                                <button
                                                    key={slot.time}
                                                    disabled={!slot.available}
                                                    onClick={() => slot.available && selectTime(slot.time)}
                                                    style={{
                                                        padding: '0.75rem',
                                                        border: selectedTime === slot.time ? '1px solid var(--brand-primary)' : '1px solid var(--dark-border)',
                                                        borderRadius: '0.5rem',
                                                        background: selectedTime === slot.time ? 'var(--brand-primary)' : 'rgba(15, 23, 42, 0.3)',
                                                        color: !slot.available ? 'var(--dark-text-muted)' : 'white',
                                                        cursor: slot.available ? 'pointer' : 'not-allowed',
                                                        fontWeight: '600',
                                                        textDecoration: !slot.available ? 'line-through' : 'none',
                                                        opacity: !slot.available ? 0.5 : 1,
                                                        transition: 'all 0.2s',
                                                        fontSize: '1rem'
                                                    }}
                                                >
                                                    {slot.time}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === 3 && (
                                <div className="glass-card" style={{ padding: '2rem' }}>
                                    <h2 className="heading-lg" style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <CheckCircle className="text-brand-primary" size={24} />
                                        Confirm Booking
                                    </h2>

                                    <div style={{ marginBottom: '2rem', background: 'rgba(15, 23, 42, 0.3)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid var(--dark-border)' }}>
                                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                                <div style={{ padding: '0.5rem', background: 'rgba(129, 140, 248, 0.1)', borderRadius: '0.5rem' }}>
                                                    <CreditCard size={20} className="text-brand-primary" />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--dark-text-muted)', marginBottom: '0.25rem' }}>Service</div>
                                                    <div style={{ fontWeight: '600', color: 'white', fontSize: '1.1rem' }}>{service.name}</div>
                                                    <div style={{ fontSize: '0.9rem', color: 'var(--brand-secondary)' }}>{service.category}</div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                                <div style={{ padding: '0.5rem', background: 'rgba(129, 140, 248, 0.1)', borderRadius: '0.5rem' }}>
                                                    <Calendar size={20} className="text-brand-primary" />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--dark-text-muted)', marginBottom: '0.25rem' }}>Date & Time</div>
                                                    <div style={{ fontWeight: '600', color: 'white', fontSize: '1.1rem' }}>
                                                        {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', color: 'var(--brand-accent)' }}>at {selectedTime}</div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                                <div style={{ padding: '0.5rem', background: 'rgba(129, 140, 248, 0.1)', borderRadius: '0.5rem' }}>
                                                    <User size={20} className="text-brand-primary" />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--dark-text-muted)', marginBottom: '0.25rem' }}>Provider</div>
                                                    <div style={{ fontWeight: '600', color: 'white', fontSize: '1.1rem' }}>{service.providerId?.profile?.name || 'Provider'}</div>
                                                    <div style={{ fontSize: '0.9rem', color: 'var(--dark-text-muted)' }}>{service.providerId?.email}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '2rem' }}>
                                        <label style={{ fontSize: '0.95rem', fontWeight: '600', display: 'block', marginBottom: '0.75rem', color: 'var(--dark-text-muted)' }}>
                                            Notes (Optional)
                                        </label>
                                        <textarea
                                            value={notes}
                                            onChange={e => setNotes(e.target.value)}
                                            placeholder="Any special requests or information for the provider..."
                                            rows={4}
                                            className="input-dark"
                                            style={{ width: '100%', resize: 'vertical' }}
                                        />
                                    </div>

                                    <button
                                        onClick={confirmBooking}
                                        disabled={submitting}
                                        className="btn btn-primary"
                                        style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: '700', boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}
                                    >
                                        {submitting ? 'Confirming...' : 'Confirm Booking'}
                                    </button>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '50%',
                                            background: 'var(--brand-accent)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 1.5rem',
                                            boxShadow: '0 0 30px rgba(16, 185, 129, 0.5)'
                                        }}
                                    >
                                        <CheckCircle size={40} color="white" />
                                    </motion.div>

                                    <h2 className="heading-xl" style={{ fontSize: '2rem', marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #4ade80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                        Booking Confirmed!
                                    </h2>
                                    <p style={{ fontSize: '1.1rem', color: 'var(--dark-text-muted)', marginBottom: '2.5rem' }}>
                                        Your appointment has been successfully booked. A confirmation email has been sent to you.
                                    </p>

                                    <div style={{ background: 'rgba(15, 23, 42, 0.3)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2.5rem', textAlign: 'left', border: '1px solid var(--dark-border)' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Shield size={18} className="text-brand-accent" />
                                            Appointment Details
                                        </h3>
                                        <div style={{ display: 'grid', gap: '0.75rem', fontSize: '1rem', color: 'var(--dark-text-muted)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>Service:</span>
                                                <span style={{ color: 'white', fontWeight: '500' }}>{service.name}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>Date:</span>
                                                <span style={{ color: 'white', fontWeight: '500' }}>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>Time:</span>
                                                <span style={{ color: 'white', fontWeight: '500' }}>{selectedTime}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>Duration:</span>
                                                <span style={{ color: 'white', fontWeight: '500' }}>{service.duration} minutes</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>Provider:</span>
                                                <span style={{ color: 'white', fontWeight: '500' }}>{service.providerId?.profile?.name}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                        <button onClick={() => router.push('/my-appointments')} className="btn btn-primary">
                                            My Appointments
                                        </button>
                                        <button onClick={() => router.push('/services')} className="btn btn-ghost">
                                            Browse More
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {step < 4 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{ position: 'sticky', top: '8rem' }}
                        >
                            <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(129, 140, 248, 0.2)' }}>
                                <h3 className="heading-lg" style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Booking Summary</h3>
                                <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--dark-border)' }}>
                                    <div style={{ fontWeight: '600', color: 'white', marginBottom: '0.25rem', fontSize: '1.1rem' }}>{service.name}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--brand-secondary)' }}>{service.category}</div>
                                </div>
                                <div style={{ fontSize: '0.95rem', marginBottom: '1.5rem', display: 'grid', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--dark-text-muted)' }}>Duration:</span>
                                        <strong style={{ color: 'white' }}>{service.duration} min</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--dark-text-muted)' }}>Date:</span>
                                        <strong style={{ color: 'white' }}>{selectedDate ? new Date(selectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-'}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--dark-text-muted)' }}>Time:</span>
                                        <strong style={{ color: 'white' }}>{selectedTime || '-'}</strong>
                                    </div>
                                </div>
                                <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--brand-accent)', marginBottom: '0.25rem', fontWeight: '600' }}>Total Price</div>
                                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'white' }}>₹{service.price}</div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
