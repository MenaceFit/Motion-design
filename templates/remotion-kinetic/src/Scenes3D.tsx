/*
 * Scenes3D — bibliothèque d'objets-métaphores 3D, personnages et scènes (originaux, procéduraux).
 * Tout est construit en code (formes extrudées, tours/lathe, primitives) : aucun asset tiers.
 *
 * Une scène = {type, start, end, ...params}. Elle entre (pop élastique), vit (animation propre +
 * flottement), puis sort en relais quand la scène suivante entre.
 */
import React, {useMemo} from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig, random, Easing} from 'remotion';
import * as THREE from 'three';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js';
import montserratUp from './fonts3d/montserrat-900.json';

export type SceneSpec = {
  type: 'icon' | 'crowd' | 'chart' | 'counter' | 'stairs' | 'versus' | 'emoji';
  start: number; end: number;
  icon?: string; icon2?: string; // icône (et 2e icône pour versus)
  emoji?: string;
  color?: string; color2?: string;
  action?: 'idle' | 'leave' | 'jump' | 'walk' | 'rise' | 'fall';
  count?: number;
  trend?: 'up' | 'down' | 'exp' | 'flat-then-up';
  from?: number; to?: number; suffix?: string; prefix?: string;
  label?: string; // micro-label en capitales espacées (style « Minimal Line »)
};
export type Palette = {face: string; side: string; accentFace: string; accentSide: string; light: string; glow?: string};

const GOLD = '#ffc94a';
const font = new FontLoader().parse(montserratUp as never);

// ---------- matériaux ----------
const M: React.FC<{c: string; r?: number; m?: number; e?: number; o?: number}> = ({c, r = 0.35, m = 0.2, e = 0.08, o = 1}) => (
  <meshStandardMaterial color={c} roughness={r} metalness={m} emissive={c} emissiveIntensity={e} transparent={o < 1} opacity={o} />
);

// ---------- géométries utilitaires (mises en cache) ----------
const cache = new Map<string, THREE.BufferGeometry>();
const cached = (k: string, make: () => THREE.BufferGeometry) => {
  if (!cache.has(k)) cache.set(k, make());
  return cache.get(k)!;
};
const extrude = (k: string, shape: () => THREE.Shape | THREE.Shape[], depth = 0.35, bevel = 0.05) =>
  cached(k, () => {
    const g = new THREE.ExtrudeGeometry(shape(), {depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.8, bevelSegments: 3, curveSegments: 16});
    g.center();
    return g;
  });
const poly = (pts: number[][]) => {
  const s = new THREE.Shape();
  pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  return s;
};
export const glyphGeo = (txt: string, size = 1, depth = 0.4) =>
  cached(`glyph|${txt}|${size}|${depth}`, () => {
    const g = new TextGeometry(txt, {font, size, depth, curveSegments: 8, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.03, bevelSegments: 3});
    g.center();
    return g;
  });

// ---------- formes 2D originales ----------
const heartShape = () => {
  const s = new THREE.Shape();
  s.moveTo(0, -0.9);
  s.bezierCurveTo(-0.2, -0.7, -1.0, -0.2, -1.0, 0.3);
  s.bezierCurveTo(-1.0, 0.85, -0.35, 1.05, 0, 0.6);
  s.bezierCurveTo(0.35, 1.05, 1.0, 0.85, 1.0, 0.3);
  s.bezierCurveTo(1.0, -0.2, 0.2, -0.7, 0, -0.9);
  return s;
};
const starShape = (n = 5, ro = 1, ri = 0.45) =>
  poly(Array.from({length: n * 2}, (_, i) => {
    const r = i % 2 ? ri : ro; const a = (i / (n * 2)) * Math.PI * 2 + Math.PI / 2;
    return [Math.cos(a) * r, Math.sin(a) * r];
  }));
