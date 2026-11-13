// Legit check Nike Tech Kangourou — même grammaire que LegitCheck / PhenomCheck.
// 3 étapes en comparatif côte à côte (1.1 à gauche / authentique à droite) : poches, logo de manche, étiquette rouge.
import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {Captions, CaptionWord} from './Captions';
import {BACK, MINT, INK, prog, Offset, useT, Src, Framed, StepHeader, Flash, Counter, Shot, Card} from './LegitCheck';
import {Panel} from './PhenomCheck';

const P = 'projects/tech/';
const legit: Src = {src: P + 'legit_full.jpg', w: 1440, h: 2557};
const legitPockets: Src = {src: P + 'legit_pockets.jpg', w: 1440, h: 2557};
const legitSleeve: Src = {src: P + 'legit_sleeve.jpg', w: 1440, h: 2557};
const legitLabel: Src = {src: P + 'legit_label.jpg', w: 1440, h: 2557};
const fakeFull: Src = {src: P + 'fake_full.jpg', w: 984, h: 1382};
const fakeSleeve: Src = {src: P + 'fake_sleeve.jpg', w: 984, h: 1653};
const fakeLabel: Src = {src: P + 'fake_label.jpg', w: 984, h: 1619};
const full = {w: 1080, h: 1920};
// Comparatif côte à côte (1.1 à gauche / authentique à droite), entre le titre et la zone des sous-titres.
const L = {top: 500, left: 30, width: 500, height: 780};
const R = {top: 500, left: 550, width: 500, height: 780};
const topShade = <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(8,16,14,0.7) 0%, rgba(8,16,14,0) 26%)'}} />;

export type TechProps = {captions: CaptionWord[]; T: Record<string, number>; durationS: number};

