'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Users, Shield, Calendar, Sparkles } from 'lucide-react';

export default function GuestHero() {
    return (
        <section style={{
            position: 'relative',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            background: '#0f172a',
            color: 'white',
            padding: '6rem 2rem'
        }}>
            {/* Dynamic Background */}
            <div style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-20%',
                    left: '-10%',
                    width: '60%',
                    height: '60%',
                    background: 'radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                    animation: 'pulse 10s infinite alternate'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-20%',
                    right: '-10%',
                    width: '60%',
                    height: '60%',
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                    animation: 'pulse 10s infinite alternate-reverse'
                }} />
                <div style={{
                    position: 'absolute',
                    top: '40%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    height: '80%',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
                    filter: 'blur(100px)',
                }} />
            </div>

            <div style={{
                maxWidth: '1200px',
                width: '100%',
                margin: '0 auto',
                position: 'relative',
                zIndex: 1,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4rem',
                alignItems: 'center'
            }}>
                {/* Left Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '50px',
                            marginBottom: '2rem',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <Sparkles size={16} className="text-yellow-400" />
                        <span style={{ fontSize: '0.9rem', fontWeight: '600', letterSpacing: '0.5px' }}>
                            REVOLUTIONIZING SCHEDULING
                        </span>
                    </motion.div>

                    <h1 style={{
                        fontSize: 'clamp(3rem, 5vw, 4.5rem)',
                        fontWeight: '800',
                        lineHeight: '1.1',
                        marginBottom: '1.5rem',
                        background: 'linear-gradient(to right, #fff, #94a3b8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Find Experts.<br />
                        <span style={{ color: '#818cf8', WebkitTextFillColor: '#818cf8' }}>Grow Business.</span>
                    </h1>

                    <p style={{
                        fontSize: '1.25rem',
                        color: '#94a3b8',
                        marginBottom: '3rem',
                        maxWidth: '540px',
                        lineHeight: '1.6'
                    }}>
                        The ultimate marketplace. Book top-rated professionals for your needs, or list your services and manage your business with powerful tools.
                    </p>

                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <Link href="/services" style={{ textDecoration: 'none' }}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    padding: '1rem 2.5rem',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.5)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                Find a Pro <ArrowRight size={20} />
                            </motion.button>
                        </Link>

                        <Link href="/register?role=provider" style={{ textDecoration: 'none' }}>
                            <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    padding: '1rem 2.5rem',
                                    background: 'transparent',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '12px',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                List Your Business
                            </motion.button>
                        </Link>
                    </div>

                    <div style={{ marginTop: '4rem', display: 'flex', gap: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'white' }}>10k+</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Active Users</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'white' }}>500+</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Providers</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'white' }}>4.9</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Average Rating</div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Visual */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{ position: 'relative' }}
                    className="hidden md:block"
                >
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '1/1',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                        borderRadius: '2rem',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(20px)',
                        padding: '2rem',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        {/* Floating Cards */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            style={{
                                position: 'absolute',
                                top: '10%',
                                right: '-5%',
                                background: 'rgba(30, 41, 59, 0.8)',
                                padding: '1rem',
                                borderRadius: '1rem',
                                border: '1px solid rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                                zIndex: 2
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ background: '#10b981', padding: '0.5rem', borderRadius: '0.5rem' }}>
                                    <Calendar size={20} color="white" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>New Booking</div>
                                    <div style={{ fontWeight: '600' }}>Today, 2:00 PM</div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 15, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            style={{
                                position: 'absolute',
                                bottom: '15%',
                                left: '-5%',
                                background: 'rgba(30, 41, 59, 0.8)',
                                padding: '1rem',
                                borderRadius: '1rem',
                                border: '1px solid rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                                zIndex: 2
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ background: '#f59e0b', padding: '0.5rem', borderRadius: '0.5rem' }}>
                                    <Star size={20} color="white" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>New Review</div>
                                    <div style={{ fontWeight: '600' }}>5.0 Excellent!</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Abstract UI Representation */}
                        <div style={{
                            width: '100%',
                            height: '100%',
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: '1.5rem',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ width: '30%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px' }} />
                            </div>
                            <div style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
                                {[1, 2, 3].map((i) => (
                                    <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ width: '60%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '0.5rem' }} />
                                            <div style={{ width: '40%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.1); opacity: 0.8; }
        }
        .hidden.md\\:block {
           display: none;
        }
        @media (min-width: 768px) {
          .hidden.md\\:block {
            display: block !important;
          }
        }
      `}</style>
        </section>
    );
}
