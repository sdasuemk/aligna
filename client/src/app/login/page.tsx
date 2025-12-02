'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/api';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import GlassIcon from '@/components/ui/GlassIcon';
import { Lock, Mail, MessageSquare, Phone, LogIn } from 'lucide-react';
import { Suspense } from 'react';

function LoginForm() {
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        channel: 'EMAIL' as 'EMAIL' | 'SMS' | 'WHATSAPP'
    });
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'CREDENTIALS' | 'OTP'>('CREDENTIALS');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const { showToast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', formData);
            if (data.requireOtp) {
                setStep('OTP');
                showToast(data.message, 'success');
            } else {
                // Fallback for legacy behavior if any
                login(data.token, data.user, redirect || undefined);
                showToast('Successfully logged in!', 'success');
            }
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Login failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 6) {
            showToast('Please enter a valid 6-digit OTP', 'error');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/auth/login-verify', {
                email: formData.email,
                otp
            });
            login(data.token, data.user, redirect || undefined);
            showToast('Successfully logged in!', 'success');
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Verification failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '6rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 className="heading-xl" style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>
                        Welcome Back
                    </h1>
                    <p className="text-muted">
                        Sign in to access your dashboard
                    </p>
                </div>

                {step === 'CREDENTIALS' ? (
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <InputField
                            label="Email Address"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />

                        <InputField
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />

                        <div>
                            <label style={{ display: 'block', color: 'var(--dark-text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: '500' }}>
                                Receive OTP via
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                                <ChannelButton
                                    active={formData.channel === 'EMAIL'}
                                    onClick={() => setFormData({ ...formData, channel: 'EMAIL' })}
                                    icon={<GlassIcon icon={Mail} size={20} />}
                                    label="Email"
                                />
                                <ChannelButton
                                    active={formData.channel === 'SMS'}
                                    onClick={() => setFormData({ ...formData, channel: 'SMS' })}
                                    icon={<GlassIcon icon={Phone} size={20} />}
                                    label="SMS"
                                />
                                <ChannelButton
                                    active={formData.channel === 'WHATSAPP'}
                                    onClick={() => setFormData({ ...formData, channel: 'WHATSAPP' })}
                                    icon={<GlassIcon icon={MessageSquare} size={20} />}
                                    label="WhatsApp"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {loading ? 'Sending OTP...' : (
                                <>
                                    <span>Sign In</span>
                                    <LogIn size={18} />
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                                <GlassIcon icon={Lock} size={32} />
                            </div>
                            <h3 className="heading-lg" style={{ fontSize: '1.5rem', margin: 0 }}>Enter OTP</h3>
                            <p className="text-muted">
                                OTP sent to your {formData.channel.toLowerCase()}
                            </p>
                        </div>

                        <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="input-dark"
                            style={{
                                fontSize: '1.5rem',
                                textAlign: 'center',
                                letterSpacing: '0.5rem',
                                padding: '1rem'
                            }}
                            maxLength={6}
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                        >
                            {loading ? 'Verifying...' : 'Verify & Login'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep('CREDENTIALS')}
                            className="btn btn-ghost"
                            style={{ width: '100%', textDecoration: 'underline' }}
                        >
                            Back to login
                        </button>
                    </form>
                )}

                <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid var(--dark-border)', paddingTop: '1.5rem' }}>
                    <p className="text-muted" style={{ margin: 0 }}>
                        Don't have an account?{' '}
                        <Link href="/register" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: '600' }}>
                            Register
                        </Link>
                    </p>
                    <div style={{ marginTop: '0.5rem' }}>
                        <Link href="/forgot-password" style={{ color: 'var(--dark-text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
                            Forgot Password?
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '6rem' }}>Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}

function InputField({ label, type, placeholder, value, onChange }: { label: string, type: string, placeholder: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
    return (
        <div>
            <label style={{ display: 'block', color: 'var(--dark-text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                {label}
            </label>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="input-dark"
                style={{ width: '100%' }}
            />
        </div>
    );
}

function ChannelButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="btn"
            style={{
                background: active ? 'rgba(129, 140, 248, 0.1)' : 'rgba(15, 23, 42, 0.5)',
                border: `1px solid ${active ? 'var(--brand-primary)' : 'var(--dark-border)'}`,
                padding: '0.75rem 0.5rem',
                borderRadius: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                color: active ? 'var(--brand-primary)' : 'var(--dark-text-muted)',
                width: '100%',
                height: '100%'
            }}
        >
            {icon}
            <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>{label}</span>
        </button>
    );
}
