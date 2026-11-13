// Legit check bas Nike Running Division — DA du legit check Phenom (menthe, titres d'étape, badges),
// comparatifs côte à côte (1.1 gauche / authentique droite) au-dessus de la zone des sous-titres.
// Étape couleur : pastilles avec la couleur MESURÉE sur les photos. Étape logo : checklist sur l'authentique.
import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {Captions, CaptionWord} from './Captions';
import {BACK, MINT, INK, prog, Offset, useT, Src, Framed, StepHeader, Flash, Counter, Shot, Card, Badge} from './LegitCheck';
import {Panel} from './PhenomCheck';

const P = 'projects/division/';
const legit: Src = {src: P + 'legit_front.jpg', w: 1170, h: 1560, filter: 'brightness(1.08)'};
const legitDetail: Src = {src: P + 'legit_detail.jpg', w: 1170, h: 1560};
const legitLabel: Src = {src: P + 'legit_label.jpg', w: 1170, h: 1560, filter: 'brightness(1.5) contrast(1.2)'};
const fakeFront: Src = {src: P + 'fake_front.jpg', w: 1082, h: 1349};
const fakeLabel: Src = {src: P + 'fake_label.jpg', w: 1090, h: 1354};
const full = {w: 1080, h: 1920};
const L = {top: 500, left: 30, width: 500, height: 780};
const R = {top: 500, left: 550, width: 500, height: 780};
const topShade = <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(8,16,14,0.7) 0%, rgba(8,16,14,0) 26%)'}} />;

// Pastille de couleur (valeur mesurée) posée sur un panneau.
const Swatch: React.FC<{color: string; at: number; left: number}> = ({color, at, left}) => {
  const t = useT();
  if (t < at) return null;
  return (
    <div style={{position: 'absolute', top: 600, left, width: 500, display: 'flex', justifyContent: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(8,16,14,0.88)', borderRadius: 999,
        padding: '10px 24px 10px 10px', transform: `scale(${BACK(prog(t, at, 0.45))})`}}>
        <div style={{width: 64, height: 64, borderRadius: 32, background: color, border: '4px solid #fff'}} />
        <div style={{fontFamily: 'Montserrat', fontWeight: 800, fontSize: 32, color: '#fff', letterSpacing: 1}}>{color}</div>
      </div>
    </div>
  );
};

// Checklist qui se coche au rythme de la voix.
const Checklist: React.FC<{items: [string, number][]}> = ({items}) => {
  const t = useT();
  return (
    <div style={{position: 'absolute', top: 820, left: 110, right: 110, background: 'rgba(8,16,14,0.86)', border: `6px solid ${MINT}`,
      borderRadius: 32, padding: '26px 34px', display: 'flex', flexDirection: 'column', gap: 16,
      transform: `scale(${BACK(prog(t, items[0][1] - 0.4, 0.45))})`}}>
      {items.map(([label, at], i) => {
        const on = t >= at;
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, fontFamily: 'Anton', fontSize: 64, letterSpacing: 2,
            color: on ? '#fff' : 'rgba(255,255,255,0.35)'}}>
            <div style={{width: 64, height: 64, borderRadius: 14, border: `5px solid ${MINT}`, display: 'flex', alignItems: 'center',
              justifyContent: 'center', background: on ? MINT : 'transparent', color: INK, fontSize: 48,
              transform: `scale(${on ? BACK(prog(t, at, 0.35)) : 1})`}}>{on ? '✓' : ''}</div>
            {label}
          </div>
        );
      })}
    </div>
  );
};

export type DivisionProps = {captions: CaptionWord[]; T: Record<string, number>; durationS: number};

