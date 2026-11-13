// Legit check Nike Tech NOIR — nouvelle DA « TikTok » (≠ LegitCheck/TechCheck) :
//  · palette noir / rouge (1.1) / vert citron (authentique), typo Anton géante
//  · accroche « VRAI OU FAUX ? » lettre par lettre + barre de progression des étapes (rétention)
//  · comparatif plein écran à CURSEUR : 1.1 à gauche / vrai à droite, la séparation balaie puis se pose
//  · verdicts géants qui « claquent » (scale 2→1 + secousse), glitch RVB sur le côté 1.1
import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import '@fontsource/anton/400.css';
import '@fontsource/montserrat/800.css';
import {Captions, CaptionWord} from './Captions';
import {BACK, OUT, prog, Offset, useT, Src, Focus, Framed, Counter} from './LegitCheck';

const RED = '#FF2E43', LIME = '#B6FF3B', BG = '#050505';
const P = 'projects/technoir/';
const legit: Src = {src: P + 'legit_full.jpg', w: 2252, h: 4000, filter: 'brightness(1.12) contrast(1.08)'};
const fakeChest: Src = {src: P + 'fake_chest.jpg', w: 984, h: 1315, filter: 'brightness(1.1) contrast(1.08)'};
const fakeSleeve: Src = {src: P + 'fake_sleeve.jpg', w: 984, h: 1315, filter: 'brightness(1.1) contrast(1.08)'};
const fakeSet: Src = {src: P + 'fake_set.jpg', w: 974, h: 1495, filter: 'brightness(1.1) contrast(1.08)'};
const full = {w: 1080, h: 1920};

// Secousse courte (impact) : décroissance exponentielle, déterministe.
const shake = (t: number, at: number, amp = 18) => {
  const d = t - at;
  if (d < 0 || d > 0.35) return {x: 0, y: 0};
  const e = Math.exp(-d * 12) * amp;
  return {x: Math.sin(d * 90) * e, y: Math.cos(d * 70) * e};
};

// Texte qui claque : scale 2.2 → 1 (back.out) + secousse + léger tilt.
const Slam: React.FC<{text: string; at: number; color: string; size?: number; tilt?: number; stroke?: boolean}> =
  ({text, at, color, size = 130, tilt = -4, stroke = true}) => {
  const t = useT();
  if (t < at) return null;
  const k = BACK(prog(t, at, 0.32));
  const s = shake(t, at, 10);
  return (
    <div style={{fontFamily: 'Anton', fontSize: size, lineHeight: 1, color, textAlign: 'center', whiteSpace: 'pre-line',
      transform: `translate(${s.x}px, ${s.y}px) scale(${2.2 - 1.2 * k}) rotate(${tilt}deg)`, opacity: prog(t, at, 0.08),
      WebkitTextStroke: stroke ? '8px #000' : undefined, paintOrder: 'stroke fill', textShadow: `0 0 50px ${color}88`}}>{text}</div>
  );
};

