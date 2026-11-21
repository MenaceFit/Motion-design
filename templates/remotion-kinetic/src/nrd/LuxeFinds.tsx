// « 245 € → 900 € » — trouvailles semi-luxe authentiques (Stone Island ×2, Burberry Ramsey) + CTA groupe privé.
// DA maison : pixel + fond bleu minuit étoilé + perso. Timings = voix Kevin v4 (Whisper). Mention « résultats variables ».
import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import '@fontsource/silkscreen/400.css';
import '@fontsource/silkscreen/700.css';

const F = "'Silkscreen', monospace";
const C = {green: '#3ee06a', red: '#ff4b55', yellow: '#ffd23f', white: '#f4f7ff', blue: '#3a7bff', ink: '#050a18', violet: '#a54cff', gold: '#f5c542'};
const W = 1080, FLOOR = 1640;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const img = (n: string) => staticFile(`luxe/${n}`);
const pop = (t: number, at: number, d = 0.28) => (t < at ? 0 : interpolate(t, [at, at + d * 0.6, at + d], [0, 1.18, 1], clamp));
const ease = (t: number, a: number, d: number, from: number, to: number, e = Easing.out(Easing.cubic)) => interpolate(t, [a, a + d], [from, to], {...clamp, easing: e});
const count = (t: number, at: number, v: number, d = 0.7) => Math.round(v * ease(t, at, d, 0, 1));

const T = {
  c1: 0.15, c2: 0.45, c3: 0.75, total: 1.34, rev: 2.88, n900: 4.74,
  non: 6.0, one: 7.16, auth: 8.32,
  a1: 9.3, a1n: 10.64, a1p: 12.84, a1v: 13.66, a1r: 15.42, a1b: 15.95,
  a2: 16.6, a2n: 17.42, a2p: 18.66, a2r: 20.98, a2b: 21.45,
  a3: 22.0, a3n: 23.04, a3p: 24.32, a3hot: 25.58, a3r: 26.88, a3b: 27.6,
  how: 28.06, grp: 29.4, daily: 30.28, plans: 31.5,
  prom: 33.06, show: 35.32, link: 37.1, bio: 37.66,
};
const SCENES = [0, T.non, T.a1, T.a2, T.a3, T.how, T.prom, T.link, 99];
const WORDS: [number, number][] = [[0, 2.6], [2.9, 6.0], [6.0, 7.6], [7.9, 9.0], [9.3, 11.9], [12.2, 13.4], [13.7, 15.9], [16.6, 18.4], [18.7, 19.7],
  [20.0, 21.4], [22.0, 24.0], [24.3, 24.7], [25.1, 27.8], [28.1, 28.9], [28.9, 32.9], [33.1, 34.8], [35.0, 36.7], [37.1, 38.0]];
const ITEMS = [
  {src: 'navy.jpg', name: 'STONE ISLAND', sub: 'BLEU MARINE', paid: 100, resale: 350},
  {src: 'green.jpg', name: 'STONE ISLAND', sub: 'VERTE', paid: 45, resale: 250},
  {src: 'burberry.jpg', name: 'BURBERRY', sub: 'RAMSEY', paid: 100, resale: 300},
];

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
  if (t < T.total) pose = 'wave';
  else if (t >= T.n900 && t < T.non) pose = 'cheer';
  else if ((t >= T.a1b && t < T.a1b + 0.8) || (t >= T.a2b && t < T.a2b + 0.8) || (t >= T.a3b && t < T.a3b + 0.8)) pose = 'cheer';
  else if (t >= T.a1 && t < T.how) pose = 'point_r';
  else if (t >= T.how && t < T.grp) pose = 'think';
  else if (t >= T.prom && t < T.show) pose = 'shrug';
  else if (t >= T.link) pose = 'point_r';
  const closed: Record<string, string> = {wave: 'wave_c', cheer: 'cheer_c', shrug: 'shrug_c', point_r: 'point_r_c'};
  let p = pose;
  if (!talk && closed[p]) p = closed[p];
  if (p === 'idle' && talk) p = 'talk';
  const hopAt = [T.n900, T.auth, T.a1b, T.a2b, T.a3b, T.link].find((a) => t >= a && t < a + 0.4);
  const hop = hopAt !== undefined ? Math.sin(((t - hopAt) / 0.4) * Math.PI) * 60 : 0;
  const bob = Math.floor(frame / 8) % 2 === 0 ? 0 : 5;
  const s = 0.8, w = 280 * s, h = 400 * s;
  const x = t >= T.a1 && t < T.how ? 150 : W / 2;
  return <div style={{position: 'absolute', left: x - w / 2, top: FLOOR - h + 6 + bob - hop, width: w, height: h}}>
    <Img src={img(`char_${p}.png`)} style={{width: w, height: h, imageRendering: 'pixelated'}} />
    {t >= T.how && t < T.grp && <Txt size={60} color={C.yellow} style={{position: 'absolute', left: w / 2 - 16, top: -70}}>?</Txt>}
  </div>;
};

