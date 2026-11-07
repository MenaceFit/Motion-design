// Accessoires et écrans narratifs de l'épisode 1 (originaux) : saleté de la Grotte, sweat qui tient
// debout, mouches masquées, Croquette et sa valise, téléphone (SMS), story de Maxence, vocal de
// Mamie Jo, checklist, carte de vote.
import React from 'react';
import {AbsoluteFill, interpolate, random} from 'remotion';
import gsap from 'gsap';
import {INK, C, clamp01} from './Sets';
import {Teddy} from './Teddy';
import '@fontsource/inter/600.css';
import '@fontsource/inter/800.css';

const BACK = gsap.parseEase('back.out(2)');
const EXPO = gsap.parseEase('expo.out');
const ELASTIC = gsap.parseEase('elastic.out(1, 0.45)');
const IN = gsap.parseEase('power2.in');
const o = {stroke: INK, strokeWidth: 7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

// ============ Saleté de la Grotte (couche par-dessus le décor, sous le personnage) ============
export const GrotteDirt: React.FC<{t: number}> = ({t}) => (
  <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position: 'absolute'}}>
    {/* moisissures + taches au mur */}
    {[[60, 820, 70], [990, 760, 55], [470, 250, 45], [1010, 1180, 80], [40, 1080, 50]].map(([x, y, r], i) => (
      <g key={i} opacity={0.75}>
        <circle cx={x} cy={y} r={r} fill="#5c7a2e" />
        <circle cx={x + r * 0.5} cy={y - r * 0.4} r={r * 0.55} fill="#7a9a3a" />
        <circle cx={x - r * 0.4} cy={y + r * 0.3} r={r * 0.4} fill="#4a6324" />
        {[0, 1, 2, 3].map((k) => <circle key={k} cx={x + Math.cos(k * 1.7 + i) * r * 1.2} cy={y + Math.sin(k * 1.7 + i) * r * 1.1} r={6} fill="#6f8e34" />)}
      </g>
    ))}
    <path d="M300 640 q30 60 10 120 q-20 40 10 90" stroke="#4a3a1a" strokeWidth={14} opacity={0.5} fill="none" />
    <ellipse cx={720} cy={720} rx={60} ry={34} fill="#7a4a1a" opacity={0.45} />
    {/* toile d'araignée (coin haut droit) */}
    <g stroke="#e8e0f5" strokeWidth={3} opacity={0.6} fill="none">
      <path d="M1080 280 L900 280 M1080 280 L940 380 M1080 280 L1000 440" />
      <path d="M1040 280 q-10 30 20 40 M990 280 q-10 60 40 80 M940 280 q-6 90 70 130" />
    </g>
    {/* chaussette suspendue au néon */}
    <g transform={`rotate(${Math.sin(t * 2) * 8} 640 330)`}>
      <path d="M640 330 v40 q0 30 -30 34 q-26 4 -30 -20 q0 -14 20 -16 l14 0 v-38" fill="#FF7BB0" {...o} strokeWidth={6} />
    </g>
    {/* montagne de linge (gauche) */}
    <g transform="translate(-20 1430)">
      <path d="M0 160 Q40 40 120 70 Q170 10 230 60 Q300 40 320 120 L330 170 L0 170 Z" fill="#6a5a8a" {...o} />
      <path d="M40 130 q40 -40 90 -10" stroke="#E3A82B" strokeWidth={22} fill="none" />
      <path d="M150 100 q50 -30 110 10" stroke="#3FE0FF" strokeWidth={20} fill="none" />
      <path d="M90 60 q20 -30 60 -14" stroke={C.red} strokeWidth={18} fill="none" />
    </g>
    {/* poubelle qui déborde */}
    <g transform="translate(860 1440)">
      <path d="M0 0 L140 0 L125 170 L15 170 Z" fill="#3b3f52" {...o} />
      <circle cx={30} cy={-10} r={28} fill="#8d8aa0" {...o} /><circle cx={90} cy={-26} r={34} fill="#5BD17A" {...o} />
      <rect x={40} y={-70} width={50} height={40} rx={6} fill="#FFC23D" {...o} transform="rotate(-20 65 -50)" />
      <path d="M-30 168 q40 -20 70 6" stroke="#8d8aa0" strokeWidth={14} fill="none" />
    </g>
    {/* pots de nouilles + canettes + miettes */}
    {[[560, 1760, -10], [610, 1790, 20], [300, 1840, 70]].map(([x, y, r], i) => (
      <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
        <path d="M-28 -40 L28 -40 L20 20 L-20 20 Z" fill="#fff4e0" {...o} strokeWidth={6} />
        <rect x={-28} y={-30} width={56} height={14} fill={C.red} />
      </g>
    ))}
    {Array.from({length: 40}).map((_, i) => (
      <circle key={i} cx={random(`m${i}`) * 1080} cy={1530 + random(`n${i}`) * 380} r={3 + random(`o${i}`) * 4} fill={i % 3 ? '#c99a4a' : '#e2c27a'} />
    ))}
    {/* taches au sol */}
    <ellipse cx={420} cy={1600} rx={90} ry={22} fill="#6b3a1f" opacity={0.5} />
    <ellipse cx={780} cy={1870} rx={120} ry={26} fill="#3a5a1f" opacity={0.45} />
    {/* la souris qui grignote une part de pizza */}
    <g transform="translate(980 1830)">
      <path d="M-40 0 L20 -10 L0 30 Z" fill="#e9c38a" {...o} strokeWidth={5} />
      <circle cx={-14} cy={6} r={6} fill="#d9542b" />
      <g transform={`translate(40 ${Math.abs(Math.sin(t * 9)) * -4})`}>
        <ellipse cx={0} cy={0} rx={30} ry={20} fill="#9a95ad" {...o} strokeWidth={5} />
        <circle cx={-24} cy={-14} r={11} fill="#9a95ad" {...o} strokeWidth={5} />
        <circle cx={-28} cy={-2} r={3} fill={INK} />
        <path d="M28 6 q30 10 40 -10" stroke={INK} strokeWidth={4} fill="none" />
      </g>
    </g>
    {/* brume d'odeur verdâtre au ras du sol */}
    <rect y={1380} width={1080} height={540} fill="url(#stink)" opacity={0.55 + 0.1 * Math.sin(t * 1.5)} />
    <defs><linearGradient id="stink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7cff6a" stopOpacity="0" /><stop offset="1" stopColor="#7cff6a" stopOpacity="0.22" /></linearGradient></defs>
  </svg>
);

