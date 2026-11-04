// Style « Spotlight Noir » — principes tirés de ref09/ref10 (analyse : references/visual-styles/spotlight-noir.md).
// Studio gris sombre + projecteurs, pictogrammes originaux, UNE couleur d'accent acide, HUD tapé,
// sous-titre en boîte blanche qui grandit mot à mot, caméra qui pousse / punch sur les mots-clés,
// transitions whip pan (flou directionnel), zoom traversant, glitch → flash gris → carte mot-clé néon.
// Tout est en SVG/HTML 2D (rendu rapide, déterministe). Temps en secondes, relatifs au début du plan.
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/anton/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/800.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';

// ---------- types ----------
export type Cap = {text: string; start: number; end: number; line: number; accent?: boolean; stop?: boolean};
export type Shot = {type: string; start: number; end: number; in?: 'whip' | 'zoom' | 'glitch' | 'flash' | 'cut'; dir?: number;
  hud?: string; push?: number; noCaption?: boolean; [k: string]: any};
export type NoirProps = {title?: string; captions: Cap[]; shots: Shot[]; audio?: string; accent?: string;
  duration: number; progressBar?: boolean; seed?: number};

// ---------- mise en page (1080×1920) ----------
const W = 1080, STAGE_Y = 470, STAGE_H = 1080; // scène carrée ; 370 px libres en bas pour l'UI TikTok
const FLOOR = 760; // ligne de sol dans la scène
const MONO = 'Space Grotesk, DejaVu Sans Mono, monospace';

// ---------- maths ----------
const cl = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const eOut = (x: number) => 1 - Math.pow(1 - cl(x), 3);
const eIn = (x: number) => Math.pow(cl(x), 3);
const eIO = (x: number) => {x = cl(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;};
const expo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * cl(x)));
const back = (x: number, s = 1.9) => {x = cl(x) - 1; return 1 + (s + 1) * x * x * x + s * x * x;};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rng = (seed: number) => () => {seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296;};
const hash = (n: number) => rng(n * 7919 + 13)();
// valeur animée « pop » (0→1 avec dépassement) démarrant à `at`
const pop = (lt: number, at: number, d = .32) => back((lt - at) / d);
const typed = (s: string, lt: number, at: number, cps = 30) => s.slice(0, Math.max(0, Math.floor((lt - at) * cps)));

// ---------- éléments de base ----------
export const Person: React.FC<{x: number; y: number; h?: number; color?: string; outline?: boolean; kind?: 'm' | 'f';
  pose?: string; t?: number; flip?: boolean; opacity?: number; glow?: string}> = ({x, y, h = 210, color = '#f2f2f2', outline,
  kind = 'm', pose = 'stand', t = 0, flip, opacity = 1, glow}) => {
  const s = h / 160;
  const fill = outline ? '#0e0e0e' : color, stroke = outline ? color : 'none', sw = outline ? 3.2 / s : 0;
  const moving = pose === 'walk' || pose === 'run';
  const ph = Math.sin(t * (pose === 'run' ? 15 : 9));
  const leg = moving ? ph * (pose === 'run' ? 30 : 17) : 0;
  const armR = pose === 'wave' ? -155 + Math.sin(t * 16) * 16 : pose === 'push' ? -78 : pose === 'point' ? -92
    : pose === 'shrug' ? -40 : moving ? -ph * (pose === 'run' ? 40 : 22) : 5;
  const armL = pose === 'shrug' ? 40 : pose === 'push' ? -70 : moving ? ph * (pose === 'run' ? 40 : 22) : -5;
  const bob = moving ? -Math.abs(Math.cos(t * (pose === 'run' ? 15 : 9))) * 4 : 0;
  const lean = pose === 'run' ? 9 : pose === 'push' ? 14 : pose === 'back' ? -8 : 0;
  const p = {fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' as const};
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} opacity={opacity}
      style={glow ? {filter: `drop-shadow(0 0 ${10 / s}px ${glow})`} : undefined}>
      <g transform={`translate(0 ${bob}) rotate(${lean} 0 -70)`}>
        <rect x={-13} y={-74} width={11} height={74} rx={5.5} transform={`rotate(${leg} -7.5 -70)`} {...p} />
        <rect x={2} y={-74} width={11} height={74} rx={5.5} transform={`rotate(${-leg} 7.5 -70)`} {...p} />
        <rect x={-27} y={-125} width={10} height={58} rx={5} transform={`rotate(${armL} -22 -120)`} {...p} />
        {kind === 'f'
          ? <path d="M-16 -128 Q0 -133 16 -128 L28 -62 Q0 -56 -28 -62 Z" {...p} />
          : <path d="M-19 -128 Q0 -133 19 -128 L15 -66 Q0 -62 -15 -66 Z" {...p} />}
        <rect x={17} y={-125} width={10} height={58} rx={5} transform={`rotate(${armR} 22 -120)`} {...p} />
        <circle cx={0} cy={-148} r={14.5} {...p} />
        {kind === 'f' && <path d="M-15 -150 Q-19 -132 -12 -126 L-9 -140 Z" {...p} />}
      </g>
    </g>);
};

