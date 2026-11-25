/*
 * Moteur du style « Stickman Spotlight » — calcul PUR (aucun import, aucun React).
 * Partagé par la composition Remotion (StickStory.tsx) et par le script Node
 * scripts/stickman_events.ts qui en tire les temps exacts des bruits de pas pour le mix audio.
 *
 * Repère : px à 1080×1920, y vers le bas. Le personnage regarde vers +x dans son repère local
 * (le miroir gauche/droite est appliqué au rendu). Angles en degrés :
 *   - membres : angle depuis la verticale BASSE, + = vers l'avant ;
 *   - genou : flexion ≥ 0 (le tibia part vers l'arrière) ; coude : flexion ≥ 0 (l'avant-bras monte vers l'avant) ;
 *   - pied : angle MONDE, 0 = à plat, + = pointe vers le bas (talon levé), − = pointe levée (attaque talon).
 *
 * Principes de fluidité appliqués :
 *   1. Pieds verrouillés au sol : la hauteur du bassin est déduite du point le plus bas des deux
 *      pieds (rebond naturel), et l'avancée du monde = déplacement du point d'appui → zéro glisse.
 *   2. Cycles continus : la phase de marche est intégrée dans le temps (changement d'allure sans saut).
 *   3. Aucune pose ne « pop » : chaque changement de segment est un fondu de pose (smoothstep 0,4 s).
 *   4. Superposition : jambes (allure) et bras (action) sont calculés séparément puis mélangés.
 *   5. Tout est déterministe (pas de Math.random) → rendu parallèle sans scintillement.
 */

// ---------------------------------------------------------------- dimensions du rig
export const RIG = {
  HEAD_R: 46,
  NECK: 26,
  TORSO: 212,
  THIGH: 188,
  SHIN: 184,
  UPPER: 126,
  FORE: 116,
  FOOT: 84,   // de la cheville à la pointe
  HEEL: 14,   // de la cheville au talon
  W: 22,      // épaisseur des membres
  SOLE: 11,   // demi-épaisseur : le dessous du pied touche le sol
};

export type Pose = {
  lean: number; neck: number;
  hipN: number; kneeN: number; footN: number;   // jambe proche (côté caméra)
  hipF: number; kneeF: number; footF: number;   // jambe lointaine (dessinée en gris)
  shN: number; elN: number; shF: number; elF: number;
  breath: number;  // px ajoutés au torse
  lift: number;    // px de suspension (course : phase de vol)
};

export type Motion = 'idle' | 'walk' | 'sad' | 'happy' | 'run' | 'sneak';
export type Arms = 'swing' | 'carry' | 'umbrella' | 'phone' | 'coffee' | 'bag' | 'pocket' | 'wave' | 'cheer' | 'facepalm';
export type Look = 'fwd' | 'down' | 'up' | 'back';
export type SetName = 'office' | 'rain' | 'bedroom' | 'gym' | 'park' | 'none';
export type Prop = 'folder' | 'umbrella' | 'phone' | 'coffee' | 'bag' | 'none';

export type Beat = {at: number; motion?: Motion; arms?: Arms; look?: Look; facing?: 1 | -1; prop?: Prop};
export type Scene = {
  label: string;
  set: SetName;
  duration: number;           // s
  motion?: Motion;            // défaut 'walk'
  arms?: Arms;                // défaut : selon l'accessoire
  look?: Look;
  facing?: 1 | -1;
  prop?: Prop;
  accent?: string;            // couleur de l'accessoire (unique touche de couleur de la scène)
  rain?: boolean;             // défaut : set === 'rain'
  caption?: string;           // *mot* = mot doré
  beats?: Beat[];             // changements d'action à l'intérieur de la scène (at = s depuis le début de scène)
  character?: 'man' | 'woman';// change de personnage pour cette scène (pendant la baisse de lumière)
};
export type Plan = {
  slug?: string;
  fps?: number;
  character?: 'man' | 'woman';
  lineColor?: string;         // couleur des décors en pointillés
  lightColor?: string;        // couleur du faisceau
  glowColor?: string;         // contour du personnage
  frame?: boolean;            // cadre arrondi façon « carte »
  title?: string;             // grand titre en ouverture (facultatif)
  scenes: Scene[];
  audio?: string;             // chemin relatif à public/
};