// ============ Tour de boîtes à pizza (renversée quand Teddy trébuche) ============
export const PizzaTower: React.FC<{x: number; y: number; knock: number}> = ({x, y, knock}) => (
  <div style={{position: 'absolute', left: x, top: y}}>
    {Array.from({length: 7}).map((_, i) => {
      const k = clamp01(knock * 1.2 - i * 0.04);
      const dx = k * (80 + i * 55) * (i % 2 ? 1 : 0.7), dy = k * (i * 26), rot = k * (i % 2 ? 1 : -1) * (40 + i * 18);
      return (
        <div key={i} style={{position: 'absolute', left: dx + (i % 2) * 8, top: -i * 46 + dy, width: 230, height: 46, background: '#e9c38a',
          border: `6px solid ${INK}`, borderRadius: 6, transform: `rotate(${rot + (i % 3 - 1) * 2}deg)`}}>
          <div style={{position: 'absolute', left: 80, top: 6, width: 60, height: 20, borderRadius: 10, background: '#d9542b', opacity: 0.7}} />
        </div>
      );
    })}
  </div>
);

// ============ Le sweat de rechange qui tient debout tout seul ============
export const SpareHoodie: React.FC<{t: number}> = ({t}) => {
  const up = ELASTIC(clamp01(t / 0.9));
  const wob = Math.sin(t * 7) * 4 * clamp01(t);
  return (
    <svg viewBox="0 0 300 330" width={300} height={330} style={{overflow: 'visible'}}>
      <g transform={`translate(150 320) rotate(${wob}) scale(1 ${0.25 + 0.75 * up}) translate(-150 -320)`}>
        <path d="M60 80 Q150 30 240 80 L262 240 Q268 315 150 318 Q32 315 38 240 Z" fill="#c7902a" {...o} />
        <path d="M62 84 Q20 140 26 250 L58 252 Q58 170 80 128 Z" fill="#c7902a" {...o} />
        <path d="M238 84 Q280 140 274 250 L242 252 Q242 170 220 128 Z" fill="#c7902a" {...o} />
        <path d="M110 70 Q150 110 190 70" fill="#9a6c1c" {...o} />
        {[[110, 180], [190, 220], [150, 270], [90, 250]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={18} ry={12} fill="#6b4a12" opacity={0.7} />)}
      </g>
      {/* lignes d'odeur */}
      {t > 0.4 ? [0, 1, 2].map((i) => (
        <path key={i} d={`M${100 + i * 50} ${40 - ((t * 60 + i * 20) % 50)} q15 -20 0 -40 q-15 -20 0 -40`} stroke="#8be36a" strokeWidth={8} fill="none" opacity={0.8} />
      )) : null}
    </svg>
  );
};

