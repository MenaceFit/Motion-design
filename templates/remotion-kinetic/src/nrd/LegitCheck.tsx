// « Un seul est vrai » — quiz legit-check pixel-art (style référence ref09/ref10 : quiz vrai/faux,
// personnage pixel, cartes comparatives, HUD de score). Assets : photos fournies par l'utilisateur,
// personnage pixel original (projects/nrd-legit-check/sprite.py). Toutes les dates sont en secondes,
// calées sur les timings mot à mot de la voix (Whisper).
import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import '@fontsource/silkscreen/400.css';
import '@fontsource/silkscreen/700.css';

const F = "'Silkscreen', monospace";
const C = {
  green: '#3ee06a', greenD: '#16a34a', red: '#ff4b55', redD: '#c81e2c', yellow: '#ffd23f', white: '#f4f7ff',
  blue: '#3a7bff', ink: '#050a18', grey: '#9fb0d6',
};
// Configuration (une vidéo = un fichier de config, timings issus de la transcription mot à mot)
export type Sec = {
  n: number; title: string; sub?: string; at: number; end: number; imgs: [string, string];
  fakeAt: number; fakeMarkAt?: number; fakeCap: string; realAt: number; realCap: string; plusAt: number;
  fakeBox: [number, number, number, number]; realBox: [number, number, number, number]; // x,y,w,h (fractions de carte)
  checklist?: [string, number][];
};
export type Cfg = {
  dir: string; duration: number; words: [number, number][]; secs: Sec[]; quizEnd: number;
  intro: {q: number; three: number; counts: [number, number, number]; celui: number; reveal: number; compte: number};
  outro: {alors: number; combien: number; ecris: number; moi: number; p1At: number; revend: number; p2At: number;
    benefAt: number; plugAt: number; dmAt: number; p1: string; p2: string; benef: string; img: string};
  fx?: boolean; // effets « v2 » : focus carte, balayage lumineux, saut du perso, compteurs animés, punch caméra
};
let K: Cfg; // positionné par le composant racine avant le rendu des enfants
const img = (n: string) => staticFile(`${K.dir}/${n}`);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const easeOut = Easing.bezier(0.2, 0.9, 0.3, 1.25);

const speaking = (t: number) => K.words.some(([a, b]) => t >= a && t <= b);

// ——— géométrie ———
const W = 1080, CARD_W = 460, CARD_H = 620, CARD_Y = 420, FLOOR_Y = 1600;
const CARD_X = [W / 2 - CARD_W - 26, W / 2 + 26];

// ——— utilitaires d'affichage ———
const Txt: React.FC<{children: React.ReactNode; size: number; color?: string; style?: React.CSSProperties}> = ({children, size, color = C.white, style}) => (
  <div style={{fontFamily: F, fontWeight: 700, fontSize: size, color, letterSpacing: 2, lineHeight: 1.05,
    textShadow: `${size / 14}px ${size / 14}px 0 ${C.ink}, 0 0 ${size / 3}px rgba(0,0,0,.45)`, ...style}}>{children}</div>
);

type Part = {t: string; c?: string};
/** Texte tapé lettre par lettre + curseur bloc (grammaire des références). */
const Typed: React.FC<{parts: Part[]; at: number; t: number; size: number; cps?: number; style?: React.CSSProperties; cursor?: boolean}> = ({parts, at, t, size, cps = 32, style, cursor = true}) => {
  const total = parts.reduce((s, p) => s + p.t.length, 0);
  const n = Math.max(0, Math.floor((t - at) * cps));
  if (t < at) return null;
  let left = n;
  const done = n >= total;
  return (
    <Txt size={size} style={{textAlign: 'center', ...style}}>
      {parts.map((p, i) => {
        const s = p.t.slice(0, Math.max(0, left)); left -= p.t.length;
        return <span key={i} style={{color: p.c ?? C.white}}>{s}</span>;
      })}
      {cursor && !done ? <span style={{background: C.white, color: 'transparent', marginLeft: 4}}>_</span> : null}
    </Txt>
  );
};

const Chip: React.FC<{label: string; bg: string; fg?: string; size?: number; style?: React.CSSProperties}> = ({label, bg, fg = C.ink, size = 26, style}) => (
  <div style={{fontFamily: F, fontWeight: 700, fontSize: size, color: fg, background: bg, padding: `${size * 0.22}px ${size * 0.5}px`,
    border: `4px solid ${C.ink}`, borderRadius: 6, boxShadow: `4px 4px 0 ${C.ink}`, whiteSpace: 'nowrap', ...style}}>{label}</div>
);

const countUp = (txt: string, t: number, at: number) => { const m = txt.match(/^(\D*)(\d+)(.*)$/);
  return m ? m[1] + Math.round(+m[2] * interpolate(t, [at, at + 0.5], [0, 1], clamp)) + m[3] : txt; };
/** pop : échelle 0 → 1.15 → 1 */
const pop = (t: number, at: number, d = 0.28) => t < at ? 0 : interpolate(t, [at, at + d * 0.6, at + d], [0, 1.18, 1], clamp);

