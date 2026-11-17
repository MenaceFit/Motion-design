// Promo « pack niches Vinted » — même DA que LegitCheck (pixel, fond bleu minuit étoilé, perso), timings = voix Kevin v4 (Whisper).
// Articles authentiques uniquement ; mention « résultats variables » (pas de promesse de gains).
import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import '@fontsource/silkscreen/400.css';
import '@fontsource/silkscreen/700.css';

const F = "'Silkscreen', monospace";
const C = {green: '#3ee06a', red: '#ff4b55', yellow: '#ffd23f', white: '#f4f7ff', blue: '#3a7bff', ink: '#050a18', violet: '#a54cff'};
const W = 1080, FLOOR = 1600;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const img = (n: string) => staticFile(`pack/${n}`);
const pop = (t: number, at: number, d = 0.28) => (t < at ? 0 : interpolate(t, [at, at + d * 0.6, at + d], [0, 1.18, 1], clamp));
const fadeOut = (t: number, at: number) => interpolate(t, [at - 0.15, at], [1, 0], clamp);

// timings (s)
const T = {
  four: 1.44, sold: 3.32, day: 5.18, calc: 6.34, c150: 6.8, minus: 7.42, res: 9.02, sale: 10.82,
  secret: 11.9, chance: 13.1, niches: 13.96, auth: 15.06, sous: 15.82, pers: 16.9,
  pack: 18.26, n35: 19.26, grp: 21.0, tags: 21.92, acc: 23.74,
  prom: 25.02, show: 27.16, link: 28.64, bio: 29.48, places: 30.28,
};
const SCENES = [0, T.calc, T.secret, T.pack, T.prom, T.link, 99];
const WORDS: [number, number][] = [[0, 6.0], [6.3, 11.6], [11.9, 14.5], [14.6, 18.0], [18.3, 19.8], [20.2, 24.7], [25.0, 28.6], [28.6, 31.1]];

const Txt: React.FC<{children: React.ReactNode; size: number; color?: string; style?: React.CSSProperties}> = ({children, size, color = C.white, style}) => (
  <div style={{fontFamily: F, fontWeight: 700, fontSize: size, color, letterSpacing: 2, lineHeight: 1.05, textAlign: 'center',
    textShadow: `${size / 14}px ${size / 14}px 0 ${C.ink}, 0 0 ${size / 3}px rgba(0,0,0,.45)`, ...style}}>{children}</div>
);
const Chip: React.FC<{label: string; bg: string; fg?: string; size?: number}> = ({label, bg, fg = C.ink, size = 30}) => (
  <div style={{fontFamily: F, fontWeight: 700, fontSize: size, color: fg, background: bg, padding: `${size * 0.22}px ${size * 0.5}px`,
    border: `4px solid ${C.ink}`, borderRadius: 6, boxShadow: `4px 4px 0 ${C.ink}`, whiteSpace: 'nowrap'}}>{label}</div>
);
const Typed: React.FC<{text: string; at: number; t: number; size: number; color?: string; top: number; cps?: number}> = ({text, at, t, size, color, top, cps = 30}) => {
  if (t < at) return null;
  const n = Math.floor((t - at) * cps);
  return <Txt size={size} color={color} style={{position: 'absolute', left: 40, width: W - 80, top}}>{text.slice(0, n)}{n < text.length ? '_' : ''}</Txt>;
};
const Center: React.FC<{top: number; children: React.ReactNode; s?: number; rot?: number}> = ({top, children, s = 1, rot = 0}) => (
  <div style={{position: 'absolute', left: 0, width: W, top, display: 'flex', justifyContent: 'center', transform: `scale(${s}) rotate(${rot}deg)`}}>{children}</div>
);

