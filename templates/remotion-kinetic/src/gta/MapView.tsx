/**
 * MapView — carte animée plein écran (overlay « map » de GtaGuide).
 * Fond : carte officielle de Leonida (poster Rockstar), image de base demi-résolution + crops pleine résolution
 * aux endroits zoomés. Tout est exprimé en pixels du poster (5775×7900) ; les temps en frames réelles (relatifs
 * au début de l'overlay).
 *   cam      : [{t, x, y, w, tilt?, rot?}]  centre de caméra + largeur visible (px poster) ; ease-in-out cubique
 *   pins     : épingles rouges qui tombent, anneau pulsant, étiquette (nom + sous-titre)
 *   paths    : trajets lumineux (bézier) qui se dessinent, point brillant en tête
 *   callouts : anneau de repérage + étiquette (rue, autoroute, quartier)
 *   title    : titre en haut d'écran ; cards : vignettes côte à côte (récap)
 * Effet « caméra aérienne » : inclinaison 3D légère + nuages proportionnels à la vitesse de zoom.
 */
import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, random} from 'remotion';

export type MapSpec = {
  type: 'map'; from: number; to: number;
  posterW: number; posterH: number;
  base: string; details?: {src: string; x: number; y: number; w: number; h: number}[];
  cam: {t: number; x: number; y: number; w: number; tilt?: number; rot?: number}[];
  pins?: {t: number; x: number; y: number; label?: string; sub?: string; color?: string; num?: string}[];
  paths?: {t: number; dur: number; from: [number, number]; to: [number, number]; bend?: number}[];
  callouts?: {t: number; x: number; y: number; text: string; r?: number; until?: number; side?: 'left' | 'right'}[];
  title?: {t: number; text: string; sub?: string; until?: number};
  cards?: {t: number; src: string; label: string}[];
  credit?: string;
};

const W = 1080, H = 1920;
const ease = Easing.inOut(Easing.cubic);
const Y = '#FFD23F', RED = '#FF2E4D', INK = '#0b0710';

function camAt(cam: MapSpec['cam'], f: number) {
  if (f <= cam[0].t) return {...cam[0], v: 0};
  for (let i = 0; i < cam.length - 1; i++) {
    const a = cam[i], b = cam[i + 1];
    if (f <= b.t) {
      const p = ease((f - a.t) / Math.max(1, b.t - a.t));
      const lw = Math.log(a.w) + (Math.log(b.w) - Math.log(a.w)) * p;   // zoom en espace log : vitesse perçue constante
      const v = Math.abs(Math.log(b.w / a.w)) / Math.max(1, b.t - a.t) * 60 * Math.sin(Math.PI * p); // vitesse de zoom (pour les nuages)
      return {x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, w: Math.exp(lw),
        tilt: (a.tilt ?? 0) + ((b.tilt ?? 0) - (a.tilt ?? 0)) * p, rot: (a.rot ?? 0) + ((b.rot ?? 0) - (a.rot ?? 0)) * p, v};
    }
  }
  return {...cam[cam.length - 1], v: 0};
}

const bez = (a: [number, number], b: [number, number], bend: number, t: number) => {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const cx = mx - dy * bend, cy = my + dx * bend;
  const u = 1 - t;
  return {x: u * u * a[0] + 2 * u * t * cx + t * t * b[0], y: u * u * a[1] + 2 * u * t * cy + t * t * b[1], cx, cy};
};

