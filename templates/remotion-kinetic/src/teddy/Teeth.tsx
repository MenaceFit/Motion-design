// Briques de l'épisode 3 « J-28 : les dents » : gros plan bouche (hook), panneau « code postal »,
// brosse-éponge à manette, dentifrice périmé, fissures du miroir, Croquette en masque à gaz,
// minuteur de brossage, « DING » des dents, Bzz en lunettes de soleil, chat selfie + like de Maxence.
import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import gsap from 'gsap';
import {Teddy} from './Teddy';
import {clamp01, INK, C} from './Sets';
import {CroquetteClap} from './Bathroom';

const BACK = gsap.parseEase('back.out(2.2)');
const EXPO = gsap.parseEase('expo.out');
const ELASTIC = gsap.parseEase('elastic.out(1, 0.45)');
const o = {stroke: INK, strokeWidth: 8, strokeLinejoin: 'round' as const};
const EMO: React.CSSProperties = {fontFamily: 'Noto Color Emoji'};

// ============ HOOK : gros plan sur la bouche (dents jaunes, tartre, gaz vert) ============
export const MouthMacro: React.FC<{t: number; open: number; gas: number}> = ({t, open, gas}) => {
  const h = 120 + 380 * open;                  // ouverture de la bouche
  const wob = Math.sin(t * 7) * 6;
  const teethTop = [-300, -180, -60, 60, 180, 300];
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%">
      <defs>
        <radialGradient id="mmSkin" cx="0.5" cy="0.45" r="0.7"><stop offset="0" stopColor="#f6c9a0" /><stop offset="1" stopColor="#d99a6c" /></radialGradient>
        <radialGradient id="mmIn" cx="0.5" cy="0.4" r="0.6"><stop offset="0" stopColor="#3a0f18" /><stop offset="1" stopColor="#1a050a" /></radialGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#mmSkin)" />
      {/* boutons + poils de barbe mal rasée */}
      {Array.from({length: 40}).map((_, i) => <path key={i} d={`M${random(`bx${i}`) * 1080} ${1250 + random(`by${i}`) * 500} l6 14`} stroke="#6b4a35" strokeWidth={5} />)}
      <circle cx={190} cy={560} r={26} fill="#e2574c" /><circle cx={880} cy={640} r={20} fill="#e2574c" /><circle cx={820} cy={1500} r={16} fill="#e2574c" />
      <g transform={`translate(540 ${960 + wob})`}>
        {/* intérieur de la bouche */}
        <ellipse rx={420} ry={h / 2 + 30} fill="url(#mmIn)" {...o} strokeWidth={16} />
        <ellipse cx={0} cy={h / 2 - 40} rx={200} ry={70 + 60 * open} fill="#c94a5a" opacity={0.9} />
        {/* dents du haut : jaunes, tartre vert, une cassée */}
        {teethTop.map((x, i) => (
          <g key={i} transform={`translate(${x} ${-h / 2 - 6})`}>
            <path d={i === 4 ? 'M-50 0 h100 v70 l-30 -20 l-20 40 l-50 -30 z' : 'M-52 0 h104 v100 q-52 30 -104 0 z'} fill={i % 2 ? '#e3c64f' : '#d9b43a'} {...o} strokeWidth={9} />
            <path d="M-46 8 q46 18 92 0" stroke="#7da33a" strokeWidth={14} fill="none" opacity={0.85} />
            {i === 1 ? <circle cx={10} cy={60} r={16} fill="#5c4a2a" /> : null}
          </g>
        ))}
        {/* dents du bas */}
        {[-240, -120, 0, 120, 240].map((x, i) => (
          <g key={i} transform={`translate(${x} ${h / 2 + 6})`}>
            <path d="M-50 0 h100 v-80 q-50 -24 -100 0 z" fill={i % 2 ? '#d9b43a' : '#e8d36b'} {...o} strokeWidth={9} />
            <path d="M-44 -8 q44 -16 88 0" stroke="#7da33a" strokeWidth={12} fill="none" opacity={0.8} />
          </g>
        ))}
        {/* lèvres */}
        <path d={`M-460 0 Q0 ${-h / 2 - 140} 460 0 Q0 ${-h / 2 - 60} -460 0 Z`} fill="#d97a6a" {...o} strokeWidth={14} />
        <path d={`M-460 0 Q0 ${h / 2 + 140} 460 0 Q0 ${h / 2 + 60} -460 0 Z`} fill="#c96a5a" {...o} strokeWidth={14} />
        {/* bout de chips coincé */}
        <path d="M-150 -120 l60 -20 l20 50 l-60 14 z" fill="#FFC23D" stroke={INK} strokeWidth={6} transform={`translate(0 ${-h / 2 + 120})`} />
      </g>
      {/* gaz vert qui sort par vagues */}
      {gas > 0 ? Array.from({length: 14}).map((_, i) => {
        const k = clamp01(gas * 1.4 - i * 0.05);
        const a = -Math.PI / 2 + (random(`ga${i}`) - 0.5) * 2.4;
        const d = 120 + 900 * EXPO(k);
        return <circle key={i} cx={540 + Math.cos(a) * d * 0.9} cy={960 + Math.sin(a) * d * 0.7 + Math.sin(t * 3 + i) * 14} r={(80 + random(`gr${i}`) * 110) * (0.4 + k)}
          fill={i % 3 ? '#8be36a' : '#6fc24a'} opacity={0.55 * (1 - k * 0.35)} />;
      }) : null}
      {/* lignes d'odeur */}
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M${300 + i * 120} ${640 - ((t * 160 + i * 40) % 160)} q30 -40 0 -80 q-30 -40 0 -80`} stroke="#5fae3a" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.85} />
      ))}
    </svg>
  );
};

// Tampon rouge « DERNIER BROSSAGE : 2020 »
export const Stamp: React.FC<{t: number; top: string; big: string; x?: number; y?: number; rot?: number}> = ({t, top, big, x = 540, y = 470, rot = -10}) => {
  if (t < 0) return null;
  const s = interpolateStamp(t);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${s}) rotate(${rot}deg)`, border: `12px solid ${C.red}`, borderRadius: 26,
      background: 'rgba(255,244,224,0.92)', padding: '10px 36px', textAlign: 'center', boxShadow: `0 10px 0 ${INK}`}}>
      <div style={{fontFamily: 'Anton', fontSize: 52, color: C.red, letterSpacing: 2}}>{top}</div>
      <div style={{fontFamily: 'Anton', fontSize: 170, lineHeight: 0.95, color: C.red}}>{big}</div>
    </div>
  );
};
// tampon : arrive de très gros (3×) et s'écrase à 1 avec un léger rebond
const interpolateStamp = (t: number) => {
  const k = clamp01(t / 0.16);
  if (k < 1) return 3 - 2.08 * k * k;
  return 0.92 + 0.08 * ELASTIC(clamp01((t - 0.16) / 0.5));
};

