import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

// Habillage « Retro Sunset » (synthwave années 80 générique : soleil rayé, grille néon, palmiers).
// Éléments 100 % procéduraux et originaux — aucun logo, police ni asset d'un jeu existant.
// + overlays de série interactive : badge d'épisode, jauge d'abonnés à paliers, carte de vote.

export type DecorSpec = {type: 'retro'; sun?: [string, string]; grid?: string; sky?: [string, string, string]; horizon?: number};
export type EpisodeSpec = {label: string; sub?: string; color?: string};
export type GaugeSpec = {value: number; goal: number; label?: string; milestones?: {at: number; label: string}[]; color?: string};
export type VoteSpec = {start: number; end: number; title: string; options: {key: string; text: string}[]; color?: string; color2?: string};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Palmier stylisé (silhouette) : tronc courbé + 7 palmes
const Palm: React.FC<{x: number; base: number; h: number; flip?: boolean; sway: number; color: string}> = ({x, base, h, flip, sway, color}) => {
  const s = flip ? -1 : 1;
  const topX = x + s * h * 0.22, topY = base - h;
  const fronds = [-150, -115, -80, -45, -10, 25, 60].map((a, i) => {
    const ang = ((a + sway * (i % 2 ? 1 : 0.7)) * Math.PI) / 180;
    const L = h * (0.42 + 0.06 * Math.sin(i * 1.7));
    const ex = topX + s * Math.cos(ang) * L, ey = topY + Math.sin(ang) * L * 0.55 + L * 0.28;
    const cx = topX + s * Math.cos(ang) * L * 0.5, cy = topY + Math.sin(ang) * L * 0.5 - L * 0.12;
    return <path key={i} d={`M${topX},${topY} Q${cx},${cy - 18} ${ex},${ey} Q${cx},${cy + 14} ${topX},${topY + 6} Z`} fill={color} />;
  });
  return (
    <g>
      <path d={`M${x - 14},${base} Q${x + s * h * 0.05},${base - h * 0.55} ${topX - 7},${topY} L${topX + 7},${topY} Q${x + s * h * 0.08 + 16},${base - h * 0.55} ${x + 14},${base} Z`} fill={color} />
      {fronds}
    </g>
  );
};