export const MapView: React.FC<{m: MapSpec}> = ({m}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const len = m.to - m.from;
  const c = camAt(m.cam, f);
  const s = W / c.w;                                    // px écran par px poster
  const inv = 1 / s;
  const fadeIn = interpolate(f, [0, 6], [0, 1], {extrapolateRight: 'clamp'});
  const fadeOut = interpolate(f, [len - 5, len], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const clouds = Math.min(0.85, c.v * 0.9);
  const sec = f / fps;
  return (
    <AbsoluteFill style={{backgroundColor: '#5fe0cf', opacity: Math.min(fadeIn, fadeOut), overflow: 'hidden'}}>
      <AbsoluteFill style={{perspective: 1600, perspectiveOrigin: '50% 40%'}}>
        <AbsoluteFill style={{transform: `rotateX(${c.tilt ?? 0}deg) rotateZ(${c.rot ?? 0}deg) scale(${1 + (c.tilt ?? 0) * 0.012})`, transformOrigin: '50% 55%'}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: m.posterW, height: m.posterH, transformOrigin: '0 0',
            transform: `translate(${W / 2 - c.x * s}px, ${H / 2 - c.y * s}px) scale(${s})`}}>
            <Img src={staticFile(m.base)} style={{position: 'absolute', left: 0, top: 0, width: m.posterW, height: m.posterH}} />
            {(m.details ?? []).map((d, i) => (
              <Img key={i} src={staticFile(d.src)} style={{position: 'absolute', left: d.x, top: d.y, width: d.w, height: d.h}} />
            ))}
            {/* trajets */}
            <svg width={m.posterW} height={m.posterH} viewBox={`0 0 ${m.posterW} ${m.posterH}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
              {(m.paths ?? []).map((p, i) => {
                const pr = interpolate(f, [p.t, p.t + p.dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});
                if (pr <= 0) return null;
                const q = bez(p.from, p.to, p.bend ?? 0.22, 0);
                const d = `M${p.from[0]},${p.from[1]} Q${q.cx},${q.cy} ${p.to[0]},${p.to[1]}`;
                const head = bez(p.from, p.to, p.bend ?? 0.22, pr);
                return (
                  <g key={i}>
                    <path d={d} pathLength={1} fill="none" stroke={INK} strokeOpacity={0.55} strokeWidth={22 * inv} strokeLinecap="round"
                      strokeDasharray={`${pr} 1`} />
                    <path d={d} pathLength={1} fill="none" stroke={Y} strokeWidth={11 * inv} strokeLinecap="round"
                      strokeDasharray={`${pr} 1`} style={{filter: `drop-shadow(0 0 ${8 * inv}px ${Y})`}} />
                    {pr < 1 && <circle cx={head.x} cy={head.y} r={16 * inv} fill="#fff" style={{filter: `drop-shadow(0 0 ${14 * inv}px ${Y})`}} />}
                  </g>
                );
              })}
            </svg>
            {/* repères */}
            {(m.callouts ?? []).map((co, i) => {
              const t = f - co.t; if (t < 0 || (co.until != null && f > co.until)) return null;
              const e = spring({frame: t, fps, config: {damping: 13, stiffness: 240, mass: 0.6}});
              const r = (co.r ?? 60);
              return (
                <div key={i} style={{position: 'absolute', left: co.x, top: co.y}}>
                  <div style={{position: 'absolute', left: -r, top: -r, width: 2 * r, height: 2 * r, borderRadius: '50%',
                    border: `${6 * inv}px solid ${Y}`, boxShadow: `0 0 ${18 * inv}px ${Y}`, transform: `scale(${e})`, opacity: e}} />
                  <div style={{position: 'absolute', left: co.side === 'left' ? -r * 0.75 : r * 0.75, top: -r * 1.1,
                    transform: `${co.side === 'left' ? 'translateX(-100%) ' : ''}scale(${inv * e})`, transformOrigin: co.side === 'left' ? '100% 100%' : '0 100%',
                    whiteSpace: 'nowrap', background: INK, color: Y, fontFamily: 'Montserrat', fontWeight: 900, fontSize: 40, padding: '8px 18px',
                    borderRadius: 12, boxShadow: '0 6px 16px rgba(0,0,0,0.5)'}}>{co.text}</div>
                </div>
              );
            })}
            {/* épingles */}
            {(m.pins ?? []).map((p, i) => {
              const t = f - p.t; if (t < 0) return null;
              const drop = spring({frame: t, fps, config: {damping: 9, stiffness: 320, mass: 0.6}});
              const lab = spring({frame: t - 6, fps, config: {damping: 12, stiffness: 260, mass: 0.5}});
              const ring = ((t / fps) % 1.2) / 1.2;
              const col = p.color ?? RED;
              return (
                <div key={i} style={{position: 'absolute', left: p.x, top: p.y}}>
                  <div style={{position: 'absolute', transform: `scale(${inv})`, transformOrigin: '0 0'}}>
                    <div style={{position: 'absolute', left: -70, top: -24, width: 140, height: 48, borderRadius: '50%', border: `6px solid ${col}`,
                      opacity: 1 - ring, transform: `scale(${0.4 + ring * 1.6})`}} />
                    <div style={{position: 'absolute', left: -22, top: -10, width: 44, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.35)'}} />
                    <svg width={96} height={128} viewBox="0 0 48 64" style={{position: 'absolute', left: -48, top: -124,
                      transform: `translateY(${(1 - drop) * -320}px)`, filter: `drop-shadow(0 8px 10px rgba(0,0,0,0.45)) drop-shadow(0 0 14px ${col})`}}>
                      <path d="M24 62 C24 62 4 38 4 22 A20 20 0 0 1 44 22 C44 38 24 62 24 62 Z" fill={col} stroke="#fff" strokeWidth={3} />
                      {p.num ? <><circle cx={24} cy={22} r={13} fill="#fff" />
                        <text x={24} y={28.5} textAnchor="middle" fontFamily="Anton" fontSize={18} fill={col}>{p.num}</text></>
                        : <circle cx={24} cy={22} r={8} fill="#fff" />}
                    </svg>
                    {p.label && <div style={{position: 'absolute', left: 54, top: -150, transform: `scale(${lab})`, transformOrigin: '0 100%', opacity: lab}}>
                      <div style={{background: '#fff', color: INK, fontFamily: 'Anton', fontSize: 64, lineHeight: 1, padding: '10px 24px 6px', borderRadius: 14,
                        whiteSpace: 'nowrap', boxShadow: `0 0 0 5px ${col}, 0 10px 24px rgba(0,0,0,0.5)`, transform: 'skewX(-8deg)'}}>{p.label}</div>
                      {p.sub && <div style={{marginTop: 10, background: col, color: '#fff', fontFamily: 'Montserrat', fontWeight: 800, fontSize: 30,
                        padding: '6px 16px', borderRadius: 10, whiteSpace: 'nowrap', display: 'inline-block'}}>{p.sub}</div>}
                    </div>}
                  </div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
      {/* nuages (survol rapide) */}
      {clouds > 0.02 && [0, 1, 2, 3].map((i) => (
        <div key={i} style={{position: 'absolute', left: `${(random(`cx${i}`) * 120 - 10 + sec * 40 * (i % 2 ? 1 : -1)) % 120}%`,
          top: `${random(`cy${i}`) * 90}%`, width: 900, height: 520, borderRadius: '50%', background: 'rgba(255,255,255,0.9)',
          filter: 'blur(70px)', opacity: clouds * (0.5 + 0.5 * random(`co${i}`)), transform: 'translate(-50%,-50%)'}} />
      ))}
      {/* étalonnage + vignette */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 50%, rgba(5,10,30,0.55) 100%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,10,30,0.35) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 72%, rgba(5,10,30,0.45) 100%)'}} />
      {/* titre */}
      {m.title && f >= m.title.t && (m.title.until == null || f < m.title.until) && (() => {
        const t = f - m.title.t;
        const e = spring({frame: t, fps, config: {damping: 11, stiffness: 300, mass: 0.6}});
        const out = m.title.until != null ? interpolate(f, [m.title.until - 6, m.title.until], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
        return (
          <AbsoluteFill style={{alignItems: 'center', opacity: out}}>
            <div style={{position: 'absolute', top: 250, transform: `scale(${interpolate(e, [0, 1], [1.6, 1])}) rotate(-3deg)`, opacity: Math.min(1, t / 3)}}>
              <div style={{background: Y, padding: '10px 40px 4px', borderRadius: 18, boxShadow: '0 12px 0 rgba(0,0,0,0.45), 0 0 50px rgba(255,210,63,0.6)'}}>
                <div style={{fontFamily: 'Anton', fontSize: 96, color: INK, transform: 'skewX(-9deg)', textTransform: 'uppercase', whiteSpace: 'nowrap'}}>{m.title.text}</div>
              </div>
              {m.title.sub && <div style={{textAlign: 'center', marginTop: 16, fontFamily: 'Anton', fontSize: 60, color: '#fff', textTransform: 'uppercase',
                transform: 'skewX(-9deg)', WebkitTextStroke: '9px rgba(8,4,12,0.92)', paintOrder: 'stroke fill'}}>{m.title.sub}</div>}
            </div>
          </AbsoluteFill>
        );
      })()}
      {/* vignettes côte à côte */}
      {(m.cards ?? []).map((cd, i) => {
        const t = f - cd.t; if (t < 0) return null;
        const e = spring({frame: t, fps, config: {damping: 11, stiffness: 260, mass: 0.6}});
        const x = 40 + i * 340;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: 900, width: 320, transform: `translateY(${(1 - e) * 200}px) rotate(${(i - 1) * 3}deg)`, opacity: e}}>
            <div style={{width: 320, height: 300, borderRadius: 22, overflow: 'hidden', border: '6px solid #fff', boxShadow: `0 0 0 4px ${RED}, 0 14px 30px rgba(0,0,0,0.55)`}}>
              <Img src={staticFile(cd.src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </div>
            <div style={{marginTop: -34, textAlign: 'center'}}>
              <span style={{background: RED, color: '#fff', fontFamily: 'Anton', fontSize: 40, padding: '6px 16px 2px', borderRadius: 10, whiteSpace: 'nowrap'}}>{cd.label}</span>
            </div>
          </div>
        );
      })}
      {m.credit && <div style={{position: 'absolute', left: 60, bottom: 230, fontFamily: 'Montserrat', fontWeight: 700, fontSize: 24, color: 'rgba(255,255,255,0.85)',
        textShadow: '0 2px 6px rgba(0,0,0,0.8)'}}>{m.credit}</div>}
    </AbsoluteFill>
  );
};
