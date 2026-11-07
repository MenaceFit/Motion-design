// TEDDY · J-28 — Épisode 3 « Les dents » (~40 s), calé sur les repères de voix.
// Refonte rétention : HOOK plein écran dès la 1re image (gros plan bouche + tampon 2020), récap en
// 1 phrase APRÈS le hook, un gag visuel par phrase, « punch-in » caméra à chaque réplique,
// rebondissement (like de Maxence) et gag récurrent retourné (« Tranquille ? »), vote court.
// Plans : bouche (hook) → Grotte (vote) → salle de bain (brosse-manette, dentifrice périmé,
// miroir fissuré, Croquette masque à gaz, brossage, DING, Bzz lunettes, +6 %) → selfie Inès → vote.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import gsap from 'gsap';
import {Teddy, Expression, TEDDY_ANCHORS} from './Teddy';
import {Grotte, Hud, PunchCaptions, clamp01, INK, C} from './Sets';
import {GrotteDirt, PizzaTower, VoteCard, DayBanner, ReactionInset, Whip} from './Props';
import {BathroomSet, Foam, ChoiceBanner, Sparkles, GaugePop} from './Bathroom';
import {MouthMacro, Stamp, BreathSign, BrushController, ToothpasteTube, MirrorCrack, CroquetteGasMask, BrushTimer, ToothGlint, BzzShades, SelfieChat, SpeedLines} from './Teeth';
import {EpisodeProps} from './Episode';

const BACK = gsap.parseEase('back.out(1.8)');
const EXPO = gsap.parseEase('expo.out');
const INOUT = gsap.parseEase('power2.inOut');
const TS = 1.45, TX = 134, TY = 509;
const toScreen = (p: {x: number; y: number}, dx = 0) => ({x: TX + dx + p.x * TS, y: TY + p.y * TS});
const between = (t: number, a: number, b: number) => t >= a && t < b;
const shake = (t: number, at: number, amp: number, dur = 0.5) => {
  const d = t - at;
  if (d < 0 || d > dur) return [0, 0];
  const a = amp * Math.exp(-d * 9);
  return [Math.sin(d * 71) * a, Math.cos(d * 53) * a];
};
// carte « loupe » blanche qui pop au-dessus de l'action
const PopCard: React.FC<{t: number; out: number; children: React.ReactNode; top?: number; rot?: number}> = ({t, out, children, top = 330, rot = -3}) => {
  if (t < 0 || out > 0.3) return null;
  const s = BACK(clamp01(t / 0.3)) * (1 - EXPO(clamp01(out / 0.25)));
  return (
    <div style={{position: 'absolute', left: 540, top, transform: `translate(-50%, 0) scale(${s}) rotate(${rot}deg)`, background: C.cream, border: `10px solid ${INK}`,
      borderRadius: 40, padding: 24, boxShadow: `0 14px 0 ${INK}`}}>{children}</div>
  );
};

