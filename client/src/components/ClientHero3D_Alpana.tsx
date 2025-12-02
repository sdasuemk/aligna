'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// --- Alpana Motifs (SVG Paths) ---
const LotusPetal = ({ color = "currentColor", opacity = 1 }) => (
    <path
        d="M12 2C12 2 16 8 16 14C16 20 12 22 12 22C12 22 8 20 8 14C8 8 12 2 12 2Z"
        fill={color}
        fillOpacity={opacity}
    />
);

const Kalka = ({ color = "currentColor", opacity = 1 }) => (
    <path
        d="M12 2C14 2 18 6 18 12C18 18 14 22 10 22C6 22 4 18 4 14C4 10 8 12 8 8C8 4 10 2 12 2ZM12 5C11 5 10 6 10 7C10 8 11 9 12 9C13 9 14 8 14 7C14 6 13 5 12 5Z"
        fill={color}
        fillOpacity={opacity}
    />
);

const RicePattern = ({ color = "currentColor", opacity = 1 }) => (
    <circle cx="12" cy="12" r="2" fill={color} fillOpacity={opacity} />
);

export default function ClientHero3D_Alpana() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 20 - 10,
                y: (e.clientY / window.innerHeight) * 20 - 10,
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            overflow: 'hidden',
            background: 'transparent',
            pointerEvents: 'none'
        }}>
            {/* Ambient Glow */}
            <motion.div
                animate={{
                    x: mousePosition.x * -2,
                    y: mousePosition.y * -2
                }}
                transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '60vw',
                    height: '60vw',
                    background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                    borderRadius: '50%'
                }}
            />

            {/* Alpana Mandala System */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                perspective: '1000px'
            }}>
                {/* Core: The Bindu (Center Point) */}
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        position: 'absolute',
                        width: '60px',
                        height: '60px',
                        background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)', // Gold/Marigold center
                        borderRadius: '50%',
                        filter: 'blur(10px)',
                        zIndex: 10
                    }}
                />

                {/* Layer 1: Inner Lotus Circle */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    style={{ position: 'absolute', width: '200px', height: '200px' }}
                >
                    {[...Array(8)].map((_, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: '24px',
                            height: '24px',
                            transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-60px)`,
                        }}>
                            <svg viewBox="0 0 24 24" width="100%" height="100%">
                                <LotusPetal color="#06b6d4" opacity={0.6} />
                            </svg>
                        </div>
                    ))}
                </motion.div>

                {/* Layer 2: Rice Pattern Dots */}
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                    style={{ position: 'absolute', width: '300px', height: '300px' }}
                >
                    {[...Array(12)].map((_, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: '12px',
                            height: '12px',
                            transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-100px)`,
                        }}>
                            <svg viewBox="0 0 24 24" width="100%" height="100%">
                                <RicePattern color="#ffffff" opacity={0.4} />
                            </svg>
                        </div>
                    ))}
                </motion.div>

                {/* Layer 3: Kalka (Paisley) Ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                    style={{ position: 'absolute', width: '450px', height: '450px' }}
                >
                    {[...Array(12)].map((_, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: '40px',
                            height: '40px',
                            transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-160px) rotate(180deg)`, // Pointing outward
                        }}>
                            <svg viewBox="0 0 24 24" width="100%" height="100%">
                                <Kalka color="#8b5cf6" opacity={0.5} />
                            </svg>
                        </div>
                    ))}
                </motion.div>

                {/* Layer 4: Outer Geometric Ring */}
                <motion.div
                    animate={{ rotate: -360, scale: [1, 1.02, 1] }}
                    transition={{
                        rotate: { duration: 120, repeat: Infinity, ease: "linear" },
                        scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
                    }}
                    style={{
                        position: 'absolute',
                        width: '600px',
                        height: '600px',
                        border: '1px dashed rgba(255, 255, 255, 0.1)',
                        borderRadius: '50%',
                    }}
                />

                {/* Layer 5: Large Outer Petals */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 140, repeat: Infinity, ease: "linear" }}
                    style={{ position: 'absolute', width: '750px', height: '750px' }}
                >
                    {[...Array(16)].map((_, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: '60px',
                            height: '60px',
                            transform: `translate(-50%, -50%) rotate(${i * 22.5}deg) translateY(-300px)`,
                        }}>
                            <svg viewBox="0 0 24 24" width="100%" height="100%">
                                <LotusPetal color="#06b6d4" opacity={0.2} />
                            </svg>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
