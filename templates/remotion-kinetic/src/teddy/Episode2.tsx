// TEDDY · J-29 — Épisode 2 « La douche » (~60 s), calé sur les repères de voix.
// Plans : Grotte (récap + odeur + calendrier) → salle de bain (douche-placard, eau glacée, liquide
// vaisselle, mousse) → couloir inondé (Bzz part) → carton « 20 minutes plus tard » → Grotte (propre,
// Croquette applaudit, jauge +4 / −1) → SMS d'Inès → regard caméra → vote DENTS ✕ DRAPS.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import gsap from 'gsap';
import {Teddy, Expression, TEDDY_ANCHORS} from './Teddy';
import {Grotte, Hud, PunchCaptions, Annotation, clamp01, INK, C} from './Sets';
import {GrotteDirt, PizzaTower, Phone, VoteCard, DayBanner} from './Props';
import {BathroomSet, ShowerCurtain, ShowerJunk, Water, Foam, Hallway, BzzVacation, CroquetteClap, ChoiceBanner, TimeCard, Sparkles, GaugePop} from './Bathroom';
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

// calendrier : « MARDI » entouré → « SAMEDI » tamponné
const CalendarPop: React.FC<{t: number; sat: boolean}> = ({t, sat}) => {
  const s = BACK(clamp01(t / 0.3));
  return (
    <div style={{position: 'absolute', top: 420, right: 70, transform: `scale(${s}) rotate(6deg)`, width: 330, background: C.cream, border: `8px solid ${INK}`, borderRadius: 20, boxShadow: `0 10px 0 ${INK}`, overflow: 'hidden'}}>
      <div style={{background: C.red, color: C.cream, fontFamily: 'Anton', fontSize: 44, textAlign: 'center', borderBottom: `6px solid ${INK}`}}>DERNIÈRE DOUCHE</div>
      <div style={{fontFamily: 'Anton', fontSize: 92, textAlign: 'center', color: INK, position: 'relative', padding: '6px 0'}}>
        {sat ? 'SAMEDI' : 'MARDI'}
        {sat ? <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-14deg)'}}>
          <span style={{border: `7px solid ${C.red}`, color: C.red, fontSize: 52, padding: '0 14px', borderRadius: 10, background: 'rgba(255,244,224,0.85)'}}>+4 JOURS</span></div> : null}
      </div>
    </div>
  );
};

