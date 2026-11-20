/**
 * GtaGuide — montage « astuces / secrets GTA 6 » (fiche references/visual-styles/gta-guide.md).
 *
 * Les clips arrivent déjà recadrés en 1080×1920 avec leurs transitions zoom-blur / whip « cuites »
 * (tools/clip_cut.py). Ici : enchaînement des clips, punch-zoom, flash, shake, sous-titres 1–3 mots,
 * overlays UI originaux (compteur, carte vitrée, code, pin, étape, alerte, flux d'icônes, CTA).
 * Tout est piloté par edit.json (écrit par tools/gta_build.py).
 */
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, random} from 'remotion';
import '@fontsource/anton/400.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import '@fontsource/montserrat/900-italic.css';
import {Icon, IconName} from './Icons';

// ---------- types ----------
export type Clip = {src: string; from: number; dur: number; kind?: 'video' | 'image'; punch?: number[]; trim?: number};
export type Fx = {type: 'flash' | 'shake' | 'punch' | 'dim'; at: number; dur?: number; amount?: number};
export type Caption = {text: string; from: number; to: number; accent?: boolean; mono?: boolean};
export type Overlay =
  | {type: 'counter'; from: number; to: number; value: number; prefix?: string; suffix?: string; countFrames?: number; y?: number}
  | {type: 'card'; from: number; to: number; title?: string; rows: {label: string; value: number; color?: 'pink' | 'green' | 'cyan' | 'gold'; icon?: IconName}[]; y?: number}
  | {type: 'code'; from: number; to: number; code: string; label?: string; y?: number}
  | {type: 'pin'; from: number; to: number; label: string; x?: number; y?: number}
  | {type: 'step'; from: number; to: number; n: number; label?: string}
  | {type: 'alert'; from: number; to: number; text: string}
  | {type: 'flow'; from: number; to: number; icons: IconName[]; y?: number}
  | {type: 'title'; from: number; to: number; lines: string[]; accent?: number; y?: number}
  | {type: 'subscribe'; from: number; to: number; label?: string; done?: string}
  | {type: 'combo'; from: number; to: number; keys: ('U' | 'D' | 'L' | 'R' | string)[]; times?: number[]; label?: string; y?: number};
export type GtaEdit = {
  clips: Clip[]; fx?: Fx[]; captions: Caption[]; overlays?: Overlay[];
  channel?: string; credit?: string; accent?: string; durationInFrames?: number;
};

const C = {
  accent: '#FFD23F', pink: '#FF3D9A', cyan: '#3DE8FF', green: '#3DFF8E', gold: '#FFC93D',
  glass: 'rgba(14,10,26,0.58)', ink: '#0b0710',
};
const SANS = 'Montserrat, sans-serif';
const COND = 'Anton, Impact, sans-serif';