// ---------------------------------------------------------------- utilitaires
const D2R = Math.PI / 180;
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const smooth = (x: number) => { const k = clamp(x); return k * k * (3 - 2 * k); };
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const frac = (x: number) => x - Math.floor(x);
/** bruit lisse déterministe (somme de sinus incommensurables) */
export const wobble = (t: number, seed = 0) =>
  (Math.sin(t * 1.13 + seed * 3.1) + Math.sin(t * 0.71 + seed * 1.7) * 0.6 + Math.sin(t * 2.31 + seed) * 0.25) / 1.85;
/** hash déterministe 0..1 */
export const rnd = (i: number, seed = 0) => frac(Math.sin(i * 127.1 + seed * 311.7) * 43758.5453);

export const lerpPose = (a: Pose, b: Pose, k: number): Pose => {
  const o = {} as Pose;
  (Object.keys(a) as (keyof Pose)[]).forEach((key) => { o[key] = lerp(a[key], b[key], k); });
  return o;
};

// ---------------------------------------------------------------- allures (trajectoires de pied + IK)
/*
 * Chaque jambe suit une trajectoire de pied dans le repère du bassin :
 *   - appui (q ∈ [0, stance)) : le pied est AU SOL et recule à vitesse constante → verrouillage exact ;
 *     attaque talon (pointe levée, rotation autour du talon) puis déroulé (rotation autour de la pointe) ;
 *   - balancier (q ∈ [stance, 1)) : le pied revient vers l'avant sur un arc (lift), avec un « kick » arrière.
 * Le genou est obtenu par cinématique inverse à 2 segments (genou vers l'avant).
 * Tous les paramètres sont numériques → deux allures se mélangent par simple interpolation.
 */
export type Gait = {cycle: number; stride: number; stance: number; lift: number; kick: number; bob: number; hh: number; xoff: number;
  stag: number; footC: number; footTO: number; footSw: number; arm: number; armOff: number; elB: number; elA: number; lean: number; neck: number; flight: number};

export const GAITS: Record<Motion, Gait> = {
  idle:  {cycle: 0,    stride: 0,   stance: 0.6,  lift: 0,   kick: 0,  bob: 0,  hh: 381, xoff: 0,  stag: 14, footC: 0,   footTO: 0,  footSw: 0,  arm: 0,  armOff: 0,  elB: 9,  elA: 0,  lean: 2,  neck: 0,  flight: 0},
  walk:  {cycle: 1.12, stride: 220, stance: 0.6,  lift: 40,  kick: 20, bob: 7,  hh: 372, xoff: 8,  stag: 0, footC: -14, footTO: 34, footSw: 14, arm: 19, armOff: -2, elB: 10, elA: 14, lean: 4,  neck: -1, flight: 0},
  happy: {cycle: 0.96, stride: 240, stance: 0.58, lift: 56,  kick: 30, bob: 12, hh: 368, xoff: 10, stag: 0, footC: -16, footTO: 36, footSw: 16, arm: 30, armOff: 2,  elB: 14, elA: 22, lean: 1,  neck: -5, flight: 0},
  sad:   {cycle: 1.55, stride: 160, stance: 0.62, lift: 22,  kick: 8,  bob: 4,  hh: 372, xoff: 6,  stag: 0, footC: -6,  footTO: 22, footSw: 6,  arm: 5,  armOff: -3, elB: 4,  elA: 4,  lean: 9,  neck: 20, flight: 0},
  sneak: {cycle: 1.5,  stride: 200, stance: 0.62, lift: 60,  kick: 10, bob: 4,  hh: 318, xoff: 14, stag: 0, footC: -4,  footTO: 30, footSw: 10, arm: 8,  armOff: 20, elB: 70, elA: 10, lean: 14, neck: -6, flight: 0},
  run:   {cycle: 0.7,  stride: 230, stance: 0.36, lift: 105, kick: 90, bob: 9,  hh: 354, xoff: 16, stag: 0, footC: -4,  footTO: 40, footSw: 30, arm: 36, armOff: 4,  elB: 88, elA: 10, lean: 12, neck: -4, flight: 20},
};
export const cycleOf = (m: Motion) => GAITS[m].cycle;
export const lerpGait = (a: Gait, b: Gait, k: number): Gait => {
  const o = {} as Gait;
  (Object.keys(a) as (keyof Gait)[]).forEach((key) => { o[key] = lerp(a[key], b[key], k); });
  // la cadence se mélange en fréquence (sinon la vitesse « creuse » pendant le fondu)
  const fa = a.cycle ? 1 / a.cycle : 0, fb = b.cycle ? 1 / b.cycle : 0, f = lerp(fa, fb, k);
  o.cycle = f > 1e-6 ? 1 / f : 0;
  return o;
};
/** vitesse au sol (px/s) d'une allure : le pied d'appui recule de `stride` pendant stance × cycle */
export const groundSpeed = (g: Gait) => (g.cycle ? g.stride / (g.stance * g.cycle) : 0);

