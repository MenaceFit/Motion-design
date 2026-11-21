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
import {noise2D} from '@remotion/noise';

// ---------- types ----------
export type Clip = {src: string; from: number; dur: number; kind?: 'video' | 'image'; punch?: number[]; trim?: number};
export type Fx = {type: 'flash' | 'shake' | 'punch' | 'dim'; at: number; dur?: number; amount?: number};
export type Caption = {text: string; from: number; to: number; accent?: boolean; mono?: boolean};
export type Leak = {at: number; dur?: number; hue?: 'warm' | 'pink' | 'cyan'; side?: number};
export type Overlay =
  | {type: 'counter'; from: number; to: number; value: number; prefix?: string; suffix?: string; countFrames?: number; y?: number}
  | {type: 'card'; from: number; to: number; title?: string; rows: {label: string; value: number; color?: 'pink' | 'green' | 'cyan' | 'gold'; icon?: IconName}[]; y?: number}
  | {type: 'code'; from: number; to: number; code: string; label?: string; y?: number}
  | {type: 'pin'; from: number; to: number; label: string; x?: number; y?: number}
  | {type: 'step'; from: number; to: number; n: number; of?: number; label?: string}
  | {type: 'alert'; from: number; to: number; text: string}
  | {type: 'flow'; from: number; to: number; icons: IconName[]; y?: number}
  | {type: 'title'; from: number; to: number; lines: string[]; accent?: number; y?: number}
  | {type: 'subscribe'; from: number; to: number; label?: string; done?: string}
  | {type: 'hooktag'; from: number; to: number; text: string; sub?: string}
  | {type: 'follow'; from: number; to: number; title?: string; name?: string; initials?: string; button?: string; done?: string}
  | {type: 'combo'; from: number; to: number; keys: ('U' | 'D' | 'L' | 'R' | string)[]; times?: number[]; label?: string; y?: number};
export type GtaEdit = {
  clips: Clip[]; fx?: Fx[]; captions: Caption[]; overlays?: Overlay[];
  channel?: string; credit?: string; accent?: string; durationInFrames?: number; fps?: number; leaks?: Leak[]; grain?: number;
};

const C = {
  accent: '#FFD23F', pink: '#FF3D9A', cyan: '#3DE8FF', green: '#3DFF8E', gold: '#FFC93D',
  glass: 'rgba(14,10,26,0.58)', ink: '#0b0710',
};
const SANS = 'Montserrat, sans-serif';
const COND = 'Anton, Impact, sans-serif';

// ---------- base de temps ----------
// Toutes les durées d'animation sont exprimées en « frames 30 i/s » : identiques à 30 ou 60 i/s.
// spring() accepte des frames fractionnaires (Remotion 4) → f = frame × 30 / fps, fps = 30.
const useT = () => {
  const fr = useCurrentFrame(); const {fps: real} = useVideoConfig();
  const k = 30 / real;
  return {f: fr * k, fps: 30, k, fr, real};
};

