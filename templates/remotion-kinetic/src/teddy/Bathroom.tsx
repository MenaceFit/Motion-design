// Épisode 2 « La douche » : salle de bain (sale), douche-placard, eau glacée, mousse envahissante,
// couloir inondé, Bzz qui part en vacances, Croquette qui applaudit, bandeaux du genre. Original.
import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import gsap from 'gsap';
import {INK, C, clamp01} from './Sets';

const BACK = gsap.parseEase('back.out(2)');
const EXPO = gsap.parseEase('expo.out');
const ELASTIC = gsap.parseEase('elastic.out(1, 0.45)');
const o = {stroke: INK, strokeWidth: 7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

// ============ Salle de bain ============
export const BathroomSet: React.FC<{t: number; lightFlicker?: boolean}> = ({t, lightFlicker = true}) => {
  const fl = lightFlicker ? (Math.sin(t * 23) > 0.92 ? 0.55 : 1) : 1;
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="tiles" width="120" height="120" patternUnits="userSpaceOnUse">
          <rect width="120" height="120" fill="#9fd8c4" /><rect x="4" y="4" width="112" height="112" fill="#b6e6d4" />
        </pattern>
        <pattern id="floorT" width="140" height="140" patternUnits="userSpaceOnUse">
          <rect width="140" height="140" fill="#d9d2c0" /><rect width="70" height="70" fill="#c9c0aa" /><rect x="70" y="70" width="70" height="70" fill="#c9c0aa" />
        </pattern>
      </defs>
      <rect width="1080" height="1500" fill="url(#tiles)" />
      {/* crasse, moisissure dans les joints et coins */}
      {Array.from({length: 26}).map((_, i) => (
        <circle key={i} cx={random(`bx${i}`) * 1080} cy={random(`by${i}`) * 1450} r={14 + random(`br${i}`) * 40} fill={i % 3 ? '#6f8e34' : '#5c4a2a'} opacity={0.35} />
      ))}
      <path d="M0 1300 Q200 1260 400 1320 T800 1300 T1080 1310 V1500 H0 Z" fill="#6f8e34" opacity={0.35} />
      {/* ampoule nue qui grésille */}
      <g opacity={fl}>
        <path d="M540 0 V160" stroke={INK} strokeWidth={6} />
        <circle cx={540} cy={190} r={34} fill="#fff6c8" stroke={INK} strokeWidth={6} />
        <circle cx={540} cy={190} r={180} fill="#fff6c8" opacity={0.18} />
      </g>
      {/* miroir taché et fêlé + lavabo */}
      <g transform="translate(70 520)">
        <rect width="330" height="380" rx="20" fill="#cfe8ff" stroke={INK} strokeWidth={10} />
        <path d="M40 60 l60 90 l-30 60 l90 120" stroke="#fff" strokeWidth={5} fill="none" />
        {[[200, 90], [250, 160], [120, 280], [270, 300], [180, 220]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={10 + (i % 3) * 6} fill="#fff" opacity={0.85} />)}
        <path d="M-20 450 H350 L320 560 H10 Z" fill="#f4f4f4" stroke={INK} strokeWidth={9} />
        <path d="M160 450 v-50 h40" stroke="#9aa" strokeWidth={14} fill="none" strokeLinecap="round" />
        {/* brosse à dents… poilue */}
        <g transform="translate(260 380) rotate(20)"><rect width="16" height="90" rx="6" fill={C.pink} stroke={INK} strokeWidth={4} /><path d="M-6 0 q12 -40 28 0" fill="#8be36a" stroke={INK} strokeWidth={4} /></g>
        <path d="M60 470 q30 30 60 0 q20 40 60 10" stroke="#3a2416" strokeWidth={4} fill="none" />
      </g>
      {/* rouleau de PQ vide */}
      <g transform="translate(450 760)"><rect width="34" height="70" fill="#c08a52" stroke={INK} strokeWidth={5} /><path d="M-20 -6 h74" stroke={INK} strokeWidth={6} /></g>
      {/* cabine de douche (droite) */}
      <g transform="translate(580 300)">
        <rect width="460" height="1220" fill="#e3f4ff" stroke={INK} strokeWidth={10} opacity={0.6} />
        <path d="M230 30 V110 H330" stroke="#8a8fa0" strokeWidth={16} fill="none" strokeLinecap="round" />
        <ellipse cx="330" cy="130" rx="60" ry="22" fill="#a7adbf" stroke={INK} strokeWidth={7} />
        <path d="M0 0 H460" stroke={INK} strokeWidth={10} />
      </g>
      {/* sol */}
      <rect y="1500" width="1080" height="420" fill="url(#floorT)" />
      <path d="M0 1500 H1080" stroke={INK} strokeWidth={10} />
      <ellipse cx="300" cy="1700" rx="130" ry="30" fill="#7a5a2a" opacity={0.4} />
      {/* serviette en boule */}
      <path d="M40 1820 Q60 1740 160 1760 Q260 1730 280 1820 Z" fill="#7B4DFF" {...o} />
      <rect width="1080" height="1920" fill="url(#bvig)" />
      <defs><radialGradient id="bvig" cx="0.5" cy="0.45" r="0.8"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.5" /></radialGradient></defs>
    </svg>
  );
};