// ——— décor ———
const Stage: React.FC<{t: number; tintL?: number; tintR?: number; green?: number; rays?: number; grid?: number}> = ({t, tintL = 0, tintR = 0, green = 0, rays = 0, grid = 0}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#081230 0%,#0d1d4a 55%,#0a1638 100%)'}}>
      {/* colonnes de lumière */}
      {[0.08, 0.3, 0.5, 0.7, 0.92].map((x, i) => (
        <div key={i} style={{position: 'absolute', left: x * W - 90, top: 0, width: 180, height: FLOOR_Y,
          background: 'linear-gradient(90deg,transparent,rgba(90,140,255,.07),transparent)'}} />
      ))}
      {/* grille "écran" (fin de vidéo) */}
      {grid > 0 && <AbsoluteFill style={{opacity: grid, backgroundImage:
        'linear-gradient(rgba(70,120,255,.18) 2px,transparent 2px),linear-gradient(90deg,rgba(70,120,255,.18) 2px,transparent 2px)',
        backgroundSize: '72px 72px', backgroundPosition: `0 ${(frame * 1.5) % 72}px`}} />}
      {/* rayons */}
      {rays > 0 && <AbsoluteFill style={{opacity: rays, background:
        `repeating-conic-gradient(from ${frame * 0.6}deg at 50% 42%, rgba(255,210,63,.20) 0deg 9deg, transparent 9deg 22deg)`}} />}
      {/* fond vert « bénef » */}
      {green > 0 && <AbsoluteFill style={{opacity: green, background: 'radial-gradient(circle at 50% 40%,#1f9d4a 0%,#0c5a2a 55%,#063218 100%)'}}>
        <AbsoluteFill style={{background:
          `repeating-conic-gradient(from ${frame * 0.5}deg at 50% 40%, rgba(120,255,160,.16) 0deg 10deg, transparent 10deg 24deg)`}} />
      </AbsoluteFill>}
      {/* colonnes teintées vrai / faux derrière les cartes */}
      {[tintL, tintR].map((v, i) => v > 0 ? (
        <div key={i} style={{position: 'absolute', left: CARD_X[i] - 26, top: CARD_Y - 60, width: CARD_W + 52, height: FLOOR_Y - CARD_Y + 60,
          opacity: v, background: i === 0
            ? 'linear-gradient(180deg,rgba(255,60,80,.38),rgba(160,20,40,.28))'
            : 'linear-gradient(180deg,rgba(60,230,110,.38),rgba(20,140,60,.28))'}} />
      ) : null)}
      {/* sol + grille perspective */}
      <div style={{position: 'absolute', left: 0, top: FLOOR_Y, width: W, height: 1920 - FLOOR_Y, background: 'linear-gradient(180deg,#0c1d4d,#050b1e)', overflow: 'hidden'}}>
        {Array.from({length: 7}).map((_, i) => (
          <div key={i} style={{position: 'absolute', left: 0, width: W, top: Math.pow(i / 7, 1.8) * 320, height: 2, background: 'rgba(80,130,255,.25)'}} />
        ))}
        {Array.from({length: 15}).map((_, i) => (
          <div key={'v' + i} style={{position: 'absolute', left: W / 2, top: 0, width: 2, height: 700, background: 'rgba(80,130,255,.18)',
            transformOrigin: 'top', transform: `rotate(${(i - 7) * 11}deg)`}} />
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, top: FLOOR_Y - 2, width: W, height: 4, background: '#5d8dff', boxShadow: '0 0 24px 6px rgba(80,130,255,.55)'}} />
      {/* poussières */}
      {Array.from({length: 26}).map((_, i) => {
        const x = random('dx' + i) * W, y0 = random('dy' + i) * 1700, sp = 0.3 + random('ds' + i) * 0.8;
        const y = (y0 - frame * sp + 1700) % 1700;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 6, height: 6, background: '#8fb1ff', opacity: 0.18 + 0.25 * random('do' + i)}} />;
      })}
    </AbsoluteFill>
  );
};

const Scanlines: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg,rgba(0,0,0,.10) 0 2px,transparent 2px 5px)',
    boxShadow: 'inset 0 0 240px rgba(0,0,0,.55)'}} />
);

// ——— personnage ———
const Character: React.FC<{t: number; pose: string; mark?: string; x?: number; hop?: number}> = ({t, pose, mark, x = W / 2, hop = 0}) => {
  const frame = useCurrentFrame();
  const talk = speaking(t) && Math.floor(frame / 4) % 2 === 0;
  const open: Record<string, string> = {idle: 'talk', point_r_c: 'point_r', cheer_c: 'cheer', shrug_c: 'shrug', wave_c: 'wave'};
  let p = pose;
  if (talk && open[p]) p = open[p];
  if (!talk && p === 'idle' && frame % 96 < 4) p = 'blink';
  const bob = Math.floor(frame / 8) % 2 === 0 ? 0 : 6; // pas de 2 « pixels » : respiration 8-bit
  const w = 280, h = 400;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: FLOOR_Y - h + 6 + bob - hop, width: w, height: h}}>
      <div style={{position: 'absolute', left: 50, top: h - 18 - bob, width: 180, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,.45)'}} />
      <Img src={img(`char_${p}.png`)} style={{width: w, height: h, imageRendering: 'pixelated'}} />
      {mark ? <Txt size={70} color={mark === '!' ? C.red : C.yellow} style={{position: 'absolute', left: w / 2 - 18, top: -80 - (Math.floor(frame / 6) % 2) * 8}}>{mark}</Txt> : null}
    </div>
  );
};

