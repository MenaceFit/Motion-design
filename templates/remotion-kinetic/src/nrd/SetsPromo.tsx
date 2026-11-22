// « Contact ensembles » — Alo (300 € boutique → 90 €) et Essentials (50 € → ~135 € Vinted), authentiques, contact en bio.
// Même DA (pixel + fond étoilé + perso). Timings : posés depuis la transcription de la voix (SET_T).
import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import '@fontsource/silkscreen/400.css';
import '@fontsource/silkscreen/700.css';

const F = "'Silkscreen', monospace";
const C = {green: '#3ee06a', red: '#ff4b55', yellow: '#ffd23f', white: '#f4f7ff', blue: '#3a7bff', ink: '#050a18', violet: '#a54cff', gold: '#f5c542'};
const W = 1080, FLOOR = 1640;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const img = (n: string) => staticFile(`sets/${n}`);
const pop = (t: number, at: number, d = 0.28) => (t < at ? 0 : interpolate(t, [at, at + d * 0.6, at + d], [0, 1.18, 1], clamp));
const ease = (t: number, a: number, d: number, from: number, to: number, e = Easing.out(Easing.cubic)) => interpolate(t, [a, a + d], [from, to], {...clamp, easing: e});
const count = (t: number, at: number, v: number, d = 0.7) => Math.round(v * ease(t, at, d, 0, 1));

import {SET_T as T, SET_WORDS as WORDS} from './setsTimings';
const SCENES = [0, T.ess, T.non, T.how, T.bio, 99];
const ITEMS = [{src: 'alo.jpg'}, {src: 'essentials.jpg'}];

const Txt: React.FC<{children: React.ReactNode; size: number; color?: string; style?: React.CSSProperties}> = ({children, size, color = C.white, style}) => (
  <div style={{fontFamily: F, fontWeight: 700, fontSize: size, color, letterSpacing: 2, lineHeight: 1.05, textAlign: 'center',
    textShadow: `${size / 14}px ${size / 14}px 0 ${C.ink}, 0 0 ${size / 3}px rgba(0,0,0,.45)`, ...style}}>{children}</div>
);
const Chip: React.FC<{label: string; bg: string; fg?: string; size?: number}> = ({label, bg, fg = C.ink, size = 30}) => (
  <div style={{fontFamily: F, fontWeight: 700, fontSize: size, color: fg, background: bg, padding: `${size * 0.22}px ${size * 0.5}px`,
    border: `4px solid ${C.ink}`, borderRadius: 6, boxShadow: `4px 4px 0 ${C.ink}`, whiteSpace: 'nowrap'}}>{label}</div>
);
const Center: React.FC<{top: number; children: React.ReactNode; s?: number; rot?: number; op?: number}> = ({top, children, s = 1, rot = 0, op = 1}) => (
  <div style={{position: 'absolute', left: 0, width: W, top, display: 'flex', justifyContent: 'center', transform: `scale(${s}) rotate(${rot}deg)`, opacity: op}}>{children}</div>
);
const Typed: React.FC<{text: string; at: number; t: number; size: number; color?: string; top: number; cps?: number}> = ({text, at, t, size, color, top, cps = 32}) => {
  if (t < at) return null;
  const n = Math.floor((t - at) * cps);
  return <Txt size={size} color={color} style={{position: 'absolute', left: 30, width: W - 60, top}}>{text.slice(0, n)}{n < text.length ? '_' : ''}</Txt>;
};

