'use client';

interface ClientProps {
    name: string;
    email: string;
    phone?: string;
    lastVisit?: string;
    totalVisits?: number;
    status: 'active' | 'inactive';
}

export default function ClientCard({ client }: { client: ClientProps }) {
    return (
        <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            backdropFilter: 'blur(10px)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            transition: 'all 0.2s ease-in-out',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.3)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)';
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: 'white'
                }}>
                    {client.name.charAt(0)}
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: 'white' }}>{client.name}</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>{client.email}</p>
                </div>
            </div>

            <div style={{ height: '1px', background: 'rgba(148, 163, 184, 0.1)', margin: '0.5rem 0' }}></div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#cbd5e1' }}>{client.phone || 'N/A'}</p>
                </div>
                <div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Visits</p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#cbd5e1' }}>{client.totalVisits || 0}</p>
                </div>
            </div>

            <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: client.status === 'active' ? '#34d399' : '#94a3b8',
                boxShadow: client.status === 'active' ? '0 0 8px #34d399' : 'none'
            }}></div>
        </div>
    );
}