// Panneau d'entrée de ville « HALEINE » (code postal)
export const BreathSign: React.FC<{t: number}> = ({t}) => {
  if (t < 0) return null;
  const s = BACK(clamp01(t / 0.35));
  const sway = Math.sin(t * 3) * 2;
  return (
    <div style={{position: 'absolute', left: 540, top: 1010, transform: `translate(-50%, -50%) scale(${s}) rotate(${4 + sway}deg)`, transformOrigin: '50% 100%'}}>
      <div style={{width: 760, background: '#fff', border: `14px solid ${C.red}`, outline: `8px solid ${INK}`, borderRadius: 30, padding: '18px 0', textAlign: 'center', boxShadow: `0 14px 0 ${INK}`}}>
        <div style={{fontFamily: 'Anton', fontSize: 150, lineHeight: 1, color: INK, letterSpacing: 4}}>HALEINE</div>
        <div style={{fontFamily: 'Anton', fontSize: 64, color: '#6fc24a', WebkitTextStroke: `3px ${INK}`}}>CODE POSTAL : 666 PU</div>
      </div>
      <div style={{position: 'absolute', left: 340, top: '100%', width: 80, height: 500, background: '#9aa', border: `8px solid ${INK}`}} />
    </div>
  );
};

// ============ Brosse à dents utilisée comme éponge à manette ============
export const BrushController: React.FC<{t: number; scrub: number}> = ({t, scrub}) => {
  const bx = Math.sin(t * 22) * 70 * scrub;
  return (
    <svg viewBox="-300 -220 600 440" width={600} height={440} style={{overflow: 'visible'}}>
      {/* manette */}
      <g>
        <path d="M-230 -40 Q-240 -110 -150 -110 H150 Q240 -110 230 -40 L250 90 Q260 160 190 150 Q140 140 110 70 H-110 Q-140 140 -190 150 Q-260 160 -250 90 Z" fill="#2a2433" {...o} />
        <circle cx={-120} cy={-30} r={34} fill="#3b3346" stroke={INK} strokeWidth={6} />
        {[[120, -60, C.red], [170, -20, C.cyan], [120, 20, C.gold], [70, -20, '#5BD17A']].map(([x, y, col], i) => <circle key={i} cx={x as number} cy={y as number} r={20} fill={col as string} stroke={INK} strokeWidth={5} />)}
        {/* crasse collante */}
        {[[-60, 20], [30, 50], [-180, 60], [200, 80]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={26} ry={14} fill="#7a5a2a" opacity={0.75} />)}
      </g>
      {/* brosse qui frotte */}
      <g transform={`translate(${bx} -140) rotate(-12)`}>
        <rect x={-200} y={-16} width={290} height={32} rx={14} fill={C.pink} stroke={INK} strokeWidth={7} />
        <rect x={84} y={-30} width={92} height={36} rx={6} fill="#fff" stroke={INK} strokeWidth={6} />
        {[96, 116, 136, 156].map((x) => <path key={x} d={`M${x} 6 l${-8 + (x % 3) * 8} 44`} stroke="#8be36a" strokeWidth={9} strokeLinecap="round" />)}
      </g>
      {/* bulles de crasse */}
      {scrub > 0.2 ? [0, 1, 2, 3, 4].map((i) => <circle key={i} cx={-120 + i * 70 + Math.sin(t * 9 + i) * 20} cy={-90 - ((t * 200 + i * 37) % 120)} r={12 + (i % 3) * 5} fill="#cfe8a0" stroke={INK} strokeWidth={3} opacity={0.85} />) : null}
    </svg>
  );
};

