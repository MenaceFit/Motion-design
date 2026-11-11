// « Legit check » : authentique vs 1.1 (contrefaçon) — vidéo verticale pilotée par la voix off.
// Grammaire : fond sombre, médias plein cadre ou cartes arrondies, en-tête d'étape (pastille),
// badges LEGIT (menthe) / 1.1 (rouge), cercle de repère qui se trace sur le détail comparé,
// sous-titres karaoké (Captions). Tous les timings viennent des props (secondes, calés sur words.json).
import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/anton/400.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import gsap from 'gsap';
import {Captions, CaptionWord} from './Captions';

const BACK = gsap.parseEase('back.out(1.8)');
const OUT = gsap.parseEase('expo.out');
const INOUT = gsap.parseEase('power2.inOut');
const MINT = '#5CF2C4', RED = '#FF3D57', INK = '#08100E';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const prog = (t: number, a: number, d: number) => Math.min(1, Math.max(0, (t - a) / d));
// Temps ABSOLU de la vidéo : dans une <Sequence>, useCurrentFrame() repart de 0 → on rajoute le début du plan.
const Offset = React.createContext(0);
const useT = () => { const f = useCurrentFrame(); const {fps} = useVideoConfig(); return f / fps + React.useContext(Offset); };

type Src = {src: string; w: number; h: number; video?: boolean; rate?: number; from?: number};
type Focus = {x: number; y: number; z: number};

// Média recadré : le point focal (x,y normalisés) est amené vers le centre du cadre, zoom z (1 = cover).
// Interpolation douce entre deux focus (Ken Burns piloté).
const Framed: React.FC<{m: Src; a: Focus; b: Focus; t0: number; t1: number; w: number; h: number; radius?: number; anchorY?: number; free?: boolean}> =
  ({m, a, b, t0, t1, w, h, radius = 0, anchorY, free = false}) => {
  const t = useT();
  const k = INOUT(prog(t, t0, t1 - t0));
  const fx = a.x + (b.x - a.x) * k, fy = a.y + (b.y - a.y) * k, z = a.z + (b.z - a.z) * k;
  const s = Math.max(w / m.w, h / m.h) * z;
  const W = m.w * s, H = m.h * s;
  const ay = anchorY ?? h / 2;
  const left = free ? w / 2 - fx * W : Math.min(0, Math.max(w - W, w / 2 - fx * W));
  const top = free ? ay - fy * H : Math.min(0, Math.max(h - H, ay - fy * H));
  const style: React.CSSProperties = {position: 'absolute', left, top, width: W, height: H};
  return (
    <div style={{position: 'relative', width: w, height: h, overflow: 'hidden', borderRadius: radius, background: free ? 'transparent' : '#000'}}>
      {m.video
        ? <OffthreadVideo src={staticFile(m.src)} playbackRate={m.rate ?? 1} startFrom={m.from ?? 0} muted style={style} />
        : <Img src={staticFile(m.src)} style={style} />}
    </div>
  );
};

const Badge: React.FC<{kind: 'legit' | 'fake'; at: number; size?: number}> = ({kind, at, size = 46}) => {
  const t = useT();
  const k = prog(t, at, 0.45);
  if (t < at) return null;
  const c = kind === 'legit' ? MINT : RED;
  return (
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: `${size * 0.22}px ${size * 0.5}px`,
      background: c, color: INK, borderRadius: 999, fontFamily: 'Anton', fontSize: size, letterSpacing: 2,
      transform: `scale(${BACK(k)}) rotate(${(1 - k) * -8}deg)`, boxShadow: `0 10px 40px ${c}66`}}>
      {kind === 'legit' ? 'AUTHENTIQUE ✓' : '1.1 ✗'}
    </div>
  );
};

