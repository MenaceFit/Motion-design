/*
 * Décors en line art POINTILLÉ (style « Stickman Spotlight »).
 * Un trait pointillé = stroke-dasharray "0 gap" + stroke-linecap round (un point par tiret de longueur 0).
 * Révélation « point par point » : on ne montre que les m premiers points de chaque tracé
 * (dasharray construit à partir de la longueur réelle du chemin) → les décors se dessinent comme une
 * guirlande qui s'allume, sans masque (rendu rapide).
 *
 * Repère d'un décor : x centré sur la tuile, y = 0 au sol, négatif vers le haut. Chaque décor est une
 * tuile de largeur W répétée horizontalement → défilement infini pendant la marche.
 * Deux plans : `back` (parallaxe lente) et `mid` (mur du fond, défile presque à la vitesse du sol).
 */
import React from 'react';
import {getLength} from '@remotion/paths';
import {SetName, clamp} from './engine';

export type El = {d: string; gap?: number; w?: number; o?: number; solid?: boolean; fill?: string; glow?: boolean};
export type SetDef = {W: number; back: El[]; mid: El[]; backPar?: number};

// ------------------------------------------------------------------ primitives de tracé
const R = (x: number, y: number, w: number, h: number) => `M${x} ${y} h${w} v${h} h${-w} Z`;
const L = (x1: number, y1: number, x2: number, y2: number) => `M${x1} ${y1} L${x2} ${y2}`;
const C = (cx: number, cy: number, r: number) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;
const E = (cx: number, cy: number, rx: number, ry: number) => `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${2 * rx} 0 a${rx} ${ry} 0 1 0 ${-2 * rx} 0`;
const P = (...pts: number[]) => 'M' + pts.reduce<string[]>((a, v, i) => (i % 2 ? (a[a.length - 1] += ` ${v}`, a) : [...a, `${v}`]), []).join(' L');
const range = (a: number, b: number, s: number) => { const o: number[] = []; for (let x = a; x <= b + 1e-6; x += s) o.push(x); return o; };
const el = (d: string, o: Partial<El> = {}): El => ({d, ...o});

// ------------------------------------------------------------------ décors
const office = (): SetDef => ({
  W: 1700, backPar: 0.55,
  back: [
    // fenêtre à stores
    el(R(-1020, -1020, 300, 440)), ...range(-990, -610, 34).map((y) => el(L(-1010, y, -730, y), {o: 0.6, gap: 12})),
    el(R(560, -1060, 260, 200), {o: 0.6}), el(L(560, -960, 820, -960), {o: 0.5}),
  ],
  mid: [
    // tableau blanc + graphiques
    el(R(-560, -880, 520, 330)), el(L(-575, -540, -25, -540), {o: 0.7}),
    el(R(-520, -650, 40, 90)), el(R(-460, -690, 40, 130)), el(R(-400, -628, 40, 68)), el(R(-340, -730, 40, 170)),
    el(P(-520, -760, -470, -790, -420, -770, -360, -830, -300, -812, -230, -860, -110, -845), {o: 0.9}),
    el(L(-530, -560, -70, -560), {o: 0.6}),
    // bureau + écran + lampe
    el(R(70, -314, 500, 16)), el(L(92, -298, 92, 0)), el(L(548, -298, 548, 0)), el(R(390, -290, 140, 92), {o: 0.8}), el(L(430, -244, 490, -244), {o: 0.8}),
    el(R(250, -500, 230, 150)), el(P(272, -380, 310, -410, 340, -395, 380, -450, 420, -430, 458, -470), {o: 0.9}),
    el(L(365, -350, 365, -316)), el(L(320, -316, 410, -316)),
    el(L(130, -316, 130, -430)), el(L(130, -430, 190, -478)), el('M160 -500 L230 -455 L205 -425 Z', {o: 0.9}),
    // chaise
    el(L(150, -205, 285, -205)), el(L(285, -205, 300, -420)), el(L(215, -200, 215, -70)), el(L(140, -45, 290, -45)),
    el(C(150, -30, 12), {o: 0.7}), el(C(290, -30, 12), {o: 0.7}),
    // plante + classeur + horloge
    el('M660 0 L645 -130 L745 -130 L730 0 Z'), el('M695 -130 Q640 -230 600 -250', {o: 0.8}), el('M700 -130 Q700 -260 720 -300', {o: 0.8}), el('M705 -130 Q770 -220 800 -235', {o: 0.8}),
    el(R(-1000, -470, 210, 470)), el(L(-1000, -315, -790, -315), {o: 0.7}), el(L(-1000, -160, -790, -160), {o: 0.7}),
    el(L(-925, -395, -865, -395), {o: 0.7}), el(L(-925, -240, -865, -240), {o: 0.7}), el(L(-925, -85, -865, -85), {o: 0.7}),
    el(C(760, -880, 52)), el(L(760, -880, 760, -915), {o: 0.8, gap: 8}), el(L(760, -880, 785, -870), {o: 0.8, gap: 8}),
  ],
});

