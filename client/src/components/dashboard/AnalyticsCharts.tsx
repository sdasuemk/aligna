'use client';

import { useEffect, useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { useSocket } from '@/context/SocketContext';
import api from '@/api';

const COLORS = ['#818cf8', '#c084fc', '#34d399', '#fbbf24', '#f472b6'];
const TIME_RANGES = ['1W', '1M', '1Y', '3Y', '5Y', 'ALL'];

export default function AnalyticsCharts() {
    const { socket } = useSocket();
    const [timeRange, setTimeRange] = useState('1W');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = async () => {
        try {
            const { data: analyticsData } = await api.get(`/analytics?timeRange=${timeRange}`);
            setData(analyticsData);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    useEffect(() => {
        if (!socket) return;

        const handleUpdate = () => {
            console.log('Analytics update received');
            fetchAnalytics(); // Refresh on update
        };

        socket.on('appointment_created', handleUpdate);
        socket.on('appointment_updated', handleUpdate);

        return () => {
            socket.off('appointment_created', handleUpdate);
            socket.off('appointment_updated', handleUpdate);
        };
    }, [socket]);

    if (loading || !data) {
        return <div style={{ padding: '2rem', color: 'white' }}>Loading analytics...</div>;
    }

    return (
        <div className="page-container" style={{ height: '100vh', overflow: 'hidden', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="heading-xl" style={{ margin: 0 }}>
                    Analytics
                </h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '0.5rem', padding: '4px', border: '1px solid var(--dark-border)' }}>
                        {TIME_RANGES.map(range => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className="btn"
                                style={{
                                    background: timeRange === range ? 'var(--brand-primary)' : 'transparent',
                                    color: timeRange === range ? 'white' : 'var(--dark-text-muted)',
                                    border: 'none',
                                    borderRadius: '0.3rem',
                                    padding: '4px 12px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gridTemplateRows: 'auto 1fr',
                gap: '0.75rem',
                flex: 1,
                minHeight: 0,
                maxHeight: '50vh'
            }}>
                {/* KPI Cards - Top Row */}
                <KpiCard title="Total Revenue" value={`₹${data.kpi.totalRevenue}`} change={data.kpi.revenueChange} color="#818cf8" />
                <KpiCard title="Total Bookings" value={data.kpi.totalBookings} change={data.kpi.bookingsChange} color="#c084fc" />
                <KpiCard title="New Clients" value={data.kpi.newClients} change={data.kpi.clientsChange} color="#34d399" />
                <KpiCard title="Occupancy" value={`${data.kpi.occupancyRate}%`} change={data.kpi.occupancyChange} color="#fbbf24" />

                {/* Main Charts - Bottom Row */}
                <div style={{
                    gridColumn: '1 / -1',
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr',
                    gap: '0.75rem',
                    minHeight: 0
                }}>
                    {/* Revenue Chart */}
                    <div className="glass-card" style={chartContainerStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <h2 style={{ ...chartTitleStyle, marginBottom: 0 }}>Revenue Trend</h2>
                        </div>
                        <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.revenueTrend}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                    <Tooltip
                                        contentStyle={{ background: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '0.5rem', color: 'white', fontSize: '0.75rem' }}
                                        itemStyle={{ color: '#818cf8' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Weekly Status */}
                    <div className="glass-card" style={chartContainerStyle}>
                        <h2 style={chartTitleStyle}>Weekly Status</h2>
                        <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.weeklyStatus} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" horizontal={false} />
                                    <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={25} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                                        contentStyle={{ background: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '0.5rem', color: 'white', fontSize: '0.75rem' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                                    <Bar dataKey="bookings" stackId="a" fill="#c084fc" radius={[0, 4, 4, 0]} barSize={16} />
                                    <Bar dataKey="cancelled" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={16} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Services */}
                    <div className="glass-card" style={chartContainerStyle}>
                        <h2 style={chartTitleStyle}>Top Services</h2>
                        <div style={{ flex: 1, width: '100%', minHeight: 0, position: 'relative' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.topServices}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={60}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.topServices.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '0.5rem', color: 'white', fontSize: '0.75rem' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '0.7rem' }} layout="vertical" align="right" verticalAlign="middle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KpiCard({ title, value, change, color }: { title: string, value: string, change?: string, color: string }) {
    const safeChange = change || '0%';
    const isPositive = safeChange.startsWith('+');
    return (
        <div className="glass-card" style={{
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <span style={{ color: 'var(--dark-text-muted)', fontSize: '0.8rem', fontWeight: '500' }}>{title}</span>
                <span className="badge" style={{
                    fontSize: '0.7rem',
                    color: isPositive ? '#34d399' : '#ef4444',
                    background: isPositive ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: 'none',
                    padding: '0.1rem 0.3rem',
                    borderRadius: '1rem',
                    fontWeight: '600'
                }}>
                    {change}
                </span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginTop: '0.25rem' }}>{value}</div>
        </div>
    );
}

const chartContainerStyle = {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden'
};

const chartTitleStyle = {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: '0.5rem'
};

const selectStyle = {
    background: 'rgba(30, 41, 59, 0.5)',
    border: '1px solid var(--dark-border)',
    color: 'var(--dark-text-muted)',
    padding: '0.25rem 0.75rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    outline: 'none',
    cursor: 'pointer'
};