// ——— carte photo ———
const Card: React.FC<{src: string; x: number; t: number; enterAt: number; glow?: string; dissolveAt?: number; dim?: number; focus?: number; sweepAt?: number}> = ({src, x, t, enterAt, glow, dissolveAt, dim = 0, focus = 1, sweepAt}) => {
  const k = interpolate(t, [enterAt, enterAt + 0.35], [0, 1], {...clamp, easing: easeOut});
  const frame = useCurrentFrame();
  const dis = dissolveAt !== undefined ? interpolate(t, [dissolveAt, dissolveAt + 0.25], [1, 0], clamp) : 0;
  return (
    <div style={{position: 'absolute', left: x, top: CARD_Y + (1 - k) * 120, width: CARD_W, height: CARD_H, opacity: k,
      transform: `scale(${(0.8 + 0.2 * k) * focus})`, borderRadius: 16, padding: 12,
      background: 'linear-gradient(160deg,#f2f6ff,#b7c7f0)', border: `5px solid ${glow ?? '#dfe8ff'}`,
      boxShadow: `0 0 0 4px ${C.ink}, 0 20px 50px rgba(0,0,0,.6)${glow ? `, 0 0 46px 6px ${glow}` : ''}`}}>
      <div style={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: 8, background: '#111'}}>
        <Img src={img(src)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: `brightness(${1 - dim})`}} />
        {sweepAt !== undefined && t >= sweepAt && t < sweepAt + 0.6 && <div style={{position: 'absolute', top: -200, width: 160, height: CARD_H + 400,
          left: interpolate(t, [sweepAt, sweepAt + 0.6], [-260, CARD_W + 60]), transform: 'rotate(18deg)',
          background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.75),transparent)', mixBlendMode: 'screen'}} />}
        {/* dissolution en blocs (transition pixel) */}
        {dis > 0 && Array.from({length: 48}).map((_, i) => {
          const on = random(`b${src}${i}${Math.floor(frame / 2)}`) < dis;
          return on ? <div key={i} style={{position: 'absolute', left: (i % 6) * 73, top: Math.floor(i / 6) * 75, width: 74, height: 76,
            background: random(`c${i}${frame}`) > 0.5 ? '#1b2a55' : '#9fb3e8'}} /> : null;
        })}
      </div>
    </div>
  );
};

const Brackets: React.FC<{x: number; box: number[]; color: string; t: number; at: number; arrow?: 'up' | 'down'}> = ({x, box, color, t, at, arrow = 'up'}) => {
  if (t < at) return null;
  const k = interpolate(t, [at, at + 0.2], [1.5, 1], clamp);
  const frame = useCurrentFrame();
  const bx = x + 12 + box[0] * (CARD_W - 24), by = CARD_Y + 12 + box[1] * (CARD_H - 24);
  const bw = box[2] * (CARD_W - 24), bh = box[3] * (CARD_H - 24), L = 40, T = 8;
  const corner = (s: React.CSSProperties) => <div style={{position: 'absolute', width: L, height: L, borderColor: color, borderStyle: 'solid', borderWidth: 0, ...s}} />;
  const bounce = (Math.floor(frame / 5) % 2) * 10;
  return (
    <div style={{position: 'absolute', left: bx, top: by, width: bw, height: bh, transform: `scale(${k})`, filter: `drop-shadow(3px 3px 0 ${C.ink})`}}>
      {corner({left: 0, top: 0, borderLeftWidth: T, borderTopWidth: T})}
      {corner({right: 0, top: 0, borderRightWidth: T, borderTopWidth: T})}
      {corner({left: 0, bottom: 0, borderLeftWidth: T, borderBottomWidth: T})}
      {corner({right: 0, bottom: 0, borderRightWidth: T, borderBottomWidth: T})}
      <div style={{position: 'absolute', left: bw / 2 - 24, top: arrow === 'up' ? bh + 10 + bounce : -70 - bounce, fontFamily: F, fontSize: 56, color, fontWeight: 700}}>
        {arrow === 'up' ? '▲' : '▼'}
      </div>
    </div>
  );
};