const rain = (): SetDef => ({
  W: 1800, backPar: 0.6,
  back: [
    el(L(-950, -780, 950, -780), {o: 0.7}), el(L(-950, -800, 950, -800), {o: 0.5}),
    ...range(-850, 650, 300).flatMap((x) => [el(R(x, -1180, 150, 230), {o: 0.7}), el(L(x + 75, -1180, x + 75, -950), {o: 0.5}), el(L(x, -1065, x + 150, -1065), {o: 0.5})]),
  ],
  mid: [
    // boutique A : rideau métallique (lamelles verticales denses)
    el(R(-840, -650, 470, 650)), ...range(-818, -392, 24).map((x) => el(L(x, -630, x, -8), {o: 0.55, gap: 11})),
    el(R(-880, -730, 550, 64)), el(L(-880, -698, -330, -698), {o: 0.6}),
    // porte + applique lumineuse
    el(R(-260, -560, 180, 560)), el(R(-238, -530, 136, 240), {o: 0.7}), el(C(-112, -270, 7), {o: 0.9}),
    el(L(-170, -600, -170, -632), {o: 0.8}), el(C(-170, -652, 18), {solid: true, fill: '#ffcf6b', glow: true}),
    // boutique B : vitrine quadrillée + store à bandes
    el(R(40, -650, 560, 650)), el(R(80, -570, 480, 410)), el(L(240, -570, 240, -160), {o: 0.7}), el(L(400, -570, 400, -160), {o: 0.7}),
    el(L(80, -365, 560, -365), {o: 0.7}), el(R(20, -740, 600, 70)), ...range(20, 600, 60).map((x) => el(`M${x} -670 q30 26 60 0`, {o: 0.6})),
    // lampadaire
    el(L(780, 0, 780, -930)), el(L(780, -930, 850, -950)), el(C(860, -935, 20), {solid: true, fill: '#ffcf6b', glow: true}),
  ],
});

const bedroom = (): SetDef => ({
  W: 1600, backPar: 0.6,
  back: [el(R(150, -1000, 330, 400)), el(L(315, -1000, 315, -600), {o: 0.7}), el(L(150, -800, 480, -800), {o: 0.7}),
    el(C(400, -920, 34), {solid: true, fill: '#ffe6a8', glow: true}),
    ...[[200, -950], [260, -880], [230, -700], [430, -680], [350, -760]].map(([x, y]) => el(C(x, y, 3), {solid: true, fill: '#fff3cf'}))],
  mid: [
    // lit (vue de profil)
    el(R(-760, -500, 30, 500)), el(R(-730, -240, 600, 60)), el(R(-725, -300, 580, 60)),
    el(E(-650, -322, 60, 22)), el('M-590 -300 Q-420 -350 -160 -300 L-150 -190', {o: 0.9}), el(L(-725, -180, -725, 0)), el(L(-140, -180, -140, 0)),
    // table de nuit + lampe allumée
    el(R(-90, -230, 160, 230)), el(L(-90, -120, 70, -120), {o: 0.7}), el(L(-30, -175, 10, -175), {o: 0.7}),
    el(L(-10, -230, -10, -310)), el('M-70 -310 L50 -310 L25 -390 L-45 -390 Z'), el(C(-10, -335, 22), {solid: true, fill: '#ffcf6b', glow: true, o: 0.6}),
    // cadre, étagère, horloge
    el(R(-600, -920, 230, 170)), el(P(-585, -770, -520, -860, -470, -810, -430, -850, -385, -770), {o: 0.8}),
    el(L(600, -700, 880, -700)), ...[0, 30, 60, 100, 128].map((dx, i) => el(R(610 + dx, -700 - (80 + (i % 3) * 14), 22, 80 + (i % 3) * 14), {o: 0.8})),
    el(C(720, -1000, 46)), el(L(720, -1000, 720, -1030), {gap: 8}), el(L(720, -1000, 742, -992), {gap: 8}),
  ],
});