export const RetroDecor: React.FC<{d: DecorSpec; climaxAt?: number}> = ({d, climaxAt}) => {
  const f = useCurrentFrame();
  const {fps, width: W, height: H} = useVideoConfig();
  const t = f / fps;
  const hz = H * (d.horizon ?? 0.66);
  const [sky0, sky1, sky2] = d.sky ?? ['#0b0220', '#3a0a5e', '#ff4f8b'];
  const [sunA, sunB] = d.sun ?? ['#ffd319', '#ff2975'];
  const grid = d.grid ?? '#ff3fd2';
  const heat = climaxAt === undefined ? 0 : interpolate(t, [climaxAt - 0.1, climaxAt + 0.8], [0, 1], clamp);
  const R = W * 0.34 * (1 + 0.012 * Math.sin(t * 2.4)) * (1 + 0.08 * heat);
  const sunY = hz - R * 0.12;
  // bandes du soleil qui défilent vers le bas (comme les visuels synthwave)
  const bands = Array.from({length: 7}).map((_, i) => {
    const k = ((i + (t * 0.35) % 1) / 7);
    const y = sunY - R * 0.05 + k * R * 0.95;
    return <rect key={i} x={W / 2 - R} y={y} width={R * 2} height={6 + k * 26} fill="#000" />;
  });
  // grille en perspective : horizontales qui avancent (z²), verticales qui convergent
  const rows = Array.from({length: 14}).map((_, i) => {
    const z = (i + (t * 1.1) % 1) / 14;
    const y = hz + (H - hz) * z * z;
    return <line key={`h${i}`} x1={0} x2={W} y1={y} y2={y} stroke={grid} strokeWidth={1 + z * 4} opacity={0.15 + z * 0.75} />;
  });
  const cols = Array.from({length: 23}).map((_, i) => {
    const u = (i - 11) / 11;
    return <line key={`v${i}`} x1={W / 2 + u * W * 0.18} y1={hz} x2={W / 2 + u * W * 2.4} y2={H} stroke={grid} strokeWidth={2.5} opacity={0.55} />;
  });
  const stars = Array.from({length: 70}).map((_, i) => {
    const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (1 + random(`ts${i}`) * 3) + i));
    return <circle key={i} cx={random(`sx${i}`) * W} cy={random(`sy${i}`) * hz * 0.8} r={1 + random(`sr${i}`) * 2.2} fill="#fff" opacity={tw * 0.8} />;
  });
  const sway = Math.sin(t * 1.3) * 4;
  return (
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <linearGradient id="rsky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={sky0} /><stop offset="0.62" stopColor={sky1} /><stop offset="1" stopColor={sky2} />
          </linearGradient>
          <linearGradient id="rsun" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={sunA} /><stop offset="1" stopColor={sunB} />
          </linearGradient>
          <linearGradient id="rfloor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a0640" /><stop offset="1" stopColor="#07010f" />
          </linearGradient>
          <radialGradient id="rglow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={sunB} stopOpacity={0.55 + 0.25 * heat} /><stop offset="1" stopColor={sunB} stopOpacity="0" />
          </radialGradient>
          <mask id="rsunmask">
            <rect x={0} y={0} width={W} height={H} fill="#fff" />
            {bands}
          </mask>
          <clipPath id="rabove"><rect x={0} y={0} width={W} height={hz} /></clipPath>
        </defs>
        <rect width={W} height={hz} fill="url(#rsky)" />
        {stars}
        <ellipse cx={W / 2} cy={sunY} rx={R * 2.1} ry={R * 1.5} fill="url(#rglow)" clipPath="url(#rabove)" />
        <g clipPath="url(#rabove)"><circle cx={W / 2} cy={sunY} r={R} fill="url(#rsun)" mask="url(#rsunmask)" /></g>
        <rect y={hz} width={W} height={H - hz} fill="url(#rfloor)" />
        <g style={{filter: `drop-shadow(0 0 6px ${grid})`}}>{cols}{rows}</g>
        <line x1={0} x2={W} y1={hz} y2={hz} stroke="#ffd1f3" strokeWidth={4} style={{filter: `drop-shadow(0 0 14px ${grid})`}} />
        <Palm x={W * 0.06} base={hz + 30} h={H * 0.36} sway={sway} color="#12021c" />
        <Palm x={W * 0.17} base={hz + 10} h={H * 0.24} sway={-sway} color="#1a0428" />
        <Palm x={W * 0.95} base={hz + 30} h={H * 0.33} flip sway={-sway} color="#12021c" />
      </svg>
      {/* assombrit le centre-haut pour garder le texte 3D lisible */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 26% at 50% 36%, rgba(8,0,20,0.28) 0%, rgba(8,0,20,0) 100%)'}} />
    </AbsoluteFill>
  );
};

const NEON = (c: string) => `0 0 6px ${c}, 0 0 18px ${c}, 0 0 36px ${c}`;
const fmt = (n: number) => Math.round(n).toLocaleString('fr-FR').replace(/ | /g, ' ');

export const EpisodeBadge: React.FC<{e: EpisodeSpec}> = ({e}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - 4, fps, config: {damping: 12, stiffness: 180}});
  const c = e.color ?? '#ff2bd6';
  return (
    <div style={{position: 'absolute', left: 54, top: 240, transform: `translateX(${(1 - s) * -260}px) rotate(-4deg)`, fontFamily: 'Montserrat'}}>
      <div style={{display: 'inline-block', padding: '10px 26px', border: `5px solid ${c}`, borderRadius: 16, color: '#fff', fontWeight: 900, fontStyle: 'italic',
        fontSize: 54, letterSpacing: 2, boxShadow: `${NEON(c)}, inset 0 0 18px ${c}`, textShadow: NEON(c), background: 'rgba(10,0,25,0.55)'}}>{e.label}</div>
      {e.sub ? <div style={{marginTop: 12, color: '#ffe45c', fontWeight: 800, fontSize: 34, letterSpacing: 3, textShadow: '0 3px 0 #2a0640'}}>{e.sub}</div> : null}
    </div>
  );
};

