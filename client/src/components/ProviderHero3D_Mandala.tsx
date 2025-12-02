'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Text, MeshDistortMaterial, Sphere, useCursor, OrbitControls, Sparkles } from '@react-three/drei';
import { LayoutDashboard, Briefcase, Calendar, Clock, TrendingUp, Activity, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import GlassIcon from '@/components/ui/GlassIcon';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// 3D Components - Digital Mandala / Alpana Theme
function MandalaRing({ radius, count, size, color, speed, shape = 'sphere' }: any) {
    const mesh = useRef<THREE.InstancedMesh>(null!);
    const dummy = new THREE.Object3D();

    useFrame((state) => {
        const t = state.clock.getElapsedTime() * speed;
        mesh.current.rotation.z = t * 0.1; // Rotate the whole ring

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            dummy.position.set(x, y, 0);
            dummy.rotation.set(0, 0, angle + t); // Individual rotation
            dummy.scale.setScalar(1 + Math.sin(t * 2 + i) * 0.1); // Pulsing effect
            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
        }
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[null as any, null as any, count]}>
            {shape === 'sphere' && <sphereGeometry args={[size, 16, 16]} />}
            {shape === 'box' && <boxGeometry args={[size, size, size]} />}
            {shape === 'cone' && <coneGeometry args={[size, size * 2, 4]} />}
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.5}
                roughness={0.2}
                metalness={0.8}
            />
        </instancedMesh>
    );
}

function CentralDiya() {
    const mesh = useRef<THREE.Mesh>(null!);
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        mesh.current.rotation.y = t * 0.5;
        mesh.current.rotation.z = Math.sin(t) * 0.1;
    });

    return (
        <group>
            {/* The Flame */}
            <mesh position={[0, 0.5, 0]}>
                <dodecahedronGeometry args={[0.6, 0]} />
                <MeshDistortMaterial
                    color="#FF9933"
                    emissive="#FF4500"
                    emissiveIntensity={2}
                    speed={5}
                    distort={0.6}
                />
            </mesh>
            {/* The Base */}
            <mesh ref={mesh} position={[0, 0, 0]}>
                <torusKnotGeometry args={[0.8, 0.3, 100, 16]} />
                <meshStandardMaterial color="#D32F2F" roughness={0.1} metalness={0.6} />
            </mesh>
        </group>
    );
}

function InteractiveScene() {
    const group = useRef<THREE.Group>(null!);

    useFrame((state) => {
        // Mouse interaction: Tilt the mandala based on pointer position
        const x = state.pointer.x;
        const y = state.pointer.y;

        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, y * 0.2, 0.1);
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, x * 0.2, 0.1);
    });

    return (
        <group ref={group} rotation={[0.5, 0, 0]}> {/* Initial slight tilt */}
            <CentralDiya />

            {/* Inner Ring - Gold Spheres (Wealth/Prosperity) */}
            <MandalaRing radius={2.5} count={12} size={0.15} color="#FFD700" speed={0.5} shape="sphere" />

            {/* Middle Ring - Red Cubes (Energy/Passion - Bengali Touch) */}
            <MandalaRing radius={4} count={24} size={0.12} color="#D32F2F" speed={-0.3} shape="box" />

            {/* Outer Ring - Green Cones (Growth/Service - Indian Touch) */}
            <MandalaRing radius={6} count={36} size={0.15} color="#138808" speed={0.2} shape="cone" />

            {/* Connecting Lines or Particles representing Service Network */}
            <Sparkles count={100} scale={10} size={2} speed={0.4} opacity={0.3} color="#FF9933" />
        </group>
    );
}

function Scene() {
    return (
        <>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#FFD700" />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#D32F2F" />
            <spotLight position={[0, 10, 0]} angle={0.5} penumbra={1} intensity={2} color="#FF9933" />

            <InteractiveScene />

            <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        </>
    );
}

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
                opacity: 0.6,
                pointerEvents: 'none' // Allow clicks to pass through to UI
            }}>
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                    <Scene />
                </Canvas>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ marginBottom: '3rem', textAlign: 'center' }}
                >
                    <h1 className="heading-xl" style={{ marginBottom: '1rem', textShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}>
                        {greeting()}, <span className="text-gradient">{user?.profile?.name || 'Provider'}</span>
                    </h1>
                    <p className="text-muted" style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Welcome to your command center. You have <strong style={{ color: 'var(--brand-primary)' }}>{stats.upcoming} upcoming</strong> appointments.
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '3rem'
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="glass-card"
                        style={{ padding: '2rem', backdropFilter: 'blur(20px)', background: 'rgba(15, 23, 42, 0.4)' }}
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
                        style={{ padding: '2rem', backdropFilter: 'blur(20px)', background: 'rgba(15, 23, 42, 0.4)' }}
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
                backdropFilter: 'blur(20px)',
                background: 'rgba(30, 41, 59, 0.4)'
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