// ============ Rideau de douche (devant Teddy : on ne voit que la tête) ============
export const ShowerCurtain: React.FC<{open: number}> = ({open}) => (
  <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position: 'absolute'}}>
    <path d="M560 300 H1060" stroke="#8a8fa0" strokeWidth={14} />
    <g transform={`translate(${560 + open * 380} 0) scale(${1 - open * 0.8} 1)`}>
      <path d="M0 305 Q60 330 120 305 Q180 330 240 305 Q300 330 360 305 Q420 330 480 305 L480 1500 Q420 1480 360 1500 Q300 1480 240 1500 Q180 1480 120 1500 Q60 1480 0 1500 Z" fill="#ffd25a" {...o} />
      {[[90, 600], [300, 760], [180, 1000], [380, 1200], [100, 1300]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}><ellipse rx={36} ry={26} fill="#fff4e0" stroke={INK} strokeWidth={4} /><circle cx={-24} cy={-24} r={16} fill="#fff4e0" stroke={INK} strokeWidth={4} /><path d="M-40 -24 l-12 4 l12 4z" fill={C.orange} /></g>
      ))}
      <ellipse cx={240} cy={1100} rx={120} ry={50} fill="#6f8e34" opacity={0.4} />
    </g>
  </svg>
);

// ============ Bazar stocké dans la douche (éjecté sur L5) ============
export const ShowerJunk: React.FC<{t: number; out: number}> = ({t, out}) => {
  const item = (i: number, child: React.ReactNode, x: number, y: number) => {
    const k = clamp01(out * 1.4 - i * 0.12);
    const dx = -k * (500 + i * 120), dy = -Math.sin(k * Math.PI) * 360 + k * k * 300, r = k * (i % 2 ? 280 : -320);
    return <g key={i} transform={`translate(${x + dx} ${y + dy}) rotate(${r})`}>{child}</g>;
  };
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position: 'absolute'}}>
      {item(0, <><rect x={-110} y={-24} width={220} height={48} rx={6} fill="#e9c38a" {...o} /><rect x={-100} y={-70} width={220} height={48} rx={6} fill="#e9c38a" {...o} /><rect x={-115} y={-116} width={220} height={48} rx={6} fill="#e9c38a" {...o} /></>, 810, 1470)}
      {item(1, <><rect x={-50} y={-70} width={100} height={130} rx={10} fill="#FFC23D" {...o} /><text x={0} y={10} textAnchor="middle" fontFamily="Anton" fontSize={40} fill={INK}>CHIPS</text></>, 700, 1380)}
      {item(2, <><rect x={-50} y={-70} width={100} height={130} rx={10} fill={C.red} {...o} /><text x={0} y={10} textAnchor="middle" fontFamily="Anton" fontSize={40} fill="#fff">CHIPS</text></>, 930, 1300)}
      {/* la plante qui a poussé toute seule (depuis la bonde) */}
      {item(3, <g transform={`scale(${1 + Math.sin(t * 2) * 0.02})`}>
        <path d="M0 0 V-260" stroke="#3f8a2e" strokeWidth={14} />
        {[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={i % 2 ? 50 : -50} cy={-60 - i * 45} rx={56} ry={24} fill="#5BD17A" stroke={INK} strokeWidth={5} transform={`rotate(${i % 2 ? -25 : 25} ${i % 2 ? 50 : -50} ${-60 - i * 45})`} />)}
        <circle cx={0} cy={-280} r={30} fill={C.pink} stroke={INK} strokeWidth={5} /><circle cx={-10} cy={-286} r={5} fill={INK} /><circle cx={10} cy={-286} r={5} fill={INK} />
      </g>, 820, 1500)}
    </svg>
  );
};