const gearShape = (teeth = 10) => {
  const pts: number[][] = [];
  for (let i = 0; i < teeth * 4; i++) {
    const a = (i / (teeth * 4)) * Math.PI * 2; const r = i % 4 < 2 ? 1 : 0.78;
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  const s = poly(pts);
  const hole = new THREE.Path(); hole.absarc(0, 0, 0.32, 0, Math.PI * 2, true); s.holes.push(hole);
  return s;
};
const bubbleShape = () => {
  const s = new THREE.Shape(); const w = 1.1, h = 0.75, r = 0.3;
  s.moveTo(-w + r, -h); s.lineTo(-0.2, -h); s.lineTo(-0.5, -h - 0.4); s.lineTo(-0.55, -h);
  s.lineTo(w - r, -h); s.quadraticCurveTo(w, -h, w, -h + r); s.lineTo(w, h - r); s.quadraticCurveTo(w, h, w - r, h);
  s.lineTo(-w + r, h); s.quadraticCurveTo(-w, h, -w, h - r); s.lineTo(-w, -h + r); s.quadraticCurveTo(-w, -h, -w + r, -h);
  return s;
};

// ---------- icônes ----------
type IconProps = {t: number; c: string; c2: string};
const ICONS: Record<string, React.FC<IconProps>> = {
  heart: ({t, c}) => (
    <mesh geometry={extrude('heart', heartShape, 0.45)} scale={0.95 + 0.06 * Math.max(0, Math.sin(t * 7)) ** 8}><M c={c} r={0.25} /></mesh>
  ),
  bolt: ({c}) => <mesh geometry={extrude('bolt', () => poly([[0.15, 1.1], [-0.65, -0.1], [-0.05, -0.1], [-0.25, -1.1], [0.65, 0.2], [0.05, 0.2]]))}><M c={c} e={0.35} /></mesh>,
  up: ({c}) => <mesh geometry={extrude('up', () => poly([[0, 1.1], [0.85, 0.15], [0.32, 0.15], [0.32, -1], [-0.32, -1], [-0.32, 0.15], [-0.85, 0.15]]))}><M c={c} /></mesh>,
  down: ({c}) => <mesh rotation={[0, 0, Math.PI]} geometry={extrude('up', () => poly([[0, 1.1], [0.85, 0.15], [0.32, 0.15], [0.32, -1], [-0.32, -1], [-0.32, 0.15], [-0.85, 0.15]]))}><M c={c} /></mesh>,
  check: ({c}) => <mesh geometry={extrude('check', () => poly([[-1, 0.05], [-0.62, 0.42], [-0.28, 0.08], [0.62, 0.98], [1, 0.6], [-0.28, -0.7]]))}><M c={c} e={0.2} /></mesh>,
  cross: ({c}) => <mesh geometry={extrude('cross', () => poly([[-0.62, 0.95], [0, 0.33], [0.62, 0.95], [0.95, 0.62], [0.33, 0], [0.95, -0.62], [0.62, -0.95], [0, -0.33], [-0.62, -0.95], [-0.95, -0.62], [-0.33, 0], [-0.95, 0.62]]))}><M c={c} e={0.2} /></mesh>,
  star: ({c}) => <mesh geometry={extrude('star', () => starShape())}><M c={c} m={0.5} r={0.25} /></mesh>,
  crown: ({c}) => <mesh geometry={extrude('crown', () => poly([[-1, -0.6], [1, -0.6], [1.05, 0.6], [0.5, 0.05], [0, 0.85], [-0.5, 0.05], [-1.05, 0.6]]))}><M c={c} m={0.75} r={0.25} /></mesh>,
  gear: ({t, c}) => <mesh rotation={[0, 0, t * 1.5]} geometry={extrude('gear', () => gearShape(), 0.35)}><M c={c} m={0.6} r={0.35} /></mesh>,
  bubble: ({t, c, c2}) => (
    <group>
      <mesh geometry={extrude('bubble', bubbleShape, 0.3)}><M c={c} /></mesh>
      {[-0.45, 0, 0.45].map((x, i) => <mesh key={i} position={[x, 0.05 + 0.08 * Math.max(0, Math.sin(t * 8 - i)), 0.25]}><sphereGeometry args={[0.13, 16, 12]} /><M c={c2} /></mesh>)}
    </group>
  ),
  phone: ({t, c, c2}) => (
    <group>
      <mesh><boxGeometry args={[1.15, 2.2, 0.16]} /><M c="#141019" r={0.3} m={0.5} /></mesh>
      <mesh position={[0, 0, 0.085]}><planeGeometry args={[1.0, 2.0]} /><meshBasicMaterial color={c} /></mesh>
      {[0, 1, 2].map((i) => {
        const s = interpolate(t, [0.3 + i * 0.35, 0.5 + i * 0.35], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2))});
        return <mesh key={i} position={[0, 0.6 - i * 0.45, 0.1]} scale={[s, s, 1]}><boxGeometry args={[0.85, 0.32, 0.04]} /><M c={c2} e={0.3} /></mesh>;
      })}
    </group>
  ),
  clock: ({t, c, c2}) => (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh><cylinderGeometry args={[1, 1, 0.25, 48]} /><M c="#f4f0ff" r={0.4} /></mesh>
      <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1, 0.09, 12, 48]} /><M c={c} m={0.5} /></mesh>
      {Array.from({length: 12}).map((_, i) => <mesh key={i} position={[Math.sin(i / 12 * Math.PI * 2) * 0.8, 0.14, Math.cos(i / 12 * Math.PI * 2) * 0.8]}><boxGeometry args={[0.06, 0.03, 0.14]} /><M c="#2a2238" /></mesh>)}
      <group position={[0, 0.16, 0]} rotation={[0, -t * 6, 0]}><mesh position={[0, 0, -0.33]}><boxGeometry args={[0.07, 0.04, 0.7]} /><M c={c2} e={0.3} /></mesh></group>
      <group position={[0, 0.18, 0]} rotation={[0, -t * 0.5, 0]}><mesh position={[0, 0, -0.22]}><boxGeometry args={[0.1, 0.04, 0.45]} /><M c="#2a2238" /></mesh></group>
    </group>
  ),
  hourglass: ({t, c, c2}) => {
    const prof = useMemo(() => [[0.05, 0], [0.62, 0.05], [0.66, 0.35], [0.2, 0.92], [0.09, 1.0]].map(([x, y]) => new THREE.Vector2(x, y)), []);
    const sand = Math.min(1, (t % 4) / 3.5);
    return (
      <group rotation={[0, 0, t > 3.6 ? 0 : 0]}>
        {[1, -1].map((sy) => <mesh key={sy} scale={[1, sy, 1]}><latheGeometry args={[prof, 32]} /><meshStandardMaterial color="#cfe8ff" transparent opacity={0.28} roughness={0.05} side={THREE.DoubleSide} /></mesh>)}
        <mesh position={[0, 0.35 - 0.0 * sand, 0]} scale={[1 - sand * 0.9, 1 - sand * 0.9, 1 - sand * 0.9]}><coneGeometry args={[0.5, 0.55, 24]} /><M c={c2} /></mesh>
        <mesh position={[0, -0.95 + 0.25 * sand, 0]} rotation={[Math.PI, 0, 0]} scale={[0.2 + sand * 0.8, 0.2 + sand * 0.8, 0.2 + sand * 0.8]}><coneGeometry args={[0.55, 0.5, 24]} /><M c={c2} /></mesh>
        {[1.08, -1.08].map((y) => <mesh key={y} position={[0, y, 0]}><cylinderGeometry args={[0.8, 0.8, 0.14, 32]} /><M c={c} m={0.6} r={0.3} /></mesh>)}
        {[0, 1, 2].map((i) => <mesh key={i} position={[Math.cos(i * 2.1) * 0.72, 0, Math.sin(i * 2.1) * 0.72]}><cylinderGeometry args={[0.04, 0.04, 2.1, 8]} /><M c={c} m={0.6} /></mesh>)}
      </group>
    );
  },
  coin: ({t, c}) => (
    <group rotation={[0, t * 2.5, 0]}><group rotation={[Math.PI / 2, 0, 0]}>
      <mesh><cylinderGeometry args={[1, 1, 0.2, 48]} /><M c={c} m={0.85} r={0.25} /></mesh>
      <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={glyphGeo('€', 1.0, 0.08)}><M c={c} m={0.9} r={0.2} e={0.15} /></mesh>
      <mesh position={[0, -0.12, 0]} rotation={[Math.PI / 2, 0, Math.PI]} geometry={glyphGeo('€', 1.0, 0.08)}><M c={c} m={0.9} r={0.2} e={0.15} /></mesh>
    </group></group>
  ),
  coins: ({t, c}) => (
    <group>
      {Array.from({length: 7}).map((_, i) => {
        const land = 0.12 + i * 0.12;
        const y = interpolate(t, [land, land + 0.18], [3, -0.9 + i * 0.24], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
        return <mesh key={i} position={[(random(`cx${i}`) - 0.5) * 0.12, y, 0]} rotation={[0.25, random(`cr${i}`) * 3, 0]}><cylinderGeometry args={[0.85, 0.85, 0.22, 40]} /><M c={c} m={0.85} r={0.25} /></mesh>;
      })}
    </group>
  ),
  lock: ({t, c, c2}) => {
    const open = interpolate(t, [0.8, 1.1], [0, 0.45], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(3))});
    return (
      <group>
        <mesh position={[0, -0.35, 0]}><boxGeometry args={[1.6, 1.3, 0.55]} /><M c={c} m={0.6} r={0.3} /></mesh>
        <mesh position={[0, -0.3, 0.29]}><cylinderGeometry args={[0.13, 0.13, 0.05, 20]} /><M c="#1a1424" /></mesh>
        <mesh position={[0, 0.3 + open, 0]}><torusGeometry args={[0.55, 0.13, 16, 32, Math.PI]} /><M c={c2} m={0.8} r={0.2} /></mesh>
      </group>
    );
  },
  trophy: ({c}) => {
    const prof = useMemo(() => [[0, 0], [0.18, 0], [0.12, 0.35], [0.12, 0.55], [0.75, 0.9], [0.85, 1.7], [0.0, 1.7]].map(([x, y]) => new THREE.Vector2(x, y)), []);
    return (
      <group position={[0, -0.9, 0]}>
        <mesh><latheGeometry args={[prof, 40]} /><M c={c} m={0.9} r={0.2} /></mesh>
        {[1, -1].map((s) => <mesh key={s} position={[s * 0.85, 1.25, 0]} rotation={[0, 0, s * -0.2]}><torusGeometry args={[0.28, 0.07, 10, 24]} /><M c={c} m={0.9} r={0.2} /></mesh>)}
        <mesh position={[0, -0.12, 0]}><boxGeometry args={[1.0, 0.25, 0.6]} /><M c="#2a2238" r={0.5} /></mesh>
      </group>
    );
  },
  bulb: ({t, c}) => (
    <group>
      <mesh position={[0, 0.25, 0]}><sphereGeometry args={[0.85, 32, 24]} /><meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.9 + 0.3 * Math.sin(t * 6)} roughness={0.2} /></mesh>
      <mesh position={[0, -0.75, 0]}><cylinderGeometry args={[0.38, 0.32, 0.55, 24]} /><M c="#8b8fa3" m={0.8} r={0.3} /></mesh>
    </group>
  ),
  target: ({t, c, c2}) => {
    const hit = interpolate(t, [0.5, 0.7], [5, 0.25], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
    return (
      <group>
        <group rotation={[Math.PI / 2, 0, 0]}>
          {[1, 0.72, 0.44, 0.18].map((r, i) => <mesh key={i} position={[0, i * 0.04, 0]}><cylinderGeometry args={[r, r, 0.12, 48]} /><M c={i % 2 ? '#f4f0ff' : c} /></mesh>)}
        </group>
        <group position={[0.15, 0.1, hit]} rotation={[0.3, -0.25, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.7]}><cylinderGeometry args={[0.04, 0.04, 1.4, 8]} /><M c={c2} /></mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.05]}><coneGeometry args={[0.1, 0.25, 12]} /><M c="#c9c9d6" m={0.8} /></mesh>
        </group>
      </group>
    );
  },
  rocket: ({t, c, c2}) => {
    const prof = useMemo(() => [[0, -1], [0.42, -0.85], [0.48, 0.2], [0.3, 0.8], [0, 1.2]].map(([x, y]) => new THREE.Vector2(x, y)), []);
    const lift = interpolate(t, [0.6, 2.5], [0, 1.2], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
    return (
      <group position={[0, lift, 0]} rotation={[0, t * 0.8, 0]}>
        <mesh><latheGeometry args={[prof, 32]} /><M c="#f4f0ff" r={0.3} /></mesh>
        <mesh position={[0, 0.35, 0.45]}><sphereGeometry args={[0.16, 20, 16]} /><M c={c} e={0.4} /></mesh>
        {[0, 1, 2].map((i) => <mesh key={i} position={[Math.cos(i * 2.094) * 0.45, -0.75, Math.sin(i * 2.094) * 0.45]} rotation={[0, -i * 2.094, 0]}><boxGeometry args={[0.06, 0.5, 0.35]} /><M c={c} /></mesh>)}
        <mesh position={[0, -1.25, 0]} rotation={[Math.PI, 0, 0]} scale={[1, 0.8 + 0.3 * Math.abs(Math.sin(t * 25)), 1]}><coneGeometry args={[0.3, 0.6, 16]} /><meshBasicMaterial color={c2} transparent opacity={0.9} /></mesh>
      </group>
    );
  },
  battery: ({t, c, c2}) => {
    const lvl = 0.15 + 0.85 * Math.abs(Math.sin(t * 0.9));
    return (
      <group rotation={[0, 0, Math.PI / 2]}>
        <mesh><boxGeometry args={[0.95, 1.9, 0.5]} /><meshStandardMaterial color="#d8d4e6" transparent opacity={0.25} roughness={0.1} /></mesh>
        <mesh position={[0, 1.02, 0]}><boxGeometry args={[0.4, 0.14, 0.3]} /><M c="#d8d4e6" /></mesh>
        <mesh position={[0, -0.85 + 0.85 * lvl, 0]} scale={[1, lvl, 1]}><boxGeometry args={[0.8, 1.7, 0.4]} /><M c={lvl < 0.35 ? c2 : c} e={0.35} /></mesh>
      </group>
    );
  },
  magnifier: ({t, c}) => (
    <group rotation={[0, 0, 0.7 + 0.15 * Math.sin(t * 2)]}>
      <mesh position={[0, 0.35, 0]}><torusGeometry args={[0.7, 0.13, 16, 40]} /><M c={c} m={0.6} /></mesh>
      <mesh position={[0, 0.35, 0]}><circleGeometry args={[0.66, 32]} /><meshStandardMaterial color="#cfe8ff" transparent opacity={0.25} /></mesh>
      <mesh position={[0, -0.85, 0]}><cylinderGeometry args={[0.12, 0.14, 1.0, 16]} /><M c="#2a2238" /></mesh>
    </group>
  ),
  mountain: ({t, c, c2}) => {
    const flag = spring({frame: Math.max(0, (t - 0.5) * 30), fps: 30, config: {damping: 10}});
    return (
      <group position={[0, -0.6, 0]}>
        <mesh position={[0, 0.6, 0]}><coneGeometry args={[1.6, 2.2, 5]} /><M c="#5d5a72" r={0.8} /></mesh>
        <mesh position={[0, 1.38, 0]}><coneGeometry args={[0.58, 0.64, 5]} /><M c="#f4f0ff" r={0.5} /></mesh>
        <group position={[0, 1.7, 0]} scale={flag}>
          <mesh position={[0, 0.35, 0]}><cylinderGeometry args={[0.025, 0.025, 0.7, 8]} /><M c="#f4f0ff" /></mesh>
          <mesh position={[0.22, 0.55, 0]}><boxGeometry args={[0.42, 0.26, 0.03]} /><M c={c2} e={0.3} /></mesh>
        </group>
      </group>
    );
  },
};
export const ICON_NAMES = Object.keys(ICONS);

