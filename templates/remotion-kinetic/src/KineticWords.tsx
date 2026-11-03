import React from 'react';
import {AbsoluteFill, Sequence, spring, interpolate, useCurrentFrame, useVideoConfig, Audio, staticFile, random} from 'remotion';
import '@fontsource/montserrat/900-italic.css';

export type Word = {text: string; start: number; end: number; accent?: boolean};
export type KineticProps = {
  words: Word[];
  palette: {bgInner: string; bgOuter: string; colorA: string; colorB: string; stroke: string};
  sfx?: {src: string; at: number; volume?: number}[];
  autoSfx?: boolean; // pop sur chaque mot, sub_hit sur les mots accentués
  voice?: string;
};

// Plan SFX automatique : le son tombe 1 frame AVANT l'image (le cerveau perçoit
// l'audio ~1 frame plus vite → l'impact paraît parfaitement synchro).
export const autoSfxPlan = (words: Word[], fps: number) =>
  words.flatMap((w, i) => {
    const at = Math.max(0, w.start - 1 / fps);
    return w.accent
      ? [{src: 'sfx/sub_hit_01.wav', at, volume: 0.55}, {src: 'sfx/pop_01.wav', at, volume: 0.35}]
      : [{src: i % 2 ? 'sfx/pop_02.wav' : 'sfx/pop_01.wav', at, volume: 0.28}];
  });

export const durationFromWords = (w: Word[], fps: number) =>
  Math.ceil(((w.length ? w[w.length - 1].end : 3) + 0.6) * fps);

export const kineticSchemaDefaults: KineticProps = {
  words: [
    {text: 'TON', start: 0.2, end: 0.55},
    {text: 'CERVEAU', start: 0.55, end: 1.1, accent: true},
    {text: 'ADORE', start: 1.1, end: 1.6},
    {text: 'LES', start: 1.6, end: 1.9},
    {text: 'RACCOURCIS', start: 1.9, end: 2.8, accent: true},
    {text: 'MÊME', start: 2.8, end: 3.2},
    {text: 'FAUX', start: 3.2, end: 4.0, accent: true},
  ],
  palette: {bgInner: '#4a1846', bgOuter: '#14061a', colorA: '#ff3d5a', colorB: '#3d8bff', stroke: '#1a0820'},
  sfx: [],
  autoSfx: true,
};

// Grain animé (feTurbulence) : casse le banding des dégradés après compression H.264
export const Grain: React.FC<{seed: number; opacity?: number}> = ({seed, opacity = 0.09}) => (
  <AbsoluteFill style={{opacity, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
    <svg width="100%" height="100%">
      <filter id={`g${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" /></filter>
      <rect width="100%" height="100%" filter={`url(#g${seed})`} />
    </svg>
  </AbsoluteFill>
);

// Fond : dégradé radial + particules lentes (parallaxe légère)
const Background: React.FC<{p: KineticProps['palette']}> = ({p}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const dots = new Array(28).fill(0).map((_, i) => {
    const x = random(`x${i}`) * width;
    const y = (random(`y${i}`) * height - f * (0.3 + random(`s${i}`) * 0.8) + height) % height;
    const r = 2 + random(`r${i}`) * 5;
    return <div key={i} style={{position: 'absolute', left: x, top: y, width: r, height: r, borderRadius: r,
      border: '2px solid rgba(255,255,255,0.32)'}} />;
  });
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 42%, ${p.bgInner} 0%, ${p.bgOuter} 75%)`}}>
      {dots}
      <Grain seed={f % 3} />
    </AbsoluteFill>
  );
};

// Un mot : pop en scale avec overshoot (spring), split bicolore, ombre portée dure, micro-drift
const PopWord: React.FC<{w: Word; p: KineticProps['palette']; dur: number}> = ({w, p, dur}) => {
  const f = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 13, stiffness: 420, mass: 0.5}});
  const scale = interpolate(s, [0, 1], [0.72, 1]);
  const rot = interpolate(s, [0, 1], [-6, 0]);
  const drift = interpolate(f, [0, dur], [1, 1.05], {extrapolateRight: 'clamp'});
  const opacityOut = interpolate(f, [dur - 2, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const split = Math.ceil(w.text.length * 0.55);
  // Auto-fit : ~0.74 em par glyphe (Montserrat 900 italic), 78 % de la largeur pour garder la marge de l'overshoot
  const size = Math.min(240, (width * 0.78) / (Math.max(3, w.text.length) * 0.74));
  const common: React.CSSProperties = {
    fontFamily: 'Montserrat', fontWeight: 900, fontStyle: 'italic', fontSize: size, letterSpacing: -2,
    WebkitTextStroke: `${size * 0.05}px ${p.stroke}`, paintOrder: 'stroke fill',
    textShadow: `0 ${size * 0.06}px 0 ${p.stroke}, 0 0 ${size * 0.4}px rgba(0,0,0,0.35)`,
  };
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: opacityOut}}>
      <div style={{transform: `scale(${scale * drift}) rotate(${rot}deg)`, whiteSpace: 'nowrap'}}>
        <span style={{...common, color: w.accent ? p.colorA : '#f4ecff'}}>{w.text.slice(0, split)}</span>
        <span style={{...common, color: w.accent ? p.colorB : '#f4ecff'}}>{w.text.slice(split)}</span>
      </div>
    </AbsoluteFill>
  );
};

export const KineticWords: React.FC<KineticProps> = ({words, palette, sfx, voice, autoSfx}) => {
  const {fps} = useVideoConfig();
  const allSfx = [...(sfx ?? []), ...(autoSfx ? autoSfxPlan(words, fps) : [])];
  return (
    <AbsoluteFill>
      <Background p={palette} />
      {words.map((w, i) => {
        const from = Math.round(w.start * fps);
        const dur = Math.max(4, Math.round(w.end * fps) - from);
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none">
            <PopWord w={w} p={palette} dur={dur} />
          </Sequence>
        );
      })}
      {voice ? <Audio src={staticFile(voice)} /> : null}
      {allSfx.map((s, i) => (
        <Sequence key={`sfx${i}`} from={Math.round(s.at * fps)} layout="none">
          <Audio src={staticFile(s.src)} volume={s.volume ?? 0.6} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
