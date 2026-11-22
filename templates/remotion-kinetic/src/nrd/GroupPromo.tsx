// Promo du groupe privé — montage de tout le contenu existant (legit checks + trouvailles), voix Kevin v4.
import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import '@fontsource/silkscreen/400.css';
import '@fontsource/silkscreen/700.css';

const F = "'Silkscreen', monospace";
const C = {green: '#3ee06a', red: '#ff4b55', yellow: '#ffd23f', white: '#f4f7ff', blue: '#3a7bff', ink: '#050a18', violet: '#a54cff', gold: '#f5c542'};
const W = 1080, FLOOR = 1640;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const img = (n: string) => staticFile(n);
const pop = (t: number, at: number, d = 0.28) => (t < at ? 0 : interpolate(t, [at, at + d * 0.6, at + d], [0, 1.18, 1], clamp));
const ease = (t: number, a: number, d: number, from: number, to: number, e = Easing.out(Easing.cubic)) => interpolate(t, [a, a + d], [from, to], {...clamp, easing: e});
const count = (t: number, at: number, v: number, d = 0.7) => Math.round(v * ease(t, at, d, 0, 1));

const T = {
  wall: [0.0, 0.54, 1.3, 2.22, 2.94, 3.8, 4.2, 4.5, 4.75, 5.0], teach: 4.68, ten: 7.08,
  but: 8.02, boom: 9.58, auth: 10.26, cheap: 11.26,
  f1: 12.24, f2: 12.96, f3: 13.22, ticket: 14.28, n900: 16.22,
  alo: 17.82, n90: 18.76, s300: 20.16,
  grp: 21.42, plans: 21.84, unlock: 23.1, niches: 23.9, tags: 24.98, acc: 26.5,
  prom: 27.86, show: 29.38, where: 30.64, fake: 31.7,
  bio: 32.9, inbio: 33.26, q: 34.0, dm: 35.04,
};
const SCENES = [0, T.but, T.f1, T.alo, T.grp, T.prom, T.bio, 99];
const WORDS: [number, number][] = [[0, 4.3], [4.68, 7.7], [8.02, 9.4], [9.58, 11.7], [12.14, 15.3], [15.58, 17.5], [17.82, 21.2], [21.42, 23.7],
  [23.9, 27.6], [27.86, 29.4], [29.38, 32.6], [32.9, 33.7], [34.0, 35.6]];
const WALL = [['nrd/full_auth.jpg', 1], ['phenom/full_fake.jpg', 0], ['techfleece/full_auth.jpg', 1], ['division/full_fake.jpg', 0], ['underarmour/full_auth.jpg', 1],
  ['thermavest/full_fake.jpg', 0], ['aeroswift/full_auth.jpg', 1], ['trail/full_fake.jpg', 0], ['phenomtokyo/full_auth.jpg', 1], ['uawhite/full_fake.jpg', 0]] as const;
const FINDS = [{src: 'luxe/navy.jpg', label: 'STONE ISLAND', paid: 100}, {src: 'luxe/green.jpg', label: 'STONE ISLAND', paid: 45}, {src: 'luxe/burberry.jpg', label: 'BURBERRY', paid: 100}];

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
  if (t < 0.6) pose = 'wave';
  else if (t >= T.but && t < T.boom) pose = 'think';
  else if ((t >= T.boom && t < T.boom + 1) || (t >= T.n900 && t < T.n900 + 1) || (t >= T.n90 && t < T.n90 + 1) || (t >= T.unlock && t < T.unlock + 1)) pose = 'cheer';
  else if (t >= T.prom && t < T.show) pose = 'shrug';
  else if (t >= T.bio || (t >= T.f1 && t < T.grp)) pose = 'point_r';
  const closed: Record<string, string> = {wave: 'wave_c', cheer: 'cheer_c', shrug: 'shrug_c', point_r: 'point_r_c'};
  let p = pose;
  if (!talk && closed[p]) p = closed[p];
  if (p === 'idle' && talk) p = 'talk';
  const hopAt = [T.ten, T.boom, T.n900, T.n90, T.unlock, T.bio].find((a) => t >= a && t < a + 0.4);
  const hop = hopAt !== undefined ? Math.sin(((t - hopAt) / 0.4) * Math.PI) * 60 : 0;
  const bob = Math.floor(frame / 8) % 2 === 0 ? 0 : 5;
  const s = 0.8, w = 280 * s, h = 400 * s;
  return <div style={{position: 'absolute', left: W / 2 - w / 2, top: FLOOR - h + 6 + bob - hop, width: w, height: h}}>
    <Img src={img(`luxe/char_${p}.png`)} style={{width: w, height: h, imageRendering: 'pixelated'}} />
    {t >= T.but && t < T.boom && <Txt size={60} color={C.yellow} style={{position: 'absolute', left: w / 2 - 16, top: -70}}>?</Txt>}
  </div>;
};


