'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import React from 'react';
import { motion } from 'framer-motion';

// --- 3D Components: The Mystic Lotus (Client Journey) Theme ---

function LotusPetal({ position, rotation, scale, color, timeOffset }: any) {
    const mesh = useRef<THREE.Mesh>(null!);
    const [hovered, setHover] = useState(false);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        // Organic breathing motion
        const breathe = Math.sin(t * 0.5 + timeOffset) * 0.1;
        mesh.current.scale.set(
            scale[0] + breathe,
            scale[1] + breathe,
            scale[2]
        );

        // Gentle swaying
        mesh.current.rotation.z = rotation[2] + Math.sin(t * 0.3 + timeOffset) * 0.05;
    });

    return (
        <mesh
            ref={mesh}
            position={position}
            rotation={rotation}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
        >
            {/* Using a flattened sphere to simulate a petal shape */}
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial
                color={hovered ? '#ffffff' : color}
                emissive={color}
                emissiveIntensity={hovered ? 2 : 1.5}
                transparent
                opacity={0.8}
                roughness={0.2}
                metalness={0.8}
            />
        </mesh>
    );
}

function MysticLotus() {
    const group = useRef<THREE.Group>(null!);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        // Slow, calming rotation
        group.current.rotation.z = t * 0.02;
    });

    // Generate Lotus Pattern Data
    const petals = useMemo(() => {
        const items: any[] = [];
        const layers = [
            { count: 6, radius: 1.5, scale: [0.5, 1.2, 0.1], color: '#00FFFF', z: 0.2 },   // Inner Cyan
            { count: 12, radius: 3, scale: [0.8, 1.8, 0.1], color: '#8A2BE2', z: 0.1 },    // Middle Purple
            { count: 18, radius: 5, scale: [1.2, 2.5, 0.1], color: '#4169E1', z: 0 },      // Outer Royal Blue
        ];

        layers.forEach((layer, layerIndex) => {
            for (let i = 0; i < layer.count; i++) {
                const angle = (i / layer.count) * Math.PI * 2;
                const x = Math.cos(angle) * layer.radius;
                const y = Math.sin(angle) * layer.radius;

                // Rotation to point outwards
                const rotZ = angle - Math.PI / 2;

                items.push({
                    position: [x, y, layer.z],
                    rotation: [0, 0, rotZ],
                    scale: layer.scale,
                    color: layer.color,
                    timeOffset: i * 0.5 + layerIndex
                });
            }
        });

        return items;
    }, []);

    return (
        <group ref={group}>
            {/* Central Core (The "Self") */}
            <mesh position={[0, 0, 0.5]}>
                <sphereGeometry args={[0.6, 32, 32]} />
                <meshStandardMaterial
                    color="#E0FFFF"
                    emissive="#00FFFF"
                    emissiveIntensity={2}
                />
            </mesh>

            {/* Glowing Aura */}
            <pointLight position={[0, 0, 2]} intensity={2} color="#00FFFF" distance={10} />

            {/* Petals */}
            {petals.map((petal, i) => (
                <LotusPetal
                    key={i}
                    {...petal}
                />
            ))}
        </group>
    );
}

function InteractiveScene() {
    const group = useRef<THREE.Group>(null!);

    useFrame((state) => {
        const { x, y } = state.pointer;
        // Fluid follow movement
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -y * 0.2, 0.05);
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, x * 0.2, 0.05);
    });

    return (
        <group ref={group} rotation={[Math.PI / 6, 0, 0]}> {/* Tilted for 3D effect */}
            <MysticLotus />
        </group>
    );
}

class ErrorBoundary extends React.Component<{ fallback: React.ReactNode, children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("WebGL Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

// --- High-Fidelity Fallback: Framer Motion Lotus ---
function LotusFallback() {
    const layers = [
        { count: 6, radius: 60, color: '#00FFFF', duration: 20, delay: 0 },
        { count: 12, radius: 100, color: '#8A2BE2', duration: 25, delay: 1 },
        { count: 18, radius: 150, color: '#4169E1', duration: 30, delay: 2 },
    ];

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            perspective: '1000px' // Add perspective for pseudo-3D feel
        }}>
            {/* Background Glow */}
            <div style={{
                position: 'absolute',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(65, 105, 225, 0.15) 0%, transparent 70%)',
                filter: 'blur(60px)',
                borderRadius: '50%'
            }} />

            {/* Rotating Layers */}
            {layers.map((layer, i) => (
                <motion.div
                    key={i}
                    animate={{ rotate: 360 }}
                    transition={{ duration: layer.duration, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute',
                        width: layer.radius * 2,
                        height: layer.radius * 2,
                        transformStyle: 'preserve-3d'
                    }}
                >
                    {Array.from({ length: layer.count }).map((_, j) => {
                        const angle = (j / layer.count) * 360;
                        return (
                            <motion.div
                                key={j}
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    width: '20px',
                                    height: '60px',
                                    background: `linear-gradient(to top, ${layer.color}, transparent)`,
                                    borderRadius: '50%',
                                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${layer.radius}px)`,
                                    boxShadow: `0 0 10px ${layer.color}`,
                                    opacity: 0.6
                                }}
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 3, repeat: Infinity, delay: j * 0.1 }}
                            />
                        );
                    })}
                </motion.div>
            ))}

            {/* Center Core */}
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#E0FFFF',
                    boxShadow: '0 0 30px #00FFFF',
                    zIndex: 10
                }}
            />
        </div>
    );
}

export default function ClientHero3D_Alpana() {
    const [isMounted, setIsMounted] = useState(false);
    const [hasWebGL, setHasWebGL] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Robust WebGL Check
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                setHasWebGL(true);
            } else {
                console.warn("WebGL context creation failed: gl is null");
            }
        } catch (e) {
            console.warn("WebGL not supported:", e);
            setHasWebGL(false);
        }
    }, []);

    if (!isMounted) return <LotusFallback />;

    // Explicitly show fallback if WebGL is not available
    if (!hasWebGL) {
        return <LotusFallback />;
    }

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            opacity: 0.8,
            pointerEvents: 'none'
        }}>
            <ErrorBoundary fallback={<LotusFallback />}>
                <Canvas
                    camera={{ position: [0, 0, 12], fov: 45 }}
                    gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
                    onCreated={({ gl }) => {
                        gl.setClearColor(new THREE.Color('#000000'), 0);
                    }}
                >
                    <ambientLight intensity={0.3} />
                    <pointLight position={[10, 10, 10]} intensity={1} color="#4169E1" />
                    <pointLight position={[-10, -10, -5]} intensity={0.5} color="#8A2BE2" />

                    <InteractiveScene />

                    <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={0.5} />
                    <Sparkles count={100} scale={12} size={3} speed={0.3} opacity={0.4} color="#00FFFF" />
                </Canvas>
            </ErrorBoundary>
        </div>
    );
}