const FOOT_C = 35; // milieu du pied par rapport au talon ((FOOT - HEEL) / 2)

/** hauteur du bassin au-dessus du sol (rebond : bas à l'attaque, haut en milieu d'appui) */
export const hipHeight = (g: Gait, p: number) => {
  const bob = -g.bob * Math.cos(4 * Math.PI * p);
  const fl = g.flight * Math.max(0, Math.sin(Math.PI * clamp((frac(p) % 0.5 - g.stance) / (0.5 - g.stance))));
  return g.hh + bob + (g.stance < 0.5 ? fl : 0);
};

/** angles (hanche, genou, pied) d'une jambe de phase q, pour un bassin à hauteur h */
const legIK = (g: Gait, q: number, h: number, side: 1 | -1, dx = 0) => {
  q = frac(q);
  const S = g.stride, s = g.stance;
  let xc: number, lift: number, foot: number;
  if (q < s) {
    xc = S / 2 - S * (q / s);
    lift = 0;
    foot = q < 0.1 ? lerp(g.footC, 0, smooth(q / 0.1)) : q < s - 0.18 ? 0 : lerp(0, g.footTO, smooth((q - (s - 0.18)) / 0.18));
  } else {
    const u = (q - s) / (1 - s);
    xc = lerp(-S / 2, S / 2, 0.5 - 0.5 * Math.cos(Math.PI * u)) - g.kick * Math.sin(Math.PI * Math.min(1, u * 1.6)) * (1 - u);
    lift = g.lift * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.8)), 0.9);
    foot = u < 0.4 ? lerp(g.footTO, g.footSw, smooth(u / 0.4)) : lerp(g.footSw, g.footC, smooth((u - 0.4) / 0.6));
  }
  xc += g.xoff + side * g.stag + dx; // dx : correction de verrouillage au sol (voir buildTrack)
  // la ligne du pied (axe du segment) est à SOLE au-dessus du sol ; pivot talon (pointe levée) ou pointe (talon levé)
  const lineY = h - RIG.SOLE - lift;
  const heelFlatX = xc - FOOT_C;
  const c = Math.cos(foot * D2R), sn = Math.sin(foot * D2R);
  let ax: number, ay: number;
  if (foot <= 0) { ax = heelFlatX + RIG.HEEL * c; ay = lineY + RIG.HEEL * sn; }
  else { const tx = heelFlatX + RIG.HEEL + RIG.FOOT; ax = tx - RIG.FOOT * c; ay = lineY - RIG.FOOT * sn; }
  // IK 2 segments
  const T = RIG.THIGH, Sh = RIG.SHIN;
  const d = Math.min(Math.hypot(ax, ay), T + Sh - 0.5);
  const base = Math.atan2(ax, ay) / D2R; // angle depuis la verticale basse, + = avant
  const alpha = Math.acos(clamp((T * T + d * d - Sh * Sh) / (2 * T * d), -1, 1)) / D2R;
  const gamma = Math.acos(clamp((T * T + Sh * Sh - d * d) / (2 * T * Sh), -1, 1)) / D2R;
  return {hip: base + alpha, knee: 180 - gamma, foot};
};

export const IDLE: Pose = {lean: 2, neck: 0, hipN: 0, kneeN: 0, footN: 0, hipF: 0, kneeF: 0, footF: 0,
  shN: -3, elN: 9, shF: 5, elF: 9, breath: 0, lift: 0};