// ---------- clips ----------
const ClipLayer: React.FC<{clip: Clip}> = ({clip}) => {
  const f = useCurrentFrame();
  const p = clip.punch ?? [1, 1.06];
  const scale = interpolate(f, [0, clip.dur], [p[0], p[1]], {extrapolateRight: 'clamp'});
  const style: React.CSSProperties = {width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`};
  return clip.kind === 'image'
    ? <Img src={staticFile(clip.src)} style={style} />
    : <OffthreadVideo src={staticFile(clip.src)} muted style={style} startFrom={clip.trim ?? 0} />;
};

// flash, shake, punch, dim appliqués à toute la pile image
const useFx = (fx: Fx[] = []) => {
  const f = useCurrentFrame();
  let scale = 1, dx = 0, dy = 0, flash = 0, dim = 0;
  for (const e of fx) {
    const d = e.dur ?? 6, t = f - e.at;
    if (t < 0 || t > d) continue;
    const k = 1 - t / d;
    if (e.type === 'flash') flash = Math.max(flash, (e.amount ?? 0.85) * Math.pow(k, 2));
    if (e.type === 'shake') { const a = (e.amount ?? 22) * k; dx += (random(`x${e.at}${f}`) - 0.5) * 2 * a; dy += (random(`y${e.at}${f}`) - 0.5) * 2 * a; }
    if (e.type === 'punch') scale *= 1 + (e.amount ?? 0.08) * Math.sin(Math.min(1, t / d) * Math.PI) ;
    if (e.type === 'dim') dim = Math.max(dim, (e.amount ?? 0.45) * Math.sin(Math.min(1, t / d) * Math.PI));
  }
  return {scale, dx, dy, flash, dim};
};

// ---------- sous-titres ----------
const CaptionView: React.FC<{c: Caption; accentColor: string}> = ({c, accentColor}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 14, stiffness: 520, mass: 0.45}});
  const scale = interpolate(s, [0, 1], [1.22, 1]);
  const blur = interpolate(f, [0, 3], [7, 0], {extrapolateRight: 'clamp'});
  const op = interpolate(f, [0, 2], [0, 1], {extrapolateRight: 'clamp'});
  const len = c.text.length;
  // une seule ligne : Anton MAJ ≈ 0,47 em/caractère → taille ajustée à la largeur utile (900 px)
  const size = c.mono ? Math.min(132, 900 / (len * 0.62)) : Math.min(138, 900 / (len * 0.47));
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center'}}>
      <div style={{
        position: 'absolute', top: 1478 - size / 2, width: 1000, textAlign: 'center', whiteSpace: 'nowrap',
        fontFamily: c.mono ? SANS : COND, fontWeight: c.mono ? 900 : 400, fontSize: size, lineHeight: 1,
        letterSpacing: c.mono ? 26 : 1, textTransform: 'uppercase',
        color: c.accent ? accentColor : '#fff',
        transform: `scale(${scale}) skewX(${c.mono ? 0 : -9}deg)`, filter: `blur(${blur}px)`, opacity: op,
        WebkitTextStroke: '10px rgba(8,4,12,0.92)', paintOrder: 'stroke fill',
        textShadow: '0 8px 0 rgba(0,0,0,0.55), 0 14px 30px rgba(0,0,0,0.6)',
      }}>{c.text}</div>
    </AbsoluteFill>
  );
};

// ---------- overlays ----------
const enter = (f: number, fps: number, delay = 0) => spring({frame: f - delay, fps, config: {damping: 13, stiffness: 260, mass: 0.6}});
const exitK = (f: number, len: number, d = 6) => interpolate(f, [len - d, len], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const Glass: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{
    background: `linear-gradient(160deg, rgba(40,18,60,0.62), ${C.glass})`, backdropFilter: 'blur(16px)',
    border: '3px solid rgba(255,255,255,0.10)', borderRadius: 30, padding: '26px 34px',
    boxShadow: `0 0 0 2px rgba(255,61,154,0.55), 0 0 38px rgba(255,61,154,0.45), 0 0 80px rgba(61,232,255,0.20), inset 0 1px 0 rgba(255,255,255,0.25)`,
    ...style,
  }}>{children}</div>
);

const Counter: React.FC<{o: Extract<Overlay, {type: 'counter'}>}> = ({o}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const len = o.to - o.from;
  const cf = o.countFrames ?? 26;
  const v = interpolate(f, [2, cf], [0, o.value], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const done = f >= cf;
  const pulse = done ? 1 + 0.06 * Math.exp(-(f - cf) / 4) * Math.cos((f - cf) * 1.4) : 1;
  const txt = (o.prefix ?? '$') + Math.round(v).toLocaleString('fr-FR').replace(/ | /g, ' ') + (o.suffix ?? '');
  const e = enter(f, fps);
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div style={{position: 'absolute', top: o.y ?? 640, fontFamily: SANS, fontWeight: 900, fontSize: 150, letterSpacing: -2,
        color: done ? '#B6FFD2' : '#7CFFB0', fontVariantNumeric: 'tabular-nums',
        transform: `scale(${e * pulse})`, opacity: exitK(f, len),
        WebkitTextStroke: '8px #052914', paintOrder: 'stroke fill',
        textShadow: `0 0 18px ${C.green}, 0 0 46px ${C.green}, 0 0 90px rgba(61,255,142,${done ? 0.9 : 0.5})`}}>{txt}</div>
    </AbsoluteFill>
  );
};

const Card: React.FC<{o: Extract<Overlay, {type: 'card'}>}> = ({o}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const len = o.to - o.from;
  const e = enter(f, fps);
  const col = {pink: C.pink, green: C.green, cyan: C.cyan, gold: C.gold};
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div style={{position: 'absolute', top: o.y ?? 560, width: 860, opacity: Math.min(e, exitK(f, len)),
        transform: `translateY(${(1 - e) * 60}px) scale(${0.92 + 0.08 * e})`}}>
        <Glass>
          {o.title && <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 46, color: '#fff', letterSpacing: 4, textAlign: 'center', marginBottom: 14}}>{o.title}</div>}
          {o.rows.map((r, i) => {
            const segs = 12, lit = Math.round(r.value * segs);
            const c = col[r.color ?? 'pink'];
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 20, margin: '14px 0'}}>
                <div style={{width: 74, height: 74, borderRadius: 37, background: 'rgba(255,255,255,0.08)', border: `2px solid ${c}`,
                  boxShadow: `0 0 16px ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <Icon name={r.icon ?? 'star'} size={40} color="#fff" />
                </div>
                <div style={{flex: 1}}>
                  <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, color: '#fff', letterSpacing: 2, marginBottom: 8}}>{r.label}</div>
                  <div style={{display: 'flex', gap: 6}}>
                    {Array.from({length: segs}).map((_, k) => {
                      const on = k < lit && f > 6 + i * 5 + k * 1.6;
                      return <div key={k} style={{flex: 1, height: 18, borderRadius: 4, background: on ? c : 'rgba(255,255,255,0.13)', boxShadow: on ? `0 0 12px ${c}` : 'none'}} />;
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </Glass>
      </div>
    </AbsoluteFill>
  );
};

const Code: React.FC<{o: Extract<Overlay, {type: 'code'}>}> = ({o}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const len = o.to - o.from;
  const per = 7;
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div style={{position: 'absolute', top: o.y ?? 600, opacity: exitK(f, len), transform: `scale(${enter(f, fps)})`}}>
        <Glass style={{padding: '30px 36px'}}>
          {o.label && <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, color: C.cyan, letterSpacing: 6, textAlign: 'center', marginBottom: 18}}>{o.label}</div>}
          <div style={{display: 'flex', gap: 18}}>
            {o.code.split('').map((ch, i) => {
              const t = f - 6 - i * per; const s = spring({frame: t, fps, config: {damping: 11, stiffness: 400, mass: 0.4}});
              const lit = t >= 0;
              return (
                <div key={i} style={{width: 132, height: 168, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: lit ? 'rgba(61,232,255,0.14)' : 'rgba(255,255,255,0.06)', border: `3px solid ${lit ? C.cyan : 'rgba(255,255,255,0.15)'}`,
                  boxShadow: lit ? `0 0 26px ${C.cyan}` : 'none', fontFamily: SANS, fontWeight: 900, fontSize: 112, color: '#fff',
                  transform: `scale(${lit ? 0.7 + 0.3 * s : 1})`}}>{lit ? ch : ''}</div>
              );
            })}
          </div>
        </Glass>
      </div>
    </AbsoluteFill>
  );
};

