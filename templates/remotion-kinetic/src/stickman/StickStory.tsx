/*
 * Composition « StickStory » — style Stickman Spotlight (personnage-bâton lumineux sous projecteur,
 * décors en pointillés dorés, étiquette de lieu). Piloté par un plan JSON (voir engine.ts → Plan).
 *
 * Mise en scène « tapis roulant » : le personnage reste dans le faisceau, le monde défile sous ses
 * pieds à la vitesse exacte du pied d'appui (aucune glisse). Chaque scène : allumage en néon,
 * décor qui se dessine point par point, étiquette en cascade ; fin : baisse de lumière + décor qui
 * se rétracte, le personnage continue de marcher (continuité d'action entre les lieux).
 */
import React from 'react';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Plan, Prop, buildTrack, charAt, clamp, lerp, sceneStarts, smooth} from './engine';
import {Figure} from './Figure';
import {Floor, SetLayer} from './Sets';
import {CardFrame, Caption, Cone, Dust, FloorPool, PlaceLabel, Rain, Shield, Spotlight, lightLevel} from './Atmosphere';

export const W = 1080, H = 1920, FLOOR = 1340, CX = 540;

const easeOutBack = (x: number) => { const k = clamp(x), c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * (k - 1) ** 3 + c1 * (k - 1) ** 2; };
const ACCENT: Record<Prop, string> = {umbrella: '#f2895a', folder: '#f0b93c', phone: '#7fe0ff', coffee: '#d9a640', bag: '#f0b93c', none: '#ffffff'};

export const stickDefaults: Plan = {
  slug: 'demo',
  character: 'man',
  lineColor: '#d6a94e',
  lightColor: '#e2ac48',
  glowColor: '#ffffff',
  frame: true,
  scenes: [
    {label: 'Office', set: 'office', duration: 4, motion: 'walk', prop: 'folder', caption: 'Lundi. *Encore* un dossier.'},
    {label: 'Rain', set: 'rain', duration: 4.5, motion: 'walk', prop: 'umbrella', character: 'woman', caption: 'Elle marche sous la *pluie*.',
      beats: [{at: 2.6, motion: 'idle', look: 'up'}]},
    {label: 'Gym', set: 'gym', duration: 3.5, motion: 'run', caption: 'Et lui *court*.'},
  ],
};

export const durationOfPlan = (p: Plan, fps: number) => Math.max(1, Math.ceil(sceneStarts(p).total * fps));