// ============ Mouche masquée ============
export const MaskedFly: React.FC<{x: number; y: number; t: number; s?: number}> = ({x, y, t, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse rx={22} ry={16} fill={INK} />
    <ellipse cx={-10} cy={-22} rx={16} ry={11 * (0.5 + 0.5 * Math.abs(Math.sin(t * 50)))} fill="#cfe8ff" opacity={0.9} stroke={INK} strokeWidth={2} />
    <ellipse cx={12} cy={-22} rx={16} ry={11 * (0.5 + 0.5 * Math.abs(Math.cos(t * 50)))} fill="#cfe8ff" opacity={0.9} stroke={INK} strokeWidth={2} />
    <circle cx={-12} cy={-4} r={6} fill="#fff" /><circle cx={-12} cy={-4} r={3} fill={INK} />
    <circle cx={4} cy={-4} r={6} fill="#fff" /><circle cx={4} cy={-4} r={3} fill={INK} />
    {/* masque chirurgical */}
    <rect x={-20} y={2} width={30} height={14} rx={4} fill="#8fd3ff" stroke={INK} strokeWidth={2.5} />
    <path d="M-20 6 l-8 -6 M10 6 l8 -6" stroke="#fff" strokeWidth={2} />
  </g>
);

// ============ Croquette (chat roux blasé) + sa valise ============
export const Croquette: React.FC<{t: number; walking: boolean; facing?: 1 | -1}> = ({t, walking, facing = -1}) => {
  const step = walking ? Math.sin(t * 14) : 0;
  return (
    <svg viewBox="-160 -170 320 260" width={320} height={260} style={{overflow: 'visible', transform: `scaleX(${facing === -1 ? 1 : -1})`}}>
      {/* valise */}
      <g transform={`translate(-120 ${-20 + Math.abs(step) * 4})`}>
        <rect x={-50} y={-30} width={100} height={76} rx={10} fill="#9a5d34" {...o} />
        <path d="M-18 -30 v-16 h36 v16" fill="none" stroke={INK} strokeWidth={7} />
        <rect x={-50} y={0} width={100} height={8} fill="#FFC23D" />
        <circle cx={-30} cy={50} r={8} fill={INK} /><circle cx={30} cy={50} r={8} fill={INK} />
      </g>
      <path d="M-70 -10 L-110 -30" stroke={INK} strokeWidth={6} />
      {/* corps */}
      <ellipse cx={20} cy={10} rx={100} ry={56} fill="#f08a2c" {...o} />
      {[[-20, -30], [20, -36], [60, -28]].map(([x, y], i) => <path key={i} d={`M${x} ${y} q10 20 0 34`} stroke="#c0601a" strokeWidth={9} fill="none" />)}
      {/* pattes */}
      {[-40, -10, 50, 80].map((x, i) => <rect key={i} x={x} y={46 + (i % 2 ? step : -step) * 6} width={22} height={38} rx={10} fill="#f08a2c" {...o} strokeWidth={6} />)}
      {/* queue */}
      <path d={`M115 0 q60 ${-40 + step * 10} 30 -100`} stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" />
      <path d={`M115 0 q60 ${-40 + step * 10} 30 -100`} stroke="#f08a2c" strokeWidth={12} fill="none" strokeLinecap="round" />
      {/* tête */}
      <g transform="translate(-85 -40)">
        <path d="M-50 -30 L-40 -90 L-10 -50 Z M50 -30 L40 -90 L10 -50 Z" fill="#f08a2c" {...o} />
        <circle r={62} fill="#f08a2c" {...o} />
        {/* yeux blasés */}
        <ellipse cx={-22} cy={-6} rx={14} ry={10} fill="#fff" stroke={INK} strokeWidth={4} /><ellipse cx={22} cy={-6} rx={14} ry={10} fill="#fff" stroke={INK} strokeWidth={4} />
        <rect x={-38} y={-18} width={32} height={10} fill="#f08a2c" /><rect x={6} y={-18} width={32} height={10} fill="#f08a2c" />
        <circle cx={-22} cy={-1} r={4} fill={INK} /><circle cx={22} cy={-1} r={4} fill={INK} />
        <path d="M-8 18 h16 l-8 8 z" fill="#ff7bb0" stroke={INK} strokeWidth={3} />
        <path d="M-14 32 q14 -8 28 0" stroke={INK} strokeWidth={4} fill="none" />
        {/* pince à linge sur le nez (l'odeur) */}
        <rect x={-8} y={6} width={16} height={22} rx={4} fill="#3FE0FF" stroke={INK} strokeWidth={3} />
      </g>
    </svg>
  );
};

// ============ Téléphone : conversation avec Inès ============
const TYPED_DEFAULT = ['oui avec ma copine', 'jsp peut-être', 'carrément 😏🔥'];
const E = (txt: string) => txt.split(/(\p{Extended_Pictographic}\uFE0F?)/u).map((p, i) => /\p{Extended_Pictographic}/u.test(p) ? <span key={i} style={{fontFamily: 'Noto Color Emoji'}}>{p}</span> : p);
export const Phone: React.FC<{t: number; typeT: number; sendT: number; seenT: number; inesText?: string; history?: {me: boolean; text: string}[]; typed?: string[]; sendEmoji?: string; time?: string}> = ({t, typeT, sendT, seenT, inesText = 'Coucou Teddy !! Trop hâte que tu sois là 🥰 Tu viens accompagné ? 😇', history = [], typed = TYPED_DEFAULT, sendEmoji = '👍', time = "Aujourd'hui 23:47"}) => {
  const TYPED = typed;
  // saisie : 3 tentatives tapées puis effacées (chaque cycle 1,2 s : tape 0,6 s, attend, efface 0,3 s)
  let draft = '';
  if (typeT > 0 && sendT < 0) {
    const cyc = Math.floor(typeT / 1.2), k = typeT % 1.2;
    if (cyc < TYPED.length) {
      const s = [...TYPED[cyc]];
      const n = k < 0.6 ? Math.floor((k / 0.6) * s.length) : k < 0.85 ? s.length : Math.max(0, Math.floor(s.length * (1 - (k - 0.85) / 0.3)));
      draft = s.slice(0, n).join('');
    }
  }
  const inesIn = BACK(clamp01((t - 0.35) / 0.3));
  const sent = sendT > 0;
  const thumbS = sent ? ELASTIC(clamp01(sendT / 0.6)) : 0;
  const dots = seenT > 0.3 && seenT < 1.3;
  return (
    <div style={{width: 760, height: 1380, background: '#141019', borderRadius: 90, border: `12px solid ${INK}`, padding: 22, boxShadow: `0 24px 0 ${INK}`}}>
      <div style={{width: '100%', height: '100%', background: '#f3f1f7', borderRadius: 66, overflow: 'hidden', position: 'relative', fontFamily: 'Inter'}}>
        <div style={{height: 210, background: '#fff', borderBottom: '2px solid #ddd', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 18}}>
          <div style={{width: 96, height: 96, borderRadius: 48, background: C.pink, color: '#fff', fontWeight: 800, fontSize: 52, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>I</div>
          <div style={{fontWeight: 800, fontSize: 38, color: '#111', marginTop: 8}}>Inès <span style={{fontFamily: 'Noto Color Emoji'}}>💍</span></div>
        </div>
        <div style={{padding: '30px 34px', display: 'flex', flexDirection: 'column', gap: 18}}>
          {history.map((h, i) => (
            <div key={i} style={{alignSelf: h.me ? 'flex-end' : 'flex-start', maxWidth: '78%', background: h.me ? '#3d7bff' : '#e6e3ec', color: h.me ? '#fff' : '#111',
              borderRadius: 30, padding: '16px 24px', fontSize: h.text.length <= 2 ? 64 : 32, fontWeight: 600, opacity: 0.75}}>{E(h.text)}</div>
          ))}
          <div style={{alignSelf: 'center', color: '#888', fontSize: 26, fontWeight: 600}}>{time}</div>
          <div style={{alignSelf: 'flex-start', maxWidth: '80%', background: '#e6e3ec', borderRadius: 34, padding: '22px 28px', fontSize: 38, fontWeight: 600, color: '#111',
            transform: `scale(${inesIn})`, transformOrigin: '0% 100%'}}>
            {E(inesText)}
          </div>
          {sent ? (
            <div style={{alignSelf: 'flex-end', fontSize: 150, lineHeight: 1, transform: `scale(${thumbS}) rotate(${(1 - thumbS) * 30}deg)`, transformOrigin: '100% 100%', fontFamily: 'Noto Color Emoji'}}>{sendEmoji}</div>
          ) : null}
          {seenT > 0 ? <div style={{alignSelf: 'flex-end', color: '#888', fontSize: 26, fontWeight: 800}}>Vu ✓✓</div> : null}
          {dots ? (
            <div style={{alignSelf: 'flex-start', background: '#e6e3ec', borderRadius: 30, padding: '20px 28px', display: 'flex', gap: 10}}>
              {[0, 1, 2].map((i) => <div key={i} style={{width: 18, height: 18, borderRadius: 9, background: '#888', transform: `translateY(${Math.sin(t * 10 - i) * 5}px)`}} />)}
            </div>
          ) : null}
        </div>
        {/* zone de saisie */}
        <div style={{position: 'absolute', bottom: 40, left: 30, right: 30, height: 96, background: '#fff', borderRadius: 48, border: '3px solid #ccc', display: 'flex', alignItems: 'center', padding: '0 34px',
          fontSize: 36, fontWeight: 600, color: draft ? '#111' : '#aaa'}}>
          {draft ? <span>{draft.split(/(😏|🔥)/).map((p, i) => /😏|🔥/.test(p) ? <span key={i} style={{fontFamily: 'Noto Color Emoji'}}>{p}</span> : p)}<span style={{opacity: Math.sin(t * 12) > 0 ? 1 : 0}}>|</span></span> : 'Message'}
        </div>
      </div>
    </div>
  );
};

// ============ Story de Maxence (le rival trop parfait) ============
export const MaxenceStory: React.FC<{t: number}> = ({t}) => {
  const seg = t < 2.4 ? 0 : 1;
  const prog = (k: number) => (k < seg ? 100 : k === seg ? clamp01((t - seg * 2.4) / 2.4) * 100 : 0);
  const run = t * 14;
  const ting = (t % 1.6) < 0.25;
  return (
    <AbsoluteFill style={{background: seg === 0 ? 'linear-gradient(#ff9a5a, #ffd27a 55%, #8fd3ff)' : 'linear-gradient(#ffe7b8, #fff4e0)'}}>
      {/* barres de progression de story */}
      <div style={{position: 'absolute', top: 300, left: 40, right: 40, display: 'flex', gap: 12}}>
        {[0, 1].map((k) => <div key={k} style={{flex: 1, height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.45)'}}><div style={{width: `${prog(k)}%`, height: '100%', background: '#fff', borderRadius: 5}} /></div>)}
      </div>
      <div style={{position: 'absolute', top: 334, left: 40, display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'Inter', fontWeight: 800, fontSize: 36, color: '#fff', textShadow: '0 2px 6px rgba(0,0,0,0.4)'}}>
        <div style={{width: 72, height: 72, borderRadius: 36, background: '#c58a5a', border: '5px solid #fff'}} /> maxence.fit <span style={{color: '#3FE0FF'}}>✓</span> <span style={{opacity: 0.8, fontWeight: 600}}>6:02</span>
      </div>
      {seg === 0 ? (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 1350, height: 570, background: '#5a8a4a'}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 1320, height: 60, background: '#c9a57a'}} />
          <div style={{position: 'absolute', left: 120 + (t * 90) % 60, top: 1260, width: 120, height: 8, background: '#fff', opacity: 0.6}} />
        </>
      ) : null}
      {/* Maxence : grand, bronzé, bandeau, sourire qui fait « ting » */}
      <svg viewBox="0 0 400 800" width={560} height={1120} style={{position: 'absolute', left: 260, top: 420}}>
        <g transform={`translate(0 ${seg === 0 ? Math.abs(Math.sin(run)) * -18 : 0})`}>
          <rect x={150} y={420} width={44} height={250} rx={20} fill="#2b2b3a" {...o} transform={`rotate(${seg === 0 ? Math.sin(run) * 22 : 0} 172 430)`} />
          <rect x={206} y={420} width={44} height={250} rx={20} fill="#2b2b3a" {...o} transform={`rotate(${seg === 0 ? -Math.sin(run) * 22 : 0} 228 430)`} />
          <path d="M120 230 Q200 200 280 230 L292 440 L108 440 Z" fill={seg === 0 ? '#3FE0FF' : '#fff'} {...o} />
          <rect x={92} y={240} width={40} height={180} rx={20} fill="#c58a5a" {...o} transform={`rotate(${seg === 0 ? -Math.sin(run) * 35 : 20} 112 250)`} />
          <rect x={268} y={240} width={40} height={180} rx={20} fill="#c58a5a" {...o} transform={`rotate(${seg === 0 ? Math.sin(run) * 35 : -30} 288 250)`} />
          <rect x={180} y={190} width={40} height={50} fill="#c58a5a" />
          <ellipse cx={200} cy={130} rx={78} ry={92} fill="#c58a5a" {...o} />
          <path d="M126 100 Q200 20 274 100 Q260 70 200 62 Q140 70 126 100 Z" fill="#e8c35a" {...o} />
          <rect x={124} y={88} width={152} height={18} fill={C.red} stroke={INK} strokeWidth={5} />
          <circle cx={172} cy={130} r={8} fill={INK} /><circle cx={228} cy={130} r={8} fill={INK} />
          <path d="M160 168 q40 36 80 0 z" fill="#fff" {...o} strokeWidth={5} />
          {ting ? <g fill="#fff" stroke={INK} strokeWidth={3}><path d="M250 150 l10 -24 l6 24 l24 6 l-24 6 l-6 24 l-10 -24 l-24 -6z" /></g> : null}
          {/* montre « ROLEKS » (easter egg) */}
          <rect x={86} y={392} width={46} height={26} rx={6} fill="#FFC23D" stroke={INK} strokeWidth={4} transform={`rotate(${seg === 0 ? -Math.sin(run) * 35 : 20} 112 250)`} />
          {seg === 1 ? (
            <g transform="translate(270 300)">
              <rect x={-10} y={-20} width={180} height={70} rx={34} fill="#d99a4a" {...o} />
              {[20, 60, 100, 140].map((x) => <path key={x} d={`M${x} -10 l20 40`} stroke="#a66a2a" strokeWidth={6} />)}
            </g>
          ) : null}
        </g>
      </svg>
      {/* sticker */}
      <div style={{position: 'absolute', top: 520, left: 70, transform: 'rotate(-8deg)', background: '#fff', borderRadius: 22, padding: '12px 26px', fontFamily: 'Anton', fontSize: 64, color: INK, border: `6px solid ${INK}`}}>
        {seg === 0 ? '10 KM · 6H00' : 'PAIN MAISON'}
      </div>
    </AbsoluteFill>
  );
};

// ============ Vocal de Mamie Jo ============
export const MamieJoNote: React.FC<{t: number; talking: boolean}> = ({t, talking}) => {
  const s = BACK(clamp01(t / 0.35));
  const punch = talking ? Math.max(0, Math.sin(t * 9)) : 0;
  return (
    <div style={{transform: `scale(${s})`, transformOrigin: '50% 0%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <svg viewBox="-150 -150 300 300" width={300} height={300}>
        <circle r={140} fill={C.violet} stroke={INK} strokeWidth={10} />
        <circle cy={20} r={80} fill="#f2c09a" stroke={INK} strokeWidth={7} />
        <circle cx={0} cy={-70} r={34} fill="#ddd" stroke={INK} strokeWidth={6} />
        <path d="M-80 -10 Q-80 -80 0 -80 Q80 -80 80 -10 Q60 -50 0 -50 Q-60 -50 -80 -10 Z" fill="#e6e6e6" stroke={INK} strokeWidth={6} />
        <rect x={-62} y={-44} width={124} height={22} rx={8} fill="#1B1030" opacity={0.85} />
        <circle cx={-26} cy={10} r={7} fill={INK} /><circle cx={26} cy={10} r={7} fill={INK} />
        <path d={`M-24 50 q24 ${talking ? 10 + punch * 14 : 8} 48 0`} stroke={INK} strokeWidth={6} fill={talking ? '#5a1f2a' : 'none'} />
        <circle cx={-95 + punch * 30} cy={80 - punch * 30} r={36} fill={C.red} stroke={INK} strokeWidth={7} />
        <circle cx={95} cy={80} r={36} fill={C.red} stroke={INK} strokeWidth={7} />
      </svg>
      <div style={{marginTop: -10, background: '#fff', border: `7px solid ${INK}`, borderRadius: 50, padding: '18px 28px', display: 'flex', alignItems: 'center', gap: 20, boxShadow: `0 8px 0 ${INK}`}}>
        <div style={{width: 64, height: 64, borderRadius: 32, background: C.violet, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 36}}>▶</div>
        <div style={{display: 'flex', gap: 6, alignItems: 'center', height: 70}}>
          {Array.from({length: 26}).map((_, i) => {
            const h = 12 + (talking ? Math.abs(Math.sin(t * 11 + i * 0.9)) * 50 : 8) * (0.4 + random(`w${i}`) * 0.6);
            return <div key={i} style={{width: 9, height: h, borderRadius: 5, background: C.violet}} />;
          })}
        </div>
        <div style={{fontFamily: 'Inter', fontWeight: 800, fontSize: 30, color: '#555'}}>0:{String(Math.min(9, Math.floor(t))).padStart(2, '0')}</div>
      </div>
      <div style={{marginTop: 14, fontFamily: 'Anton', fontSize: 52, color: C.cream, WebkitTextStroke: `6px ${INK}`, paintOrder: 'stroke fill'}}>MAMIE JO <span style={{fontFamily: 'Noto Color Emoji'}}>🥊</span></div>
    </div>
  );
};

// ============ Checklist interminable ============
const TASKS = ['Se laver', 'Laver le sweat', 'Laver le 2e sweat', 'Ouvrir la fenêtre', 'Sortir les poubelles', 'Les AUTRES poubelles', 'Se brosser les dents',
  'Changer les draps', 'Rendre la valise du chat', 'Vider le frigo', 'Parler à un humain', 'Coiffeur', 'Lunettes', 'Sport', 'Manger un légume', 'Dormir avant 4h',
  'Répondre à Inès', 'Retrouver sa dignité', 'Ranger la Grotte', 'Laver les chaussettes', 'Trouver la 2e chaussette', 'Acheter un miroir', 'Arrêter les chips', '…'];
export const Checklist: React.FC<{t: number}> = ({t}) => {
  const s = BACK(clamp01(t / 0.3));
  const scroll = IN(clamp01(t / 2.2)) * 1500;
  return (
    <div style={{width: 640, height: 900, background: C.cream, border: `9px solid ${INK}`, borderRadius: 30, boxShadow: `0 12px 0 ${INK}`, overflow: 'hidden', transform: `scale(${s}) rotate(-3deg)`}}>
      <div style={{background: C.gold, borderBottom: `7px solid ${INK}`, padding: '18px 0', textAlign: 'center', fontFamily: 'Anton', fontSize: 64, color: INK}}>CHECKLIST GLOW-UP</div>
      <div style={{transform: `translateY(${-scroll}px)`, padding: '10px 30px'}}>
        {[...TASKS, ...TASKS].map((x, i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, fontFamily: 'Inter', fontWeight: 800, fontSize: 36, color: INK, padding: '10px 0', borderBottom: '3px dashed #c9b9a0'}}>
            <div style={{width: 40, height: 40, border: `5px solid ${INK}`, borderRadius: 8, flexShrink: 0}} />{x}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ Carte de vote : DOUCHE vs CHAMBRE ============
export type VoteSide = {label: string; sub: string; kind: 'shower' | 'room' | 'teeth' | 'sheets' | 'hair' | 'gym'};
export const VoteCard: React.FC<{t: number; left?: VoteSide; right?: VoteSide}> = ({t, left = {label: 'DOUCHE', sub: '1RE VRAIE DOUCHE DEPUIS MARDI', kind: 'shower'}, right = {label: 'CHAMBRE', sub: 'RANGER LA GROTTE', kind: 'room'}}) => {
  const inL = EXPO(clamp01(t / 0.35)), inR = EXPO(clamp01((t - 0.12) / 0.35));
  const vs = ELASTIC(clamp01((t - 0.3) / 0.8));
  const title = BACK(clamp01((t - 0.15) / 0.35));
  const pulse = 1 + 0.04 * Math.sin(t * 8);
  const side = (label: string, sub: string, bg: string, slide: number, child: React.ReactNode, dir: number) => (
    <div style={{position: 'absolute', top: 0, bottom: 0, width: '50%', [dir < 0 ? 'left' : 'right']: 0, background: bg,
      transform: `translateX(${(1 - slide) * dir * 600}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 560}}>
      <div style={{fontFamily: 'Anton', fontSize: 120, color: C.cream, WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 8px 0 ${INK}`, transform: `scale(${pulse})`}}>{label}</div>
      <div style={{fontFamily: 'Anton', fontSize: 40, color: INK, background: C.cream, border: `5px solid ${INK}`, borderRadius: 14, padding: '4px 14px', marginTop: 6, textAlign: 'center', maxWidth: 440}}>{sub}</div>
      <div style={{width: 470, height: 760, marginTop: 30}}>{child}</div>
    </div>
  );
  return (
    <AbsoluteFill>
      {side(left.label, left.sub, `linear-gradient(${C.violet}, #4a2a9a)`, inL, <VoteAccessory kind={left.kind} t={t} />, -1)}
      {side(right.label, right.sub, `linear-gradient(${C.orange}, #b8520a)`, inR, <VoteAccessory kind={right.kind} t={t} />, 1)}
      {/* bandeau titre + VS */}
      <div style={{position: 'absolute', top: 330, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${title})`}}>
        <div style={{background: INK, border: `6px solid ${C.gold}`, borderRadius: 60, padding: '12px 46px', fontFamily: 'Anton', fontSize: 72, color: C.gold}}>COMMENTE UN MOT</div>
      </div>
      <div style={{position: 'absolute', top: 1010, left: 540 - 95, width: 190, height: 190, borderRadius: 95, background: C.cream, border: `10px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Anton', fontSize: 100, color: INK, transform: `scale(${vs}) rotate(${(1 - vs) * 180}deg)`, boxShadow: `0 10px 0 ${INK}`}}>VS</div>
    </AbsoluteFill>
  );
};

// Teddy + accessoire illustrant chaque option de vote
export const VoteAccessory: React.FC<{kind: VoteSide['kind']; t: number}> = ({kind, t}) => (
  <div style={{position: 'relative', width: '100%', height: '100%'}}>
    <Teddy t={t + (kind === 'shower' || kind === 'teeth' || kind === 'hair' ? 3 : 5)}
      expression={kind === 'shower' || kind === 'hair' ? 'shock' : kind === 'teeth' ? 'happy' : 'panic'}
      armL={kind === 'shower' ? -30 : kind === 'teeth' ? -60 : 0} armR={kind === 'room' ? -40 : kind === 'sheets' ? -50 : kind === 'gym' ? -150 : 0}
      showCloud={kind === 'room' || kind === 'sheets'} showFly={kind !== 'shower'} shinyTeeth={kind === 'hair' || kind === 'gym'} />
    <svg viewBox="0 0 560 900" style={{position: 'absolute', inset: 0}} width="100%" height="100%">
      {kind === 'shower' ? (
        <>
          <path d="M150 190 Q280 60 410 190 Q280 160 150 190 Z" fill="#8fd3ff" stroke={INK} strokeWidth={8} />
          {[200, 260, 320, 370].map((x) => <circle key={x} cx={x} cy={150} r={10} fill="#fff" opacity={0.8} />)}
          <g transform={`translate(330 ${590 + Math.sin(t * 5) * 6})`}><ellipse cx={0} cy={0} rx={50} ry={34} fill="#FFC23D" stroke={INK} strokeWidth={6} /><circle cx={-30} cy={-34} r={24} fill="#FFC23D" stroke={INK} strokeWidth={6} /><path d="M-56 -34 l-20 6 l20 6z" fill={C.orange} stroke={INK} strokeWidth={4} /><circle cx={-34} cy={-40} r={4} fill={INK} /></g>
        </>
      ) : null}
      {kind === 'room' ? (
        <>
          <g transform="translate(110 520) rotate(-10)"><path d="M0 0 Q-40 80 0 150 L120 150 Q160 80 120 0 Z" fill="#2a2433" stroke={INK} strokeWidth={7} /><path d="M40 -10 l20 -30 l20 30" stroke={INK} strokeWidth={6} fill="none" /></g>
          <g transform="translate(470 300) rotate(18)"><rect x={-8} y={0} width={16} height={430} fill="#c08a52" stroke={INK} strokeWidth={5} /><path d="M-50 430 h100 l20 80 h-140z" fill="#FFC23D" stroke={INK} strokeWidth={6} /></g>
        </>
      ) : null}
      {kind === 'teeth' ? (
        <g transform={`translate(330 330) rotate(${-30 + Math.sin(t * 9) * 12})`}>
          <rect x={-14} y={0} width={28} height={300} rx={12} fill="#3FE0FF" stroke={INK} strokeWidth={6} />
          <rect x={-26} y={-60} width={52} height={70} rx={10} fill="#fff" stroke={INK} strokeWidth={6} />
          {[-14, 0, 14].map((x) => <path key={x} d={`M${x} -60 v-30`} stroke="#fff" strokeWidth={10} />)}
          {[0, 1, 2, 3].map((i) => <circle key={i} cx={-60 + i * 40} cy={-110 - ((t * 120 + i * 30) % 60)} r={12} fill="#fff" stroke="#cfe8ff" strokeWidth={3} />)}
        </g>
      ) : null}
      {kind === 'hair' ? (
        <>
          {/* ciseaux qui coupent la mèche-antenne */}
          <g transform={`translate(390 120) rotate(${-20 + Math.sin(t * 10) * 10})`}>
            <path d="M0 0 L-120 -26" stroke="#c9ccd6" strokeWidth={16} strokeLinecap="round" />
            <path d="M0 0 L-120 26" stroke="#c9ccd6" strokeWidth={16} strokeLinecap="round" transform={`rotate(${Math.abs(Math.sin(t * 10)) * -18})`} />
            <circle cx={30} cy={-22} r={22} fill="none" stroke={C.red} strokeWidth={10} /><circle cx={30} cy={22} r={22} fill="none" stroke={C.red} strokeWidth={10} />
            <circle r={7} fill={INK} />
          </g>
          {/* peigne */}
          <g transform="translate(60 560) rotate(-20)"><rect width={170} height={34} rx={8} fill={C.gold} stroke={INK} strokeWidth={6} />
            {Array.from({length: 9}).map((_, i) => <path key={i} d={`M${12 + i * 18} 34 v40`} stroke={INK} strokeWidth={8} strokeLinecap="round" />)}</g>
          {/* mèches qui tombent */}
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M${200 + i * 50} ${120 + ((t * 160 + i * 70) % 380)} q10 -20 0 -40`} stroke="#4a2f1f" strokeWidth={8} fill="none" strokeLinecap="round" />)}
        </>
      ) : null}
      {kind === 'gym' ? (
        <g transform={`translate(430 ${150 + Math.abs(Math.sin(t * 4)) * 40}) rotate(-8)`}>
          {/* haltère trop lourd (bras tremblant) */}
          <rect x={-110} y={-12} width={220} height={24} rx={10} fill="#c9ccd6" stroke={INK} strokeWidth={6} />
          {[-1, 1].map((d) => <rect key={d} x={d * 110 - (d < 0 ? 56 : 0)} y={-60} width={56} height={120} rx={14} fill="#2a2433" stroke={INK} strokeWidth={7} />)}
          <text x={0} y={-80} textAnchor="middle" fontFamily="Anton" fontSize={54} fill={C.cream} stroke={INK} strokeWidth={3}>2 KG</text>
          {[0, 1, 2].map((i) => <path key={i} d={`M${-150 + i * 20} ${40 + i * 30} q-20 10 -40 0`} stroke="#7fd3ff" strokeWidth={8} fill="none" strokeLinecap="round" />)}
        </g>
      ) : null}
      {kind === 'sheets' ? (
        <g transform={`translate(40 420) rotate(${Math.sin(t * 3) * 3})`}>
          <path d="M0 0 L240 -30 L260 300 L10 330 Z" fill="#f3ead2" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          {[[70, 60, 34], [170, 140, 44], [90, 220, 30], [200, 260, 24]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.7} fill="#d9b85a" opacity={0.7} />)}
          {[0, 1, 2].map((i) => <path key={i} d={`M${60 + i * 70} ${-40 - ((t * 50 + i * 15) % 40)} q12 -16 0 -32`} stroke="#8be36a" strokeWidth={7} fill="none" />)}
        </g>
      ) : null}
    </svg>
    {kind === 'shower' ? Array.from({length: 8}).map((_, i) => <div key={i} style={{position: 'absolute', left: 60 + (i * 53) % 360, top: ((t * 400 + i * 130) % 700) - 40, width: 8, height: 34, borderRadius: 4, background: '#cfe8ff', opacity: 0.8}} />) : null}
  </div>
);

export const DayBanner: React.FC<{t: number; day?: number}> = ({t, day = 29}) => {
  const s = BACK(clamp01(t / 0.35));
  return (
    <div style={{position: 'absolute', bottom: 330, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${s})`}}>
      <div style={{background: C.gold, border: `8px solid ${INK}`, borderRadius: 24, padding: '14px 34px', fontFamily: 'Anton', fontSize: 58, color: INK, boxShadow: `0 10px 0 ${INK}`, textAlign: 'center'}}>
        LE JOUR {day} COMMENCE<br />AVEC VOTRE CHOIX
      </div>
    </div>
  );
};

export {interpolate};

// ============ Réaction de Teddy en médaillon (picture-in-picture) ============
export const ReactionInset: React.FC<{t: number; inT: number; expression: import('./Teddy').Expression; size?: number; mouthOpen?: number; sweat?: boolean}> = ({t, inT, expression, size = 300, mouthOpen = 0, sweat}) => {
  if (inT < 0) return null;
  const s = BACK(clamp01(inT / 0.3));
  const k = 1.05, w = 560 * k;
  return (
    <div style={{width: size, height: size, borderRadius: size / 2, overflow: 'hidden', border: `9px solid ${INK}`, outline: `5px solid ${C.gold}`, outlineOffset: -14,
      background: '#2c1a4a', transform: `scale(${s}) rotate(${(1 - s) * -20}deg)`, boxShadow: `0 10px 0 ${INK}`, position: 'relative'}}>
      <div style={{position: 'absolute', width: w, height: 900 * k, left: size / 2 - 280 * k, top: size / 2 - 265 * k}}>
        <Teddy t={t} expression={expression} mouthOpen={mouthOpen} showCloud={false} showFly={false} />
      </div>
      {sweat ? <div style={{position: 'absolute', right: 36, top: 60 + ((t * 120) % 60), width: 22, height: 32, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: '#7fd3ff', border: `4px solid ${INK}`}} /> : null}
    </div>
  );
};

// ============ Transition « whip » : traînées de vitesse + flash ============
export const Whip: React.FC<{t: number; dir?: 1 | -1}> = ({t, dir = 1}) => {
  if (t < 0 || t > 0.32) return null;
  const k = t / 0.32, peak = 1 - Math.abs(k * 2 - 1);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      <AbsoluteFill style={{background: '#fff', opacity: peak * 0.18}} />
      {Array.from({length: 22}).map((_, i) => {
        const y = random(`wy${i}`) * 1920, len = 300 + random(`wl${i}`) * 700, sp = 0.6 + random(`ws${i}`) * 0.8;
        const x = dir * (k * sp * 2600 - 1300) + 540 - len / 2;
        return <div key={i} style={{position: 'absolute', top: y, left: x, width: len, height: 6 + (i % 3) * 5, borderRadius: 6, background: i % 4 ? 'rgba(255,255,255,0.75)' : C.gold, opacity: peak}} />;
      })}
    </AbsoluteFill>
  );
};
