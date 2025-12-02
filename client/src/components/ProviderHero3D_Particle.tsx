'use client';

import { useRef, useMemo } from 'react';
import Link from 'next/link';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sparkles } from '@react-three/drei';
import { LayoutDashboard, Briefcase, Calendar, Clock, TrendingUp, Activity, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import GlassIcon from '@/components/ui/GlassIcon';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// --- 3D Components: Particle Alpana Theme ---

function AlpanaParticles({ count = 2000 }: { count?: number }) {
    const mesh = useRef<THREE.Points>(null!);
    const hoverRef = useRef(new THREE.Vector3(1000, 1000, 0)); // Initial far away

    // Generate Alpana Pattern using Polar Equations (Rose Curves)
    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const originalPositions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        const color1 = new THREE.Color('#FFFFFF'); // Rice White
        const color2 = new THREE.Color('#FFD700'); // Gold
        const color3 = new THREE.Color('#FF4500'); // Red Accent

        for (let i = 0; i < count; i++) {
            // We'll layer multiple patterns
            const layer = Math.random();
            let r, theta, x, y, z;
            let c = new THREE.Color();

            theta = Math.random() * Math.PI * 2;

            if (layer < 0.4) {
                // Outer Ring - Complex Rose
                const k = 8; // 8 petals
                r = 4 * Math.cos(k * theta) + 5; // Variation
                c = color1;
            } else if (layer < 0.7) {
                // Middle Ring - Starburst
                const k = 4;
                r = 2 * Math.cos(k * theta) + 2.5;
                c = color2;
            } else {
                // Inner Core - Dense
                r = Math.random() * 1.5;
                c = color3;
            }

            // Add some noise/scatter
            r += (Math.random() - 0.5) * 0.2;

            x = r * Math.cos(theta);
            y = r * Math.sin(theta);
            z = (Math.random() - 0.5) * 0.5; // Slight depth

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            originalPositions[i * 3] = x;
            originalPositions[i * 3 + 1] = y;
            originalPositions[i * 3 + 2] = z;

            c.toArray(colors, i * 3);
            sizes[i] = Math.random() * 0.15;
        }

        return { positions, colors, originalPositions, sizes };
    }, [count]);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        const { x, y } = state.pointer;

        // Update hover position in 3D space (approximate projection)
        hoverRef.current.set(x * 10, y * 10, 0);

        const positions = mesh.current.geometry.attributes.position.array as Float32Array;
        const orig = particles.originalPositions;

        for (let i = 0; i < count; i++) {
            const ix = i * 3;
            const iy = i * 3 + 1;
            const iz = i * 3 + 2;

            const ox = orig[ix];
            const oy = orig[iy];
            const oz = orig[iz];

            // 1. Rotation
            const angle = t * 0.1;
            const rx = ox * Math.cos(angle) - oy * Math.sin(angle);
            const ry = ox * Math.sin(angle) + oy * Math.cos(angle);

            // 2. Mouse Interaction (Repulsion/Disruption)
            const dx = rx - hoverRef.current.x;
            const dy = ry - hoverRef.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let forceX = 0;
            let forceY = 0;
            let forceZ = 0;

            if (dist < 3) {
                const force = (3 - dist) * 2; // Repulsion strength
                forceX = (dx / dist) * force;
                forceY = (dy / dist) * force;
                forceZ = Math.sin(dist * 10 - t * 5) * 0.5; // Ripple in Z
            }

            // 3. Apply positions with gentle return to original
            // We use a simple lerp for "spring" effect would be better but direct calculation is faster for many particles
            // Here we just add the force to the rotated position

            positions[ix] = rx + forceX;
            positions[iy] = ry + forceY;
            positions[iz] = oz + forceZ;
        }

        mesh.current.geometry.attributes.position.needsUpdate = true;
        // mesh.current.rotation.z = t * 0.05; // Rotate entire group slightly
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.positions.length / 3}
                    array={particles.positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={particles.colors.length / 3}
                    array={particles.colors}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-size"
                    count={particles.sizes.length}
                    array={particles.sizes}
                    itemSize={1}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

function Scene() {
    return (
        <>
            <ambientLight intensity={0.5} />
            <AlpanaParticles count={3000} />

            {/* Background Atmosphere */}
            <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />
            <Sparkles count={100} scale={15} size={2} speed={0.2} opacity={0.3} color="#FFD700" />
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
                opacity: 0.8,
                pointerEvents: 'auto'
            }}>
                <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
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
                    <h1 className="heading-xl" style={{ marginBottom: '1rem', textShadow: '0 0 20px rgba(255, 255, 255, 0.3)' }}>
                        {greeting()}, <span className="text-gradient" style={{ backgroundImage: 'linear-gradient(to right, #FFFFFF, #FFD700)' }}>{user?.profile?.name || 'Provider'}</span>
                    </h1>
                    <p className="text-muted" style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Artistry in service. You have <strong style={{ color: '#FFD700' }}>{stats.upcoming} upcoming</strong> appointments.
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
