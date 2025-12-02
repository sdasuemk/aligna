'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/api';

interface UserProfile {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    bio?: string;
    dob?: string;
    gender?: string;
    emergencyContact?: {
        name: string;
        phone: string;
        relation: string;
    };
}

export default function ProfilePage() {
    const router = useRouter();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<UserProfile>({
        name: '',
        email: '',
        phone: '',
        address: '',
        bio: '',
        dob: '',
        gender: '',
        emergencyContact: {
            name: '',
            phone: '',
            relation: ''
        }
    });

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/users/profile');
            setFormData({
                name: data.profile?.name || '',
                email: data.email || '',
                phone: data.profile?.phone || '',
                address: data.profile?.address || '',
                bio: data.profile?.bio || '',
                dob: data.profile?.dob ? new Date(data.profile.dob).toISOString().split('T')[0] : '',
                gender: data.profile?.gender || '',
                emergencyContact: {
                    name: data.profile?.emergencyContact?.name || '',
                    phone: data.profile?.emergencyContact?.phone || '',
                    relation: data.profile?.emergencyContact?.relation || ''
                }
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            showToast('Failed to load profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('emergency.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                emergencyContact: {
                    ...prev.emergencyContact!,
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/users/profile', {
                ...formData,
                emergencyContact: formData.emergencyContact
            });
            showToast('Profile updated successfully', 'success');
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast('Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '1.5rem', color: '#94a3b8' }}>Loading...</div>
            </div>
        );
    }

    const inputStyle = {
        width: '100%',
        padding: '0.6rem 1rem',
        border: '1px solid #cbd5e1',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        transition: 'all 0.2s ease-in-out',
        boxSizing: 'border-box' as 'border-box' // Explicitly cast to avoid type error
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Compact Header */}
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem 0 4rem' }}>
                <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => router.back()}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.9rem'
                        }}
                    >
                        ← Back
                    </button>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'white', margin: 0 }}>
                        My Profile
                    </h1>
                </div>
            </div>

            <div style={{ maxWidth: '100%', margin: '-3rem auto 2rem', padding: '0 2rem', position: 'relative', zIndex: 10 }}>
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    overflow: 'hidden'
                }}>
                    <form onSubmit={handleSubmit} style={{ padding: '2.5rem' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '2rem',
                            alignItems: 'start'
                        }}>
                            {/* Basic Information */}
                            <section style={{
                                paddingRight: '2rem',
                                borderRight: '1px solid #e2e8f0',
                                height: '100%'
                            }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                                    Basic Information
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <FormGroup label="Full Name">
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            style={inputStyle}
                                            required
                                        />
                                    </FormGroup>
                                    <FormGroup label="Email">
                                        <input
                                            type="email"
                                            value={formData.email}
                                            disabled
                                            style={{ ...inputStyle, background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }}
                                        />
                                    </FormGroup>
                                    <FormGroup label="Phone Number">
                                        <div style={{
                                            display: 'flex',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '0.5rem',
                                            overflow: 'hidden',
                                            transition: 'all 0.2s ease-in-out'
                                        }}>
                                            <select
                                                style={{
                                                    border: 'none',
                                                    background: '#f8fafc',
                                                    padding: '0 0.75rem',
                                                    borderRight: '1px solid #cbd5e1',
                                                    outline: 'none',
                                                    color: '#475569',
                                                    fontWeight: '600',
                                                    fontSize: '0.9rem',
                                                    cursor: 'pointer'
                                                }}
                                                defaultValue="+91"
                                            >
                                                <option value="+1">🇺🇸 +1</option>
                                                <option value="+91">🇮🇳 +91</option>
                                                <option value="+44">🇬🇧 +44</option>
                                                <option value="+61">🇦🇺 +61</option>
                                                <option value="+81">🇯🇵 +81</option>
                                                <option value="+86">🇨🇳 +86</option>
                                                <option value="+971">🇦🇪 +971</option>
                                            </select>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                style={{
                                                    ...inputStyle,
                                                    border: 'none',
                                                    borderRadius: 0,
                                                    flex: 1,
                                                    boxShadow: 'none'
                                                }}
                                                placeholder="12345 67890"
                                            />
                                        </div>
                                    </FormGroup>
                                    <FormGroup label="Date of Birth">
                                        <input
                                            type="date"
                                            name="dob"
                                            value={formData.dob}
                                            onChange={handleChange}
                                            style={inputStyle}
                                        />
                                    </FormGroup>
                                    <FormGroup label="Gender">
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            style={inputStyle}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                            <option value="Prefer not to say">Prefer not to say</option>
                                        </select>
                                    </FormGroup>
                                    {/* Gap for visual balance */}
                                    <div style={{ height: '2rem' }}></div>
                                </div>
                            </section>

                            {/* Address & Bio */}
                            <section style={{
                                paddingRight: '2rem',
                                borderRight: '1px solid #e2e8f0',
                                height: '100%'
                            }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                                    Address & Bio
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <FormGroup label="Address">
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            rows={4}
                                            style={{ ...inputStyle, resize: 'none' }}
                                        />
                                    </FormGroup>
                                    <FormGroup label="Bio">
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            rows={6}
                                            placeholder="Tell us a bit about yourself..."
                                            style={{ ...inputStyle, resize: 'none' }}
                                        />
                                    </FormGroup>
                                </div>
                            </section>

                            {/* Emergency Contact */}
                            <section>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                                    Emergency Contact
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <FormGroup label="Contact Name">
                                        <input
                                            type="text"
                                            name="emergency.name"
                                            value={formData.emergencyContact?.name}
                                            onChange={handleChange}
                                            style={inputStyle}
                                        />
                                    </FormGroup>
                                    <FormGroup label="Contact Phone">
                                        <input
                                            type="tel"
                                            name="emergency.phone"
                                            value={formData.emergencyContact?.phone}
                                            onChange={handleChange}
                                            style={inputStyle}
                                        />
                                    </FormGroup>
                                    <FormGroup label="Relation">
                                        <input
                                            type="text"
                                            name="emergency.relation"
                                            value={formData.emergencyContact?.relation}
                                            onChange={handleChange}
                                            style={inputStyle}
                                        />
                                    </FormGroup>
                                </div>
                            </section>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                            <button
                                type="submit"
                                disabled={saving}
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    padding: '0.875rem 2.5rem',
                                    fontWeight: '600',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    opacity: saving ? 0.7 : 1,
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 6px -1px rgba(102, 126, 234, 0.4)',
                                    fontSize: '1rem'
                                }}
                            >
                                {saving ? 'Saving...' : 'Update Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function FormGroup({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                {label}
            </label>
            {children}
        </div>
    );
}
