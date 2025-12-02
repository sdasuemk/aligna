import { LucideIcon } from 'lucide-react';

interface GlassIconProps {
    icon: LucideIcon;
    size?: number;
    className?: string;
}

export default function GlassIcon({ icon: Icon, size = 24, className = '' }: GlassIconProps) {
    return (
        <div
            className={className}
            style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                width: `${size * 2}px`,
                height: `${size * 2}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
        >
            <Icon size={size} color="white" strokeWidth={1.5} />
        </div>
    );
}