// Barre de progression segmentée (haut d'écran, hors zone UI).
const Progress: React.FC<{T: Record<string, number>}> = ({T}) => {
  const t = useT();
  const segs = [[T.s1, T.s2, 'POCHES'], [T.s2, T.s4, 'LOGO'], [T.s4, T.end, 'PRIX']] as const;
  return (
    <div style={{position: 'absolute', top: 110, left: 60, right: 60, display: 'flex', gap: 12}}>
      {segs.map(([a, b, label], i) => {
        const k = Math.min(1, Math.max(0, (t - a) / (b - a)));
        const on = t >= a;
        return (
          <div key={i} style={{flex: 1}}>
            <div style={{height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.22)', overflow: 'hidden'}}>
              <div style={{width: `${k * 100}%`, height: '100%', background: LIME}} />
            </div>
            <div style={{marginTop: 8, fontFamily: 'Montserrat', fontWeight: 800, fontSize: 24, letterSpacing: 4,
              color: on ? '#fff' : 'rgba(255,255,255,0.4)', textAlign: 'center'}}>{label}</div>
          </div>
        );
      })}
    </div>
  );
};

// Demi-écran : image plein cadre (cover, jamais de vide), point focal ancré au centre de SA moitié.
const Half: React.FC<{m: Src; a: Focus; b: Focus; t0: number; t1: number; glitchAt?: number; side: -1 | 1}> = ({m, a, b, t0, t1, glitchAt, side}) => {
  const t = useT();
  const g = glitchAt !== undefined && t >= glitchAt && t < glitchAt + 0.28;
  const off = g ? 14 * Math.sin((t - glitchAt!) * 60) : 0;
  return (
    <div style={{position: 'relative', width: 1080, height: 1920}}>
      <Framed m={m} a={a} b={b} t0={t0} t1={t1} {...full} anchorX={540 + side * 270} />
      {g ? (
        <>
          <div style={{position: 'absolute', inset: 0, transform: `translateX(${off}px)`, mixBlendMode: 'screen', opacity: 0.7,
            background: 'rgba(255,0,60,0.35)'}} />
          <div style={{position: 'absolute', inset: 0, transform: `translateX(${-off}px)`, mixBlendMode: 'screen', opacity: 0.6,
            background: 'rgba(0,200,255,0.25)'}} />
        </>
      ) : null}
    </div>
  );
};

// Comparatif à curseur : la séparation entre de la gauche, dépasse, puis se pose au centre.
const Slider: React.FC<{a: number; b: number; fake: React.ReactNode; real: React.ReactNode;
  fakeVerdict: string; fakeAt: number; realVerdict: string; realAt: number}> = ({a, fake, real, fakeVerdict, fakeAt, realVerdict, realAt}) => {
  const t = useT();
  const k = prog(t, a, 0.9);
  // balayage : 0 → 1080 (tout le vrai) → 540
  const x = k < 0.55 ? OUT(k / 0.55) * 1000 : 1000 - 460 * OUT((k - 0.55) / 0.45);
  const s1 = shake(t, fakeAt), s2 = shake(t, realAt);
  const s = {x: s1.x + s2.x, y: s1.y + s2.y};
  return (
    <AbsoluteFill style={{transform: `translate(${s.x}px, ${s.y}px)`}}>
      <AbsoluteFill>{real}</AbsoluteFill>
      <AbsoluteFill style={{clipPath: `inset(0 ${1080 - x}px 0 0)`}}>{fake}</AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.55) 100%)'}} />
      {/* ligne + poignée */}
      <div style={{position: 'absolute', top: 0, bottom: 0, left: x - 4, width: 8, background: '#fff', boxShadow: '0 0 30px rgba(255,255,255,0.8)'}} />
      <div style={{position: 'absolute', top: 820, left: x - 58, width: 116, height: 116, borderRadius: 58, background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Anton', fontSize: 50, color: '#000',
        boxShadow: '0 10px 40px rgba(0,0,0,0.6)'}}>VS</div>
      {/* étiquettes des deux côtés */}
      <div style={{position: 'absolute', top: 230, left: 40, padding: '8px 22px', borderRadius: 12, background: RED,
        fontFamily: 'Anton', fontSize: 52, color: '#fff', opacity: prog(t, a + 0.5, 0.2)}}>1.1</div>
      <div style={{position: 'absolute', top: 230, right: 40, padding: '8px 22px', borderRadius: 12, background: LIME,
        fontFamily: 'Anton', fontSize: 52, color: '#000', opacity: prog(t, a + 0.5, 0.2)}}>VRAI</div>
      {/* verdicts géants, chacun sur sa moitié, au-dessus de la zone des sous-titres */}
      <div style={{position: 'absolute', top: 1000, left: 0, width: 540, display: 'flex', justifyContent: 'center'}}>
        <Slam text={fakeVerdict} at={fakeAt} color={RED} size={92} tilt={-6} />
      </div>
      <div style={{position: 'absolute', top: 1000, left: 540, width: 540, display: 'flex', justifyContent: 'center'}}>
        <Slam text={realVerdict} at={realAt} color={LIME} size={92} tilt={5} />
      </div>
    </AbsoluteFill>
  );
};

// Intro d'étape : énorme numéro en contour + titre, zoom rapide sur la zone du vrai.
const StepIntro: React.FC<{a: number; b: number; n: string; title: string; f: Focus}> = ({a, b, n, title, f}) => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Framed m={legit} a={{x: 0.5, y: 0.5, z: 1}} b={f} t0={a} t1={b} {...full} />
      <AbsoluteFill style={{background: 'rgba(0,0,0,0.45)'}} />
      <div style={{position: 'absolute', top: 520, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{fontFamily: 'Anton', fontSize: 380, lineHeight: 1, color: 'transparent', WebkitTextStroke: `6px ${LIME}`,
          transform: `scale(${1.6 - 0.6 * OUT(prog(t, a, 0.5))})`, opacity: prog(t, a, 0.15)}}>{n}</div>
        <Slam text={title} at={a + 0.25} color="#fff" size={120} tilt={0} />
      </div>
    </AbsoluteFill>
  );
};

export type BlackTechProps = {captions: CaptionWord[]; T: Record<string, number>; durationS: number};

