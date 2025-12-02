'use client';

import { useRef, useMemo, useState } from 'react';
import Link from 'next/link';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Line, Sparkles, Billboard, Text } from '@react-three/drei';
import { LayoutDashboard, Briefcase, Calendar, Clock, TrendingUp, Activity, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import GlassIcon from '@/components/ui/GlassIcon';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// --- 3D Components: The Cosmic Alpana (Service Network) Theme ---

function AlpanaNode({ position, color, size }: any) {
    const [hovered, setHover] = useState(false);
    return (
        <mesh position={position} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
            <sphereGeometry args={[hovered ? size * 1.5 : size, 16, 16]} />
            <meshStandardMaterial
                color={hovered ? '#ffffff' : color}
                emissive={color}
                emissiveIntensity={2}
                toneMapped={false}
            />
        </mesh>
    );
}

function ConnectionLine({ start, end, color }: any) {
    return (
        <Line
            points={[start, end]}
            color={color}
            lineWidth={1}
            transparent
            opacity={0.3}
        />
    );
}

function CosmicAlpana() {
    const group = useRef<THREE.Group>(null!);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        // Slow, majestic rotation
        group.current.rotation.z = t * 0.05;
        // Gentle pulsing scale
        const scale = 1 + Math.sin(t * 0.5) * 0.02;
        group.current.scale.set(scale, scale, scale);
    });

    // Generate Alpana Pattern Data
    const { nodes, connections } = useMemo(() => {
        const nodes = [];
        const connections = [];
        const rings = [
            { radius: 1, count: 8, color: '#FFD700', size: 0.08 },   // Inner Gold
            { radius: 2.5, count: 16, color: '#FF4500', size: 0.06 }, // Middle Red
            { radius: 4, count: 32, color: '#FFA500', size: 0.04 },   // Outer Orange
        ];

        // Generate Nodes
        let nodeIndex = 0;
        const ringIndices: number[][] = [];

        rings.forEach((ring, rIndex) => {
            const currentRingIndices = [];
            for (let i = 0; i < ring.count; i++) {
                const angle = (i / ring.count) * Math.PI * 2;
                // Add some "Alpana" style curves/offsets
                const r = ring.radius + (rIndex > 0 ? Math.sin(angle * 4) * 0.3 : 0);

                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;

                nodes.push({ position: [x, y, 0], color: ring.color, size: ring.size, id: nodeIndex });
                currentRingIndices.push(nodeIndex);
                nodeIndex++;
            }
            ringIndices.push(currentRingIndices);
        });

        // Generate Connections (The "Network")
        // 1. Connect nodes within rings
        ringIndices.forEach((indices) => {
            for (let i = 0; i < indices.length; i++) {
                const start = nodes[indices[i]].position;
                const end = nodes[indices[(i + 1) % indices.length]].position;
                connections.push({ start, end, color: '#FFFFFF' });
            }
        });

        // 2. Connect rings to each other (Zig-zag pattern)
        for (let r = 0; r < ringIndices.length - 1; r++) {
            const inner = ringIndices[r];
            const outer = ringIndices[r + 1];
            for (let i = 0; i < outer.length; i++) {
                // Connect outer node to nearest inner node
                const innerIndex = Math.floor((i / outer.length) * inner.length);
                connections.push({
                    start: nodes[outer[i]].position,
                    end: nodes[inner[innerIndex]].position,
                    color: '#FFD700'
                });
            }
        }

        return { nodes, connections };
    }, []);

    return (
        <group ref={group} rotation={[0, 0, 0]}>
            {/* Central Core */}
            <mesh position={[0, 0, 0]}>
                <torusGeometry args={[0.4, 0.1, 16, 32]} />
                <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2} />
            </mesh>

            {/* Nodes */}
            {nodes.map((node, i) => (
                <AlpanaNode key={i} position={node.position} color={node.color} size={node.size} />
            ))}

            {/* Connections */}
            {connections.map((conn, i) => (
                <ConnectionLine key={i} start={conn.start} end={conn.end} color={conn.color} />
            ))}
        </group>
    );
}

function InteractivePlane() {
    const mesh = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        const { x, y } = state.pointer;
        // Subtle tilt based on mouse
        mesh.current.rotation.x = -y * 0.1;
        mesh.current.rotation.y = x * 0.1;
    });

    return (
        <group ref={mesh}>
            <CosmicAlpana />
        </group>
    );
}