const Mark: React.FC<{ok: boolean; x: number; t: number; at: number}> = ({ok, x, t, at}) => {
  const s = pop(t, at);
  if (!s) return null;
  return (
    <div style={{position: 'absolute', left: x + CARD_W - 50, top: CARD_Y - 40, width: 96, height: 96, transform: `scale(${s}) rotate(${ok ? -8 : 8}deg)`,
      borderRadius: 14, background: ok ? C.green : C.red, border: `5px solid ${C.ink}`, boxShadow: `5px 5px 0 ${C.ink}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F, fontWeight: 700, fontSize: 70, color: C.white,
      textShadow: `3px 3px 0 ${C.ink}`}}>{ok ? '✓' : '✗'}</div>
  );
};

const Sparkles: React.FC<{x: number; t: number; at: number}> = ({x, t, at}) => {
  const frame = useCurrentFrame();
  if (t < at || t > at + 1.6) return null;
  const k = (t - at) / 1.6;
  return <>{Array.from({length: 14}).map((_, i) => {
    const a = random('sa' + i) * Math.PI * 2, r = 120 + random('sr' + i) * 260 * k;
    const on = (Math.floor(frame / 3) + i) % 3 !== 0;
    return on ? <div key={i} style={{position: 'absolute', left: x + CARD_W / 2 + Math.cos(a) * r, top: CARD_Y + CARD_H / 2 + Math.sin(a) * r * 1.2,
      fontFamily: F, fontSize: 40, color: i % 2 ? C.yellow : C.white, opacity: 1 - k, fontWeight: 700}}>+</div> : null;
  })}</>;
};

const CardLabel: React.FC<{x: number; text: string; color: string; t: number; at: number}> = ({x, text, color, t, at}) => {
  if (t < at) return null;
  return <Typed parts={[{t: text, c: color}]} at={at} t={t} size={30} cursor={false}
    style={{position: 'absolute', left: x - 30, width: CARD_W + 60, top: CARD_Y + CARD_H + 26}} />;
};

// ——— HUD score ———
const Hud: React.FC<{t: number}> = ({t}) => {
  if (t < K.intro.compte || t > K.quizEnd + 0.4) return null;
  const k = pop(t, K.intro.compte);
  const score = K.secs.filter((s) => t >= s.plusAt).length;
  return (
    <div style={{position: 'absolute', left: W / 2 - 170, top: 110, width: 340, height: 60, transform: `scale(${k})`,
      background: 'rgba(10,20,50,.85)', border: `4px solid ${C.blue}`, borderRadius: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16}}>
      {K.secs.map((s, i) => {
        const on = t >= s.plusAt;
        const cur = t >= s.at && !on;
        return <div key={i} style={{width: 30, height: 30, borderRadius: 6, border: `3px solid ${C.ink}`,
          background: on ? C.green : cur ? C.yellow : '#2a3a66', transform: `scale(${on ? pop(t, s.plusAt) : 1})`}} />;
      })}
      <div style={{fontFamily: F, fontWeight: 700, fontSize: 30, color: C.white, marginLeft: 10}}>{score}/{K.secs.length}</div>
    </div>
  );
};

// ——— cartes intro + quiz ———
const QuizCards: React.FC<{t: number}> = ({t}) => {
  if (t > K.quizEnd + 0.3) return null;
  const out = interpolate(t, [K.quizEnd - 0.1, K.quizEnd + 0.3], [0, 1], clamp);
  const sec = K.secs.find((s) => t >= s.at && t < s.end);
  const intro = t < K.secs[0].at;
  const revealed = t >= K.intro.reveal;
  // compte à rebours : surbrillance alternée
  const countSel = t >= K.intro.counts[0] && t < K.intro.reveal ? (t < K.intro.counts[1] ? 0 : t < K.intro.counts[2] ? 1 : 0) : -1;
  const imgs = intro ? ['full_fake.jpg', 'full_auth.jpg'] : sec!.imgs;
  const enter = intro ? [0.15, 0.3] : [sec!.at, sec!.at + 0.08];
  const fakeOn = intro ? revealed : t >= sec!.fakeAt;
  const realOn = intro ? revealed : t >= sec!.realAt;
  const tags = intro && !revealed ? ['?', '?'] : ['FAUX 1:1', 'VRAI'];
  // focus : la carte commentée grossit, l'autre s'efface (effets v2)
  let focusSide = -1;
  if (K.fx && sec) {
    const ev = ([[0, sec.fakeAt], [1, sec.realAt]] as [number, number][]).filter(([, a]) => t >= a).sort((p, q) => q[1] - p[1])[0];
    if (ev && t < ev[1] + 1.5) focusSide = ev[0];
  }
  const fa = sec ? (focusSide === 0 ? sec.fakeAt : sec.realAt) : 0;
  const fk = (i: number) => focusSide < 0 ? 0 : interpolate(t, [fa, fa + 0.2, fa + 1.3, fa + 1.5], [0, 1, 1, 0], clamp) * (i === focusSide ? 1 : -1);
  return (
    <AbsoluteFill style={{opacity: 1 - out, transform: `translateY(${out * 80}px)`}}>
      {[0, 1].map((i) => {
        const isFake = i === 0;
        const on = isFake ? fakeOn : realOn;
        const glow = countSel === i ? C.yellow : on ? (isFake ? C.red : C.green) : undefined;
        const f = fk(i);
        const sweepAt = K.fx && !isFake ? (intro ? K.intro.reveal : sec!.realAt) : undefined;
        return <Card key={(sec?.n ?? 0) + '-' + i} src={imgs[i]} x={CARD_X[i]} t={t} enterAt={enter[i]} glow={glow}
          dissolveAt={intro ? undefined : sec!.at} dim={(intro && !revealed ? 0 : on && isFake ? 0.1 : 0) + (f < 0 ? -f * 0.45 : 0)}
          focus={1 + (f > 0 ? f * 0.06 : f * 0.03)} sweepAt={sweepAt} />;
      })}
      {/* étiquettes au-dessus des cartes */}
      {[0, 1].map((i) => {
        const at = intro ? (revealed ? K.intro.reveal : 0.5) : sec!.at + 0.15;
        const label = tags[i];
        const bg = label === '?' ? C.yellow : i === 0 ? C.red : C.green;
        return <div key={i} style={{position: 'absolute', left: CARD_X[i], width: CARD_W, top: CARD_Y - 36, display: 'flex', justifyContent: 'center',
          transform: `scale(${pop(t, at)})`}}><Chip label={label} bg={bg} fg={label === '?' ? C.ink : C.white} /></div>;
      })}
      {/* sous les cartes */}
      {intro && !revealed && t >= K.intro.q && <>
        <CardLabel x={CARD_X[0]} text="← GAUCHE" color={countSel === 0 ? C.yellow : C.white} t={t} at={K.intro.q} />
        <CardLabel x={CARD_X[1]} text="DROITE →" color={countSel === 1 ? C.yellow : C.white} t={t} at={K.intro.q + 0.18} />
      </>}
      {intro && revealed && <>
        <CardLabel x={CARD_X[0]} text="LA COPIE" color={C.red} t={t} at={K.intro.reveal + 0.04} />
        <CardLabel x={CARD_X[1]} text="L'AUTHENTIQUE" color={C.green} t={t} at={K.intro.reveal + 0.04} />
        <Mark ok={false} x={CARD_X[0]} t={t} at={K.intro.reveal} />
        <Mark ok x={CARD_X[1]} t={t} at={K.intro.reveal} />
        <Sparkles x={CARD_X[1]} t={t} at={K.intro.reveal} />
      </>}
      {sec && <>
        <Brackets x={CARD_X[0]} box={sec.fakeBox} color={C.red} t={t} at={sec.fakeAt} />
        <Brackets x={CARD_X[1]} box={sec.realBox} color={C.green} t={t} at={sec.realAt} />
        <Mark ok={false} x={CARD_X[0]} t={t} at={sec.fakeMarkAt ?? sec.fakeAt} />
        <Mark ok x={CARD_X[1]} t={t} at={sec.realAt} />
        <Sparkles x={CARD_X[1]} t={t} at={sec.realAt} />
        <CardLabel x={CARD_X[0]} text={sec.fakeCap} color={C.red} t={t} at={sec.fakeAt} />
        <CardLabel x={CARD_X[1]} text={sec.realCap} color={C.green} t={t} at={sec.realAt} />
        {sec.checklist && t < sec.realAt + 0.01 && sec.checklist.map(([s, at], j) => t >= at ? (
          <div key={j} style={{position: 'absolute', left: CARD_X[1], width: CARD_W, display: 'flex', justifyContent: 'center', top: CARD_Y + CARD_H + 24 + j * 62, transform: `scale(${pop(t, at)})`}}>
            <Chip label={'✓ ' + s} bg={C.green} fg={C.white} size={24} />
          </div>) : null)}
      </>}
    </AbsoluteFill>
  );
};

// ——— titres du haut ———
const Titles: React.FC<{t: number}> = ({t}) => {
  const top = 200;
  const box: React.CSSProperties = {position: 'absolute', left: 0, width: W, top};
  if (t < K.intro.three) return <>
    <Typed parts={[{t: 'UN SEUL EST '}, {t: 'VRAI', c: C.green}]} at={0.02} t={t} size={70} style={box} />
    <Typed parts={[{t: 'GAUCHE '}, {t: 'OU', c: C.yellow}, {t: ' DROITE ?'}]} at={K.intro.q} t={t} size={40} style={{...box, top: top + 90}} />
  </>;
  if (t < K.intro.counts[0]) return <>
    <Typed parts={[{t: "T'AS 3 SECONDES !", c: C.yellow}]} at={K.intro.three} t={t} size={64} style={box} />
    <Txt size={40} style={{...box, top: top + 90, textAlign: 'center'}}>GAUCHE <span style={{color: C.yellow}}>OU</span> DROITE ?</Txt>
  </>;
  if (t < K.intro.celui) {
    const n = t < K.intro.counts[1] ? 3 : t < K.intro.counts[2] ? 2 : 1;
    const at = [K.intro.counts[0], K.intro.counts[1], K.intro.counts[2]][3 - n];
    return <>
      <Txt size={150} color={C.yellow} style={{...box, top: top - 70, textAlign: 'center', transform: `scale(${pop(t, at, 0.3)})`}}>{n}</Txt>
      <Txt size={40} style={{...box, top: top + 90, textAlign: 'center'}}>GAUCHE <span style={{color: C.yellow}}>OU</span> DROITE ?</Txt>
      <div style={{position: 'absolute', left: W / 2 - 200, top: top + 150, height: 8, background: C.yellow,
        width: 400 * interpolate(t, [K.intro.counts[0], K.intro.celui], [1, 0], clamp)}} />
    </>;
  }
  if (t < K.intro.compte) return <>
    <Typed parts={[{t: "C'EST CELUI DE"}]} at={K.intro.celui} t={t} size={48} cps={40} style={{...box, top: top - 20}} />
    {t >= K.intro.reveal && <Txt size={96} color={C.green} style={{...box, top: top + 40, textAlign: 'center', transform: `scale(${pop(t, K.intro.reveal)})`}}>DROITE !</Txt>}
  </>;
  if (t < K.secs[0].at) return <Typed parts={[{t: 'COMPTE '}, {t: 'AVEC', c: C.yellow}, {t: ' MOI'}]} at={K.intro.compte} t={t} size={56} style={{...box, top: top + 30}} />;
  const sec = K.secs.find((s) => t >= s.at && t < s.end);
  if (sec) {
    const plus = t >= sec.plusAt && t < sec.plusAt + 0.9;
    return <>
      <div style={{position: 'absolute', left: 0, width: W, top: top - 8, display: 'flex', justifyContent: 'center', transform: `scale(${pop(t, sec.at)})`}}>
        <Chip label={`N°${sec.n}`} bg={C.yellow} size={26} />
      </div>
      <Typed parts={[{t: sec.title}]} at={sec.at + 0.05} t={t} size={sec.sub ? 62 : 68} style={{...box, top: top + 50}} />
      {sec.sub && <Typed parts={[{t: sec.sub, c: C.yellow}]} at={sec.at + 0.4} t={t} size={34} cursor={false} style={{...box, top: top + 122}} />}
      {plus && <Txt size={54} color={C.green} style={{position: 'absolute', left: W / 2 + 190, top: top - 120 - (t - sec.plusAt) * 90, opacity: 1 - (t - sec.plusAt) / 0.9}}>+1</Txt>}
    </>;
  }
  return null;
};

// ——— fin : score, prix, bénef, DM ———
const Outro: React.FC<{t: number}> = ({t}) => {
  const frame = useCurrentFrame();
  if (t < K.quizEnd) return null;
  const top = 230;
  const box: React.CSSProperties = {position: 'absolute', left: 0, width: W, top};
  if (t < K.outro.moi) {
    return <>
      <Typed parts={[{t: 'ALORS...'}]} at={K.outro.alors} t={t} size={60} cps={14} style={box} />
      <Typed parts={[{t: "T'EN AVAIS "}, {t: 'COMBIEN', c: C.yellow}, {t: ' ?'}]} at={K.outro.combien} t={t} size={52} style={{...box, top: top + 80}} />
      {t >= K.outro.combien && <div style={{position: 'absolute', left: W / 2 - 200, top: 560, width: 400, height: 230, transform: `scale(${pop(t, K.outro.combien + 0.1, 0.35)})`,
        background: 'linear-gradient(180deg,#3a2a00,#1d1500)', border: `8px solid ${C.yellow}`, borderRadius: 18, boxShadow: `0 0 0 5px ${C.ink}, 0 0 60px rgba(255,210,63,.6)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Txt size={140} color={C.yellow}>?/{K.secs.length}</Txt>
      </div>}
      {t >= K.outro.ecris && <>
        <Typed parts={[{t: 'ÉCRIS TON SCORE'}]} at={K.outro.ecris} t={t} size={46} style={{...box, top: 880}} />
        <Typed parts={[{t: 'EN COMMENTAIRE', c: C.yellow}]} at={K.outro.ecris + 0.35} t={t} size={46} style={{...box, top: 940}} />
        <div style={{position: 'absolute', left: W / 2 - 150, top: 1020, transform: `scale(${pop(t, K.outro.ecris + 0.6)})`}}>
          <Chip label={`💬  ${K.secs.length}/${K.secs.length} FACILE`} bg="#ffffff" size={30} />
        </div>
      </>}
    </>;
  }
  if (t < K.outro.benefAt) {
    const second = t >= K.outro.revend;
    return <>
      {!second
        ? <Typed parts={[{t: "MOI JE L'AI EU À"}]} at={K.outro.moi} t={t} size={54} style={box} />
        : <Typed parts={[{t: 'IL SE REVEND'}, {t: " JUSQU'À", c: C.yellow}]} at={K.outro.revend} t={t} size={52} style={box} />}
      <div style={{position: 'absolute', left: W / 2 - 250, top: 380, width: 500, height: 660, transform: `scale(${pop(t, K.outro.moi, 0.35)}) rotate(-2deg)`,
        borderRadius: 18, padding: 14, background: 'linear-gradient(160deg,#f2f6ff,#b7c7f0)', border: `6px solid ${C.green}`,
        boxShadow: `0 0 0 5px ${C.ink}, 0 0 60px 6px rgba(62,224,106,.6)`}}>
        <Img src={img(K.outro.img)} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8}} />
        <div style={{position: 'absolute', left: 0, width: '100%', top: -30, display: 'flex', justifyContent: 'center'}}><Chip label="VRAI" bg={C.green} fg={C.white} /></div>
      </div>
      {/* sticker 50 € */}
      {t >= K.outro.p1At && <Sticker t={t} at={K.outro.p1At} x={second ? 150 : 640} y={second ? 900 : 860} text={K.outro.p1} color={C.yellow} strike={second} small={second} />}
      {second && t >= K.outro.p2At && <Sticker t={t} at={K.outro.p2At} x={640} y={820} text={K.outro.p2} color={C.green} />}
    </>;
  }
  if (t < K.outro.plugAt) {
    return <>
      {Array.from({length: 18}).map((_, i) => {
        const x = random('cx' + i) * W, sp = 600 + random('cs' + i) * 500;
        const y = -120 + ((t - K.outro.benefAt) * sp + random('cy' + i) * 900) % 1900;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 54, height: 54, borderRadius: '50%', background: C.yellow,
          border: `5px solid #b8860b`, boxShadow: `3px 3px 0 ${C.ink}`, transform: `scaleX(${Math.abs(Math.cos(frame / 5 + i))})`}} />;
      })}
      {['✓', '✓', '✓', '✓', '✓', '✓'].map((c, i) => (
        <Txt key={i} size={80} color={C.green} style={{position: 'absolute', left: [80, 880, 130, 860, 60, 900][i], top: [420, 380, 820, 860, 1200, 1230][i],
          transform: `scale(${pop(t, K.outro.benefAt + 0.06 + i * 0.07)}) rotate(${(i % 2 ? 12 : -12)}deg)`, background: C.white, borderRadius: 14, padding: '0 14px', textShadow: 'none',
          border: `5px solid ${C.ink}`}}>{c}</Txt>
      ))}
      <Txt size={210} color={C.yellow} style={{...box, top: 520, textAlign: 'center', transform: `scale(${pop(t, K.outro.benefAt, 0.35)})`}}>{K.fx ? countUp(K.outro.benef, t, K.outro.benefAt) : K.outro.benef}</Txt>
      <Txt size={78} style={{...box, top: 790, textAlign: 'center', transform: `scale(${pop(t, K.outro.benefAt + 0.31)})`}}>DE BÉNEF</Txt>
    </>;
  }
  return <>
    <Typed parts={[{t: 'LE '}, {t: 'PLUG', c: C.yellow}, {t: ' ?'}]} at={K.outro.plugAt} t={t} size={96} cps={18} style={{...box, top: 360}} />
    {t >= K.outro.dmAt && <>
      <Txt size={64} style={{...box, top: 560, textAlign: 'center', transform: `scale(${pop(t, K.outro.dmAt)})`}}>ÉCRIS-MOI</Txt>
      <div style={{position: 'absolute', left: W / 2 - 290, top: 680, width: 580, height: 210, transform: `scale(${pop(t, K.outro.dmAt + 0.16, 0.35)})`,
        background: 'linear-gradient(135deg,#5b6cff,#c13cff)', borderRadius: 40, border: `6px solid ${C.ink}`, boxShadow: `8px 8px 0 ${C.ink}, 0 0 60px rgba(150,90,255,.7)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26}}>
        <Txt size={110} style={{whiteSpace: 'nowrap'}}>EN DM</Txt>
      </div>
      <div style={{position: 'absolute', left: W / 2 + 170, top: 860, width: 0, height: 0, borderLeft: '50px solid transparent', borderTop: `60px solid #a54cff`,
        transform: `scale(${pop(t, K.outro.dmAt + 0.16, 0.35)})`}} />
    </>}
  </>;
};

