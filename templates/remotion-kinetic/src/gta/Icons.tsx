/** Icônes SVG originales (traits épais, coins ronds) pour les overlays GtaGuide. viewBox 0 0 48 48. */
import React from 'react';

export type IconName =
  | 'cash' | 'diamond' | 'car' | 'gun' | 'key' | 'pin' | 'lock' | 'star' | 'skull' | 'phone' | 'map'
  | 'check' | 'warning' | 'hand' | 'shield' | 'clock' | 'fire' | 'heart' | 'wanted' | 'swap' | 'bag' | 'code' | 'boat' | 'plane';

const P: Record<IconName, React.ReactNode> = {
  cash: <><rect x="5" y="13" width="38" height="22" rx="4" /><circle cx="24" cy="24" r="5" /><path d="M11 19v10M37 19v10" /></>,
  diamond: <><path d="M10 18l6-8h16l6 8-14 20z" /><path d="M10 18h28M20 10l-4 8 8 20 8-20-4-8" /></>,
  car: <><path d="M7 30v-6l4-9h26l4 9v6z" /><path d="M7 30v5h6v-5M35 30v5h6v-5M12 24h24" /><circle cx="14" cy="27" r="1.5" /><circle cx="34" cy="27" r="1.5" /></>,
  gun: <><path d="M6 16h34v7H24l-2 4h-6l-2 9H8l3-13H6z" /><path d="M40 16v-3M20 23v-3" /></>,
  key: <><circle cx="15" cy="24" r="8" /><path d="M23 24h19M36 24v6M41 24v5" /></>,
  pin: <><path d="M24 44S10 29 10 19a14 14 0 0128 0c0 10-14 25-14 25z" /><circle cx="24" cy="19" r="5" /></>,
  lock: <><rect x="10" y="21" width="28" height="21" rx="4" /><path d="M16 21v-6a8 8 0 0116 0v6M24 29v6" /></>,
  star: <path d="M24 6l5.6 11.6 12.4 1.8-9 8.8 2.1 12.4L24 34.8l-11.1 5.8 2.1-12.4-9-8.8 12.4-1.8z" />,
  skull: <><path d="M10 22a14 14 0 0128 0v6l-4 3v7H14v-7l-4-3z" /><circle cx="18" cy="24" r="3" /><circle cx="30" cy="24" r="3" /><path d="M21 38v-4M27 38v-4" /></>,
  phone: <><rect x="14" y="5" width="20" height="38" rx="4" /><path d="M21 37h6" /></>,
  map: <><path d="M5 12l12-5 14 5 12-5v29l-12 5-14-5-12 5z" /><path d="M17 7v29M31 12v29" /></>,
  check: <path d="M9 25l9 9 21-21" />,
  warning: <><path d="M24 6L44 41H4z" /><path d="M24 19v10M24 35v1" /></>,
  hand: <><path d="M18 26V9a3 3 0 016 0v13l2-1a3 3 0 013 3v1l2-1a3 3 0 013 3v1l1-.5a3 3 0 014 2.7V36c0 5-4 9-9 9h-6c-4 0-6-2-8-5l-6-9a3 3 0 015-3z" /></>,
  shield: <path d="M24 5l16 6v12c0 10-7 17-16 20C15 40 8 33 8 23V11z" />,
  clock: <><circle cx="24" cy="24" r="18" /><path d="M24 13v11l7 5" /></>,
  fire: <path d="M24 44c-9 0-14-6-14-13 0-8 7-11 8-19 4 3 6 7 6 11 2-2 3-5 3-7 6 4 11 9 11 16 0 7-5 12-14 12z" />,
  heart: <path d="M24 41S6 30 6 17a9 9 0 0118-3 9 9 0 0118 3c0 13-18 24-18 24z" />,
  wanted: <><path d="M24 6l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z" /><path d="M8 42h32" /></>,
  swap: <><path d="M8 17h30l-7-7M40 31H10l7 7" /></>,
  bag: <><path d="M9 17h30l-3 25H12z" /><path d="M17 17v-4a7 7 0 0114 0v4" /></>,
  code: <><rect x="8" y="6" width="32" height="36" rx="4" /><path d="M15 15h4M22 15h4M29 15h4M15 23h4M22 23h4M29 23h4M15 31h4M22 31h4M29 31h4" /></>,
  boat: <><path d="M5 31h38l-5 9H11z" /><path d="M14 31V19h14l6 12M24 19v-8" /></>,
  plane: <path d="M44 24L6 10l8 14-8 14zM14 24h30" />,
};

export const Icon: React.FC<{name: IconName; size?: number; color?: string; glow?: boolean}> = ({name, size = 48, color = '#fff', glow}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round"
    style={glow ? {filter: `drop-shadow(0 0 10px ${color})`} : undefined}>
    {name === 'pin' && glow ? <><path d="M24 44S10 29 10 19a14 14 0 0128 0c0 10-14 25-14 25z" fill={color} /><circle cx="24" cy="19" r="5" fill="#fff" stroke="none" /></> : P[name]}
  </svg>
);
