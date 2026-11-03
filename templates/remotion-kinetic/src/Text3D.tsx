import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Sequence, random, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {EffectComposer, Bloom, Vignette} from '@react-three/postprocessing';
import {noise2D} from '@remotion/noise';
import * as THREE from 'three';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {Captions, CaptionWord} from './Captions';
import gsap from 'gsap';
import {LottieOverlay, LottieSpec} from './LottieOverlay';
import montserrat from './fonts3d/montserrat-900-italic.json';
import montserratUp from './fonts3d/montserrat-900.json';
import anton from './fonts3d/anton.json';
import archivo from './fonts3d/archivo-black.json';
import {Grain} from './KineticWords';
import {SceneLayer, SceneSpec} from './Scenes3D';

const FONTS: Record<string, unknown> = {montserrat, montserratUp, anton, archivo};
const loader = new FontLoader();
const fontCache: Record<string, ReturnType<FontLoader['parse']>> = {};
const getFont = (k: string) => (fontCache[k] ??= loader.parse(FONTS[k] as never));

export type Word3D = {text: string; start: number; end: number; accent?: boolean; emoji?: string};
export type Text3DProps = {
  words: Word3D[];
  font: 'montserrat' | 'montserratUp' | 'anton' | 'archivo';
  theme: {bgTop: string; bgBottom: string; face: string; side: string; accentFace: string; accentSide: string; light: string; particles: string; glow?: string;
    accent2Face?: string; accent2Side?: string; // 2e couleur du split bicolore des mots-clés (ref01)
    captionAccent?: string}; // couleur du mot actif dans les sous-titres (ref03 : vert-jaune)
  entrance: 'flip' | 'slam' | 'twist' | 'cascade'; // cascade = lettre par lettre (courbes GSAP)
  burst?: boolean; // éclat (rayons + onde) derrière chaque mot-clé, façon mo.js
  lotties?: LottieSpec[]; // animations Lottie (After Effects → JSON) en surimpression
  voice?: string;
  music?: string;
  musicVolume?: number;
  sfx?: {src: string; at: number; volume?: number}[];
  quality?: 'draft' | 'final'; // draft : sans post-traitement (rapide)
  bloom?: boolean;
  grain?: boolean;
  scenes?: SceneSpec[];
  climaxAt?: number; // s : bascule chaude du fond (payoff / solution), comme le climax de ref01
  climax?: {bgTop: string; bgBottom: string}; // une métaphore 3D par phrase (voir Scenes3D.tsx)
  captions?: CaptionWord[]; // sous-titres karaoké (phrase complète, mot actif surligné)
  progressBar?: boolean; // barre de progression (incite à regarder jusqu'au bout)
  shake?: number; // intensité de l'impact caméra sur les mots accentués (0 = off)
  dpr?: number; // résolution interne WebGL (0.75 = 2x plus rapide, quasi invisible après compression plateforme)
};

export const text3DDefaults: Text3DProps = {
  words: [
    {text: 'TON', start: 0.15, end: 0.5},
    {text: 'CERVEAU', start: 0.5, end: 1.05, accent: true, emoji: '🧠'},
    {text: 'ADORE', start: 1.05, end: 1.5},
    {text: 'LES', start: 1.5, end: 1.8},
    {text: 'RACCOURCIS', start: 1.8, end: 2.7, accent: true},
    {text: 'MÊME', start: 2.7, end: 3.1},
    {text: 'FAUX', start: 3.1, end: 4.0, accent: true},
  ],
  font: 'montserrat',
  theme: {bgTop: '#2a0b2e', bgBottom: '#07020a', face: '#f6f0ff', side: '#5b2a86', accentFace: '#ff2e55', accentSide: '#2b0614', light: '#ffd9a8', particles: '#ffffff'},
  entrance: 'flip',
  progressBar: true,
  shake: 1,
};

const CAM_Z = 10;
const FOV = 40;