// fond de studio : mur, sol, projecteur(s) volumétriques, poussières
const Studio: React.FC<{lights?: {x: number; on?: number; w?: number; color?: string}[]; t: number; dark?: boolean; accent: string}> = ({lights = [], t, dark}) => (
  <svg width={W} height={STAGE_H} style={{position: 'absolute', inset: 0}}>
    <defs>
      <radialGradient id="wall" cx="50%" cy="38%" r="75%"><stop offset="0" stopColor={dark ? '#141414' : '#2c2c2c'} /><stop offset="1" stopColor="#070707" /></radialGradient>
      <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={dark ? '#101010' : '#1f1f1f'} /><stop offset="1" stopColor="#0a0a0a" /></linearGradient>
      <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".26" /><stop offset="1" stopColor="#fff" stopOpacity=".04" /></linearGradient>
      <radialGradient id="pool"><stop offset="0" stopColor="#fff" stopOpacity=".42" /><stop offset=".6" stopColor="#fff" stopOpacity=".1" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
      <filter id="soft" x="-30%" y="-10%" width="160%" height="130%"><feGaussianBlur stdDeviation="16" /></filter>
    </defs>
    <rect width={W} height={STAGE_H} fill="url(#wall)" />
    {!dark && <>
      <rect x={60} y={90} width={300} height={FLOOR - 90} fill="#ffffff" opacity={.025} />
      <rect x={720} y={140} width={260} height={FLOOR - 140} fill="#ffffff" opacity={.02} />
    </>}
    <rect y={FLOOR} width={W} height={STAGE_H - FLOOR} fill="url(#floor)" />
    <rect y={FLOOR - 1} width={W} height={3} fill="#fff" opacity={.06} filter="url(#soft)" />
    {lights.map((l, i) => {
      const on = l.on ?? 1, w = l.w ?? 190;
      return (
        <g key={i} opacity={on}>
          <polygon points={`${l.x - 26},-20 ${l.x + 26},-20 ${l.x + w},${FLOOR + 40} ${l.x - w},${FLOOR + 40}`} fill="url(#cone)" filter="url(#soft)" />
          <ellipse cx={l.x} cy={FLOOR + 40} rx={w * 1.25} ry={w * .3} fill="url(#pool)" />
          {Array.from({length: 18}).map((_, k) => {
            const r = rng(k * 31 + i * 7 + 5); const yy = (r() * FLOOR + t * (8 + r() * 14)) % FLOOR;
            const xx = l.x + (r() - .5) * (52 + (w * 2 - 52) * yy / FLOOR) * .85 + Math.sin(t * .7 + k) * 6;
            return <circle key={k} cx={xx} cy={yy} r={1 + r() * 1.6} fill="#fff" opacity={.18 + .25 * Math.sin(t * 1.3 + k) ** 2} />;
          })}
        </g>);
    })}
  </svg>
);

const Tag: React.FC<{x: number; y: number; text: string; p: number; accent?: string; to?: [number, number]}> = ({x, y, text, p, accent, to}) => (
  <g opacity={cl(p * 3)}>
    {to && <line x1={x} y1={y} x2={lerp(x, to[0], cl(p))} y2={lerp(y, to[1], cl(p))} stroke={accent || '#fff'} strokeWidth={2} opacity={.7} />}
    <g transform={`translate(${x} ${y}) scale(${.6 + .4 * cl(back(p))})`}>
      <rect x={-text.length * 9.5 - 14} y={-24} width={text.length * 19 + 28} height={44} fill={accent || '#fff'} />
      <text x={0} y={9} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={26} letterSpacing={1.5} fill="#0b0b0b">{text}</text>
    </g>
  </g>
);

// ---------- plans ----------
type SP = {s: Shot; lt: number; accent: string; fps: number};

// position animée d'un personnage : moves = [{at, to, dur, pose}]
const figState = (f: any, lt: number) => {
  let x = f.x ?? 540, pose = f.pose || 'stand', flip = !!f.flip, moving = false;
  for (const m of f.moves || []) {
    const d = m.dur ?? .8;
    if (lt >= m.at) {
      const k = (lt - m.at) / d; const nx = lerp(x, m.to, m.ease === 'lin' ? cl(k) : eIO(k));
      if (k < 1) {moving = true; pose = m.pose || (Math.abs(m.to - x) > 250 / d ? 'run' : 'walk'); flip = m.to < x;}
      else if (m.face !== undefined) flip = m.face === 'left';
      x = nx;
    }
  }
  if (f.flipAt !== undefined && lt >= f.flipAt) flip = !f.flip;
  if (f.poseAt && lt >= f.poseAt.at && !moving) pose = f.poseAt.pose;
  return {x, pose, flip};
};