// ============ Dentifrice périmé (tube écrasé + date + poussière) ============
export const ToothpasteTube: React.FC<{t: number; squeeze: number; stampT: number}> = ({t, squeeze, stampT}) => {
  const sq = 1 - 0.28 * squeeze;
  return (
    <div style={{position: 'relative', width: 620, height: 420}}>
      <svg viewBox="-310 -210 620 420" width={620} height={420} style={{overflow: 'visible'}}>
        <g transform={`scale(1 ${sq})`}>
          <path d="M-260 -90 L150 -110 Q190 -110 190 -60 V60 Q190 110 150 110 L-260 90 Q-280 0 -260 -90 Z" fill="#f4f4f4" {...o} />
          <path d="M-240 -40 H160 V40 H-240 Z" fill={C.cyan} opacity={0.85} />
          <text x={-40} y={20} textAnchor="middle" fontFamily="Anton" fontSize={64} fill={INK}>BLANCHEUR+</text>
          <path d="M-262 -88 l-20 30 l20 30 l-20 30 l20 30 l-20 30" stroke={INK} strokeWidth={8} fill="none" />
          <rect x={190} y={-46} width={60} height={92} rx={10} fill="#fff" {...o} />
        </g>
        {/* poussière qui sort au lieu du dentifrice */}
        {squeeze > 0.1 ? Array.from({length: 12}).map((_, i) => {
          const k = clamp01(squeeze * 1.3 - i * 0.03);
          return <circle key={i} cx={260 + k * (80 + random(`dx${i}`) * 200)} cy={(random(`dy${i}`) - 0.5) * 160 * k - k * 60} r={(14 + random(`dr${i}`) * 26) * (0.3 + k)} fill="#bfb3a0" opacity={0.75 * (1 - k * 0.5)} />;
        }) : null}
        {squeeze > 0.1 ? <path d={`M250 0 q30 -${30 * squeeze} 60 0`} stroke="#7a6a50" strokeWidth={10} fill="none" strokeLinecap="round" /> : null}
      </svg>
      {stampT >= 0 ? (
        <div style={{position: 'absolute', left: 120, top: -40, transform: `scale(${interpolateStamp(stampT)}) rotate(-14deg)`, border: `10px solid ${C.red}`, borderRadius: 18,
          background: 'rgba(255,244,224,0.9)', padding: '4px 22px', fontFamily: 'Anton', fontSize: 74, color: C.red, whiteSpace: 'nowrap'}}>PÉRIMÉ 2021</div>
      ) : null}
    </div>
  );
};