// Étiquette de verdict : texte + trait, glisse depuis le côté.
const Verdict: React.FC<{text: string; kind: 'legit' | 'fake'; at: number; top: number}> = ({text, kind, at, top}) => {
  const t = useT();
  if (t < at) return null;
  const k = OUT(prog(t, at, 0.5));
  const c = kind === 'legit' ? MINT : RED;
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div style={{background: 'rgba(8,16,14,0.82)', border: `5px solid ${c}`, borderRadius: 26, padding: '16px 34px',
        fontFamily: 'Anton', fontSize: 74, color: c, letterSpacing: 2, opacity: k,
        transform: `translateX(${(1 - k) * (kind === 'legit' ? -260 : 260)}px)`, backdropFilter: 'blur(6px)'}}>
        {text} {kind === 'legit' ? '✓' : '✗'}
      </div>
    </div>
  );
};

// Cercle qui se trace (stroke-dashoffset) autour d'un détail, avec léger pulse.
const Ring: React.FC<{x: number; y: number; rx: number; ry: number; at: number; color: string}> = ({x, y, rx, ry, at, color}) => {
  const t = useT();
  if (t < at) return null;
  const k = OUT(prog(t, at, 0.55));
  const L = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
  const pulse = 1 + 0.03 * Math.sin((t - at) * 6);
  return (
    <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
      <ellipse cx={x} cy={y} rx={rx * pulse} ry={ry * pulse} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
        strokeDasharray={L} strokeDashoffset={L * (1 - k)}
        style={{filter: `drop-shadow(0 0 14px ${color})`}} />
    </svg>
  );
};

const StepHeader: React.FC<{n: number; title: string; at: number}> = ({n, title, at}) => {
  const t = useT();
  const k = prog(t, at, 0.5);
  return (
    <div style={{position: 'absolute', top: 175, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
      <div style={{fontFamily: 'Montserrat', fontWeight: 800, fontSize: 34, letterSpacing: 8, color: INK, background: MINT,
        padding: '8px 22px', borderRadius: 10, transform: `scale(${BACK(prog(t, at, 0.35))})`}}>ÉTAPE {n}/3</div>
      <div style={{fontFamily: 'Anton', fontSize: 104, color: '#fff', letterSpacing: 1, lineHeight: 1.14, paddingTop: 14, textAlign: 'center', whiteSpace: 'pre-line',
        clipPath: `inset(0 ${(1 - OUT(prog(t, at + 0.08, 0.55))) * 100}% 0 0)`, textShadow: '0 8px 30px rgba(0,0,0,0.7)',
        WebkitTextStroke: '3px #08100E', opacity: k > 0 ? 1 : 0}}>{title}</div>
    </div>
  );
};

// Flash blanc court au changement de plan (masque la coupe).
const Flash: React.FC<{at: number[]}> = ({at}) => {
  const t = useT();
  const o = Math.max(0, ...at.map((a) => interpolate(t, [a - 0.02, a, a + 0.16], [0, 0.55, 0], clamp)));
  return <AbsoluteFill style={{background: '#fff', opacity: o, pointerEvents: 'none'}} />;
};

const Counter: React.FC<{label: string; value: number; at: number; color: string; prefix?: string}> = ({label, value, at, color, prefix = ''}) => {
  const t = useT();
  if (t < at) return null;
  const k = OUT(prog(t, at, 0.9));
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: prog(t, at, 0.2),
      transform: `translateY(${(1 - OUT(prog(t, at, 0.4))) * 60}px)`}}>
      <div style={{fontFamily: 'Montserrat', fontWeight: 800, fontSize: 38, letterSpacing: 6, color: '#fff'}}>{label}</div>
      <div style={{fontFamily: 'Anton', fontSize: 190, lineHeight: 1, color, textShadow: `0 0 40px ${color}88`, WebkitTextStroke: '4px #08100E'}}>
        {prefix}{Math.round(value * k)}€
      </div>
    </div>
  );
};