// ——— scène article (transition propre à chaque article) ———
const Article: React.FC<{t: number; i: number; at: number; nameAt: number; paidAt: number; resAt: number; benAt: number; extra?: React.ReactNode}> = ({t, i, at, nameAt, paidAt, resAt, benAt, extra}) => {
  const it = ITEMS[i];
  const cw = 640, ch = 850, cx = W / 2 - cw / 2, cy = 360;
  // entrées : 0 = glisse de droite + rotation, 1 = zoom + spin, 2 = chute avec rebond
  const k = ease(t, at, 0.5, 0, 1, i === 2 ? Easing.out(Easing.bounce) : Easing.out(Easing.back(1.4)));
  const tr = i === 0 ? `translateX(${(1 - k) * 900}px) rotate(${(1 - k) * 18}deg)`
    : i === 1 ? `scale(${0.2 + 0.8 * k}) rotate(${(1 - k) * -200}deg)`
    : `translateY(${(1 - k) * -1300}px)`;
  const glow = t >= benAt ? C.green : undefined;
  return <>
    <div style={{position: 'absolute', left: 0, width: W, top: 120, display: 'flex', justifyContent: 'center', gap: 14, transform: `scale(${pop(t, at + 0.05)})`}}>
      {ITEMS.map((_, j) => <div key={j} style={{width: 44, height: 44, borderRadius: 8, border: `4px solid ${C.ink}`, background: j < i ? C.green : j === i ? C.yellow : '#2a3a66'}} />)}
    </div>
    <Typed text={it.name} at={nameAt} t={t} size={64} top={185} />
    {t >= nameAt + 0.35 && <Center top={262} s={pop(t, nameAt + 0.35)}><Chip label={it.sub} bg={C.yellow} size={30} /></Center>}
    <div style={{position: 'absolute', left: cx, top: cy, transform: tr, opacity: Math.min(1, k * 3)}}>
      <Photo src={it.src} w={cw} h={ch} glow={glow}>
        <Sheen t={t} at={resAt} h={ch} w={cw} />
        <div style={{position: 'absolute', right: 24, top: 24}}><Stamp t={t} at={at + 0.55} text="AUTHENTIQUE ✓" color={C.green} size={30} rot={8} /></div>
      </Photo>
    </div>
    <PriceTag t={t} at={paidAt} label="PAYÉ" value={`${it.paid}€`} color={C.white} x={cx - 40} y={cy + ch - 260} rot={-8} />
    <PriceTag t={t} at={resAt} label="REVENTE" value={`${count(t, resAt, it.resale, 0.5)}€`} color={C.yellow} x={cx + cw - 260} y={cy + ch - 300} rot={6} />
    {t >= benAt && <Center top={cy + ch + 40} s={pop(t, benAt, 0.35)} rot={-3}>
      <div style={{padding: '10px 34px', background: C.green, border: `6px solid ${C.ink}`, borderRadius: 16, boxShadow: `8px 8px 0 ${C.ink}, 0 0 50px rgba(62,224,106,.6)`}}>
        <Txt size={78}>+{count(t, benAt, it.resale - it.paid, 0.5)}€</Txt></div>
    </Center>}
    <Sparkles t={t} at={benAt} cx={W / 2} cy={cy + ch / 2} />
    {extra}
  </>;
};