export const BlackTech: React.FC<BlackTechProps> = ({captions, T}) => {
  const t = useT();
  const {fps} = useVideoConfig();
  const F = (s: number) => Math.round(s * fps);
  const seg = (a: number, b: number, el: React.ReactNode) => (
    <Sequence from={F(a)} durationInFrames={F(b) - F(a)} layout="none"><Offset.Provider value={F(a) / fps}>{el}</Offset.Provider></Sequence>
  );
  const flashes = [T.s1, T.c1, T.s2, T.c2, T.s4];
  const flash = Math.max(0, ...flashes.map((a) => (t >= a && t < a + 0.12 ? 1 - (t - a) / 0.12 : 0)));
  return (
    <AbsoluteFill style={{background: BG}}>
      {/* ACCROCHE : curseur 1.1 / vrai sur les deux ensembles + VRAI OU FAUX ? */}
      {seg(0, T.s1, (
        <AbsoluteFill>
          <Slider a={0} b={T.s1}
            fake={<Half side={-1} m={fakeSet} a={{x: 0.5, y: 0.45, z: 1.0}} b={{x: 0.5, y: 0.43, z: 1.08}} t0={0} t1={T.s1} />}
            real={<Half side={1} m={legit} a={{x: 0.5, y: 0.45, z: 1.0}} b={{x: 0.5, y: 0.43, z: 1.08}} t0={0} t1={T.s1} />}
            fakeVerdict="" fakeAt={99} realVerdict="" realAt={99} />
          <div style={{position: 'absolute', top: 360, left: 0, right: 0}}>
            <Slam text={'VRAI\nOU FAUX ?'} at={0.15} color="#fff" size={170} tilt={-3} />
          </div>
          <div style={{position: 'absolute', top: 1060, left: 0, right: 0}}>
            <Slam text="NIKE TECH NOIR" at={T.vs} color={LIME} size={96} tilt={2} />
          </div>
        </AbsoluteFill>
      ))}

      {/* ÉTAPE 1 — les poches */}
      {seg(T.s1, T.c1, <StepIntro a={T.s1} b={T.c1} n="01" title="LES POCHES" f={{x: 0.55, y: 0.6, z: 1.6}} />)}
      {seg(T.c1, T.s2, (
        <Slider a={T.c1} b={T.s2}
          fake={<Half side={-1} m={fakeChest} a={{x: 0.55, y: 0.85, z: 1.0}} b={{x: 0.6, y: 0.85, z: 1.12}} t0={T.c1} t1={T.s2} glitchAt={T.lisse} />}
          real={<Half side={1} m={legit} a={{x: 0.6, y: 0.6, z: 1.6}} b={{x: 0.64, y: 0.6, z: 1.8}} t0={T.c1} t1={T.s2} />}
          fakeVerdict={'LISSE\n& PETITE'} fakeAt={T.lisse} realVerdict={'ZIP\nCONTRASTÉ'} realAt={T.zipok} />
      ))}

      {/* ÉTAPE 2 — le logo de manche */}
      {seg(T.s2, T.c2, <StepIntro a={T.s2} b={T.c2} n="02" title="LE LOGO" f={{x: 0.665, y: 0.705, z: 2.8}} />)}
      {seg(T.c2, T.s4, (
        <Slider a={T.c2} b={T.s4}
          fake={<Half side={-1} m={fakeSleeve} a={{x: 0.73, y: 0.49, z: 1.0}} b={{x: 0.73, y: 0.49, z: 1.15}} t0={T.c2} t1={T.s4} glitchAt={T.reflet} />}
          real={<Half side={1} m={legit} a={{x: 0.665, y: 0.705, z: 3.4}} b={{x: 0.665, y: 0.705, z: 3.9}} t0={T.c2} t1={T.s4} />}
          fakeVerdict="BRILLANT" fakeAt={T.reflet} realVerdict="MAT" realAt={T.logook} />
      ))}

      {/* FIN — prix + CTA */}
      {seg(T.s4, T.end, (
        <AbsoluteFill>
          <Framed m={legit} a={{x: 0.5, y: 0.35, z: 1.3}} b={{x: 0.5, y: 0.45, z: 1.0}} t0={T.s4} t1={T.end} {...full} />
          <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0.2) 55%)'}} />
          <div style={{position: 'absolute', top: 230, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40}}>
            <Counter label="PAYÉ" value={9} at={T.p9} color={LIME} />
            <Counter label="REVENTE" value={85} at={T.p85} color="#FFD34D" prefix="≈" />
          </div>
          <div style={{position: 'absolute', top: 1000, left: 0, right: 0}}>
            {t < T.cta ? <Slam text="LEGIT ✓" at={T.stamp} color={LIME} size={150} tilt={-6} />
              : <Slam text={'ÉCRIS-MOI\nEN DM'} at={T.cta} color="#fff" size={120} tilt={-3} />}
          </div>
        </AbsoluteFill>
      ))}

      <AbsoluteFill style={{background: '#fff', opacity: flash * 0.5, pointerEvents: 'none'}} />
      <Progress T={T} />
      {captions.length && t < captions[captions.length - 1].end + 0.7 ? <Captions words={captions} accent={LIME} /> : null}
    </AbsoluteFill>
  );
};