// ============ Jet d'eau ============
export const Water: React.FC<{t: number; on: boolean; x?: number}> = ({t, on, x = 910}) => {
  if (!on) return null;
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position: 'absolute'}}>
      {Array.from({length: 18}).map((_, i) => {
        const lx = x - 60 + (i % 9) * 15 + Math.sin(i) * 8, y0 = 450 + ((t * 1800 + i * 97) % 900);
        return <path key={i} d={`M${lx} ${y0} l${(lx - x) * 0.1} 70`} stroke="#8fd3ff" strokeWidth={6} strokeLinecap="round" opacity={0.85} />;
      })}
    </svg>
  );
};

// ============ Mousse qui envahit tout ============
export const Foam: React.FC<{level: number; t: number; cx?: number}> = ({level, t, cx = 900}) => {
  if (level <= 0) return null;
  const n = 90;
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position: 'absolute'}}>
      {Array.from({length: n}).map((_, i) => {
        const rx = random(`fx${i}`), ry = random(`fy${i}`), rs = random(`fs${i}`);
        const reach = level * 2400;                              // la mousse se propage depuis la douche
        const x = cx + (rx - 0.65) * Math.min(reach, 2400);
        const y = 1920 - ry * Math.min(1920, level * 2300) - 40;
        const r = (40 + rs * 110) * clamp01(level * 3 - ry * 0.6) * (1 + Math.sin(t * 3 + i) * 0.04);
        if (r <= 1) return null;
        return <g key={i}><circle cx={x} cy={y} r={r} fill="#ffffff" stroke="#cfe8ff" strokeWidth={6} /><circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.22} fill="#e6f6ff" /></g>;
      })}
    </svg>
  );
};