/** pose de jambes + bras d'une allure (éventuellement mélangée) pour une phase p (p = 0 : attaque talon jambe proche) */
export const gaitPoseG = (g: Gait, p: number, t: number, idleW = 0, cN = 0, cF = 0): Pose => {
  const h = hipHeight(g, p);
  const n = legIK(g, p, h, 1, cN), f = legIK(g, p + 0.5, h, -1, cF);
  const armPh = Math.cos(2 * Math.PI * (p + 0.04));
  const b = Math.sin(t * 2 * Math.PI / 4.2) * idleW; // respiration à l'arrêt
  return {
    lean: g.lean + Math.sin(4 * Math.PI * p) * 0.8 * (1 - idleW) + wobble(t * 0.5, 3) * 1.4 * idleW,
    neck: g.neck - Math.cos(4 * Math.PI * (p - 0.1)) * 1.6 * (1 - idleW) + wobble(t * 0.4, 7) * 3 * idleW,
    hipN: n.hip, kneeN: n.knee, footN: n.foot, hipF: f.hip, kneeF: f.knee, footF: f.foot,
    shN: g.armOff - g.arm * armPh + (-3 + b * 1.2) * idleW, elN: g.elB + g.elA * (0.5 - 0.5 * armPh),
    shF: g.armOff + g.arm * armPh + (5 - b * 1.2) * idleW, elF: g.elB + g.elA * (0.5 + 0.5 * armPh),
    breath: b * 2.2, lift: 0,
  };
};
export const gaitPose = (m: Motion, p: number, t: number): Pose => gaitPoseG(GAITS[m], p, t, m === 'idle' ? 1 : 0);

/** surcharge des bras (action) ; `base` = pose de l'allure (pour garder un peu de balancier) */
export const armPose = (a: Arms, base: Pose, t: number): Partial<Pose> => {
  const sway = (k: number) => ({shF: base.shF * k, elF: base.elF});
  switch (a) {
    case 'swing': return {};
    case 'carry': return {shN: 24, elN: 66, shF: 30, elF: 60};
    case 'umbrella': return {shN: 8, elN: 132, ...sway(0.5)};
    case 'phone': return {shN: 14, elN: 122, neck: base.neck + 16, ...sway(0.35)};
    case 'coffee': return {shN: 12, elN: 92, ...sway(0.6)};
    case 'bag': return {shN: -3 + base.shN * 0.15, elN: 6, ...sway(0.7)};
    case 'pocket': return {shN: -10 + base.shN * 0.15, elN: 18, shF: -8 + base.shF * 0.15, elF: 18};
    case 'wave': return {shN: 148, elN: 22 + 24 * Math.sin(t * 2 * Math.PI * 2.1), ...sway(0.3)};
    case 'cheer': return {shN: 158 + Math.sin(t * 9) * 5, elN: 12, shF: 150 + Math.sin(t * 9 + 1) * 5, elF: 14};
    case 'facepalm': return {shN: 20, elN: 150, neck: base.neck + 22, ...sway(0.2)};
  }
};
const LOOK: Record<Look, number> = {fwd: 0, down: 18, up: -16, back: -8};

export const defaultArms = (p?: Prop): Arms =>
  p === 'folder' ? 'carry' : p === 'umbrella' ? 'umbrella' : p === 'phone' ? 'phone' : p === 'coffee' ? 'coffee' : p === 'bag' ? 'bag' : 'swing';

// ---------------------------------------------------------------- cinématique directe
export type Pt = {x: number; y: number};
const down = (a: number, l: number): Pt => ({x: Math.sin(a * D2R) * l, y: Math.cos(a * D2R) * l});
const add = (p: Pt, q: Pt): Pt => ({x: p.x + q.x, y: p.y + q.y});

export type Skeleton = {
  hip: Pt; shoulder: Pt; head: Pt;
  legN: {knee: Pt; ankle: Pt; heel: Pt; toe: Pt}; legF: {knee: Pt; ankle: Pt; heel: Pt; toe: Pt};
  armN: {elbow: Pt; hand: Pt; fore: number}; armF: {elbow: Pt; hand: Pt; fore: number};
};
const leg = (hip: Pt, a: number, knee: number, foot: number) => {
  const k = add(hip, down(a, RIG.THIGH));
  const an = add(k, down(a - knee, RIG.SHIN));
  const fd = {x: Math.cos(foot * D2R), y: Math.sin(foot * D2R)};
  return {knee: k, ankle: an, heel: {x: an.x - fd.x * RIG.HEEL, y: an.y - fd.y * RIG.HEEL}, toe: {x: an.x + fd.x * RIG.FOOT, y: an.y + fd.y * RIG.FOOT}};
};
const arm = (sh: Pt, a: number, el: number) => {
  const e = add(sh, down(a, RIG.UPPER));
  return {elbow: e, hand: add(e, down(a + el, RIG.FORE)), fore: a + el};
};
/** squelette dans le repère local, bassin en (0,0) */
export const skeleton = (p: Pose): Skeleton => {
  const hip = {x: 0, y: 0};
  const sh = add(hip, down(180 - p.lean, RIG.TORSO + p.breath)); // vers le haut, penché vers l'avant
  const head = add(sh, down(180 - p.lean - p.neck, RIG.NECK + RIG.HEAD_R));
  return {hip, shoulder: sh, head,
    legN: leg(hip, p.hipN, p.kneeN, p.footN), legF: leg(hip, p.hipF, p.kneeF, p.footF),
    armN: arm(sh, p.shN, p.elN), armF: arm(sh, p.shF, p.elF)};
};
/** point d'appui le plus bas (y local, sous le bassin) */
const contacts = (s: Skeleton) => [s.legN.heel, s.legN.toe, s.legF.heel, s.legF.toe];
export const lowest = (s: Skeleton) => {
  let best = 0, y = -1e9;
  contacts(s).forEach((c, i) => { if (c.y > y) { y = c.y; best = i; } });
  return {i: best, y: y + RIG.SOLE};
};