// ============ Fissures du miroir (coordonnées écran du miroir de BathroomSet : 70,520 330×380) ============
export const MirrorCrack: React.FC<{t: number}> = ({t}) => {
  if (t < 0) return null;
  const k = EXPO(clamp01(t / 0.25));
  const cx = 235, cy = 690;
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
      <defs><clipPath id="mirr"><rect x={70} y={520} width={330} height={380} rx={20} /></clipPath></defs>
      <g clipPath="url(#mirr)">
        {Array.from({length: 11}).map((_, i) => {
          const a = (i / 11) * Math.PI * 2 + random(`ca${i}`) * 0.4;
          const L = (180 + random(`cl${i}`) * 160) * k;
          const mx = cx + Math.cos(a + 0.2) * L * 0.5, my = cy + Math.sin(a + 0.2) * L * 0.5;
          return <path key={i} d={`M${cx} ${cy} L${mx} ${my} L${cx + Math.cos(a) * L} ${cy + Math.sin(a) * L}`} stroke="#fff" strokeWidth={6} fill="none" />;
        })}
        {[40, 90].map((r) => <circle key={r} cx={cx} cy={cy} r={r * k} stroke="#fff" strokeWidth={4} fill="none" strokeDasharray="30 18" />)}
      </g>
      {/* éclats qui tombent */}
      {t > 0.05 ? Array.from({length: 8}).map((_, i) => {
        const d = t - 0.05;
        return <path key={i} d="M0 -14 L12 6 L-10 12 Z" fill="#cfe8ff" stroke={INK} strokeWidth={3}
          transform={`translate(${cx + (random(`fx${i}`) - 0.5) * 260 + d * (random(`fv${i}`) - 0.5) * 300} ${cy + 60 + d * d * 1600 + random(`fy${i}`) * 80}) rotate(${d * 500 * (i % 2 ? 1 : -1)})`} />;
      }) : null}
    </svg>
  );
};

// ============ Croquette assise avec masque à gaz ============
export const CroquetteGasMask: React.FC<{t: number; maskIn: number}> = ({t, maskIn}) => {
  const m = BACK(clamp01(maskIn / 0.35));
  return (
    <div style={{position: 'relative', width: 320, height: 330}}>
      <CroquetteClap t={t} clapping={false} />
      {maskIn >= 0 ? (
        <svg viewBox="-160 -230 320 330" width={320} height={330} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <g transform={`translate(0 ${-80 - (1 - m) * 220}) scale(${0.6 + 0.4 * m})`}>
            <path d="M-66 -20 Q0 -50 66 -20" stroke={INK} strokeWidth={10} fill="none" />
            <ellipse cx={0} cy={10} rx={62} ry={50} fill="#5f6b52" stroke={INK} strokeWidth={7} />
            <circle cx={-24} cy={-4} r={20} fill="#cfe8ff" stroke={INK} strokeWidth={6} /><circle cx={24} cy={-4} r={20} fill="#cfe8ff" stroke={INK} strokeWidth={6} />
            <path d="M-30 -8 l10 -6 M18 -8 l10 -6" stroke="#fff" strokeWidth={4} />
            <circle cx={0} cy={44} r={26} fill="#3b4434" stroke={INK} strokeWidth={6} />
            {[-12, 0, 12].map((x) => <circle key={x} cx={x} cy={44} r={4} fill={INK} />)}
          </g>
        </svg>
      ) : null}
    </div>
  );
};

