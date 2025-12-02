'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/api';
import { motion } from 'framer-motion';
import { Search, Filter, Clock, Users, MapPin, ArrowRight, Sparkles, ArrowLeft } from 'lucide-react';
import GlassIcon from '@/components/ui/GlassIcon';

interface Service {
    _id: string;
    name: string;
    description: string;
    category: string;
    subcategory?: string;
    deliveryType?: string;
    duration: number;
    price: number;
    currency: string;
    maxCapacity: number;
    availability: Record<string, string[]>;
    providerId: {
        _id: string;
        email: string;
        profile: { name: string };
    };
}

interface Category {
    _id: string;
    name: string;
    description?: string;
    icon?: string;
    isActive: boolean;
}

interface DeliveryType {
    _id: string;
    name: string;
    description?: string;
}

export default function BrowseServicesPage() {
    const router = useRouter();
    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [deliveryTypes, setDeliveryTypes] = useState<DeliveryType[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterDeliveryType, setFilterDeliveryType] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('name'); // name, price-low, price-high, duration

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    useEffect(() => {
        fetchData();
    }, []);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterCategory, filterDeliveryType, searchQuery, sortBy]);

    const fetchData = async () => {
        try {
            const [servicesRes, categoriesRes, deliveryTypesRes] = await Promise.all([
                api.get('/services'),
                api.get('/categories'),
                api.get('/delivery-types')
            ]);
            setServices(servicesRes.data);
            setCategories(categoriesRes.data);
            setDeliveryTypes(deliveryTypesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter and sort logic
    const filteredServices = services
        .filter(service => {
            const matchesCategory = filterCategory === 'All' || service.category === filterCategory;
            const matchesDeliveryType = filterDeliveryType === 'All' || service.deliveryType === filterDeliveryType;
            const matchesSearch = searchQuery === '' ||
                service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                service.providerId?.profile?.name?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesDeliveryType && matchesSearch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'duration':
                    return a.duration - b.duration;
                default:
                    return a.name.localeCompare(b.name);
            }
        });

    // Pagination Logic
    const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
    const paginatedServices = filteredServices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const allCategories = ['All', ...categories.map(c => c.name)];

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dark-bg)' }}>
                <div style={{ fontSize: '1.5rem', color: 'var(--dark-text-muted)' }}>Loading services...</div>
            </div>
        );
    }

    return (
        <div className="page-container" style={{ paddingTop: '6rem', width: '100%', maxWidth: '100%', paddingLeft: '2rem', paddingRight: '2rem' }}>
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="btn btn-ghost"
                style={{
                    position: 'absolute',
                    top: '6rem',
                    left: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--dark-text-muted)',
                    zIndex: 10
                }}
            >
                <ArrowLeft size={20} />
                <span>Back</span>
            </button>

            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                    textAlign: 'center',
                    marginBottom: '3rem',
                    position: 'relative'
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '600px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    zIndex: -1
                }} />

                <h1 className="heading-xl" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                    Browse Services
                </h1>
                <p className="text-muted" style={{ fontSize: '1.1rem', margin: '0 auto', whiteSpace: 'nowrap' }}>
                    Discover and book the perfect service for your needs from our network of professionals.
                </p>
            </motion.div>

            <div style={{ width: '100%' }}>
                {/* Search and Controls */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="glass-panel"
                    style={{
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}
                >
                    {/* Search Bar */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, position: 'relative', minWidth: '280px' }}>
                            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--dark-text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search services, providers, or keywords..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input-dark"
                                style={{ paddingLeft: '3rem' }}
                            />
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="input-dark"
                            style={{ width: 'auto', minWidth: '180px', cursor: 'pointer' }}
                        >
                            <option value="name">Sort by Name</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="duration">Duration</option>
                        </select>
                    </div>

                    {/* Filters */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Categories */}
                        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
                            {allCategories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setFilterCategory(cat)}
                                    className="btn"
                                    style={{
                                        backgroundColor: filterCategory === cat ? 'var(--brand-primary)' : 'rgba(30, 41, 59, 0.5)',
                                        color: filterCategory === cat ? 'white' : 'var(--dark-text-muted)',
                                        border: filterCategory === cat ? 'none' : '1px solid var(--dark-border)',
                                        borderRadius: '2rem',
                                        padding: '0.5rem 1.25rem',
                                        whiteSpace: 'nowrap',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Delivery Types */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--dark-text-muted)', fontWeight: '600' }}>Delivery:</span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setFilterDeliveryType('All')}
                                    className="btn"
                                    style={{
                                        padding: '0.25rem 0.75rem',
                                        fontSize: '0.8rem',
                                        backgroundColor: filterDeliveryType === 'All' ? 'var(--brand-secondary)' : 'transparent',
                                        color: filterDeliveryType === 'All' ? 'white' : 'var(--dark-text-muted)',
                                        border: filterDeliveryType === 'All' ? 'none' : '1px solid var(--dark-border)',
                                        borderRadius: '0.5rem'
                                    }}
                                >
                                    All
                                </button>
                                {deliveryTypes.map((dt) => (
                                    <button
                                        key={dt._id}
                                        onClick={() => setFilterDeliveryType(dt.name)}
                                        className="btn"
                                        style={{
                                            padding: '0.25rem 0.75rem',
                                            fontSize: '0.8rem',
                                            backgroundColor: filterDeliveryType === dt.name ? 'var(--brand-secondary)' : 'transparent',
                                            color: filterDeliveryType === dt.name ? 'white' : 'var(--dark-text-muted)',
                                            border: filterDeliveryType === dt.name ? 'none' : '1px solid var(--dark-border)',
                                            borderRadius: '0.5rem'
                                        }}
                                    >
                                        {dt.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Results Count */}
                <div style={{ marginBottom: '1.5rem', color: 'var(--dark-text-muted)', fontSize: '0.95rem' }}>
                    Showing <strong style={{ color: 'white' }}>{filteredServices.length}</strong> {filteredServices.length === 1 ? 'service' : 'services'}
                </div>

                {/* Services Grid */}
                {filteredServices.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card"
                        style={{ padding: '4rem', textAlign: 'center' }}
                    >
                        <div style={{ marginBottom: '1.5rem', color: 'var(--dark-text-muted)' }}>
                            <Search size={48} strokeWidth={1.5} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '0.5rem' }}>
                            No services found
                        </h3>
                        <p className="text-muted">
                            Try adjusting your filters or search query to find what you're looking for.
                        </p>
                    </motion.div>
                ) : (
                    <>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {paginatedServices.map((service, index) => (
                                <motion.div
                                    key={service._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                    className="glass-card"
                                    onClick={() => router.push(`/services/${service._id}`)}
                                    style={{
                                        cursor: 'pointer',
                                        padding: '0',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    whileHover={{ y: -5, borderColor: 'rgba(129, 140, 248, 0.4)' }}
                                >
                                    {/* Card Header */}
                                    <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--dark-border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                            <span className="badge" style={{
                                                backgroundColor: 'rgba(129, 140, 248, 0.1)',
                                                color: 'var(--brand-primary)',
                                                border: '1px solid rgba(129, 140, 248, 0.2)'
                                            }}>
                                                {service.category}
                                            </span>
                                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--brand-accent)' }}>
                                                ₹{service.price}
                                            </div>
                                        </div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                                            {service.name}
                                        </h3>
                                        {service.subcategory && (
                                            <p style={{ fontSize: '0.85rem', color: 'var(--brand-secondary)', marginBottom: '0.5rem' }}>
                                                {service.subcategory}
                                            </p>
                                        )}
                                        <p style={{ fontSize: '0.85rem', color: 'var(--dark-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'white' }}>
                                                {service.providerId?.profile?.name?.charAt(0) || 'P'}
                                            </span>
                                            {service.providerId?.profile?.name || 'Provider'}
                                        </p>
                                    </div>

                                    {/* Card Body */}
                                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <p style={{
                                            fontSize: '0.9rem',
                                            color: 'var(--dark-text-muted)',
                                            lineHeight: '1.6',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            marginBottom: '1.5rem',
                                            flex: 1
                                        }}>
                                            {service.description || 'No description available'}
                                        </p>

                                        {/* Stats */}
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '1rem',
                                            fontSize: '0.85rem',
                                            color: 'var(--dark-text-muted)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Clock size={16} color="var(--brand-primary)" />
                                                {service.duration} min
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Users size={16} color="var(--brand-secondary)" />
                                                Up to {service.maxCapacity}
                                            </div>
                                            {service.deliveryType && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <MapPin size={16} color="var(--brand-accent)" />
                                                    {service.deliveryType}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div style={{
                                        padding: '0.75rem 1.25rem',
                                        backgroundColor: 'rgba(15, 23, 42, 0.3)',
                                        borderTop: '1px solid var(--dark-border)'
                                    }}>
                                        <button
                                            className="btn btn-primary"
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <span>View Details</span>
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '3rem' }}>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="btn btn-ghost"
                                    style={{
                                        opacity: currentPage === 1 ? 0.5 : 1,
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Previous
                                </button>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handlePageChange(i + 1)}
                                            className="btn"
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                padding: 0,
                                                borderRadius: '50%',
                                                backgroundColor: currentPage === i + 1 ? 'var(--brand-primary)' : 'rgba(30, 41, 59, 0.5)',
                                                color: currentPage === i + 1 ? 'white' : 'var(--dark-text-muted)',
                                                border: currentPage === i + 1 ? 'none' : '1px solid var(--dark-border)'
                                            }}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="btn btn-ghost"
                                    style={{
                                        opacity: currentPage === totalPages ? 0.5 : 1,
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