const SpotlightShot: React.FC<SP> = ({s, lt, accent}) => {
  const lights = (s.lights || [{x: 540}]).map((l: any) => {
    const k = l.at !== undefined ? eIO((lt - l.at) / (l.dur ?? .9)) : 0;
    const flick = l.flickerAt !== undefined ? (lt < l.flickerAt ? 0 : lt < l.flickerAt + .25 ? (Math.floor((lt - l.flickerAt) * 30) % 3 ? 1 : .15) : 1) : 1;
    return {x: l.to !== undefined ? lerp(l.x, l.to, k) : l.x, w: l.w, on: flick * (l.offAt !== undefined ? 1 - cl((lt - l.offAt) / .3) : 1)};
  });
  return (
    <>
      <Studio lights={lights} t={lt} accent={accent} />
      <svg width={W} height={STAGE_H} style={{position: 'absolute', inset: 0}}>
        {(s.figures || []).map((f: any, i: number) => {
          const st = figState(f, lt);
          const appear = f.dropAt !== undefined ? cl((lt - f.dropAt) / .25) : 1;
          const y = FLOOR + 40 + (f.dy || 0) - (1 - eOut(appear)) * 60;
          const hero = f.hero; const col = hero ? accent : f.color || '#efefef';
          return (
            <g key={i} opacity={appear}>
              {hero && <ellipse cx={st.x} cy={FLOOR + 44 + (f.dy || 0)} rx={85 + Math.sin(lt * 4) * 6} ry={16} fill="none" stroke={accent} strokeWidth={3} opacity={.55} />}
              <Person x={st.x} y={y} h={f.h || 300} color={col} outline={f.outline} kind={f.kind} pose={st.pose} t={lt + i} flip={st.flip} glow={hero ? accent : undefined}
                opacity={f.dimAt !== undefined ? 1 - .75 * cl((lt - f.dimAt) / .4) : 1} />
            </g>);
        })}
        {(s.tags || []).map((g: any, i: number) => <Tag key={i} x={g.x} y={g.y} text={g.text} p={(lt - g.at) / .3} accent={g.accent ? accent : undefined} to={g.to} />)}
      </svg>
    </>);
};

const CrowdShot: React.FC<SP> = ({s, lt, accent}) => {
  const rows = s.rows || 3, per = s.per || 7, heroI = s.hero ?? Math.floor(per / 2);
  const els: JSX.Element[] = [];
  for (let r = 0; r < rows; r++) {
    const depth = rows - 1 - r, sc = 1 - depth * .2, y = FLOOR + 60 - depth * 70;
    for (let c = 0; c < per; c++) {
      const isHero = r === rows - 1 && c === heroI;
      const x = 540 + (c - (per - 1) / 2) * 135 * sc + (r % 2 ? 30 : 0);
      const d = (r * per + c) * .035;
      const app = cl((lt - d) / .2);
      const leave = s.leaveAt !== undefined && !isHero ? cl((lt - s.leaveAt - hash(r * 9 + c) * .6) / .7) : 0;
      const dim = s.focusAt !== undefined && !isHero ? 1 - .8 * cl((lt - s.focusAt) / .35) : 1;
      els.push(<Person key={`${r}-${c}`} x={x + (x < 540 ? -1 : 1) * eIn(leave) * 700} y={y + (1 - eOut(app)) * 40} h={250 * sc}
        color={isHero ? accent : depth ? '#8a8a8a' : '#e6e6e6'} outline={!isHero && depth === 0 && s.outline} pose={leave > 0 && leave < 1 ? 'walk' : 'stand'}
        t={lt + c} flip={x < 540} opacity={app * dim * (1 - leave * .2)} glow={isHero ? accent : undefined} />);
    }
  }
  const fp = s.focusAt !== undefined ? eOut((lt - s.focusAt) / .45) : 0;
  const hx = 540 + (heroI - (per - 1) / 2) * 135;
  return (
    <>
      <Studio lights={[{x: lerp(540, hx, fp), w: lerp(420, 150, fp)}]} t={lt} accent={accent} />
      <svg width={W} height={STAGE_H} style={{position: 'absolute', inset: 0}}>
        {els}
        {fp > 0 && <g transform={`translate(${hx} ${FLOOR - 70}) rotate(${lt * 40})`} opacity={fp}>
          <circle r={lerp(240, 120, fp)} fill="none" stroke={accent} strokeWidth={3} strokeDasharray="14 10" />
        </g>}
        {s.label && <Tag x={hx} y={FLOOR - 300} text={s.label} p={(lt - (s.focusAt ?? .3)) / .3} accent to={[hx, FLOOR - 230]} />}
      </svg>
    </>);
};

const VersusShot: React.FC<SP> = ({s, lt, accent}) => {
  const rows = s.rows || [];
  return (
    <>
      <Studio lights={[{x: 190, w: 150}, {x: 890, w: 170}]} t={lt} accent={accent} />
      <svg width={W} height={STAGE_H} style={{position: 'absolute', inset: 0}}>
        <Person x={190} y={FLOOR + 40} h={300} color={accent} glow={accent} t={lt} />
        {[-60, 0, 60].map((dx, i) => <Person key={i} x={890 + dx} y={FLOOR + 40 - (i === 1 ? 0 : 18)} h={i === 1 ? 300 : 260} outline color="#eee" t={lt + i} />)}
        <text x={190} y={200} textAnchor="middle" fontFamily="Anton" fontSize={64} fill={accent} opacity={cl(lt / .2)}>{s.left || 'TOI'}</text>
        <text x={890} y={200} textAnchor="middle" fontFamily="Anton" fontSize={64} fill="#fff" opacity={cl(lt / .2)}>{s.right || 'EUX'}</text>
        <text x={540} y={210} textAnchor="middle" fontFamily="Anton" fontSize={130 * (.7 + .3 * pop(lt, .05))} fill="#fff" opacity={cl(lt / .1)}>VS</text>
        <g transform="translate(540 330) scale(1.3)">
          <rect x={-170} y={-40} width={340} height={rows.length * 92 + 40} fill="#0c0c0c" stroke="#3a3a3a" strokeWidth={2} opacity={cl(lt / .2)} />
          {rows.map((r: any, i: number) => {
            const at = r.at ?? .25 + i * .3; const k = expo((lt - at) / .7);
            return (
              <g key={i} transform={`translate(0 ${i * 92})`} opacity={cl((lt - at + .15) / .15)}>
                <text x={0} y={0} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={24} letterSpacing={4} fill="#bdbdbd">{r.label}</text>
                <rect x={-150} y={14} width={140} height={20} fill="#222" /><rect x={-10 - 140 * r.a * k} y={14} width={140 * r.a * k} height={20} fill={accent} />
                <rect x={10} y={14} width={140} height={20} fill="#222" /><rect x={10} y={14} width={140 * r.b * k} height={20} fill="#fff" />
                {r.eq && k > .95 && <text x={0} y={70} textAnchor="middle" fontFamily={MONO} fontSize={22} fill={accent}>=</text>}
              </g>);
          })}
        </g>
      </svg>
    </>);
};

