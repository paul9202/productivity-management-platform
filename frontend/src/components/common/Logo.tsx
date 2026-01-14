import React from 'react';

interface LogoProps {
    className?: string;
    size?: number;
    showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 32, showText = true }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="logoAppGradient" x1="0" y1="0" x2="40" y2="40">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#d946ef" />
                    </linearGradient>
                    <filter id="softShadow" x="-2" y="-2" width="44" height="44">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#6366f1" floodOpacity="0.3" />
                    </filter>
                </defs>

                {/* App Icon Container: Modern Rounded Square */}
                <rect
                    x="2"
                    y="2"
                    width="36"
                    height="36"
                    rx="10"
                    fill="url(#logoAppGradient)"
                    filter="url(#softShadow)"
                />

                {/* Abstract 'P' formed by geometric white shapes */}
                {/* Vertical Stem */}
                <rect x="12" y="10" width="5" height="20" rx="2.5" fill="white" />

                {/* Curve/Bowl */}
                <path
                    d="M17 10H20C24.4183 10 28 13.5817 28 18C28 22.4183 24.4183 26 20 26H16V21H20C21.6569 21 23 19.6569 23 18C23 16.3431 21.6569 15 20 15H17V10Z"
                    fill="white"
                />
            </svg>

            {showText && (
                <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em', display: 'flex', alignItems: 'baseline' }}>
                    <span style={{ color: 'inherit' }}>Productivity</span>
                    <span style={{ color: '#a855f7', marginLeft: '1px' }}>-X</span>
                </div>
            )}
        </div>
    );
};
