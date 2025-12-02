'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/api';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import {
    Clock,
    Users,
    MapPin,
    Calendar,
    CheckCircle,
    ArrowLeft,
    DollarSign,
    Briefcase,
    Star,
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
    availability: Record<string, string[]>;
    providerId: {
        _id: string;
        email: string;
        profile: { name: string };
    };
}

const DAYS = [
    { key: 'mon', label: 'Monday' },
    { key: 'tue', label: 'Tuesday' },
    { key: 'wed', label: 'Wednesday' },
    { key: 'thu', label: 'Thursday' },
    { key: 'fri', label: 'Friday' },
    { key: 'sat', label: 'Saturday' },
    { key: 'sun', label: 'Sunday' }
];

export default function ServiceDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { user } = useAuth();
    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);
    const [serviceId, setServiceId] = useState<string>('');

    // Handle params
    useEffect(() => {
        const getId = async () => {
            // In Next.js 14, params might be a Promise
            const resolvedParams = await Promise.resolve(params);
            setServiceId(resolvedParams.id);
        };
        getId();
    }, [params]);

    useEffect(() => {
        if (serviceId) {
            fetchService();
        }
    }, [serviceId]);

    const fetchService = async () => {
        try {
            const { data } = await api.get(`/services/${serviceId}`);
            setService(data);
        } catch (error) {
            console.error('Error fetching service:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookNow = () => {
        if (!user) {
            router.push(`/login?redirect=/book/${serviceId}`);
            return;
        }
        router.push(`/book/${serviceId}`);
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dark-bg)' }}>
                <div style={{ fontSize: '1.5rem', color: 'var(--dark-text-muted)' }}>Loading service...</div>
            </div>
        );
    }

    if (!service) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dark-bg)', flexDirection: 'column' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                <h2 className="heading-lg" style={{ color: 'white' }}>
                    Service not found
                </h2>
                <button
                    onClick={() => router.push('/services')}
                    className="btn btn-primary"
                    style={{ marginTop: '1rem' }}
                >
                    Browse Services
                </button>
            </div>
        );
    }

    const totalSlots = Object.values(service.availability || {}).reduce((acc, slots) => acc + slots.length, 0);
    const totalHours = (totalSlots * service.duration) / 60;

    return (
        <div className="page-container" style={{ paddingTop: '6rem' }}>
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                    background: 'linear-gradient(180deg, rgba(15, 23, 42, 0) 0%, rgba(99, 102, 241, 0.05) 100%)',
                    padding: '2rem 0 4rem',
                    marginBottom: '2rem',
                    borderBottom: '1px solid var(--dark-border)'
                }}
            >
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <button
                        onClick={() => router.back()}
                        className="btn btn-ghost"
                        style={{
                            padding: '0.5rem 0',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <ArrowLeft size={18} />
                        Back to Services
                    </button>

                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
                        <div>
                            <span className="badge" style={{
                                backgroundColor: 'rgba(129, 140, 248, 0.1)',
                                color: 'var(--brand-primary)',
                                border: '1px solid rgba(129, 140, 248, 0.2)',
                                marginBottom: '1rem'
                            }}>
                                {service.category}
                            </span>
                            <h1 className="heading-xl" style={{ fontSize: '3rem', marginBottom: '0.5rem', lineHeight: '1.2' }}>
                                {service.name}
                            </h1>
                            {service.subcategory && (
                                <p style={{ fontSize: '1.2rem', color: 'var(--brand-secondary)', marginBottom: '1rem' }}>
                                    {service.subcategory}
                                </p>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'var(--gradient-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.9rem',
                                    color: 'white',
                                    fontWeight: 'bold'
                                }}>
                                    {service.providerId?.profile?.name?.charAt(0) || 'P'}
                                </div>
                                <span style={{ color: 'var(--dark-text-muted)' }}>
                                    by <span style={{ color: 'white', fontWeight: '600' }}>{service.providerId?.profile?.name || 'Provider'}</span>
                                </span>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--brand-accent)', lineHeight: '1' }}>
                                ₹{service.price}
                            </div>
                            <div style={{ color: 'var(--dark-text-muted)', marginTop: '0.5rem' }}>
                                per {service.duration} min session
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) 380px',
                    gap: '2.5rem',
                    alignItems: 'start'
                }}>
                    {/* Main Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        {/* Key Stats Grid */}
                        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                            <h3 className="heading-lg" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>
                                Service Overview
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem' }}>
                                <div style={{ padding: '1.25rem', background: 'rgba(15, 23, 42, 0.3)', borderRadius: '1rem', border: '1px solid var(--dark-border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                        <Clock size={20} color="var(--brand-primary)" />
                                        <span style={{ fontSize: '0.9rem', color: 'var(--dark-text-muted)' }}>Duration</span>
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>{service.duration} <span style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--dark-text-muted)' }}>min</span></div>
                                </div>
                                <div style={{ padding: '1.25rem', background: 'rgba(15, 23, 42, 0.3)', borderRadius: '1rem', border: '1px solid var(--dark-border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                        <Users size={20} color="var(--brand-secondary)" />
                                        <span style={{ fontSize: '0.9rem', color: 'var(--dark-text-muted)' }}>Capacity</span>
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>{service.maxCapacity} <span style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--dark-text-muted)' }}>people</span></div>
                                </div>
                                {service.deliveryType && (
                                    <div style={{ padding: '1.25rem', background: 'rgba(15, 23, 42, 0.3)', borderRadius: '1rem', border: '1px solid var(--dark-border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                            <MapPin size={20} color="var(--brand-accent)" />
                                            <span style={{ fontSize: '0.9rem', color: 'var(--dark-text-muted)' }}>Type</span>
                                        </div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>{service.deliveryType}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                            <h3 className="heading-lg" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                                About This Service
                            </h3>
                            <p style={{ fontSize: '1.05rem', color: 'var(--dark-text-muted)', lineHeight: '1.8' }}>
                                {service.description || 'No description provided.'}
                            </p>
                        </div>

                        {/* Weekly Schedule */}
                        <div className="glass-card" style={{ padding: '2rem' }}>
                            <h3 className="heading-lg" style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Calendar size={24} color="var(--brand-primary)" />
                                Weekly Availability
                            </h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {DAYS.map(day => {
                                    const slots = service.availability?.[day.key];
                                    if (!slots || slots.length === 0) return null;
                                    return (
                                        <div key={day.key} style={{
                                            padding: '1rem',
                                            border: '1px solid var(--dark-border)',
                                            borderRadius: '0.75rem',
                                            background: 'rgba(15, 23, 42, 0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1.5rem'
                                        }}>
                                            <div style={{ width: '100px', fontWeight: '600', color: 'white' }}>
                                                {day.label}
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', flex: 1 }}>
                                                {slots.map((slot, i) => (
                                                    <span key={i} style={{
                                                        backgroundColor: 'rgba(129, 140, 248, 0.15)',
                                                        color: 'var(--brand-primary)',
                                                        padding: '0.35rem 0.75rem',
                                                        borderRadius: '0.5rem',
                                                        fontSize: '0.9rem',
                                                        fontWeight: '500',
                                                        border: '1px solid rgba(129, 140, 248, 0.2)'
                                                    }}>
                                                        {slot}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* Sidebar - Booking Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <div className="glass-card" style={{ padding: '2rem', position: 'sticky', top: '8rem', border: '1px solid rgba(129, 140, 248, 0.3)' }}>
                            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--dark-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Total Price
                                </div>
                                <div style={{ fontSize: '3.5rem', fontWeight: '800', color: 'white', lineHeight: '1' }}>
                                    ₹{service.price}
                                </div>
                            </div>

                            <button
                                onClick={handleBookNow}
                                className="btn btn-primary"
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    marginBottom: '1.5rem',
                                    boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
                                }}
                            >
                                Book Appointment
                            </button>

                            {!user && (
                                <p style={{ fontSize: '0.9rem', color: 'var(--dark-text-muted)', textAlign: 'center', marginBottom: '1.5rem' }}>
                                    Please log in to continue booking
                                </p>
                            )}

                            <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--dark-border)' }}>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Shield size={16} color="var(--brand-accent)" />
                                    Service Guarantee
                                </h4>
                                <ul style={{ fontSize: '0.9rem', color: 'var(--dark-text-muted)', lineHeight: '2', listStyle: 'none', padding: 0 }}>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <CheckCircle size={16} color="var(--brand-accent)" />
                                        {service.duration} minute session
                                    </li>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <CheckCircle size={16} color="var(--brand-accent)" />
                                        Verified Provider
                                    </li>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <CheckCircle size={16} color="var(--brand-accent)" />
                                        Secure Payment
                                    </li>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <CheckCircle size={16} color="var(--brand-accent)" />
                                        Instant Confirmation
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