export const TeddyEpisode3: React.FC<EpisodeProps> = ({cues, caps, audio, env, envRate = 30}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const c = (k: string, d = 0) => (cues[k] ?? 999) + d;
  const envAt = (tt: number) => (env && env.length ? env[Math.min(env.length - 1, Math.max(0, Math.round(tt * envRate)))] : 0);

  // ---------- plans ----------
  const grotteIn = c('L2', -0.12), bathIn = c('L3', -0.12), phoneIn = c('L15', -0.12), voteIn = c('L20', -0.12);
  const inHook = t < grotteIn + 0.15, inGrotte = between(t, grotteIn, bathIn + 0.15), inBath = between(t, bathIn, phoneIn + 0.15);
  const inPhone = between(t, phoneIn, voteIn + 0.15), inVote = t >= voteIn;
  const xf = (start: number) => EXPO(clamp01((t - start) / 0.25));

  // « punch-in » : petite poussée de caméra au début de chaque réplique (rien n'est jamais figé)
  let punch = 0;
  for (let i = 0; i < 30; i++) { const d = t - c(`L${i}`); if (d >= 0 && d < 0.6) punch += 0.045 * Math.exp(-d * 7) * Math.min(1, d / 0.05); }

  // ---------- jauge (fin d'ép. 2 : 3 %) ----------
  const glow = interpolate(t, [c('L14', 0.3), c('L14', 0.9)], [3, 9], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // ---------- secousses ----------
  const shk = [shake(t, c('L0end', -0.55), 22), shake(t, c('L7', 0.35), 34, 0.7), shake(t, c('L12'), 20), shake(t, c('L18', 0.35), 26), shake(t, c('L1', 0.5), 14)];
  const camX = shk.reduce((a, s) => a + s[0], 0), camY = shk.reduce((a, s) => a + s[1], 0);

  // ---------- Teddy (salle de bain) ----------
  const tx = 170;
  let expr: Expression = 'neutral', armR = 0, armL = 0, tilt = 0, shiny = false, cloudOn = true;
  if (inGrotte) { expr = 'smug'; tilt = 5; }
  if (inBath) {
    expr = t < c('L4') ? 'proud' : t < c('L5') ? 'neutral' : t < c('L6') ? 'smug' : t < c('L8') ? 'shock' : t < c('L9') ? 'sad' : t < c('L12') ? 'panic' : t < c('L14') ? 'happy' : 'proud';
    tilt = t >= c('L5') && t < c('L6') ? 6 : 0;
    shiny = t >= c('L12');
    cloudOn = t < c('L11');
    if (between(t, c('L9'), c('L11', 0.15))) armR = -150;          // brossage
    if (between(t, c('L14'), c('L15'))) { armL = -40; armR = -150; } // pouce/célébration
  }
  const brushing = inBath && between(t, c('L9'), c('L11', 0.15));
  const talkTeddy = between(t, c('L5'), c('L5end'));
  const mouthOpen = talkTeddy ? Math.min(1, envAt(t) * 1.6 + 0.15) : 0;
  const antennaKick = Math.max(0, 1 - Math.abs(t - c('L7', 0.35)) * 2.5) + Math.max(0, 1 - Math.abs(t - c('L12')) * 3);
  const osc = Math.sin(t * 34) * 18;

  // caméra salle de bain : zoom miroir (L6–L7), zoom visage (L11–L12)
  const mouthS = toScreen(TEDDY_ANCHORS.mouth, tx);
  const zMirror = inBath ? INOUT(clamp01((t - c('L6', -0.05)) / 0.45)) * (1 - EXPO(clamp01((t - c('L8', -0.1)) / 0.4))) : 0;
  const zFace = inBath ? EXPO(clamp01((t - c('L11', -0.05)) / 0.6)) * (1 - EXPO(clamp01((t - c('L13', 0.1)) / 0.5))) : 0;
  const bathZoom = (1 + 1.25 * zMirror + 0.75 * zFace) * (1 + punch);
  const ox = zMirror > 0.01 ? 235 : zFace > 0.01 ? mouthS.x : 540, oy = zMirror > 0.01 ? 710 : zFace > 0.01 ? mouthS.y - 120 : 1100;
  // position écran de la bouche après le zoom (pour l'éclat « DING »)
  const mouthAfter = {x: ox + (mouthS.x - ox) * bathZoom + camX, y: oy + (mouthS.y - oy) * bathZoom + camY};

  const brushEl = brushing ? (
    <g>
      <g transform={`translate(${osc * 0.6} ${osc * 0.35})`}>
        <path d="M468 232 L306 334" stroke={INK} strokeWidth={30} strokeLinecap="round" />
        <path d="M468 232 L306 334" stroke={C.pink} strokeWidth={18} strokeLinecap="round" />
        <rect x={262} y={316} width={56} height={34} rx={8} fill="#fff" stroke={INK} strokeWidth={5} transform="rotate(-32 290 333)" />
      </g>
      {/* mousse à la bouche */}
      {Array.from({length: 9}).map((_, i) => <circle key={i} cx={250 + (i % 5) * 16 + Math.sin(t * 9 + i) * 4} cy={352 + Math.floor(i / 5) * 18 + ((t * 40 + i * 9) % 26)} r={9 + (i % 3) * 4} fill="#fff" stroke="#cfe8ff" strokeWidth={2} />)}
    </g>
  ) : undefined;

  const teddyEl = (
    <div style={{position: 'absolute', left: TX + tx, top: TY, width: 560 * TS, height: 900 * TS}}>
      <Teddy t={t} expression={expr} armL={armL} armR={armR} antennaKick={antennaKick} mouthOpen={mouthOpen} headTilt={tilt + (brushing ? Math.sin(t * 17) * 3 : 0)}
        showCloud={cloudOn} showFly={t < c('L13')} shinyTeeth={shiny} />
      {/* brosse dessinée AU-DESSUS du visage (l'objet tenu passe derrière la tête) */}
      {brushEl ? <svg viewBox="0 0 560 900" width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>{brushEl}</svg> : null}
    </div>
  );

  // reflet de Teddy dans le miroir (bouche grande ouverte)
  const reflection = between(t, c('L6', -0.1), c('L8')) ? (
    <div style={{position: 'absolute', left: 70, top: 520, width: 330, height: 380, borderRadius: 20, overflow: 'hidden', opacity: 0.85}}>
      <div style={{position: 'absolute', width: 560 * 0.95, height: 900 * 0.95, left: 165 - 280 * 0.95, top: 210 - 280 * 0.95, transform: 'scaleX(-1)'}}>
        <Teddy t={t} expression="shock" showCloud={false} showFly={false} />
      </div>
      {/* l'haleine sur la vitre */}
      <div style={{position: 'absolute', left: 120, top: 210, width: 120, height: 90, borderRadius: '50%', background: '#8be36a', opacity: 0.55 * clamp01((t - c('L6', 0.4)) / 0.4), filter: 'blur(6px)'}} />
    </div>
  ) : null;

  const foamLevel = inBath ? interpolate(t, [c('L10', -0.1), c('L10', 0.6), c('L11', 0.1), c('L11', 0.45)], [0, 0.55, 0.55, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;

  return (
    <AbsoluteFill style={{background: '#0b0614', overflow: 'hidden'}}>
      {/* ============ HOOK : gros plan bouche ============ */}
      {inHook ? (
        <AbsoluteFill style={{transform: `translate(${camX}px, ${camY}px) scale(${(1.08 + 0.1 * clamp01(t / 4.5)) * (1 + punch)})`, transformOrigin: '50% 50%'}}>
          <MouthMacro t={t} open={0.6 + 0.4 * BACK(clamp01(t / 0.3)) - 0.1 * Math.abs(Math.sin(t * 2.4))} gas={clamp01((t - c('L1', -0.1)) / 1.6)} />
        </AbsoluteFill>
      ) : null}
      {inHook ? <Stamp t={t - c('L0end', -0.6)} top="DERNIER BROSSAGE" big="2020" y={500} /> : null}
      {inHook ? <BreathSign t={t - c('L1', 0.45)} /> : null}

      {/* ============ GROTTE : récap du vote ============ */}
      {inGrotte ? (
        <AbsoluteFill style={{opacity: xf(grotteIn), transform: `translate(${camX}px, ${camY}px) scale(${1 + punch})`, transformOrigin: '50% 60%'}}>
          <AbsoluteFill><Grotte t={t} /></AbsoluteFill>
          <GrotteDirt t={t} />
          <PizzaTower x={790} y={1520} knock={0} />
          <div style={{position: 'absolute', left: TX, top: TY, width: 560 * TS, height: 900 * TS}}>
            <Teddy t={t} expression={expr} headTilt={tilt} armR={-150 * BACK(clamp01((t - c('L2', 0.6)) / 0.3))} />
          </div>
        </AbsoluteFill>
      ) : null}
      {inGrotte ? <ChoiceBanner t={t - c('L2', 0.35)} text="DENTS" /> : null}

      {/* ============ SALLE DE BAIN ============ */}
      {inBath ? (
        <AbsoluteFill style={{opacity: xf(bathIn), transform: `translate(${camX}px, ${camY}px) scale(${bathZoom})`, transformOrigin: `${ox}px ${oy}px`}}>
          <AbsoluteFill><BathroomSet t={t} /></AbsoluteFill>
          {reflection}
          <MirrorCrack t={t - c('L7', 0.3)} />
          {teddyEl}
          <Foam level={foamLevel} t={t} cx={mouthS.x} />
          {/* Croquette entre avec un masque à gaz */}
          {t >= c('L8', -0.2) ? (
            <div style={{position: 'absolute', top: 1330, transform: 'scale(1.5)', transformOrigin: '0% 100%', left: interpolate(t, [c('L8', -0.2), c('L8', 0.35)], [-520, 20], {extrapolateRight: 'clamp'})}}>
              <CroquetteGasMask t={t} maskIn={t - c('L8', 0.5)} />
            </div>
          ) : null}
          {t >= c('L14') ? <Sparkles t={t} cx={mouthS.x} cy={mouthS.y - 80} r={330} /> : null}
        </AbsoluteFill>
      ) : null}
      {inBath ? (
        <>
          <PopCard t={t - c('L3', 0.25)} out={t - c('L4', -0.15)}><BrushController t={t} scrub={clamp01((t - c('L3', 0.9)) / 0.2)} /></PopCard>
          <PopCard t={t - c('L4', 0.05)} out={t - c('L5', -0.05)} rot={3}><ToothpasteTube t={t} squeeze={clamp01((t - c('L4', 0.7)) / 0.5)} stampT={t - c('L4end', -0.75)} /></PopCard>
          <SpeedLines t={t} on={brushing ? 0.9 : 0} />
          <BrushTimer t={between(t, c('L9'), c('L11')) ? t - c('L9') : -1} dur={Math.max(0.8, c('L10end') - c('L9', 0.3))} />
          <ToothGlint t={t - c('L12', -0.03)} x={mouthAfter.x} y={mouthAfter.y} />
          {between(t, c('L13', -0.1), c('L14', -0.1)) ? (
            <>
              <AbsoluteFill style={{background: 'rgba(11,6,20,0.55)', opacity: xf(c('L13', -0.1))}} />
              <BzzShades t={t - c('L13', -0.05)} />
            </>
          ) : null}
        </>
      ) : null}

      {/* ============ SELFIE À INÈS ============ */}
      {inPhone ? (
        <AbsoluteFill style={{opacity: xf(phoneIn), background: `radial-gradient(circle at 50% 40%, #ff7bb0 0%, #7B4DFF 55%, #2a1470 100%)`, transform: `scale(${1 + punch * 0.6})`}}>
          <div style={{position: 'absolute', left: 160, top: 250 + (1 - EXPO(clamp01((t - phoneIn) / 0.35))) * 1700}}>
            <SelfieChat t={t} sendT={t - c('L15', 0.55)} replyT={t - c('L17', -0.05)} likeT={t - c('L18', 0.35)} />
          </div>
          <div style={{position: 'absolute', left: 24, top: 1250}}>
            <ReactionInset t={t} inT={t - c('L16', -0.1)} size={t >= c('L19') ? 400 : 330}
              expression={t < c('L17') ? 'smug' : t < c('L18', 0.35) ? 'happy' : t < c('L19') ? 'shock' : 'panic'}
              mouthOpen={between(t, c('L19'), c('L19end')) ? Math.min(1, envAt(t) * 1.6 + 0.2) : 0} sweat={t >= c('L18', 0.35)} />
          </div>
        </AbsoluteFill>
      ) : null}

      {/* ============ VOTE ============ */}
      {inVote ? (
        <AbsoluteFill style={{opacity: xf(voteIn)}}>
          <VoteCard t={t - voteIn} left={{label: 'COIFFEUR', sub: 'ADIEU LA MÈCHE ?', kind: 'hair'}} right={{label: 'SPORT', sub: 'SOULEVER PLUS DE 2 KG', kind: 'gym'}} />
          {t >= c('L21', 0.2) ? <DayBanner t={t - c('L21', 0.2)} day={27} /> : null}
        </AbsoluteFill>
      ) : null}

      {/* transitions « whip » à chaque changement de lieu */}
      <Whip t={t - grotteIn + 0.12} />
      <Whip t={t - bathIn + 0.12} dir={-1} />
      <Whip t={t - phoneIn + 0.12} />
      <Whip t={t - voteIn + 0.12} dir={-1} />

      {/* HUD (J-29 → J-28 sur le récap), jauge, sous-titres */}
      <div style={{transform: `translate(${camX * 0.5}px, ${camY * 0.5}px)`}}>
        <Hud day={28} prevDay={29} flipAt={c('L2', 0.3)} glow={glow} level={1} t={t} slamAt={0.05} />
      </div>
      <GaugePop t={t - c('L14', 0.4)} text="+6 %" color={C.gold} />
      <PunchCaptions caps={caps} y={inVote || inPhone ? 0.925 : 0.735} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