// ============ Minuteur de brossage 3:00 → 0:00 ============
export const BrushTimer: React.FC<{t: number; dur: number}> = ({t, dur}) => {
  if (t < 0) return null;
  const s = BACK(clamp01(t / 0.3));
  const left = Math.max(0, 180 * (1 - t / dur));
  const mm = Math.floor(left / 60), ss = Math.floor(left % 60);
  const done = left <= 0;
  return (
    <div style={{position: 'absolute', right: 60, top: 420, transform: `scale(${s * (done ? 1 + 0.08 * Math.sin(t * 20) : 1)}) rotate(4deg)`, background: done ? C.gold : INK,
      border: `8px solid ${done ? INK : C.gold}`, borderRadius: 28, padding: '6px 30px', boxShadow: `0 10px 0 #000`}}>
      <div style={{fontFamily: 'Anton', fontSize: 34, color: done ? INK : C.gold, textAlign: 'center', letterSpacing: 2}}>BROSSAGE</div>
      <div style={{fontFamily: 'Anton', fontSize: 120, lineHeight: 1, color: done ? INK : C.cream, fontVariantNumeric: 'tabular-nums'}}>{mm}:{String(ss).padStart(2, '0')}</div>
    </div>
  );
};

// ============ « DING » : éclat sur les dents + flash ============
export const ToothGlint: React.FC<{t: number; x: number; y: number}> = ({t, x, y}) => {
  if (t < 0 || t > 1.3) return null;
  const s = ELASTIC(clamp01(t / 0.5)) * (1 - clamp01((t - 1.05) / 0.25)), rot = t * 90;
  const tx = Math.min(760, Math.max(320, x));
  const flash = Math.max(0, 1 - t / 0.25);
  return (
    <>
      <AbsoluteFill style={{background: '#fff', opacity: flash * 0.85, pointerEvents: 'none'}} />
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
          <path d="M0 -240 L26 -26 L240 0 L26 26 L0 240 L-26 26 L-240 0 L-26 -26 Z" fill="#fff" stroke={C.gold} strokeWidth={6} />
          <circle r={34} fill="#fff" />
        </g>
        {Array.from({length: 10}).map((_, i) => {
          const a = (i / 10) * Math.PI * 2, d = 120 + EXPO(clamp01(t / 0.6)) * 420;
          return <path key={i} transform={`translate(${x + Math.cos(a) * d} ${y + Math.sin(a) * d}) scale(${0.6 + 0.6 * Math.abs(Math.sin(t * 6 + i))})`}
            d="M0 -26 L7 -7 L26 0 L7 7 L0 26 L-7 7 L-26 0 L-7 -7 Z" fill={i % 2 ? '#fff' : C.gold} stroke={INK} strokeWidth={3} />;
        })}
      </svg>
      <div style={{position: 'absolute', left: tx, top: y - 470, transform: `translate(-50%, 0) scale(${s}) rotate(-8deg)`, whiteSpace: 'nowrap', fontFamily: 'Anton', fontSize: 200, color: C.gold,
        WebkitTextStroke: `12px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 12px 0 ${INK}`}}>DING !</div>
    </>
  );
};

