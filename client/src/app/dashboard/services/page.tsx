'use client';

import { useState, useEffect } from 'react';
import api from '@/api';
import { useAuth } from '@/context/AuthContext';
import GlassIcon from '@/components/ui/GlassIcon';
import { Clock, Users, Truck } from 'lucide-react';

interface Service {
    _id: string;
    name: string;
    description: string;
    category: string;
    subcategory?: string;
    duration: number;
    price: number;
    currency: string;
    maxCapacity: number;
    deliveryType?: string;
    availability: Record<string, string[]>;
}

interface DeliveryType {
    _id: string;
    name: string;
    description?: string;
}

interface Category {
    _id: string;
    name: string;
    description?: string;
    icon?: string;
    isActive: boolean;
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

export default function ServicesPage() {
    const { user } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [deliveryTypes, setDeliveryTypes] = useState<DeliveryType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filterCategory, setFilterCategory] = useState('All');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingService, setViewingService] = useState<Service | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        subcategory: '',
        deliveryType: '',
        duration: 60,
        price: 0,
        currency: 'INR',
        maxCapacity: 1,
        availability: {} as Record<string, string[]>
    });

    useEffect(() => {
        if (user) {
            fetchServices();
            fetchCategories();
            fetchDeliveryTypes();
        }
    }, [user]);

    const fetchDeliveryTypes = async () => {
        try {
            const { data } = await api.get('/delivery-types');
            setDeliveryTypes(data);
            if (data.length > 0 && !formData.deliveryType && !editingId) {
                setFormData(prev => ({ ...prev, deliveryType: data[0].name }));
            }
        } catch (error) {
            console.error('Error fetching delivery types:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
            if (data.length > 0 && !formData.category && !editingId) {
                setFormData(prev => ({ ...prev, category: data[0].name }));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchServices = async () => {
        try {
            const { data } = await api.get('/services', {
                params: { providerId: user?.id }
            });
            setServices(data);
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: categories.length > 0 ? categories[0].name : '',
            subcategory: '',
            deliveryType: deliveryTypes.length > 0 ? deliveryTypes[0].name : '',
            duration: 60,
            price: 0,
            currency: 'INR',
            maxCapacity: 1,
            availability: {}
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (service: Service) => {
        setEditingId(service._id);
        setFormData({
            name: service.name,
            description: service.description || '',
            category: service.category,
            subcategory: service.subcategory || '',
            deliveryType: service.deliveryType || (deliveryTypes.length > 0 ? deliveryTypes[0].name : ''),
            duration: service.duration,
            price: service.price,
            currency: service.currency,
            maxCapacity: service.maxCapacity,
            availability: service.availability || {}
        });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const submitData = {
            ...formData,
            duration: isNaN(formData.duration) ? 60 : formData.duration,
            price: isNaN(formData.price) ? 0 : formData.price,
            maxCapacity: isNaN(formData.maxCapacity) ? 1 : formData.maxCapacity
        };

        try {
            if (editingId) {
                await api.put(`/services/${editingId}`, submitData);
            } else {
                await api.post('/services', submitData);
            }
            resetForm();
            fetchServices();
        } catch (error) {
            alert(editingId ? 'Failed to update service' : 'Failed to create service');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this service?')) return;
        try {
            await api.delete(`/services/${id}`);
            fetchServices();
        } catch (error) {
            alert('Failed to delete service');
        }
    };

    const addTimeSlot = (day: string) => {
        const slots = formData.availability[day] || [];
        setFormData({
            ...formData,
            availability: {
                ...formData.availability,
                [day]: [...slots, '09:00-10:00']
            }
        });
    };

    const removeTimeSlot = (day: string, index: number) => {
        const slots = formData.availability[day] || [];
        setFormData({
            ...formData,
            availability: {
                ...formData.availability,
                [day]: slots.filter((_, i) => i !== index)
            }
        });
    };

    const updateTimeSlot = (day: string, index: number, value: string) => {
        const slots = formData.availability[day] || [];
        const newSlots = [...slots];
        newSlots[index] = value;
        setFormData({
            ...formData,
            availability: {
                ...formData.availability,
                [day]: newSlots
            }
        });
    };

    const filterCategories = ['All', ...Array.from(new Set(services.map(s => s.category)))];
    const filteredServices = services.filter(s => {
        const matchesCategory = filterCategory === 'All' || s.category === filterCategory;
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="heading-xl" style={{ margin: 0 }}>
                    Services
                </h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Search services..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-dark"
                        style={{ width: '250px' }}
                    />
                    <button
                        onClick={() => {
                            if (showForm) resetForm();
                            else setShowForm(true);
                        }}
                        className="btn btn-primary"
                    >
                        {showForm ? 'Cancel' : '+ New Service'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {filterCategories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className="btn"
                        style={{
                            background: filterCategory === cat ? 'var(--brand-primary)' : 'rgba(30, 41, 59, 0.5)',
                            color: filterCategory === cat ? 'white' : 'var(--dark-text-muted)',
                            border: '1px solid var(--dark-border)',
                            fontWeight: filterCategory === cat ? '600' : '400',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem'
            }}>
                {loading ? (
                    <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--dark-text-muted)' }}>Loading services...</div>
                ) : filteredServices.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--dark-text-muted)' }}>
                        {services.length === 0 ? 'No services yet. Create your first one!' : 'No services found matching your filters.'}
                    </div>
                ) : (
                    filteredServices.map(service => (
                        <div key={service._id} className="glass-card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '1.5rem', flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <span className="badge" style={{
                                            background: 'rgba(129, 140, 248, 0.1)',
                                            color: 'var(--brand-primary)',
                                            border: '1px solid rgba(129, 140, 248, 0.2)'
                                        }}>
                                            {service.category}
                                        </span>
                                        {service.subcategory && (
                                            <span className="badge" style={{
                                                background: 'rgba(52, 211, 153, 0.1)',
                                                color: 'var(--brand-accent)',
                                                border: '1px solid rgba(52, 211, 153, 0.2)'
                                            }}>
                                                {service.subcategory}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--brand-accent)' }}>
                                            ₹{service.price}
                                        </div>
                                    </div>
                                </div>

                                <h3 className="heading-lg" style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'white' }}>
                                    {service.name}
                                </h3>

                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--dark-text-muted)', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <GlassIcon icon={Clock} size={14} /> {service.duration} min
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <GlassIcon icon={Users} size={14} /> {service.maxCapacity} max
                                    </div>
                                    {service.deliveryType && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <GlassIcon icon={Truck} size={14} /> {service.deliveryType}
                                        </div>
                                    )}
                                </div>

                                {service.description && (
                                    <p style={{
                                        fontSize: '0.9rem',
                                        color: '#cbd5e1',
                                        lineHeight: '1.5',
                                        marginBottom: '0',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {service.description}
                                    </p>
                                )}
                            </div>

                            <div style={{
                                padding: '1rem 1.5rem',
                                background: 'rgba(15, 23, 42, 0.3)',
                                borderTop: '1px solid var(--dark-border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--dark-text-muted)' }}>
                                    {Object.keys(service.availability || {}).length} days available
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => setViewingService(service)}
                                        className="btn btn-ghost"
                                        style={{ color: 'var(--brand-secondary)', padding: '0.25rem 0.5rem' }}
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => handleEdit(service)}
                                        className="btn btn-ghost"
                                        style={{ color: '#60a5fa', padding: '0.25rem 0.5rem' }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(service._id)}
                                        className="btn btn-ghost"
                                        style={{ color: 'var(--error)', padding: '0.25rem 0.5rem' }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal Form */}
            {showForm && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{
                        background: 'var(--dark-surface)', padding: '2rem', width: '600px', maxHeight: '90vh', overflowY: 'auto',
                        color: 'white'
                    }}>
                        <h3 className="heading-lg" style={{ marginTop: 0, marginBottom: '1.5rem' }}>
                            {editingId ? 'Edit Service' : 'Create New Service'}
                        </h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <FormGroup label="Service Name">
                                    <input required type="text" placeholder="e.g. Men's Haircut" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-dark" />
                                </FormGroup>
                                <FormGroup label="Category">
                                    <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="input-dark">
                                        {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                                    </select>
                                </FormGroup>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <FormGroup label="Subcategory">
                                    <input type="text" placeholder="e.g. Hair Styling" value={formData.subcategory} onChange={e => setFormData({ ...formData, subcategory: e.target.value })} className="input-dark" />
                                </FormGroup>
                                <FormGroup label="Delivery Type">
                                    <select value={formData.deliveryType} onChange={e => setFormData({ ...formData, deliveryType: e.target.value })} className="input-dark">
                                        <option value="">Select Delivery Type</option>
                                        {deliveryTypes.map(dt => <option key={dt._id} value={dt.name}>{dt.name}</option>)}
                                    </select>
                                </FormGroup>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <FormGroup label="Duration (min)">
                                    <input required type="number" placeholder="60" min="15" step="15" value={isNaN(formData.duration) ? '' : formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value === '' ? NaN : parseInt(e.target.value) })} className="input-dark" />
                                </FormGroup>
                                <FormGroup label="Price (₹)">
                                    <input required type="number" placeholder="25.00" min="0" step="0.01" value={isNaN(formData.price) ? '' : formData.price} onChange={e => setFormData({ ...formData, price: e.target.value === '' ? NaN : parseFloat(e.target.value) })} className="input-dark" />
                                </FormGroup>
                                <FormGroup label="Capacity">
                                    <input required type="number" placeholder="1" min="1" value={isNaN(formData.maxCapacity) ? '' : formData.maxCapacity} onChange={e => setFormData({ ...formData, maxCapacity: e.target.value === '' ? NaN : parseInt(e.target.value) })} className="input-dark" />
                                </FormGroup>
                            </div>

                            <FormGroup label="Description">
                                <textarea placeholder="e.g. A complete haircut service including wash and style..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} className="input-dark" style={{ resize: 'none' }} />
                            </FormGroup>

                            <div style={{ borderTop: '1px solid var(--dark-border)', paddingTop: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--dark-text-muted)' }}>Weekly Availability</label>
                                <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                                    {DAYS.map(day => (
                                        <div key={day.key} style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ fontSize: '0.9rem' }}>{day.label}</span>
                                                <button type="button" onClick={() => addTimeSlot(day.key)} style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontSize: '0.8rem' }}>+ Add Slot</button>
                                            </div>
                                            {(formData.availability[day.key] || []).map((slot, index) => (
                                                <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                    <input type="text" value={slot} onChange={e => updateTimeSlot(day.key, index, e.target.value)} className="input-dark" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} />
                                                    <button type="button" onClick={() => removeTimeSlot(day.key, index)} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={resetForm} className="btn btn-ghost" style={{ flex: 1, border: '1px solid var(--dark-text-muted)' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingId ? 'Update Service' : 'Create Service'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {viewingService && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{
                        background: 'var(--dark-surface)', padding: '2rem', width: '600px', maxHeight: '90vh', overflowY: 'auto',
                        color: 'white', position: 'relative'
                    }}>
                        <button
                            onClick={() => setViewingService(null)}
                            style={{
                                position: 'absolute', top: '1rem', right: '1rem',
                                background: 'transparent', border: 'none', color: 'var(--dark-text-muted)',
                                fontSize: '1.5rem', cursor: 'pointer'
                            }}
                        >
                            ×
                        </button>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <span className="badge" style={{
                                background: 'rgba(129, 140, 248, 0.1)',
                                color: 'var(--brand-primary)',
                                border: '1px solid rgba(129, 140, 248, 0.2)',
                                marginRight: '0.5rem'
                            }}>
                                {viewingService.category}
                            </span>
                            {viewingService.subcategory && (
                                <span className="badge" style={{
                                    background: 'rgba(52, 211, 153, 0.1)',
                                    color: 'var(--brand-accent)',
                                    border: '1px solid rgba(52, 211, 153, 0.2)'
                                }}>
                                    {viewingService.subcategory}
                                </span>
                            )}
                        </div>

                        <h2 className="heading-xl" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{viewingService.name}</h2>
                        <div style={{ fontSize: '1.5rem', color: 'var(--brand-accent)', fontWeight: '700', marginBottom: '1.5rem' }}>
                            ₹{viewingService.price}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '1rem', borderRadius: '0.5rem' }}>
                                <div style={{ color: 'var(--dark-text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Duration</div>
                                <div style={{ fontWeight: '600' }}>{viewingService.duration} min</div>
                            </div>
                            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '1rem', borderRadius: '0.5rem' }}>
                                <div style={{ color: 'var(--dark-text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Capacity</div>
                                <div style={{ fontWeight: '600' }}>{viewingService.maxCapacity} people</div>
                            </div>
                            {viewingService.deliveryType && (
                                <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '1rem', borderRadius: '0.5rem' }}>
                                    <div style={{ color: 'var(--dark-text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Delivery Type</div>
                                    <div style={{ fontWeight: '600' }}>{viewingService.deliveryType}</div>
                                </div>
                            )}
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 className="heading-lg" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Description</h3>
                            <p style={{ color: '#cbd5e1', lineHeight: '1.6' }}>
                                {viewingService.description || 'No description provided.'}
                            </p>
                        </div>

                        <div>
                            <h3 className="heading-lg" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Weekly Availability</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem' }}>
                                {DAYS.map(day => {
                                    const slots = viewingService.availability?.[day.key];
                                    if (!slots || slots.length === 0) return null;
                                    return (
                                        <div key={day.key} style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--dark-text-muted)', marginBottom: '0.25rem' }}>{day.label}</div>
                                            {slots.map((slot, i) => (
                                                <div key={i} style={{ fontSize: '0.9rem', fontWeight: '500' }}>{slot}</div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function FormGroup({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--dark-text-muted)' }}>{label}</label>
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
    fontSize: '0.9rem',
    width: '100%'
};

const buttonStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    flex: 1
};