const Stars: React.FC<{gold?: number}> = ({gold = 0}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%,#14215a 0%,#0a1238 45%,#04071c 100%)'}}>
      <AbsoluteFill style={{background: 'linear-gradient(115deg, transparent 30%, rgba(120,140,255,.10) 45%, rgba(190,150,255,.08) 52%, transparent 66%)'}} />
      {gold > 0 && <AbsoluteFill style={{opacity: gold, background:
        `repeating-conic-gradient(from ${frame * 0.5}deg at 50% 38%, rgba(255,210,63,.16) 0deg 9deg, transparent 9deg 22deg)`}} />}
      {Array.from({length: 140}).map((_, i) => {
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(frame / (14 + random('sp' + i) * 30) + random('ph' + i) * 6));
        const sz = random('sz' + i) < 0.85 ? 4 : 6;
        return <div key={i} style={{position: 'absolute', left: random('sx' + i) * W, top: random('sy' + i) * (FLOOR - 20), width: sz, height: sz,
          background: random('sc' + i) < 0.8 ? '#fff' : '#ffe9a8', opacity: tw}} />;
      })}
      {[0, 1].map((k) => {
        const per = 160, p = ((frame - 50 - k * 80) % per + per) % per;
        if (p > 18) return null;
        return <div key={k} style={{position: 'absolute', left: 120 + k * 520 + p * 26, top: 140 + k * 260 + p * 10, width: 160, height: 4, transform: 'rotate(21deg)',
          background: 'linear-gradient(90deg, transparent, #fff)', opacity: 1 - p / 18}} />;
      })}
      <div style={{position: 'absolute', left: 0, top: FLOOR, width: W, height: 1920 - FLOOR, background: 'linear-gradient(180deg,#0c1d4d,#050b1e)'}} />
      <div style={{position: 'absolute', left: 0, top: FLOOR - 2, width: W, height: 4, background: '#5d8dff', boxShadow: '0 0 24px 6px rgba(80,130,255,.55)'}} />
    </AbsoluteFill>
  );
};

const Coins: React.FC<{t: number; at: number; dur?: number; n?: number}> = ({t, at, dur = 1.6, n = 18}) => {
  const frame = useCurrentFrame();
  if (t < at || t > at + dur) return null;
  return <>{Array.from({length: n}).map((_, i) => {
    const y = -120 + (t - at) * (700 + random('cs' + i) * 600) + random('cy' + i) * 400;
    return <div key={i} style={{position: 'absolute', left: random('cx' + i) * W, top: y, width: 50, height: 50, borderRadius: '50%', background: C.yellow,
      border: '5px solid #b8860b', transform: `scaleX(${Math.abs(Math.cos(frame / 5 + i))})`}} />;
  })}</>;
};
const Sparkles: React.FC<{t: number; at: number; cx: number; cy: number}> = ({t, at, cx, cy}) => {
  if (t < at || t > at + 1.2) return null;
  const k = (t - at) / 1.2;
  return <>{Array.from({length: 14}).map((_, i) => {
    const a = random('sa' + i) * Math.PI * 2, r = 80 + random('sr' + i) * 320 * k;
    return <div key={i} style={{position: 'absolute', left: cx + Math.cos(a) * r, top: cy + Math.sin(a) * r, fontFamily: F, fontSize: 40, color: i % 2 ? C.yellow : C.white, opacity: 1 - k}}>+</div>;
  })}</>;
};