const Pin: React.FC<{o: Extract<Overlay, {type: 'pin'}>}> = ({o}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const len = o.to - o.from;
  const drop = spring({frame: f, fps, config: {damping: 9, stiffness: 300, mass: 0.6}});
  const x = o.x ?? 540, y = o.y ?? 860;
  const ring = (f % 24) / 24;
  return (
    <AbsoluteFill style={{opacity: exitK(f, len)}}>
      <div style={{position: 'absolute', left: x - 90, top: y - 30, width: 180, height: 60, borderRadius: '50%',
        border: `5px solid ${C.pink}`, opacity: 1 - ring, transform: `scale(${0.4 + ring * 1.4})`}} />
      <div style={{position: 'absolute', left: x - 60, top: y - 150, transform: `translateY(${(1 - drop) * -260}px)`}}>
        <Icon name="pin" size={120} color={C.pink} glow />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: y + 50, display: 'flex', justifyContent: 'center',
        opacity: interpolate(f, [8, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
        <div style={{background: '#fff', color: C.ink, fontFamily: SANS, fontWeight: 900, fontSize: 46, padding: '12px 30px',
          borderRadius: 40, boxShadow: `0 0 0 4px ${C.pink}, 0 10px 30px rgba(0,0,0,0.5)`, textTransform: 'uppercase'}}>{o.label}</div>
      </div>
    </AbsoluteFill>
  );
};

const Step: React.FC<{o: Extract<Overlay, {type: 'step'}>}> = ({o}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const len = o.to - o.from;
  const e = enter(f, fps);
  return (
    <div style={{position: 'absolute', left: 60, top: 250, display: 'flex', alignItems: 'center', gap: 16,
      transform: `translateX(${(1 - e) * -420}px)`, opacity: exitK(f, len)}}>
      <div style={{width: 96, height: 96, borderRadius: 26, background: C.accent, color: C.ink, fontFamily: COND, fontSize: 70,
        display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'skewX(-9deg)', boxShadow: '0 8px 0 rgba(0,0,0,0.45)'}}>{o.n}</div>
      {o.label && <div style={{fontFamily: COND, fontSize: 64, color: '#fff', textTransform: 'uppercase', transform: 'skewX(-9deg)',
        WebkitTextStroke: '8px rgba(8,4,12,0.9)', paintOrder: 'stroke fill'}}>{o.label}</div>}
    </div>
  );
};

const Alert: React.FC<{o: Extract<Overlay, {type: 'alert'}>}> = ({o}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const len = o.to - o.from;
  const e = enter(f, fps); const sh = f < 10 ? Math.sin(f * 2.2) * 14 * (1 - f / 10) : 0;
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 300, display: 'flex', alignItems: 'center', gap: 16, background: '#FF2E4D',
        padding: '18px 36px', borderRadius: 50, boxShadow: '0 0 40px rgba(255,46,77,0.7), 0 10px 0 rgba(0,0,0,0.35)',
        transform: `scale(${e}) translateX(${sh}px) rotate(-2deg)`, opacity: exitK(f, len)}}>
        <Icon name="warning" size={58} color="#fff" />
        <div style={{fontFamily: COND, fontSize: 66, color: '#fff', textTransform: 'uppercase', letterSpacing: 1}}>{o.text}</div>
      </div>
    </AbsoluteFill>
  );
};