const Sticker: React.FC<{t: number; at: number; x: number; y: number; text: string; color: string; strike?: boolean; small?: boolean}> = ({t, at, x, y, text, color, strike, small}) => {
  const s = pop(t, at, 0.32) * (small ? 0.7 : 1);
  const frame = useCurrentFrame();
  if (K.fx) { const m = text.match(/^(\D*)(\d+)(.*)$/); if (m) text = m[1] + Math.round(+m[2] * interpolate(t, [at, at + 0.45], [0.15, 1], clamp)) + m[3]; }
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 300, height: 300, transform: `scale(${s}) rotate(${-10 + Math.sin(frame / 8) * 3}deg)`}}>
      <div style={{position: 'absolute', inset: 0, background: color, border: `6px solid ${C.ink}`,
        clipPath: 'polygon(50% 0%,61% 12%,76% 6%,80% 22%,96% 24%,90% 39%,100% 50%,90% 61%,96% 76%,80% 78%,76% 94%,61% 88%,50% 100%,39% 88%,24% 94%,20% 78%,4% 76%,10% 61%,0% 50%,10% 39%,4% 24%,20% 22%,24% 6%,39% 12%)'}} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F, fontWeight: 700, fontSize: 92,
        color: C.ink, textDecoration: strike ? 'line-through' : 'none', textDecorationThickness: 10, textDecorationColor: C.red}}>{text}</div>
    </div>
  );
};