export const DivisionCheck: React.FC<DivisionProps> = ({captions, T}) => {
  const t = useT();
  const {fps} = useVideoConfig();
  const F = (s: number) => Math.round(s * fps);
  const seg = (a: number, b: number, el: React.ReactNode) => (
    <Sequence from={F(a)} durationInFrames={F(b) - F(a)} layout="none"><Offset.Provider value={F(a) / fps}>{el}</Offset.Provider></Sequence>
  );
  const intro = (a: number, b: number, n: number, title: string, fx: number, fy: number, z: number) => seg(a, b, (
    <Shot a={a}>
      <Framed m={legit} a={{x: 0.5, y: 0.45, z: 1}} b={{x: fx, y: fy, z}} t0={a + 0.3} t1={b} {...full} />
      {topShade}
      <StepHeader n={n} title={title} at={a} total={4} />
    </Shot>
  ));
  const compare = (a: number, b: number, n: number, title: string, children: React.ReactNode) => seg(a, b, (
    <AbsoluteFill><StepHeader n={n} title={title} at={-10} total={4} />{children}</AbsoluteFill>
  ));

  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 40%, #1d2422 0%, ${INK} 70%)`}}>
      {/* ACCROCHE */}
      {seg(0, T.s1, (
        <AbsoluteFill>
          <div style={{position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center'}}>
            <div style={{fontFamily: 'Montserrat', fontWeight: 800, fontSize: 36, letterSpacing: 10, color: MINT, opacity: prog(t, 0.1, 0.3)}}>LEGIT CHECK</div>
            <div style={{fontFamily: 'Anton', fontSize: 104, color: '#fff', lineHeight: 1.05, transform: `scale(${BACK(prog(t, 0.15, 0.5))})`}}>NIKE RUNNING<br />DIVISION</div>
          </div>
          <div style={{position: 'absolute', top: 470, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 40}}>
            <Card m={fakeFront} f={{x: 0.5, y: 0.5, z: 1.0}} kind="fake" side={-1} at={0.3} />
            <Card m={legit} f={{x: 0.5, y: 0.5, z: 1.0}} kind="legit" side={1} at={0.6} />
          </div>
          {t >= T.vs ? (
            <div style={{position: 'absolute', top: 700, left: 0, right: 0, textAlign: 'center'}}>
              <span style={{display: 'inline-block', fontFamily: 'Anton', fontSize: 130, color: '#fff', WebkitTextStroke: '6px #08100E',
                transform: `scale(${BACK(prog(t, T.vs, 0.4))}) rotate(-6deg)`, textShadow: '0 0 40px rgba(92,242,196,0.6)'}}>VS</span>
            </div>
          ) : null}
        </AbsoluteFill>
      ))}

      {/* ÉTAPE 1 — la couleur */}
      {intro(T.s1, T.c1, 1, 'LA COULEUR', 0.45, 0.25, 1.8)}
      {compare(T.c1, T.s2, 1, 'LA COULEUR', <>
        <Panel m={fakeFront} a={{x: 0.45, y: 0.28, z: 1.5}} b={{x: 0.45, y: 0.3, z: 1.75}} t0={T.c1} t1={T.s2}
          kind="fake" {...L} verdict="QUASI NOIR" vAt={T.noir} enter={T.c1} />
        <Panel m={legit} a={{x: 0.45, y: 0.25, z: 1.7}} b={{x: 0.45, y: 0.27, z: 1.95}} t0={T.c1} t1={T.s2}
          kind="legit" {...R} verdict="HAUT GRIS" vAt={T.gris} enter={T.c1 + 0.35} />
        <Swatch color="#202024" at={T.c1 + 0.9} left={30} />
        <Swatch color="#424248" at={T.c1 + 1.2} left={550} />
      </>)}

      {/* ÉTAPE 2 — le logo (critères décrits sur l'authentique) */}
      {intro(T.s2, T.c2, 2, 'LE LOGO', 0.73, 0.35, 2.2)}
      {seg(T.c2, T.s3, (
        <Shot a={T.c2}>
          <Framed m={legit} a={{x: 0.73, y: 0.35, z: 2.4}} b={{x: 0.73, y: 0.35, z: 2.9}} t0={T.c2} t1={T.s3} {...full} anchorY={560} />
          {topShade}
          <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}><Badge kind="legit" at={T.c2 + 0.1} /></div>
          <Checklist items={[['BIEN PLACÉ', T.place], ['BIEN DROIT', T.droit], ['PAS TROP PETIT', T.petit]]} />
        </Shot>
      ))}

      {/* ÉTAPE 3 — l'écriture intérieure */}
      {intro(T.s3, T.c3, 3, "L'ÉCRITURE\nINTÉRIEURE", 0.5, 0.07, 2.2)}
      {compare(T.c3, T.s4, 3, "L'ÉCRITURE\nINTÉRIEURE", <>
        <Panel m={fakeLabel} a={{x: 0.47, y: 0.45, z: 1.5}} b={{x: 0.47, y: 0.46, z: 1.8}} t0={T.c3} t1={T.s4}
          kind="fake" {...L} top={540} verdict="BLANCHE" vAt={T.blanc} enter={T.c3} />
        <Panel m={legitLabel} a={{x: 0.62, y: 0.6, z: 2.0}} b={{x: 0.62, y: 0.61, z: 2.35}} t0={T.c3} t1={T.s4}
          kind="legit" {...R} top={540} verdict="GRISE" vAt={T.grise} enter={T.c3 + 0.35} />
      </>)}

      {/* ÉTAPE 4 — les détails « araignée » */}
      {intro(T.s4, T.c4, 4, 'LES DÉTAILS\n« ARAIGNÉE »', 0.35, 0.55, 2.0)}
      {compare(T.c4, T.s5, 4, 'LES DÉTAILS\n« ARAIGNÉE »', <>
        <Panel m={fakeFront} a={{x: 0.25, y: 0.68, z: 2.0}} b={{x: 0.25, y: 0.69, z: 2.3}} t0={T.c4} t1={T.s5}
          kind="fake" {...L} top={540} verdict="PAS PRÉCIS" vAt={T.pasprecis} enter={T.c4} />
        <Panel m={legitDetail} a={{x: 0.35, y: 0.45, z: 1.5}} b={{x: 0.35, y: 0.46, z: 1.75}} t0={T.c4} t1={T.s5}
          kind="legit" {...R} top={540} verdict="PRÉCIS" vAt={T.precis} enter={T.c4 + 0.35} />
      </>)}

      {/* OUTRO — prix, bénéfice, CTA */}
      {seg(T.s5, T.end, (
        <Shot a={T.s5}>
          <Framed m={legit} a={{x: 0.5, y: 0.35, z: 1.3}} b={{x: 0.5, y: 0.5, z: 1.0}} t0={T.s5} t1={T.end} {...full} />
          <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(8,16,14,0.85) 0%, rgba(8,16,14,0.5) 45%, rgba(8,16,14,0.15) 62%)'}} />
          <div style={{position: 'absolute', top: 180, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
            <Counter label="PAYÉ" value={50} at={T.p50} color={MINT} />
            <Counter label="REVENTE JUSQU'À" value={180} at={T.p180} color="#FFD34D" />
            <Counter label="BÉNÉFICE" value={120} at={T.p120} color={MINT} prefix="+" />
          </div>
          {t >= T.stamp && t < T.cta ? (
            <div style={{position: 'absolute', top: 1050, left: 0, right: 0, textAlign: 'center'}}>
              <span style={{display: 'inline-block', fontFamily: 'Anton', fontSize: 120, color: MINT, border: `10px solid ${MINT}`,
                borderRadius: 24, padding: '4px 34px', transform: `scale(${2.2 - 1.2 * BACK(prog(t, T.stamp, 0.35))}) rotate(-8deg)`,
                opacity: prog(t, T.stamp, 0.12), background: 'rgba(8,16,14,0.6)'}}>LEGIT ✓</span>
            </div>
          ) : null}
          {t >= T.cta ? (
            <div style={{position: 'absolute', top: 1060, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
              <div style={{fontFamily: 'Anton', fontSize: 84, color: INK, background: MINT, borderRadius: 28, padding: '14px 40px',
                letterSpacing: 2, transform: `scale(${BACK(prog(t, T.cta, 0.45))})`, boxShadow: '0 0 50px rgba(92,242,196,0.6)'}}>ÉCRIS-MOI EN DM</div>
            </div>
          ) : null}
        </Shot>
      ))}

      <Flash at={[T.s1, T.c1, T.s2, T.c2, T.s3, T.c3, T.s4, T.c4, T.s5]} />
      {captions.length && t < captions[captions.length - 1].end + 0.7 ? <Captions words={captions} accent="#FFE14D" /> : null}
    </AbsoluteFill>
  );
};