const GaugeShot: React.FC<SP> = ({s, lt, accent}) => {
  const from = s.from ?? 0, to = s.to ?? 100, at = s.at ?? .25, d = s.dur ?? 1.1;
  const k = eIO((lt - at) / d);
  const jit = k >= 1 ? Math.sin(lt * 37) * 1.4 + Math.sin(lt * 23) * 1.1 : 0;
  const v = lerp(from, to, k) + jit, max = s.max ?? 100;
  const a0 = -225, a1 = 45, ang = a0 + (a1 - a0) * cl(v / max, 0, 1.08);
  const R = 250, cx = 540, cy = 470;
  const pt = (a: number, r: number) => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
  const arc = (b: number, e: number, r: number) => {const [x0, y0] = pt(b, r), [x1, y1] = pt(e, r); return `M${x0} ${y0} A${r} ${r} 0 ${e - b > 180 ? 1 : 0} 1 ${x1} ${y1}`;};
  const ent = pop(lt, 0, .35);
  const hot = s.danger && v > max * .8;
  return (
    <>
      <Studio lights={[{x: 540, w: 330}]} t={lt} accent={accent} dark />
      <svg width={W} height={STAGE_H} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(${cx} ${cy}) scale(${.6 + .4 * ent}) translate(${-cx} ${-cy})`} opacity={cl(lt / .12)}>
          <circle cx={cx} cy={cy} r={R + 40} fill="#0d0d0d" stroke="#3b3b3b" strokeWidth={3} />
          {Array.from({length: 28}).map((_, i) => {const a = a0 + (a1 - a0) * i / 27; const [x0, y0] = pt(a, R + 18), [x1, y1] = pt(a, R + (i % 3 ? 4 : -8));
            return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={i / 27 <= v / max ? accent : '#555'} strokeWidth={i % 3 ? 3 : 6} />;})}
          <path d={arc(a0, a1, R - 22)} stroke="#262626" strokeWidth={26} fill="none" />
          {v > 0 && <path d={arc(a0, Math.max(a0 + .1, ang), R - 22)} stroke={hot ? '#ff3b3b' : accent} strokeWidth={26} fill="none" style={{filter: `drop-shadow(0 0 14px ${hot ? '#ff3b3b' : accent})`}} />}
          <g transform={`rotate(${ang} ${cx} ${cy})`}>
            <polygon points={`${cx},${cy - 9} ${cx + R - 40},${cy} ${cx},${cy + 9}`} fill="#fff" />
          </g>
          <circle cx={cx} cy={cy} r={20} fill="#fff" />
          <text x={cx} y={cy + 175} textAnchor="middle" fontFamily="Anton" fontSize={120} fill={hot ? '#ff3b3b' : accent}>{Math.round(v)}{s.unit ?? '%'}</text>
          <text x={cx} y={cy - 95} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={30} letterSpacing={8} fill="#cfcfcf">{s.label}</text>
        </g>
      </svg>
    </>);
};

const ecg = (u: number) => { // forme PQRST normalisée sur une période [0,1)
  u = ((u % 1) + 1) % 1;
  const g = (c: number, w: number, a: number) => a * Math.exp(-((u - c) ** 2) / (2 * w * w));
  return g(.18, .025, .12) - g(.3, .008, .18) + g(.33, .012, 1) - g(.36, .01, .3) + g(.55, .04, .22);
};
const HeartShot: React.FC<SP> = ({s, lt, accent}) => {
  const from = s.from ?? 70, to = s.to ?? 120, k = eIO((lt - (s.at ?? .3)) / (s.dur ?? 1.6));
  const bpm = lerp(from, to, k);
  // phase intégrée (fréquence variable) : intégrale numérique simple
  const phaseAt = (tt: number) => {let p = 0; const n = 40; for (let i = 0; i < n; i++) {const ti = tt * i / n; p += lerp(from, to, eIO((ti - (s.at ?? .3)) / (s.dur ?? 1.6))) / 60 * tt / n;} return p;};
  const ph = phaseAt(lt);
  const x0 = 150, x1 = 930, y0 = 470, span = 2.6; // 2,6 battements visibles
  const pts: string[] = [];
  const head = cl(lt / .9);
  for (let i = 0; i <= 260; i++) {const u = i / 260; if (u > head) break; const x = lerp(x0, x1, u);
    pts.push(`${x.toFixed(1)},${(y0 - ecg(ph - span * (head - u)) * 230).toFixed(1)}`);}
  const hot = bpm > (s.hot ?? 110);
  const col = hot ? '#ff3b3b' : accent;
  return (
    <>
      <Studio lights={[{x: 540, w: 360}]} t={lt} accent={accent} dark />
      <svg width={W} height={STAGE_H} style={{position: 'absolute', inset: 0}}>
        <g opacity={cl(lt / .15)} transform={`translate(540 470) scale(${.85 + .15 * pop(lt, 0)}) translate(-540 -470)`}>
          <rect x={110} y={200} width={860} height={520} rx={26} fill="#0b0b0b" stroke="#3a3a3a" strokeWidth={3} />
          {Array.from({length: 13}).map((_, i) => <line key={i} x1={110 + i * 66} y1={200} x2={110 + i * 66} y2={720} stroke="#fff" opacity={.05} />)}
          {Array.from({length: 8}).map((_, i) => <line key={i} x1={110} y1={200 + i * 65} x2={970} y2={200 + i * 65} stroke="#fff" opacity={.05} />)}
          <polyline points={pts.join(' ')} fill="none" stroke={col} strokeWidth={6} strokeLinejoin="round" style={{filter: `drop-shadow(0 0 10px ${col})`}} />
          {pts.length > 0 && <circle cx={+pts[pts.length - 1].split(',')[0]} cy={+pts[pts.length - 1].split(',')[1]} r={11} fill="#fff" />}
          <text x={150} y={262} fontFamily={MONO} fontWeight={700} fontSize={28} letterSpacing={6} fill="#cfcfcf">{s.label}</text>
          <text x={930} y={300} textAnchor="end" fontFamily="Anton" fontSize={110} fill={col}>{Math.round(bpm)}</text>
          <text x={930} y={340} textAnchor="end" fontFamily={MONO} fontSize={24} letterSpacing={4} fill="#9a9a9a">BPM</text>
        </g>
      </svg>
    </>);
};

const ChatShot: React.FC<SP> = ({s, lt, accent}) => {
  const msgs = s.msgs || [];
  const ent = eOut(lt / .45);
  const tilt = s.tilt ?? 1;
  const leaveK = s.leaveAt !== undefined ? eIn((lt - s.leaveAt) / .5) : 0;
  let y = 150;
  return (
    <>
      <Studio lights={[{x: 540, w: 300}]} t={lt} accent={accent} dark />
      <div style={{position: 'absolute', inset: 0, perspective: 1600}}>
        <div style={{position: 'absolute', left: 540 - 230, top: 90, width: 460, height: 900, borderRadius: 64, background: '#121212',
          border: '4px solid #3c3c3c', boxShadow: `0 60px 120px rgba(0,0,0,.8), 0 0 0 10px #0a0a0a`,
          transform: `translateY(${(1 - ent) * 500 + leaveK * 900}px) rotateX(${(16 - 6 * ent) * tilt}deg) rotateZ(${(-9 + 3 * ent) * tilt + leaveK * 20}deg) rotateY(${8 * tilt}deg)`,
          overflow: 'hidden'}}>
          <div style={{height: 110, borderBottom: '2px solid #262626', display: 'flex', alignItems: 'center', gap: 18, padding: '30px 30px 0'}}>
            <div style={{width: 54, height: 54, borderRadius: 27, background: '#d9d9d9'}} />
            <div style={{fontFamily: MONO, fontWeight: 700, color: '#eee', fontSize: 28, letterSpacing: 3}}>{s.name || 'ELLE'}</div>
          </div>
          {msgs.map((m: any, i: number) => {
            const p = pop(lt, m.at ?? .4 + i * .45, .3); const me = m.from !== 'her';
            const lines = Math.ceil(m.text.length / 16); const h = 30 + lines * 40; const top = y; y += h + 22;
            if (p <= 0) return null;
            return (
              <div key={i} style={{position: 'absolute', top: top + 30, [me ? 'right' : 'left']: 28, maxWidth: 390, padding: '15px 24px',
                borderRadius: 30, background: me ? accent : '#2c2c2c', color: me ? '#0b0b0b' : '#f2f2f2', fontFamily: 'Inter', fontWeight: 600,
                fontSize: 31, lineHeight: '40px', transform: `scale(${p})`, transformOrigin: me ? 'right bottom' : 'left bottom', opacity: cl(p * 2)}}>{m.text}</div>);
          })}
          {s.seen && lt > s.seen.at && <div style={{position: 'absolute', top: y + 24, right: 34, fontFamily: MONO, fontSize: 22, color: '#8d8d8d', letterSpacing: 2,
            opacity: cl((lt - s.seen.at) / .2)}}>{typed(s.seen.text || 'VU', lt, s.seen.at, 24)}</div>}
          {s.typingAt !== undefined && lt > s.typingAt && <div style={{position: 'absolute', top: y + 30, left: 28, padding: '16px 22px', borderRadius: 30, background: '#2c2c2c', display: 'flex', gap: 9}}>
            {[0, 1, 2].map(k => <div key={k} style={{width: 13, height: 13, borderRadius: 7, background: '#cfcfcf', opacity: .35 + .65 * Math.max(0, Math.sin(lt * 9 - k * .9))}} />)}
          </div>}
        </div>
      </div>
    </>);
};