// ——— poses du personnage ———
function poseAt(t: number): {pose: string; mark?: string} {
  if (t < K.intro.q - 0.02) return {pose: 'wave_c'};
  if (t < K.intro.three - 0.03) return {pose: 'idle'};
  if (t < K.intro.celui - 0.03) return {pose: 'think', mark: '?'};
  if (t < K.intro.compte - 0.06) return {pose: 'point_r_c', mark: t < K.intro.reveal + 0.24 ? '!' : undefined};
  if (t < K.quizEnd) {
    const sec = K.secs.find((s) => t >= s.at && t < s.end);
    if (sec) {
      if (t >= sec.fakeAt && t < sec.fakeAt + 1.3) return {pose: 'point_l', mark: t < sec.fakeAt + 0.6 ? '!' : undefined};
      if (t >= sec.realAt && t < sec.realAt + 1.3) return {pose: 'point_r_c'};
      if (sec.checklist && t >= sec.checklist[0][1] - 0.04 && t < sec.realAt) return {pose: 'think'};
    }
    return {pose: 'idle'};
  }
  if (t < K.outro.alors - 0.06) return {pose: 'idle'};
  if (t < K.outro.ecris) return {pose: 'shrug_c', mark: t > K.outro.combien ? '?' : undefined};
  if (t < K.outro.moi) return {pose: 'idle'};
  if (t < K.outro.benefAt) return {pose: t > K.outro.p2At ? 'cheer_c' : 'point_r_c'};
  if (t < K.outro.plugAt) return {pose: 'cheer_c'};
  return {pose: 'wave_c'};
}

