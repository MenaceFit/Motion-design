/*
 * Rig 2D de Teddy (série « J-30 ») — SVG vectoriel, contours épais, pilotable image par image.
 * Repère du personnage : viewBox 0 0 560 900 (pieds ~ y 835). Pivots :
 *   tête   (280, 372) — inclinaison
 *   bras G (165, 418) — rotation à l'épaule (angle négatif = la main va vers le centre)
 *   bras D (395, 418)
 *   corps  (280, 835) — respiration / squash & stretch
 * Tout est fonction de props (t, expression, pose…) → déterministe.
 */
import React from 'react';

export type Expression = 'neutral' | 'happy' | 'proud' | 'shock' | 'sad' | 'panic' | 'smug' | 'wink';
export type TeddyProps = {
  t: number;                 // temps en s (vie : respiration, clignements, antenne)
  level?: 1 | 5;
  expression?: Expression;
  armL?: number;             // angle (deg) bras gauche ; 0 = le long du corps
  armR?: number;
  headTilt?: number;         // deg
  squash?: number;           // 1 = normal ; <1 écrasé ; >1 étiré
  antennaKick?: number;      // impulsion de la mèche (0..1), décroît d'elle-même
  holding?: React.ReactNode; // objet tenu à deux mains (dessiné devant le torse)
  blinkSeed?: number;
  mouthOpen?: number;        // 0..1 (parole)
  shinyTeeth?: boolean;      // ép. 3 : dents enfin brossées (blanches)
  showCloud?: boolean;
  showFly?: boolean;
  clean?: boolean;   // après la douche : peau nette, plus de boutons
  frozen?: boolean;  // eau glacée : glaçons sur la mèche et le nez
  towel?: boolean;   // serviette enroulée sur la tête
  look?: number;     // direction du regard -1 (gauche) … 1 (droite)
};