// Géométrie extrudée + biseautée. Qualité : courbes fines (12 segments), biseau arrondi (4),
// dégradé vertical sur la face (vertex colors : haut clair → bas plus sombre, look « titre 3D »).
const GEO = {size: 1, depth: 0.55, curveSegments: 12, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.04, bevelSegments: 4};
const textGeo = (txt: string, fontKey: string) => new TextGeometry(txt, {font: getFont(fontKey), ...GEO});
const advance = (txt: string, fontKey: string) => {
  const d = (getFont(fontKey) as unknown as {data: {glyphs: Record<string, {ha: number}>; resolution: number}}).data;
  return [...txt].reduce((a, c) => a + (d.glyphs[c]?.ha ?? d.glyphs['?']?.ha ?? 0), 0) / d.resolution;
};
const shade = (g: THREE.BufferGeometry, minY: number, maxY: number) => {
  const pos = g.getAttribute('position');
  const col = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const k = (pos.getY(i) - minY) / Math.max(1e-6, maxY - minY);
    const v = 0.74 + 0.26 * Math.min(1, Math.max(0, k));
    col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = v;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
};
// une ligne → 1 ou 2 morceaux (split bicolore : début / fin du mot, comme ref01)
const lineParts = (txt: string, fontKey: string, split: boolean): {gs: {g: THREE.BufferGeometry; part: 0 | 1}[]; w: number; h: number} => {
  const full = textGeo(txt, fontKey);
  full.computeBoundingBox();
  const bb = full.boundingBox!;
  const cx = (bb.min.x + bb.max.x) / 2, cy = (bb.min.y + bb.max.y) / 2, cz = (bb.min.z + bb.max.z) / 2;
  const k = Math.ceil(txt.length * 0.55);
  const pieces: {g: THREE.BufferGeometry; part: 0 | 1}[] = [];
  if (split && txt.length >= 4 && !txt.includes(' ')) {
    const a = textGeo(txt.slice(0, k), fontKey);
    const b = textGeo(txt.slice(k), fontKey);
    b.translate(advance(txt.slice(0, k), fontKey), 0, 0);
    pieces.push({g: a, part: 0}, {g: b, part: 1});
    full.dispose();
  } else pieces.push({g: full, part: 0});
  for (const pc of pieces) { pc.g.translate(-cx, -cy, -cz); shade(pc.g, bb.min.y - cy, bb.max.y - cy); }
  return {gs: pieces, w: bb.max.x - bb.min.x, h: bb.max.y - bb.min.y};
};
// Lettres individuelles (pour l'animation lettre par lettre). Chaque glyphe est une géométrie
// mise en cache et centrée sur elle-même (pivot au centre de la lettre) ; le dégradé de face
// utilise une plage verticale fixe (cohérente entre toutes les lettres).
type Glyph = {g: THREE.BufferGeometry; x: number; y: number; part: 0 | 1};
type LettersGeo = {glyphs: Glyph[]; w: number; h: number};
const charCache = new Map<string, {g: THREE.BufferGeometry; cx: number; cy: number}>();
const charGeo = (c: string, fontKey: string) => {
  const key = fontKey + '|' + c;
  let r = charCache.get(key);
  if (!r) {
    const g = textGeo(c, fontKey);
    shade(g, -0.12, 0.78);
    g.computeBoundingBox();
    const b = g.boundingBox!;
    const cx = (b.min.x + b.max.x) / 2, cy = (b.min.y + b.max.y) / 2, cz = (b.min.z + b.max.z) / 2;
    g.translate(-cx, -cy, -cz);
    r = {g, cx, cy};
    charCache.set(key, r);
  }
  return r;
};
const lettersCache = new Map<string, LettersGeo>();
const CAP_MID = 0.36; // milieu vertical approximatif des capitales (taille 1)
const buildLetters = (text: string, fontKey: string, split: boolean): LettersGeo => {
  const key = `${fontKey}|${text}|${split}`;
  const hit = lettersCache.get(key);
  if (hit) return hit;
  const words = text.split(' ');
  let rows = [text];
  if (words.length > 1 && text.length > 8) {
    let best = 1, bestDiff = 1e9;
    for (let k = 1; k < words.length; k++) {
      const d = Math.abs(words.slice(0, k).join(' ').length - words.slice(k).join(' ').length);
      if (d < bestDiff) { bestDiff = d; best = k; }
    }
    rows = [words.slice(0, best).join(' '), words.slice(best).join(' ')];
  }
  const lh = 1.18;
  const glyphs: Glyph[] = [];
  let w = 0;
  rows.forEach((row, ri) => {
    const rowY = ((rows.length - 1) / 2 - ri) * lh;
    const k = Math.ceil(row.length * 0.55);
    const start = glyphs.length;
    let pen = 0;
    [...row].forEach((c, ci) => {
      if (c !== ' ') {
        const cg = charGeo(c, fontKey);
        glyphs.push({g: cg.g, x: pen + cg.cx, y: rowY + cg.cy - CAP_MID, part: split && rows.length === 1 && ci >= k ? 1 : 0});
      }
      pen += advance(c, fontKey);
    });
    for (let i = start; i < glyphs.length; i++) glyphs[i].x -= pen / 2;
    w = Math.max(w, pen);
  });
  const res = {glyphs, w, h: (rows.length - 1) * lh + 0.78};
  lettersCache.set(key, res);
  return res;
};
const useWordGeometry = (text: string, fontKey: string, maxWidth: number, split: boolean) =>
  useMemo(() => {
    const wg = buildLetters(text, fontKey, split);
    return {wg, fit: Math.min(maxWidth / wg.w, 3.6 / wg.h)};
  }, [text, fontKey, maxWidth, split]);