function Scene() {
    return (
        <>
            <ambientLight intensity={0.2} />
            <pointLight position={[0, 0, 5]} intensity={1} color="#FFD700" />
            <pointLight position={[5, 5, 5]} intensity={0.5} color="#FF4500" />

            {/* Tilted view for depth */}
            <group rotation={[Math.PI / 6, 0, 0]}>
                <InteractivePlane />
            </group>

            {/* Background Elements */}
            <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
            <Sparkles count={200} scale={15} size={2} speed={0.2} opacity={0.3} color="#FFD700" />
        </>
    );
}

// --- Main Component ---

export default function ProviderHero3D({ stats, loading, user }: any) {
    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <section className="page-container" style={{
            paddingTop: '8rem',
            minHeight: '100vh',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* 3D Background */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                opacity: 0.7,
                pointerEvents: 'auto'
            }}>
                <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                    <Scene />
                </Canvas>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1, pointerEvents: 'none' }}>
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ marginBottom: '3rem', textAlign: 'center', pointerEvents: 'auto' }}
                >
                    <h1 className="heading-xl" style={{ marginBottom: '1rem', textShadow: '0 0 20px rgba(255, 215, 0, 0.3)' }}>
                        {greeting()}, <span className="text-gradient" style={{ backgroundImage: 'linear-gradient(to right, #FFD700, #FF4500)' }}>{user?.profile?.name || 'Provider'}</span>
                    </h1>
                    <p className="text-muted" style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        {stats.upcoming === 0 ? (
                            "You have no upcoming appointments today yet. Keep pacence"
                        ) : (
                            <>
                                Your network is growing. You have <strong style={{ color: '#FFD700' }}>{stats.upcoming} upcoming</strong> appointments.
                            </>
                        )}
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '3rem',
                    pointerEvents: 'auto'
                }}>
                    <DashboardCard
                        icon={Briefcase}
                        label="Active Services"
                        value={loading ? '...' : stats.services}
                        trend={stats.newServices > 0 ? `+${stats.newServices} new` : 'No new'}
                        color="blue"
                        delay={0.1}
                    />
                    <DashboardCard
                        icon={Calendar}
                        label="Today's Appointments"
                        value={loading ? '...' : stats.today}
                        trend={stats.growth || 'On track'}
                        color="green"
                        delay={0.2}
                    />
                    <DashboardCard
                        icon={Clock}
                        label="Upcoming"
                        value={loading ? '...' : stats.upcoming}
                        trend="Next 7 days"
                        color="purple"
                        delay={0.3}
                    />
                    <DashboardCard
                        icon={AlertCircle}
                        label="Pending Requests"
                        value={loading ? '...' : stats.pending}
                        trend="Action needed"
                        color="red"
                        highlight={stats.pending > 0}
                        delay={0.4}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', pointerEvents: 'auto' }}>
                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="glass-card"
                        style={{ padding: '2rem', backdropFilter: 'blur(10px)', background: 'rgba(15, 23, 42, 0.3)' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <GlassIcon icon={TrendingUp} size={20} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--dark-text-main)' }}>Quick Actions</h3>
                        </div>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <Link href="/dashboard" className="glass-panel" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem 1.5rem',
                                textDecoration: 'none',
                                transition: 'transform 0.2s, background 0.2s'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--brand-primary)'
                                    }}>
                                        <LayoutDashboard size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', color: 'var(--dark-text-main)' }}>Go to Dashboard</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--dark-text-muted)' }}>View full analytics & reports</div>
                                    </div>
                                </div>
                                <ArrowRight size={18} style={{ color: 'var(--dark-text-muted)' }} />
                            </Link>

                            <Link href="/dashboard/services" className="glass-panel" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem 1.5rem',
                                textDecoration: 'none',
                                transition: 'transform 0.2s, background 0.2s'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: 'rgba(168, 85, 247, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--brand-secondary)'
                                    }}>
                                        <Briefcase size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', color: 'var(--dark-text-main)' }}>Manage Services</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--dark-text-muted)' }}>Update prices & duration</div>
                                    </div>
                                </div>
                                <ArrowRight size={18} style={{ color: 'var(--dark-text-muted)' }} />
                            </Link>

                            <Link href="/dashboard/appointments" className="glass-panel" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem 1.5rem',
                                textDecoration: 'none',
                                transition: 'transform 0.2s, background 0.2s'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--success)'
                                    }}>
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', color: 'var(--dark-text-main)' }}>View Schedule</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--dark-text-muted)' }}>Check upcoming bookings</div>
                                    </div>
                                </div>
                                <ArrowRight size={18} style={{ color: 'var(--dark-text-muted)' }} />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="glass-card"
                        style={{ padding: '2rem', backdropFilter: 'blur(10px)', background: 'rgba(15, 23, 42, 0.3)' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <GlassIcon icon={Activity} size={20} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--dark-text-main)' }}>Recent Activity</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {stats.recentActivities && stats.recentActivities.length > 0 ? (
                                stats.recentActivities.map((activity: any, index: number) => {
                                    let icon = Calendar;
                                    let color = 'var(--brand-primary)';
                                    let title = 'Appointment Update';
                                    let desc = `${activity.serviceId?.name || 'Service'} with ${activity.clientId?.profile?.name || 'Client'}`;

                                    if (activity.status === 'COMPLETED') {
                                        icon = CheckCircle;
                                        color = 'var(--success)';
                                        title = 'Appointment Completed';
                                    } else if (activity.status === 'PENDING') {
                                        icon = AlertCircle;
                                        color = 'var(--warning)';
                                        title = 'Pending Request';
                                    } else if (activity.status === 'CONFIRMED') {
                                        icon = Calendar;
                                        color = 'var(--brand-primary)';
                                        title = 'New Booking';
                                    } else if (activity.status === 'CANCELLED') {
                                        icon = AlertCircle;
                                        color = 'var(--error)';
                                        title = 'Appointment Cancelled';
                                    }

                                    // Calculate time ago
                                    const timeAgo = (date: string) => {
                                        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
                                        let interval = seconds / 31536000;
                                        if (interval > 1) return Math.floor(interval) + " years ago";
                                        interval = seconds / 2592000;
                                        if (interval > 1) return Math.floor(interval) + " months ago";
                                        interval = seconds / 86400;
                                        if (interval > 1) return Math.floor(interval) + " days ago";
                                        interval = seconds / 3600;
                                        if (interval > 1) return Math.floor(interval) + " hours ago";
                                        interval = seconds / 60;
                                        if (interval > 1) return Math.floor(interval) + " minutes ago";
                                        return Math.floor(seconds) + " seconds ago";
                                    };

                                    return (
                                        <ActivityItem
                                            key={index}
                                            icon={icon}
                                            color={color}
                                            title={title}
                                            desc={desc}
                                            time={timeAgo(activity.updatedAt)}
                                        />
                                    );
                                })
                            ) : (
                                <div style={{ textAlign: 'center', color: 'var(--dark-text-muted)', padding: '1rem' }}>
                                    No recent activity
                                </div>
                            )}
                            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                <Link href="/dashboard/analytics" style={{ fontSize: '0.9rem', color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: '500' }}>
                                    View all activity
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function DashboardCard({ icon: Icon, label, value, trend, color, highlight, delay }: any) {
    const getColor = (c: string) => {
        switch (c) {
            case 'blue': return 'var(--brand-primary)';
            case 'purple': return 'var(--brand-secondary)';
            case 'green': return 'var(--success)';
            case 'red': return 'var(--error)';
            default: return 'var(--brand-primary)';
        }
    };

    const themeColor = getColor(color);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: delay }}
            className="glass-card"
            style={{
                padding: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
                border: highlight ? `1px solid ${themeColor}` : '1px solid rgba(148, 163, 184, 0.1)',
                boxShadow: highlight ? `0 0 20px ${themeColor}20` : 'none',
                backdropFilter: 'blur(10px)',
                background: 'rgba(30, 41, 59, 0.3)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{
                    padding: '0.75rem',
                    borderRadius: '12px',
                    background: `${themeColor}15`,
                    color: themeColor
                }}>
                    <Icon size={24} />
                </div>
                {highlight && (
                    <span style={{
                        background: themeColor,
                        color: 'white',
                        fontSize: '0.7rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '999px',
                        fontWeight: '600'
                    }}>
                        Action Required
                    </span>
                )}
            </div>

            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--dark-text-main)', marginBottom: '0.25rem' }}>
                {value}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--dark-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{label}</span>
                {trend && <span style={{ fontSize: '0.8rem', color: themeColor, background: `${themeColor}10`, padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{trend}</span>}
            </div>
        </motion.div>
    );
}

function ActivityItem({ icon: Icon, color, title, desc, time }: any) {
    return (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(30, 41, 59, 0.3)' }}>
            <div style={{
                marginTop: '0.25rem',
                color: color
            }}>
                <Icon size={18} />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--dark-text-main)' }}>{title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--dark-text-muted)' }}>{desc}</div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--dark-text-muted)', whiteSpace: 'nowrap' }}>
                {time}
            </div>
        </div>
    );
}
