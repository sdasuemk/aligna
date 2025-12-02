'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/api';

export default function SettingsPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState({
        type: user?.type || 'INDIVIDUAL',
        name: user?.profile?.name || '',
        bio: user?.profile?.bio || '',
        phone: user?.profile?.phone || '',
        website: user?.profile?.website || '',
        // Organization specific
        companyName: user?.profile?.companyName || '',
        taxId: user?.profile?.taxId || '',
        size: user?.profile?.size || '1-10'
    });

    // Security State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/users/profile', profileData);
            showToast('Profile updated successfully', 'success');
        } catch (error) {
            showToast('Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }
        setLoading(true);
        try {
            await api.put('/auth/update-password', passwordData);
            showToast('Password updated successfully', 'success');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            showToast('Failed to update password', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <h1 className="heading-xl" style={{ marginBottom: '2rem' }}>
                Settings
            </h1>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                {/* Sidebar Tabs */}
                <div className="glass-card" style={{
                    width: '250px',
                    padding: 0,
                    overflow: 'hidden'
                }}>
                    {[
                        'profile',
                        'availability',
                        'security',
                        ...(profileData.type === 'ORGANIZATION' ? ['team'] : [])
                    ].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                width: '100%',
                                padding: '1rem 1.5rem',
                                textAlign: 'left',
                                background: activeTab === tab ? 'rgba(129, 140, 248, 0.1)' : 'transparent',
                                border: 'none',
                                borderLeft: activeTab === tab ? '3px solid var(--brand-primary)' : '3px solid transparent',
                                color: activeTab === tab ? 'white' : 'var(--dark-text-muted)',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                fontWeight: activeTab === tab ? '600' : '400',
                                textTransform: 'capitalize',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="glass-card" style={{ flex: 1, padding: '2rem' }}>
                    {activeTab === 'profile' && (
                        <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 className="heading-lg" style={{ margin: 0, fontSize: '1.25rem' }}>Public Profile</h2>
                                <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.5)', padding: '4px', borderRadius: '0.5rem', border: '1px solid var(--dark-border)' }}>
                                    {(['INDIVIDUAL', 'ORGANIZATION'] as const).map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setProfileData({ ...profileData, type })}
                                            className="btn"
                                            style={{
                                                background: profileData.type === type ? 'var(--brand-primary)' : 'transparent',
                                                color: profileData.type === type ? 'white' : 'var(--dark-text-muted)',
                                                border: 'none',
                                                borderRadius: '0.3rem',
                                                padding: '0.5rem 1rem',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {type === 'INDIVIDUAL' ? 'Individual' : 'Organization'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {profileData.type === 'INDIVIDUAL' ? (
                                <>
                                    <FormGroup label="Display Name">
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                            className="input-dark"
                                            placeholder="e.g. John Doe"
                                        />
                                    </FormGroup>
                                </>
                            ) : (
                                <>
                                    <FormGroup label="Company Name">
                                        <input
                                            type="text"
                                            value={profileData.companyName}
                                            onChange={e => setProfileData({ ...profileData, companyName: e.target.value })}
                                            className="input-dark"
                                            placeholder="e.g. Acme Corp"
                                        />
                                    </FormGroup>
                                    <FormGroup label="Contact Person">
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                            className="input-dark"
                                            placeholder="e.g. Jane Smith"
                                        />
                                    </FormGroup>
                                </>
                            )}

                            <FormGroup label="Bio / Description">
                                <textarea
                                    value={profileData.bio}
                                    onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                                    rows={4}
                                    className="input-dark"
                                    style={{ resize: 'none' }}
                                    placeholder={profileData.type === 'INDIVIDUAL' ? "Tell us about yourself..." : "Describe your organization..."}
                                />
                            </FormGroup>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <FormGroup label="Phone">
                                    <input
                                        type="tel"
                                        value={profileData.phone}
                                        onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                                        className="input-dark"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </FormGroup>
                                <FormGroup label="Website">
                                    <input
                                        type="url"
                                        value={profileData.website}
                                        onChange={e => setProfileData({ ...profileData, website: e.target.value })}
                                        className="input-dark"
                                        placeholder="https://example.com"
                                    />
                                </FormGroup>
                            </div>

                            {profileData.type === 'ORGANIZATION' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <FormGroup label="Tax ID / EIN">
                                        <input
                                            type="text"
                                            value={profileData.taxId}
                                            onChange={e => setProfileData({ ...profileData, taxId: e.target.value })}
                                            className="input-dark"
                                            placeholder="XX-XXXXXXX"
                                        />
                                    </FormGroup>
                                    <FormGroup label="Organization Size">
                                        <select
                                            value={profileData.size}
                                            onChange={e => setProfileData({ ...profileData, size: e.target.value })}
                                            className="input-dark"
                                        >
                                            <option value="1-10">1-10 Employees</option>
                                            <option value="11-50">11-50 Employees</option>
                                            <option value="51-200">51-200 Employees</option>
                                            <option value="200+">200+ Employees</option>
                                        </select>
                                    </FormGroup>
                                </div>
                            )}

                            <div style={{ paddingTop: '1rem' }}>
                                <button type="submit" disabled={loading} className="btn btn-primary">
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'availability' && (
                        <div>
                            <h2 className="heading-lg" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Availability Management</h2>
                            <p style={{ color: 'var(--dark-text-muted)' }}>Working hours configuration coming soon...</p>
                            {/* Placeholder for availability grid */}
                            <div style={{
                                marginTop: '2rem',
                                height: '200px',
                                border: '2px dashed var(--dark-border)',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--dark-text-muted)'
                            }}>
                                Interactive Schedule Grid
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <h2 className="heading-lg" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Change Password</h2>
                            <FormGroup label="Current Password">
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="input-dark"
                                />
                            </FormGroup>
                            <FormGroup label="New Password">
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="input-dark"
                                />
                            </FormGroup>
                            <FormGroup label="Confirm New Password">
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="input-dark"
                                />
                            </FormGroup>
                            <div style={{ paddingTop: '1rem' }}>
                                <button type="submit" disabled={loading} className="btn btn-primary">
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'team' && (
                        <TeamManagement />
                    )}
                </div>
            </div>
        </div>
    );
}

function TeamManagement() {
    const { showToast } = useToast();
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        employeeRole: 'STAFF'
    });

    const fetchEmployees = async () => {
        try {
            const { data } = await api.get('/users/employees');
            setEmployees(data);
        } catch (error) {
            console.error('Failed to fetch employees', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/users/employees', newEmployee);
            showToast('Employee added successfully', 'success');
            setShowAddModal(false);
            setNewEmployee({ name: '', email: '', password: '', phone: '', employeeRole: 'STAFF' });
            fetchEmployees();
        } catch (error) {
            showToast('Failed to add employee', 'error');
        }
    };

    const handleDeleteEmployee = async (id: string) => {
        if (!confirm('Are you sure you want to remove this employee?')) return;
        try {
            await api.delete(`/users/employees/${id}`);
            showToast('Employee removed', 'success');
            fetchEmployees();
        } catch (error) {
            showToast('Failed to remove employee', 'error');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className="heading-lg" style={{ fontSize: '1.25rem', margin: 0 }}>Team Management</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                    + Add Employee
                </button>
            </div>

            {loading ? (
                <div>Loading team...</div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {employees.map(emp => (
                        <div key={emp._id} style={{
                            background: 'rgba(15, 23, 42, 0.5)',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--dark-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ fontWeight: '600', color: 'white' }}>{emp.profile?.name || emp.email}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--dark-text-muted)' }}>{emp.email} • {emp.employeeRole}</div>
                            </div>
                            <button
                                onClick={() => handleDeleteEmployee(emp._id)}
                                className="btn btn-ghost"
                                style={{ color: 'var(--error)', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showAddModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{
                        background: 'var(--dark-surface)', padding: '2rem', width: '400px',
                        border: '1px solid var(--dark-border)'
                    }}>
                        <h3 className="heading-lg" style={{ marginTop: 0, marginBottom: '1.5rem' }}>Add New Employee</h3>
                        <form onSubmit={handleAddEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <FormGroup label="Name">
                                <input required type="text" value={newEmployee.name} onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })} className="input-dark" />
                            </FormGroup>
                            <FormGroup label="Email">
                                <input required type="email" value={newEmployee.email} onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })} className="input-dark" />
                            </FormGroup>
                            <FormGroup label="Password">
                                <input required type="password" value={newEmployee.password} onChange={e => setNewEmployee({ ...newEmployee, password: e.target.value })} className="input-dark" />
                            </FormGroup>
                            <FormGroup label="Role">
                                <select value={newEmployee.employeeRole} onChange={e => setNewEmployee({ ...newEmployee, employeeRole: e.target.value })} className="input-dark">
                                    <option value="STAFF">Staff</option>
                                    <option value="MANAGER">Manager</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </FormGroup>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-ghost" style={{ flex: 1, border: '1px solid var(--dark-text-muted)' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add Employee</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function FormGroup({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--dark-text-muted)' }}>{label}</label>
            {children}
        </div>
    );
}

const inputStyle = {
    background: 'rgba(15, 23, 42, 0.5)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    color: 'white',
    outline: 'none',
    fontSize: '0.95rem',
    transition: 'border-color 0.2s'
};

const buttonStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    color: 'white',
    padding: '0.75rem 2rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.95rem',
    boxShadow: '0 4px 6px -1px rgba(102, 126, 234, 0.4)',
    opacity: 1,
    transition: 'opacity 0.2s'
};