const wallPos = (i: number) => ({x: 40 + (i % 3) * 340 + (Math.floor(i / 3) % 2) * 60, y: 240 + Math.floor(i / 3) * 300, r: [-6, 4, -3, 7, -5, 3, -7, 5, -2, 6][i]});

export const GroupPromo: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const sc = SCENES.findIndex((a, i) => t >= a && t < SCENES[i + 1]);
  const cuts = SCENES.slice(1, 7);
  const cut = cuts.find((a) => t >= a && t < a + 0.35);
  const punch = cut !== undefined ? ease(t, cut, 0.35, 1.05, 1) : 1;
  const flash = [...cuts, T.boom].reduce((m, a) => Math.max(m, t >= a && t < a + 0.12 ? 1 - (t - a) / 0.12 : 0), 0);
  const shake = [T.ten, T.boom, T.ticket, T.n900, T.n90, T.unlock].some((a) => t >= a && t < a + 0.2) ? (random(frame) - 0.5) * 18 : 0;
  const gold = sc === 1 && t >= T.boom ? ease(t, T.boom, 0.3, 0, 1) : sc === 2 && t >= T.n900 ? ease(t, T.n900, 0.3, 0, 0.9) : sc === 4 && t >= T.unlock ? 0.6 : 0;

  return (
    <AbsoluteFill style={{background: '#04071c', transform: `translate(${shake}px,${shake * 0.6}px) scale(${punch})`}}>
      <Stars gold={gold} />

      {/* 1 — mur des legit checks */}
      {sc === 0 && <>
        {WALL.map(([src, ok], i) => {
          const at = T.wall[i]; if (t < at) return null;
          const {x, y, r} = wallPos(i);
          return <div key={i} style={{position: 'absolute', left: x, top: y, transform: `scale(${ease(t, at, 0.3, 1.6, 1, Easing.out(Easing.back(1.5)))}) rotate(${r}deg)`, opacity: ease(t, at, 0.1, 0, 1)}}>
            <Photo src={src} w={300} h={340} glow={ok ? C.green : C.red} dim={t >= T.teach ? 0.35 : 0} />
            <div style={{position: 'absolute', left: 0, width: 300, top: 140, display: 'flex', justifyContent: 'center'}}>
              <Stamp t={t} at={at + 0.12} text={ok ? 'LEGIT ✓' : '1:1 ✗'} color={ok ? C.green : C.red} size={36} /></div>
          </div>;
        })}
        {t >= T.teach && <div style={{position: 'absolute', left: 0, width: W, top: 140}}><Typed text="JE T'AI APPRIS À REPÉRER LE 1.1" at={T.teach} t={t} size={40} top={0} /></div>}
        {t >= T.ten && <Center top={1180} s={pop(t, T.ten, 0.35)} rot={-3}>
          <div style={{padding: '14px 34px', background: C.yellow, border: `6px solid ${C.ink}`, borderRadius: 16, boxShadow: `8px 8px 0 ${C.ink}`}}>
            <Txt size={64} color={C.ink} style={{textShadow: 'none'}}>{count(t, T.ten, 10, 0.4)}+ MODÈLES</Txt></div></Center>}
      </>}

      {/* 2 — bascule */}
      {sc === 1 && <>
        {t < T.boom + 0.1 && WALL.map(([src], i) => {
          const {x, y, r} = wallPos(i);
          const k = ease(t, T.but + i * 0.05, 0.9, 0, 1, Easing.in(Easing.cubic));
          return <div key={i} style={{position: 'absolute', left: x + (W / 2 - 150 - x) * k, top: y + (700 - y) * k, transform: `rotate(${r * (1 - k) + k * 360}deg) scale(${1 - 0.5 * k})`}}>
            <Photo src={src} w={300} h={340} dim={0.35} /></div>;
        })}
        <Typed text="MAIS TU SAIS CE QUE" at={T.but} t={t} size={50} top={150} />
        <Typed text="JE FAIS DE TOUT ÇA ?" at={T.but + 0.5} t={t} size={50} top={220} color={C.yellow} />
        {t >= T.boom && <>
          <AbsoluteFill style={{background: `radial-gradient(circle at 50% 42%, rgba(255,230,140,${ease(t, T.boom, 0.6, 0.9, 0)}) 0%, transparent ${ease(t, T.boom, 0.6, 10, 70)}%)`}} />
          <Sparkles t={t} at={T.boom} cx={W / 2} cy={800} />
          <Center top={560} s={pop(t, T.boom, 0.35)}><Txt size={64}>JE TROUVE DES PIÈCES</Txt></Center>
          {t >= T.auth && <Center top={680} s={pop(t, T.auth, 0.35)} rot={-3}><Chip label="✓ AUTHENTIQUES" bg={C.green} fg="#fff" size={64} /></Center>}
          {t >= T.cheap && <Center top={840} s={pop(t, T.cheap, 0.35)} rot={2}><Chip label="💸 À PRIX CASSÉ" bg={C.yellow} size={60} /></Center>}
        </>}
      </>}

      {/* 3 — 245 € → 900 €+ */}
      {sc === 2 && <>
        {FINDS.map((f, i) => {
          const at = [T.f1, T.f2, T.f3][i];
          const k = ease(t, at, 0.45, 0, 1, Easing.out(Easing.back(1.6)));
          return <div key={i} style={{position: 'absolute', left: [70, 390, 710][i], top: 230 + (i === 1 ? -20 : 20), transform: `translateY(${(1 - k) * -900}px) rotate(${[-7, 2, 8][i]}deg)`}}>
            <Photo src={f.src} w={300} h={400} dim={t >= T.n900 ? 0.25 : 0} /></div>;
        })}
        {t >= T.ticket && <div style={{position: 'absolute', left: W / 2 - 230, top: 690, width: 460, transformOrigin: 'top', transform: `scaleY(${ease(t, T.ticket, 0.4, 0, 1)}) rotate(-2deg)`,
          background: '#fbf8ef', padding: '20px 30px 28px', boxShadow: `0 0 0 4px ${C.ink}, 10px 10px 0 ${C.ink}`}}>
          {FINDS.map((f, i) => <div key={i} style={{display: 'flex', justifyContent: 'space-between', fontFamily: F, fontSize: 24, color: '#222', marginTop: 4}}><span>{f.label}</span><span>{f.paid}€</span></div>)}
          <div style={{borderTop: '4px dashed #222', margin: '10px 0'}} />
          <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: F, fontWeight: 700, fontSize: 44, color: C.ink}}><span>TOTAL</span><span>245€</span></div>
        </div>}
        {t >= T.n900 && <Center top={1030} s={pop(t, T.n900 - 0.3)}><Txt size={46}>À LA REVENTE ↓</Txt></Center>}
        {t >= T.n900 && <Center top={1100} s={pop(t, T.n900, 0.35)}><Txt size={170} color={C.yellow}>{count(t, T.n900, 900, 0.55)}€+</Txt></Center>}
        <Coins t={t} at={T.n900} />
      </>}

      {/* 4 — Alo 300 → 90 */}
      {sc === 3 && <>
        <Typed text="ENSEMBLE ALO" at={T.alo} t={t} size={60} top={150} />
        <div style={{position: 'absolute', left: W / 2 - 300, top: 280, transform: `scale(${ease(t, T.alo, 0.45, 0.3, 1, Easing.out(Easing.back(1.5)))}) rotate(${ease(t, T.alo, 0.45, 14, -2)}deg)`}}>
          <Photo src="sets/alo.jpg" w={600} h={800} glow={t >= T.n90 ? C.green : undefined}><Sheen t={t} at={T.n90} h={800} w={600} /></Photo></div>
        {t >= T.alo + 0.4 && <div style={{position: 'absolute', left: 60, top: 860, transform: `scale(${pop(t, T.alo + 0.4, 0.3)}) rotate(-6deg)`}}>
          <div style={{position: 'relative', padding: '12px 26px', background: C.white, border: `5px solid ${C.ink}`, borderRadius: 14, boxShadow: `6px 6px 0 ${C.ink}`}}>
            <div style={{fontFamily: F, fontWeight: 700, fontSize: 22, color: C.ink, letterSpacing: 2, textAlign: 'center'}}>EN BOUTIQUE</div>
            <div style={{fontFamily: F, fontWeight: 700, fontSize: 70, color: C.ink, lineHeight: 1, textAlign: 'center'}}>300€</div>
            {t >= T.s300 && <div style={{position: 'absolute', left: -10, top: '46%', height: 12, width: 250 * ease(t, T.s300, 0.2, 0, 1), background: C.red, transform: 'rotate(-8deg)'}} />}
          </div></div>}
        {t >= T.n90 && <div style={{position: 'absolute', left: 560, top: 820}}><Stamp t={t} at={T.n90} text="90€" color={C.green} size={150} rot={-8} /></div>}
        {t >= T.s300 + 0.2 && <div style={{position: 'absolute', left: 650, top: 1050, transform: `scale(${pop(t, T.s300 + 0.2)}) rotate(8deg)`}}><Chip label="−70%" bg={C.red} fg="#fff" size={54} /></div>}
        <Sparkles t={t} at={T.n90} cx={W / 2} cy={680} />
      </>}

      {/* 5 — le groupe */}
      {sc === 4 && <>
        <Typed text="TOUS CES BONS PLANS" at={T.grp} t={t} size={50} top={150} />
        <div style={{position: 'absolute', left: W / 2 - 330, top: 250, width: 660, transform: `scale(${pop(t, T.grp + 0.2, 0.35)})`, padding: '26px 30px', background: 'rgba(240,244,255,.97)',
          borderRadius: 30, border: `5px solid ${C.ink}`, boxShadow: `10px 10px 0 ${C.ink}${t >= T.unlock ? ', 0 0 70px rgba(255,210,63,.7)' : ''}`, display: 'flex', alignItems: 'center', gap: 22}}>
          <div style={{width: 100, height: 100, borderRadius: 24, background: 'linear-gradient(135deg,#5b6cff,#c13cff)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Txt size={54}>👥</Txt></div>
          <div style={{flex: 1, fontFamily: F, fontWeight: 700, fontSize: 40, color: C.ink}}>MON GROUPE PRIVÉ</div>
          <div style={{fontSize: 70, transform: `scale(${t >= T.unlock ? pop(t, T.unlock, 0.35) : 1})`}}>{t >= T.unlock ? '🔓' : '🔒'}</div>
        </div>
        {[['💎 BONS PLANS AUTHENTIQUES', T.plans + 0.9], ['📍 NICHES VINTED', T.niches], ['🏷️ MES TAGS VINTED', T.tags], ['🤝 ACCOMPAGNEMENT COMPLET', T.acc]].map(([l, at], i) => {
          const a = at as number; if (t < a) return null;
          return <div key={i} style={{position: 'absolute', left: 100, width: W - 200, top: 500 + i * 135, display: 'flex', alignItems: 'center', gap: 22,
            transform: `translateX(${ease(t, a, 0.25, -900, 0)}px)`}}>
            <div style={{width: 84, height: 84, borderRadius: 14, background: C.green, border: `5px solid ${C.ink}`, boxShadow: `5px 5px 0 ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: `scale(${pop(t, a + 0.15)})`}}><Txt size={54}>✓</Txt></div>
            <div style={{flex: 1, padding: '16px 22px', background: 'rgba(10,20,50,.85)', border: `4px solid ${C.blue}`, borderRadius: 14}}><Txt size={32} style={{textAlign: 'left'}}>{l}</Txt></div>
          </div>;
        })}
      </>}

      {/* 6 — honnêteté + promesse */}
      {sc === 5 && <>
        <Typed text="JE TE PROMETS PAS" at={T.prom} t={t} size={54} top={200} />
        <Typed text="DES RÉSULTATS À CHAQUE FOIS" at={T.prom + 0.5} t={t} size={36} top={290} color={C.yellow} />
        {t >= T.prom + 0.8 && <Center top={380} s={pop(t, T.prom + 0.8)}><Chip label="* RÉSULTATS VARIABLES" bg="#dfe8ff" size={28} /></Center>}
        {t >= T.show && <Center top={520} s={pop(t, T.show, 0.35)}><Txt size={64} color={C.green}>JE TE MONTRE</Txt></Center>}
        {t >= T.where && <Center top={630} s={pop(t, T.where, 0.35)} rot={-2}><Chip label="🔍 OÙ CHERCHER" bg={C.yellow} size={56} /></Center>}
        {t >= T.fake && <Center top={790} s={pop(t, T.fake, 0.35)} rot={2}><Chip label="🚫 COMMENT ÉVITER LE FAUX" bg={C.red} fg="#fff" size={42} /></Center>}
        {t >= T.fake + 0.2 && <div style={{position: 'absolute', left: W / 2 - 150, top: 920, transform: 'rotate(-4deg)'}}>
          <Photo src="uawhite/full_fake.jpg" w={300} h={330} dim={0.2} />
          <div style={{position: 'absolute', left: 0, width: 300, top: 130, display: 'flex', justifyContent: 'center'}}><Stamp t={t} at={T.fake + 0.3} text="1:1 ✗" color={C.red} size={50} /></div></div>}
      </>}

      {/* 7 — CTA */}
      {sc === 6 && <>
        <Center top={170} s={1 + 0.07 * Math.sin(frame / 4)}><Txt size={110} color={C.yellow}>▲ ▲ ▲</Txt></Center>
        <Typed text="LE LIEN" at={T.bio} t={t} size={90} top={360} />
        {t >= T.inbio && <Center top={480} s={pop(t, T.inbio, 0.35)}>
          <div style={{padding: '22px 56px', borderRadius: 40, background: 'linear-gradient(135deg,#5b6cff,#c13cff)', border: `6px solid ${C.ink}`, boxShadow: `8px 8px 0 ${C.ink}, 0 0 60px rgba(150,90,255,.7)`}}>
            <Txt size={104} style={{whiteSpace: 'nowrap'}}>EN BIO</Txt></div></Center>}
        {t >= T.q && <div style={{position: 'absolute', left: 90, width: W - 180, top: 770, transform: `translateY(${ease(t, T.q, 0.35, -300, 0, Easing.out(Easing.back(1.5)))}px)`, opacity: ease(t, T.q, 0.15, 0, 1),
          display: 'flex', alignItems: 'center', gap: 20, padding: '20px 26px', background: 'rgba(240,244,255,.97)', borderRadius: 30, border: `4px solid ${C.ink}`, boxShadow: `6px 6px 0 ${C.ink}`}}>
          <div style={{width: 74, height: 74, borderRadius: 18, background: C.violet, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Txt size={40}>💬</Txt></div>
          <div style={{flex: 1}}><div style={{fontFamily: 'sans-serif', fontWeight: 800, fontSize: 30, color: C.ink}}>Une question ?</div>
            <div style={{fontFamily: 'sans-serif', fontWeight: 600, fontSize: 28, color: '#555'}}>Écris-moi en DM 👋</div></div></div>}
        {t >= T.dm && <Center top={960} s={pop(t, T.dm, 0.35)} rot={-3}><Chip label="🔒 GROUPE PRIVÉ" bg={C.violet} fg="#fff" size={44} /></Center>}
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
