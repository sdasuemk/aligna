'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Search, Star, Clock, TrendingUp, Users, Shield, Zap, CheckCircle2 } from 'lucide-react';

export default function FeaturesSection() {
    const [activeTab, setActiveTab] = useState<'client' | 'provider'>('client');

    const features = {
        client: [
            {
                icon: Search,
                title: "Smart Discovery",
                description: "Find the perfect professional for your needs with advanced filters and verified reviews.",
                color: "blue"
            },
            {
                icon: Calendar,
                title: "Instant Booking",
                description: "Book appointments instantly without the back-and-forth emails or calls.",
                color: "indigo"
            },
            {
                icon: Clock,
                title: "Real-time Availability",
                description: "See up-to-date schedules and secure the slot that works best for you.",
                color: "violet"
            },
            {
                icon: Star,
                title: "Verified Reviews",
                description: "Make informed decisions based on genuine feedback from other community members.",
                color: "amber"
            }
        ],
        provider: [
            {
                icon: TrendingUp,
                title: "Business Growth",
                description: "Expand your reach and attract high-quality clients looking for your expertise.",
                color: "emerald"
            },
            {
                icon: Zap,
                title: "Automated Scheduling",
                description: "Let the system handle bookings, reminders, and cancellations 24/7.",
                color: "yellow"
            },
            {
                icon: Users,
                title: "Client Management",
                description: "Keep track of client history, preferences, and notes in one secure place.",
                color: "blue"
            },
            {
                icon: Shield,
                title: "Secure Payments",
                description: "Handle deposits and payments securely with integrated financial tools.",
                color: "rose"
            }
        ]
    };

    return (
        <section style={{
            padding: '8rem 2rem',
            background: '#0f172a',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Elements */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at center, rgba(30, 41, 59, 0.5) 0%, #0f172a 70%)',
                zIndex: 0
            }} />

            <div style={{ width: '100%', padding: '0 2rem', position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{
                            fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                            fontWeight: '800',
                            marginBottom: '1.5rem',
                            color: 'white'
                        }}
                    >
                        Everything You Need
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        style={{
                            fontSize: '1.2rem',
                            color: '#94a3b8',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}
                    >
                        Powerful tools tailored for both sides of the marketplace.
                    </motion.p>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '4rem',
                    gap: '1rem'
                }}>
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        padding: '0.5rem',
                        borderRadius: '1rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        gap: '0.5rem'
                    }}>
                        <TabButton
                            active={activeTab === 'client'}
                            onClick={() => setActiveTab('client')}
                            icon={Search}
                            label="For Clients"
                        />
                        <TabButton
                            active={activeTab === 'provider'}
                            onClick={() => setActiveTab('provider')}
                            icon={TrendingUp}
                            label="For Providers"
                        />
                    </div>
                </div>

                {/* Content */}
                <div style={{ minHeight: '400px' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: '2rem'
                            }}
                        >
                            {features[activeTab].map((feature, index) => (
                                <FeatureCard key={index} feature={feature} index={index} />
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                border: 'none',
                background: active ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'transparent',
                color: active ? 'white' : '#94a3b8',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease',
                boxShadow: active ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
            }}
        >
            <Icon size={18} />
            {label}
        </button>
    );
}

function FeatureCard({ feature, index }: any) {
    const Icon = feature.icon;

    const getColor = (color: string) => {
        const colors: any = {
            blue: '#3b82f6',
            indigo: '#6366f1',
            violet: '#8b5cf6',
            amber: '#f59e0b',
            emerald: '#10b981',
            yellow: '#eab308',
            rose: '#f43f5e'
        };
        return colors[color] || colors.blue;
    };

    const color = getColor(feature.color);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card"
            style={{
                padding: '2rem',
                background: 'rgba(30, 41, 59, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                height: '100%'
            }}
        >
            <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: `${color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color
            }}>
                <Icon size={24} />
            </div>

            <div>
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '0.75rem'
                }}>
                    {feature.title}
                </h3>
                <p style={{
                    color: '#94a3b8',
                    lineHeight: '1.6',
                    fontSize: '0.95rem'
                }}>
                    {feature.description}
                </p>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    color: color,
                    fontWeight: '600'
                }}>
                    <CheckCircle2 size={16} />
                    <span>Included</span>
                </div>
            </div>
        </motion.div>
    );
}