export const TeddyEpisode2: React.FC<EpisodeProps> = ({cues, caps, audio}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const c = (k: string, d = 0) => (cues[k] ?? 999) + d;

  // ---------- plans ----------
  const bathIn = c('L3', -0.1), hallIn = c('L14', -0.1), cardIn = c('L16', -0.1), backIn = c('L17', -0.1);
  const phoneIn = c('L22', -0.15), phoneOut = c('L23', -0.1), voteIn = c('L25', -0.1);
  const inGrotteA = t < bathIn + 0.2, inBath = between(t, bathIn, hallIn + 0.2), inHall = between(t, hallIn, cardIn + 0.2);
  const inCard = between(t, cardIn, backIn + 0.2), inGrotteB = between(t, backIn, voteIn + 0.3), inVote = t >= voteIn;
  const xf = (start: number) => EXPO(clamp01((t - start) / 0.3));   // fondu-zoom d'entrée de plan

  // ---------- jauge ----------
  const glow = interpolate(t, [c('L19', 0.5), c('L19', 1.1), c('L21', 0.05), c('L21', 0.4)], [0, 4, 4, 3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // ---------- Teddy : position et état selon le plan ----------
  let tx = 0, expr: Expression = 'neutral', armL = 0, armR = 0, hop = 0, frozen = false, clean = false, towel = false, cloudOn = true, flyOn = true, tilt = 0;
  let squash = 1, shiver = 0;
  if (inGrotteA) {
    expr = t < c('L1') ? 'smug' : t < c('L2') ? 'shock' : 'panic';
    // il renifle son aisselle sur « problème »
    const sniff = clamp01((t - c('L1', 0.1)) / 0.25) * (1 - clamp01((t - c('L2', 0.2)) / 0.25));
    armR = -150 * BACK(sniff); tilt = 10 * sniff;
  } else if (inBath) {
    // entre par la gauche, puis rejoint la douche (derrière le rideau)
    const enter = EXPO(clamp01((t - bathIn) / 0.5));
    const toShower = INOUT(clamp01((t - c('L7', -0.3)) / 0.6));
    tx = interpolate(enter, [0, 1], [-700, -170]) + toShower * 440;
    expr = t < c('L4') ? 'neutral' : t < c('L6') ? 'shock' : t < c('L7') ? 'smug' : t < c('L8', 0.3) ? 'neutral' : t < c('L11') ? 'panic' : t < c('L12', 0.6) ? 'happy' : 'shock';
    if (between(t, c('L6', -0.1), c('L7', -0.2))) armR = -150;                         // « Tranquille. »
    if (between(t, c('L7', 0.2), c('L8'))) armR = -120;                                 // tourne le robinet
    frozen = between(t, c('L8', 0.35), c('L11'));
    shiver = frozen ? Math.sin(t * 60) * 6 : 0;
    // saut sur le cri
    const j = t - c('L9');
    if (j > 0 && j < 0.55) { hop = Math.sin((j / 0.55) * Math.PI) * 260; squash = 1 + 0.15 * Math.sin((j / 0.55) * Math.PI); }
    if (between(t, c('L11', 0.3), c('L13', 0.6))) armR = -125;                          // tient le flacon
    cloudOn = t < c('L13');
  } else if (inGrotteB) {
    clean = t < c('L20', 0.3);
    towel = t < c('L20', 0.3);
    cloudOn = !clean; flyOn = !clean && t >= c('L20', 1.2);
    expr = t < c('L18') ? 'proud' : t < c('L20') ? 'happy' : t < c('L21', 0.4) ? 'smug' : t < c('L23') ? 'shock' : t < c('L24') ? 'panic' : 'wink';
    if (between(t, c('L17', 0.2), c('L18'))) armR = -150;
  }
  const talk = between(t, c('L6'), c('L6end')) || between(t, c('L9'), c('L9end')) || between(t, c('L23'), c('L23end'));
  const mouthOpen = talk ? Math.abs(Math.sin(t * 17)) : 0;
  const antennaKick = Math.max(0, 1 - Math.abs(t - c('L9')) * 2.5) + Math.max(0, 1 - Math.abs(t - c('L17', 0.1)) * 3);

  // caméra
  const head = toScreen(TEDDY_ANCHORS.head, tx);
  const zAnt = inBath ? EXPO(clamp01((t - c('L10')) / 0.5)) * (1 - EXPO(clamp01((t - c('L11')) / 0.4))) : 0;
  const zBottle = inBath ? EXPO(clamp01((t - c('L12', 0.2)) / 0.5)) * (1 - EXPO(clamp01((t - c('L13')) / 0.4))) : 0;
  const zShower = inBath ? EXPO(clamp01((t - c('L4')) / 0.5)) * (1 - EXPO(clamp01((t - c('L6')) / 0.4))) : 0;
  const zEnd = inGrotteB ? EXPO(clamp01((t - c('L24')) / 0.6)) : 0;
  const zoom = 1 + 0.5 * zAnt + 0.35 * zBottle + 0.18 * zShower + 0.4 * zEnd;
  const origin = zAnt > 0.01 || zBottle > 0.01 ? `${head.x}px ${head.y - 60}px` : zShower > 0.01 ? `830px 1300px` : `${head.x}px ${head.y + 100}px`;
  const shk = [shake(t, c('L0end', 0.1), 16), shake(t, c('L9'), 30, 0.8), shake(t, c('L14', 0.1), 26), shake(t, c('L21'), 14)];
  const camX = shk.reduce((a, s) => a + s[0], 0), camY = shk.reduce((a, s) => a + s[1], 0);

  const teddyEl = (
    <div style={{position: 'absolute', left: TX + tx + shiver, top: TY - hop, width: 560 * TS, height: 900 * TS,
      filter: frozen ? 'saturate(0.55) hue-rotate(165deg) brightness(1.12)' : undefined}}>
      <Teddy t={t} expression={expr} armL={armL} armR={armR} squash={squash} antennaKick={antennaKick} mouthOpen={mouthOpen} headTilt={tilt}
        showCloud={cloudOn} showFly={flyOn} clean={clean} frozen={frozen} towel={towel}
        holding={between(t, c('L11', 0.3), c('L13', 0.6)) ? (
          <g transform="translate(300 30) rotate(10) scale(1.3)">
            <rect x={-34} y={-10} width={68} height={150} rx={18} fill="#7fe07a" stroke={INK} strokeWidth={6} />
            <rect x={-14} y={-40} width={28} height={34} rx={6} fill="#fff" stroke={INK} strokeWidth={5} />
            <rect x={-26} y={40} width={52} height={64} rx={6} fill="#fff" stroke={INK} strokeWidth={4} />
            <text x={0} y={70} textAnchor="middle" fontFamily="Anton" fontSize={16} fill={INK}>VAISSELLE</text>
            <text x={0} y={92} textAnchor="middle" fontFamily="Anton" fontSize={14} fill={C.red}>CITRON</text>
          </g>
        ) : undefined} />
    </div>
  );

  const bathT = t - bathIn;
  const junkOut = clamp01((t - c('L5', 0.1)) / (c('L6') - c('L5', 0.1)));
  const curtainOpen = inBath ? 1 - INOUT(clamp01((t - c('L7', 0.15)) / 0.4)) : 1;
  const foamLevel = inBath ? interpolate(t, [c('L12', 1.0), c('L14')], [0, 0.75], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;

  return (
    <AbsoluteFill style={{background: '#0b0614', overflow: 'hidden'}}>
      {/* ============ GROTTE (avant) ============ */}
      {inGrotteA ? (
        <AbsoluteFill style={{transform: `translate(${camX}px, ${camY}px)`, opacity: 1 - EXPO(clamp01((t - bathIn) / 0.2))}}>
          <AbsoluteFill><Grotte t={t} /></AbsoluteFill>
          <GrotteDirt t={t} />
          <PizzaTower x={790} y={1520} knock={0} />
          <div style={{position: 'absolute', left: 540 - 230, top: TY + 835 * TS - 30, width: 460, height: 60, borderRadius: '50%', background: 'rgba(0,0,0,0.45)'}} />
          <div style={{transform: `scale(${1 + 0.25 * clamp01((t - c('L1')) / 2)})`, transformOrigin: '50% 60%'}}>{teddyEl}</div>
          {/* nuage d'odeur XXL quand il renifle */}
          {between(t, c('L1', 0.2), bathIn) ? (
            <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position: 'absolute'}}>
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const k = EXPO(clamp01((t - c('L1', 0.2) - i * 0.08) / 0.6));
                return <circle key={i} cx={720 + Math.cos(i * 1.1) * 160 * k} cy={900 - i * 40 * k + Math.sin(t * 2 + i) * 10} r={70 * k} fill="#8be36a" opacity={0.45} />;
              })}
            </svg>
          ) : null}
          {t >= c('L1', 1.3) ? <CalendarPop t={t - c('L1', 1.3)} sat={t >= c('L2', 0.3)} /> : null}
        </AbsoluteFill>
      ) : null}

      {/* ============ SALLE DE BAIN ============ */}
      {inBath ? (
        <AbsoluteFill style={{opacity: xf(bathIn), transform: `translate(${camX}px, ${camY}px) scale(${interpolate(xf(bathIn), [0, 1], [1.25, 1]) * zoom})`, transformOrigin: origin}}>
          <AbsoluteFill><BathroomSet t={t} /></AbsoluteFill>
          <ShowerJunk t={t} out={junkOut} />
          {teddyEl}
          <Water t={t} on={between(t, c('L7', 0.6), c('L13', 0.8))} x={940} />
          <div style={{position: 'absolute', inset: 0, transform: 'translateY(720px)'}}><ShowerCurtain open={curtainOpen} /></div>
          <Foam level={foamLevel} t={t} cx={860} />
          <Annotation t={t - c('L10', 0.2)} x={head.x + 10} y={head.y - 230} r={70} lx={head.x - 180} ly={head.y - 470} label="−12 °C" color={C.cyan} outAt={c('L11') - c('L10', 0.2)} />
          <Annotation t={t - c('L12', 0.6)} x={toScreen({x: 300, y: 60}, tx).x} y={toScreen({x: 300, y: 60}, tx).y} r={110} lx={480} ly={330} label="LIQUIDE VAISSELLE" color={C.red} outAt={c('L13', 0.3) - c('L12', 0.6)} />
          {/* annotation porte : « placard depuis mars » */}
          <Annotation t={t - c('L4', 0.3)} x={830} y={1360} r={230} lx={560} ly={980} label="PLACARD DEPUIS MARS" color={C.orange} outAt={c('L5', 0.2) - c('L4', 0.3)} />
        </AbsoluteFill>
      ) : null}

      {/* ============ COULOIR ============ */}
      {inHall ? (
        <AbsoluteFill style={{opacity: xf(hallIn), transform: `translate(${camX}px, ${camY}px)`}}>
          <Hallway t={t - hallIn} />
          <BzzVacation t={t - c('L15', 0.3)} fromX={420} fromY={1150} />
        </AbsoluteFill>
      ) : null}

      {/* ============ « 20 MINUTES PLUS TARD » ============ */}
      {inCard ? <AbsoluteFill style={{opacity: xf(cardIn)}}><TimeCard t={t - cardIn} text={'20 MINUTES\nPLUS TARD'.split('\n').join(' ')} /></AbsoluteFill> : null}

      {/* ============ GROTTE (après) ============ */}
      {inGrotteB ? (
        <AbsoluteFill style={{opacity: xf(backIn), transform: `translate(${camX}px, ${camY}px) scale(${zoom})`, transformOrigin: origin}}>
          <AbsoluteFill><Grotte t={t} /></AbsoluteFill>
          <GrotteDirt t={t} />
          <PizzaTower x={790} y={1520} knock={0} />
          <div style={{position: 'absolute', left: 540 - 230, top: TY + 835 * TS - 30, width: 460, height: 60, borderRadius: '50%', background: 'rgba(0,0,0,0.45)'}} />
          {teddyEl}
          {t < c('L20', 0.3) ? <Sparkles t={t} cx={540} cy={1000} r={330} /> : null}
          {/* Croquette revient, renifle, applaudit… puis repart quand il remet le sweat */}
          {between(t, c('L18'), c('L21', 0.6)) ? (
            <div style={{position: 'absolute', top: 1430, left: interpolate(t, [c('L18'), c('L18', 0.6), c('L20', 0.9), c('L21', 0.6)], [1150, 760, 760, 1200], {extrapolateRight: 'clamp'})}}>
              <CroquetteClap t={t} clapping={between(t, c('L18', 1.8), c('L20', 0.6))} />
            </div>
          ) : null}
          {/* Bzz revient (avec sa valise) quand il remet le sweat */}
          {between(t, c('L20', 0.6), c('L20', 1.6)) ? <BzzVacation t={1.6 - (t - c('L20', 0.6)) * 1.6} fromX={head.x + 60} fromY={head.y - 230} /> : null}
          <Annotation t={t - c('L20', 0.7)} x={toScreen(TEDDY_ANCHORS.hoodie).x} y={toScreen(TEDDY_ANCHORS.hoodie).y} r={190} lx={760} ly={toScreen(TEDDY_ANCHORS.hoodie).y - 380} label="JOUR 12" color={C.red} outAt={c('L22') - c('L20', 0.7)} />
        </AbsoluteFill>
      ) : null}

      {/* ============ SMS d'Inès ============ */}
      {between(t, phoneIn, phoneOut + 0.3) ? (
        <div style={{position: 'absolute', left: 160, top: 250 + (1 - EXPO(clamp01((t - phoneIn) / 0.35))) * 1700 + EXPO(clamp01((t - phoneOut) / 0.3)) * 1700}}>
          <Phone t={t - phoneIn} typeT={t - c('L22', 2.6)} sendT={-1} seenT={-1}
            history={[{me: false, text: 'Tu viens accompagné ? 😇'}, {me: true, text: '👍'}]}
            inesText="Au fait… tu viens avec qui ? 👀" typed={['avec ma mè']} time="Aujourd'hui 21:03" />
        </div>
      ) : null}

      {/* ============ VOTE ============ */}
      {inVote ? (
        <AbsoluteFill style={{opacity: xf(voteIn)}}>
          <VoteCard t={t - voteIn} left={{label: 'DENTS', sub: 'BLANCHIR SES DENTS JAUNES', kind: 'teeth'}} right={{label: 'DRAPS', sub: 'DES DRAPS QUI TIENNENT DEBOUT', kind: 'sheets'}} />
          {t >= c('L26') ? <DayBanner t={t - c('L26')} day={28} /> : null}
        </AbsoluteFill>
      ) : null}

      {/* HUD (J-30 → J-29), bandeau de choix, jauge, sous-titres */}
      <div style={{transform: `translate(${camX * 0.5}px, ${camY * 0.5}px)`}}>
        <Hud day={29} prevDay={30} flipAt={c('L0end', 0.1)} glow={glow} level={1} t={t} slamAt={0.05} />
      </div>
      {between(t, c('L0', 0.5), c('L3')) ? <ChoiceBanner t={t - c('L0', 0.5)} text="DOUCHE" /> : null}
      <GaugePop t={t - c('L19', 0.6)} text="+4 %" color={C.gold} />
      <GaugePop t={t - c('L21', 0.05)} text="−1 %" color={C.red} />
      <PunchCaptions caps={caps} y={inVote || between(t, phoneIn + 0.2, phoneOut) ? 0.925 : inCard ? 0.8 : 0.735} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