const Flow: React.FC<{o: Extract<Overlay, {type: 'flow'}>}> = ({o}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const len = o.to - o.from;
  const gap = 9;
  return (
    <AbsoluteFill style={{alignItems: 'center', opacity: exitK(f, len)}}>
      <div style={{position: 'absolute', top: o.y ?? 760, display: 'flex', alignItems: 'center', gap: 22}}>
        {o.icons.map((n, i) => {
          const s = enter(f, fps, i * gap * 2);
          const a = interpolate(f, [i * gap * 2 + 6, i * gap * 2 + 6 + gap], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return (
            <React.Fragment key={i}>
              <div style={{width: 150, height: 150, borderRadius: 75, background: 'rgba(20,12,34,0.6)', backdropFilter: 'blur(10px)',
                border: '3px solid rgba(255,255,255,0.18)', boxShadow: `0 0 0 3px ${C.pink}, 0 0 34px ${C.pink}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`}}>
                <Icon name={n} size={78} color="#fff" />
              </div>
              {i < o.icons.length - 1 && (
                <svg width={90} height={40} viewBox="0 0 90 40">
                  <path d="M4 20 H74 M60 6 L78 20 L60 34" stroke={C.cyan} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round"
                    strokeDasharray={140} strokeDashoffset={140 * (1 - a)} style={{filter: `drop-shadow(0 0 8px ${C.cyan})`}} />
                </svg>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Title: React.FC<{o: Extract<Overlay, {type: 'title'}>; accentColor: string}> = ({o, accentColor}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const len = o.to - o.from;
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div style={{position: 'absolute', top: o.y ?? 420, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: exitK(f, len)}}>
        {o.lines.map((l, i) => {
          const s = enter(f, fps, i * 4);
          const acc = i === (o.accent ?? -1);
          return (
            <div key={i} style={{position: 'relative', transform: `translateY(${(1 - s) * 80}px) skewX(-9deg)`, opacity: s}}>
              {acc && <div style={{position: 'absolute', inset: '8px -18px', background: accentColor, borderRadius: 10,
                transform: `scaleX(${interpolate(f, [i * 4 + 4, i * 4 + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})})`, transformOrigin: 'left'}} />}
              <div style={{position: 'relative', fontFamily: COND, fontSize: 150, lineHeight: 1.02, textTransform: 'uppercase',
                color: acc ? C.ink : '#fff', WebkitTextStroke: acc ? '0px' : '12px rgba(8,4,12,0.92)', paintOrder: 'stroke fill',
                textShadow: acc ? 'none' : '0 10px 0 rgba(0,0,0,0.5)'}}>{l}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Subscribe: React.FC<{o: Extract<Overlay, {type: 'subscribe'}>}> = ({o}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const len = o.to - o.from;
  const e = enter(f, fps);
  const click = 22;
  const cx = interpolate(f, [6, click - 2], [980, 640], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const cy = interpolate(f, [6, click - 2], [1180, 980], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const press = f >= click && f < click + 5 ? 0.9 : 1;
  const done = f >= click + 2;
  const ripple = interpolate(f, [click, click + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: exitK(f, len)}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 900, display: 'flex', justifyContent: 'center'}}>
        <div style={{position: 'relative', transform: `scale(${e * press})`}}>
          {f >= click && <div style={{position: 'absolute', inset: -10, borderRadius: 80, border: `6px solid ${done ? '#FF2E4D' : '#fff'}`,
            opacity: 1 - ripple, transform: `scale(${1 + ripple * 0.35})`}} />}
          <div style={{background: done ? '#FF2E4D' : '#fff', color: done ? '#fff' : C.ink, fontFamily: SANS, fontWeight: 900, fontSize: 64,
            padding: '26px 70px', borderRadius: 80, display: 'flex', alignItems: 'center', gap: 18,
            boxShadow: done ? '0 0 50px rgba(255,46,77,0.7), 0 12px 0 rgba(0,0,0,0.35)' : '0 12px 0 rgba(0,0,0,0.35)'}}>
            {done && <Icon name="check" size={58} color="#fff" />}{done ? (o.done ?? 'Abonné') : (o.label ?? "S'abonner")}
          </div>
        </div>
      </div>
      {f < click + 18 && <div style={{position: 'absolute', left: cx, top: cy, transform: `scale(${press})`}}><Icon name="hand" size={110} color="#fff" /></div>}
    </AbsoluteFill>
  );
};

const ARROW_ROT: Record<string, number> = {U: 0, R: 90, D: 180, L: 270};
// Séquence de touches (croix directionnelle) révélée touche par touche, calée sur la voix (times = frames relatives)
const Combo: React.FC<{o: Extract<Overlay, {type: 'combo'}>}> = ({o}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const len = o.to - o.from;
  const n = o.keys.length; const perRow = n > 5 ? Math.ceil(n / 2) : n;
  const size = perRow > 4 ? 150 : 170;
  const rows = [o.keys.slice(0, perRow), o.keys.slice(perRow)].filter((r) => r.length);
  const e = enter(f, fps);
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div style={{position: 'absolute', top: o.y ?? 520, opacity: exitK(f, len), transform: `scale(${0.9 + 0.1 * e})`}}>
        <Glass style={{padding: '28px 30px'}}>
          {o.label && <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 38, color: C.cyan, letterSpacing: 6, textAlign: 'center', marginBottom: 18}}>{o.label}</div>}
          {rows.map((row, r) => (
            <div key={r} style={{display: 'flex', gap: 16, justifyContent: 'center', marginTop: r ? 16 : 0}}>
              {row.map((k, j) => {
                const i = r * perRow + j;
                const t0 = o.times?.[i] ?? 6 + i * 6;
                const t = f - t0; const lit = t >= 0;
                const s = spring({frame: t, fps, config: {damping: 10, stiffness: 420, mass: 0.4}});
                const hot = lit && t < 8;
                return (
                  <div key={j} style={{width: size, height: size, borderRadius: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: hot ? C.accent : lit ? 'rgba(255,210,63,0.16)' : 'rgba(255,255,255,0.06)',
                    border: `4px solid ${lit ? C.accent : 'rgba(255,255,255,0.14)'}`, boxShadow: lit ? `0 0 ${hot ? 40 : 18}px ${C.accent}` : 'none',
                    transform: `scale(${lit ? 0.6 + 0.4 * s : 0.92})`, position: 'relative'}}>
                    <div style={{position: 'absolute', top: 8, left: 14, fontFamily: SANS, fontWeight: 800, fontSize: 26, color: hot ? C.ink : 'rgba(255,255,255,0.55)'}}>{i + 1}</div>
                    {k in ARROW_ROT
                      ? <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 48 48" style={{transform: `rotate(${ARROW_ROT[k]}deg)`, opacity: lit ? 1 : 0.25}}>
                          <path d="M24 6 L42 26 H31 V42 H17 V26 H6 Z" fill={hot ? C.ink : '#fff'} stroke={hot ? C.ink : '#fff'} strokeWidth={2} strokeLinejoin="round" />
                        </svg>
                      : <div style={{fontFamily: SANS, fontWeight: 900, fontSize: size * 0.42, color: hot ? C.ink : '#fff', opacity: lit ? 1 : 0.25}}>{k}</div>}
                  </div>
                );
              })}
            </div>
          ))}
        </Glass>
      </div>
    </AbsoluteFill>
  );
};

const OverlayView: React.FC<{o: Overlay; accent: string}> = ({o, accent}) => {
  switch (o.type) {
    case 'counter': return <Counter o={o} />;
    case 'card': return <Card o={o} />;
    case 'code': return <Code o={o} />;
    case 'pin': return <Pin o={o} />;
    case 'step': return <Step o={o} />;
    case 'alert': return <Alert o={o} />;
    case 'flow': return <Flow o={o} />;
    case 'title': return <Title o={o} accentColor={accent} />;
    case 'subscribe': return <Subscribe o={o} />;
    case 'combo': return <Combo o={o} />;
  }
};

// ---------- composition ----------
export const GtaGuide: React.FC<GtaEdit> = ({clips, fx, captions, overlays = [], channel, credit, accent}) => {
  const {scale, dx, dy, flash, dim} = useFx(fx);
  const acc = accent ?? C.accent;
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <AbsoluteFill style={{transform: `translate(${dx}px, ${dy}px) scale(${scale})`}}>
        {clips.map((c, i) => (
          <Sequence key={i} from={c.from} durationInFrames={c.dur}><ClipLayer clip={c} /></Sequence>
        ))}
      </AbsoluteFill>
      {/* vignette légère + dégradé bas pour la lisibilité des sous-titres */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.42) 100%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(0,0,0,0.35) 80%, rgba(0,0,0,0) 92%)'}} />
      {dim > 0 && <AbsoluteFill style={{backgroundColor: `rgba(0,0,0,${dim})`}} />}
      {overlays.map((o, i) => (
        <Sequence key={`o${i}`} from={o.from} durationInFrames={Math.max(1, o.to - o.from)}><OverlayView o={o} accent={acc} /></Sequence>
      ))}
      {captions.map((c, i) => (
        <Sequence key={`c${i}`} from={c.from} durationInFrames={Math.max(1, c.to - c.from)}><CaptionView c={c} accentColor={acc} /></Sequence>
      ))}
      {channel && <div style={{position: 'absolute', top: 120, right: 70, fontFamily: COND, fontSize: 52, color: '#fff', opacity: 0.92,
        transform: 'skewX(-9deg)', textShadow: '0 4px 10px rgba(0,0,0,0.6)', letterSpacing: 1}}>{channel}</div>}
      {credit && <div style={{position: 'absolute', top: 128, left: 70, fontFamily: SANS, fontWeight: 700, fontSize: 24, color: 'rgba(255,255,255,0.75)',
        textShadow: '0 2px 6px rgba(0,0,0,0.8)'}}>{credit}</div>}
      {flash > 0 && <AbsoluteFill style={{backgroundColor: `rgba(255,255,255,${flash})`}} />}
    </AbsoluteFill>
  );
};

export const gtaGuideDefaults: GtaEdit = {clips: [], captions: [], overlays: [], durationInFrames: 90};
