// Legit check Phenom Elite (pantalon) — même grammaire que LegitCheck (zip), médias = photos uniquement.
// Ajout : comparatif empilé (1.1 en haut / authentique en bas) pour matière et lacets, et carte texte
// pour l'étiquette : photo authentique (impression grisée) puis photo du 1.1 (impression blanche).
import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {Captions, CaptionWord} from './Captions';
import {BACK, OUT, MINT, RED, INK, prog, Offset, useT, Src, Focus, Framed, Badge, Verdict, Ring, StepHeader,
  Flash, Counter, Shot, Card} from './LegitCheck';

const P = 'projects/phenom/';
const legit: Src = {src: P + 'legit_full.jpg', w: 1440, h: 2558, filter: 'contrast(1.05) brightness(1.06)'};
// impression ton sur ton très discrète → éclaircie pour la lisibilité (la teinte grise reste celle de la photo)
const legitLabel: Src = {src: P + 'legit_label.jpg', w: 1440, h: 2557, filter: 'brightness(1.45) contrast(1.25)'};
const legitLace: Src = {src: P + 'legit_lace.jpg', w: 1440, h: 2558};
const fakeFull: Src = {src: P + 'fake_full.jpg', w: 1080, h: 1920};
const fakeLace: Src = {src: P + 'fake_lace.jpg', w: 984, h: 1315};
const fakeLabel: Src = {src: P + 'fake_label.jpg', w: 984, h: 1478};
const full = {w: 1080, h: 1920};

const topShade = <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(8,16,14,0.7) 0%, rgba(8,16,14,0) 26%)'}} />;
const shade = <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(8,16,14,0.6) 0%, rgba(8,16,14,0) 24%, rgba(8,16,14,0) 62%, rgba(8,16,14,0.5) 100%)'}} />;
export const TopBadge: React.FC<{kind: 'legit' | 'fake'; at: number}> = ({kind, at}) => (
  <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}><Badge kind={kind} at={at} /></div>
);