// glyphes : « € », « $ », « ? », « ! », « % », « VS », chiffres…
const Glyph: React.FC<{txt: string; c: string}> = ({txt, c}) => <mesh geometry={glyphGeo(txt, 1.6, 0.5)}><M c={c} m={0.4} r={0.25} e={0.12} /></mesh>;

// emoji en billboard (police Noto Color Emoji installée) — secours pour tout concept sans icône
const emojiTex = new Map<string, THREE.CanvasTexture>();
const EmojiBillboard: React.FC<{emoji: string}> = ({emoji}) => {
  const tex = useMemo(() => {
    if (!emojiTex.has(emoji)) {
      const cv = document.createElement('canvas'); cv.width = cv.height = 256;
      const x = cv.getContext('2d')!; x.font = '200px "Noto Color Emoji"'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(emoji, 128, 140);
      emojiTex.set(emoji, new THREE.CanvasTexture(cv));
    }
    return emojiTex.get(emoji)!;
  }, [emoji]);
  return <mesh><planeGeometry args={[2.4, 2.4]} /><meshBasicMaterial map={tex} transparent depthWrite={false} /></mesh>;
};

export const Thing: React.FC<{name: string; t: number; c: string; c2: string}> = ({name, t, c, c2}) => {
  if (ICONS[name]) { const I = ICONS[name]; return <I t={t} c={c} c2={c2} />; }
  if (name.startsWith('emoji:')) return <EmojiBillboard emoji={name.slice(6)} />;
  return <Glyph txt={name} c={c} />;
};

