/*
 * Rendu du personnage « Stickman Spotlight » : segments noirs à contour lumineux, membres lointains
 * en gris (profondeur), tête ronde + œil-point, variante femme (robe trapèze + queue de cheval à
 * retard), accessoires tenus (dossier doré, parapluie, téléphone, café, mallette).
 * Repère local : bassin en (0,0), y vers le bas, regard vers +x (le miroir est fait par le parent).
 */
import React from 'react';
import {Pose, Prop, RIG, Skeleton, Pt, wobble} from './engine';

export type FigureProps = {
  skel: Skeleton;
  pose: Pose;
  t: number;
  phase: number;
  moving: number;           // 0..1 (amplitude des effets secondaires)
  character?: 'man' | 'woman';
  glow?: string;
  prop?: Prop;
  propIn?: number;          // 0..1 apparition de l'accessoire
  prevProp?: Prop;
  prevPropOut?: number;     // 1..0 disparition de l'accessoire précédent
  accent?: string;
  uid: string;              // préfixe d'ids SVG unique
};

const INK = '#050505';
const FAR = '#7c7c7c';

const Seg: React.FC<{a: Pt; b: Pt; w?: number; line: string; core?: string; ow?: number; op?: number}> = ({a, b, w = RIG.W, line, core = INK, ow = 3.2, op = 1}) => (
  <g opacity={op}>
    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={line} strokeWidth={w + ow * 2} strokeLinecap="round" />
    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={core} strokeWidth={w} strokeLinecap="round" />
  </g>
);

/** jambe : cuisse, tibia, pied (le pied est un segment talon → pointe) */
const Leg: React.FC<{hip: Pt; L: Skeleton['legN']; line: string; op?: number; core?: string}> = ({hip, L, line, op, core}) => (
  <g>
    <Seg a={hip} b={L.knee} line={line} op={op} core={core} />
    <Seg a={L.knee} b={L.ankle} line={line} op={op} core={core} />
    <Seg a={L.heel} b={L.toe} line={line} op={op} core={core} w={RIG.W - 2} />
  </g>
);
const Arm: React.FC<{sh: Pt; A: Skeleton['armN']; line: string; op?: number; core?: string}> = ({sh, A, line, op, core}) => (
  <g>
    <Seg a={sh} b={A.elbow} line={line} op={op} core={core} w={RIG.W - 3} />
    <Seg a={A.elbow} b={A.hand} line={line} op={op} core={core} w={RIG.W - 4} />
  </g>
);

const blink = (t: number) => {
  const per = 3.3, ph = t % per;
  return ph > per - 0.1 ? 0.15 : 1;
};

// ------------------------------------------------------------------ accessoires
const Umbrella: React.FC<{hand: Pt; color: string; tilt: number; t: number; uid: string; k: number}> = ({hand, color, tilt, t, uid, k}) => {
  const len = 300, R = 196, H = 92, n = 8;
  // repère : poignée à la main, axe vers le haut incliné de `tilt` degrés vers l'avant
  const scal = Array.from({length: n}, (_, i) => {
    const x0 = -R + (2 * R * i) / n, x1 = -R + (2 * R * (i + 1)) / n;
    return `Q${(x0 + x1) / 2} ${-len + 22} ${x1} ${-len}`;
  }).join(' ');
  const ribs = Array.from({length: n + 1}, (_, i) => -R + (2 * R * i) / n);
  const drops = Array.from({length: 7}, (_, i) => {
    const ph = (t * 1.7 + i * 0.37) % 1;
    const x = -R * 0.8 + ((i * 97) % 100) / 100 * R * 1.6;
    return {x, y: -len - H * 0.95 * (1 - (x / R) ** 2) - 6 - ph * 18, o: (1 - ph) * 0.8};
  });
  return (
    <g transform={`translate(${hand.x} ${hand.y}) rotate(${tilt}) scale(${k})`}>
      <defs>
        <radialGradient id={`${uid}-ug`} cx="0.5" cy="0.15" r="0.9">
          <stop offset="0" stopColor={color} stopOpacity={0.55} />
          <stop offset="1" stopColor={color} stopOpacity={0.12} />
        </radialGradient>
      </defs>
      {/* manche (traverse le poing) + crosse en J */}
      <line x1={0} y1={30} x2={0} y2={-len - H * 0.95} stroke="#f3e6c4" strokeWidth={5} strokeLinecap="round" />
      <path d="M0 30 q0 26 -20 22" stroke="#f3e6c4" strokeWidth={5} fill="none" strokeLinecap="round" />
      {/* toile */}
      <path d={`M${-R} ${-len} ${scal} C${R * 0.92} ${-len - H * 1.25} ${-R * 0.92} ${-len - H * 1.25} ${-R} ${-len}Z`}
        fill={`url(#${uid}-ug)`} stroke={color} strokeWidth={5} strokeLinejoin="round" filter={`url(#${uid}-glowc)`} />
      {/* baleines en pointillés */}
      {ribs.map((x, i) => (
        <path key={i} d={`M0 ${-len - H * 0.95} Q${x * 0.55} ${-len - H * 0.75} ${x} ${-len}`} stroke={color} strokeWidth={4}
          strokeDasharray="0 11" strokeLinecap="round" fill="none" opacity={0.9} />
      ))}
      {/* gouttes qui rebondissent sur la toile */}
      {drops.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={2.4} fill="#e8e8e8" opacity={d.o * 0.6} />)}
    </g>
  );
};