export const LegitCheck: React.FC<{cfg: Cfg}> = ({cfg}) => {
  K = cfg;
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const sec = K.secs.find((s) => t >= s.at && t < s.end);
  const introTint = t >= K.intro.reveal && t < K.secs[0].at ? interpolate(t, [K.intro.reveal, K.intro.reveal + 0.24], [0, 1], clamp) : 0;
  const tintL = sec ? interpolate(t, [sec.fakeAt, sec.fakeAt + 0.2], [0, 1], clamp) : introTint;
  const tintR = sec ? interpolate(t, [sec.realAt, sec.realAt + 0.2], [0, 1], clamp) : introTint;
  const outro = t >= K.quizEnd;
  const rays = t >= K.outro.combien && t < K.outro.moi ? interpolate(t, [K.outro.combien, K.outro.combien + 0.3], [0, 1], clamp) : 0;
  const grid = outro && (t < K.outro.combien || (t >= K.outro.moi && t < K.outro.benefAt) || t >= K.outro.plugAt) ? 1 : 0;
  const green = t >= K.outro.benefAt && t < K.outro.plugAt ? interpolate(t, [K.outro.benefAt, K.outro.benefAt + 0.16], [0, 1], clamp) : 0;
  // flash blanc sur les coupes fortes
  const flashes = [K.intro.reveal, ...K.secs.map((x) => x.at), K.outro.combien, K.outro.moi, K.outro.benefAt, K.outro.plugAt];
  const flash = Math.max(0, ...flashes.map((a) => (t >= a && t < a + 0.12 ? 1 - (t - a) / 0.12 : 0)));
  const {pose, mark} = poseAt(t);
  const hopAt = K.fx ? [K.intro.reveal, ...K.secs.map((x) => x.realAt), K.outro.benefAt].find((a) => t >= a && t < a + 0.4) : undefined;
  const hop = hopAt !== undefined ? Math.sin(((t - hopAt) / 0.4) * Math.PI) * 60 : 0;
  const punchAt = K.fx ? flashes.filter((a) => t >= a && t < a + 0.35).pop() : undefined;
  const punch = punchAt !== undefined ? interpolate(t, [punchAt, punchAt + 0.35], [1.045, 1], {...clamp, easing: Easing.out(Easing.cubic)}) : 1;
  const shake = [K.intro.reveal, K.outro.combien + 0.1, K.outro.benefAt].some((a) => t >= a && t < a + 0.2) ? (random(frame) - 0.5) * 16 : 0;
  return (
    <AbsoluteFill style={{background: '#081230', transform: `translate(${shake}px, ${shake * 0.6}px) scale(${punch})`}}>
      <Stage t={t} tintL={outro ? 0 : tintL} tintR={outro ? 0 : tintR} rays={rays} grid={grid} green={green} />
      <QuizCards t={t} />
      <Titles t={t} />
      <Hud t={t} />
      <Outro t={t} />
      <Character t={t} pose={pose} mark={mark} hop={hop} />
      {/* barre de progression (haut) */}
      <div style={{position: 'absolute', left: 0, top: 0, height: 10, width: (W * frame) / durationInFrames, background: C.blue, boxShadow: `0 0 14px ${C.blue}`}} />
      <Scanlines />
      {flash > 0 && <AbsoluteFill style={{background: '#fff', opacity: flash * 0.5}} />}
    </AbsoluteFill>
  );
};
