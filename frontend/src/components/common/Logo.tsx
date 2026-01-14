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
                    <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Abstract P shape */}
                <path
                    d="M10 8C10 5.79086 11.7909 4 14 4H20C25.5228 4 30 8.47715 30 14V14C30 19.5228 25.5228 24 20 24H14V34C14 36.2091 12.2091 38 10 38C7.79086 38 6 36.2091 6 34V12C6 9.79086 7.79086 8 10 8Z"
                    fill="url(#logoGradient)"
                    opacity="0.9"
                />

                {/* The "X" cut/overlay */}
                <path
                    d="M34 36L24 26"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                />
                <path
                    d="M34 26L24 36"
                    stroke="#a855f7"
                    strokeWidth="4"
                    strokeLinecap="round"
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