// ---------------------------------------------------------------- timeline
export const BLEND = 0.4;        // s : fondu entre deux poses/allures
export const SCENE_IN = 0.55;    // s : allumage du projecteur
export const SCENE_OUT = 0.4;    // s : extinction partielle avant la scène suivante

export type Segment = {t0: number; motion: Motion; arms: Arms; look: Look; facing: 1 | -1; prop: Prop; scene: number};

export const sceneStarts = (plan: Plan) => {
  const s: number[] = []; let acc = 0;
  plan.scenes.forEach((sc) => { s.push(acc); acc += sc.duration; });
  return {starts: s, total: acc};
};

export const segments = (plan: Plan): Segment[] => {
  const {starts} = sceneStarts(plan);
  const out: Segment[] = [];
  let facing: 1 | -1 = 1;
  plan.scenes.forEach((sc, i) => {
    facing = sc.facing ?? facing;
    const prop = sc.prop ?? 'none';
    let cur: Segment = {t0: starts[i], motion: sc.motion ?? 'walk', arms: sc.arms ?? defaultArms(prop), look: sc.look ?? 'fwd', facing, prop, scene: i};
    out.push(cur);
    (sc.beats ?? []).slice().sort((a, b) => a.at - b.at).forEach((b) => {
      const p = b.prop ?? cur.prop;
      cur = {t0: starts[i] + b.at, motion: b.motion ?? cur.motion, arms: b.arms ?? (b.prop ? defaultArms(p) : cur.arms),
        look: b.look ?? cur.look, facing: b.facing ?? cur.facing, prop: p, scene: i};
      facing = cur.facing;
      out.push(cur);
    });
  });
  return out;
};

const segIndex = (segs: Segment[], t: number) => { let k = 0; for (let i = 0; i < segs.length; i++) if (segs[i].t0 <= t) k = i; return k; };

/** bras / tête d'un segment (au-dessus de la ceinture) */
const upperPose = (s: Segment, legs: Pose, p: number, t: number): Partial<Pose> => {
  const own = gaitPoseG(GAITS[s.motion], p, t, s.motion === 'idle' ? 1 : 0);
  const base = {...own, ...armPose(s.arms, own, t)};
  return {lean: base.lean, neck: base.neck + LOOK[s.look], shN: base.shN, elN: base.elN, shF: base.shF, elF: base.elF, breath: legs.breath};
};

/** allure mélangée (jambes) à l'instant t */
export const gaitAt = (segs: Segment[], t: number) => {
  const k = segIndex(segs, t);
  const cur = GAITS[segs[k].motion];
  const w = k === 0 ? 1 : smooth((t - segs[k].t0) / BLEND);
  const g = w >= 1 ? cur : lerpGait(GAITS[segs[k - 1].motion], cur, w);
  const idleW = (k > 0 && segs[k - 1].motion === 'idle' ? 1 - w : 0) + (segs[k].motion === 'idle' ? w : 0);
  return {g, idleW, k, w};
};

// précalcul à 240 Hz : phase intégrée, position monde (pieds verrouillés), contacts
const HZ = 240;
export type Track = {dt: number; n: number; phase: Float64Array; worldX: Float64Array; camX: Float64Array; facing: Float64Array; corrN: Float64Array; corrF: Float64Array;
  steps: {t: number; foot: 'N' | 'F'; strength: number; scene: number}[]; total: number; segs: Segment[]};
