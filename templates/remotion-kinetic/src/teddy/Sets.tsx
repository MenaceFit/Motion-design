// Décors, HUD, sous-titres « punch » et éléments graphiques de la série J-30 (originaux).
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import gsap from 'gsap';
import '@fontsource/anton/400.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/playfair-display/700-italic.css';

export const INK = '#1B1030';
export const C = {cream: '#FFF4E0', gold: '#FFC23D', pink: '#FF4F8B', cyan: '#3FE0FF', red: '#FF3B4E', violet: '#7B4DFF', orange: '#FF8A1F'};
const BACK = gsap.parseEase('back.out(3)');
const EXPO = gsap.parseEase('expo.out');
const ELASTIC = gsap.parseEase('elastic.out(1, 0.5)');
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

// ---------------- Décor : « la Grotte » (chambre de Teddy, nuit) ----------------
export const Grotte: React.FC<{t: number; screenGlow?: number}> = ({t, screenGlow = 1}) => {
  const flick = 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 7.3);
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2c1a4a" /><stop offset="1" stopColor="#1e1236" /></linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#3FE0FF" stopOpacity="0.38" /><stop offset="1" stopColor="#3FE0FF" stopOpacity="0" /></radialGradient>
        <pattern id="stripes" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="30" height="60" fill="#ffffff" opacity="0.025" /></pattern>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2a3f" /><stop offset="1" stopColor="#24182b" /></linearGradient>
      </defs>
      <rect width="1080" height="1500" fill="url(#wall)" />
      <rect width="1080" height="1500" fill="url(#stripes)" />
      {/* fenêtre nuit */}
      <g transform="translate(90 330)">
        <rect width="330" height="380" rx="16" fill="#0f1b3d" stroke={INK} strokeWidth={10} />
        <circle cx="240" cy="95" r="38" fill="#fff6c8" />
        {[[60, 60], [120, 150], [200, 230], [80, 290], [270, 300], [160, 60]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3 + (i % 2)} fill="#fff" opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 2 + i))} />
        ))}
        <path d="M165 0 V380 M0 190 H330" stroke={INK} strokeWidth={10} />
        <path d="M-30 -20 Q60 200 30 420 L-30 420 Z" fill="#5b2a86" stroke={INK} strokeWidth={8} />
        <path d="M360 -20 Q290 200 320 420 L360 420 Z" fill="#5b2a86" stroke={INK} strokeWidth={8} />
      </g>
      {/* néon « GG » */}
      <g transform="translate(560 330)" opacity={flick}>
        <text x="0" y="110" fontFamily="Anton" fontSize="150" fill="none" stroke={C.pink} strokeWidth="9" style={{filter: 'drop-shadow(0 0 14px #FF4F8B)'}}>GG</text>
      </g>
      {/* cadre photo : Mamie Jo (gants de boxe) */}
      <g transform="translate(830 330) rotate(4)">
        <rect width="170" height="210" rx="10" fill="#f3e6cc" stroke={INK} strokeWidth={8} />
        <rect x="18" y="18" width="134" height="140" fill="#7B4DFF" />
        <circle cx="85" cy="70" r="30" fill="#f2c09a" stroke={INK} strokeWidth={5} />
        <path d="M55 52 q30 -30 60 0" stroke="#ddd" strokeWidth={12} fill="none" />
        <circle cx="45" cy="128" r="22" fill={C.red} stroke={INK} strokeWidth={5} /><circle cx="125" cy="128" r="22" fill={C.red} stroke={INK} strokeWidth={5} />
        <text x="85" y="192" textAnchor="middle" fontFamily="Anton" fontSize="26" fill={INK}>MAMIE JO</text>
      </g>
      {/* bureau gamer + écran */}
      <circle cx="830" cy="1050" r="420" fill="url(#glow)" opacity={screenGlow * flick} />
      <g transform="translate(620 860)">
        <rect x="0" y="0" width="400" height="250" rx="18" fill="#141026" stroke={INK} strokeWidth={10} />
        <rect x="18" y="18" width="364" height="214" rx="8" fill="#16486b" />
        <rect x="18" y="18" width="364" height="214" rx="8" fill="#3FE0FF" opacity={0.25 * flick} />
        <path d="M60 190 l60 -70 l40 40 l70 -90 l80 120" stroke="#9ff3ff" strokeWidth={8} fill="none" />
        <rect x="180" y="250" width="40" height="70" fill="#2a2433" stroke={INK} strokeWidth={8} />
        <rect x="-60" y="320" width="520" height="34" rx="8" fill="#3b2a52" stroke={INK} strokeWidth={8} />
        <rect x="-60" y="354" width="520" height="10" fill={C.violet} opacity={0.7 + 0.3 * Math.sin(t * 4)} />
      </g>
      {/* lit défait */}
      <g transform="translate(-40 1180)">
        <rect x="0" y="120" width="420" height="200" rx="20" fill="#3a2a5c" stroke={INK} strokeWidth={10} />
        <path d="M0 140 Q120 60 260 120 Q340 160 420 110 L420 240 L0 240 Z" fill="#6a4fa0" stroke={INK} strokeWidth={10} />
        <rect x="40" y="70" width="150" height="80" rx="30" fill="#e8e0f5" stroke={INK} strokeWidth={9} transform="rotate(-8 115 110)" />
      </g>
      {/* sol */}
      <rect y="1500" width="1080" height="420" fill="url(#floor)" />
      <path d="M0 1500 H1080" stroke={INK} strokeWidth={10} />
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${i * 260 - 40} 1500 L${i * 300 - 200} 1920`} stroke="#000" strokeOpacity={0.15} strokeWidth={6} />)}
      {/* bazar : boîtes de pizza, canettes, chips */}
      <g transform="translate(700 1640) rotate(-6)">
        <rect width="230" height="40" rx="6" fill="#e9c38a" stroke={INK} strokeWidth={8} />
        <rect y="-34" width="230" height="40" rx="6" fill="#e9c38a" stroke={INK} strokeWidth={8} transform="rotate(4)" />
        <circle cx="115" cy="-14" r="12" fill="#d9542b" />
      </g>
      <g transform="translate(130 1700)"><rect width="46" height="80" rx="10" fill="#3FE0FF" stroke={INK} strokeWidth={7} transform="rotate(80)" /></g>
      <g transform="translate(480 1820)"><rect width="46" height="80" rx="10" fill={C.red} stroke={INK} strokeWidth={7} transform="rotate(-20)" /></g>
      <g transform="translate(940 1560)"><rect width="70" height="90" rx="10" fill={C.gold} stroke={INK} strokeWidth={7} transform="rotate(25)" /></g>
      {/* vignette */}
      <rect width="1080" height="1920" fill="url(#vig)" />
      <defs><radialGradient id="vig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.55" /></radialGradient></defs>
    </svg>
  );
};

// ---------------- HUD de série : éphéméride J-x + jauge GLOW ----------------
export const Hud: React.FC<{day: number; glow: number; level: number; t: number; slamAt?: number; prevDay?: number; flipAt?: number}> = ({day, glow, level, t, slamAt = 0, prevDay, flipAt}) => {
  // page d'éphéméride arrachée : prevDay → day à flipAt
  const flipK = prevDay !== undefined && flipAt !== undefined ? clamp01((t - flipAt) / 0.35) : 1;
  const shownDay = flipK < 0.5 ? (prevDay ?? day) : day;
  const flipRot = flipK < 0.5 ? flipK * 2 * 90 : (1 - flipK) * 2 * -90;
  const k = clamp01((t - slamAt) / 0.35);
  if (t < slamAt) return null;
  const s = interpolate(BACK(k), [0, 1], [1.7, 1]);
  const op = clamp01((t - slamAt) / 0.08);
  const star = 0.6 + 0.4 * Math.abs(Math.sin(t * 3));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: 60, left: 44, right: 44, display: 'flex', gap: 18, opacity: op, transform: `scale(${s})`, transformOrigin: '50% 0%'}}>
        <div style={{background: C.red, border: `7px solid ${INK}`, borderRadius: 22, width: 210, textAlign: 'center', boxShadow: `0 8px 0 ${INK}`, padding: '6px 0 10px', whiteSpace: 'nowrap'}}>
          <div style={{fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 26, color: C.cream, letterSpacing: 2}}>JOUR</div>
          <div style={{fontFamily: 'Anton', fontSize: 84, lineHeight: 0.95, color: C.cream, WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill', transform: `perspective(400px) rotateX(${flipRot}deg)`}}>J-{shownDay}</div>
        </div>
        <div style={{flex: 1, background: '#2a1a48', border: `7px solid ${INK}`, outline: `4px solid ${C.gold}`, outlineOffset: -11, borderRadius: 22, boxShadow: `0 8px 0 ${INK}`, padding: '14px 22px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 28, color: C.cream, letterSpacing: 2}}>
            <span>GLOW <span style={{color: C.gold, opacity: star}}>★</span></span>
            <span style={{background: C.gold, color: INK, borderRadius: 10, padding: '0 12px'}}>NIV. {level}</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 8}}>
            <div style={{flex: 1, height: 30, background: '#140a26', border: `4px solid ${INK}`, borderRadius: 16, overflow: 'hidden'}}>
              <div style={{width: `${Math.max(3, glow)}%`, height: '100%', background: `linear-gradient(90deg, ${C.violet}, ${C.gold})`, boxShadow: glow > 0.5 ? `0 0 18px ${C.gold}` : undefined}} />
            </div>
            <div style={{fontFamily: 'Anton', fontSize: 64, lineHeight: 1, color: C.gold, WebkitTextStroke: `5px ${INK}`, paintOrder: 'stroke fill', minWidth: 120, textAlign: 'right'}}>{Math.round(glow)}%</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------- Sous-titres « punch » (grammaire du genre) ----------------
// 1–2 mots à la fois, condensé gras, blanc + contour nuit épais + ombre dure ; mot-clé coloré.
// Entrée mesurée sur les références : échelle 0,45 → 1,15 en ~3 frames (30 fps) puis retour à 1,0
// vers la 6e frame ; aucune sortie (coupe franche au groupe suivant).
export type Cap = {text: string; start: number; end: number; color?: string; colorWords?: number};
export const PunchCaptions: React.FC<{caps: Cap[]; y?: number}> = ({caps, y = 0.74}) => {
  const f = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = f / fps;
  const cur = caps.find((c, i) => t >= c.start && t < (caps[i + 1]?.start ?? c.end));
  if (!cur) return null;
  const k = (t - cur.start) / 0.2; // ~6 frames à 30 fps
  const s = k < 0.45 ? interpolate(k, [0, 0.45], [0.45, 1.15]) : interpolate(k, [0.45, 0.75, 1], [1.15, 0.97, 1], {extrapolateRight: 'clamp'});
  const words = cur.text.split(' ');
  const size = Math.min(150, (width * 0.86) / Math.max(4, cur.text.length * 0.5));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: height * y, left: 0, right: 0, textAlign: 'center', transform: `translateY(-50%) scale(${s})`}}>
        {words.map((w, i) => (
          <span key={i} style={{fontFamily: 'Anton', fontSize: size, margin: '0 0.12em', textTransform: 'uppercase',
            color: cur.color && i >= words.length - (cur.colorWords ?? 1) ? cur.color : '#ffffff', WebkitTextStroke: `${size * 0.11}px ${INK}`, paintOrder: 'stroke fill',
            textShadow: `0 ${size * 0.07}px 0 ${INK}`}}>{w}</span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------------- Annotation « fiche perso » : cercle qui se trace + étiquette qui tombe ----------------
export const Annotation: React.FC<{x: number; y: number; r: number; label: string; lx: number; ly: number; t: number; color?: string; outAt?: number}> = ({x, y, r, label, lx, ly, t, color = C.gold, outAt}) => {
  if (t < 0) return null;
  const fade = outAt !== undefined ? 1 - clamp01((t - outAt) / 0.2) : 1;
  if (fade <= 0) return null;
  const draw = EXPO(clamp01(t / 0.35));
  const circ = 2 * Math.PI * r;
  const drop = ELASTIC(clamp01((t - 0.15) / 0.6));
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: fade}}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
        <circle cx={x} cy={y} r={r} fill="none" stroke={INK} strokeWidth={16} strokeDasharray={circ} strokeDashoffset={circ * (1 - draw)} transform={`rotate(-90 ${x} ${y})`} />
        <circle cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth={9} strokeDasharray={circ} strokeDashoffset={circ * (1 - draw)} transform={`rotate(-90 ${x} ${y})`} />
        <path d={`M${x + (lx > x ? r : -r) * 0.7} ${y - r * 0.7} L${lx} ${ly + 30}`} stroke={color} strokeWidth={6} opacity={draw} />
      </svg>
      <div style={{position: 'absolute', left: lx, top: ly, transform: `translate(-50%, ${(1 - drop) * -60}px) rotate(${(1 - drop) * -8 - 3}deg)`, opacity: clamp01((t - 0.15) / 0.1),
        background: C.cream, border: `6px solid ${INK}`, borderRadius: 14, padding: '8px 16px', boxShadow: `0 7px 0 ${INK}`,
        fontFamily: 'Anton', fontSize: 40, color: INK, whiteSpace: 'nowrap'}}>{label}</div>
    </AbsoluteFill>
  );
};

// ---------------- Faire-part (carton d'invitation) ----------------
export const Invitation: React.FC<{w: number}> = ({w}) => (
  <div style={{width: w, height: w * 1.38, background: '#fffaf0', border: `${w * 0.012}px solid ${INK}`, borderRadius: w * 0.03, boxShadow: `0 ${w * 0.03}px 0 ${INK}`,
    position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
    <div style={{position: 'absolute', inset: w * 0.04, border: `${w * 0.008}px solid ${C.gold}`, borderRadius: w * 0.02}} />
    <div style={{fontFamily: 'Space Grotesk', fontWeight: 700, letterSpacing: w * 0.012, fontSize: w * 0.045, color: '#a07a2c'}}>SAVE THE DATE</div>
    <div style={{fontFamily: 'Playfair Display', fontStyle: 'italic', fontWeight: 700, fontSize: w * 0.16, color: INK, lineHeight: 1.05, margin: `${w * 0.05}px 0`}}>Inès<br /><span style={{fontSize: w * 0.09, color: C.gold}}>&amp;</span><br />Maxence</div>
    <div style={{fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: w * 0.05, color: INK}}>se marient</div>
    <div style={{fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: w * 0.045, color: '#a07a2c', marginTop: w * 0.03}}>SAMEDI 14 JUIN</div>
    <div style={{fontSize: w * 0.08, marginTop: w * 0.04, color: C.pink}}>♥</div>
  </div>
);

// ---------------- Badge de rang (Diamant → Carton) ----------------
export const RankBadge: React.FC<{kind: 'diamant' | 'carton'; t: number; size?: number}> = ({kind, t, size = 260}) => {
  const k = BACK(clamp01(t / 0.3));
  const shine = (t * 1.6) % 2;
  const dia = kind === 'diamant';
  return (
    <div style={{width: size, transform: `scale(${k}) rotate(${(1 - k) * -20 + Math.sin(t * 2) * 3}deg)`, textAlign: 'center'}}>
      <svg viewBox="0 0 200 180" width={size} height={size * 0.9}>
        {dia ? (
          <g>
            <path d="M40 40 L160 40 L190 80 L100 170 L10 80 Z" fill={C.cyan} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
            <path d="M10 80 H190 M70 40 L55 80 L100 170 L145 80 L130 40" stroke={INK} strokeWidth={5} fill="none" />
            <path d={`M${20 + shine * 80} 30 l30 0 l-60 160 l-30 0z`} fill="#fff" opacity={0.45} />
          </g>
        ) : (
          <g>
            <rect x="25" y="45" width="150" height="110" rx="6" fill="#c08a52" stroke={INK} strokeWidth={9} transform="rotate(-4 100 100)" />
            <path d="M25 70 H175 M100 45 V155" stroke="#8a5a2c" strokeWidth={6} transform="rotate(-4 100 100)" />
            <path d="M60 120 l25 -10 M120 90 l20 15" stroke="#8a5a2c" strokeWidth={5} />
          </g>
        )}
      </svg>
      <div style={{fontFamily: 'Anton', fontSize: size * 0.2, color: dia ? C.cyan : '#c08a52', WebkitTextStroke: `${size * 0.025}px ${INK}`, paintOrder: 'stroke fill', marginTop: -size * 0.04}}>{dia ? 'DIAMANT' : 'CARTON'}</div>
    </div>
  );
};