// Panneau du comparatif empilé : média recadré + badge + verdict dans le coin.
export const Panel: React.FC<{m: Src; a: Focus; b: Focus; t0: number; t1: number; kind: 'legit' | 'fake'; top: number;
  verdict: string; vAt: number; enter: number; left?: number; width?: number; height?: number}> =
  ({m, a, b, t0, t1, kind, top, verdict, vAt, enter, left = 40, width = 1000, height = 640}) => {
  const t = useT();
  const c = kind === 'legit' ? MINT : RED;
  const k = OUT(prog(t, enter, 0.6));
  return (
    <div style={{position: 'absolute', top, left, width, height, borderRadius: 32, overflow: 'hidden',
      border: `6px solid ${c}`, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', opacity: k,
      transform: `translateX(${(1 - k) * (kind === 'fake' ? -900 : 900)}px)`}}>
      <Framed m={m} a={a} b={b} t0={t0} t1={t1} w={width - 12} h={height - 12} />
      <div style={{position: 'absolute', top: 18, left: 18}}><Badge kind={kind} at={enter + 0.3} size={36} /></div>
      {t >= vAt ? (
        <div style={{position: 'absolute', bottom: 22, left: 12, right: 12, display: 'flex', justifyContent: 'center'}}>
          <div style={{background: 'rgba(8,16,14,0.85)', border: `4px solid ${c}`, borderRadius: 18, padding: '8px 22px', textAlign: 'center',
            fontFamily: 'Anton', fontSize: width < 700 ? 44 : 56, lineHeight: 1.1, color: c, letterSpacing: 2, transform: `scale(${BACK(prog(t, vAt, 0.4))})`}}>
            {verdict} {kind === 'legit' ? '✓' : '✗'}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export type PhenomProps = {captions: CaptionWord[]; T: Record<string, number>; durationS: number};

export const PhenomCheck: React.FC<PhenomProps> = ({captions, T}) => {
  const t = useT();
  const {fps} = useVideoConfig();
  const F = (s: number) => Math.round(s * fps);
  const seg = (a: number, b: number, el: React.ReactNode) => (
    <Sequence from={F(a)} durationInFrames={F(b) - F(a)} layout="none"><Offset.Provider value={F(a) / fps}>{el}</Offset.Provider></Sequence>
  );
  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 40%, #1d2422 0%, ${INK} 70%)`}}>
      {/* ACCROCHE */}
      {seg(0, T.s1, (
        <AbsoluteFill>
          <div style={{position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center'}}>
            <div style={{fontFamily: 'Montserrat', fontWeight: 800, fontSize: 36, letterSpacing: 10, color: MINT, opacity: prog(t, 0.1, 0.3)}}>LEGIT CHECK</div>
            <div style={{fontFamily: 'Anton', fontSize: 112, color: '#fff', lineHeight: 1.05, transform: `scale(${BACK(prog(t, 0.15, 0.5))})`}}>NIKE PHENOM<br />ELITE</div>
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

      {/* ÉTAPE 1 — la matière */}
      {seg(T.s1, T.c1, (
        <Shot a={T.s1}>
          <Framed m={fakeFull} a={{x: 0.5, y: 0.45, z: 1}} b={{x: 0.4, y: 0.4, z: 1.8}} t0={T.s1} t1={T.c1} {...full} />
          {topShade}
          <StepHeader n={1} title="LA MATIÈRE" at={T.s1} />
        </Shot>
      ))}
      {seg(T.c1, T.s2, (
        <AbsoluteFill>
          <StepHeader n={1} title="LA MATIÈRE" at={-10} />
          <Panel m={fakeFull} a={{x: 0.74, y: 0.58, z: 2.4}} b={{x: 0.74, y: 0.61, z: 2.8}} t0={T.c1} t1={T.s2}
            kind="fake" top={450} verdict="LISSE, SANS DÉTAILS" vAt={T.lisse} enter={T.c1} />
          <Panel m={legit} a={{x: 0.33, y: 0.42, z: 2.6}} b={{x: 0.33, y: 0.44, z: 3.0}} t0={T.c1} t1={T.s2}
            kind="legit" top={1110} verdict="TEXTURE VISIBLE" vAt={T.details} enter={T.c1 + 0.35} />
        </AbsoluteFill>
      ))}

      {/* ÉTAPE 2 — l'étiquette de taille */}
      {seg(T.s2, T.c3, (
        <Shot a={T.s2}>
          <Framed m={legit} a={{x: 0.5, y: 0.45, z: 1}} b={{x: 0.5, y: 0.07, z: 2.4}} t0={T.s2 + 0.3} t1={T.c3} {...full} />
          {topShade}
          <StepHeader n={2} title={"L'ÉTIQUETTE\nDE TAILLE"} at={T.s2} />
        </Shot>
      ))}
      {seg(T.c3, T.c4, (
        <Shot a={T.c3}>
          <Framed m={legitLabel} a={{x: 0.45, y: 0.5, z: 1.0}} b={{x: 0.42, y: 0.56, z: 1.6}} t0={T.c3} t1={T.c3 + 1.3} {...full} />
          {shade}
          <TopBadge kind="legit" at={T.c3 + 0.1} />
          <Ring x={545} y={1050} rx={310} ry={310} at={T.grisee - 0.35} color={MINT} />
          <Verdict text="ÉCRITURE GRISÉE" kind="legit" at={T.grisee} top={260} />
        </Shot>
      ))}
      {seg(T.c4, T.s3, (
        <Shot a={T.c4}>
          <Framed m={fakeLabel} a={{x: 0.5, y: 0.5, z: 1.0}} b={{x: 0.49, y: 0.43, z: 1.25}} t0={T.c4} t1={T.c4 + 1.2} {...full} />
          {shade}
          <TopBadge kind="fake" at={T.c4 + 0.1} />
          <Ring x={540} y={960} rx={430} ry={330} at={T.blanc - 0.35} color={RED} />
          <Verdict text="ÉCRITURE BLANCHE" kind="fake" at={T.blanc} top={260} />
        </Shot>
      ))}

      {/* ÉTAPE 3 — les lacets (voix coupée : la différence est montrée à l'écran) */}
      {seg(T.s3, T.c5, (
        <Shot a={T.s3}>
          <Framed m={legit} a={{x: 0.5, y: 0.45, z: 1}} b={{x: 0.5, y: 0.13, z: 2.6}} t0={T.s3 + 0.3} t1={T.c5} {...full} />
          {topShade}
          <StepHeader n={3} title="LES LACETS" at={T.s3} />
        </Shot>
      ))}
      {seg(T.c5, T.s4, (
        <AbsoluteFill>
          <StepHeader n={3} title="LES LACETS" at={-10} />
          <Panel m={fakeLace} a={{x: 0.2, y: 0.42, z: 1.9}} b={{x: 0.2, y: 0.45, z: 2.2}} t0={T.c5} t1={T.s4}
            kind="fake" top={450} verdict="LETTRAGE FIN" vAt={T.fin} enter={T.c5} />
          <Panel m={legitLace} a={{x: 0.6, y: 0.6, z: 2.0}} b={{x: 0.6, y: 0.64, z: 2.3}} t0={T.c5} t1={T.s4}
            kind="legit" top={1110} verdict="LETTRAGE ÉPAIS" vAt={T.epais} enter={T.c5 + 0.35} />
        </AbsoluteFill>
      ))}

      {/* OUTRO — prix + CTA */}
      {seg(T.s4, T.end, (
        <Shot a={T.s4}>
          <Framed m={legit} a={{x: 0.5, y: 0.3, z: 1.35}} b={{x: 0.5, y: 0.45, z: 1.0}} t0={T.s4} t1={T.end} {...full} />
          <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(8,16,14,0.8) 0%, rgba(8,16,14,0.4) 32%, rgba(8,16,14,0.1) 50%)'}} />
          <div style={{position: 'absolute', top: 230, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 50}}>
            <Counter label="PAYÉ" value={12} at={T.p12} color={MINT} />
            <Counter label="REVENTE" value={90} at={T.p90} color="#FFD34D" prefix="≈" />
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

      <Flash at={[T.s1, T.c1, T.s2, T.c3, T.c4, T.s3, T.c5, T.s4]} />
      {captions.length && t < captions[captions.length - 1].end + 0.7 ? <Captions words={captions} accent="#FFE14D" /> : null}
    </AbsoluteFill>
  );
};