// ---------- personnages (capsule + tête) ----------
export const Person: React.FC<{color: string; x: number; z?: number; t: number; action?: string; delay?: number; scale?: number}> = ({color, x, z = 0, t, action = 'idle', delay = 0, scale = 1}) => {
  const tt = Math.max(0, t - delay);
  let px = x, py = 0, sq = 1, rot = 0, op = 1;
  const bob = Math.sin(t * 3 + x * 2) * 0.03;
  if (action === 'jump') { const h = Math.abs(Math.sin(tt * 5)); py = h * 0.6; sq = 1 + (h < 0.15 ? -0.12 : 0.06); }
  if (action === 'walk') { px = x + tt * 0.8; py = Math.abs(Math.sin(tt * 9)) * 0.08; rot = Math.sin(tt * 9) * 0.12; }
  if (action === 'leave') {
    const k = interpolate(tt, [0, 0.9], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
    px = x + Math.sign(x || 1) * k * 4; py = Math.abs(Math.sin(tt * 9)) * 0.08 * (k > 0 ? 1 : 0); op = 1 - k * 0.6;
  }
  if (action === 'fall') { rot = interpolate(tt, [0, 0.4], [0, Math.PI / 2], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)}); py = -0.25 * rot / (Math.PI / 2); }
  if (action === 'rise') { py = interpolate(tt, [0, 0.6], [0, 0.7], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2))}); }
  return (
    <group position={[px, py + bob, z]} rotation={[0, 0, rot]} scale={[scale, scale * sq, scale]}>
      <mesh position={[0, 0.32, 0]}><capsuleGeometry args={[0.2, 0.32, 6, 16]} /><M c={color} o={op} r={0.45} /></mesh>
      <mesh position={[0, 0.85, 0]}><sphereGeometry args={[0.17, 24, 16]} /><M c={color} o={op} r={0.45} /></mesh>
    </group>
  );
};