// ============ Bzz (la mouche) met ses lunettes de soleil ============
export const BzzShades: React.FC<{t: number}> = ({t}) => {
  if (t < 0) return null;
  const inK = BACK(clamp01(t / 0.35));
  const g = EXPO(clamp01((t - 0.45) / 0.35));            // lunettes qui descendent
  const glint = clamp01((t - 0.85) / 0.2) * (1 - clamp01((t - 1.3) / 0.3));
  return (
    <div style={{position: 'absolute', left: 540, top: 820, transform: `translate(-50%, -50%) scale(${inK})`}}>
      <svg viewBox="-200 -200 400 400" width={620} height={620} style={{overflow: 'visible'}}>
        <circle r={190} fill={C.gold} opacity={0.25} />
        <g transform={`translate(0 ${Math.sin(t * 6) * 8})`}>
          <ellipse cx={-60} cy={-90} rx={70} ry={42 * (0.6 + 0.4 * Math.abs(Math.sin(t * 50)))} fill="#cfe8ff" stroke={INK} strokeWidth={6} opacity={0.95} />
          <ellipse cx={60} cy={-90} rx={70} ry={42 * (0.6 + 0.4 * Math.abs(Math.cos(t * 50)))} fill="#cfe8ff" stroke={INK} strokeWidth={6} opacity={0.95} />
          <ellipse rx={110} ry={86} fill={INK} />
          <circle cx={-38} cy={-14} r={30} fill="#fff" /><circle cx={38} cy={-14} r={30} fill="#fff" />
          <circle cx={-34} cy={-10} r={14} fill={INK} /><circle cx={42} cy={-10} r={14} fill={INK} />
          <path d="M-30 40 q30 20 60 0" stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" />
          {/* lunettes de soleil */}
          <g transform={`translate(0 ${-14 - (1 - g) * 260}) rotate(${(1 - g) * -25})`}>
            <path d="M-96 -6 H96" stroke={INK} strokeWidth={10} />
            <rect x={-92} y={-20} width={76} height={50} rx={14} fill="#111" stroke={INK} strokeWidth={6} />
            <rect x={16} y={-20} width={76} height={50} rx={14} fill="#111" stroke={INK} strokeWidth={6} />
            <path d="M-80 -8 l24 -6 M28 -8 l24 -6" stroke="#fff" strokeWidth={5} opacity={0.7} />
            {glint > 0 ? <path transform={`translate(56 -4) scale(${glint})`} d="M0 -40 L8 -8 L40 0 L8 8 L0 40 L-8 8 L-40 0 L-8 -8 Z" fill="#fff" /> : null}
          </g>
        </g>
      </svg>
    </div>
  );
};