const INK = '#1B1030';
const SKIN = '#F2C09A';
const o = {stroke: INK, strokeWidth: 7, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

// clignement : 4 frames fermé toutes les ~3,4 s (décalé par graine)
const blinkAmount = (t: number, seed = 0) => {
  const period = 3.4, ph = (t + seed * 1.37) % period;
  if (ph > period - 0.12) { const k = (ph - (period - 0.12)) / 0.12; return 1 - Math.abs(k * 2 - 1); }
  return 0;
};

const Eyes: React.FC<{expr: Expression; blink: number; level: 1 | 5; look?: number}> = ({expr, blink, level, look = 0}) => {
  const lid = Math.max(blink, expr === 'sad' ? 0.45 : expr === 'smug' ? 0.5 : expr === 'neutral' && level === 1 ? 0.3 : 0);
  const pupil = expr === 'shock' || expr === 'panic' ? 6 : 9;
  const r = expr === 'shock' || expr === 'panic' ? 26 : level === 5 ? 20 : 22;
  return (
    <g>
      {[228, 332].map((cx, i) => (
        <g key={cx}>
          {expr === 'happy' || (expr === 'wink' && i === 1) ? (
            <path d={`M${cx - 18} 258 q18 -18 36 0`} stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />
          ) : (
            <>
              <circle cx={cx} cy={252} r={r} fill="#fff" />
              <circle cx={cx + (i ? -3 : 3) + look * 9} cy={256} r={pupil} fill={INK} />
              {level === 5 || expr === 'proud' ? <circle cx={cx + 3} cy={250} r={3} fill="#fff" /> : null}
              {/* paupière (cache le haut de l'œil) */}
              <rect x={cx - r - 2} y={252 - r - 2} width={r * 2 + 4} height={(r * 2 + 4) * lid} fill={SKIN} />
              {lid > 0.05 ? <path d={`M${cx - r} ${252 - r + (r * 2) * lid} h${r * 2}`} stroke={INK} strokeWidth={4} /> : null}
            </>
          )}
        </g>
      ))}
      {level === 1 ? (
        <>
          <path d="M208 278 q20 12 42 0" stroke="#8d5fc4" strokeWidth={5} fill="none" />
          <path d="M310 278 q20 12 42 0" stroke="#8d5fc4" strokeWidth={5} fill="none" />
        </>
      ) : null}
    </g>
  );
};

const Brows: React.FC<{expr: Expression; level: 1 | 5}> = ({expr, level}) => {
  const lift = expr === 'shock' || expr === 'panic' ? -16 : expr === 'sad' ? 0 : expr === 'proud' || expr === 'smug' ? -6 : 0;
  const sadTilt = expr === 'sad' || expr === 'panic' ? 10 : 0;
  const angry = 0;
  const w = level === 1 ? 12 : 10;
  return (
    <g stroke="#3a2416" strokeWidth={w} fill="none" strokeLinecap="round">
      <path d={`M200 ${205 + lift + angry} q30 ${-18 - sadTilt} 58 ${-4 + sadTilt}`} />
      <path d={`M302 ${201 + lift} q30 ${-14 + sadTilt} 58 ${4 - sadTilt}`} />
    </g>
  );
};

const Mouth: React.FC<{expr: Expression; open: number; level: 1 | 5; shiny?: boolean}> = ({expr, open, level, shiny}) => {
  const teeth = level === 1 && !shiny ? '#e8d36b' : '#ffffff';
  if (expr === 'shock' || expr === 'panic' || open > 0.15) {
    const h = expr === 'shock' || expr === 'panic' ? 34 : 10 + 26 * open;
    return <ellipse cx={280} cy={336} rx={expr === 'panic' ? 30 : 22} ry={h / 2 + 4} fill="#5a1f2a" stroke={INK} strokeWidth={5} />;
  }
  if (expr === 'sad') return <path d="M252 344 q28 -20 56 0" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />;
  if (expr === 'happy' || expr === 'proud' || expr === 'wink' || level === 5) {
    return (
      <g>
        <path d="M236 320 q44 46 88 0 q-44 14 -88 0z" fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        {level === 1 && !shiny ? <><rect x={262} y={331} width={12} height={9} fill={teeth} /><rect x={286} y={331} width={12} height={9} fill={teeth} /></> : null}
      </g>
    );
  }
  if (expr === 'smug') return <path d="M254 334 q30 10 56 -8" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />;
  return (
    <g>
      <path d="M248 330 q32 26 64 0 q-32 8 -64 0z" fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <rect x={262} y={331} width={12} height={9} fill={teeth} /><rect x={284} y={331} width={12} height={9} fill={teeth} />
    </g>
  );
};

const Arm: React.FC<{side: 'L' | 'R'; angle: number; level: 1 | 5}> = ({side, angle, level}) => {
  const L = side === 'L';
  const px = L ? 165 : 395;
  const sleeve = level === 1 ? '#E3A82B' : '#F3E6CC';
  const d = L ? 'M152 405 Q100 470 112 600 L150 605 Q150 500 180 450 Z' : 'M408 405 Q460 470 448 600 L410 605 Q410 500 380 450 Z';
  return (
    <g transform={`rotate(${angle} ${px} 418)`}>
      <path d={d} fill={sleeve} {...o} />
      <circle cx={L ? 130 : 430} cy={618} r={24} fill={SKIN} {...o} />
    </g>
  );
};

export const Teddy: React.FC<TeddyProps> = ({
  t, level = 1, expression = 'neutral', armL = 0, armR = 0, headTilt = 0, squash = 1, antennaKick = 0,
  holding, blinkSeed = 0, mouthOpen = 0, shinyTeeth = false, showCloud = true, showFly = true, clean = false, frozen = false, towel = false, look = 0,
}) => {
  const breath = 1 + Math.sin(t * 2.4) * 0.012;
  const blink = blinkAmount(t, blinkSeed);
  // mèche antenne : oscillation idle + impulsion amortie (ressort)
  const ant = Math.sin(t * 3.1) * 6 + antennaKick * Math.sin(t * 22) * 28;
  const droop = expression === 'sad' ? 35 : expression === 'panic' ? -20 : 0;
  const sy = squash * breath, sx = 1 / Math.sqrt(squash) * (2 - breath);
  const L1 = level === 1;
  return (
    <svg viewBox="0 0 560 900" width="100%" height="100%" style={{overflow: 'visible'}}>
      {/* nuage d'odeur violet + Bzz (niveau 1) */}
      {L1 && showCloud ? (
        <g opacity={0.5 + 0.1 * Math.sin(t * 2)} transform={`translate(${Math.sin(t * 0.8) * 10} 0)`}>
          <circle cx={110} cy={420 + Math.sin(t * 1.3) * 8} r={38} fill="#9b6bff" />
          <circle cx={142} cy={392} r={30} fill="#9b6bff" />
          <circle cx={452} cy={470 + Math.cos(t * 1.1) * 8} r={34} fill="#9b6bff" />
          <circle cx={426} cy={440} r={24} fill="#9b6bff" />
        </g>
      ) : null}
      <g transform={`translate(280 835) scale(${sx} ${sy}) translate(-280 -835)`}>
        {/* jambes */}
        <path d="M205 640 L195 800 L262 800 L272 650 Z" fill={L1 ? '#2B3A67' : '#3C5A8C'} {...o} />
        <path d="M290 650 L300 800 L367 800 L357 640 Z" fill={L1 ? '#2B3A67' : '#3C5A8C'} {...o} />
        {L1 ? (
          <>
            <circle cx={232} cy={720} r={13} fill={SKIN} stroke={INK} strokeWidth={4} />
            <rect x={198} y={795} width={62} height={30} rx={8} fill="#FF7BB0" {...o} />
            <rect x={302} y={795} width={62} height={30} rx={8} fill="#5BD17A" {...o} />
            <circle cx={320} cy={808} r={5} fill="#2e8a49" /><circle cx={342} cy={812} r={4} fill="#2e8a49" />
            <path d="M180 822 h96 q8 0 8 10 v6 h-112 v-6 q0 -10 8 -10z" fill="#8d8aa0" {...o} />
            <path d="M290 822 h96 q8 0 8 10 v6 h-112 v-6 q0 -10 8 -10z" fill="#8d8aa0" {...o} />
          </>
        ) : (
          <>
            <path d="M184 800 h84 q18 0 20 22 v10 h-110 v-12 q0 -20 6 -20z" fill="#fff" {...o} />
            <path d="M294 800 h84 q18 0 20 22 v10 h-110 v-12 q0 -20 6 -20z" fill="#fff" {...o} />
          </>
        )}
        {/* torse */}
        {L1 ? (
          <>
            <path d="M150 400 Q280 330 410 400 L440 560 Q450 660 280 668 Q110 660 120 560 Z" fill="#E3A82B" {...o} />
            <path d="M175 640 Q280 662 385 640" fill="none" stroke="#b9831a" strokeWidth={6} />
            <path d="M330 520 q15 -10 25 2 q12 6 2 18 q-6 12 -20 6 q-16 2 -12 -12z" fill="#d9542b" opacity={0.85} />
            <g transform="translate(225 470)">
              <circle r={26} fill="#a0612c" stroke={INK} strokeWidth={4} />
              <circle cx={-20} cy={-20} r={10} fill="#a0612c" stroke={INK} strokeWidth={4} />
              <circle cx={20} cy={-20} r={10} fill="#a0612c" stroke={INK} strokeWidth={4} strokeDasharray="5 5" />
              <circle cx={-8} cy={-3} r={3} fill={INK} /><circle cx={8} cy={-3} r={3} fill={INK} />
              <ellipse cx={0} cy={8} rx={7} ry={5} fill="#e6b98c" />
            </g>
            <path d="M160 410 L410 590" stroke={INK} strokeWidth={10} />
            <rect x={340} y={560} width={96} height={54} rx={22} fill="#2a2433" {...o} transform="rotate(14 388 587)" />
            <rect x={388} y={532} width={34} height={40} rx={6} fill="#FFC23D" {...o} transform="rotate(20 405 552)" />
          </>
        ) : (
          <>
            <path d="M190 420 Q280 395 370 420 L380 640 Q280 660 180 640 Z" fill="#FFF4E0" {...o} />
            <path d="M150 405 Q210 370 250 400 L240 650 Q160 650 130 620 Q120 520 150 405 Z" fill="#F3E6CC" {...o} />
            <path d="M410 405 Q350 370 310 400 L320 650 Q400 650 430 620 Q440 520 410 405 Z" fill="#F3E6CC" {...o} />
            <g transform="translate(200 470)">
              <circle r={24} fill="#FFC23D" stroke={INK} strokeWidth={4} />
              <circle cx={-18} cy={-18} r={9} fill="#FFC23D" stroke={INK} strokeWidth={4} />
              <circle cx={18} cy={-18} r={9} fill="#FFC23D" stroke={INK} strokeWidth={4} />
              <circle cx={-7} cy={-3} r={3} fill={INK} /><circle cx={7} cy={-3} r={3} fill={INK} />
            </g>
            <path d="M168 412 L404 586" stroke="#7a4a2a" strokeWidth={9} />
            <rect x={350} y={562} width={84} height={50} rx={14} fill="#9a5d34" {...o} transform="rotate(14 392 587)" />
          </>
        )}
        {/* objet tenu, puis bras par-dessus (les mains agrippent les bords) */}
        {holding ? <g>{holding}</g> : null}
        <Arm side="L" angle={armL} level={level} />
        <Arm side="R" angle={armR} level={level} />
        {/* tête */}
        <g transform={`rotate(${headTilt} 280 372)`}>
          <rect x={252} y={350} width={56} height={40} fill={SKIN} />
          <circle cx={280} cy={250} r={128} fill={SKIN} {...o} />
          {L1 ? (
            <>
              <path d="M160 230 Q150 120 280 112 Q410 120 400 230 Q392 180 360 170 Q330 150 300 168 Q270 148 240 168 Q205 155 182 190 Z" fill="#4a2e1f" {...o} />
              <path d="M160 235 Q140 300 165 340 Q178 300 172 262 Z" fill="#4a2e1f" {...o} />
              <path d="M400 235 Q420 300 395 340 Q382 300 388 262 Z" fill="#4a2e1f" {...o} />
            </>
          ) : (
            <path d="M162 222 Q160 128 280 118 Q400 128 398 222 Q380 172 330 164 Q280 150 230 164 Q182 175 162 222 Z" fill="#4a2e1f" {...o} />
          )}
          {/* mèche antenne (ressort) — gelée = rigide */}
          {towel ? null : <g transform={`rotate(${frozen ? 0 : ant + droop} 285 120)`}>
            <path d="M285 120 Q270 60 300 48 Q330 40 322 72 Q314 92 296 84" fill="none" stroke={INK} strokeWidth={13} strokeLinecap="round" />
            <path d="M285 120 Q270 60 300 48 Q330 40 322 72 Q314 92 296 84" fill="none" stroke={frozen ? '#bff0ff' : L1 ? '#4a2e1f' : '#FFC23D'} strokeWidth={6} strokeLinecap="round" />
            {frozen ? <path d="M296 84 l-6 34 l14 -30 z" fill="#bff0ff" stroke={INK} strokeWidth={4} /> : null}
          </g>}
          <Brows expr={expression} level={level} />
          <Eyes expr={expression} blink={blink} level={level} look={look} />
          {/* lunettes */}
          {L1 ? (
            <>
              <circle cx={228} cy={255} r={42} fill="#cfe8ff" fillOpacity={0.18} stroke={INK} strokeWidth={8} />
              <circle cx={332} cy={255} r={42} fill="#cfe8ff" fillOpacity={0.18} stroke={INK} strokeWidth={8} />
              <path d="M270 252 q10 -8 20 0" stroke={INK} strokeWidth={7} fill="none" />
              <path d="M205 230 l18 18 l-8 12 l20 16" stroke="#FFF4E0" strokeWidth={3} fill="none" />
            </>
          ) : (
            <>
              <circle cx={228} cy={253} r={38} fill="none" stroke={INK} strokeWidth={5} />
              <circle cx={332} cy={253} r={38} fill="none" stroke={INK} strokeWidth={5} />
              <path d="M266 250 q14 -8 28 0" stroke={INK} strokeWidth={5} fill="none" />
            </>
          )}
          <path d="M280 268 q-10 26 6 30" stroke="#c98d68" strokeWidth={5} fill="none" strokeLinecap="round" />
          {L1 ? <path d="M250 318 q30 -8 60 0" stroke="#7a5a45" strokeWidth={3} strokeDasharray="2 4" fill="none" /> : null}
          <Mouth expr={expression} open={mouthOpen} level={level} shiny={shinyTeeth} />
          {L1 && !clean ? (
            <g fill="#e2574c">
              <circle cx={200} cy={305} r={6} /><circle cx={356} cy={300} r={5} /><circle cx={318} cy={186} r={5} /><circle cx={214} cy={322} r={4} />
            </g>
          ) : null}
          {frozen ? (
            <g fill="#bff0ff" stroke={INK} strokeWidth={4}>
              <path d="M268 300 l8 46 l8 -46 z" />
              <path d="M200 360 l6 30 l6 -30 z" /><path d="M350 362 l5 26 l5 -26 z" />
            </g>
          ) : null}
          {towel ? (
            <g>
              <path d="M150 210 Q160 70 290 64 Q420 70 412 210 Q380 150 280 150 Q180 150 150 210 Z" fill="#8fd3ff" stroke={INK} strokeWidth={7} />
              <path d="M240 70 Q300 0 360 40 Q330 70 300 64 Z" fill="#8fd3ff" stroke={INK} strokeWidth={7} />
              <path d="M180 170 Q280 130 380 170" stroke="#5fb3e0" strokeWidth={6} fill="none" />
            </g>
          ) : null}
          {expression === 'panic' ? <path d="M392 190 q10 20 0 30 q-10 -10 0 -30z" fill="#7fd3ff" stroke={INK} strokeWidth={3} /> : null}
        </g>
      </g>
      {/* Bzz la mouche */}
      {L1 && showFly ? (
        <g transform={`translate(${430 + Math.sin(t * 3.3) * 40} ${150 + Math.sin(t * 5.1) * 30})`}>
          <ellipse rx={12} ry={9} fill={INK} />
          <ellipse cx={-6} cy={-12} rx={9} ry={6 * (0.6 + 0.4 * Math.abs(Math.sin(t * 60)))} fill="#cfe8ff" opacity={0.9} />
          <ellipse cx={7} cy={-12} rx={9} ry={6 * (0.6 + 0.4 * Math.abs(Math.cos(t * 60)))} fill="#cfe8ff" opacity={0.9} />
        </g>
      ) : null}
    </svg>
  );
};

// position (dans le repère 560×900 du personnage) des zones utiles aux annotations
export const TEDDY_ANCHORS = {
  glasses: {x: 228, y: 255, r: 60},
  hoodie: {x: 300, y: 540, r: 120},
  socks: {x: 280, y: 810, r: 110},
  hands: {x: 280, y: 575},
  head: {x: 280, y: 250},
  mouth: {x: 280, y: 336},
};