const cache = new Map<string, Track>();

const freqAt = (segs: Segment[], t: number) => { const c = gaitAt(segs, t).g.cycle; return c ? 1 / c : 0; };

export const poseAtPhase = (segs: Segment[], t: number, p: number, cN = 0, cF = 0): {pose: Pose; h: number} => {
  const {g, idleW, k, w} = gaitAt(segs, t);
  const legs = gaitPoseG(g, p, t, idleW, cN, cF);
  let up = upperPose(segs[k], legs, p, t);
  if (w < 1 && k > 0) {
    const prev = upperPose(segs[k - 1], legs, p, t);
    const o: Partial<Pose> = {};
    (Object.keys(up) as (keyof Pose)[]).forEach((key) => { o[key] = lerp(prev[key] as number, up[key] as number, w); });
    up = o;
  }
  return {pose: {...legs, ...up}, h: hipHeight(g, p)};
};

const facingAt = (segs: Segment[], t: number) => {
  const k = segIndex(segs, t);
  const f = segs[k].facing;
  const prev = k > 0 ? segs[k - 1].facing : f;
  if (prev === f) return f;
  const w = smooth((t - segs[k].t0) / 0.24);
  return lerp(prev, f, w); // passe par 0 : demi-tour « carte qui pivote »
};

export const buildTrack = (plan: Plan): Track => {
  const key = JSON.stringify(plan.scenes) + (plan.character ?? '');
  const hit = cache.get(key); if (hit) return hit;
  const segs = segments(plan);
  const {total} = sceneStarts(plan);
  const dt = 1 / HZ, n = Math.ceil(total * HZ) + 2;
  const phase = new Float64Array(n), worldX = new Float64Array(n), facing = new Float64Array(n), camX = new Float64Array(n);
  const corrN = new Float64Array(n), corrF = new Float64Array(n);
  // verrouillage monde par pied : un pied posé garde sa position au sol même quand la foulée change
  // (arrêt, changement d'allure en double appui) ; la correction se résorbe pendant le balancier suivant.
  const anchor: {N: number | null; F: number | null} = {N: null, F: null};
  const corr = {N: 0, F: 0};
  let lastSg = 1;
  const decay = Math.exp(-dt / 0.12);
  const steps: Track['steps'] = [];
  let ph = 0, wx = 0;
  const onGround = {N: true, F: true};
  const grounded = (sk: Skeleton, h: number) => {
    // point de contact au sol le plus bas (dessous du pied à moins de 0,6 px du sol)
    const pts = [sk.legN.heel, sk.legN.toe, sk.legF.heel, sk.legF.toe];
    let best = -1, y = -1e9;
    pts.forEach((c, i) => { if (c.y + RIG.SOLE >= h - 0.6 && c.y > y) { y = c.y; best = i; } });
    return best;
  };
  for (let i = 0; i < n; i++) {
    const t = i * dt;
    phase[i] = ph; worldX[i] = wx;
    const fc = facingAt(segs, t); facing[i] = fc;
    const {pose, h} = poseAtPhase(segs, t, ph);
    const sk = skeleton(pose);
    (['N', 'F'] as const).forEach((f) => {
      const L = f === 'N' ? sk.legN : sk.legF;
      const gap = h - (Math.max(L.heel.y, L.toe.y) + RIG.SOLE);
      if (onGround[f] && gap > 6) onGround[f] = false;
      else if (!onGround[f] && gap < 0.8) {
        onGround[f] = true;
        const k = segIndex(segs, t);
        // en fin de marche (fondu vers idle), le dernier appui sonne encore, plus doucement
        const settling = segs[k].motion === 'idle' && k > 0 && segs[k - 1].motion !== 'idle' && t - segs[k].t0 < BLEND + 0.3;
        const m = settling ? segs[k - 1].motion : segs[k].motion;
        const base = m === 'run' ? 1 : m === 'sad' || m === 'sneak' ? 0.45 : m === 'idle' ? 0 : 0.7;
        if (base > 0 && t > 0.05) steps.push({t, foot: f, strength: settling ? base * 0.6 : base, scene: segs[k].scene});
      }
    });
    const sg = fc >= 0 ? 1 : -1;
    if (sg !== lastSg) { anchor.N = anchor.F = null; corr.N = corr.F = 0; lastSg = sg; }
    (['N', 'F'] as const).forEach((f) => {
      const L = f === 'N' ? sk.legN : sk.legF, fa = f === 'N' ? pose.footN : pose.footF;
      const ref = fa <= 0 ? L.heel.x : L.toe.x - RIG.HEEL - RIG.FOOT; // talon « à plat » : avance linéairement en appui
      const locked = h - (Math.max(L.heel.y, L.toe.y) + RIG.SOLE) < 1.0;
      if (locked) {
        if (anchor[f] === null) anchor[f] = wx + sg * (ref + corr[f]);
        corr[f] = (anchor[f]! - wx) * sg - ref;
      } else { anchor[f] = null; corr[f] *= decay; }
    });
    corrN[i] = corr.N; corrF[i] = corr.F;
    // avancée = recul (repère du bassin) du point d'appui entre t et t+dt ; en vol : vitesse de l'allure
    const ph2 = ph + freqAt(segs, t) * dt;
    const sk2 = skeleton(poseAtPhase(segs, t + dt, ph2).pose);
    const gi = grounded(sk, h);
    const c0 = [sk.legN.heel, sk.legN.toe, sk.legF.heel, sk.legF.toe];
    const c1 = [sk2.legN.heel, sk2.legN.toe, sk2.legF.heel, sk2.legF.toe];
    const dx = gi >= 0 ? c0[gi].x - c1[gi].x : groundSpeed(gaitAt(segs, t).g) * dt;
    wx += dx * (fc >= 0 ? 1 : -1);
    ph = ph2;
  }
  // caméra : moyenne glissante sur ~1 cycle → le fond défile régulièrement, le corps « pousse » un peu
  const win = Math.round(0.5 * HZ);
  let acc = 0;
  const pre = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) { acc += worldX[i]; pre[i + 1] = acc; }
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - win), b = Math.min(n, i + win + 1);
    camX[i] = (pre[b] - pre[a]) / (b - a);
  }
  const tr: Track = {dt, n, phase, worldX, camX, facing, corrN, corrF, steps, total, segs};
  cache.set(key, tr);
  return tr;
};