// ============ Conversation : selfie envoyé à Inès → cœur → like de Maxence ============
export const SelfieChat: React.FC<{t: number; sendT: number; replyT: number; likeT: number}> = ({t, sendT, replyT, likeT}) => {
  const photo = sendT >= 0 ? BACK(clamp01(sendT / 0.4)) : 0;
  const typing = replyT < 0 && sendT > 0.6;
  const heart = replyT >= 0 ? ELASTIC(clamp01(replyT / 0.7)) : 0;
  const banner = likeT >= 0 ? EXPO(clamp01(likeT / 0.35)) : 0;
  return (
    <div style={{width: 760, height: 1380, background: '#141019', borderRadius: 90, border: `12px solid ${INK}`, padding: 22, boxShadow: `0 24px 0 ${INK}`, position: 'relative'}}>
      <div style={{width: '100%', height: '100%', background: '#f3f1f7', borderRadius: 66, overflow: 'hidden', position: 'relative', fontFamily: 'Inter'}}>
        <div style={{height: 210, background: '#fff', borderBottom: '2px solid #ddd', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 18}}>
          <div style={{width: 96, height: 96, borderRadius: 48, background: C.pink, color: '#fff', fontWeight: 800, fontSize: 52, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>I</div>
          <div style={{fontWeight: 800, fontSize: 38, color: '#111', marginTop: 8}}>Inès <span style={EMO}>💍</span></div>
        </div>
        <div style={{padding: '26px 34px', display: 'flex', flexDirection: 'column', gap: 16}}>
          <div style={{alignSelf: 'flex-start', background: '#e6e3ec', borderRadius: 30, padding: '14px 22px', fontSize: 30, fontWeight: 600, color: '#111', opacity: 0.7}}>Au fait… tu viens avec qui ? <span style={EMO}>👀</span></div>
          <div style={{alignSelf: 'center', color: '#888', fontSize: 26, fontWeight: 600}}>Aujourd'hui 20:14</div>
          {/* selfie */}
          {sendT >= 0 ? (
            <div style={{alignSelf: 'flex-end', width: 400, height: 470, borderRadius: 34, overflow: 'hidden', border: '6px solid #3d7bff', background: 'linear-gradient(#b6e6d4, #9fd8c4)',
              position: 'relative', transform: `scale(${photo})`, transformOrigin: '100% 100%'}}>
              <div style={{position: 'absolute', width: 560 * 1.15, height: 900 * 1.15, left: 200 - 280 * 1.15, top: 250 - 300 * 1.15}}>
                <Teddy t={t + 2} expression="wink" clean showCloud={false} showFly={false} shinyTeeth headTilt={-6} />
              </div>
              {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: 150 + i * 60, top: 300 + (i % 2) * 20, fontSize: 40, transform: `scale(${Math.abs(Math.sin(t * 5 + i))})`, ...EMO}}>✨</div>)}
            </div>
          ) : null}
          {sendT > 0.4 ? <div style={{alignSelf: 'flex-end', color: '#888', fontSize: 24, fontWeight: 800, marginTop: -6}}>Distribué</div> : null}
          {typing ? (
            <div style={{alignSelf: 'flex-start', background: '#e6e3ec', borderRadius: 30, padding: '20px 28px', display: 'flex', gap: 10}}>
              {[0, 1, 2].map((i) => <div key={i} style={{width: 18, height: 18, borderRadius: 9, background: '#888', transform: `translateY(${Math.sin(t * 10 - i) * 5}px)`}} />)}
            </div>
          ) : null}
          {replyT >= 0 ? <div style={{alignSelf: 'flex-start', fontSize: 190, lineHeight: 1, transform: `scale(${heart}) rotate(${(1 - heart) * -25}deg)`, transformOrigin: '0% 100%', ...EMO}}>❤️</div> : null}
        </div>
      </div>
      {/* notification Instagram-like : Maxence a aimé la photo */}
      {likeT >= 0 ? (
        <div style={{position: 'absolute', left: -40, right: -40, top: -150 + banner * 230, background: '#fff', borderRadius: 40, border: `8px solid ${INK}`, boxShadow: `0 14px 0 ${INK}`,
          display: 'flex', alignItems: 'center', gap: 22, padding: '20px 28px', transform: `rotate(${(1 - banner) * -4 + Math.sin(likeT * 30) * Math.max(0, 1 - likeT * 2) * 2}deg)`}}>
          <div style={{width: 92, height: 92, borderRadius: 46, background: 'linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 900, fontSize: 48, fontFamily: 'Inter', border: `5px solid ${INK}`}}>M</div>
          <div style={{flex: 1, fontFamily: 'Inter', fontSize: 34, fontWeight: 700, color: '#111', lineHeight: 1.2}}>
            <b>maxence.fit</b> a aimé votre photo
          </div>
          <div style={{fontSize: 70, ...EMO}}>❤️</div>
        </div>
      ) : null}
    </div>
  );
};

// ============ Lignes de vitesse (montage brossage) ============
export const SpeedLines: React.FC<{t: number; on: number}> = ({t, on}) => {
  if (on <= 0) return null;
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity: on}}>
      {Array.from({length: 26}).map((_, i) => {
        const a = (i / 26) * Math.PI * 2 + Math.floor(t * 12) * 0.13;
        const r0 = 520 + random(`sl${i}`) * 120;
        return <path key={i} d={`M${540 + Math.cos(a) * r0} ${900 + Math.sin(a) * r0 * 1.6} L${540 + Math.cos(a) * 1400} ${900 + Math.sin(a) * 2400}`} stroke="#fff" strokeWidth={6 + (i % 3) * 6} opacity={0.6} />;
      })}
    </svg>
  );
};
