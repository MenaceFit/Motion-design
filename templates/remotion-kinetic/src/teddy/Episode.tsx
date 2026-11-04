// TEDDY · J-30 — Épisode 1, partie 1 (0 → ~15 s). Toute la mise en scène est calée sur les repères
// de voix (cues) produits par tools/teddy_build.py : changer la voix ne casse pas la synchronisation.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig, random} from 'remotion';
import gsap from 'gsap';
import {Teddy, Expression, TEDDY_ANCHORS} from './Teddy';
import {Grotte, Hud, PunchCaptions, Annotation, Invitation, RankBadge, Cap, clamp01, INK} from './Sets';

export type EpisodeProps = {duration: number; cues: Record<string, number>; caps: Cap[]; audio?: string};
export const episodeDefaults: EpisodeProps = {duration: 15, cues: {L0: 0.2, L1: 2.6, L1end: 3.4, L2: 4.6, L3: 7, L4: 8.3, L5: 10.1, L6: 12.3}, caps: []};

const BACK = gsap.parseEase('back.out(1.8)');
const EXPO = gsap.parseEase('expo.out');
const IN = gsap.parseEase('power2.in');

// placement du personnage dans l'image 1080×1920 (repère perso 560×900)
const TS = 1.45, TX = 134, TY = 509;
const toScreen = (p: {x: number; y: number}) => ({x: TX + p.x * TS, y: TY + p.y * TS});

// tremblement amorti après un impact
const shake = (t: number, at: number, amp: number) => {
  const d = t - at;
  if (d < 0 || d > 0.5) return [0, 0];
  const a = amp * Math.exp(-d * 9);
  return [Math.sin(d * 71) * a, Math.cos(d * 53) * a];
};

