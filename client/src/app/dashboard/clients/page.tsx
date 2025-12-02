'use client';

import { useState, useEffect } from 'react';
import api from '@/api';
import { useSocket } from '@/context/SocketContext';
import ClientCard from '@/components/dashboard/ClientCard';
import ClientDetailsModal from '@/components/dashboard/ClientDetailsModal';

interface Booking {
    _id: string;
    service: string;
    date: string;
    status: string;
    price: number;
}

interface Client {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    totalVisits: number;
    totalRevenue: number;
    lastVisit?: string;
    bookings: Booking[];
    status: 'active' | 'inactive';
}

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    const { socket } = useSocket();

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('appointment_created', fetchClients);
        socket.on('appointment_updated', fetchClients);

        return () => {
            socket.off('appointment_created', fetchClients);
            socket.off('appointment_updated', fetchClients);
        };
    }, [socket]);

    const fetchClients = async () => {
        try {
            const { data } = await api.get('/users/clients');
            // Backend returns clients without 'status', so we add it
            const formattedClients = data.map((client: any) => ({
                ...client,
                status: 'active' // Default to active for now
            }));
            setClients(formattedClients);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="heading-xl" style={{ margin: 0 }}>
                    Clients Directory
                </h1>
                <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-dark"
                    style={{
                        width: '300px',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--brand-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--dark-border)'}
                />
            </div>

            {loading ? (
                <div style={{ color: 'var(--dark-text-muted)', textAlign: 'center', marginTop: '4rem' }}>Loading clients...</div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {filteredClients.map(client => (
                        <div key={client._id} onClick={() => setSelectedClient(client)} style={{ cursor: 'pointer' }}>
                            <ClientCard client={client} />
                        </div>
                    ))}
                    {filteredClients.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--dark-text-muted)', padding: '4rem' }}>
                            No clients found matching your search.
                        </div>
                    )}
                </div>
            )}

            {selectedClient && (
                <ClientDetailsModal
                    client={selectedClient}
                    onClose={() => setSelectedClient(null)}
                />
            )}
        </div>
    );
}
