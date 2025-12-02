'use client';

import Link from 'next/link';
import { Layers, Facebook, Twitter, Instagram, Linkedin, Mail, ArrowRight } from 'lucide-react';

export default function Footer() {
    return (
        <footer style={{
            background: 'var(--dark-bg)',
            color: 'white',
            padding: '3rem 2rem 1.5rem', // Reduced padding
            marginTop: 'auto',
            borderTop: '1px solid var(--dark-border)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Glow */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle, rgba(6, 182, 212, 0.05) 0%, transparent 70%)',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '2.5rem', // Reduced gap
                    marginBottom: '2.5rem' // Reduced margin
                }}>
                    {/* Brand & Newsletter */}
                    <div style={{ gridColumn: 'span 1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{
                                width: '36px', // Slightly smaller
                                height: '36px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
                            }}>
                                <Layers size={20} strokeWidth={2.5} />
                            </div>
                            <h3 style={{
                                fontSize: '1.5rem', // Slightly smaller
                                fontWeight: '800',
                                margin: 0,
                                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                letterSpacing: '-0.02em'
                            }}>
                                Aligna
                            </h3>
                        </div>
                        <p style={{ color: 'var(--dark-text-muted)', lineHeight: '1.5', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            The all-in-one ecosystem for professionals to connect, schedule, and grow their business.
                        </p>

                        {/* Newsletter */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h5 style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'white' }}>Subscribe to our newsletter</h5>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <Mail size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--dark-text-muted)' }} />
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        style={{
                                            width: '100%',
                                            padding: '0.6rem 1rem 0.6rem 2.25rem',
                                            background: 'rgba(30, 41, 59, 0.4)',
                                            border: '1px solid var(--dark-border)',
                                            borderRadius: '0.5rem',
                                            color: 'white',
                                            fontSize: '0.85rem',
                                            outline: 'none',
                                            transition: 'border-color 0.2s'
                                        }}
                                    />
                                </div>
                                <button className="btn btn-primary" style={{ padding: '0.6rem', borderRadius: '0.5rem' }}>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Links Grid */}
                    <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        {/* Product */}
                        <div>
                            <h4 style={{ fontWeight: '700', marginBottom: '1rem', fontSize: '0.95rem' }}>Product</h4>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <FooterLink href="/register">Get Started</FooterLink>
                                <FooterLink href="/login">Login</FooterLink>
                                <FooterLink href="#">Features</FooterLink>
                                <FooterLink href="#">Pricing</FooterLink>
                                <FooterLink href="#">Marketplace</FooterLink>
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h4 style={{ fontWeight: '700', marginBottom: '1rem', fontSize: '0.95rem' }}>Company</h4>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <FooterLink href="#">About Us</FooterLink>
                                <FooterLink href="#">Careers</FooterLink>
                                <FooterLink href="#">Blog</FooterLink>
                                <FooterLink href="#">Press</FooterLink>
                                <FooterLink href="#">Partners</FooterLink>
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 style={{ fontWeight: '700', marginBottom: '1rem', fontSize: '0.95rem' }}>Support</h4>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <FooterLink href="#">Help Center</FooterLink>
                                <FooterLink href="#">Terms of Service</FooterLink>
                                <FooterLink href="#">Privacy Policy</FooterLink>
                                <FooterLink href="#">Cookie Policy</FooterLink>
                                <FooterLink href="#">Contact Us</FooterLink>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div style={{
                    borderTop: '1px solid var(--dark-border)',
                    paddingTop: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem',
                    textAlign: 'center'
                }}>
                    {/* Social Icons */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <SocialIcon icon={<Twitter size={16} />} href="#" />
                        <SocialIcon icon={<Facebook size={16} />} href="#" />
                        <SocialIcon icon={<Instagram size={16} />} href="#" />
                        <SocialIcon icon={<Linkedin size={16} />} href="#" />
                    </div>

                    <p style={{ color: 'var(--dark-text-muted)', fontSize: '0.85rem' }}>
                        © {new Date().getFullYear()} Aligna Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <li>
            <Link
                href={href}
                style={{
                    color: 'var(--dark-text-muted)',
                    transition: 'all 0.2s',
                    fontSize: '0.9rem',
                    display: 'inline-block'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--brand-primary)';
                    e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--dark-text-muted)';
                    e.currentTarget.style.transform = 'translateX(0)';
                }}
            >
                {children}
            </Link>
        </li>
    );
}

function SocialIcon({ icon, href }: { icon: React.ReactNode; href: string }) {
    return (
        <a
            href={href}
            style={{
                color: 'var(--dark-text-muted)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid var(--dark-border)'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.background = 'var(--brand-primary)';
                e.currentTarget.style.borderColor = 'var(--brand-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--dark-text-muted)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)';
                e.currentTarget.style.borderColor = 'var(--dark-border)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            {icon}
        </a>
    );
}
