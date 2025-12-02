'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/api';
import { useToast } from '@/context/ToastContext';
import GlassIcon from '@/components/ui/GlassIcon';
import { Mail, MessageSquare, Phone, Lock, ArrowLeft, CheckCircle } from 'lucide-react';

type Channel = 'EMAIL' | 'SMS' | 'WHATSAPP';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<'REQUEST' | 'VERIFY'>('REQUEST');
    const [email, setEmail] = useState('');
    const [channel, setChannel] = useState<Channel>('EMAIL');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { showToast } = useToast();
    const router = useRouter();

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            showToast('Please enter your email address', 'error');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email, channel });
            showToast(`OTP sent to your ${channel.toLowerCase()}`, 'success');
            setStep('VERIFY');
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Failed to send OTP', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 6) {
            showToast('Please enter a valid 6-digit OTP', 'error');
            return;
        }
        if (newPassword.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { email, otp, newPassword });
            showToast('Password reset successfully! Please login.', 'success');
            router.push('/login');
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Failed to reset password', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '6rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 className="heading-xl" style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>
                        Forgot Password
                    </h1>
                    <p className="text-muted">
                        {step === 'REQUEST'
                            ? 'Select how you want to receive the OTP'
                            : 'Enter OTP and new password'}
                    </p>
                </div>

                {step === 'REQUEST' ? (
                    <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <InputField
                            label="Email Address"
                            type="email"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <div>
                            <label style={{ display: 'block', color: 'var(--dark-text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: '500' }}>
                                Send OTP via
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                                <ChannelButton
                                    active={channel === 'EMAIL'}
                                    onClick={() => setChannel('EMAIL')}
                                    icon={<GlassIcon icon={Mail} size={20} />}
                                    label="Email"
                                />
                                <ChannelButton
                                    active={channel === 'SMS'}
                                    onClick={() => setChannel('SMS')}
                                    icon={<GlassIcon icon={Phone} size={20} />}
                                    label="SMS"
                                />
                                <ChannelButton
                                    active={channel === 'WHATSAPP'}
                                    onClick={() => setChannel('WHATSAPP')}
                                    icon={<GlassIcon icon={MessageSquare} size={20} />}
                                    label="WhatsApp"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                        >
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                <GlassIcon icon={Lock} size={32} />
                            </div>
                            <p className="text-muted">
                                OTP sent to your {channel.toLowerCase()}
                            </p>
                        </div>

                        <InputField
                            label="Enter OTP"
                            type="text"
                            placeholder="6-digit code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            center
                        />

                        <InputField
                            label="New Password"
                            type="password"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />

                        <InputField
                            label="Confirm Password"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep('REQUEST')}
                            className="btn btn-ghost"
                            style={{ width: '100%', textDecoration: 'underline' }}
                        >
                            Change Email/Channel
                        </button>
                    </form>
                )}

                <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid var(--dark-border)', paddingTop: '1.5rem' }}>
                    <Link href="/login" style={{
                        color: 'var(--dark-text-muted)',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        transition: 'color 0.2s'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--dark-text-muted)'}
                    >
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

interface InputFieldProps {
    label: string;
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    maxLength?: number;
    center?: boolean;
}

function InputField({ label, type, placeholder, value, onChange, maxLength, center }: InputFieldProps) {
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
                maxLength={maxLength}
                className="input-dark"
                style={{
                    width: '100%',
                    fontSize: center ? '1.25rem' : '0.9rem',
                    textAlign: center ? 'center' : 'left',
                    letterSpacing: center ? '0.25rem' : 'normal'
                }}
            />
        </div>
    );
}

interface ChannelButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}

function ChannelButton({ active, onClick, icon, label }: ChannelButtonProps) {
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
