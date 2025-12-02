'use client';

import React, { useRef, useMemo, useState } from 'react';
import Link from 'next/link';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Line, Sparkles, Billboard, Text, Sphere } from '@react-three/drei';
import { LayoutDashboard, Briefcase, Calendar, Clock, TrendingUp, Activity, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import GlassIcon from '@/components/ui/GlassIcon';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// --- Error Boundary for 3D Fallback ---
class ThreeErrorBoundary extends React.Component<{ fallback: React.ReactNode, children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("3D Context Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

// --- 2D Fallback: Cosmic Alpana (CSS/SVG) ---
function CosmicAlpana2D() {
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {/* Animated Background Gradient */}
            <div style={{
                position: 'absolute',
                width: '200%',
                height: '200%',
                background: 'conic-gradient(from 0deg at 50% 50%, #0f172a 0deg, #1e293b 120deg, #0f172a 240deg, #1e293b 360deg)',
                animation: 'spin 60s linear infinite',
                opacity: 0.3
            }} />

            <style jsx>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse { 0% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.05); } 100% { opacity: 0.3; transform: scale(1); } }
                @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-20px); } 100% { transform: translateY(0px); } }
            `}</style>

            {/* Central Alpana Pattern (SVG) */}
            <svg width="800" height="800" viewBox="0 0 100 100" style={{ animation: 'spin 120s linear infinite' }}>
                {/* Outer Ring */}
                <circle cx="50" cy="50" r="45" fill="none" stroke="#FFA500" strokeWidth="0.5" strokeDasharray="1 2" opacity="0.3" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#FF4500" strokeWidth="0.2" opacity="0.4" />

                {/* Decorative Petals */}
                {[...Array(12)].map((_, i) => (
                    <g key={i} transform={`rotate(${i * 30} 50 50)`}>
                        <circle cx="50" cy="20" r="2" fill="#FFD700" opacity="0.6" />
                        <line x1="50" y1="50" x2="50" y2="20" stroke="#FF4500" strokeWidth="0.1" opacity="0.3" />
                    </g>
                ))}

                {/* Inner Pattern */}
                {[...Array(8)].map((_, i) => (
                    <g key={`inner-${i}`} transform={`rotate(${i * 45} 50 50)`}>
                        <rect x="48" y="35" width="4" height="4" fill="none" stroke="#FFD700" strokeWidth="0.2" transform="rotate(45 50 37)" />
                    </g>
                ))}

                {/* Core */}
                <circle cx="50" cy="50" r="5" fill="url(#grad1)" />
                <defs>
                    <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#FF4500', stopOpacity: 0 }} />
                    </radialGradient>
                </defs>
            </svg>

            {/* Floating Particles */}
            <div style={{ position: 'absolute', top: '20%', left: '20%', width: '10px', height: '10px', background: '#FFD700', borderRadius: '50%', filter: 'blur(2px)', animation: 'float 4s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', top: '70%', left: '80%', width: '8px', height: '8px', background: '#FF4500', borderRadius: '50%', filter: 'blur(2px)', animation: 'float 6s ease-in-out infinite', animationDelay: '1s' }} />
            <div style={{ position: 'absolute', top: '40%', left: '60%', width: '6px', height: '6px', background: '#FFA500', borderRadius: '50%', filter: 'blur(2px)', animation: 'float 5s ease-in-out infinite', animationDelay: '2s' }} />
        </div>
    );
}

// --- 3D Components: Cosmic Alpana (Robust Version) ---

function GlowingNode({ position, color, size, delay }: any) {
    const mesh = useRef<THREE.Mesh>(null!);
    const [hovered, setHover] = useState(false);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        // Gentle pulsing
        const scale = 1 + Math.sin(t * 2 + delay) * 0.2;
        mesh.current.scale.setScalar(hovered ? scale * 1.5 : scale);
    });

    return (
        <mesh
            ref={mesh}
            position={position}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
        >
            <sphereGeometry args={[size, 16, 16]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={hovered ? 3 : 1.5}
                toneMapped={false}
            />
        </mesh>
    );
}

function NetworkLines({ nodes }: { nodes: any[] }) {
    const lines = useMemo(() => {
        const points: THREE.Vector3[] = [];
        // Connect nodes in a loop for each ring
        // This is a simplified visual representation
        for (let i = 0; i < nodes.length; i++) {
            const current = new THREE.Vector3(...nodes[i].position);
            const next = new THREE.Vector3(...nodes[(i + 1) % nodes.length].position);
            if (nodes[i].ring === nodes[(i + 1) % nodes.length].ring) {
                points.push(current);
                points.push(next);
            }
        }
        return points;
    }, [nodes]);

    return (
        <Line
            points={lines}
            color="#FFD700"
            lineWidth={1}
            transparent
            opacity={0.2}
        />
    );
}

function AlpanaPattern() {
    const group = useRef<THREE.Group>(null!);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        group.current.rotation.z = t * 0.05; // Slow rotation
    });

    const nodes = useMemo(() => {
        const items = [];
        // Inner Ring (Gold)
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            items.push({
                position: [Math.cos(angle) * 1.5, Math.sin(angle) * 1.5, 0],
                color: '#FFD700',
                size: 0.08,
                delay: i,
                ring: 1
            });
        }
        // Middle Ring (Red)
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            items.push({
                position: [Math.cos(angle) * 3, Math.sin(angle) * 3, 0],
                color: '#FF4500',
                size: 0.06,
                delay: i,
                ring: 2
            });
        }
        // Outer Ring (Orange)
        for (let i = 0; i < 24; i++) {
            const angle = (i / 24) * Math.PI * 2;
            items.push({
                position: [Math.cos(angle) * 4.5, Math.sin(angle) * 4.5, 0],
                color: '#FFA500',
                size: 0.05,
                delay: i,
                ring: 3
            });
        }
        return items;
    }, []);

    return (
        <group ref={group}>
            {nodes.map((node, i) => (
                <GlowingNode key={i} {...node} />
            ))}
            <NetworkLines nodes={nodes} />

            {/* Central Core */}
            <mesh>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2} />
            </mesh>
        </group>
    );
}

function Scene() {
    const group = useRef<THREE.Group>(null!);

    useFrame((state) => {
        const { x, y } = state.pointer;
        // Tilt scene based on mouse
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -y * 0.2, 0.1);
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, x * 0.2, 0.1);
    });

    return (
        <group ref={group} rotation={[0.5, 0, 0]}>
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#FFD700" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FF4500" />

            <AlpanaPattern />

            <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
            <Sparkles count={150} scale={15} size={3} speed={0.4} opacity={0.3} color="#FFD700" />
        </group>
    );
}

// --- Utility: Check WebGL Support ---
const useWebGLSupport = () => {
    const [isSupported, setIsSupported] = useState<boolean | null>(null);

    useMemo(() => {
        if (typeof window !== 'undefined') {
            try {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                setIsSupported(!!gl);
            } catch (e) {
                setIsSupported(false);
            }
        }
    }, []);

    return isSupported;
};

// --- Main Component ---

export default function ProviderHero3D({ stats, loading, user }: any) {
    const isWebGLAvailable = useWebGLSupport();

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 5) return 'Good evening';
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    // While checking support, or if not supported, we can show fallback or nothing.
    // Showing fallback immediately is safer for perceived performance if check is fast.
    const show3D = isWebGLAvailable === true;

    return (
        <section className="page-container" style={{
            paddingTop: '8rem',
            minHeight: '100vh',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background: 3D or 2D Fallback */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                opacity: 0.8,
                pointerEvents: show3D ? 'auto' : 'none'
            }}>
                {show3D ? (
                    <ThreeErrorBoundary fallback={<CosmicAlpana2D />}>
                        <Canvas
                            camera={{ position: [0, 0, 8], fov: 50 }}
                            gl={{ antialias: false, powerPreference: "high-performance" }}
                            onCreated={({ gl }) => { gl.setClearColor(new THREE.Color('#0f172a'), 0) }}
                        >
                            <Scene />
                        </Canvas>
                    </ThreeErrorBoundary>
                ) : (
                    <CosmicAlpana2D />
                )}
            </div>

            <div style={{ width: '100%', padding: '0 2rem', position: 'relative', zIndex: 1, pointerEvents: 'none' }}>
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ marginBottom: '4rem', textAlign: 'center', pointerEvents: 'auto' }}
                >
                    <div style={{
                        display: 'inline-flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'relative'
                    }}>
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            style={{
                                fontSize: '1.5rem',
                                fontWeight: '300',
                                color: 'var(--dark-text-muted)',
                                letterSpacing: '0.05em',
                                marginBottom: '0.5rem',
                                fontFamily: 'var(--font-heading)'
                            }}
                        >
                            {greeting()}
                        </motion.span>

                        <motion.h1
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
                            className="heading-xl"
                            style={{
                                fontSize: '4.5rem',
                                lineHeight: '1.1',
                                marginBottom: '1.5rem',
                                textShadow: '0 0 40px rgba(255, 215, 0, 0.2)',
                                background: 'linear-gradient(to bottom right, #FFD700, #FF8C00, #FF4500)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                            }}
                        >
                            {user?.profile?.name || 'Provider'}
                        </motion.h1>

                        {/* Decorative Line */}
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: '120px', opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                            style={{
                                height: '2px',
                                background: 'linear-gradient(to right, transparent, #FFD700, transparent)',
                                marginBottom: '1.5rem'
                            }}
                        />
                    </div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.8 }}
                        className="text-muted"
                        style={{ fontSize: '1.2rem', width: '100%', maxWidth: '100%', margin: '0', lineHeight: '1.6' }}
                    >
                        {stats.upcoming === 0 ? (
                            "You have no upcoming appointments today. Stay tuned!"
                        ) : (
                            <>
                                Your schedule is filling up! You have <strong style={{ color: '#FFD700', fontWeight: '600' }}>{stats.upcoming} upcoming</strong> appointments today.
                            </>
                        )}
                    </motion.p>
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
        </section >
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