// ---------- clips ----------
const ClipLayer: React.FC<{clip: Clip}> = ({clip}) => {
  const f = useCurrentFrame();
  const p = clip.punch ?? [1, 1.06];
  const scale = interpolate(f, [0, clip.dur], [p[0], p[1]], {extrapolateRight: 'clamp'});
  // caméra « à l'épaule » : dérive lente (bruit de Perlin), ±7 px / ±0,35°, masquée par le zoom de 5 %
  const {fps} = useVideoConfig(); const s = (f + clip.from) / fps;
  const hx = noise2D('hx', s * 0.55, 0) * 7, hy = noise2D('hy', 0, s * 0.5) * 7, hr = noise2D('hr', s * 0.4, 1) * 0.35;
  const style: React.CSSProperties = {width: '100%', height: '100%', objectFit: 'cover',
    transform: `translate(${hx}px, ${hy}px) rotate(${hr}deg) scale(${scale * 1.02})`};
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

// ---------- sous-titres (v2) ----------
// Entrée : pop élastique (0,62 → 1, overshoot), montée 34 px, rotation -4° → 0, flou 8 → 0.
// Mot-clé : jaune + halo + « slam » 1,45 → 1 + micro-secousse. Sortie : 2 frames (scale 0,94, fondu).
const CaptionView: React.FC<{c: Caption; accentColor: string}> = ({c, accentColor}) => {
  const {f, fps, k} = useT();
  const len = (c.to - c.from) * k;
  const s = spring({frame: f, fps, config: c.accent ? {damping: 9, stiffness: 420, mass: 0.5} : {damping: 12, stiffness: 480, mass: 0.42}});
  const scale = c.accent ? interpolate(s, [0, 1], [1.45, 1]) : interpolate(s, [0, 1], [0.62, 1]);
  const y = interpolate(s, [0, 1], [c.accent ? -10 : 34, 0]);
  const rot = interpolate(s, [0, 1], [c.accent ? 3 : -4, 0]);
  const blur = interpolate(f, [0, 3], [8, 0], {extrapolateRight: 'clamp'});
  const outK = interpolate(f, [len - 2, len], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const op = Math.min(interpolate(f, [0, 1.5], [0, 1], {extrapolateRight: 'clamp'}), outK);
  const jx = c.accent && f < 8 ? Math.sin(f * 3.1) * 7 * (1 - f / 8) : 0;
  const len2 = c.text.length;
  const size = c.mono ? Math.min(132, 900 / (len2 * 0.62)) : Math.min(c.accent ? 150 : 138, 900 / (len2 * 0.47));
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center'}}>
      <div style={{
        position: 'absolute', top: 1478 - size / 2, width: 1000, textAlign: 'center', whiteSpace: 'nowrap',
        fontFamily: c.mono ? SANS : COND, fontWeight: c.mono ? 900 : 400, fontSize: size, lineHeight: 1,
        letterSpacing: c.mono ? 26 : 1, textTransform: 'uppercase',
        color: c.accent ? accentColor : '#fff',
        transform: `translate(${jx}px, ${y}px) rotate(${rot}deg) scale(${scale * (0.94 + 0.06 * outK)}) skewX(${c.mono ? 0 : -9}deg)`,
        filter: `blur(${blur}px)`, opacity: op,
        WebkitTextStroke: '10px rgba(8,4,12,0.92)', paintOrder: 'stroke fill',
        textShadow: c.accent
          ? `0 8px 0 rgba(0,0,0,0.55), 0 0 28px ${accentColor}aa, 0 0 70px ${accentColor}66`
          : '0 8px 0 rgba(0,0,0,0.55), 0 14px 30px rgba(0,0,0,0.6)',
      }}>{c.text}</div>
    </AbsoluteFill>
  );
};

// ---------- light leaks : halos additifs qui balaient l'image pendant les transitions ----------
const LEAK = {warm: ['255,150,40', '255,60,90'], pink: ['255,61,154', '140,80,255'], cyan: ['61,232,255', '80,120,255']};
const LightLeak: React.FC<{l: Leak}> = ({l}) => {
  const {f, k} = useT();
  const d = (l.dur ?? 24) * k;
  const t = f / d;
  if (t < 0 || t > 1) return null;
  const a = Math.sin(t * Math.PI);
  const [c1, c2] = LEAK[l.hue ?? 'warm'];
  const side = l.side ?? 1;
  const x = 50 + side * (-70 + 140 * t);
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.85 * a, pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 55% 70% at ${x}% ${40 + 20 * t}%, rgba(${c1},0.95), rgba(${c1},0) 70%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 40% 50% at ${100 - x}% ${70 - 25 * t}%, rgba(${c2},0.8), rgba(${c2},0) 70%)`}} />
      <AbsoluteFill style={{background: `linear-gradient(${100 + 40 * side}deg, rgba(255,255,255,0) ${30 + 40 * t}%, rgba(255,240,220,${0.35 * a}) ${40 + 40 * t}%, rgba(255,255,255,0) ${52 + 40 * t}%)`}} />
    </AbsoluteFill>
  );
};

// grain animé (bruit statique, change toutes les 2 frames 30)
const Grain: React.FC<{amount: number}> = ({amount}) => {
  const {f} = useT();
  const i = Math.floor(f / 2) % 3;
  return <AbsoluteFill style={{backgroundImage: `url(${staticFile(`grain/g${i}.png`)})`, backgroundSize: '512px 512px',
    opacity: amount, mixBlendMode: 'overlay', pointerEvents: 'none'}} />;
};

// explosion de « $ » (fin du compteur) : 16 glyphes, vitesse radiale + gravité
const Burst: React.FC<{at: number; color: string; y: number}> = ({at, color, y}) => {
  const {f} = useT();
  const t = (f - at) / 30;
  if (t < 0 || t > 1.1) return null;
  return (
    <AbsoluteFill>
      {Array.from({length: 16}).map((_, i) => {
        const ang = (i / 16) * Math.PI * 2 + random(`a${i}`) * 0.4;
        const v = 900 + random(`v${i}`) * 700;
        const x = 540 + Math.cos(ang) * v * t;
        const yy = y + Math.sin(ang) * v * t * 0.8 + 1400 * t * t;
        const r = (random(`r${i}`) - 0.5) * 720 * t;
        return <div key={i} style={{position: 'absolute', left: x - 30, top: yy - 40, fontFamily: SANS, fontWeight: 900,
          fontSize: 54 + random(`s${i}`) * 40, color, opacity: Math.max(0, 1 - t * 0.95), transform: `rotate(${r}deg)`,
          textShadow: `0 0 18px ${color}`}}>$</div>;
      })}
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
  const {f, fps, k} = useT(); const len = (o.to - o.from) * k;
  const cf = o.countFrames ?? 26;
  const v = interpolate(f, [2, cf], [0, o.value], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const done = f >= cf;
  const pulse = done ? 1 + 0.06 * Math.exp(-(f - cf) / 4) * Math.cos((f - cf) * 1.4) : 1;
  const txt = (o.prefix ?? '$') + Math.round(v).toLocaleString('fr-FR').replace(/ | /g, ' ') + (o.suffix ?? '');
  const e = enter(f, fps);
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      {/* rayons lumineux tournants derrière le montant */}
      <div style={{position: 'absolute', top: (o.y ?? 640) - 330, left: 540 - 420, width: 840, height: 840, borderRadius: '50%',
        background: `repeating-conic-gradient(from ${f * 2}deg, rgba(61,255,142,0.20) 0deg 7deg, rgba(61,255,142,0) 7deg 22deg)`,
        WebkitMaskImage: 'radial-gradient(circle, black 18%, transparent 68%)', opacity: e * exitK(f, len) * (done ? 1 : 0.55),
        transform: `scale(${0.6 + 0.4 * e})`, mixBlendMode: 'screen'}} />
      <Burst at={cf} color={C.green} y={(o.y ?? 640) + 70} />
      <div style={{position: 'absolute', top: o.y ?? 640, fontFamily: SANS, fontWeight: 900, fontSize: 150, letterSpacing: -2,
        color: done ? '#B6FFD2' : '#7CFFB0', fontVariantNumeric: 'tabular-nums',
        transform: `scale(${e * pulse})`, opacity: exitK(f, len),
        WebkitTextStroke: '8px #052914', paintOrder: 'stroke fill',
        textShadow: `0 0 18px ${C.green}, 0 0 46px ${C.green}, 0 0 90px rgba(61,255,142,${done ? 0.9 : 0.5})`}}>{txt}</div>
    </AbsoluteFill>
  );
};

const Card: React.FC<{o: Extract<Overlay, {type: 'card'}>}> = ({o}) => {
  const {f, fps, k} = useT(); const len = (o.to - o.from) * k;
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
  const {f, fps, k} = useT(); const len = (o.to - o.from) * k;
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
  const {f, fps, k} = useT(); const len = (o.to - o.from) * k;
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
  const {f, fps, k} = useT(); const len = (o.to - o.from) * k;
  const e = enter(f, fps);
  return (
    <div style={{position: 'absolute', left: 60, top: 250, display: 'flex', alignItems: 'center', gap: 16,
      transform: `translateX(${(1 - e) * -420}px)`, opacity: exitK(f, len)}}>
      <div style={{width: 96, height: 96, borderRadius: 26, background: C.accent, color: C.ink, fontFamily: COND, fontSize: 70,
        display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'skewX(-9deg)', boxShadow: '0 8px 0 rgba(0,0,0,0.45)'}}>{o.n}</div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
        {o.label && <div style={{fontFamily: COND, fontSize: 64, color: '#fff', textTransform: 'uppercase', transform: 'skewX(-9deg)',
          WebkitTextStroke: '8px rgba(8,4,12,0.9)', paintOrder: 'stroke fill'}}>{o.label}</div>}
        {o.of && <div style={{display: 'flex', gap: 8}}>
          {Array.from({length: o.of}).map((_, i) => {
            const fill = i < o.n - 1 ? 1 : i === o.n - 1 ? interpolate(f, [4, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
            return <div key={i} style={{width: 74, height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.22)', overflow: 'hidden'}}>
              <div style={{width: `${fill * 100}%`, height: '100%', background: C.accent, boxShadow: `0 0 12px ${C.accent}`}} /></div>;
          })}
        </div>}
      </div>
    </div>
  );
};

const Alert: React.FC<{o: Extract<Overlay, {type: 'alert'}>}> = ({o}) => {
  const {f, fps, k} = useT(); const len = (o.to - o.from) * k;
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
  const {f, fps, k} = useT(); const len = (o.to - o.from) * k;
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
  const {f, fps, k} = useT(); const len = (o.to - o.from) * k;
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
  const {f, fps, k} = useT(); const len = (o.to - o.from) * k;
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
  const {f, fps, k} = useT(); const len = (o.to - o.from) * k;
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
              {row.map((key, j) => {
                const i = r * perRow + j;
                const t0 = o.times?.[i] != null ? o.times[i] * k : 6 + i * 6;
                const t = f - t0; const lit = t >= 0;
                const s = spring({frame: t, fps, config: {damping: 10, stiffness: 420, mass: 0.4}});
                const hot = lit && t < 8;
                return (
                  <div key={j} style={{width: size, height: size, borderRadius: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: hot ? C.accent : lit ? 'rgba(255,210,63,0.16)' : 'rgba(255,255,255,0.06)',
                    border: `4px solid ${lit ? C.accent : 'rgba(255,255,255,0.14)'}`, boxShadow: lit ? `0 0 ${hot ? 40 : 18}px ${C.accent}` : 'none',
                    transform: `scale(${lit ? 0.6 + 0.4 * s : 0.92})`, position: 'relative'}}>
                    <div style={{position: 'absolute', top: 8, left: 14, fontFamily: SANS, fontWeight: 800, fontSize: 26, color: hot ? C.ink : 'rgba(255,255,255,0.55)'}}>{i + 1}</div>
                    {lit && t < 12 && <div style={{position: 'absolute', inset: -8, borderRadius: 36, border: `5px solid ${C.accent}`,
                      opacity: 1 - t / 12, transform: `scale(${1 + t * 0.045})`}} />}
                    {key in ARROW_ROT
                      ? <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 48 48" style={{transform: `rotate(${ARROW_ROT[key]}deg)`, opacity: lit ? 1 : 0.25}}>
                          <path d="M24 6 L42 26 H31 V42 H17 V26 H6 Z" fill={hot ? C.ink : '#fff'} stroke={hot ? C.ink : '#fff'} strokeWidth={2} strokeLinejoin="round" />
                        </svg>
                      : <div style={{fontFamily: SANS, fontWeight: 900, fontSize: size * 0.42, color: hot ? C.ink : '#fff', opacity: lit ? 1 : 0.25}}>{key}</div>}
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

// Accroche : étiquette jaune qui « claque » en haut d'écran dès la 1re image (pattern interrupt)
const HookTag: React.FC<{o: Extract<Overlay, {type: 'hooktag'}>}> = ({o}) => {
  const {f, fps, k} = useT(); const len = (o.to - o.from) * k;
  const s = spring({frame: f, fps, config: {damping: 15, stiffness: 420, mass: 0.6}});  // amorti : claque sans rebond sous 1
  const sc = interpolate(s, [0, 1], [2.1, 1]);
  const shake = f < 10 ? Math.sin(f * 2.7) * 10 * (1 - f / 10) : 0;
  const glint = interpolate(f, [8, 22], [-30, 130], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const sub = spring({frame: f - 6, fps, config: {damping: 12, stiffness: 300, mass: 0.5}});
  return (
    <AbsoluteFill style={{alignItems: 'center', opacity: exitK(f, len, 5)}}>
      <div style={{position: 'absolute', top: 300, transform: `translateX(${shake}px) rotate(-5deg) scale(${sc})`, opacity: Math.min(1, f / 2)}}>
        <div style={{position: 'relative', overflow: 'hidden', background: C.accent, padding: '10px 44px 6px', borderRadius: 16,
          boxShadow: '0 12px 0 rgba(0,0,0,0.45), 0 0 60px rgba(255,210,63,0.55)'}}>
          <div style={{fontFamily: COND, fontSize: 118, color: C.ink, textTransform: 'uppercase', letterSpacing: 2, transform: 'skewX(-9deg)'}}>{o.text}</div>
          <div style={{position: 'absolute', top: -40, bottom: -40, left: `${glint}%`, width: 90, transform: 'skewX(-20deg)',
            background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.85), rgba(255,255,255,0))'}} />
        </div>
      </div>
      {o.sub && <div style={{position: 'absolute', top: 470, fontFamily: COND, fontSize: 70, color: '#fff', textTransform: 'uppercase',
        transform: `rotate(-5deg) translateY(${(1 - sub) * 40}px) skewX(-9deg)`, opacity: sub,
        WebkitTextStroke: '9px rgba(8,4,12,0.92)', paintOrder: 'stroke fill'}}>{o.sub}</div>}
    </AbsoluteFill>
  );
};

// CTA : titre + avatar à anneau tournant + bouton S'abonner tapé par une main + cloche + flèche vers le « + » TikTok
const Follow: React.FC<{o: Extract<Overlay, {type: 'follow'}>; accentColor: string}> = ({o, accentColor}) => {
  const {f, fps, k} = useT(); const len = (o.to - o.from) * k;
  const t1 = spring({frame: f, fps, config: {damping: 9, stiffness: 360, mass: 0.6}});
  const t2 = spring({frame: f - 5, fps, config: {damping: 11, stiffness: 260, mass: 0.6}});
  const t3 = spring({frame: f - 10, fps, config: {damping: 10, stiffness: 300, mass: 0.5}});
  const click = 30;
  const hx = interpolate(f, [12, click - 2], [1000, 640], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const hy = interpolate(f, [12, click - 2], [1500, 1215], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const press = f >= click && f < click + 5 ? 0.9 : 1;
  const done = f >= click + 2;
  const ripple = interpolate(f, [click, click + 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pulse = done ? 1 : 1 + 0.04 * Math.sin(f * 0.5);
  const bell = done ? Math.sin((f - click) * 1.3) * 22 * Math.exp(-(f - click) / 14) : 0;
  const arrow = 18 * Math.sin(f * 0.45);
  return (
    <AbsoluteFill style={{opacity: exitK(f, len, 4)}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(10,4,20,0.25), rgba(10,4,20,0.72))', opacity: t2}} />
      <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center', transform: `scale(${interpolate(t1, [0, 1], [1.8, 1])}) rotate(-3deg)`, opacity: t1}}>
        <div style={{fontFamily: COND, fontSize: 104, lineHeight: 1.04, color: '#fff', textTransform: 'uppercase', transform: 'skewX(-9deg)',
          WebkitTextStroke: '11px rgba(8,4,12,0.92)', paintOrder: 'stroke fill', textShadow: '0 10px 0 rgba(0,0,0,0.5)'}}>
          {(o.title ?? 'Plus de codes|comme ça ?').split('|').map((l, i) => <div key={i} style={{color: i === 1 ? accentColor : '#fff'}}>{l}</div>)}
        </div>
      </div>
      <div style={{position: 'absolute', top: 640, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22,
        transform: `scale(${t2})`}}>
        <div style={{position: 'relative', width: 250, height: 250}}>
          <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: `conic-gradient(from ${f * 6}deg, ${C.pink}, ${accentColor}, ${C.cyan}, ${C.pink})`}} />
          <div style={{position: 'absolute', inset: 12, borderRadius: '50%', background: 'linear-gradient(160deg, #2a1440, #0b0710)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: COND, fontSize: 110, color: '#fff'}}>{o.initials ?? 'GTA'}</div>
          <div style={{position: 'absolute', right: -6, bottom: -6, width: 84, height: 84, borderRadius: 42, background: done ? '#fff' : '#FF2E4D',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 0 rgba(0,0,0,0.35)', transform: `scale(${done ? 1 : pulse})`}}>
            {done ? <Icon name="check" size={52} color="#FF2E4D" /> : <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 66, color: '#fff', marginTop: -6}}>+</div>}
          </div>
        </div>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 50, color: '#fff', textShadow: '0 4px 12px rgba(0,0,0,0.8)'}}>{o.name ?? '@toncompte'}</div>
      </div>
      <div style={{position: 'absolute', top: 1110, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${t3 * press * pulse})`}}>
        <div style={{position: 'relative'}}>
          {f >= click && <div style={{position: 'absolute', inset: -12, borderRadius: 90, border: `7px solid ${done ? '#FF2E4D' : '#fff'}`,
            opacity: 1 - ripple, transform: `scale(${1 + ripple * 0.4})`}} />}
          <div style={{background: done ? '#fff' : '#FF2E4D', color: done ? '#FF2E4D' : '#fff', fontFamily: SANS, fontWeight: 900, fontSize: 70,
            padding: '26px 64px', borderRadius: 90, display: 'flex', alignItems: 'center', gap: 20, textTransform: 'uppercase',
            boxShadow: done ? '0 12px 0 rgba(0,0,0,0.35)' : '0 0 50px rgba(255,46,77,0.75), 0 12px 0 rgba(0,0,0,0.35)'}}>
            <div style={{transform: `rotate(${bell}deg)`, transformOrigin: '50% 10%', display: 'flex'}}><Icon name="bell" size={60} color={done ? '#FF2E4D' : '#fff'} /></div>
            {done ? (o.done ?? 'Abonné !') : (o.button ?? "Abonne-toi")}
          </div>
        </div>
      </div>
      {f < click + 16 && <div style={{position: 'absolute', left: hx, top: hy, transform: `scale(${press})`, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.6))'}}>
        <Icon name="hand" size={130} color="#fff" /></div>}
      {done && <div style={{position: 'absolute', right: 150 - arrow, top: 960, display: 'flex', alignItems: 'center', gap: 10, opacity: Math.min(1, (f - click) / 6)}}>
        <div style={{fontFamily: COND, fontSize: 64, color: accentColor, transform: 'skewX(-9deg)', WebkitTextStroke: '8px rgba(8,4,12,0.9)', paintOrder: 'stroke fill'}}>ICI</div>
        <svg width={110} height={70} viewBox="0 0 110 70"><path d="M6 35 H86 M64 10 L96 35 L64 60" stroke={accentColor} strokeWidth={12} fill="none"
          strokeLinecap="round" strokeLinejoin="round" style={{filter: `drop-shadow(0 0 10px ${accentColor})`}} /></svg>
      </div>}
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
    case 'hooktag': return <HookTag o={o} />;
    case 'follow': return <Follow o={o} accentColor={accent} />;
  }
};

// ---------- composition ----------
export const GtaGuide: React.FC<GtaEdit> = ({clips, fx, captions, overlays = [], channel, credit, accent, leaks = [], grain = 0.07}) => {
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
      {leaks.map((l, i) => (
        <Sequence key={`l${i}`} from={Math.max(0, l.at)} durationInFrames={Math.max(1, l.dur ?? 24)}><LightLeak l={l} /></Sequence>
      ))}
      {grain > 0 && <Grain amount={grain} />}
      {flash > 0 && <AbsoluteFill style={{backgroundColor: `rgba(255,255,255,${flash})`}} />}
    </AbsoluteFill>
  );
};

export const gtaGuideDefaults: GtaEdit = {clips: [], captions: [], overlays: [], durationInFrames: 90};
