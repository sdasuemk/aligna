'use client';

import { useState, useEffect } from 'react';
import api from '@/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Provider {
    id: string;
    email: string;
    profile: {
        name: string;
        bio: string;
        avatarUrl: string;
    };
    services: {
        id: string;
        name: string;
        description: string;
        duration: number;
        price: number;
        currency: string;
    }[];
}

export default function PublicProfilePage() {
    const { id } = useParams();
    const [provider, setProvider] = useState<Provider | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchProvider();
        }
    }, [id]);

    const fetchProvider = async () => {
        try {
            const { data } = await api.get(`/users/${id}`);
            setProvider(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!provider) return <div>Provider not found</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card mb-4 text-center">
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#e2e8f0', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#64748b' }}>
                    {provider.profile.name.charAt(0)}
                </div>
                <h1 className="heading" style={{ fontSize: '2rem' }}>{provider.profile.name}</h1>
                <p className="text-muted" style={{ marginTop: '0.5rem' }}>{provider.profile.bio || 'No bio available'}</p>
            </div>

            <h2 className="heading" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Available Services</h2>
            <div className="grid gap-4">
                {provider.services.map(service => (
                    <div key={service.id} className="card flex justify-between items-center">
                        <div>
                            <h3 className="heading">{service.name}</h3>
                            <p className="text-sm text-muted">{service.description}</p>
                            <p className="text-sm" style={{ marginTop: '0.5rem' }}>
                                {service.duration} min • {service.currency} {service.price}
                            </p>
                        </div>
                        <Link href={`/book/${service.id}`} className="btn btn-primary">
                            Book Now
                        </Link>
                    </div>
                ))}
                {provider.services.length === 0 && (
                    <p className="text-muted text-center">No services available.</p>
                )}
            </div>
        </div>
    );
}