export const SubGauge: React.FC<{g: GaugeSpec}> = ({g}) => {
  const f = useCurrentFrame();
  const {fps, width: W} = useVideoConfig();
  const t = f / fps;
  const c = g.color ?? '#22f1ff';
  const fill = interpolate(t, [0.4, 1.6], [0, g.value / g.goal], {...clamp, easing: Easing.out(Easing.cubic)});
  const shown = fill * g.goal;
  const w = W * 0.58;
  const appear = interpolate(t, [0.1, 0.5], [0, 1], clamp);
  const shimmer = ((t * 0.6) % 1) * 140 - 20;
  return (
    <div style={{position: 'absolute', right: 54, top: 240, width: w, opacity: appear, fontFamily: 'Montserrat', color: '#fff'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: 900, fontSize: 30, letterSpacing: 1.5}}>
        <span style={{textShadow: NEON('#ff2bd6')}}>{g.label ?? 'ABONNÉS'}</span>
        <span style={{fontStyle: 'italic', fontSize: 36, textShadow: '0 3px 0 #2a0640'}}>{fmt(shown)} <span style={{opacity: 0.7}}>/ {fmt(g.goal)}</span></span>
      </div>
      <div style={{position: 'relative', marginTop: 10, height: 26, borderRadius: 13, border: `3px solid ${c}`, boxShadow: NEON(c), background: 'rgba(10,0,25,0.7)', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.max(fill * 100, 1.2)}%`, background: `linear-gradient(90deg, #ff2bd6, ${c})`}} />
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(100deg, transparent ${shimmer - 12}%, rgba(255,255,255,0.35) ${shimmer}%, transparent ${shimmer + 12}%)`}} />
      </div>
      <div style={{position: 'relative', height: 40, marginTop: 6}}>
        {(g.milestones ?? []).map((m, i) => (
          <div key={i} style={{position: 'absolute', left: `${(m.at / g.goal) * 100}%`, transform: 'translateX(-100%)', textAlign: 'right', fontSize: 22, fontWeight: 800,
            color: g.value >= m.at ? c : '#ffd1f3', whiteSpace: 'nowrap', opacity: 0.95}}>▲ {m.label}</div>
        ))}
      </div>
    </div>
  );
};

export const VoteCard: React.FC<{v: VoteSpec}> = ({v}) => {
  const f = useCurrentFrame();
  const {fps, height: H} = useVideoConfig();
  const t = f / fps; // relatif au début de la Sequence
  const c = v.color ?? '#ff2bd6', c2 = v.color2 ?? '#22f1ff';
  const s = spring({frame: f, fps, config: {damping: 13, stiffness: 170}});
  const dur = v.end - v.start;
  const out = interpolate(t, [dur - 0.2, dur], [0, 1], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center', pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: H * 0.205, width: '78%', padding: '22px 32px 26px', borderRadius: 34, border: `6px solid ${c}`,
        background: 'linear-gradient(180deg, rgba(30,4,52,0.93), rgba(12,1,26,0.93))', boxShadow: `${NEON(c)}, inset 0 0 30px rgba(255,43,214,0.35)`,
        transform: `scale(${0.6 + 0.4 * s}) rotate(${(1 - s) * -6}deg)`, opacity: s * (1 - out), fontFamily: 'Montserrat', color: '#fff'}}>
        <div style={{textAlign: 'center', fontWeight: 900, fontStyle: 'italic', fontSize: 46, letterSpacing: 2, color: '#ffe45c', textShadow: '0 4px 0 #6b0f5c, 0 0 24px rgba(255,228,92,0.6)'}}>{v.title}</div>
        {v.options.map((o, i) => {
          const k = spring({frame: f - Math.round((0.35 + i * 0.32) * fps), fps, config: {damping: 11, stiffness: 200}});
          const pulse = 1 + 0.025 * Math.sin(t * 6 + i * 2);
          const col = i % 2 ? c2 : c;
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 16, padding: '10px 20px', borderRadius: 22, border: `4px solid ${col}`,
              boxShadow: NEON(col), background: 'rgba(255,255,255,0.04)', transform: `translateX(${(1 - k) * (i % 2 ? 420 : -420)}px) scale(${pulse})`, opacity: k}}>
              <div style={{width: 72, height: 72, borderRadius: 16, background: col, color: '#14042b', fontWeight: 900, fontSize: 52, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{o.key}</div>
              <div style={{fontWeight: 900, fontStyle: 'italic', fontSize: 54, letterSpacing: 1.5, textShadow: `0 4px 0 #2a0640, ${NEON(col)}`}}>{o.text}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
