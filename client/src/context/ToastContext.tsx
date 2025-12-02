'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                pointerEvents: 'none'
            }}>
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            padding: '1rem 1.5rem',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            minWidth: '300px',
                            maxWidth: '400px',
                            pointerEvents: 'auto',
                            borderLeft: `4px solid ${toast.type === 'success' ? '#10b981' :
                                    toast.type === 'error' ? '#ef4444' :
                                        toast.type === 'warning' ? '#f59e0b' : '#3b82f6'
                                }`,
                            animation: 'slideIn 0.3s ease-out forwards',
                            color: '#1e293b'
                        }}
                    >
                        <div style={{
                            fontSize: '1.2rem',
                            color: toast.type === 'success' ? '#10b981' :
                                toast.type === 'error' ? '#ef4444' :
                                    toast.type === 'warning' ? '#f59e0b' : '#3b82f6'
                        }}>
                            {toast.type === 'success' ? '✓' :
                                toast.type === 'error' ? '✕' :
                                    toast.type === 'warning' ? '⚠' : 'ℹ'}
                        </div>
                        <div style={{ flex: 1, fontSize: '0.95rem', fontWeight: '500' }}>
                            {toast.message}
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                padding: '0 0 0 8px'
                            }}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
            <style jsx global>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