const Stars: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%,#14215a 0%,#0a1238 45%,#04071c 100%)'}}>
      <AbsoluteFill style={{background: 'linear-gradient(115deg, transparent 30%, rgba(120,140,255,.10) 45%, rgba(190,150,255,.08) 52%, transparent 66%)'}} />
      {Array.from({length: 140}).map((_, i) => {
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(frame / (14 + random('sp' + i) * 30) + random('ph' + i) * 6));
        const sz = random('sz' + i) < 0.85 ? 4 : 6;
        return <div key={i} style={{position: 'absolute', left: random('sx' + i) * W, top: random('sy' + i) * (FLOOR - 20), width: sz, height: sz,
          background: random('sc' + i) < 0.8 ? '#fff' : '#ffe9a8', opacity: tw}} />;
      })}
      {Array.from({length: 10}).map((_, i) => (
        <div key={'b' + i} style={{position: 'absolute', left: random('bx' + i) * W, top: random('by' + i) * (FLOOR - 200), width: 24, height: 24,
          opacity: 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(frame / 10 + i * 1.7))}}>
          <div style={{position: 'absolute', left: 9, top: 0, width: 6, height: 24, background: '#fff'}} />
          <div style={{position: 'absolute', left: 0, top: 9, width: 24, height: 6, background: '#fff'}} />
        </div>
      ))}
      <div style={{position: 'absolute', left: 0, top: FLOOR, width: W, height: 1920 - FLOOR, background: 'linear-gradient(180deg,#0c1d4d,#050b1e)'}} />
      <div style={{position: 'absolute', left: 0, top: FLOOR - 2, width: W, height: 4, background: '#5d8dff', boxShadow: '0 0 24px 6px rgba(80,130,255,.55)'}} />
    </AbsoluteFill>
  );
};

const Coins: React.FC<{t: number; at: number; dur?: number}> = ({t, at, dur = 1.6}) => {
  const frame = useCurrentFrame();
  if (t < at || t > at + dur) return null;
  return <>{Array.from({length: 16}).map((_, i) => {
    const y = -120 + ((t - at) * (700 + random('cs' + i) * 500) + random('cy' + i) * 500);
    return <div key={i} style={{position: 'absolute', left: random('cx' + i) * W, top: y, width: 50, height: 50, borderRadius: '50%', background: C.yellow,
      border: '5px solid #b8860b', transform: `scaleX(${Math.abs(Math.cos(frame / 5 + i))})`}} />;
  })}</>;
};

const Character: React.FC<{t: number}> = ({t}) => {
  const frame = useCurrentFrame();
  const talk = WORDS.some(([a, b]) => t >= a && t <= b) && Math.floor(frame / 4) % 2 === 0;
  let pose = 'idle';
  if (t < 1.4) pose = 'wave';
  else if (t >= T.sold && t < T.calc) pose = 'cheer';
  else if (t >= T.res && t < T.secret) pose = 'cheer';
  else if (t >= T.secret && t < T.niches) pose = 'think';
  else if (t >= T.prom && t < T.show) pose = 'shrug';
  else if (t >= T.link) pose = 'point_r';
  const closed: Record<string, string> = {wave: 'wave_c', cheer: 'cheer_c', shrug: 'shrug_c', point_r: 'point_r_c'};
  let p = pose;
  if (!talk && closed[p]) p = closed[p];
  if (p === 'idle' && talk) p = 'talk';
  const hops = [T.sold, T.res, T.n35, T.link];
  const ha = hops.find((a) => t >= a && t < a + 0.4);
  const hop = ha !== undefined ? Math.sin(((t - ha) / 0.4) * Math.PI) * 60 : 0;
  const bob = Math.floor(frame / 8) % 2 === 0 ? 0 : 6;
  return <div style={{position: 'absolute', left: W / 2 - 140, top: FLOOR - 394 + bob - hop, width: 280, height: 400}}>
    <Img src={img(`char_${p}.png`)} style={{width: 280, height: 400, imageRendering: 'pixelated'}} />
    {t >= T.secret && t < T.niches && <Txt size={70} color={C.yellow} style={{position: 'absolute', left: 120, top: -80}}>?</Txt>}
  </div>;
};

