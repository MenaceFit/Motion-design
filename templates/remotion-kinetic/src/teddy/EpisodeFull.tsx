// TEDDY · J-30 — Épisode 1 complet (~60 s). Mise en scène calée sur les repères de voix (cues).
// Plans : A faire-part → B Grotte (présentation, gags) → C SMS Inès → D story Maxence →
//         E Grotte (course, chute, vocal de Mamie Jo, checklist, regard caméra) → F vote.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig, random} from 'remotion';
import gsap from 'gsap';
import {Teddy, Expression, TEDDY_ANCHORS} from './Teddy';
import {Grotte, Hud, PunchCaptions, Annotation, Invitation, RankBadge, clamp01, INK, C} from './Sets';
import {GrotteDirt, PizzaTower, SpareHoodie, MaskedFly, Croquette, Phone, MaxenceStory, MamieJoNote, Checklist, VoteCard, DayBanner} from './Props';
import {EpisodeProps} from './Episode';

const BACK = gsap.parseEase('back.out(1.8)');
const EXPO = gsap.parseEase('expo.out');
const IN = gsap.parseEase('power2.in');
const TS = 1.45, TX = 134, TY = 509;
const toScreen = (p: {x: number; y: number}, dx = 0) => ({x: TX + dx + p.x * TS, y: TY + p.y * TS});
const shake = (t: number, at: number, amp: number) => {
  const d = t - at;
  if (d < 0 || d > 0.5) return [0, 0];
  const a = amp * Math.exp(-d * 9);
  return [Math.sin(d * 71) * a, Math.cos(d * 53) * a];
};
const between = (t: number, a: number, b: number) => t >= a && t < b;

// onomatopée de BD (« PAF ! »)
const Bam: React.FC<{t: number; x: number; y: number; text: string}> = ({t, x, y, text}) => {
  if (t < 0 || t > 0.9) return null;
  const s = BACK(clamp01(t / 0.2)) * (1 - clamp01((t - 0.7) / 0.2));
  return (
    <div style={{position: 'absolute', left: x - 200, top: y - 140, width: 400, height: 280, transform: `scale(${s}) rotate(-10deg)`}}>
      <svg viewBox="-200 -140 400 280" width={400} height={280}>
        <path d={Array.from({length: 16}).map((_, i) => { const a = (i / 16) * Math.PI * 2, r = i % 2 ? 110 : 180; return `${i ? 'L' : 'M'}${Math.cos(a) * r} ${Math.sin(a) * r * 0.7}`; }).join(' ') + 'Z'} fill={C.gold} stroke={INK} strokeWidth={10} />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Anton', fontSize: 110, color: C.red, WebkitTextStroke: `8px ${INK}`, paintOrder: 'stroke fill'}}>{text}</div>
    </div>
  );
};