export const TechCheck: React.FC<TechProps> = ({captions, T}) => {
  const t = useT();
  const {fps} = useVideoConfig();
  const F = (s: number) => Math.round(s * fps);
  const seg = (a: number, b: number, el: React.ReactNode) => (
    <Sequence from={F(a)} durationInFrames={F(b) - F(a)} layout="none"><Offset.Provider value={F(a) / fps}>{el}</Offset.Provider></Sequence>
  );
  // Intro d'étape : zoom sur la zone concernée de l'authentique + titre.
  const intro = (a: number, b: number, n: number, title: string, fx: number, fy: number, z: number) => seg(a, b, (
    <Shot a={a}>
      <Framed m={legit} a={{x: 0.5, y: 0.45, z: 1}} b={{x: fx, y: fy, z}} t0={a + 0.3} t1={b} {...full} />
      {topShade}
      <StepHeader n={n} title={title} at={a} />
    </Shot>
  ));
  const compare = (a: number, b: number, n: number, title: string, fake: React.ReactNode, real: React.ReactNode) => seg(a, b, (
    <AbsoluteFill>
      <StepHeader n={n} title={title} at={-10} />
      {fake}{real}
    </AbsoluteFill>
  ));

  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 40%, #232a28 0%, ${INK} 70%)`}}>
      {/* ACCROCHE */}
      {seg(0, T.s1, (
        <AbsoluteFill>
          <div style={{position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center'}}>
            <div style={{fontFamily: 'Montserrat', fontWeight: 800, fontSize: 36, letterSpacing: 10, color: MINT, opacity: prog(t, 0.1, 0.3)}}>LEGIT CHECK</div>
            <div style={{fontFamily: 'Anton', fontSize: 112, color: '#fff', lineHeight: 1.05, transform: `scale(${BACK(prog(t, 0.15, 0.5))})`}}>NIKE TECH<br />KANGOUROU</div>
          </div>
          <div style={{position: 'absolute', top: 470, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 40}}>
            <Card m={fakeFull} f={{x: 0.5, y: 0.5, z: 1.0}} kind="fake" side={-1} at={0.3} />
            <Card m={legit} f={{x: 0.5, y: 0.45, z: 1.0}} kind="legit" side={1} at={0.6} />
          </div>
          {t >= T.vs ? (
            <div style={{position: 'absolute', top: 700, left: 0, right: 0, textAlign: 'center'}}>
              <span style={{display: 'inline-block', fontFamily: 'Anton', fontSize: 130, color: '#fff', WebkitTextStroke: '6px #08100E',
                transform: `scale(${BACK(prog(t, T.vs, 0.4))}) rotate(-6deg)`, textShadow: '0 0 40px rgba(92,242,196,0.6)'}}>VS</span>
            </div>
          ) : null}
        </AbsoluteFill>
      ))}

      {/* ÉTAPE 1 — les grandes poches */}
      {intro(T.s1, T.c1, 1, 'LES POCHES', 0.5, 0.62, 2.0)}
      {compare(T.c1, T.s2, 1, 'LES POCHES',
        <Panel m={fakeFull} a={{x: 0.52, y: 0.52, z: 1.3}} b={{x: 0.52, y: 0.55, z: 1.6}} t0={T.c1} t1={T.s2}
          kind="fake" {...L} verdict="LISSE & PETITE" vAt={T.lisse} enter={T.c1} />,
        <Panel m={legitPockets} a={{x: 0.53, y: 0.58, z: 1.0}} b={{x: 0.53, y: 0.6, z: 1.15}} t0={T.c1} t1={T.s2}
          kind="legit" {...R} verdict="ZIP BIEN VISIBLE" vAt={T.zipok} enter={T.c1 + 0.35} />)}

      {/* ÉTAPE 2 — le logo de la manche */}
      {intro(T.s2, T.c2, 2, 'LE LOGO\nDE MANCHE', 0.62, 0.58, 2.6)}
      {compare(T.c2, T.s3, 2, 'LE LOGO\nDE MANCHE',
        <Panel m={fakeSleeve} a={{x: 0.35, y: 0.52, z: 2.0}} b={{x: 0.35, y: 0.52, z: 2.5}} t0={T.c2} t1={T.s3}
          kind="fake" {...L} verdict="BRILLANT & PETIT" vAt={T.reflet} enter={T.c2} />,
        <Panel m={legitSleeve} a={{x: 0.5, y: 0.55, z: 1.4}} b={{x: 0.5, y: 0.55, z: 1.8}} t0={T.c2} t1={T.s3}
          kind="legit" {...R} verdict="MAT & BIEN TAILLÉ" vAt={T.logook} enter={T.c2 + 0.35} />)}

      {/* ÉTAPE 3 — l'étiquette rouge */}
      {intro(T.s3, T.c3, 3, "L'ÉTIQUETTE\nROUGE", 0.5, 0.26, 2.6)}
      {compare(T.c3, T.s4, 3, "L'ÉTIQUETTE\nROUGE",
        <Panel m={fakeLabel} a={{x: 0.52, y: 0.43, z: 2.0}} b={{x: 0.52, y: 0.44, z: 2.5}} t0={T.c3} t1={T.s4}
          kind="fake" {...L} verdict="MADE IN CHINA" vAt={T.china} enter={T.c3 + 0.35} />,
        <Panel m={legitLabel} a={{x: 0.39, y: 0.64, z: 1.6}} b={{x: 0.39, y: 0.65, z: 2.0}} t0={T.c3} t1={T.s4}
          kind="legit" {...R} verdict="MADE IN CAMBODIA" vAt={T.cambodia} enter={T.c3} />)}

      {/* OUTRO — prix + CTA */}
      {seg(T.s4, T.end, (
        <Shot a={T.s4}>
          <Framed m={legit} a={{x: 0.5, y: 0.3, z: 1.35}} b={{x: 0.5, y: 0.45, z: 1.0}} t0={T.s4} t1={T.end} {...full} />
          <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(8,16,14,0.8) 0%, rgba(8,16,14,0.4) 32%, rgba(8,16,14,0.1) 50%)'}} />
          <div style={{position: 'absolute', top: 230, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 50}}>
            <Counter label="PAYÉ" value={9} at={T.p9} color={MINT} />
            <Counter label="REVENTE" value={85} at={T.p85} color="#FFD34D" prefix="≈" />
          </div>
          {t >= T.stamp && t < T.cta ? (
            <div style={{position: 'absolute', top: 1000, left: 0, right: 0, textAlign: 'center'}}>
              <span style={{display: 'inline-block', fontFamily: 'Anton', fontSize: 120, color: MINT, border: `10px solid ${MINT}`,
                borderRadius: 24, padding: '4px 34px', transform: `scale(${2.2 - 1.2 * BACK(prog(t, T.stamp, 0.35))}) rotate(-8deg)`,
                opacity: prog(t, T.stamp, 0.12), background: 'rgba(8,16,14,0.6)'}}>LEGIT ✓</span>
            </div>
          ) : null}
          {t >= T.cta ? (
            <div style={{position: 'absolute', top: 1000, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
              <div style={{fontFamily: 'Anton', fontSize: 84, color: INK, background: MINT, borderRadius: 28, padding: '14px 40px',
                letterSpacing: 2, transform: `scale(${BACK(prog(t, T.cta, 0.45))})`, boxShadow: '0 0 50px rgba(92,242,196,0.6)'}}>ÉCRIS-MOI EN DM</div>
            </div>
          ) : null}
        </Shot>
      ))}

      <Flash at={[T.s1, T.c1, T.s2, T.c2, T.s3, T.c3, T.s4]} />
      {captions.length && t < captions[captions.length - 1].end + 0.7 ? <Captions words={captions} accent="#FFE14D" /> : null}
    </AbsoluteFill>
  );
};