const gym = (): SetDef => ({
  W: 1600, backPar: 0.6,
  back: [el(R(250, -1020, 470, 580), {o: 0.7}), el(L(330, -980, 420, -1010 + 60), {o: 0.5}), el(L(380, -960, 520, -1010 + 30), {o: 0.4}),
    el(C(-150, -1060, 44)), el(L(-150, -1060, -150, -1090), {gap: 8}), el(L(-150, -1060, -128, -1050), {gap: 8})],
  mid: [
    // rack + barre
    el(L(-720, 0, -720, -920)), el(L(-480, 0, -480, -920)), el(L(-740, -920, -460, -920)), el(L(-740, -600, -460, -600), {o: 0.5}),
    el(L(-800, -640, -400, -640)), el(R(-785, -700, 24, 120)), el(R(-440, -700, 24, 120)), el(R(-815, -680, 18, 80), {o: 0.8}), el(R(-418, -680, 18, 80), {o: 0.8}),
    // banc
    el(R(-210, -200, 330, 32)), el(L(-180, -168, -180, 0)), el(L(90, -168, 90, 0)), el(L(-200, 0, -160, 0)), el(L(70, 0, 110, 0)),
    // haltères sur râtelier
    el(L(270, -270, 700, -270)), el(L(290, -270, 290, 0)), el(L(680, -270, 680, 0)), el(L(270, -120, 700, -120), {o: 0.6}),
    ...[0, 1, 2, 3].flatMap((i) => [el(L(310 + i * 100, -300, 370 + i * 100, -300), {gap: 8}), el(R(300 + i * 100, -322, 14, 44), {o: 0.9}), el(R(366 + i * 100, -322, 14, 44), {o: 0.9})]),
    el(C(820, -60, 55)), el('M790 -110 q30 -60 60 0', {o: 0.9}),
  ],
});

const park = (): SetDef => ({
  W: 1800, backPar: 0.45,
  back: [
    ...[[-900, 520, 180], [-690, 760, 220], [-440, 600, 160], [380, 820, 200], [610, 560, 170]].flatMap(([x, h, w]) => [
      el(R(x, -h, w, h), {o: 0.55}),
      ...range(-h + 50, -80, 70).map((y) => el(L(x + 25, y, x + w - 25, y), {o: 0.35, gap: 22})),
    ]),
    el(C(80, -1120, 52), {solid: true, fill: '#ffe6a8', glow: true}),
  ],
  mid: [
    el(L(-620, 0, -620, -400)), el(L(-620, -300, -690, -380), {o: 0.8}), el(L(-620, -330, -550, -420), {o: 0.8}),
    el(C(-620, -580, 190)), el(C(-680, -620, 105), {o: 0.6}), el(C(-540, -540, 85), {o: 0.6}),
    el(L(-160, -170, 260, -170)), el(L(-160, -200, 260, -200), {o: 0.8}), el(L(-150, -330, 250, -330)), el(L(-150, -290, 250, -290), {o: 0.7}),
    el(L(-140, -170, -140, 0)), el(L(240, -170, 240, 0)), el(L(-150, -330, -140, -170), {o: 0.7}), el(L(250, -330, 240, -170), {o: 0.7}),
    el(L(560, 0, 560, -880)), el(R(530, -960, 60, 80)), el(C(560, -920, 18), {solid: true, fill: '#ffcf6b', glow: true}),
    el(L(800, 0, 800, -260), {o: 0.8}), el(C(800, -360, 120), {o: 0.8}),
  ],
});

