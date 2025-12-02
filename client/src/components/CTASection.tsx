'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTASection() {
    return (
        <section style={{
            padding: '8rem 2rem',
            background: '#0f172a',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {/* Background Gradients */}
            <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                zIndex: 0
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-20%',
                    left: '20%',
                    width: '60%',
                    height: '60%',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-20%',
                    right: '20%',
                    width: '60%',
                    height: '60%',
                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                }} />
            </div>

            <div style={{
                maxWidth: '900px',
                width: '100%',
                position: 'relative',
                zIndex: 1,
                textAlign: 'center'
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="glass-card"
                    style={{
                        padding: '4rem 2rem',
                        background: 'rgba(30, 41, 59, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '2rem',
                        boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '50px',
                        marginBottom: '2rem',
                        color: '#fbbf24'
                    }}>
                        <Sparkles size={16} />
                        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'white' }}>
                            Join the Future of Service
                        </span>
                    </div>

                    <h2 style={{
                        fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                        fontWeight: '800',
                        marginBottom: '1.5rem',
                        color: 'white',
                        lineHeight: '1.2'
                    }}>
                        Ready to Transform Your Experience?
                    </h2>

                    <p style={{
                        fontSize: '1.2rem',
                        color: '#94a3b8',
                        marginBottom: '3rem',
                        maxWidth: '600px',
                        margin: '0 auto 3rem',
                        lineHeight: '1.6'
                    }}>
                        Whether you're looking for top-tier professionals or growing your service business, we have the tools you need to succeed.
                    </p>

                    <div style={{
                        display: 'flex',
                        gap: '1.5rem',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <Link href="/register" style={{ textDecoration: 'none' }}>
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
                                Get Started Now <ArrowRight size={20} />
                            </motion.button>
                        </Link>

                        <Link href="/services" style={{ textDecoration: 'none' }}>
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
                                Explore Marketplace
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