// Plan plein cadre avec léger « punch-in » d'entrée (scale 1.08 → 1).
const Shot: React.FC<{a: number; children: React.ReactNode}> = ({a, children}) => {
  const t = useT();
  const k = OUT(prog(t, a, 0.6));
  return <AbsoluteFill style={{transform: `scale(${1.08 - 0.08 * k})`}}>{children}</AbsoluteFill>;
};

// Carte du split-screen (accroche + étape 1).
const Card: React.FC<{m: Src; f: Focus; kind: 'legit' | 'fake'; side: -1 | 1; at: number; swatch?: string; swatchAt?: number}> = ({m, f, kind, side, at, swatch, swatchAt = 0}) => {
  const t = useT();
  const k = OUT(prog(t, at, 0.7));
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26,
      transform: `translateX(${(1 - k) * side * 700}px) rotate(${side * (1 - k) * 6}deg)`}}>
      <div style={{position: 'relative', border: `6px solid ${kind === 'legit' ? MINT : RED}`, borderRadius: 34, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.6)'}}>
        <Framed m={m} a={f} b={{...f, z: f.z * 1.08}} t0={at} t1={at + 6} w={470} h={660} radius={28} />
        {swatch && t >= swatchAt ? (
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 22, display: 'flex', justifyContent: 'center'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(8,16,14,0.85)', borderRadius: 999, padding: '10px 22px 10px 10px',
              transform: `scale(${BACK(prog(t, swatchAt, 0.45))})`}}>
              <div style={{width: 64, height: 64, borderRadius: 32, background: swatch, border: '4px solid #fff'}} />
              <div style={{fontFamily: 'Montserrat', fontWeight: 800, fontSize: 30, color: '#fff', letterSpacing: 1}}>{swatch}</div>
            </div>
          </div>
        ) : null}
      </div>
      <Badge kind={kind} at={at + 0.5} size={40} />
    </div>
  );
};


export type LegitProps = {
  voice?: string; music?: string; sfx?: {src: string; at: number; volume: number}[];
  captions: CaptionWord[]; T: Record<string, number>; durationS: number;
};