const Folder: React.FC<{a: Pt; b: Pt; k: number; uid: string}> = ({a, b, k, uid}) => {
  const cx = (a.x + b.x) / 2 + 8, cy = Math.min(a.y, b.y) - 4;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${k})`} filter={`url(#${uid}-glowc)`}>
      <rect x={-78} y={-16} width={156} height={22} rx={5} fill="#f0b93c" stroke="#ffe7a3" strokeWidth={3} />
      <rect x={-70} y={-12} width={140} height={5} rx={2} fill="#fff2c2" opacity={0.8} />
    </g>
  );
};

const Phone: React.FC<{hand: Pt; ang: number; k: number; uid: string}> = ({hand, ang, k, uid}) => (
  <g transform={`translate(${hand.x} ${hand.y}) rotate(${ang - 90}) scale(${k})`}>
    <rect x={-6} y={-30} width={22} height={44} rx={5} fill="#0b1a24" stroke="#bfefff" strokeWidth={3} filter={`url(#${uid}-glowc)`} />
    <rect x={-2} y={-25} width={14} height={32} rx={2} fill="#7fe0ff" opacity={0.85} />
  </g>
);

const Coffee: React.FC<{hand: Pt; t: number; k: number}> = ({hand, t, k}) => (
  <g transform={`translate(${hand.x + 6} ${hand.y - 10}) scale(${k})`}>
    <path d="M-20 -30 L20 -30 L15 26 L-15 26 Z" fill="#0a0a0a" stroke="#f5f5f5" strokeWidth={3.5} strokeLinejoin="round" />
    <rect x={-23} y={-38} width={46} height={9} rx={3} fill="#f5f5f5" />
    <rect x={-17} y={-8} width={34} height={14} fill="#d9a640" opacity={0.9} />
    {[0, 1, 2].map((i) => {
      const ph = (t * 0.45 + i / 3) % 1;
      const y0 = -44 - ph * 90;
      const sway = Math.sin(t * 2.2 + i * 2) * 10;
      return <path key={i} d={`M${-8 + i * 8} ${y0} q${8 + sway} -18 0 -34 q${-8 - sway} -16 0 -30`} stroke="#e6e6e6" strokeWidth={3}
        strokeDasharray="0 8" strokeLinecap="round" fill="none" opacity={Math.sin(Math.PI * ph) * 0.7} />;
    })}
  </g>
);

const Bag: React.FC<{hand: Pt; swing: number; k: number; color: string}> = ({hand, swing, k, color}) => (
  <g transform={`translate(${hand.x} ${hand.y}) rotate(${swing}) scale(${k})`}>
    <path d="M-16 4 q0 -16 16 -16 q16 0 16 16" stroke="#f5f5f5" strokeWidth={4} fill="none" />
    <rect x={-58} y={4} width={116} height={78} rx={9} fill="#0a0a0a" stroke={color} strokeWidth={4} />
    <line x1={-58} y1={30} x2={58} y2={30} stroke={color} strokeWidth={3} strokeDasharray="0 9" strokeLinecap="round" />
  </g>
);