export const TeddyEpisode: React.FC<EpisodeProps> = ({cues, caps, audio}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const c = (k: string, d = 0) => (cues[k] ?? 999) + d;

  // ---------------- PLAN A : le faire-part tombe (0 → L1) ----------------
  const cut = c('L1', -0.12);                       // début de la transition
  const inA = t < cut + 0.25;
  const fall = BACK(clamp01((t - 0.05) / 0.7));
  const toHands = EXPO(clamp01((t - cut) / 0.25));
  const hands = toScreen(TEDDY_ANCHORS.hands);
  const cardW = 640;
  const cardX = interpolate(toHands, [0, 1], [540, hands.x]);
  const cardY = interpolate(fall, [0, 1], [-900, 900]) * (1 - toHands) + toHands * (hands.y - 20);
  const cardS = interpolate(toHands, [0, 1], [1 + 0.06 * clamp01((t - 0.8) / 1.6), 200 / cardW]);
  const rotX = interpolate(fall, [0, 1], [70, 0]);
  const rotZ = interpolate(fall, [0, 1], [-18, -2]) + Math.sin(t * 1.5) * 1.5 * (1 - toHands);

  // ---------------- PLAN B : la Grotte ----------------
  const bIn = EXPO(clamp01((t - cut) / 0.3));
  const holdCard = t < c('L2', 0.05);
  const dropK = clamp01((t - c('L2', 0.05)) / 0.7);
  // présentation : petit saut (squash & stretch) sur « Voici Teddy »
  const j = t - c('L2', 0.05);
  let squash = 1, hop = 0;
  if (j > 0 && j < 0.75) {
    if (j < 0.12) squash = 1 - 0.18 * Math.sin((j / 0.12) * Math.PI / 2);                 // anticipation
    else if (j < 0.5) { const k = (j - 0.12) / 0.38; hop = Math.sin(k * Math.PI) * 120; squash = 1 + 0.12 * Math.sin(k * Math.PI); }
    else { const k = (j - 0.5) / 0.25; squash = 1 - 0.14 * Math.sin(k * Math.PI); }          // réception
  }
  // expression selon le temps
  let expr: Expression = 'neutral';
  if (t >= cut && t < c('L2')) expr = 'shock';
  else if (t >= c('L2') && t < c('L3')) expr = 'happy';
  else if (t >= c('L3') && t < c('L4', 0.3)) expr = 'proud';
  else if (t >= c('L4', 0.3) && t < c('L5')) expr = 'sad';
  else if (t >= c('L5') && t < c('L6')) expr = 'neutral';
  else if (t >= c('L6')) expr = 'smug';
  // bras : tient le carton → bras le long du corps → pouce levé (Diamant) → retombe
  const armsHold = holdCard ? 1 : 1 - EXPO(clamp01((t - c('L2', 0.05)) / 0.3));
  const thumb = clamp01((t - c('L3', 0.1)) / 0.25) * (1 - clamp01((t - c('L4', 0.3)) / 0.3));
  const armL = -50 * armsHold;
  const armR = 50 * armsHold + interpolate(BACK(thumb), [0, 1], [0, -155]);
  const antennaKick = Math.max(0, 1 - Math.abs(t - c('L1end', 0.15)) * 3) + Math.max(0, 1 - Math.abs(j - 0.5) * 3) * (j > 0 ? 1 : 0);

  // caméra : push-in sur les lunettes (L5), recul sur le sweat (L6), secousses d'impact
  const zG = EXPO(clamp01((t - c('L5')) / 0.5)) * (1 - EXPO(clamp01((t - c('L6')) / 0.5)));
  const glasses = toScreen(TEDDY_ANCHORS.glasses);
  const zoom = 1 + 0.38 * zG + 0.04 * clamp01((t - c('L2')) / 3);
  const [sx1, sy1] = shake(t, c('L1end', 0.15), 18);
  const [sx2, sy2] = shake(t, c('L4', 0.3), 22);
  const camX = sx1 + sx2, camY = sy1 + sy2;

  // chips qui tombe de la bouche (choc)
  const chipT = t - c('L1', 0.25);
  const mouth = toScreen(TEDDY_ANCHORS.mouth);

  // badge de rang
  const diaT = t - c('L3', 0.2), cartonT = t - c('L4', 0.3);

  return (
    <AbsoluteFill style={{background: '#0b0614', overflow: 'hidden'}}>
      {/* PLAN B (monde) */}
      <AbsoluteFill style={{opacity: bIn, transform: `translate(${camX}px, ${camY}px) scale(${interpolate(bIn, [0, 1], [1.35, 1]) * zoom})`,
        transformOrigin: `${glasses.x}px ${glasses.y + 120}px`, filter: bIn < 1 ? `blur(${(1 - bIn) * 14}px)` : undefined}}>
        <AbsoluteFill><Grotte t={t} /></AbsoluteFill>
        {/* ombre au sol */}
        <div style={{position: 'absolute', left: 540 - 230 + 0, top: TY + 835 * TS - 30, width: 460, height: 60, borderRadius: '50%',
          background: 'rgba(0,0,0,0.45)', transform: `scale(${1 - hop / 400})`}} />
        <div style={{position: 'absolute', left: TX, top: TY - hop, width: 560 * TS, height: 900 * TS}}>
          <Teddy t={t} expression={expr} armL={armL} armR={armR} squash={squash} antennaKick={antennaKick}
            headTilt={expr === 'sad' ? -7 : expr === 'smug' ? 5 : 0}
            holding={holdCard && t >= cut + 0.24 ? <foreignObject x={180} y={470} width={200} height={276}><Invitation w={200} /></foreignObject> : undefined} />
        </div>
        {/* le faire-part tombe au sol quand il le lâche */}
        {!holdCard && dropK < 1 ? (
          <div style={{position: 'absolute', left: hands.x - 100, top: hands.y - 140 + IN(dropK) * 700, transform: `rotate(${dropK * 160}deg)`, opacity: 1 - dropK * 0.3}}>
            <Invitation w={200} />
          </div>
        ) : null}
        {/* chips */}
        {chipT > 0 && chipT < 0.9 ? (
          <div style={{position: 'absolute', left: mouth.x - 18 + chipT * 60, top: mouth.y + IN(clamp01(chipT / 0.7)) * 640, width: 40, height: 30,
            background: '#FFC23D', border: `5px solid ${INK}`, borderRadius: '50% 40% 55% 45%', transform: `rotate(${chipT * 720}deg)`}} />
        ) : null}
        {/* annotations « fiche perso » */}
        <Annotation t={t - c('L5', 0.05)} x={glasses.x} y={glasses.y} r={95} lx={glasses.x + 20} ly={glasses.y - 270} label="FÊLÉES DEPUIS 2019" outAt={c('L6') - c('L5', 0.05)} />
        {(() => { const h = toScreen(TEDDY_ANCHORS.hoodie); return <Annotation t={t - c('L6', 0.05)} x={h.x} y={h.y} r={190} lx={760} ly={h.y - 360} label="SWEAT : 11 JOURS" color="#FF3B4E" />; })()}
      </AbsoluteFill>

      {/* badge Diamant → Carton (au-dessus du bureau) */}
      {diaT > 0 && cartonT < 0 ? <div style={{position: 'absolute', right: 40, top: 300}}><RankBadge kind="diamant" t={diaT} size={250} /></div> : null}
      {cartonT > 0 && cartonT < 6 ? (
        <div style={{position: 'absolute', right: 40, top: 300 + (1 - BACK(clamp01(cartonT / 0.35))) * -260, opacity: 1 - zG}}>
          <RankBadge kind="carton" t={0.4} size={250} />
        </div>
      ) : null}
      {cartonT > 0 && cartonT < 0.4 ? (
        // éclats du diamant qui se brise
        <AbsoluteFill>{Array.from({length: 10}).map((_, i) => {
          const a = random(`sh${i}`) * Math.PI * 2, d = EXPO(cartonT / 0.4) * (120 + random(`sd${i}`) * 140);
          return <div key={i} style={{position: 'absolute', left: 1080 - 40 - 125 + Math.cos(a) * d, top: 410 + Math.sin(a) * d + cartonT * 300, width: 26, height: 26,
            background: '#3FE0FF', border: `4px solid ${INK}`, transform: `rotate(${i * 40 + cartonT * 600}deg)`, opacity: 1 - cartonT / 0.4}} />;
        })}</AbsoluteFill>
      ) : null}

      {/* PLAN A (faire-part plein écran) */}
      {inA ? (
        <AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, #2b1748 0%, #0b0614 70%)`, opacity: 1 - toHands}}>
          {Array.from({length: 18}).map((_, i) => (
            <div key={i} style={{position: 'absolute', left: random(`p${i}`) * 1080, top: (random(`q${i}`) * 1920 + t * 40) % 1920, width: 8, height: 8, borderRadius: 4, background: '#FFC23D', opacity: 0.35}} />
          ))}
        </AbsoluteFill>
      ) : null}
      {inA && toHands < 1 ? (
        <div style={{position: 'absolute', left: cardX - cardW / 2, top: cardY - cardW * 0.69, perspective: 1400}}>
          <div style={{transform: `scale(${cardS}) rotateX(${rotX}deg) rotateZ(${rotZ}deg)`, transformOrigin: '50% 50%'}}>
            <Invitation w={cardW} />
          </div>
        </div>
      ) : null}

      {/* HUD (slam sur le drop) + sous-titres */}
      <div style={{transform: `translate(${camX * 0.5}px, ${camY * 0.5}px)`}}>
        <Hud day={30} glow={0} level={1} t={t} slamAt={c('L1end', 0.15)} />
      </div>
      <PunchCaptions caps={caps} y={0.735} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