export const LuxeFinds: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const sc = SCENES.findIndex((a, i) => t >= a && t < SCENES[i + 1]);
  const cuts = SCENES.slice(1, 8);
  const cut = cuts.find((a) => t >= a && t < a + 0.35);
  const punch = cut !== undefined ? ease(t, cut, 0.35, 1.05, 1) : 1;
  const flash = cuts.reduce((m, a) => Math.max(m, t >= a && t < a + 0.12 ? 1 - (t - a) / 0.12 : 0), 0);
  const shake = [T.total, T.n900, T.auth, T.a1b, T.a2b, T.a3b].some((a) => t >= a && t < a + 0.2) ? (random(frame) - 0.5) * 18 : 0;
  const gold = sc === 0 && t >= T.n900 ? ease(t, T.n900, 0.3, 0, 1) : sc === 6 ? 0.7 : 0;

  return (
    <AbsoluteFill style={{background: '#04071c', transform: `translate(${shake}px,${shake * 0.6}px) scale(${punch})`}}>
      <Stars gold={gold} />

      {/* HOOK — 3 articles, ticket 245 €, compteur 900 €+ */}
      {sc === 0 && <>
        <Typed text="J'AI PAYÉ CES 3 ARTICLES" at={0.05} t={t} size={46} top={140} />
        {ITEMS.map((it, i) => {
          const at = [T.c1, T.c2, T.c3][i];
          const k = ease(t, at, 0.45, 0, 1, Easing.out(Easing.back(1.6)));
          const x = [70, 390, 710][i], rot = [-7, 2, 8][i];
          const dim = t >= T.rev ? 0.25 : 0;
          return <div key={i} style={{position: 'absolute', left: x, top: 260 + (i === 1 ? -20 : 20), transform: `translateY(${(1 - k) * -900}px) rotate(${rot}deg)`}}>
            <Photo src={it.src} w={300} h={400} dim={dim} />
          </div>;
        })}
        {t >= T.total && <div style={{position: 'absolute', left: W / 2 - 230, top: 720, width: 460, transformOrigin: 'top', transform: `scaleY(${ease(t, T.total, 0.45, 0, 1)}) rotate(-2deg)`,
          background: '#fbf8ef', padding: '22px 30px 30px', boxShadow: `0 0 0 4px ${C.ink}, 10px 10px 0 ${C.ink}`,
          clipPath: 'polygon(0 0,100% 0,100% 94%,95% 100%,90% 94%,85% 100%,80% 94%,75% 100%,70% 94%,65% 100%,60% 94%,55% 100%,50% 94%,45% 100%,40% 94%,35% 100%,30% 94%,25% 100%,20% 94%,15% 100%,10% 94%,5% 100%,0 94%)'}}>
          <div style={{fontFamily: F, fontSize: 24, color: '#555', textAlign: 'center', letterSpacing: 3}}>— TICKET —</div>
          {ITEMS.map((it, i) => <div key={i} style={{display: 'flex', justifyContent: 'space-between', fontFamily: F, fontSize: 24, color: '#222', marginTop: 6}}>
            <span>{it.name.split(' ')[0]} {it.sub.split(' ')[0]}</span><span>{it.paid}€</span></div>)}
          <div style={{borderTop: '4px dashed #222', margin: '10px 0'}} />
          <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: F, fontWeight: 700, fontSize: 44, color: C.ink}}><span>TOTAL</span><span>245€</span></div>
        </div>}
        {t >= T.rev && <Center top={1080} s={pop(t, T.rev)}><Txt size={54}>À LA REVENTE ↓</Txt></Center>}
        {t >= T.n900 && <Center top={1170} s={pop(t, T.n900, 0.35)}>
          <Txt size={190} color={C.yellow}>{count(t, T.n900, 900, 0.55)}€+</Txt></Center>}
        <Coins t={t} at={T.n900} />
      </>}

      {/* PAS DU 1.1 — tout authentique */}
      {sc === 1 && <>
        <Typed text="ET NON..." at={T.non} t={t} size={60} top={170} />
        {t >= T.one && <Center top={290} s={pop(t, T.one)}>
          <div style={{display: 'flex', alignItems: 'center', gap: 30}}><Txt size={70}>C'EST PAS DU</Txt>
            <div style={{position: 'relative'}}><Txt size={110} color={C.red}>1.1</Txt>
              <div style={{position: 'absolute', left: -14, right: -14, top: '48%', height: 16, background: C.red, boxShadow: `3px 3px 0 ${C.ink}`, transform: `rotate(-22deg) scaleX(${ease(t, T.one + 0.25, 0.2, 0, 1)})`, transformOrigin: 'center'}} />
              <div style={{position: 'absolute', left: -14, right: -14, top: '48%', height: 16, background: C.red, boxShadow: `3px 3px 0 ${C.ink}`, transform: `rotate(22deg) scaleX(${ease(t, T.one + 0.4, 0.2, 0, 1)})`, transformOrigin: 'center'}} /></div></div>
        </Center>}
        {ITEMS.map((it, i) => (
          <div key={i} style={{position: 'absolute', left: [70, 390, 710][i], top: 470 + (i === 1 ? -20 : 20), transform: `rotate(${[-5, 1, 6][i]}deg)`}}>
            <Photo src={it.src} w={300} h={400} glow={t >= T.auth + i * 0.15 ? C.green : undefined}>
              <Sheen t={t} at={T.auth + i * 0.15} h={400} w={300} />
            </Photo>
            <div style={{position: 'absolute', left: 0, width: 300, top: 160, display: 'flex', justifyContent: 'center'}}>
              <Stamp t={t} at={T.auth + i * 0.15} text="LEGIT ✓" color={C.green} size={40} /></div>
          </div>
        ))}
        {t >= T.auth && <Center top={1000} s={pop(t, T.auth + 0.4, 0.35)}><Chip label="100% AUTHENTIQUE" bg={C.green} fg={C.white} size={52} /></Center>}
      </>}

      {sc === 2 && <Article t={t} i={0} at={T.a1} nameAt={T.a1n} paidAt={T.a1p} resAt={T.a1r} benAt={T.a1b}
        extra={t >= T.a1v ? <div style={{position: 'absolute', right: 30, top: 330, transform: `scale(${pop(t, T.a1v)}) rotate(4deg)`}}><Chip label="VESTIAIRE COLLECTIVE" bg={C.white} size={22} /></div> : null} />}
      {sc === 3 && <Article t={t} i={1} at={T.a2} nameAt={T.a2n} paidAt={T.a2p} resAt={T.a2r} benAt={T.a2b} />}
      {sc === 4 && <Article t={t} i={2} at={T.a3} nameAt={T.a3n} paidAt={T.a3p} resAt={T.a3r} benAt={T.a3b}
        extra={t >= T.a3hot ? <div style={{position: 'absolute', right: 40, top: 300, transform: `scale(${pop(t, T.a3hot)}) rotate(5deg)`}}><Chip label="🔥 TRÈS DEMANDÉE" bg={C.red} fg={C.white} size={26} /></div> : null} />}

      {/* COMMENT JE LES TROUVE — groupe privé */}
      {sc === 5 && <>
        <Typed text="COMMENT JE LES TROUVE ?" at={T.how} t={t} size={50} top={160} />
        {t >= T.grp && <Center top={280} s={pop(t, T.grp, 0.35)}><Chip label="🔒 MON GROUPE PRIVÉ" bg={C.violet} fg={C.white} size={50} /></Center>}
        {[['🧥 Stone Island à 100€', '-71%'], ['🧥 Stone Island à 45€', '-82%'], ['👟 Burberry Ramsey à 100€', '-67%'], ['🔔 Nouveau bon plan', 'LIVE']].map(([txt, tag], i) => {
          const at = T.daily + i * 0.38;
          if (t < at) return null;
          return <div key={i} style={{position: 'absolute', left: 90, width: W - 180, top: 430 + i * 150, transform: `translateX(${ease(t, at, 0.3, 700, 0)}px)`,
            display: 'flex', alignItems: 'center', gap: 20, padding: '18px 24px', background: 'rgba(240,244,255,.95)', borderRadius: 26, border: `4px solid ${C.ink}`, boxShadow: `6px 6px 0 ${C.ink}`}}>
            <div style={{width: 64, height: 64, borderRadius: 16, background: C.violet, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Txt size={34}>🔔</Txt></div>
            <div style={{flex: 1, fontFamily: 'sans-serif', fontWeight: 700, fontSize: 34, color: C.ink}}>{txt}</div>
            <Chip label={tag} bg={i < 2 ? C.green : C.yellow} size={22} />
          </div>;
        })}
        {t >= T.plans && <Center top={1060} s={pop(t, T.plans)} rot={-2}><Chip label="✓ SEMI-LUXE AUTHENTIQUE" bg={C.green} fg={C.white} size={40} /></Center>}
      </>}

      {/* RÉCAP + honnêteté */}
      {sc === 6 && <>
        {ITEMS.map((it, i) => {
          const at = T.prom + i * 0.18;
          return <div key={i} style={{position: 'absolute', left: 160, width: W - 320, top: 190 + i * 110, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 24px', background: 'rgba(10,20,50,.85)', border: `4px solid ${C.blue}`, borderRadius: 14, transform: `translateX(${ease(t, at, 0.25, -900, 0)}px)`}}>
            <Txt size={30}>{it.name.split(' ')[0]} {it.sub.split(' ')[0]}</Txt><Txt size={40} color={C.green}>+{it.resale - it.paid}€</Txt></div>;
        })}
        {t >= T.prom + 0.7 && <Center top={540} s={pop(t, T.prom + 0.7, 0.35)}><Txt size={170} color={C.yellow}>+{count(t, T.prom + 0.7, 655, 0.7)}€</Txt></Center>}
        {t >= T.prom + 1.2 && <Center top={760} s={pop(t, T.prom + 1.2)}><Chip label="* RÉSULTATS VARIABLES" bg="#dfe8ff" size={28} /></Center>}
        {t >= T.show && <Center top={880} s={pop(t, T.show, 0.35)}><Txt size={62} color={C.green}>JE TE MONTRE</Txt></Center>}
        {t >= T.show + 0.45 && <Center top={980} s={pop(t, T.show + 0.45, 0.35)}><Chip label="🔍 OÙ CHERCHER" bg={C.yellow} size={58} /></Center>}
      </>}

      {/* CTA */}
      {sc === 7 && <>
        <Center top={170} s={1 + 0.07 * Math.sin(frame / 4)}><Txt size={110} color={C.yellow}>▲ ▲ ▲</Txt></Center>
        <Typed text="LE LIEN" at={T.link} t={t} size={96} top={370} />
        {t >= T.bio && <Center top={500} s={pop(t, T.bio, 0.35)}>
          <div style={{padding: '24px 60px', borderRadius: 40, background: 'linear-gradient(135deg,#5b6cff,#c13cff)', border: `6px solid ${C.ink}`,
            boxShadow: `8px 8px 0 ${C.ink}, 0 0 60px rgba(150,90,255,.7)`}}><Txt size={110} style={{whiteSpace: 'nowrap'}}>EN BIO</Txt></div>
        </Center>}
        {t >= T.bio + 0.5 && <Center top={790} s={pop(t, T.bio + 0.5)} rot={-3}><Chip label="🔒 GROUPE PRIVÉ" bg={C.violet} fg={C.white} size={40} /></Center>}
      </>}

      <Character t={t} />
      <div style={{position: 'absolute', left: 0, top: 0, height: 10, width: (W * frame) / durationInFrames, background: C.blue, boxShadow: `0 0 14px ${C.blue}`}} />
      {cuts.map((a, i) => t >= a - 0.12 && t < a + 0.3 ? (
        <div key={i} style={{position: 'absolute', top: 0, height: 1920, width: 280, left: interpolate(t, [a - 0.12, a + 0.3], [-320, W + 40]),
          transform: 'skewX(-14deg)', background: `linear-gradient(90deg,transparent,${C.yellow}cc,#fff,${C.yellow}cc,transparent)`, opacity: 0.5}} />) : null)}
      <AbsoluteFill style={{pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg,rgba(0,0,0,.10) 0 2px,transparent 2px 5px)', boxShadow: 'inset 0 0 240px rgba(0,0,0,.55)'}} />
      {flash > 0 && <AbsoluteFill style={{background: '#fff', opacity: flash * 0.45}} />}
    </AbsoluteFill>
  );
};