export const Figure: React.FC<FigureProps> = ({skel: s, pose, t, phase, moving, character = 'man', glow = '#ffffff', prop = 'none', propIn = 1,
  prevProp = 'none', prevPropOut = 0, accent = '#ff7a45', uid}) => {
  const woman = character === 'woman';
  const r = RIG.HEAD_R;
  const eye = blink(t);
  // effets secondaires (en retard sur le rebond du pas)
  const sway = Math.sin(2 * Math.PI * 2 * (phase - 0.14)) * moving;
  const tail = 28 + sway * 9 + pose.lean * 0.6 + wobble(t * 0.8, 2) * 3;
  const umbrellaTilt = -13 + pose.lean * 0.4 + sway * 2.2 + wobble(t * 0.7, 5) * 1.2;

  const props = (p: Prop, k: number, key: string) => {
    if (p === 'none' || k <= 0.001) return null;
    if (p === 'umbrella') return <Umbrella key={key} hand={s.armN.hand} color={accent} tilt={umbrellaTilt} t={t} uid={uid} k={k} />;
    if (p === 'folder') return <Folder key={key} a={s.armN.hand} b={s.armF.hand} k={k} uid={uid} />;
    if (p === 'phone') return <Phone key={key} hand={s.armN.hand} ang={pose.shN + pose.elN} k={k} uid={uid} />;
    if (p === 'coffee') return <Coffee key={key} hand={s.armN.hand} t={t} k={k} />;
    if (p === 'bag') return <Bag key={key} hand={s.armN.hand} swing={-sway * 7} k={k} color={accent} />;
    return null;
  };

  // robe : trapèze des épaules jusqu'au genou, l'ourlet suit les genoux
  const kx = [s.legN.knee.x, s.legF.knee.x];
  const hemY = Math.max(s.legN.knee.y, s.legF.knee.y) - 8;
  const hemF = Math.max(78, Math.max(...kx) + 26), hemB = Math.min(-78, Math.min(...kx) - 26);
  const dress = `M${s.shoulder.x - 14} ${s.shoulder.y + 6} L${s.shoulder.x + 16} ${s.shoulder.y + 6} L${hemF} ${hemY} Q0 ${hemY + 10} ${hemB} ${hemY} Z`;
  const headTop = {x: s.head.x, y: s.head.y};
  const tailRad = (tail * Math.PI) / 180;
  const tx = headTop.x - r * 0.62, ty = headTop.y - r * 0.62;
  const tailEnd = {x: tx - Math.sin(tailRad) * 95, y: ty + Math.cos(tailRad) * 95};

  const body = () => {
    const line = glow;
    return (
      <g>
        {/* membres lointains : gris, semi-transparents (profondeur) */}
        <Arm sh={s.shoulder} A={s.armF} line={FAR} op={0.55} core="#101010" />
        <Leg hip={s.hip} L={s.legF} line={FAR} op={0.55} core="#101010" />
        <Leg hip={s.hip} L={s.legN} line={line} />
        <Seg a={s.hip} b={s.shoulder} line={line} w={RIG.W + 2} />
        {woman ? <path d={dress} fill={INK} stroke={line} strokeWidth={3.4} strokeLinejoin="round" /> : null}
        <Seg a={s.shoulder} b={s.head} line={line} w={RIG.W - 6} />
        {woman ? (
          <path d={`M${tx + 10} ${ty - 6} Q${tx - 30} ${ty - 10} ${tailEnd.x} ${tailEnd.y} Q${tx - 4} ${ty + 30} ${tx + 6} ${ty + 16} Z`}
            fill={INK} stroke={line} strokeWidth={3.4} strokeLinejoin="round" />
        ) : null}
        <circle cx={s.head.x} cy={s.head.y} r={r} fill={INK} stroke={line} strokeWidth={4} />
        <ellipse cx={s.head.x + r * 0.5} cy={s.head.y - r * 0.12} rx={4.6} ry={4.6 * eye} fill={line} />
        <Arm sh={s.shoulder} A={s.armN} line={line} />
      </g>
    );
  };

  return (
    <g>
      <defs>
        <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={7} />
        </filter>
        <filter id={`${uid}-glowc`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={6} result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* halo : silhouette floutée sous le tracé net */}
      <g filter={`url(#${uid}-glow)`} opacity={0.55}>{body()}</g>
      {props(prevProp, prevPropOut, 'pp')}
      {body()}
      {props(prop, propIn, 'p')}
      {/* l'écran du téléphone éclaire le visage */}
      {prop === 'phone' ? (
        <ellipse cx={(s.head.x + s.armN.hand.x) / 2 + 10} cy={(s.head.y + s.armN.hand.y) / 2} rx={70} ry={52} fill="#7fe0ff"
          opacity={0.16 * propIn} filter={`url(#${uid}-glow)`} />
      ) : null}
    </g>
  );
};
