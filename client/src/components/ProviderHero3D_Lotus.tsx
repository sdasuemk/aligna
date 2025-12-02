'use client';

import { useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, MeshDistortMaterial, Sparkles, Trail } from '@react-three/drei';
import { LayoutDashboard, Briefcase, Calendar, Clock, TrendingUp, Activity, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import GlassIcon from '@/components/ui/GlassIcon';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// --- 3D Components: The Mystic Lotus Theme ---

function LotusPetal({ position, rotation, color, scale }: any) {
    return (
        <group position={position} rotation={rotation} scale={scale}>
            {/* Petal Shape */}
            <mesh position={[0, 1.5, 0]}>
                <coneGeometry args={[0.8, 3, 32]} /> {/* Tapered cone as petal */}
                <MeshDistortMaterial
                    color={color}
                    speed={2}
                    distort={0.3}
                    roughness={0.2}
                    metalness={0.1}
                    emissive={color}
                    emissiveIntensity={0.2}
                />
            </mesh>
        </group>
    );
}

function MysticLotus() {
    const group = useRef<THREE.Group>(null!);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        // Breathing animation
        const scale = 1 + Math.sin(t * 1.5) * 0.05;
        group.current.scale.set(scale, scale, scale);
        // Gentle rotation
        group.current.rotation.y = t * 0.1;
    });

    // Generate petals rings
    const petals = useMemo(() => {
        const items = [];
        // Inner Ring
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            items.push({
                position: [Math.sin(angle) * 0.5, 0, Math.cos(angle) * 0.5],
                rotation: [0.5, angle, 0],
                scale: 0.8,
                color: '#FF69B4' // Hot Pink
            });
        }
        // Outer Ring
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            items.push({
                position: [Math.sin(angle) * 1.2, -0.2, Math.cos(angle) * 1.2],
                rotation: [0.8, angle, 0],
                scale: 1.2,
                color: '#FFB7C5' // Light Pink
            });
        }
        return items;
    }, []);

    return (
        <group ref={group} position={[0, -1, 0]}>
            {/* Center Core */}
            <mesh position={[0, 0.5, 0]}>
                <sphereGeometry args={[0.6, 32, 32]} />
                <meshStandardMaterial color="#FFD700" emissive="#FFAA00" emissiveIntensity={0.8} />
            </mesh>

            {/* Petals */}
            {petals.map((p, i) => (
                <LotusPetal key={i} {...p} />
            ))}

            {/* Base Glow */}
            <pointLight position={[0, 1, 0]} intensity={2} color="#FF69B4" distance={5} />
        </group>
    );
}

function FloatingDiya({ position, delay }: any) {
    const mesh = useRef<THREE.Group>(null!);
    const [hovered, setHover] = useState(false);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        // Mouse attraction
        if (hovered) {
            const x = (state.pointer.x * 10 - mesh.current.position.x) * 0.1;
            const y = (state.pointer.y * 10 - mesh.current.position.y) * 0.1;
            mesh.current.position.x += x;
            mesh.current.position.y += y;
        } else {
            // Gentle floating
            mesh.current.position.y = position[1] + Math.sin(t + delay) * 0.5;
        }

        mesh.current.rotation.y += 0.01;
    });

    return (
        <group
            ref={mesh}
            position={position}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
        >
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                {/* Flame */}
                <mesh position={[0, 0.3, 0]}>
                    <dodecahedronGeometry args={[0.2, 0]} />
                    <MeshDistortMaterial color="#FF4500" emissive="#FF8C00" emissiveIntensity={2} speed={5} distort={0.5} />
                </mesh>
                {/* Lamp Body */}
                <mesh position={[0, 0, 0]}>
                    <cylinderGeometry args={[0.3, 0.1, 0.2, 16]} />
                    <meshStandardMaterial color="#8B4513" roughness={0.6} />
                </mesh>
            </Float>
            <pointLight position={[0, 0.5, 0]} intensity={0.5} color="#FFA500" distance={3} />
        </group>
    );
}

function Scene() {
    return (
        <>
            <ambientLight intensity={0.3} />
            <spotLight position={[5, 10, 5]} angle={0.5} penumbra={1} intensity={1} color="#FFD700" />
            <pointLight position={[-5, 5, -5]} intensity={0.5} color="#4B0082" />

            <MysticLotus />

            {/* Floating Diyas */}
            <FloatingDiya position={[-3, 1, -2]} delay={0} />
            <FloatingDiya position={[3, 2, -3]} delay={2} />
            <FloatingDiya position={[-2, -1, 1]} delay={4} />
            <FloatingDiya position={[2, 0, 2]} delay={1} />
            <FloatingDiya position={[0, 3, -4]} delay={3} />

            {/* Atmosphere */}
            <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />
            <Sparkles count={150} scale={12} size={3} speed={0.2} opacity={0.4} color="#FFD700" />

            {/* Water-like floor reflection hint */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.8} opacity={0.5} transparent />
            </mesh>
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
                opacity: 0.8, // Increased opacity for better visibility
                pointerEvents: 'auto' // Enable interaction with 3D elements
            }}>
                <Canvas camera={{ position: [0, 1, 6], fov: 50 }}>
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
                    <h1 className="heading-xl" style={{ marginBottom: '1rem', textShadow: '0 0 20px rgba(255, 105, 180, 0.5)' }}>
                        {greeting()}, <span className="text-gradient" style={{ backgroundImage: 'linear-gradient(to right, #FFD700, #FF69B4)' }}>{user?.profile?.name || 'Provider'}</span>
                    </h1>
                    <p className="text-muted" style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Your service ecosystem is blooming. You have <strong style={{ color: '#FF69B4' }}>{stats.upcoming} upcoming</strong> appointments.
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
                        trend="+2 new"
                        color="blue"
                        delay={0.1}
                    />
                    <DashboardCard
                        icon={Calendar}
                        label="Today's Appointments"
                        value={loading ? '...' : stats.today}
                        trend="On track"
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
                            <ActivityItem
                                icon={CheckCircle}
                                color="var(--success)"
                                title="Appointment Completed"
                                desc="Haircut with John Doe"
                                time="2 hours ago"
                            />
                            <ActivityItem
                                icon={Calendar}
                                color="var(--brand-primary)"
                                title="New Booking"
                                desc="Manicure for Sarah Smith"
                                time="4 hours ago"
                            />
                            <ActivityItem
                                icon={AlertCircle}
                                color="var(--warning)"
                                title="Pending Request"
                                desc="Massage for Mike Johnson"
                                time="5 hours ago"
                            />
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