export const TeddyEpisodeFull: React.FC<EpisodeProps> = ({cues, caps, audio}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const c = (k: string, d = 0) => (cues[k] ?? 999) + d;

  // ------- découpage en plans -------
  const cut = c('L1', -0.12);
  const phoneIn = c('L10', -0.15), storyIn = c('L14', -0.15), backIn = c('L16', -0.15), voteIn = c('L22', -0.1);
  const inA = t < cut + 0.25;
  const inPhone = between(t, phoneIn, storyIn + 0.2);
  const inStory = between(t, storyIn, backIn + 0.15);
  const inVote = t >= voteIn;

  // ------- plan A : faire-part -------
  const fall = BACK(clamp01((t - 0.05) / 0.7));
  const toHands = EXPO(clamp01((t - cut) / 0.25));
  const hands = toScreen(TEDDY_ANCHORS.hands);
  const cardW = 640;
  const cardX = interpolate(toHands, [0, 1], [540, hands.x]);
  const cardY = interpolate(fall, [0, 1], [-900, 900]) * (1 - toHands) + toHands * (hands.y - 20);
  const cardS = interpolate(toHands, [0, 1], [1 + 0.06 * clamp01((t - 0.8) / 1.6), 200 / cardW]);

  // ------- Teddy : position, saut, course, chute -------
  const bIn = EXPO(clamp01((t - cut) / 0.3));
  const holdCard = t < c('L2', 0.05);
  const dropK = clamp01((t - c('L2', 0.05)) / 0.7);
  const j = t - c('L2', 0.05);
  let squash = 1, hop = 0;
  if (j > 0 && j < 0.75) {
    if (j < 0.12) squash = 1 - 0.18 * Math.sin((j / 0.12) * Math.PI / 2);
    else if (j < 0.5) { const k = (j - 0.12) / 0.38; hop = Math.sin(k * Math.PI) * 120; squash = 1 + 0.12 * Math.sin(k * Math.PI); }
    else { const k = (j - 0.5) / 0.25; squash = 1 - 0.14 * Math.sin(k * Math.PI); }
  }
  // course vers la porte (le livreur), trébuche dans la tour de pizzas, se relève sur « Tranquille »
  const runStart = c('L16', 1.45), hit = c('L16end', 0.05), getUp = c('L19', -0.15);
  const runK = clamp01((t - runStart) / (hit - runStart));
  const runX = interpolate(IN(runK), [0, 1], [0, 170]);
  const running = t >= runStart && t < hit;
  // chute « crêpe » : écrasé au sol (gag cartoon), puis rebondit debout sur « Tranquille »
  const flat = t < hit ? 0 : t < getUp ? BACK(clamp01((t - hit) / 0.25)) : 1 - BACK(clamp01((t - getUp) / 0.4));
  const fallRot = 0;
  const knock = clamp01((t - hit + 0.05) / 0.6);
  const lean = running ? 14 + Math.sin(t * 30) * 4 : 0;
  hop += running ? Math.abs(Math.sin(t * 22)) * 36 : 0;
  const tx = t < runStart ? 0 : t < getUp ? runX : runX * (1 - EXPO(clamp01((t - getUp) / 0.5)));

  // expressions
  let expr: Expression = 'neutral';
  if (between(t, cut, c('L2'))) expr = 'shock';
  else if (between(t, c('L2'), c('L3'))) expr = 'happy';
  else if (between(t, c('L3'), c('L4', 0.3))) expr = 'proud';
  else if (between(t, c('L4', 0.3), c('L5'))) expr = 'sad';
  else if (between(t, c('L5'), c('L7'))) expr = 'smug';
  else if (between(t, c('L7'), c('L8'))) expr = 'neutral';
  else if (between(t, c('L8'), c('L9'))) expr = 'sad';
  else if (between(t, c('L9'), c('L10'))) expr = 'smug';
  else if (between(t, c('L16'), runStart)) expr = 'neutral';
  else if (between(t, runStart, hit)) expr = 'happy';
  else if (between(t, hit, getUp)) expr = 'shock';
  else if (between(t, getUp, c('L20'))) expr = 'smug';
  else if (between(t, c('L20'), c('L21'))) expr = 'panic';
  else if (t >= c('L21')) expr = 'wink';
  const talkTeddy = between(t, c('L9'), c('L9end')) || between(t, c('L19'), c('L19end'));
  const mouthOpen = talkTeddy ? Math.abs(Math.sin(t * 17)) : 0;

  // bras
  const armsHold = holdCard ? 1 : 1 - EXPO(clamp01((t - c('L2', 0.05)) / 0.3));
  const thumb = clamp01((t - c('L3', 0.1)) / 0.25) * (1 - clamp01((t - c('L4', 0.3)) / 0.3));
  const thumb2 = clamp01((t - c('L9', -0.1)) / 0.2) * (1 - clamp01((t - c('L9end', 0.3)) / 0.25));
  const thumb3 = clamp01((t - c('L19', 0.05)) / 0.2) * (1 - clamp01((t - c('L20')) / 0.25));
  const panicArms = between(t, c('L20'), c('L21')) ? 1 : 0;
  const runArms = running ? Math.sin(t * 22) * 50 : 0;
  const fallArms = between(t, hit, getUp) ? 1 : 0;
  const armL = -50 * armsHold + runArms + panicArms * 60 + fallArms * 70;
  const armR = 50 * armsHold + interpolate(BACK(Math.max(thumb, thumb2, thumb3)), [0, 1], [0, -155]) - runArms - panicArms * 60 - fallArms * 70;
  const antennaKick = Math.max(0, 1 - Math.abs(t - c('L1end', 0.15)) * 3) + (j > 0 ? Math.max(0, 1 - Math.abs(j - 0.5) * 3) : 0)
    + Math.max(0, 1 - Math.abs(t - hit) * 2.5) + Math.max(0, 1 - Math.abs(t - getUp - 0.3) * 3);

  // caméra
  const hood = toScreen(TEDDY_ANCHORS.hoodie);
  const zH = EXPO(clamp01((t - c('L5')) / 0.5)) * (1 - EXPO(clamp01((t - c('L6')) / 0.5)));
  const zEnd = EXPO(clamp01((t - c('L21')) / 0.6));
  const zoom = 1 + 0.22 * zH + 0.03 * clamp01((t - c('L2')) / 3) + 0.45 * zEnd;
  const head = toScreen(TEDDY_ANCHORS.head, tx);
  const origin = t >= c('L21') ? `${head.x}px ${head.y + 80}px` : `${hood.x}px ${hood.y - 120}px`;
  const shk = [shake(t, c('L1end', 0.15), 18), shake(t, c('L4', 0.3), 22), shake(t, hit, 34), shake(t, c('L18end', -0.3), 16)];
  const camX = shk.reduce((a, s) => a + s[0], 0), camY = shk.reduce((a, s) => a + s[1], 0);

  // plans superposés (téléphone / story) : le monde est flouté derrière le téléphone
  const phoneK = EXPO(clamp01((t - phoneIn) / 0.35)) * (1 - EXPO(clamp01((t - storyIn) / 0.3)));
  const storyK = EXPO(clamp01((t - storyIn) / 0.3)) * (1 - EXPO(clamp01((t - backIn) / 0.3)));
  const voteK = EXPO(clamp01((t - voteIn) / 0.35));
  const worldBlur = phoneK * 10;

  const mouth = toScreen(TEDDY_ANCHORS.mouth);
  const chipT = t - c('L1', 0.25);
  const diaT = t - c('L3', 0.2), cartonT = t - c('L4', 0.3);
  const croqT = t - c('L8', 0.0);
  const croqX = interpolate(croqT, [0, 2.4], [1150, -420]);
  const fliesT = t - c('L7');

  return (
    <AbsoluteFill style={{background: '#0b0614', overflow: 'hidden'}}>
      {/* ================= MONDE : la Grotte ================= */}
      {!inStory || storyK < 1 ? (
        <AbsoluteFill style={{opacity: bIn * (1 - storyK), transform: `translate(${camX}px, ${camY}px) scale(${interpolate(bIn, [0, 1], [1.35, 1]) * zoom})`,
          transformOrigin: origin, filter: bIn < 1 || worldBlur > 0.2 ? `blur(${(1 - bIn) * 14 + worldBlur}px) brightness(${1 - phoneK * 0.45})` : undefined}}>
          <AbsoluteFill><Grotte t={t} /></AbsoluteFill>
          <GrotteDirt t={t} />
          <PizzaTower x={790} y={1520} knock={knock} />
          {/* sweat de rechange (au sol, se dresse sur L6) */}
          <div style={{position: 'absolute', left: 110, top: 1290}}>
            {t >= c('L6', 0.1) ? <SpareHoodie t={t - c('L6', 0.1)} /> : (
              <div style={{position: 'absolute', left: 30, top: 250, width: 240, height: 70, background: '#c7902a', border: `7px solid ${INK}`, borderRadius: 30}} />
            )}
          </div>
          {/* ombre */}
          <div style={{position: 'absolute', left: 540 - 230 + tx, top: TY + 835 * TS - 30, width: 460, height: 60, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', transform: `scale(${1 - hop / 400})`}} />
          {/* Teddy */}
          <div style={{position: 'absolute', left: TX + tx, top: TY - hop, width: 560 * TS, height: 900 * TS,
            transform: `rotate(${fallRot + lean * (1 - flat)}deg) scale(${1 + 0.4 * flat}, ${1 - 0.68 * flat})`, transformOrigin: `${280 * TS}px ${835 * TS}px`}}>
            <Teddy t={t} expression={expr} armL={armL} armR={armR} squash={squash} antennaKick={antennaKick} mouthOpen={mouthOpen}
              headTilt={expr === 'sad' ? -7 : expr === 'smug' ? 5 : 0}
              holding={holdCard && t >= cut + 0.24 ? <foreignObject x={180} y={470} width={200} height={276}><Invitation w={200} /></foreignObject> : undefined} />
            {/* part de pizza collée sur le visage après la chute */}
            {t >= hit + 0.1 && t < c('L20', 0.4) ? (
              <svg viewBox="0 0 200 200" width={240} height={240} style={{position: 'absolute', left: 280 * TS - 120, top: 230 * TS - 130, transform: `rotate(${-20}deg)`}}>
                <path d="M100 20 L180 170 Q100 195 20 170 Z" fill="#f6c453" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
                <path d="M30 160 Q100 185 172 160" stroke="#d99a4a" strokeWidth={16} fill="none" />
                {[[90, 80], [120, 130], [70, 140]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={14} fill="#d9542b" stroke={INK} strokeWidth={4} />)}
              </svg>
            ) : null}
          </div>
          {/* mouches masquées */}
          {fliesT > 0 && fliesT < 4.2 ? (
            <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position: 'absolute'}}>
              {[0, 1, 2].map((i) => {
                const a = fliesT * (2.2 + i * 0.4) + i * 2.1, enter = EXPO(clamp01((fliesT - i * 0.15) / 0.5));
                const hx = head.x + Math.cos(a) * 260 * enter + (1 - enter) * 700, hy = head.y - 60 + Math.sin(a * 1.3) * 120;
                return <MaskedFly key={i} x={hx} y={hy} t={t} s={2.3} />;
              })}
            </svg>
          ) : null}
          {/* Croquette quitte la Grotte avec sa valise */}
          {croqT > 0 && croqT < 2.6 ? <div style={{position: 'absolute', left: croqX, top: 1570}}><Croquette t={t} walking /></div> : null}
          {/* faire-part qui tombe */}
          {!holdCard && dropK < 1 ? (
            <div style={{position: 'absolute', left: hands.x - 100, top: hands.y - 140 + IN(dropK) * 700, transform: `rotate(${dropK * 160}deg)`}}><Invitation w={200} /></div>
          ) : null}
          {chipT > 0 && chipT < 0.9 ? (
            <div style={{position: 'absolute', left: mouth.x - 18 + chipT * 60, top: mouth.y + IN(clamp01(chipT / 0.7)) * 640, width: 40, height: 30,
              background: '#FFC23D', border: `5px solid ${INK}`, borderRadius: '50% 40% 55% 45%', transform: `rotate(${chipT * 720}deg)`}} />
          ) : null}
          {/* annotations */}
          <Annotation t={t - c('L5', 0.1)} x={hood.x} y={hood.y} r={190} lx={760} ly={hood.y - 380} label="11 JOURS SANS LAVAGE" color={C.red} outAt={c('L6') - c('L5', 0.1)} />
          <Annotation t={t - c('L6', 0.5)} x={260} y={1440} r={170} lx={330} ly={1060} label="AUTONOME" color={C.gold} outAt={c('L7') - c('L6', 0.5)} />
          <Bam t={t - hit} x={860} y={1250} text="PAF !" />
          {flat > 0.5 ? (
            <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{position: 'absolute'}}>
              {[0, 1, 2, 3].map((i) => {
                const a = t * 5 + i * Math.PI / 2, x = TX + tx + 280 * TS + Math.cos(a) * 170, y = TY + 835 * TS - 420 + Math.sin(a) * 40;
                return <path key={i} transform={`translate(${x} ${y}) scale(1.4)`} d="M0 -20 L6 -6 L20 -6 L9 3 L13 18 L0 9 L-13 18 L-9 3 L-20 -6 L-6 -6 Z" fill={C.gold} stroke={INK} strokeWidth={4} />;
              })}
            </svg>
          ) : null}
        </AbsoluteFill>
      ) : null}

      {/* badges de rang (hors zoom) */}
      {diaT > 0 && cartonT < 0 ? <div style={{position: 'absolute', right: 40, top: 300}}><RankBadge kind="diamant" t={diaT} size={250} /></div> : null}
      {cartonT > 0 && t < c('L5') ? (
        <div style={{position: 'absolute', right: 40, top: 300 + (1 - BACK(clamp01(cartonT / 0.35))) * -260}}><RankBadge kind="carton" t={0.4} size={250} /></div>
      ) : null}
      {cartonT > 0 && cartonT < 0.4 ? (
        <AbsoluteFill>{Array.from({length: 10}).map((_, i) => {
          const a = random(`sh${i}`) * Math.PI * 2, d = EXPO(cartonT / 0.4) * (120 + random(`sd${i}`) * 140);
          return <div key={i} style={{position: 'absolute', left: 915 + Math.cos(a) * d, top: 410 + Math.sin(a) * d + cartonT * 300, width: 26, height: 26,
            background: '#3FE0FF', border: `4px solid ${INK}`, transform: `rotate(${i * 40 + cartonT * 600}deg)`, opacity: 1 - cartonT / 0.4}} />;
        })}</AbsoluteFill>
      ) : null}

      {/* vocal de Mamie Jo (Teddy encore au sol) */}
      {between(t, c('L17', 0.45), getUp + 0.2) ? (
        <div style={{position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: 1 - clamp01((t - getUp) / 0.2)}}>
          <div style={{transform: 'scale(1.3)', transformOrigin: '50% 0%'}}><MamieJoNote t={t - c('L17', 0.45)} talking={between(t, c('L18'), c('L18end'))} /></div>
        </div>
      ) : null}
      {/* checklist interminable */}
      {between(t, c('L20', 0.2), c('L21', 0.3)) ? (
        <div style={{position: 'absolute', top: 330, left: 220, opacity: 1 - clamp01((t - c('L21')) / 0.3), transform: `translateY(${clamp01((t - c('L21')) / 0.3) * -400}px)`}}>
          <Checklist t={t - c('L20', 0.2)} />
        </div>
      ) : null}

      {/* ================= TÉLÉPHONE ================= */}
      {inPhone ? (
        <div style={{position: 'absolute', left: 160, top: 250 + (1 - phoneK) * 1700}}>
          <Phone t={t - phoneIn} typeT={t - c('L11', 0.1)} sendT={t - c('L12', 0.95)} seenT={t - c('L13')} />
        </div>
      ) : null}

      {/* ================= STORY DE MAXENCE ================= */}
      {inStory ? <AbsoluteFill style={{opacity: storyK, transform: `scale(${interpolate(storyK, [0, 1], [1.15, 1])})`}}><MaxenceStory t={t - storyIn} /></AbsoluteFill> : null}

      {/* ================= VOTE ================= */}
      {inVote ? (
        <AbsoluteFill style={{opacity: voteK}}>
          <VoteCard t={t - voteIn} />
          {t >= c('L23') ? <DayBanner t={t - c('L23')} /> : null}
        </AbsoluteFill>
      ) : null}

      {/* plan A : faire-part plein écran */}
      {inA ? (
        <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #2b1748 0%, #0b0614 70%)', opacity: 1 - toHands}}>
          {Array.from({length: 18}).map((_, i) => (
            <div key={i} style={{position: 'absolute', left: random(`p${i}`) * 1080, top: (random(`q${i}`) * 1920 + t * 40) % 1920, width: 8, height: 8, borderRadius: 4, background: '#FFC23D', opacity: 0.35}} />
          ))}
        </AbsoluteFill>
      ) : null}
      {inA && toHands < 1 ? (
        <div style={{position: 'absolute', left: cardX - cardW / 2, top: cardY - cardW * 0.69, perspective: 1400}}>
          <div style={{transform: `scale(${cardS}) rotateX(${interpolate(fall, [0, 1], [70, 0])}deg) rotateZ(${interpolate(fall, [0, 1], [-18, -2]) + Math.sin(t * 1.5) * 1.5 * (1 - toHands)}deg)`}}>
            <Invitation w={cardW} />
          </div>
        </div>
      ) : null}

      {/* HUD + sous-titres */}
      <div style={{transform: `translate(${camX * 0.5}px, ${camY * 0.5}px)`}}>
        <Hud day={30} glow={0} level={1} t={t} slamAt={c('L1end', 0.15)} />
      </div>
      <PunchCaptions caps={caps} y={inVote ? 0.925 : inPhone && phoneK > 0.5 ? 0.925 : 0.735} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