const Stamp: React.FC<{t: number; at: number; text: string; color: string; top: number; size?: number; rot?: number}> = ({t, at, text, color, top, size = 150, rot = -6}) => {
  if (t < at) return null;
  const k = interpolate(t, [at, at + 0.14], [1.7, 1], {...clamp, easing: Easing.in(Easing.quad)});
  return <Center top={top} s={k} rot={rot}><Txt size={size} color={color}>{text}</Txt></Center>;
};

const count = (t: number, at: number, v: number, d = 0.6) => Math.round(v * interpolate(t, [at, at + d], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)}));

export const PackPromo: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const sc = SCENES.findIndex((a, i) => t >= a && t < SCENES[i + 1]);
  const cut = SCENES.slice(1, 6).find((a) => t >= a && t < a + 0.35);
  const punch = cut !== undefined ? interpolate(t, [cut, cut + 0.35], [1.045, 1], {...clamp, easing: Easing.out(Easing.cubic)}) : 1;
  const flash = SCENES.slice(1, 6).reduce((m, a) => Math.max(m, t >= a && t < a + 0.12 ? 1 - (t - a) / 0.12 : 0), 0);
  const shakeAt = [T.sold, T.res, T.n35].some((a) => t >= a && t < a + 0.2);
  const shake = shakeAt ? (random(frame) - 0.5) * 16 : 0;

  return (
    <AbsoluteFill style={{background: '#04071c', transform: `translate(${shake}px,${shake * 0.6}px) scale(${punch})`}}>
      <Stars />

      {/* 1 — 4 € → 150 € en un jour, preuve Vinted */}
      {sc === 0 && <>
        <div style={{position: 'absolute', left: W / 2 - 230, top: 300, width: 460, height: 888, opacity: interpolate(t, [0, 0.3], [0, 1], clamp),
          transform: `scale(${interpolate(t, [0, 0.4], [0.85, 1], {...clamp, easing: Easing.out(Easing.back(1.4))})}) rotate(-3deg)`,
          borderRadius: 40, padding: 14, background: '#111', border: '6px solid #dfe8ff', boxShadow: `0 0 0 4px ${C.ink}, 0 30px 60px rgba(0,0,0,.6)`}}>
          <Img src={img('vinted.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 26, filter: `brightness(${t > T.four ? 0.45 : 1})`}} />
        </div>
        <Typed text="PAYÉ" at={0.9} t={t} size={52} top={130} />
        <Stamp t={t} at={T.four} text="4€" color={C.yellow} top={420} size={190} rot={-8} />
        {t >= T.sold && <Center top={680} s={pop(t, T.sold)}><Txt size={60}>↓ REVENDU ↓</Txt></Center>}
        <Stamp t={t} at={T.sold + 0.3} text="150€" color={C.green} top={780} size={210} rot={4} />
        {t >= T.day && <Center top={1080} s={pop(t, T.day)} rot={-3}><Chip label="⚡ EN 1 SEUL JOUR" bg={C.yellow} size={46} /></Center>}
        <Coins t={t} at={T.sold + 0.3} />
      </>}

      {/* 2 — calcul du bénéfice */}
      {sc === 1 && <>
        <Typed text="FAIS LE CALCUL" at={T.calc} t={t} size={60} top={200} />
        <div style={{position: 'absolute', left: W / 2 - 330, top: 380, width: 660, padding: '30px 0', background: 'rgba(10,20,50,.85)',
          border: `6px solid ${C.blue}`, borderRadius: 26, boxShadow: `0 0 0 4px ${C.ink}`, transform: `scale(${pop(t, T.calc + 0.1, 0.3)})`}}>
          {t >= T.c150 && <Txt size={110} color={C.green} style={{transform: `scale(${pop(t, T.c150)})`, textAlign: 'right', paddingRight: 90}}>150€</Txt>}
          {t >= T.minus && <Txt size={110} color={C.red} style={{transform: `scale(${pop(t, T.minus)})`, textAlign: 'right', paddingRight: 90}}>− 4€</Txt>}
          {t >= T.minus + 0.4 && <div style={{height: 10, margin: '16px 60px', background: C.white, width: interpolate(t, [T.minus + 0.4, T.minus + 0.8], [0, 540], clamp)}} />}
          {t >= T.res && <Txt size={140} color={C.yellow} style={{transform: `scale(${pop(t, T.res, 0.35)})`}}>+{count(t, T.res, 146)}€</Txt>}
        </div>
        {t >= T.res + 0.3 && <Center top={1020} s={pop(t, T.res + 0.3)}><Txt size={64}>DE BÉNEF</Txt></Center>}
        {t >= T.sale && <Center top={1110} s={pop(t, T.sale)} rot={-3}><Chip label="SUR UNE SEULE VENTE" bg={C.green} fg={C.white} size={36} /></Center>}
        <Coins t={t} at={T.res} />
      </>}

      {/* 3 — le secret : les niches */}
      {sc === 2 && <>
        <Typed text="LE SECRET ?" at={T.secret} t={t} size={80} top={190} />
        {t >= T.chance && <Center top={330} s={pop(t, T.chance)} rot={-4}>
          <div style={{position: 'relative'}}><Txt size={70} color={C.white}>LA CHANCE</Txt>
            <div style={{position: 'absolute', left: -10, right: -10, top: 30, height: 12, background: C.red, transform: 'rotate(-6deg)'}} /></div>
        </Center>}
        {t >= T.niches && <Stamp t={t} at={T.niches} text="LES NICHES" color={C.yellow} top={470} size={120} rot={0} />}
        {[0, 1, 2].map((i) => {
          const at = T.auth + i * 0.18;
          if (t < at) return null;
          const flip = interpolate(t, [at, at + 0.35], [90, 0], {...clamp, easing: Easing.out(Easing.back(1.6))});
          return <div key={i} style={{position: 'absolute', left: 105 + i * 300, top: 660, width: 270, height: 340, transform: `perspective(800px) rotateY(${flip}deg) rotate(${(i - 1) * 4}deg)`,
            background: 'linear-gradient(160deg,#f2f6ff,#b7c7f0)', borderRadius: 16, border: `5px solid ${C.green}`, boxShadow: `0 0 0 4px ${C.ink}, 0 0 40px rgba(62,224,106,.5)`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14}}>
            <Txt size={90} color={C.ink} style={{textShadow: 'none'}}>{['👟', '🧥', '👖'][i]}</Txt>
            <Chip label="AUTHENTIQUE ✓" bg={C.green} fg={C.white} size={20} />
          </div>;
        })}
        {t >= T.sous && <Center top={1050} s={pop(t, T.sous)} rot={-2}><Chip label="SOUS-CÔTÉS" bg={C.yellow} size={44} /></Center>}
        {t >= T.pers && <Center top={1140} s={pop(t, T.pers)}><Txt size={40}>QUE PRESQUE PERSONNE NE REPÈRE 👀</Txt></Center>}
      </>}

      {/* 4 — le pack */}
      {sc === 3 && <>
        <Center top={150} s={pop(t, T.pack)}><Chip label="📦 MON PACK" bg={C.violet} fg={C.white} size={46} /></Center>
        {t >= T.n35 && <Center top={260} s={pop(t, T.n35, 0.35)}><Txt size={230} color={C.yellow}>{count(t, T.n35, 35, 0.5)}</Txt></Center>}
        {t >= T.n35 + 0.2 && <Center top={500} s={pop(t, T.n35 + 0.2)}><Txt size={80}>NICHES</Txt></Center>}
        {[['GROUPE PRIVÉ', T.grp, '🔒'], ['TAGS VINTED', T.tags, '🏷️'], ['ACCOMPAGNEMENT COMPLET', T.acc, '🤝']].map(([l, at, e], i) => {
          const a = at as number;
          if (t < a) return null;
          return <div key={i} style={{position: 'absolute', left: 110, width: W - 220, top: 680 + i * 140, display: 'flex', alignItems: 'center', gap: 24,
            transform: `translateX(${interpolate(t, [a, a + 0.25], [-200, 0], {...clamp, easing: Easing.out(Easing.cubic)})}px)`, opacity: interpolate(t, [a, a + 0.15], [0, 1], clamp)}}>
            <div style={{width: 90, height: 90, borderRadius: 14, background: C.green, border: `5px solid ${C.ink}`, boxShadow: `5px 5px 0 ${C.ink}`, display: 'flex',
              alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(t, a + 0.15)})`}}><Txt size={60}>✓</Txt></div>
            <div style={{flex: 1, padding: '16px 22px', background: 'rgba(10,20,50,.85)', border: `4px solid ${C.blue}`, borderRadius: 14}}>
              <Txt size={36} style={{textAlign: 'left'}}>{e} {l}</Txt></div>
          </div>;
        })}
      </>}

      {/* 5 — honnêteté */}
      {sc === 4 && <>
        <Typed text="JE TE PROMETS PAS" at={T.prom} t={t} size={54} top={260} />
        <Typed text="QUE ÇA MARCHE À CHAQUE FOIS" at={T.prom + 0.7} t={t} size={38} top={350} color={C.yellow} />
        {t >= T.prom + 0.9 && <Center top={470} s={pop(t, T.prom + 0.9)}><Chip label="* RÉSULTATS VARIABLES" bg="#dfe8ff" size={28} /></Center>}
        {t >= T.show && <Center top={640} s={pop(t, T.show, 0.35)}><Txt size={70} color={C.green}>MAIS JE TE MONTRE</Txt></Center>}
        {t >= T.show + 0.5 && <Center top={760} s={pop(t, T.show + 0.5, 0.35)}><Chip label="🔍 OÙ CHERCHER" bg={C.yellow} size={60} /></Center>}
      </>}

      {/* 6 — lien en bio */}
      {sc === 5 && <>
        {t >= T.link && <Center top={170} s={1 + 0.06 * Math.sin(frame / 4)}><Txt size={110} color={C.yellow}>▲ ▲ ▲</Txt></Center>}
        <Typed text="LE LIEN" at={T.link} t={t} size={90} top={360} />
        {t >= T.bio && <Center top={480} s={pop(t, T.bio, 0.35)}>
          <div style={{padding: '24px 60px', borderRadius: 40, background: 'linear-gradient(135deg,#5b6cff,#c13cff)', border: `6px solid ${C.ink}`,
            boxShadow: `8px 8px 0 ${C.ink}, 0 0 60px rgba(150,90,255,.7)`}}><Txt size={110} style={{whiteSpace: 'nowrap'}}>EN BIO</Txt></div>
        </Center>}
        {t >= T.places && <Center top={760} s={pop(t, T.places)} rot={-3}><Chip label="⏳ PLACES LIMITÉES" bg={C.red} fg={C.white} size={44} /></Center>}
      </>}

      <Character t={t} />
      <div style={{position: 'absolute', left: 0, top: 0, height: 10, width: (W * frame) / durationInFrames, background: C.blue, boxShadow: `0 0 14px ${C.blue}`}} />
      {SCENES.slice(1, 6).map((a, i) => t >= a - 0.12 && t < a + 0.3 ? (
        <div key={i} style={{position: 'absolute', top: 0, height: 1920, width: 260, left: interpolate(t, [a - 0.12, a + 0.3], [-300, W + 40]),
          transform: 'skewX(-14deg)', background: `linear-gradient(90deg,transparent,${C.yellow}cc,#fff,${C.yellow}cc,transparent)`, opacity: 0.5}} />) : null)}
      <AbsoluteFill style={{pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg,rgba(0,0,0,.10) 0 2px,transparent 2px 5px)', boxShadow: 'inset 0 0 240px rgba(0,0,0,.55)'}} />
      {flash > 0 && <AbsoluteFill style={{background: '#fff', opacity: flash * 0.45}} />}
    </AbsoluteFill>
  );
};