const CounterShot: React.FC<SP> = ({s, lt, accent}) => {
  const k = eIO((lt - (s.at ?? .2)) / (s.dur ?? .9));
  const v = Math.round(lerp(s.from ?? 0, s.to ?? 100, k));
  const changed = Math.abs(lerp(s.from ?? 0, s.to ?? 100, k) - v) < .5 && k < 1 && k > 0;
  return (
    <>
      <Studio lights={[{x: 540, w: 280}]} t={lt} accent={accent} dark />
      <svg width={W} height={STAGE_H} style={{position: 'absolute', inset: 0}}>
        <text x={540} y={600} textAnchor="middle" fontFamily="Anton" fontSize={460 * (.8 + .2 * pop(lt, 0)) * (changed ? 1.015 : 1)} fill={accent}
          style={{filter: `drop-shadow(0 0 30px ${accent}88)`}}>{(s.prefix || '') + v + (s.suffix || '')}</text>
        <text x={540} y={700} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={34} letterSpacing={10} fill="#d0d0d0">{typed(s.label || '', lt, .3, 26)}</text>
      </svg>
    </>);
};

// carte mot-clé : lettres qui s'allument comme un néon défaillant, flash, étincelles, sous-titre tapé
const KeywordShot: React.FC<SP> = ({s, lt, accent}) => {
  const word: string = s.word || '';
  const letters = word.split('');
  const r = rng(word.length * 97 + (s.seed || 1));
  const onsets = letters.map(() => r() * .3);
  const full = .38;
  const allOn = lt >= full;
  const fs = Math.min(300, 1500 / Math.max(3, word.length * .62 + 1));
  const burst = cl((lt - full) / .7);
  const sparks = Array.from({length: 26}).map((_, i) => {const q = rng(i * 13 + 7); return {a: -Math.PI * (q() * .9 + .05), v: 260 + q() * 520, x: (q() - .5) * fs * word.length * .5, sz: 2 + q() * 4};});
  const punch = allOn ? 1 + .05 * (1 - eOut((lt - full) / .25)) : 1;
  return (
    <>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 52%, ${allOn ? accent + '22' : '#ffffff08'} 0%, #050505 55%)`}} />
      <svg width={W} height={STAGE_H} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(540 560) scale(${punch})`}>
          <text textAnchor="middle" fontFamily="Anton" fontSize={fs} letterSpacing={4}>
            {letters.map((ch, i) => {
              const d = lt - onsets[i];
              const on = d >= 0 && !(d > .05 && d < .09) && !(d > .16 && d < .19) || allOn;
              return <tspan key={i} fill={on ? accent : '#232323'} style={on ? {filter: `drop-shadow(0 0 ${allOn ? 22 : 10}px ${accent})`} : undefined}>{ch}</tspan>;
            })}
          </text>
          {burst > 0 && burst < 1 && sparks.map((p, i) => {const tt = burst * .7;
            return <circle key={i} cx={p.x + Math.cos(p.a) * p.v * tt} cy={-fs * .75 + Math.sin(p.a) * p.v * tt + 900 * tt * tt} r={p.sz * (1 - burst)} fill={accent} />;})}
          {s.sub && <text y={110} textAnchor="middle" fontFamily={MONO} fontWeight={500} fontSize={30} letterSpacing={8} fill="#bdbdbd">{typed(s.sub, lt, .42, 60)}</text>}
        </g>
      </svg>
    </>);
};

const SHOTS: Record<string, React.FC<SP>> = {spotlight: SpotlightShot, crowd: CrowdShot, versus: VersusShot, gauge: GaugeShot,
  heartbeat: HeartShot, chat: ChatShot, counter: CounterShot, keyword: KeywordShot};

// ---------- transitions ----------
export const TR: Record<string, number> = {whip: .3, zoom: .36, glitch: .34, flash: .2, cut: 0};

const ShotLayer: React.FC<{s: Shot; t: number; accent: string; fps: number; idx: number; out?: {type: string; p: number; dir: number}; inn?: {type: string; q: number; dir: number}; punch: number; whip?: {x: number; b: number}}> = ({s, t, accent, fps, idx, out, inn, punch, whip}) => {
  const C = SHOTS[s.type] || SpotlightShot;
  const lt = t - s.start, dur = s.end - s.start;
  // caméra lente : poussée + léger panoramique pendant tout le plan
  const k = eIO(lt / Math.max(.5, dur));
  let scale = 1 + (s.push ?? .07) * k + punch, tx = (s.pan ?? (idx % 2 ? 18 : -18)) * k, ty = 0, blur = '', op = 1, extra: React.CSSProperties = {};
  if (whip) {tx += whip.x; blur = whip.b > 0 ? `url(#mbx${whip.b})` : '';}
  if (out) {
    const p = out.p;
    if (out.type === 'whip') {tx += -out.dir * W * 1.05 * Math.pow(p, 2.2); blur = `url(#mbx${Math.min(9, Math.round(p * 9))})`;}
    if (out.type === 'zoom') {scale *= 1 + 2.2 * Math.pow(p, 2.4); op = 1 - p * .6; blur = `blur(${(p * 10).toFixed(1)}px)`;}
  }
  if (inn) {
    const q = inn.q;
    if (inn.type === 'whip') {tx += inn.dir * W * 1.05 * Math.pow(1 - q, 2.2); blur = `url(#mbx${Math.min(9, Math.round((1 - q) * 9))})`;}
    if (inn.type === 'zoom') {scale *= .5 + .5 * eOut(q); blur = `blur(${((1 - q) * 8).toFixed(1)}px)`; op = .4 + .6 * q;}
  }
  const inner = <AbsoluteFill style={{transform: `translate(${tx}px, ${ty}px) scale(${scale})`, transformOrigin: '50% 55%', filter: blur || undefined, opacity: op, ...extra}}>
    <C s={s} lt={lt} accent={accent} fps={fps} />
  </AbsoluteFill>;
  // glitch : bandes horizontales décalées + séparation RVB
  const g = out?.type === 'glitch' ? out.p : inn?.type === 'glitch' ? (1 - inn.q) * .6 : 0;
  if (g > 0) {
    const fr = Math.floor(t * 15);
    const bands = 7;
    return <AbsoluteFill>{Array.from({length: bands}).map((_, b) => {
      const r = rng(fr * 31 + b * 7 + idx);
      const off = (r() - .5) * 260 * g * (r() > .4 ? 1 : 0);
      const top = (b / bands) * 100, bot = 100 - ((b + 1) / bands) * 100;
      return <AbsoluteFill key={b} style={{clipPath: `inset(${top}% 0 ${bot}% 0)`, transform: `translateX(${off}px)`,
        filter: r() > .6 ? `drop-shadow(${8 * g}px 0 0 rgba(255,0,60,.8)) drop-shadow(${-8 * g}px 0 0 rgba(0,220,255,.8))` : undefined}}>{inner}</AbsoluteFill>;
    })}</AbsoluteFill>;
  }
  return inner;
};

// ---------- sous-titre en boîte ----------
const groupCaptions = (caps: Cap[]) => {
  const groups: Cap[][] = []; let cur: Cap[] = []; let len = 0;
  caps.forEach((c, i) => {
    const prev = caps[i - 1];
    if (cur.length && (c.line !== prev.line || prev.stop || len + c.text.length > 26 || cur.length >= 5)) {groups.push(cur); cur = []; len = 0;}
    cur.push(c); len += c.text.length + 1;
  });
  if (cur.length) groups.push(cur);
  return groups;
};

const CaptionBox: React.FC<{caps: Cap[]; t: number; accent: string; hidden: boolean}> = ({caps, t, accent, hidden}) => {
  const groups = React.useMemo(() => groupCaptions(caps), [caps]);
  const gi = groups.findIndex((g, i) => t >= g[0].start - .02 && (i + 1 >= groups.length || t < groups[i + 1][0].start - .02));
  if (gi < 0 || hidden) return null;
  const g = groups[gi];
  const last = g[g.length - 1];
  if (t > last.end + .9) return null;
  const shown = g.filter(c => t >= c.start - .02);
  const p = eOut((t - g[0].start) / .12);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: STAGE_Y + STAGE_H - 190, display: 'flex', justifyContent: 'center'}}>
      <div style={{background: '#f4f4f4', padding: '6px 18px 2px', transform: `scale(${.92 + .08 * p})`, boxShadow: '0 10px 30px rgba(0,0,0,.6)',
        fontFamily: 'Anton', fontSize: 60, lineHeight: '74px', color: '#0b0b0b', textTransform: 'uppercase', whiteSpace: 'nowrap', letterSpacing: .5}}>
        {shown.map((c, i) => {
          const q = eOut((t - c.start) / .08);
          return <span key={i} style={{display: 'inline-block', marginRight: i < shown.length - 1 ? 16 : 0, transform: `translateY(${(1 - q) * 12}px)`, opacity: .3 + .7 * q,
            ...(c.accent ? {background: accent, padding: '0 8px', margin: '0 8px 0 -4px'} : {})}}>{c.text}</span>;
        })}
      </div>
    </div>);
};

