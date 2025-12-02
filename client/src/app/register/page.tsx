'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/api';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import GlassIcon from '@/components/ui/GlassIcon';
import { Calendar, Briefcase, Lock, Mail, MessageSquare, Phone } from 'lucide-react';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['CLIENT', 'PROVIDER'])
});

const COUNTRY_CODES = [
    { code: '+1', country: 'US' },
    { code: '+44', country: 'UK' },
    { code: '+91', country: 'IN' },
    { code: '+61', country: 'AU' }
];

export default function RegisterPage() {
    const searchParams = useSearchParams();
    const roleParam = searchParams.get('role');
    const initialRole = (roleParam === 'provider' || roleParam === 'PROVIDER') ? 'PROVIDER' : 'CLIENT';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        countryCode: '+1',
        channel: 'EMAIL' as 'EMAIL' | 'SMS' | 'WHATSAPP',
        password: '',
        role: initialRole as 'CLIENT' | 'PROVIDER'
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const { showToast } = useToast();

    const validate = () => {
        try {
            registerSchema.parse(formData);
            setErrors({});
            return true;
        } catch (err) {
            if (err instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};
                (err as any).errors.forEach((e: z.ZodIssue) => {
                    if (e.path[0]) newErrors[e.path[0].toString()] = e.message;
                });
                setErrors(newErrors);
            }
            return false;
        }
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const fullPhone = `${formData.countryCode}${formData.phone}`;
            await api.post('/auth/send-verification-otp', {
                email: formData.email,
                phone: fullPhone,
                channel: formData.channel
            });
            showToast(`OTP sent to your ${formData.channel.toLowerCase()}`, 'success');
            setIsOtpSent(true);
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Failed to send OTP', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 4) {
            showToast('Please enter a valid OTP', 'error');
            return;
        }

        setLoading(true);
        try {
            // In a real app, verify OTP here first
            const fullPhone = `${formData.countryCode}${formData.phone}`;
            const { data } = await api.post('/auth/register', {
                ...formData,
                phone: fullPhone,
                otp
            });
            login(data.token, data.user);
            showToast('Account created successfully!', 'success');
        } catch (err: any) {
            showToast(err.response?.data?.error || 'Registration failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '6rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 className="heading-xl" style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>
                        Create Account
                    </h1>
                    <p className="text-muted">
                        Join us to manage your appointments seamlessly
                    </p>
                </div>

                {!isOtpSent ? (
                    <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <InputField
                            label="Full Name"
                            type="text"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                            error={errors.name}
                        />

                        <InputField
                            label="Email Address"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                            error={errors.email}
                        />

                        <div>
                            <label style={{ display: 'block', color: 'var(--dark-text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Phone Number
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <select
                                    value={formData.countryCode}
                                    onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                                    className="input-dark"
                                    style={{
                                        width: 'auto',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {COUNTRY_CODES.map(c => (
                                        <option key={c.code} value={c.code}>{c.code} ({c.country})</option>
                                    ))}
                                </select>
                                <input
                                    type="tel"
                                    placeholder="1234567890"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="input-dark"
                                    style={{
                                        flex: 1,
                                        borderColor: errors.phone ? 'var(--error)' : 'var(--dark-border)'
                                    }}
                                />
                            </div>
                            {errors.phone && <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.phone}</span>}
                        </div>

                        <InputField
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                            error={errors.password}
                        />

                        <div>
                            <label style={{ display: 'block', color: 'var(--dark-text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                                I want to...
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <RoleButton
                                    active={formData.role === 'CLIENT'}
                                    onClick={() => setFormData({ ...formData, role: 'CLIENT' })}
                                    label="Book Services"
                                    icon={<GlassIcon icon={Calendar} size={20} />}
                                />
                                <RoleButton
                                    active={formData.role === 'PROVIDER'}
                                    onClick={() => setFormData({ ...formData, role: 'PROVIDER' })}
                                    label="Offer Services"
                                    icon={<GlassIcon icon={Briefcase} size={20} />}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', color: 'var(--dark-text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: '500' }}>
                                Send OTP via
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
                            style={{ width: '100%', marginTop: '0.5rem' }}
                        >
                            {loading ? 'Sending OTP...' : 'Continue'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyAndRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                            {loading ? 'Verifying...' : 'Verify & Register'}
                        </button>

                        <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={loading}
                            className="btn"
                            style={{
                                background: 'rgba(148, 163, 184, 0.1)',
                                border: '1px solid var(--dark-border)',
                                color: 'var(--dark-text-muted)',
                                width: '100%'
                            }}
                        >
                            Resend OTP
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsOtpSent(false)}
                            className="btn btn-ghost"
                            style={{ width: '100%', textDecoration: 'underline' }}
                        >
                            Back to details
                        </button>
                    </form>
                )}

                <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid var(--dark-border)', paddingTop: '1.5rem' }}>
                    <p className="text-muted" style={{ margin: 0 }}>
                        Already have an account?{' '}
                        <Link href="/login" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: '600' }}>
                            Login
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

interface InputFieldProps {
    label: string;
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
}

function InputField({ label, type, placeholder, value, onChange, error }: InputFieldProps) {
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
                style={{
                    width: '100%',
                    borderColor: error ? 'var(--error)' : 'var(--dark-border)'
                }}
            />
            {error && <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{error}</span>}
        </div>
    );
}

function RoleButton({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="btn"
            style={{
                background: active ? 'rgba(129, 140, 248, 0.1)' : 'rgba(15, 23, 42, 0.5)',
                border: `1px solid ${active ? 'var(--brand-primary)' : 'var(--dark-border)'}`,
                padding: '0.75rem',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                color: active ? 'var(--brand-primary)' : 'var(--dark-text-muted)',
                width: '100%',
                height: '100%'
            }}
        >
            <span>{icon}</span>
            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{label}</span>
        </button>
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