export const StickStory: React.FC<Plan> = (plan) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const {starts, total} = sceneStarts(plan);
  const si = Math.max(0, starts.filter((s) => s <= t + 1e-9).length - 1);
  const scene = plan.scenes[si];
  const last = si === plan.scenes.length - 1;
  const tIn = t - starts[si], tOut = last ? 99 : starts[si] + scene.duration - t;
  const light = plan.lightColor ?? '#e2ac48', line = plan.lineColor ?? '#d6a94e', glow = plan.glowColor ?? '#ffffff';
  const uid = 'stk';

  buildTrack(plan);
  const c = charAt(plan, t);
  const level = lightLevel(tIn, tOut);
  const surge = c.worldX - c.camX;
  const reveal = Math.min(smooth((tIn - 0.08) / 0.9), last ? 1 : smooth(tOut / 0.4));
  const labelK = Math.min(smooth((tIn - 0.04) / 0.5), last ? 1 : smooth(tOut / 0.3));
  const rainOf = (i: number) => (plan.scenes[i].rain ?? plan.scenes[i].set === 'rain') ? 1 : 0;
  const rainAmt = lerp(si > 0 ? rainOf(si - 1) : rainOf(si), rainOf(si), smooth(tIn / 0.5));
  const character = scene.character ?? plan.character ?? 'man';

  // accessoires : apparition élastique au changement, disparition rapide de l'ancien
  const prop = c.seg.prop;
  const changed = c.segPrev && c.segPrev.prop !== prop;
  const dtSeg = t - c.seg.t0;
  const propIn = changed ? easeOutBack((dtSeg - 0.06) / 0.38) : 1;
  const prevProp: Prop = changed && dtSeg < 0.22 ? c.segPrev!.prop : 'none';
  const prevOut = changed ? 1 - smooth(dtSeg / 0.2) : 0;
  const accent = scene.accent ?? ACCENT[prop];
  const moving = c.seg.motion === 'idle' ? 1 - c.segBlend : c.segPrev?.motion === 'idle' ? c.segBlend : 1;

  // caméra : léger push-in puis retour au fil de la scène (continu d'une scène à l'autre)
  const push = 1 + 0.028 * Math.sin(Math.PI * clamp(tIn / scene.duration)) ** 2;
  const camY = FLOOR - 380;

  const cone: Cone = {cx: CX, topY: 200, topW: 150, floorY: FLOOR + 6, botW: 600};
  const fx = CX + surge, fy = FLOOR + c.hipY;
  // zone abritée par le parapluie (la pluie s'y arrête)
  let shield: Shield = null;
  if (prop === 'umbrella') {
    const hx = fx + c.skel.armN.hand.x * c.facing, hy = fy + c.skel.armN.hand.y;
    shield = {x0: hx - 200, x1: hx + 200, y: hy - 330};
  }

  return (
    <AbsoluteFill style={{background: '#030303'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <radialGradient id={`${uid}-vig`} cx="0.5" cy="0.45" r="0.75">
            <stop offset="0.55" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.75} />
          </radialGradient>
          <radialGradient id={`${uid}-spill`} cx="0.5" cy="0.62" r="0.62">
            <stop offset="0" stopColor="#fff" stopOpacity={1} />
            <stop offset="0.7" stopColor="#fff" stopOpacity={0.7} />
            <stop offset="1" stopColor="#fff" stopOpacity={0.42} />
          </radialGradient>
          <mask id={`${uid}-spillmask`}><rect width={W} height={H} fill={`url(#${uid}-spill)`} /></mask>
        </defs>
        <g transform={`translate(${CX} ${camY}) scale(${push}) translate(${-CX} ${-camY})`}>
          {/* décor : plus lumineux près du faisceau */}
          <g mask={`url(#${uid}-spillmask)`} opacity={0.62 + 0.38 * level}>
            <SetLayer name={scene.set} scroll={c.camX} reveal={reveal} color={line} floorY={FLOOR} width={W} uid={uid} />
          </g>
          <Floor scroll={c.camX} floorY={FLOOR} width={W} height={H + 200} color={line} />
          <Spotlight c={cone} level={level} color={light} uid={uid} t={t} />
          <Dust c={cone} level={level} t={t} uid={uid} />
          <FloorPool cx={CX} floorY={FLOOR} level={level} color={light} t={t} />
          <Rain t={t} amount={rainAmt * 0.75} width={W} height={H} floorY={FLOOR} shield={shield} uid={`${uid}-r1`} c={cone} light="#ffe2a6" level={level} />
          <g transform={`translate(${fx} ${fy}) scale(${c.facing} 1)`}>
            <Figure skel={c.skel} pose={c.pose} t={t} phase={c.phase} moving={moving} character={character} glow={glow}
              prop={prop} propIn={propIn} prevProp={prevProp} prevPropOut={prevOut} accent={accent} uid={`${uid}-f`} />
          </g>
          {/* quelques gouttes passent devant le personnage (profondeur) */}
          <Rain t={t + 3.7} amount={rainAmt * 0.3} width={W} height={H} floorY={FLOOR + 120} shield={shield} uid={`${uid}-r2`} c={cone} light="#ffe2a6" level={level} />
        </g>
        <rect width={W} height={H} fill={`url(#${uid}-vig)`} />
        <PlaceLabel text={scene.label} k={labelK} cx={CX} y={168} />
        {scene.caption ? <Caption text={scene.caption} t={tIn} dur={scene.duration} cx={CX} y={1600} light={light} width={W - 160} /> : null}
        {plan.frame !== false ? <CardFrame width={W} height={H} t={t} /> : null}
      </svg>
      {plan.audio ? <Audio src={staticFile(plan.audio)} /> : null}
    </AbsoluteFill>
  );
};

/** planche de contrôle : chaque allure en « pelure d'oignon » sur un cycle */
export const StickRigTest: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const motions = ['walk', 'happy', 'sad', 'sneak', 'run', 'idle'] as const;
  return (
    <AbsoluteFill style={{background: '#050505'}}>
      <svg width={W} height={H}>
        {motions.map((m, row) => {
          const plan: Plan = {scenes: [{label: m, set: 'none', duration: 4, motion: m}]};
          const y = 290 + row * 300;
          return (
            <g key={m}>
              <text x={30} y={y - 230} fill="#888" fontFamily="Montserrat" fontSize={26}>{m}</text>
              <line x1={0} y1={y} x2={W} y2={y} stroke="#d6a94e" strokeDasharray="0 10" strokeLinecap="round" strokeWidth={3} />
              {Array.from({length: 6}, (_, k) => {
                const tt = 1.0 + k * 0.12 + t;
                const s = charAt(plan, tt);
                const x0 = 140 + (s.worldX - charAt(plan, 1.0).worldX) * 0.32 + k * 0;
                return (
                  <g key={k} transform={`translate(${x0 % W} ${y + s.hipY * 0.32}) scale(0.32)`} opacity={0.35 + (k / 5) * 0.65}>
                    <Figure skel={s.skel} pose={s.pose} t={tt} phase={s.phase} moving={1} uid={`rt${row}${k}`} />
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