// ============ Couloir inondé de mousse ============
export const Hallway: React.FC<{t: number}> = ({t}) => {
  const k = EXPO(clamp01(t / 0.6));
  return (
    <AbsoluteFill style={{background: '#3a2a52'}}>
      <svg viewBox="0 0 1080 1920" width="100%" height="100%">
        <path d="M0 0 H1080 V1500 H0 Z" fill="#4a3566" />
        <path d="M200 0 L420 600 H660 L880 0" fill="#57407a" />
        <path d="M0 1920 L420 1100 H660 L1080 1920 Z" fill="#6a5a4a" />
        <rect x="430" y="600" width="220" height="500" fill="#2a1d3d" stroke={INK} strokeWidth={8} />
        {/* porte de la salle de bain qui craque */}
        <rect x="440" y="610" width="200" height="490" fill="#9fd8c4" stroke={INK} strokeWidth={8} />
        <text x="540" y="700" textAnchor="middle" fontFamily="Anton" fontSize="44" fill={INK}>WC / DOUCHE</text>
        {/* cadres au mur */}
        <rect x="120" y="500" width="160" height="200" fill="#f3e6cc" stroke={INK} strokeWidth={8} transform={`rotate(${-6 + Math.sin(t * 6) * 4} 200 600)`} />
        <rect x="800" y="480" width="160" height="200" fill="#f3e6cc" stroke={INK} strokeWidth={8} transform={`rotate(${8 - Math.sin(t * 7) * 4} 880 580)`} />
      </svg>
      {/* déferlante de mousse qui sort de la porte vers la caméra */}
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 70}).map((_, i) => {
          const d = random(`hd${i}`), a = (random(`ha${i}`) - 0.5) * 1.4;
          const prog = k * (0.5 + d);
          const x = 540 + Math.sin(a) * prog * 900, y = 1050 + prog * 900 * (0.6 + random(`hy${i}`) * 0.5);
          const r = 20 + prog * 140 * (0.4 + random(`hr${i}`) * 0.6);
          return <circle key={i} cx={x} cy={y} r={r} fill="#fff" stroke="#cfe8ff" strokeWidth={5} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ============ Bzz part en vacances (valise + lunettes de soleil) ============
export const BzzVacation: React.FC<{t: number; fromX: number; fromY: number}> = ({t, fromX, fromY}) => {
  if (t < 0 || t > 2.5) return null;
  const x = fromX + t * 520 + Math.sin(t * 9) * 30, y = fromY - t * 380 + Math.sin(t * 13) * 20;
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position: 'absolute'}}>
      <g transform={`translate(${x} ${y}) scale(2.4)`}>
        <ellipse rx={22} ry={16} fill={INK} />
        <ellipse cx={-10} cy={-22} rx={16} ry={11 * (0.5 + 0.5 * Math.abs(Math.sin(t * 60)))} fill="#cfe8ff" stroke={INK} strokeWidth={2} />
        <ellipse cx={12} cy={-22} rx={16} ry={11 * (0.5 + 0.5 * Math.abs(Math.cos(t * 60)))} fill="#cfe8ff" stroke={INK} strokeWidth={2} />
        <rect x={-20} y={-10} width={14} height={9} rx={3} fill={INK} stroke="#fff" strokeWidth={1.5} /><rect x={-2} y={-10} width={14} height={9} rx={3} fill={INK} stroke="#fff" strokeWidth={1.5} />
        <g transform="translate(0 28)"><rect x={-14} y={0} width={28} height={20} rx={4} fill={C.orange} stroke={INK} strokeWidth={2.5} /><path d="M-5 0 v-6 h10 v6" stroke={INK} strokeWidth={2} fill="none" /></g>
        <path d="M0 16 V28" stroke={INK} strokeWidth={2} />
      </g>
    </svg>
  );
};

// ============ Croquette assise qui applaudit (lentement) ============
export const CroquetteClap: React.FC<{t: number; clapping: boolean}> = ({t, clapping}) => {
  const c = clapping ? Math.abs(Math.sin(t * 4.5)) : 0.6;
  return (
    <svg viewBox="-160 -230 320 330" width={320} height={330} style={{overflow: 'visible'}}>
      <ellipse cx={0} cy={40} rx={100} ry={70} fill="#f08a2c" {...o} />
      <path d="M90 60 q70 -10 50 -90" stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" />
      <path d="M90 60 q70 -10 50 -90" stroke="#f08a2c" strokeWidth={12} fill="none" strokeLinecap="round" />
      <g transform="translate(0 -90)">
        <path d="M-50 -30 L-40 -90 L-10 -50 Z M50 -30 L40 -90 L10 -50 Z" fill="#f08a2c" {...o} />
        <circle r={64} fill="#f08a2c" {...o} />
        <ellipse cx={-22} cy={-6} rx={14} ry={10} fill="#fff" stroke={INK} strokeWidth={4} /><ellipse cx={22} cy={-6} rx={14} ry={10} fill="#fff" stroke={INK} strokeWidth={4} />
        <rect x={-38} y={-18} width={32} height={10} fill="#f08a2c" /><rect x={6} y={-18} width={32} height={10} fill="#f08a2c" />
        <circle cx={-22} cy={-1} r={4} fill={INK} /><circle cx={22} cy={-1} r={4} fill={INK} />
        <path d="M-8 18 h16 l-8 8 z" fill="#ff7bb0" stroke={INK} strokeWidth={3} />
        <path d="M-14 32 q14 6 28 0" stroke={INK} strokeWidth={4} fill="none" />
      </g>
      {/* pattes qui applaudissent */}
      <ellipse cx={-30 + c * 22} cy={-10} rx={20} ry={30} fill="#f08a2c" {...o} strokeWidth={6} />
      <ellipse cx={30 - c * 22} cy={-10} rx={20} ry={30} fill="#f08a2c" {...o} strokeWidth={6} />
      {clapping && c < 0.15 ? <g stroke={INK} strokeWidth={4}><path d="M0 -60 v-30 M-30 -50 l-16 -22 M30 -50 l16 -22" /></g> : null}
    </svg>
  );
};