/** Photo encadrée (cadre clair + glow) */
const Photo: React.FC<{src: string; w: number; h: number; glow?: string; children?: React.ReactNode; dim?: number}> = ({src, w, h, glow, children, dim = 0}) => (
  <div style={{position: 'relative', width: w, height: h, borderRadius: 18, padding: 12, background: 'linear-gradient(160deg,#f2f6ff,#b7c7f0)',
    border: `5px solid ${glow ?? '#dfe8ff'}`, boxShadow: `0 0 0 4px ${C.ink}, 0 24px 60px rgba(0,0,0,.6)${glow ? `, 0 0 50px 8px ${glow}` : ''}`}}>
    <div style={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: 10}}>
      <Img src={img(src)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: `brightness(${1 - dim})`}} />
      {children}
    </div>
  </div>
);
const Sheen: React.FC<{t: number; at: number; h: number; w: number}> = ({t, at, h, w}) => (t >= at && t < at + 0.6 ? (
  <div style={{position: 'absolute', top: -200, width: 160, height: h + 400, left: interpolate(t, [at, at + 0.6], [-260, w + 60]), transform: 'rotate(18deg)',
    background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.7),transparent)', mixBlendMode: 'screen'}} />) : null);

const Stamp: React.FC<{t: number; at: number; text: string; color: string; size?: number; rot?: number}> = ({t, at, text, color, size = 44, rot = -12}) => {
  if (t < at) return null;
  const k = ease(t, at, 0.14, 1.8, 1, Easing.in(Easing.quad));
  return <div style={{transform: `scale(${k}) rotate(${rot}deg)`, opacity: ease(t, at, 0.06, 0, 1)}}>
    <div style={{fontFamily: F, fontWeight: 700, fontSize: size, color, padding: '4px 16px', border: `7px solid ${color}`, borderRadius: 12, background: 'rgba(5,10,24,.6)',
      textShadow: `3px 3px 0 ${C.ink}`, boxShadow: `0 0 30px ${color}`, whiteSpace: 'nowrap', letterSpacing: 3}}>{text}</div>
  </div>;
};

/** étiquette de prix suspendue (ficelle) */
const PriceTag: React.FC<{t: number; at: number; label: string; value: string; color: string; x: number; y: number; rot?: number}> = ({t, at, label, value, color, x, y, rot = -6}) => {
  if (t < at) return null;
  const frame = useCurrentFrame();
  const swing = Math.sin((t - at) * 7) * 10 * Math.exp(-(t - at) * 2.5) + Math.sin(frame / 20) * 1.5;
  return <div style={{position: 'absolute', left: x, top: y, transformOrigin: '50% -40px', transform: `scale(${pop(t, at, 0.3)}) rotate(${rot + swing}deg)`}}>
    <div style={{position: 'absolute', left: '50%', top: -44, width: 3, height: 44, background: '#dfe8ff'}} />
    <div style={{padding: '12px 26px 14px', background: color, border: `5px solid ${C.ink}`, borderRadius: 14, boxShadow: `6px 6px 0 ${C.ink}`, textAlign: 'center',
      clipPath: 'polygon(14% 0,100% 0,100% 100%,14% 100%,0 50%)', paddingLeft: 46}}>
      <div style={{fontFamily: F, fontWeight: 700, fontSize: 22, color: C.ink, letterSpacing: 2}}>{label}</div>
      <div style={{fontFamily: F, fontWeight: 700, fontSize: 64, color: C.ink, lineHeight: 1}}>{value}</div>
    </div>
  </div>;
};

const Character: React.FC<{t: number}> = ({t}) => {
  const frame = useCurrentFrame();
  const talk = WORDS.some(([a, b]) => t >= a && t <= b) && Math.floor(frame / 4) % 2 === 0;
  let pose = 'idle';
  if (t < 1.0) pose = 'wave';
  else if (t >= T.n90 && t < T.n90 + 1.2) pose = 'cheer';
  else if (t >= T.e135 && t < T.e135 + 1.0) pose = 'cheer';
  else if (t >= T.ess && t < T.non) pose = 'point_r';
  else if (t >= T.how && t < T.contact) pose = 'think';
  else if (t >= T.give && t < T.give + 1.0) pose = 'cheer';
  else if (t >= T.bio) pose = 'point_r';
  const closed: Record<string, string> = {wave: 'wave_c', cheer: 'cheer_c', shrug: 'shrug_c', point_r: 'point_r_c'};
  let p = pose;
  if (!talk && closed[p]) p = closed[p];
  if (p === 'idle' && talk) p = 'talk';
  const hopAt = [T.n90, T.e135, T.auth, T.give].find((a) => t >= a && t < a + 0.4);
  const hop = hopAt !== undefined ? Math.sin(((t - hopAt) / 0.4) * Math.PI) * 60 : 0;
  const bob = Math.floor(frame / 8) % 2 === 0 ? 0 : 5;
  const s = 0.8, w = 280 * s, h = 400 * s;
  return <div style={{position: 'absolute', left: W / 2 - w / 2, top: FLOOR - h + 6 + bob - hop, width: w, height: h}}>
    <Img src={img(`char_${p}.png`)} style={{width: w, height: h, imageRendering: 'pixelated'}} />
    {t >= T.how && t < T.contact && <Txt size={60} color={C.yellow} style={{position: 'absolute', left: w / 2 - 16, top: -70}}>?</Txt>}
  </div>;
};


/** prix barré + nouveau prix tamponné */
const Strike: React.FC<{t: number; at: number; w: number}> = ({t, at, w}) => (t >= at ? (
  <div style={{position: 'absolute', left: -10, top: '46%', height: 12, width: (w + 20) * ease(t, at, 0.2, 0, 1), background: C.red, transform: 'rotate(-8deg)', boxShadow: `3px 3px 0 ${C.ink}`}} />) : null);

export const SetsPromo: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const sc = SCENES.findIndex((a, i) => t >= a && t < SCENES[i + 1]);
  const cuts = SCENES.slice(1, 5);
  const cut = cuts.find((a) => t >= a && t < a + 0.35);
  const punch = cut !== undefined ? ease(t, cut, 0.35, 1.05, 1) : 1;
  const zoomPunch = t >= T.n90 && t < T.n90 + 0.5 ? ease(t, T.n90, 0.5, 1.08, 1) : 1;
  const flash = [...cuts, T.n90].reduce((m, a) => Math.max(m, t >= a && t < a + 0.12 ? 1 - (t - a) / 0.12 : 0), 0);
  const shake = [T.n90, T.e135, T.auth, T.give].some((a) => t >= a && t < a + 0.22) ? (random(frame) - 0.5) * 20 : 0;
  const gold = (sc === 0 && t >= T.n90) ? ease(t, T.n90, 0.3, 0, 1) : (sc === 3 && t >= T.give) ? ease(t, T.give, 0.3, 0, 0.8) : 0;
  const cw = 620, ch = 820;

  return (
    <AbsoluteFill style={{background: '#04071c', transform: `translate(${shake}px,${shake * 0.6}px) scale(${punch * zoomPunch})`}}>
      <Stars gold={gold} />

      {/* HOOK — Alo : 300 € boutique → 90 € */}
      {sc === 0 && <>
        <Typed text="ENSEMBLE ALO" at={0.05} t={t} size={60} top={140} />
        <div style={{position: 'absolute', left: W / 2 - cw / 2, top: 300, transform: `scale(${ease(t, 0.1, 0.5, 0.3, 1, Easing.out(Easing.back(1.5)))}) rotate(${ease(t, 0.1, 0.5, -12, -2)}deg)`}}>
          <Photo src="alo.jpg" w={cw} h={ch} glow={t >= T.n90 ? C.green : undefined}><Sheen t={t} at={T.n90} h={ch} w={cw} /></Photo>
        </div>
        {t >= T.boutique && <div style={{position: 'absolute', left: 70, top: 900, transform: `scale(${pop(t, T.boutique, 0.3)}) rotate(-6deg)`}}>
          <div style={{position: 'relative', padding: '12px 26px', background: C.white, border: `5px solid ${C.ink}`, borderRadius: 14, boxShadow: `6px 6px 0 ${C.ink}`}}>
            <div style={{fontFamily: F, fontWeight: 700, fontSize: 22, color: C.ink, letterSpacing: 2, textAlign: 'center'}}>EN BOUTIQUE</div>
            <div style={{fontFamily: F, fontWeight: 700, fontSize: 70, color: C.ink, lineHeight: 1, textAlign: 'center'}}>300€</div>
            <Strike t={t} at={T.n90 - 0.05} w={230} />
          </div></div>}
        {t >= T.paid && <Typed text="MOI JE L'AI PAYÉ..." at={T.paid} t={t} size={44} top={230} color={C.yellow} />}
        {t >= T.n90 && <div style={{position: 'absolute', left: 560, top: 820}}><Stamp t={t} at={T.n90} text="90€" color={C.green} size={150} rot={-8} /></div>}
        {t >= T.n90 + 0.35 && <div style={{position: 'absolute', left: 640, top: 1050, transform: `scale(${pop(t, T.n90 + 0.35)}) rotate(8deg)`}}><Chip label="−70%" bg={C.red} fg="#fff" size={54} /></div>}
        <Coins t={t} at={T.n90} />
        <Sparkles t={t} at={T.n90} cx={W / 2} cy={700} />
      </>}

      {/* ESSENTIALS — 50 € → ~135 € */}
      {sc === 1 && <>
        <Typed text="ENSEMBLE ESSENTIALS" at={T.ess} t={t} size={54} top={140} />
        <div style={{position: 'absolute', left: W / 2 - cw / 2, top: 300, transform: `translateX(${ease(t, T.ess, 0.5, -1000, 0, Easing.out(Easing.back(1.3)))}px) rotate(${ease(t, T.ess, 0.5, -15, 2)}deg)`}}>
          <Photo src="essentials.jpg" w={cw} h={ch} glow={t >= T.e135 ? C.green : undefined}><Sheen t={t} at={T.e135} h={ch} w={cw} /></Photo>
        </div>
        <PriceTag t={t} at={T.e50} label="PAYÉ" value="50€" color={C.white} x={60} y={880} rot={-8} />
        {t >= T.vinted && <div style={{position: 'absolute', right: 50, top: 250, transform: `scale(${pop(t, T.vinted)}) rotate(5deg)`}}><Chip label="VINTED" bg="#09b1ba" fg="#fff" size={34} /></div>}
        <PriceTag t={t} at={T.e135} label="REVENTE ~" value={`${count(t, T.e135, 135, 0.5)}€`} color={C.yellow} x={680} y={840} rot={6} />
        {t >= T.e135 + 0.5 && <Center top={1160} s={pop(t, T.e135 + 0.5, 0.35)} rot={-3}>
          <div style={{padding: '8px 30px', background: C.green, border: `6px solid ${C.ink}`, borderRadius: 16, boxShadow: `8px 8px 0 ${C.ink}`}}><Txt size={64}>+{count(t, T.e135 + 0.5, 85, 0.5)}€</Txt></div></Center>}
        <Sparkles t={t} at={T.e135} cx={W / 2} cy={700} />
      </>}

      {/* PAS DU 1.1 */}
      {sc === 2 && <>
        {t >= T.one && <Center top={180} s={pop(t, T.one)}>
          <div style={{display: 'flex', alignItems: 'center', gap: 30}}><Txt size={70}>C'EST PAS DU</Txt>
            <div style={{position: 'relative'}}><Txt size={110} color={C.red}>1.1</Txt>
              <div style={{position: 'absolute', left: -14, right: -14, top: '48%', height: 16, background: C.red, boxShadow: `3px 3px 0 ${C.ink}`, transform: `rotate(-22deg) scaleX(${ease(t, T.one + 0.25, 0.2, 0, 1)})`}} />
              <div style={{position: 'absolute', left: -14, right: -14, top: '48%', height: 16, background: C.red, boxShadow: `3px 3px 0 ${C.ink}`, transform: `rotate(22deg) scaleX(${ease(t, T.one + 0.4, 0.2, 0, 1)})`}} /></div></div>
        </Center>}
        {['alo.jpg', 'essentials.jpg'].map((src, i) => {
          const at = T.non + i * 0.12;
          return <div key={i} style={{position: 'absolute', left: [80, 560][i], top: 400 + (i ? 30 : 0), transform: `translateY(${ease(t, at, 0.45, 1200, 0, Easing.out(Easing.back(1.4)))}px) rotate(${[-5, 5][i]}deg)`}}>
            <Photo src={src} w={440} h={580} glow={t >= T.auth + i * 0.15 ? C.green : undefined}><Sheen t={t} at={T.auth + i * 0.15} h={580} w={440} /></Photo>
            <div style={{position: 'absolute', left: 0, width: 440, top: 250, display: 'flex', justifyContent: 'center'}}><Stamp t={t} at={T.auth + i * 0.15} text="LEGIT ✓" color={C.green} size={54} /></div>
          </div>;
        })}
        {t >= T.auth && <Center top={1080} s={pop(t, T.auth + 0.35, 0.35)}><Chip label="100% AUTHENTIQUE" bg={C.green} fg={C.white} size={52} /></Center>}
      </>}

      {/* LE CONTACT */}
      {sc === 3 && <>
        <Typed text="COMMENT JE FAIS ?" at={T.how} t={t} size={60} top={160} />
        {['alo.jpg', 'essentials.jpg', 'alo.jpg', 'essentials.jpg'].map((src, i) => {
          const x = ((i * 300 - (t - T.how) * 160) % 1200 + 1200) % 1200 - 150;
          return <div key={i} style={{position: 'absolute', left: x, top: 330, opacity: 0.3, transform: `rotate(${(i % 2 ? 5 : -5)}deg)`}}><Photo src={src} w={240} h={320} /></div>;
        })}
        {t >= T.contact && <div style={{position: 'absolute', left: W / 2 - 330, top: 640, width: 660, transform: `scale(${pop(t, T.contact, 0.35)})`, padding: '30px 34px',
          background: 'rgba(240,244,255,.97)', borderRadius: 30, border: `5px solid ${C.ink}`, boxShadow: `10px 10px 0 ${C.ink}${t >= T.give ? ', 0 0 70px rgba(255,210,63,.7)' : ''}`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
            <div style={{width: 110, height: 110, borderRadius: '50%', background: 'linear-gradient(135deg,#5b6cff,#c13cff)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              filter: t >= T.give ? 'none' : 'blur(6px)'}}><Txt size={56}>👤</Txt></div>
            <div style={{flex: 1}}>
              <div style={{fontFamily: F, fontWeight: 700, fontSize: 34, color: C.ink}}>MON CONTACT</div>
              <div style={{fontFamily: 'sans-serif', fontWeight: 700, fontSize: 28, color: '#555', marginTop: 6, filter: t >= T.give ? 'none' : 'blur(8px)'}}>Ensembles en direct</div>
            </div>
            <div style={{fontSize: 70, transform: `scale(${t >= T.give ? pop(t, T.give, 0.35) : 1})`}}>{t >= T.give ? '🔓' : '🔒'}</div>
          </div>
          {t >= T.direct && <div style={{marginTop: 18, display: 'flex', gap: 12, justifyContent: 'center', transform: `scale(${pop(t, T.direct)})`}}>
            <Chip label="✓ EN DIRECT" bg={C.green} fg="#fff" size={24} /><Chip label="✓ SANS BOUTIQUE" bg={C.yellow} size={24} /></div>}
        </div>}
        {t >= T.give && <Center top={1020} s={pop(t, T.give + 0.2, 0.35)} rot={-2}><Chip label="🎁 JE TE LE DONNE" bg={C.violet} fg="#fff" size={46} /></Center>}
      </>}

      {/* CTA */}
      {sc === 4 && <>
        <Center top={160} s={1 + 0.07 * Math.sin(frame / 4)}><Txt size={110} color={C.yellow}>▲ ▲ ▲</Txt></Center>
        <Typed text="LE CONTACT" at={T.bio} t={t} size={80} top={360} />
        <Center top={470} s={pop(t, T.bio + 0.3, 0.35)}>
          <div style={{padding: '22px 56px', borderRadius: 40, background: 'linear-gradient(135deg,#5b6cff,#c13cff)', border: `6px solid ${C.ink}`, boxShadow: `8px 8px 0 ${C.ink}, 0 0 60px rgba(150,90,255,.7)`}}>
            <Txt size={100} style={{whiteSpace: 'nowrap'}}>EN BIO</Txt></div></Center>
        {t >= T.dm && <div style={{position: 'absolute', left: 90, width: W - 180, top: 760, transform: `translateY(${ease(t, T.dm, 0.35, -300, 0, Easing.out(Easing.back(1.5)))}px)`,
          opacity: ease(t, T.dm, 0.15, 0, 1), display: 'flex', alignItems: 'center', gap: 20, padding: '20px 26px', background: 'rgba(240,244,255,.97)', borderRadius: 30,
          border: `4px solid ${C.ink}`, boxShadow: `6px 6px 0 ${C.ink}`}}>
          <div style={{width: 74, height: 74, borderRadius: 18, background: C.violet, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Txt size={40}>💬</Txt></div>
          <div style={{flex: 1}}><div style={{fontFamily: 'sans-serif', fontWeight: 800, fontSize: 30, color: C.ink}}>Une question ?</div>
            <div style={{fontFamily: 'sans-serif', fontWeight: 600, fontSize: 28, color: '#555'}}>Écris-moi en DM, je te réponds 👋</div></div>
        </div>}
        {t >= T.end && <Center top={960} s={pop(t, T.end, 0.35)} rot={-3}><Chip label="✓ QUE DE L'AUTHENTIQUE" bg={C.green} fg="#fff" size={44} /></Center>}
      </>}

      <Character t={t} />
      <div style={{position: 'absolute', left: 0, top: 0, height: 10, width: (W * frame) / durationInFrames, background: C.blue, boxShadow: `0 0 14px ${C.blue}`}} />
      {cuts.map((a, i) => t >= a - 0.12 && t < a + 0.3 ? (
        <div key={i} style={{position: 'absolute', top: 0, height: 1920, width: 280, left: interpolate(t, [a - 0.12, a + 0.3], [-320, W + 40]),
          transform: 'skewX(-14deg)', background: `linear-gradient(90deg,transparent,${C.yellow}cc,#fff,${C.yellow}cc,transparent)`, opacity: 0.5}} />) : null)}
      <AbsoluteFill style={{pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg,rgba(0,0,0,.10) 0 2px,transparent 2px 5px)', boxShadow: 'inset 0 0 240px rgba(0,0,0,.55)'}} />
      {flash > 0 && <AbsoluteFill style={{background: '#fff', opacity: flash * 0.5}} />}
    </AbsoluteFill>
  );
};