// ---------- scènes ----------
export const Crowd: React.FC<{s: SceneSpec; t: number; p: Palette}> = ({s, t, p}) => {
  const n = s.count ?? 7; const grey = '#8d88a6';
  return (
    <group position={[0, -0.9, 0]}>
      {Array.from({length: n}).map((_, i) => {
        const x = (i - (n - 1) / 2) * 0.62; const hero = i === Math.floor(n / 2);
        const z = -Math.abs(i - (n - 1) / 2) * 0.12;
        const act = hero ? (s.action === 'leave' ? 'idle' : s.action) : (s.action === 'rise' || s.action === 'fall' ? 'idle' : s.action);
        return <Person key={i} color={hero ? p.accentFace : grey} x={x} z={z} t={t} action={act} delay={0.25 + Math.abs(i - (n - 1) / 2) * 0.18 + random(`cd${i}`) * 0.1} scale={hero ? 1.25 : 1} />;
      })}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[2.6, 48]} /><meshBasicMaterial color="#000000" transparent opacity={0.25} /></mesh>
    </group>
  );
};

export const Chart: React.FC<{s: SceneSpec; t: number; p: Palette}> = ({s, t, p}) => {
  const n = 6; const trend = s.trend ?? 'up';
  const val = (i: number) => {
    const k = i / (n - 1);
    if (trend === 'down') return 1 - 0.8 * k;
    if (trend === 'exp') return 0.08 + Math.pow(k, 3) * 0.92;
    if (trend === 'flat-then-up') return k < 0.7 ? 0.12 + 0.04 * k : 0.12 + (k - 0.7) * 2.9;
    return 0.2 + 0.8 * k;
  };
  return (
    <group position={[-1.5, -1.0, 0]}>
      <mesh position={[1.5, -0.03, 0]}><boxGeometry args={[3.4, 0.05, 0.5]} /><M c="#f4f0ff" e={0.3} /></mesh>
      {Array.from({length: n}).map((_, i) => {
        const g = spring({frame: Math.max(0, (t - 0.15 - i * 0.12) * 30), fps: 30, config: {damping: 13, stiffness: 120}});
        const h = Math.max(0.02, val(i) * 2.3 * g);
        return <mesh key={i} position={[0.25 + i * 0.55, h / 2, 0]}><boxGeometry args={[0.38, h, 0.38]} /><M c={i === n - 1 ? p.accentFace : p.face} e={i === n - 1 ? 0.35 : 0.1} /></mesh>;
      })}
    </group>
  );
};