export const LegitCheck: React.FC<LegitProps> = ({voice, music, captions, T}) => {
  const t = useT();
  const {fps} = useVideoConfig();
  const F = (s: number) => Math.round(s * fps);
  const legit: Src = {src: 'projects/legit/legit.jpg', w: 1440, h: 2558};
  const fake1: Src = {src: 'projects/legit/fake1.jpg', w: 984, h: 1314};
  const fake2: Src = {src: 'projects/legit/fake2.jpg', w: 1080, h: 1112};
  const chest: Src = {src: 'projects/legit/chest.mp4', w: 1080, h: 1920, video: true};
  const col: Src = {src: 'projects/legit/col.mp4', w: 1080, h: 1920, video: true, rate: 1};
  const sleeve: Src = {src: 'projects/legit/sleeve.mp4', w: 1080, h: 1920, video: true, rate: 0.85};
  const full = {w: 1080, h: 1920};
  const seg = (a: number, b: number, el: React.ReactNode) => (
    <Sequence from={F(a)} durationInFrames={F(b) - F(a)} layout="none"><Offset.Provider value={F(a) / fps}>{el}</Offset.Provider></Sequence>
  );
  const shade = <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(8,16,14,0.78) 0%, rgba(8,16,14,0) 30%, rgba(8,16,14,0) 55%, rgba(8,16,14,0.75) 100%)'}} />;

  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 40%, #12302A 0%, ${INK} 70%)`}}>
      {/* ACCROCHE + ÉTAPE 1 (split) */}
      {seg(0, T.c1, (
        <AbsoluteFill>
          <div style={{position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center'}}>
            {t < T.s1 ? (
              <>
                <div style={{fontFamily: 'Montserrat', fontWeight: 800, fontSize: 36, letterSpacing: 10, color: MINT,
                  opacity: prog(t, 0.1, 0.3)}}>LEGIT CHECK</div>
                <div style={{fontFamily: 'Anton', fontSize: 112, color: '#fff', lineHeight: 1.0,
                  transform: `scale(${BACK(prog(t, 0.15, 0.5))})`}}>ZIP RUNNING<br />DIVISION</div>
              </>
            ) : null}
          </div>
          {t >= T.s1 ? <StepHeader n={1} title="LA COULEUR" at={T.s1} /> : null}
          <div style={{position: 'absolute', top: 470, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 40}}>
            <Card m={fake2} f={{x: 0.5, y: 0.48, z: 1.0}} kind="fake" side={-1} at={0.3} swatch="#5ADBD3" swatchAt={T.s1 + 0.6} />
            <Card m={legit} f={{x: 0.5, y: 0.42, z: 1.0}} kind="legit" side={1} at={0.6} swatch="#AAD4CB" swatchAt={T.s1 + 0.9} />
          </div>
          {/* VS */}
          {t >= T.vs && t < T.s1 ? (
            <div style={{position: 'absolute', top: 700, left: 0, right: 0, textAlign: 'center'}}>
              <span style={{display: 'inline-block', fontFamily: 'Anton', fontSize: 130, color: '#fff', WebkitTextStroke: '6px #08100E',
                transform: `scale(${BACK(prog(t, T.vs, 0.4))}) rotate(-6deg)`, textShadow: '0 0 40px rgba(92,242,196,0.6)'}}>VS</span>
            </div>
          ) : null}
        </AbsoluteFill>
      ))}

      {/* ÉTAPE 1 — authentique : clip poitrine */}
      {seg(T.c1, T.c2, (
        <Shot a={T.c1}>
          <Framed m={chest} a={{x: 0.5, y: 0.5, z: 1}} b={{x: 0.5, y: 0.55, z: 1.12}} t0={T.c1} t1={T.c2} {...full} />
          {shade}
          <Verdict text="PLUS CLAIRE" kind="legit" at={T.claire} top={260} />
          <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}><Badge kind="legit" at={T.c1 + 0.1} /></div>
        </Shot>
      ))}
      {/* ÉTAPE 1 — 1.1 */}
      {seg(T.c2, T.s2, (
        <Shot a={T.c2}>
          <Framed m={fake2} a={{x: 0.5, y: 0.5, z: 1.0}} b={{x: 0.5, y: 0.48, z: 1.25}} t0={T.c2} t1={T.s2} {...full} />
          {shade}
          <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}><Badge kind="fake" at={T.c2 + 0.1} /></div>
          <Verdict text="PLUS FONCÉE" kind="fake" at={T.foncee} top={260} />
        </Shot>
      ))}

      {/* ÉTAPE 2 — écriture du col : intro sur la photo authentique, zoom col */}
      {seg(T.s2, T.c3, (
        <Shot a={T.s2}>
          <Framed m={legit} a={{x: 0.5, y: 0.45, z: 1}} b={{x: 0.44, y: 0.17, z: 2.6}} t0={T.s2 + 0.3} t1={T.c3} {...full} />
          <AbsoluteFill style={{background: 'rgba(8,16,14,0.35)'}} />
          <StepHeader n={2} title={"L'ÉCRITURE\nDU COL"} at={T.s2} />
        </Shot>
      ))}
      {seg(T.c3, T.c4, (
        <Shot a={T.c3}>
          <Framed m={col} a={{x: 0.5, y: 0.35, z: 1.05}} b={{x: 0.5, y: 0.3, z: 1.2}} t0={T.c3} t1={T.c4} {...full} />
          {shade}
          <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}><Badge kind="legit" at={T.c3 + 0.1} /></div>
          <Verdict text="ÉCRITURE GRISÉE" kind="legit" at={T.grisee} top={1100} />
        </Shot>
      ))}
      {seg(T.c4, T.s3, (
        <Shot a={T.c4}>
          <Framed m={fake1} a={{x: 0.4, y: 0.3, z: 1.0}} b={{x: 0.3, y: 0.037, z: 1.5}} t0={T.c4} t1={T.c4 + 1.4} {...full} anchorY={640} free />
          {shade}
          <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}><Badge kind="fake" at={T.c4 + 0.1} /></div>
          <Ring x={575} y={655} rx={440} ry={95} at={T.blanche - 0.4} color={RED} />
          <Verdict text="ÉCRITURE BLANCHE" kind="fake" at={T.blanche} top={1100} />
        </Shot>
      ))}

      {/* ÉTAPE 3 — détails « araignée » sur les manches */}
      {seg(T.s3, T.c5, (
        <Shot a={T.s3}>
          <Framed m={legit} a={{x: 0.5, y: 0.45, z: 1}} b={{x: 0.81, y: 0.38, z: 2.3}} t0={T.s3 + 0.3} t1={T.c5} {...full} />
          <AbsoluteFill style={{background: 'rgba(8,16,14,0.35)'}} />
          <StepHeader n={3} title={'LES DÉTAILS\n« ARAIGNÉE »'} at={T.s3} />
        </Shot>
      ))}
      {seg(T.c5, T.c6, (
        <Shot a={T.c5}>
          <Framed m={sleeve} a={{x: 0.5, y: 0.5, z: 1.0}} b={{x: 0.45, y: 0.55, z: 1.15}} t0={T.c5} t1={T.c6} {...full} />
          {shade}
          <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}><Badge kind="legit" at={T.c5 + 0.1} /></div>
          <Verdict text="BIEN TRACÉS" kind="legit" at={T.traces} top={260} />
        </Shot>
      ))}
      {seg(T.c6, T.s4, (
        <Shot a={T.c6}>
          <Framed m={fake2} a={{x: 0.5, y: 0.45, z: 1.0}} b={{x: 0.80, y: 0.34, z: 2.2}} t0={T.c6} t1={T.c6 + 1.6} {...full} />
          {shade}
          <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}><Badge kind="fake" at={T.c6 + 0.1} /></div>
          <Ring x={540} y={960} rx={420} ry={330} at={T.grossiers - 0.5} color={RED} />
          <Verdict text="TRAITS GROSSIERS" kind="fake" at={T.grossiers} top={260} />
        </Shot>
      ))}

      {/* OUTRO — prix */}
      {seg(T.s4, T.end, (
        <Shot a={T.s4}>
          <Framed m={legit} a={{x: 0.5, y: 0.3, z: 1.35}} b={{x: 0.5, y: 0.45, z: 1.0}} t0={T.s4} t1={T.end} {...full} />
          <AbsoluteFill style={{background: 'rgba(8,16,14,0.55)'}} />
          <div style={{position: 'absolute', top: 230, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 50}}>
            <Counter label="PAYÉ" value={30} at={T.p30} color={MINT} />
            <Counter label="REVENTE" value={80} at={T.p80} color="#FFD34D" prefix="≈" />
          </div>
          {t >= T.stamp ? (
            <div style={{position: 'absolute', top: 1060, left: 0, right: 0, textAlign: 'center'}}>
              <span style={{display: 'inline-block', fontFamily: 'Anton', fontSize: 120, color: MINT, border: `10px solid ${MINT}`,
                borderRadius: 24, padding: '4px 34px', transform: `scale(${2.2 - 1.2 * BACK(prog(t, T.stamp, 0.35))}) rotate(-8deg)`,
                opacity: prog(t, T.stamp, 0.12), background: 'rgba(8,16,14,0.6)'}}>LEGIT ✓</span>
            </div>
          ) : null}
        </Shot>
      ))}

      <Flash at={[T.c1, T.c2, T.s2, T.c3, T.c4, T.s3, T.c5, T.c6, T.s4]} />
      <Captions words={captions} accent={MINT} />
      {voice ? <Audio src={staticFile(voice)} /> : null}
      {music ? <Audio src={staticFile(music)} /> : null}
    </AbsoluteFill>
  );
};