const SETS: Record<SetName, () => SetDef> = {office, rain, bedroom, gym, park, none: () => ({W: 1600, back: [], mid: []})};
const memo = new Map<string, SetDef>();
export const getSet = (n: SetName) => { if (!memo.has(n)) memo.set(n, SETS[n]()); return memo.get(n)!; };

const lenCache = new Map<string, number>();
const len = (d: string) => { let v = lenCache.get(d); if (v === undefined) { v = getLength(d); lenCache.set(d, v); } return v; };

/** un tracé pointillé révélé point par point (prog 0..1) */
export const DotPath: React.FC<{e: El; prog: number; color: string; dot: number; gap: number}> = ({e, prog, color, dot, gap}) => {
  if (prog <= 0.001) return null;
  const o = e.o ?? 1;
  if (e.solid) {
    return <path d={e.d} fill={e.fill ?? color} opacity={o * prog} />;
  }
  const g = e.gap ?? gap;
  const L0 = len(e.d);
  const N = Math.floor(L0 / g) + 1;
  const m = Math.round(N * clamp(prog));
  if (m <= 0) return null;
  const dash = m >= N ? `0 ${g}` : `${Array(m).fill(`0 ${g}`).join(' ')} 0 ${L0 * 2 + 10}`;
  return <path d={e.d} fill="none" stroke={color} strokeWidth={(e.w ?? 1) * dot} strokeLinecap="round" strokeDasharray={dash} opacity={o} />;
};

/** décor complet : tuiles répétées, deux plans de parallaxe, révélation en cascade */
export const SetLayer: React.FC<{name: SetName; scroll: number; reveal: number; color: string; floorY: number; width: number; uid: string}> = ({name, scroll, reveal, color, floorY, width, uid}) => {
  if (name === 'none' || reveal <= 0.001) return null;
  const def = getSet(name);
  const layer = (els: El[], par: number, key: string, dot: number, op: number) => {
    const off = ((scroll * par) % def.W + def.W) % def.W;
    const n = els.length;
    const tiles = [-1, 0, 1].map((k) => width / 2 + k * def.W - off);
    return (
      <g key={key} opacity={op}>
        {tiles.map((tx, ti) => (
          <g key={ti} transform={`translate(${tx} ${floorY})`}>
            {els.map((e, i) => {
              // cascade : chaque élément démarre un peu après le précédent
              const p = clamp(reveal * 1.6 - (i / Math.max(1, n)) * 0.6);
              return e.glow ? (
                <g key={i} filter={`url(#${uid}-sglow)`}><DotPath e={e} prog={p} color={color} dot={dot} gap={10} /></g>
              ) : <DotPath key={i} e={e} prog={p} color={color} dot={dot} gap={10} />;
            })}
          </g>
        ))}
      </g>
    );
  };
  return (
    <g>
      <defs>
        <filter id={`${uid}-setglow`} x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation={3.5} result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id={`${uid}-sglow`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation={10} result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g filter={`url(#${uid}-setglow)`}>
        {layer(def.back, def.backPar ?? 0.55, 'b', 3.6, 0.72)}
        {layer(def.mid, 0.9, 'm', 4.4, 1)}
      </g>
    </g>
  );
};

/** sol : ligne pointillée + hachures en perspective qui défilent à la vitesse des pieds */
export const Floor: React.FC<{scroll: number; floorY: number; width: number; height: number; color: string}> = ({scroll, floorY, width, height, color}) => {
  const sp = 120, off = ((scroll % sp) + sp) % sp;
  const lines = range(-sp * 4, width + sp * 2, sp).map((x) => x - off);
  const depth = height - floorY;
  return (
    <g>
      {lines.map((x, i) => (
        <line key={i} x1={x} y1={floorY + 6} x2={x - depth * 0.9} y2={height + 4} stroke="#ffffff" strokeOpacity={0.075} strokeWidth={3} />
      ))}
      <line x1={-20} y1={floorY} x2={width + 20} y2={floorY} stroke={color} strokeWidth={4} strokeDasharray="0 11" strokeLinecap="round" opacity={0.55}
        strokeDashoffset={scroll} />
    </g>
  );
};