const counterGeo = (txt: string) => glyphGeo(txt, 1.2, 0.45);
export const Counter: React.FC<{s: SceneSpec; t: number; p: Palette}> = ({s, t, p}) => {
  const k = interpolate(t, [0.1, Math.max(0.5, (s.end - s.start) * 0.75)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const from = s.from ?? 0, to = s.to ?? 100;
  const steps = 24; // quantifié → au plus 25 géométries en cache
  const v = Math.round(from + (to - from) * Math.round(k * steps) / steps);
  const txt = `${s.prefix ?? ''}${v.toLocaleString('fr-FR').replace(/ | /g, ' ')}${s.suffix ?? ''}`;
  const g = counterGeo(txt);
  g.computeBoundingBox(); const w = g.boundingBox!.max.x - g.boundingBox!.min.x;
  return <mesh geometry={g} scale={Math.min(1, 3.6 / w)}><M c={k >= 1 ? p.accentFace : p.face} e={0.15} /></mesh>;
};

export const Stairs: React.FC<{s: SceneSpec; t: number; p: Palette}> = ({t, p}) => {
  const n = 5; const step = Math.min(n - 1, Math.max(0, Math.floor((t - 0.3) / 0.45)));
  const frac = Math.min(1, Math.max(0, ((t - 0.3) % 0.45) / 0.25));
  const cur = Math.min(n - 1, step + (t > 0.3 ? Easing.out(Easing.quad)(frac) : 0));
  return (
    <group position={[-1.4, -1.3, 0]}>
      {Array.from({length: n}).map((_, i) => <mesh key={i} position={[i * 0.65, i * 0.32 + 0.16, 0]}><boxGeometry args={[0.62, 0.32 + 0.0, 0.8]} /><M c={i === n - 1 ? GOLD : '#5d5a72'} r={0.6} /></mesh>)}
      <group position={[cur * 0.65, cur * 0.32 + 0.32 + (t > 0.3 && step < n - 1 ? Math.sin(frac * Math.PI) * 0.25 : 0), 0]}>
        <Person color={p.accentFace} x={0} t={t} action={step >= n - 1 ? 'jump' : 'idle'} />
      </group>
    </group>
  );
};

// ---------- conteneur : entrée, vie, sortie ----------
export const SceneLayer: React.FC<{s: SceneSpec; p: Palette; idx: number}> = ({s, p, idx}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const life = s.end - s.start;
  const inS = spring({frame: f, fps, config: {damping: 12, stiffness: 140, mass: 0.8}});
  const out = interpolate(t, [life - 0.04, life + 0.12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  const side = idx % 2 ? 1 : -1;
  const scale = 1.3 * (0.15 + 0.85 * inS) * (1 - out); // la métaphore occupe ~60 % de la largeur
  const rotY = interpolate(inS, [0, 1], [side * 1.4, 0]) + Math.sin(t * 1.3) * 0.18 + out * side * 1.2;
  const y = 1.45 + Math.sin(t * 2) * 0.06 + out * 1.5;
  const c = s.color ?? (s.type === 'icon' && ['coin', 'coins', 'trophy', 'crown', 'star'].includes(s.icon ?? '') ? GOLD : p.accentFace);
  const c2 = s.color2 ?? p.face;
  let body: React.ReactNode = null;
  if (s.type === 'icon') body = <Thing name={s.icon ?? '?'} t={t} c={c} c2={c2} />;
  if (s.type === 'emoji') body = <EmojiBillboard emoji={s.emoji ?? '✨'} />;
  if (s.type === 'crowd') body = <Crowd s={s} t={t} p={p} />;
  if (s.type === 'chart') body = <Chart s={s} t={t} p={p} />;
  if (s.type === 'counter') body = <Counter s={s} t={t} p={p} />;
  if (s.type === 'stairs') body = <Stairs s={s} t={t} p={p} />;
  if (s.type === 'versus') body = (
    <group>
      <group position={[-1.15, 0, 0]} scale={0.62}><Thing name={s.icon ?? '?'} t={t} c={c} c2={c2} /></group>
      <group position={[0, -0.1, 0.3]} scale={0.32}><Glyph txt="VS" c={p.face} /></group>
      <group position={[1.15, 0, 0]} scale={0.62}><Thing name={s.icon2 ?? '?'} t={t} c={s.color2 ?? p.face} c2={c} /></group>
    </group>
  );
  return (
    <group position={[0, y, -0.5]} rotation={[0.08, rotY, 0]} scale={scale}>
      {body}
    </group>
  );
};