const sample = (arr: Float64Array, tr: Track, t: number) => {
  const x = clamp(t / tr.dt, 0, tr.n - 1.001), i = Math.floor(x), k = x - i;
  return lerp(arr[i], arr[i + 1], k);
};

export type CharState = {pose: Pose; skel: Skeleton; hipY: number; worldX: number; camX: number; facing: number; phase: number;
  seg: Segment; segPrev: Segment | null; segBlend: number};

/** état complet du personnage à l'instant t (hipY : bassin par rapport au sol, négatif = au-dessus) */
export const charAt = (plan: Plan, t: number): CharState => {
  const tr = buildTrack(plan);
  const ph = sample(tr.phase, tr, t);
  const {pose, h} = poseAtPhase(tr.segs, t, ph, sample(tr.corrN, tr, t), sample(tr.corrF, tr, t));
  const skel = skeleton(pose);
  const k = segIndex(tr.segs, t);
  return {pose, skel, hipY: -h, worldX: sample(tr.worldX, tr, t), camX: sample(tr.camX, tr, t),
    facing: sample(tr.facing, tr, t), phase: ph, seg: tr.segs[k], segPrev: k > 0 ? tr.segs[k - 1] : null,
    segBlend: k > 0 ? smooth((t - tr.segs[k].t0) / BLEND) : 1};
};

/** événements audio (secondes) : pas, allumages, pluie — consommés par tools/stickman_build.py */
export const audioEvents = (plan: Plan) => {
  const tr = buildTrack(plan);
  const {starts, total} = sceneStarts(plan);
  const rainy = (i: number) => plan.scenes[i].rain ?? plan.scenes[i].set === 'rain';
  return {
    total,
    scenes: plan.scenes.map((s, i) => ({label: s.label, set: s.set, start: starts[i], end: starts[i] + s.duration, rain: rainy(i), prop: s.prop ?? 'none'})),
    steps: tr.steps.map((s) => ({t: +s.t.toFixed(4), foot: s.foot, strength: s.strength, wet: rainy(s.scene)})),
    lights: starts.map((s) => +(s + 0.02).toFixed(3)),
    // bascule de lumière : 2e clignotement du néon
    flickers: starts.map((s) => +(s + 0.2).toFixed(3)),
  };
};