// ============ Bandeau « VOUS AVEZ CHOISI : … » ============
export const ChoiceBanner: React.FC<{t: number; text: string}> = ({t, text}) => {
  if (t < 0) return null;
  const s = BACK(clamp01(t / 0.35));
  return (
    <div style={{position: 'absolute', top: 290, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${s})`}}>
      <div style={{background: INK, border: `6px solid ${C.gold}`, borderRadius: 40, padding: '10px 34px', fontFamily: 'Anton', fontSize: 56, color: C.cream, boxShadow: `0 8px 0 #000`}}>
        VOUS AVEZ CHOISI : <span style={{color: C.violet === '#7B4DFF' ? '#b79bff' : C.violet}}>{text}</span>
      </div>
    </div>
  );
};

// ============ Carton « 20 MINUTES PLUS TARD » ============
export const TimeCard: React.FC<{t: number; text: string}> = ({t, text}) => {
  const s = ELASTIC(clamp01(t / 0.7));
  return (
    <AbsoluteFill style={{background: `repeating-conic-gradient(from 0deg at 50% 50%, ${C.gold} 0deg 12deg, #ffd75a 12deg 24deg)`, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `scale(${s}) rotate(${-6 + Math.sin(t * 3) * 2}deg)`, background: C.cream, border: `10px solid ${INK}`, borderRadius: 30, padding: '30px 50px',
        fontFamily: 'Anton', fontSize: 120, color: INK, textAlign: 'center', boxShadow: `0 16px 0 ${INK}`, lineHeight: 1}}>{text}</div>
    </AbsoluteFill>
  );
};

// ============ Étincelles « propre » ============
export const Sparkles: React.FC<{t: number; cx: number; cy: number; r: number}> = ({t, cx, cy, r}) => (
  <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position: 'absolute'}}>
    {Array.from({length: 9}).map((_, i) => {
      const a = i * 0.7 + t * 0.8, d = r * (0.6 + 0.4 * random(`sp${i}`));
      const s = Math.abs(Math.sin(t * 4 + i * 1.3)) * (1.2 + random(`ss${i}`));
      return <path key={i} transform={`translate(${cx + Math.cos(a) * d} ${cy + Math.sin(a) * d * 1.3}) scale(${s})`} d="M0 -22 L6 -6 L22 0 L6 6 L0 22 L-6 6 L-22 0 L-6 -6 Z" fill="#fff" stroke={C.gold} strokeWidth={3} />;
    })}
  </svg>
);

// ============ Popup de jauge (+4 % / −1 %) ============
export const GaugePop: React.FC<{t: number; text: string; color: string}> = ({t, text, color}) => {
  if (t < 0 || t > 1.6) return null;
  const s = ELASTIC(clamp01(t / 0.6)), y = -t * 60, op = 1 - clamp01((t - 1.2) / 0.4);
  return (
    <div style={{position: 'absolute', top: 260 + y, right: 90, transform: `scale(${s})`, opacity: op, fontFamily: 'Anton', fontSize: 110, color,
      WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 8px 0 ${INK}`}}>{text}</div>
  );
};