// ---------- composition ----------
export const noirDefaults: NoirProps = {
  title: 'Pourquoi plus tu insistes, moins elle répond', accent: '#ff2d6f', duration: 4, progressBar: true,
  captions: [{text: 'PLUS', start: .2, end: .5, line: 0}, {text: 'TU', start: .5, end: .7, line: 0}, {text: 'INSISTES', start: .7, end: 1.3, line: 0, accent: true}],
  shots: [{type: 'spotlight', start: 0, end: 2, figures: [{x: 380, hero: true, pose: 'wave'}, {x: 720, kind: 'f'}], hud: 'SUJET · TOI'},
    {type: 'keyword', start: 2, end: 4, in: 'glitch', word: 'SIGNAL.', sub: 'ANALYSE EN COURS', noCaption: true}],
};

export const NoirStage: React.FC<NoirProps> = (p) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig();
  const t = frame / fps;
  const accent = p.accent || '#d7ff1f';
  const shots = p.shots;
  let i = shots.findIndex((s, k) => t >= s.start && (k + 1 >= shots.length || t < shots[k + 1].start));
  if (i < 0) i = 0;
  const s = shots[i], nx = shots[i + 1];
  const dirOf = (k: number) => shots[k]?.dir ?? (k % 2 ? -1 : 1);
  // sortie vers le plan suivant ?
  let out: any, inn: any;
  // whip pan continu : le plan sortant et le plan entrant glissent ensemble (aucune image vide)
  let wk = -1;
  if (nx && nx.in === 'whip' && t >= nx.start - TR.whip / 2) wk = i + 1;
  else if (s.in === 'whip' && i > 0 && t < s.start + TR.whip / 2) wk = i;
  let whipPair: {a: number; b: number; xa: number; xb: number; bl: number} | null = null;
  if (wk > 0) {
    const u = cl((t - (shots[wk].start - TR.whip / 2)) / TR.whip), pan = W * eIO(u), d = dirOf(wk);
    const vel = u < .5 ? 4 * u * u : 4 * (1 - u) * (1 - u); // profil de vitesse de eIO (normalisé)
    whipPair = {a: wk - 1, b: wk, xa: -d * pan, xb: d * (W - pan), bl: Math.min(9, Math.round(vel * 9))};
  }
  if (!whipPair && nx && nx.in && nx.in !== 'cut' && nx.in !== 'flash' && nx.in !== 'whip' && t >= nx.start - TR[nx.in] / 2) out = {type: nx.in, p: (t - (nx.start - TR[nx.in] / 2)) / (TR[nx.in] / 2), dir: dirOf(i + 1)};
  if (!whipPair && s.in && s.in !== 'cut' && s.in !== 'flash' && s.in !== 'whip' && t < s.start + TR[s.in] / 2 && i > 0) inn = {type: s.in, q: (t - s.start) / (TR[s.in] / 2), dir: dirOf(i)};
  // flash gris (glitch) au point de coupe
  const grey = s.in === 'glitch' && t - s.start < 1 / 30; // 1 image grise (mesuré sur ref09)
  // flash d'accent (entrée flash ou mot-clé pleinement allumé)
  const fl = s.in === 'flash' ? 1 - cl((t - s.start) / .3) : 0;
  const kwFlash = s.type === 'keyword' && t - s.start >= .38 && t - s.start < .38 + 2 / 30 ? .35 : 0;
  // punch caméra sur les mots-clés du sous-titre
  let punch = 0;
  for (const c of p.captions) if (c.accent && t >= c.start && t < c.start + .4) punch = Math.max(punch, .045 * (1 - eOut((t - c.start) / .4)));
  const lt = t - s.start;
  const hudText = s.hud ? typed(s.hud, lt, .15, 34) : '';
  const blink = Math.floor(t * 4) % 2 === 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <defs>{Array.from({length: 10}).map((_, k) => <filter key={k} id={`mbx${k}`} x="-20%" y="0" width="140%" height="100%"><feGaussianBlur stdDeviation={`${k * 9} 0`} /></filter>)}</defs>
      </svg>
      {p.title && <div style={{position: 'absolute', top: 175, left: 70, right: 70, height: 270, display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', fontFamily: 'Inter', fontWeight: 800, fontSize: 62, lineHeight: 1.18, color: '#fff', letterSpacing: -.5}}>{p.title}</div>}
      <div style={{position: 'absolute', left: 0, top: STAGE_Y, width: W, height: STAGE_H, overflow: 'hidden', background: '#080808'}}>
        {whipPair ? <>
          <ShotLayer s={shots[whipPair.a]} t={t} accent={accent} fps={fps} idx={whipPair.a} punch={0} whip={{x: whipPair.xa, b: whipPair.bl}} />
          <ShotLayer s={shots[whipPair.b]} t={Math.max(t, shots[whipPair.b].start)} accent={accent} fps={fps} idx={whipPair.b} punch={0} whip={{x: whipPair.xb, b: whipPair.bl}} />
        </> : out ? <ShotLayer s={s} t={t} accent={accent} fps={fps} idx={i} out={out} punch={punch} />
          : inn ? <ShotLayer s={s} t={t} accent={accent} fps={fps} idx={i} inn={inn} punch={punch} />
            : <ShotLayer s={s} t={t} accent={accent} fps={fps} idx={i} punch={punch} />}
        {grey && <AbsoluteFill style={{background: '#8e8e8e'}} />}
        {(fl > 0 || kwFlash > 0) && <AbsoluteFill style={{background: accent, opacity: Math.max(fl * .85, kwFlash), mixBlendMode: 'screen'}} />}
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.55) 100%)'}} />
        <AbsoluteFill style={{backgroundImage: `url(${staticFile(`grain/g${frame % 4}.png`)})`, backgroundPosition: `${(frame * 37) % 200}px ${(frame * 53) % 200}px`, opacity: .07, mixBlendMode: 'overlay'}} />
        {/* HUD : croix de visée aux coins + label tapé */}
        {[[28, 28], [W - 28, 28], [28, STAGE_H - 28], [W - 28, STAGE_H - 28]].map(([x, y], k) =>
          <div key={k} style={{position: 'absolute', left: x - 13, top: y - 13, width: 26, height: 26}}>
            <div style={{position: 'absolute', left: 12, top: 0, width: 2, height: 26, background: '#9a9a9a'}} /><div style={{position: 'absolute', top: 12, left: 0, height: 2, width: 26, background: '#9a9a9a'}} />
          </div>)}
        {hudText && <div style={{position: 'absolute', left: 64, top: 52, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: accent, display: 'flex', alignItems: 'center', gap: 12}}>
          <div style={{width: 12, height: 12, background: accent, opacity: blink ? 1 : .3}} />{hudText}</div>}
        {p.progressBar !== false && <div style={{position: 'absolute', left: 0, bottom: 0, height: 5, width: `${cl(t / p.duration) * 100}%`, background: accent}} />}
      </div>
      <CaptionBox caps={p.captions} t={t} accent={accent} hidden={!!s.noCaption} />
      {p.audio && <Audio src={staticFile(p.audio)} />}
    </AbsoluteFill>);
};