// Courbes d'accélération GSAP (moteur d'easing de référence, déterministe : fonction pure de t)
const EASE = {
  back: gsap.parseEase('back.out(2.2)'),
  expo: gsap.parseEase('expo.out'),
  elastic: gsap.parseEase('elastic.out(1, 0.45)'),
  inCubic: gsap.parseEase('power3.in'),
};
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

// Éclat derrière un mot-clé (inspiré de mo.js « burst ») : rayons qui jaillissent + onde de choc
const Burst: React.FC<{color: string; t: number; radius: number}> = ({color, t, radius}) => {
  const k = clamp01(t / 0.55);
  if (k >= 1) return null;
  const e = EASE.expo(k);
  const rays = 14;
  return (
    <group position={[0, 0, -0.7]}>
      {Array.from({length: rays}).map((_, i) => {
        const a = (i / rays) * Math.PI * 2 + (i % 2) * 0.12;
        const r = radius * (0.55 + 0.75 * e) * (i % 2 ? 0.85 : 1);
        const len = radius * 0.32 * (1 - k) + 0.02;
        return (
          <mesh key={i} position={[Math.cos(a) * r, Math.sin(a) * r * 0.62, 0]} rotation={[0, 0, a]}>
            <planeGeometry args={[len, 0.07]} />
            <meshBasicMaterial color={color} transparent opacity={(1 - k) * 0.95} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        );
      })}
      <mesh scale={[radius * (0.4 + 1.1 * e), radius * (0.4 + 1.1 * e) * 0.62, 1]}>
        <ringGeometry args={[0.95, 1, 72]} />
        <meshBasicMaterial color={color} transparent opacity={(1 - k) * 0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
};

// Texture radiale partagée (halo, ombre, particules) — générée une fois, coût GPU négligeable
let _radial: THREE.CanvasTexture | null = null;
const radialTex = () => {
  if (_radial) return _radial;
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d')!; const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  return (_radial = new THREE.CanvasTexture(c));
};

const matCache = new Map<string, THREE.Material[]>();
const getMats = (face: string, side: string) => {
  const k = face + side;
  if (!matCache.has(k)) matCache.set(k, [
    new THREE.MeshPhysicalMaterial({color: face, roughness: 0.3, metalness: 0.05, clearcoat: 0.8, clearcoatRoughness: 0.18, vertexColors: true, emissive: face, emissiveIntensity: 0.06, transparent: true}),
    new THREE.MeshStandardMaterial({color: side, roughness: 0.32, metalness: 0.45, emissive: side, emissiveIntensity: 0.18, transparent: true}),
  ]);
  return matCache.get(k)!;
};

const Word: React.FC<{w: Word3D; p: Text3DProps; dur: number; maxWidth: number; idx: number; isLast?: boolean; low?: boolean}> = ({w, p, dur, maxWidth, idx, isLast, low}) => {
  const split = !!(w.accent && p.theme.accent2Face);
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {wg, fit: fit0} = useWordGeometry(w.text, p.font, maxWidth, split);
  // avec une scène : texte en bas, un peu plus petit (la métaphore occupe le haut)
  const fit = low ? fit0 * 0.78 : fit0;
  // ressort plus raide + angle d'entrée réduit : mot lisible dès ~4 frames (lisibilité à l'entrée)
  const s = spring({frame: f, fps, config: {damping: 16, stiffness: 240, mass: 0.6}});
  const out = isLast ? 0 : interpolate(f, [dur - Math.round(fps * 0.14), dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  // Entrées 3D (toutes continues, aucune propriété ne « saute »)
  // Pose de repos 3D : le mot est toujours légèrement de biais (on voit l'extrusion), alterné G/D
  const side = idx % 2 ? 1 : -1;
  let rotX = 0.16, rotY = 0.3 * side, z = 0, sc = 1;
  if (p.entrance === 'flip') { rotX += interpolate(s, [0, 1], [-0.95, 0]); z = interpolate(s, [0, 1], [-2.5, 0]); }
  if (p.entrance === 'slam') { z = interpolate(s, [0, 1], [6, 0]); sc = interpolate(s, [0, 1], [1.6, 1]); }
  const cascade = p.entrance === 'cascade';
  if (p.entrance === 'twist') { rotY += interpolate(s, [0, 1], [1.2 * -side, 0]); rotX += interpolate(s, [0, 1], [0.5, 0]); z = interpolate(s, [0, 1], [-3, 0]); }
  // Vie du mot : léger dolly + rotation lente (le mot n'est jamais figé)
  const life = f / fps;
  rotY += 0.08 * Math.sin(life * 2.2) - 0.06;
  rotX += 0.05 * Math.cos(life * 1.7);
  // Sortie : part vers la caméra en tournant (relais de mouvement vers le mot suivant)
  z += out * 5.5;
  rotX += out * 0.6;
  const opacity = 1 - out;
  const face = w.accent ? p.theme.accentFace : p.theme.face;
  const sideCol = w.accent ? p.theme.accentSide : p.theme.side;
  const mats = getMats(face, sideCol);
  const mats2 = split ? getMats(p.theme.accent2Face!, p.theme.accent2Side ?? sideCol) : mats;
  mats.forEach((m) => (m.opacity = opacity));
  mats2.forEach((m) => (m.opacity = opacity));
  const ww = wg.w * fit * sc;
  return (
    <group position={[0, low ? (p.captions?.length ? -0.5 : -1.75) : (p.captions?.length ? 0.45 : 0.2), z]}>
      {/* halo additif derrière le mot (« bloom » bon marché) */}
      <mesh position={[0, 0, -0.9]} scale={[ww * 1.25, ww * 0.55, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={radialTex()} color={p.theme.glow ?? face} transparent opacity={0.55 * opacity * s} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {p.burst !== false && w.accent ? <Burst color={p.theme.captionAccent ?? face} t={life} radius={Math.max(1.2, ww * 0.62)} /> : null}
      <group scale={fit * sc} rotation={[rotX, rotY, 0]}>
        {wg.glyphs.map((gl, j) => {
          // cascade : chaque lettre monte, bascule et grossit avec 28 ms de décalage (back.out GSAP)
          const pj = cascade ? clamp01((life - j * 0.028) / 0.38) : 1;
          const eb = EASE.back(pj), ex = EASE.expo(pj);
          return (
            <mesh key={j} geometry={gl.g} material={gl.part ? mats2 : mats}
              position={[gl.x, gl.y - (1 - ex) * 0.9, (1 - ex) * 0.8]}
              rotation={[(1 - ex) * -1.25, 0, (1 - ex) * 0.25 * (j % 2 ? 1 : -1)]}
              scale={Math.max(0.001, eb)} />
          );
        })}
      </group>
    </group>
  );
};

// Particules en profondeur (parallaxe = sensation 3D même entre les mots)
const Particles: React.FC<{color: string}> = ({color}) => {
  const f = useCurrentFrame();
  const pts = useMemo(() => {
    const arr = new Float32Array(260 * 3);
    for (let i = 0; i < 260; i++) {
      // random() déterministe (le bruit de Perlin vaut 0 sur les entiers → particules alignées)
      arr[i * 3] = (random(`px${i}`) - 0.5) * 18;
      arr[i * 3 + 1] = (random(`py${i}`) - 0.5) * 26;
      arr[i * 3 + 2] = -2 - random(`pz${i}`) * 18;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return geo;
  }, []);

  return (
    <points geometry={pts} position={[0, (f * 0.004) % 2, 0]} rotation={[0, f * 0.0015, 0]}>
      <pointsMaterial color={color} size={0.14} map={radialTex()} transparent opacity={0.6} depthWrite={false} sizeAttenuation />
    </points>
  );
};

// Éclairage « studio » : environnement procédural (RoomEnvironment → PMREM), aucun HDRI à télécharger.
// Donne de vrais reflets aux faces vernies et aux flancs métallisés.
const envCache = new WeakMap<object, THREE.Texture>();
const StudioEnv: React.FC = () => {
  const {gl, scene} = useThree();
  if (!envCache.has(gl)) {
    const pm = new THREE.PMREMGenerator(gl);
    envCache.set(gl, pm.fromScene(new RoomEnvironment(), 0.04).texture);
    pm.dispose();
  }
  scene.environment = envCache.get(gl)!;
  (scene as unknown as {environmentIntensity: number}).environmentIntensity = 0.75;
  return null;
};

const Rig: React.FC<{p: Text3DProps}> = ({p}) => {
  const f = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = f / fps;
  // Caméra continue : dérive organique (bruit de Perlin) + respiration lente
  const cx = noise2D('cx', t * 0.25, 0) * 0.35;
  const cy = noise2D('cy', 0, t * 0.25) * 0.25;
  // Impact : oscillation amortie (dolly + roulis) au début de chaque mot accentué
  let kick = 0, roll = 0;
  for (const w of p.words) {
    const dt = t - w.start;
    if (w.accent && dt >= 0 && dt < 0.8) {
      const a = Math.exp(-dt * 7) * (p.shake ?? 1);
      kick += a * Math.sin(dt * 34) * 0.35;
      roll += a * Math.sin(dt * 27 + 1) * 0.025;
    }
  }
  // changement de scène : petite poussée de caméra (sensation de « coupe » sans frame noire)
  for (const sc of p.scenes ?? []) {
    const dt = t - sc.start;
    if (dt >= 0 && dt < 0.6) kick += Math.exp(-dt * 6) * Math.sin(dt * 18 + 0.3) * 0.5;
  }
  const {camera} = useThree();
  camera.position.set(cx, -0.5 + cy, CAM_Z - kick);
  camera.lookAt(0, 0.1, 0);
  camera.rotation.z += roll;
  const visibleW = 2 * CAM_Z * Math.tan((FOV * Math.PI) / 360) * (width / height);
  return (
    <>
      <StudioEnv />
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 6]} intensity={1.9} color={p.theme.light} />
      <directionalLight position={[0, 6, -6]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[-4, -2, -3]} intensity={1.6} color={p.theme.accentFace} />
      <pointLight position={[0, 0, 4]} intensity={18} distance={12} color="#ffffff" />
      <Particles color={p.theme.particles} />
      {(p.scenes ?? []).map((sc, i) => (
        <Sequence key={`sc${i}`} from={Math.round(sc.start * fps)} durationInFrames={Math.max(2, Math.round((sc.end - sc.start + 0.15) * fps))} layout="none">
          <SceneLayer s={sc} p={p.theme} idx={i} />
        </Sequence>
      ))}
      {p.bloom !== true ? null : <EffectComposer multisampling={0}>
        <Bloom intensity={0.55} luminanceThreshold={0.62} luminanceSmoothing={0.2} mipmapBlur />
        <Vignette eskil={false} offset={0.25} darkness={0.55} />
      </EffectComposer>}
      {p.words.map((w, i) => {
        const from = Math.round(w.start * fps);
        const overlap = Math.round(fps * 0.1); // relais : sortie du mot pendant l'entrée du suivant
        const dur = Math.max(Math.round(fps * 0.18), Math.round(w.end * fps) - from) + overlap;
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none">
            <Word w={w} p={p} dur={i === p.words.length - 1 ? dur + Math.round(fps * 0.6) : dur} maxWidth={visibleW * 0.74} idx={i} isLast={i === p.words.length - 1}
              low={(p.scenes ?? []).some((sc) => w.start >= sc.start - 0.01 && w.start < sc.end)} />
          </Sequence>
        );
      })}
    </>
  );
};

// Emoji au-dessus du mot : pop élastique + flottement (police Noto Color Emoji installée)
const EmojiPop: React.FC<{emoji: string}> = ({emoji}) => {
  const f = useCurrentFrame();
  const {fps, height} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 9, stiffness: 160, mass: 0.6}});
  const y = Math.sin(f / fps * 4) * 10;
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div style={{position: 'absolute', top: height * 0.27 + y, fontSize: 210, lineHeight: 1,
        transform: `scale(${s}) rotate(${interpolate(s, [0, 1], [-25, 0])}deg)`,
        fontFamily: 'Noto Color Emoji', filter: 'drop-shadow(0 18px 22px rgba(0,0,0,0.45))'}}>{emoji}</div>
    </AbsoluteFill>
  );
};

export const durationFrom3DWords = (w: Word3D[], fps: number, c?: {end: number}[]) =>
  Math.ceil((Math.max(w.length ? w[w.length - 1].end : 3, c?.length ? c[c.length - 1].end : 0) + 0.5) * fps);

export const Text3D: React.FC<Text3DProps> = (p) => {
  const {width, height, fps} = useVideoConfig();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${p.theme.bgTop} 0%, ${p.theme.bgBottom} 100%)`}}>
      {p.climaxAt !== undefined ? (
        <AbsoluteFill style={{opacity: interpolate(f / fps, [p.climaxAt - 0.1, p.climaxAt + 0.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          background: `linear-gradient(180deg, ${p.climax?.bgTop ?? '#3a1a05'} 0%, ${p.climax?.bgBottom ?? '#0a0402'} 100%)`}} />
      ) : null}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0) 55%)'}} />
      <AbsoluteFill>
      <ThreeCanvas width={width} height={height} camera={{fov: FOV, position: [0, 0, CAM_Z]}} gl={{antialias: p.quality !== 'draft', alpha: true}} dpr={p.dpr ?? 1}>
        <Rig p={p} />
      </ThreeCanvas>
      </AbsoluteFill>
      {p.words.map((w, i) => w.emoji ? (
        <Sequence key={`e${i}`} from={Math.round(w.start * fps)} durationInFrames={Math.max(8, Math.round((w.end - w.start) * fps) + Math.round(fps * 0.1))} layout="none">
          <EmojiPop emoji={w.emoji} />
        </Sequence>
      ) : null)}
      {(p.lotties ?? []).map((l, i) => (
        <Sequence key={`lt${i}`} from={Math.round(l.start * fps)} durationInFrames={Math.max(2, Math.round((l.end - l.start) * fps))} layout="none">
          <LottieOverlay spec={l} />
        </Sequence>
      ))}
      {p.captions?.length ? <Captions words={p.captions} accent={p.theme.captionAccent ?? '#d7ff3a'} /> : null}
      {/* light sweep : barre lumineuse diagonale qui balaie l'écran à chaque nouvelle scène (ref02) */}
      {(p.scenes ?? []).map((sc, i) => {
        const k = (f / fps - sc.start + 0.05) / 0.32;
        if (i === 0 || k < 0 || k > 1) return null;
        const x = interpolate(k, [0, 1], [-60, 160], {easing: Easing.inOut(Easing.quad)});
        return <AbsoluteFill key={`ls${i}`} style={{mixBlendMode: 'screen', pointerEvents: 'none',
          background: `linear-gradient(105deg, transparent ${x - 18}%, rgba(255,255,255,0.0) ${x - 10}%, rgba(255,245,235,0.32) ${x}%, rgba(255,255,255,0.0) ${x + 10}%, transparent ${x + 18}%)`}} />;
      })}
      {p.progressBar ? <AbsoluteFill><div style={{position: 'absolute', top: 0, left: 0, height: 10, width: `${(f / Math.max(1, durationFrom3DWords(p.words, fps, p.captions) - 1)) * 100}%`, background: p.theme.accentFace, boxShadow: `0 0 18px ${p.theme.accentFace}`}} /></AbsoluteFill> : null}
      {p.grain === false ? null : <Grain seed={f % 4} opacity={0.08} />}
      {p.voice ? <Audio src={staticFile(p.voice)} /> : null}
      {p.music ? <Audio src={staticFile(p.music)} volume={p.musicVolume ?? 0.35} /> : null}
      {(p.sfx ?? []).map((s, i) => (
        <Sequence key={`s${i}`} from={Math.max(0, Math.round(s.at * fps))} layout="none">
          <Audio src={staticFile(s.src)} volume={s.volume ?? 0.5} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
