// « Arcade legit check » — format jeu, DA pixel rétro. Principes (pas les assets) tirés des références
// analysées dans references/analyses/legitcheck-ref : « un seul est vrai » + compte à rebours 3-2-1,
// révélation rouge/vert, score x/N qui se remplit, étapes « N° », cartes à viseurs + flèches + tampons ✗/✓,
// transitions en pixelisation, écran « t'en avais combien ? » (appel au commentaire), mascotte pixel.
// Mascotte (Mascot.tsx), décor et textes : originaux (aucun élément de la référence n'est réutilisé).
import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useVideoConfig} from 'remotion';
import '@fontsource/pixelify-sans/500.css';
import '@fontsource/pixelify-sans/700.css';
import '@fontsource/montserrat/800.css';  // glyphes absents de la police pixel (€)
import {CaptionWord} from './Captions';
import {BACK, OUT, prog, Offset, useT} from './LegitCheck';
import {Mascot, Pose} from './Mascot';

const PX = 'Pixelify Sans';
const C = {bg0: '#0a1226', bg1: '#04060e', stair: '#0e1a33', blue: '#3d8bff', red: '#ff3b4a', green: '#2fe36b',
  yellow: '#ffd23f', ink: '#04060e', card: '#cdd6e8'};
const IMG = 'projects/division/cards/';
const FLOOR = 1630;

// pseudo-aléatoire déterministe (pas de Math.random dans un rendu Remotion)
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- texte pixel « tapé » + glitch d'apparition ----------
const Typed: React.FC<{text: string; at: number; size: number; color?: string; cps?: number; glow?: string;
  parts?: [string, string][]}> = ({text, at, size, color = '#fff', cps = 28, glow, parts}) => {
  const t = useT();
  if (t < at) return null;
  const n = Math.floor((t - at) * cps);
  const g = t - at < 0.18 ? 6 * Math.sin((t - at) * 90) : 0;
  const segs = parts ?? [[text, color]];
  let left = n;
  return (
    <span style={{fontFamily: PX, fontWeight: 700, fontSize: size, letterSpacing: 2, lineHeight: 1.1,
      textShadow: `${g}px 0 0 rgba(255,0,80,0.7), ${-g}px 0 0 rgba(0,200,255,0.7), 0 0 18px ${glow ?? 'rgba(120,170,255,0.45)'}, 0 4px 0 #000`}}>
      {segs.map(([s, c], i) => { const shown = s.slice(0, Math.max(0, left)); left -= s.length;
        return <span key={i} style={{color: c}}>{shown}</span>; })}
      {n < text.length && Math.floor(t * 8) % 2 === 0 ? <span style={{color: '#fff'}}>▮</span> : null}
    </span>
  );
};

// ---------- décor : scène nocturne, escaliers pixel, projecteurs, sol ----------
const Stage: React.FC<{tint: 'none' | 'split'; tintAt: number; rays?: string; raysAt?: number}> = ({tint, tintAt, rays, raysAt = 0}) => {
  const t = useT();
  const k = tint === 'split' ? prog(t, tintAt, 0.35) : 0;
  const beam = (x: number, col: string, op: number, w: number) => (
    <div style={{position: 'absolute', left: x - w / 2, top: -100, width: w, height: FLOOR + 100, opacity: op,
      background: `linear-gradient(180deg, ${col} 0%, rgba(0,0,0,0) 92%)`, filter: 'blur(26px)',
      clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)'}} />
  );
  const stairs = [];
  for (let col = 0; col < 4; col++) {
    const cx = 135 + col * 270;
    for (let s = 0; s < 9; s++) {
      const w = 90 + s * 22, h = 70;
      stairs.push(<div key={`${col}-${s}`} style={{position: 'absolute', left: cx - w / 2, top: 250 + s * h, width: w, height: h + 2,
        background: s % 2 ? C.stair : '#0c1730', boxShadow: 'inset 0 4px 0 rgba(90,140,255,0.08)'}} />);
    }
  }
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.bg0} 0%, #0b1730 55%, ${C.bg1} 100%)`, overflow: 'hidden'}}>
      {/* étoiles qui scintillent */}
      {Array.from({length: 70}).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: rnd(i) * 1080, top: rnd(i + 99) * FLOOR, width: 4, height: 4,
          background: '#9cc4ff', opacity: 0.15 + 0.55 * Math.abs(Math.sin(t * (0.8 + rnd(i + 7) * 2) + i))}} />
      ))}
      {stairs}
      {rays ? (
        <div style={{position: 'absolute', left: 540 - 1400, top: 760 - 1400, width: 2800, height: 2800, opacity: 0.35 * prog(t, raysAt, 0.4),
          background: `repeating-conic-gradient(${rays} 0deg 9deg, rgba(0,0,0,0) 9deg 22.5deg)`, transform: `rotate(${t * 12}deg)`,
          maskImage: 'radial-gradient(circle, #000 0%, rgba(0,0,0,0) 55%)', WebkitMaskImage: 'radial-gradient(circle, #000 0%, rgba(0,0,0,0) 55%)'}} />
      ) : null}
      {beam(270, `rgba(${Math.round(80 + 175 * k)},${Math.round(130 - 70 * k)},${Math.round(255 - 180 * k)},0.55)`, 0.75, 520)}
      {beam(540, 'rgba(80,130,255,0.35)', 0.5, 420)}
      {beam(810, `rgba(${Math.round(80 - 40 * k)},${Math.round(130 + 100 * k)},${Math.round(255 - 150 * k)},0.55)`, 0.75, 520)}
      {/* sol : ligne lumineuse + grille en perspective + reflet */}
      <div style={{position: 'absolute', left: 0, right: 0, top: FLOOR, height: 1920 - FLOOR, background: 'linear-gradient(180deg, #0b1a3a 0%, #03050b 100%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: FLOOR - 3, height: 6, background: '#5aa0ff', boxShadow: '0 0 24px #3d8bff'}} />
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} style={{position: 'absolute', left: 0, right: 0, top: FLOOR + i * i * 9, height: 2, background: 'rgba(90,160,255,0.22)'}} />
      ))}
    </AbsoluteFill>
  );
};

// overlay CRT : lignes de balayage + vignette
const CRT = () => (
  <AbsoluteFill style={{pointerEvents: 'none',
    background: 'repeating-linear-gradient(180deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 5px), radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />
);

// ---------- cartes ----------
type Verdict = {at: number; ok: boolean; lines: string[]} | null;
const Tag: React.FC<{text: string; color: string; dark?: boolean; at: number}> = ({text, color, dark, at}) => {
  const t = useT();
  if (t < at) return null;
  return (
    <div style={{padding: '6px 16px', background: color, color: dark ? C.ink : '#fff', fontFamily: PX, fontWeight: 700, fontSize: 34,
      letterSpacing: 1, boxShadow: '0 4px 0 rgba(0,0,0,0.5)', transform: `scale(${BACK(prog(t, at, 0.3))})`}}>{text}</div>
  );
};
const Brackets: React.FC<{color: string; at: number}> = ({color, at}) => {
  const t = useT();
  if (t < at) return null;
  const k = OUT(prog(t, at, 0.35));
  const inset = 70 - 40 * k, s = 54, b = 7;
  const corner = (st: React.CSSProperties) => <div style={{position: 'absolute', width: s, height: s, ...st}} />;
  return (
    <AbsoluteFill style={{opacity: k}}>
      {corner({left: inset, top: inset, borderLeft: `${b}px solid ${color}`, borderTop: `${b}px solid ${color}`})}
      {corner({right: inset, top: inset, borderRight: `${b}px solid ${color}`, borderTop: `${b}px solid ${color}`})}
      {corner({left: inset, bottom: inset, borderLeft: `${b}px solid ${color}`, borderBottom: `${b}px solid ${color}`})}
      {corner({right: inset, bottom: inset, borderRight: `${b}px solid ${color}`, borderBottom: `${b}px solid ${color}`})}
    </AbsoluteFill>
  );
};
const Stamp: React.FC<{ok: boolean; at: number}> = ({ok, at}) => {
  const t = useT();
  if (t < at) return null;
  const k = BACK(prog(t, at, 0.3));
  const col = ok ? C.green : C.red;
  return (
    <div style={{position: 'absolute', right: -18, top: -26, width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: PX, fontWeight: 700, fontSize: 120, lineHeight: 1, color: col, transform: `scale(${2 - k}) rotate(${(1 - k) * 25}deg)`,
      opacity: prog(t, at, 0.06), textShadow: `0 0 0 #000, 5px 5px 0 #000, -5px -5px 0 #000, 5px -5px 0 #000, -5px 5px 0 #000, 0 0 30px ${col}`}}>{ok ? '✓' : '✗'}</div>
  );
};
const Arrow: React.FC<{x: number; y: number; color: string; at: number}> = ({x, y, color, at}) => {
  const t = useT();
  if (t < at) return null;
  const P = 9, dy = Math.round(Math.sin((t - at) * 9) * 2) * 5;
  const g = ['..x..', '.xxx.', 'xxxxx', '.xxx.', '.xxx.'];
  return (
    <svg style={{position: 'absolute', left: x - 2.5 * P, top: y + dy, opacity: prog(t, at, 0.1)}} width={5 * P} height={5 * P} shapeRendering="crispEdges">
      {g.flatMap((r, yy) => r.split('').map((c, xx) => c === 'x'
        ? <rect key={`${xx}-${yy}`} x={xx * P} y={yy * P} width={P} height={P} fill={color} stroke="#000" strokeWidth={2} /> : null))}
    </svg>
  );
};
const Card: React.FC<{img: string; x: number; tag: [string, string, boolean] | null; tagAt: number; enter: number;
  verdict: Verdict; arrow?: [number, number]; highlight?: boolean; dim?: boolean; px?: boolean}> =
  ({img, x, tag, tagAt, enter, verdict, arrow, highlight, dim, px = true}) => {
  const t = useT();
  const W = 470, H = 560;
  const k = BACK(prog(t, enter, 0.45));
  const v = verdict && t >= verdict.at ? verdict : null;
  const col = v ? (v.ok ? C.green : C.red) : highlight ? C.yellow : C.blue;
  const pixel = px && t < enter + 0.28;
  const zoom = 1 + 0.05 * prog(t, enter, 6);
  return (
    <div style={{position: 'absolute', left: x, top: 430, width: W, transform: `translateY(${(1 - k) * -260}px)`, opacity: prog(t, enter, 0.12)}}>
      <div style={{height: 70, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: 10}}>
        {tag ? <Tag text={tag[0]} color={tag[1]} dark={tag[2]} at={tagAt} /> : null}
      </div>
      <div style={{position: 'relative', width: W, height: H, background: C.card, border: `7px solid ${col}`,
        boxShadow: `0 0 ${v || highlight ? 40 : 18}px ${col}${v || highlight ? 'cc' : '66'}, inset 0 0 0 4px rgba(0,0,0,0.35)`}}>
        <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
          <Img src={staticFile(IMG + img + (pixel ? '_px' : '') + '.jpg')}
            style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, imageRendering: pixel ? 'pixelated' : 'auto',
              filter: `${dim ? 'brightness(0.75) saturate(0.7)' : ''}`}} />
          {v ? <AbsoluteFill style={{background: v.ok ? 'rgba(47,227,107,0.05)' : 'rgba(255,59,74,0.06)'}} /> : null}
          {v ? <Brackets color={col} at={v.at} /> : null}
          {v && arrow ? <Arrow x={arrow[0]} y={arrow[1]} color={col} at={v.at + 0.1} /> : null}
        </div>
        {v ? <Stamp ok={v.ok} at={v.at} /> : null}
      </div>
      <div style={{marginTop: 18, minHeight: 90, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4}}>
        {v ? v.lines.map((l, i) => (
          <div key={i} style={{fontFamily: PX, fontWeight: 700, fontSize: i === 0 ? 40 : 30, color: col, letterSpacing: 1,
            textShadow: '0 3px 0 #000', opacity: prog(t, v.at + 0.15 + i * 0.12, 0.1)}}>{l}</div>
        )) : null}
      </div>
    </div>
  );
};

// ---------- score (cases 1..N) ----------
const Score: React.FC<{n: number; pts: number[]; current: number; at: number}> = ({n, pts, current, at}) => {
  const t = useT();
  if (t < at) return null;
  const got = pts.filter((p) => t >= p).length;
  return (
    <div style={{position: 'absolute', top: 54, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: prog(t, at, 0.2)}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', background: 'rgba(4,8,20,0.85)',
        border: '4px solid #2a3c66', boxShadow: '0 4px 0 #000'}}>
        {Array.from({length: n}).map((_, i) => {
          const done = t >= pts[i];
          const isCur = !done && i === current;
          const pop = done ? BACK(prog(t, pts[i], 0.3)) : 1;
          return (
            <div key={i} style={{width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: done ? C.green : 'transparent', border: `4px solid ${done ? '#0d6b2f' : isCur ? C.yellow : '#3a4a70'}`,
              fontFamily: PX, fontWeight: 700, fontSize: 30, color: done ? C.ink : isCur ? C.yellow : '#56658a', transform: `scale(${pop})`}}>
              {done ? '✓' : i + 1}
            </div>
          );
        })}
        <div style={{fontFamily: PX, fontWeight: 700, fontSize: 38, color: '#cfe0ff', marginLeft: 10, width: 90}}>{got}/{n}</div>
      </div>
    </div>
  );
};

const PlusOne: React.FC<{at: number; x: number}> = ({at, x}) => {
  const t = useT();
  if (t < at || t > at + 1.1) return null;
  const k = prog(t, at, 1.1);
  return <div style={{position: 'absolute', left: x, top: 380 - 90 * OUT(k), fontFamily: PX, fontWeight: 700, fontSize: 64, color: C.green,
    opacity: 1 - k * k, textShadow: '0 4px 0 #000, 0 0 20px rgba(47,227,107,0.8)'}}>+1</div>;
};

// ---------- sous-titres pixel compacts (≤ 3 mots), au-dessus de la mascotte ----------
const PixelCaptions: React.FC<{words: CaptionWord[]}> = ({words}) => {
  const t = useT();
  const pages: CaptionWord[][] = [];
  let cur: CaptionWord[] = [];
  for (const w of words) {
    const len = cur.reduce((a, x) => a + x.text.length + 1, 0) + w.text.length;
    if (cur.length && (cur.length >= 3 || len > 20 || /[.?!,]$/.test(cur[cur.length - 1].text))) { pages.push(cur); cur = []; }
    cur.push(w);
  }
  if (cur.length) pages.push(cur);
  const idx = pages.findIndex((p, i) => t >= p[0].start - 0.02 && (i + 1 >= pages.length || t < pages[i + 1][0].start - 0.02));
  if (idx < 0) return null;
  const page = pages[idx];
  if (t > page[page.length - 1].end + 0.6) return null;
  return (
    <div style={{position: 'absolute', top: 1222, left: 40, right: 40, textAlign: 'center'}}>
      {page.map((w, i) => {
        const active = t >= w.start && (i + 1 < page.length ? t < page[i + 1].start : true);
        return <span key={i} style={{display: 'inline-block', margin: '0 12px', fontFamily: PX, fontWeight: 700, fontSize: 50, letterSpacing: 1,
          textTransform: 'uppercase', color: active ? C.yellow : '#fff', opacity: t >= w.start ? 1 : 0.35,
          transform: `scale(${active ? 1 + 0.12 * (1 - prog(t, w.start, 0.15)) : 1})`,
          textShadow: '4px 4px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000'}}>{w.text}</span>;
      })}
    </div>
  );
};

// ---------- transition : dissolution en blocs pixel ----------
const PixelWipe: React.FC<{at: number[]}> = ({at}) => {
  const t = useT();
  const a = at.find((x) => t >= x - 0.22 && t < x + 0.22);
  if (a === undefined) return null;
  const k = (t - (a - 0.22)) / 0.44;            // 0 → 1 ; couvert à 0.5
  const cells = [];
  const S = 90, cols = 12, rows = 22;
  for (let i = 0; i < cols * rows; i++) {
    const r = rnd(i + 3);
    const on = k < 0.5 ? r < k * 2 : r > (k - 0.5) * 2;
    if (on) cells.push(<div key={i} style={{position: 'absolute', left: (i % cols) * S, top: Math.floor(i / cols) * S, width: S, height: S,
      background: r > 0.85 ? '#16305e' : '#070d1d'}} />);
  }
  return <AbsoluteFill>{cells}</AbsoluteFill>;
};

const Big: React.FC<{children: React.ReactNode; top: number; at: number; size?: number}> = ({children, top, at, size = 76}) => {
  const t = useT();
  if (t < at) return null;
  return <div style={{position: 'absolute', top, left: 0, right: 0, textAlign: 'center', fontFamily: PX, fontWeight: 700, fontSize: size,
    letterSpacing: 2, color: '#fff', transform: `scale(${BACK(prog(t, at, 0.3))})`, textShadow: '0 5px 0 #000, 0 0 24px rgba(120,170,255,0.5)'}}>{children}</div>;
};

export type ArcadeProps = {captions: CaptionWord[]; T: Record<string, number>; durationS: number};

export const ArcadeCheck: React.FC<ArcadeProps> = ({captions, T}) => {
  const t = useT();
  const {fps} = useVideoConfig();
  const F = (s: number) => Math.round(s * fps);
  const seg = (a: number, b: number, el: React.ReactNode) => (
    <Sequence from={F(a)} durationInFrames={F(b) - F(a)} layout="none"><Offset.Provider value={F(a) / fps}>{el}</Offset.Provider></Sequence>
  );
  const pts = [T.pt1, T.pt2, T.pt3, T.pt4];
  const FAKE: [string, string, boolean] = ['FAUX 1.1', C.red, false];
  const REAL: [string, string, boolean] = ['VRAI', C.green, true];
  const LX = 40, RX = 570;

  // pose de la mascotte selon le moment
  const events: [number, Pose][] = [[0, 'idle'], [T.question, 'think'], [T.reveal, 'right'], [T.compte, 'idle'],
    [T.noir, 'left'], [T.gris, 'right'], [T.s2, 'think'], [T.place, 'right'], [T.s3, 'idle'], [T.blanc, 'left'], [T.grise, 'right'],
    [T.s4, 'think'], [T.precis, 'right'], [T.pasprecis, 'left'], [T.score, 'think'], [T.comment, 'cheer'], [T.s5, 'idle'],
    [T.p120, 'cheer'], [T.cta, 'right']];
  const [since, pose] = events.reduce<[number, Pose]>((acc, [a, p]) => (t >= a ? [a, p] : acc), [0, 'idle']);
  const inScore = t >= T.score && t < T.s5;
  const inOutro = t >= T.s5;
  const splitAt = [T.reveal, T.noir, T.blanc, T.pasprecis].filter((x) => t >= x).pop() ?? 999;

  const step = (a: number, b: number, n: number, title: string, fake: string, real: string,
    fv: Verdict, rv: Verdict, fArrow?: [number, number], rArrow?: [number, number], fakeDim = false) => seg(a, b, (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 168, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <Tag text={`N°${n}`} color={C.yellow} dark at={a + 0.25} />
      </div>
      <div style={{position: 'absolute', top: 236, left: 0, right: 0, textAlign: 'center'}}><Typed text={title} at={a + 0.3} size={74} cps={30} /></div>
      <Card img={fake} x={LX} tag={FAKE} tagAt={a + 0.5} enter={a + 0.2} verdict={fv} arrow={fArrow} dim={fakeDim} />
      <Card img={real} x={RX} tag={REAL} tagAt={a + 0.6} enter={a + 0.3} verdict={rv} arrow={rArrow} />
      {rv ? <PlusOne at={rv.at} x={RX + 330} /> : null}
    </AbsoluteFill>
  ));

  return (
    <AbsoluteFill style={{background: C.bg1}}>
      <Stage tint={t >= T.reveal && !inScore && !inOutro ? 'split' : 'none'} tintAt={splitAt}
        rays={inScore ? 'rgba(255,210,63,0.55)' : inOutro ? 'rgba(47,227,107,0.5)' : undefined} raysAt={inScore ? T.score : T.s5} />

      {/* barre de progression de la vidéo */}
      <div style={{position: 'absolute', top: 0, left: 0, height: 10, width: `${(t / T.end) * 100}%`, background: C.blue, boxShadow: '0 0 12px #3d8bff'}} />

      {/* JEU D'INTRO : un seul est vrai */}
      {seg(0, T.s1, (
        <AbsoluteFill>
          <div style={{position: 'absolute', top: 130, left: 0, right: 0, textAlign: 'center'}}>
            {t < T.three ? <Typed text="UN SEUL EST VRAI" at={T.title} size={70} cps={22} parts={[['UN SEUL EST ', '#fff'], ['VRAI', C.green]]} />
              : t < T.reveal ? <Typed text="T'AS 3 SECONDES !" at={T.three} size={70} cps={40} color={C.yellow} glow="rgba(255,210,63,0.5)" />
              : t < T.compte ? <Typed text="C'EST CELUI DE" at={T.reveal} size={56} cps={40} />
              : <Typed text="COMPTE AVEC MOI" at={T.compte} size={62} cps={30} />}
          </div>
          {t >= T.reveal && t < T.compte ? (
            <div style={{position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center'}}>
              <Typed text="DROITE !" at={T.reveal + 0.25} size={96} cps={30} color={C.green} glow="rgba(47,227,107,0.7)" />
            </div>
          ) : null}
          {t >= T.question && t < T.reveal ? (
            <div style={{position: 'absolute', top: 214, left: 0, right: 0, textAlign: 'center'}}>
              <Typed text="GAUCHE OU DROITE ?" at={T.question} size={44} cps={40} parts={[['GAUCHE ', '#fff'], ['OU', C.yellow], [' DROITE ?', '#fff']]} />
            </div>
          ) : null}
          {/* compte à rebours */}
          {t >= T.cd3 && t < T.reveal ? (() => {
            const d = t < T.cd2 ? 3 : t < T.cd1 ? 2 : 1;
            const at = d === 3 ? T.cd3 : d === 2 ? T.cd2 : T.cd1;
            return (
              <>
                <div style={{position: 'absolute', top: 270, left: 0, right: 0, textAlign: 'center', fontFamily: PX, fontWeight: 700, fontSize: 130,
                  color: C.yellow, transform: `scale(${1.8 - 0.8 * BACK(prog(t, at, 0.25))})`, textShadow: '0 6px 0 #000, 0 0 30px rgba(255,210,63,0.8)'}}>{d}</div>
                <div style={{position: 'absolute', top: 410, left: 290, width: 500, height: 14, background: '#1b2742', border: '3px solid #000'}}>
                  <div style={{height: '100%', width: `${100 * (1 - prog(t, T.cd3, T.reveal - T.cd3))}%`, background: C.yellow}} />
                </div>
              </>
            );
          })() : null}
          <Card img="fake_full" x={LX} tag={t < T.reveal ? ['?', C.yellow, true] : FAKE} tagAt={t < T.reveal ? T.cards + 0.3 : T.reveal}
            enter={T.cards} verdict={{at: T.reveal, ok: false, lines: []}} px={false}
            highlight={t >= T.cd3 && t < T.reveal && Math.floor((t - T.cd3) / 0.4) % 2 === 0} />
          <Card img="legit_full" x={RX} tag={t < T.reveal ? ['?', C.yellow, true] : REAL} tagAt={t < T.reveal ? T.cards + 0.45 : T.reveal}
            enter={T.cards + 0.15} verdict={{at: T.reveal, ok: true, lines: []}} px={false}
            highlight={t >= T.cd3 && t < T.reveal && Math.floor((t - T.cd3) / 0.4) % 2 === 1} />
          {t >= T.question && t < T.reveal ? (
            <>
              <div style={{position: 'absolute', top: 1080, left: LX, width: 470, textAlign: 'center', fontFamily: PX, fontWeight: 700, fontSize: 40, color: C.yellow, textShadow: '0 3px 0 #000'}}>← GAUCHE</div>
              <div style={{position: 'absolute', top: 1080, left: RX, width: 470, textAlign: 'center', fontFamily: PX, fontWeight: 700, fontSize: 40, color: C.yellow, textShadow: '0 3px 0 #000'}}>DROITE →</div>
            </>
          ) : null}
        </AbsoluteFill>
      ))}

      {/* ÉTAPES */}
      {step(T.s1, T.s2, 1, 'LA COULEUR', 'fake_color', 'legit_color',
        {at: T.noir, ok: false, lines: ['QUASI NOIR']}, {at: T.gris, ok: true, lines: ['HAUT GRIS']}, [235, 330], [235, 300])}
      {step(T.s2, T.s3, 2, 'LE LOGO', 'fake_logo', 'legit_logo', null,
        {at: T.pt2, ok: true, lines: ['BIEN PLACÉ', 'BIEN DROIT', 'PAS TROP PETIT']}, undefined, [235, 330], true)}
      {/* checklist du logo qui se remplit avant le ✓ */}
      {t >= T.place && t < T.pt2 ? (
        <div style={{position: 'absolute', top: 1078, left: RX, width: 470, textAlign: 'center'}}>
          {([['BIEN PLACÉ', T.place], ['BIEN DROIT', T.droit], ['PAS TROP PETIT', T.petit]] as [string, number][]).map(([l, a]) => (
            <div key={l} style={{fontFamily: PX, fontWeight: 700, fontSize: 34, color: t >= a ? '#fff' : 'rgba(255,255,255,0)', textShadow: '0 3px 0 #000'}}>
              {t >= a ? '▸ ' : ''}{l}
            </div>
          ))}
        </div>
      ) : null}
      {step(T.s3, T.s4, 3, "L'ÉTIQUETTE", 'fake_label', 'legit_label',
        {at: T.blanc, ok: false, lines: ['ÉCRITURE', 'BLANCHE']}, {at: T.grise, ok: true, lines: ['ÉCRITURE', 'GRISE']}, [235, 250], [235, 320])}
      {step(T.s4, T.score, 4, 'LES ARAIGNÉES', 'fake_grid', 'legit_grid',
        {at: T.pasprecis, ok: false, lines: ['PAS PRÉCIS']}, {at: T.precis, ok: true, lines: ['PRÉCIS']}, [235, 300], [235, 300])}

      {/* ÉCRAN SCORE : appel au commentaire */}
      {seg(T.score, T.s5, (
        <AbsoluteFill>
          <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center'}}><Typed text="ALORS..." at={T.score + 0.1} size={70} cps={14} /></div>
          <div style={{position: 'absolute', top: 400, left: 0, right: 0, textAlign: 'center'}}>
            <Typed text="T'EN AVAIS COMBIEN ?" at={T.scoreQ - 0.3} size={58} cps={40} color={C.yellow} glow="rgba(255,210,63,0.6)" />
          </div>
          {t >= T.scoreQ ? (
            <div style={{position: 'absolute', top: 520, left: 290, width: 500, height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `8px solid ${C.yellow}`, background: 'rgba(10,12,24,0.9)', fontFamily: PX, fontWeight: 700, fontSize: 150, color: C.yellow,
              transform: `scale(${BACK(prog(t, T.scoreQ, 0.35)) * (1 + 0.03 * Math.sin(t * 8))})`, boxShadow: '0 0 50px rgba(255,210,63,0.6), 0 8px 0 #000',
              textShadow: '0 6px 0 #000'}}>?/4</div>
          ) : null}
          <Big top={800} at={T.comment} size={46}>ÉCRIS TON SCORE<br /><span style={{color: C.yellow}}>EN COMMENTAIRE ↓</span></Big>
          {t >= T.comment + 0.5 ? (
            <div style={{position: 'absolute', top: 960, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 22,
              transform: `scale(${BACK(prog(t, T.comment + 0.5, 0.3))})`}}>
              {['4/4 FACILE', "J'AVAIS RIEN VU"].map((s) => (
                <div key={s} style={{padding: '10px 20px', background: '#141c33', border: '4px solid #3a4a70', fontFamily: PX, fontWeight: 700, fontSize: 30, color: '#cfe0ff'}}>{s}</div>
              ))}
            </div>
          ) : null}
        </AbsoluteFill>
      ))}

      {/* OUTRO : prix + appel à l'action */}
      {seg(T.s5, T.end, (
        <AbsoluteFill>
          <Card img="legit_full" x={305} tag={REAL} tagAt={T.s5 + 0.3} enter={T.s5} verdict={{at: T.stamp, ok: true, lines: []}} />
          <div style={{position: 'absolute', top: 140, left: 0, right: 0, textAlign: 'center'}}><Typed text="LE VRAI DIVISION" at={T.s5 + 0.2} size={60} cps={30} color={C.green} glow="rgba(47,227,107,0.6)" /></div>
          <div style={{position: 'absolute', top: 1070, left: 40, right: 40, display: 'flex', justifyContent: 'space-between'}}>
            {([['PAYÉ', 50, T.p50, '#fff', ''], ['REVENTE', 180, T.p180, C.yellow, ''], ['BÉNEF', 120, T.p120, C.green, '+']] as [string, number, number, string, string][]).map(([l, v, a, c, pre]) => (
              <div key={l} style={{width: 310, padding: '12px 0', background: 'rgba(8,12,26,0.9)', border: `5px solid ${t >= a ? c : '#2a3c66'}`, textAlign: 'center',
                opacity: t >= a ? 1 : 0.35, transform: `scale(${t >= a ? BACK(prog(t, a, 0.3)) : 1})`, boxShadow: '0 6px 0 #000'}}>
                <div style={{fontFamily: PX, fontWeight: 700, fontSize: 28, color: '#9fb3da'}}>{l}</div>
                <div style={{fontFamily: 'Montserrat', fontWeight: 800, fontSize: 62, color: c, textShadow: '0 4px 0 #000'}}>{pre}{t >= a ? Math.round(v * OUT(prog(t, a, 0.8))) : 0}<span style={{fontFamily: 'Montserrat', fontWeight: 800, fontSize: 56, marginLeft: 4}}>€</span></div>
              </div>
            ))}
          </div>
          <Big top={1262} at={T.cta} size={58}><span style={{color: C.green}}>LE PLUG ?</span> ÉCRIS-MOI EN DM</Big>
        </AbsoluteFill>
      ))}

      {!inOutro ? <PixelCaptions words={captions} /> : null}
      <Score n={4} pts={pts} current={t < T.s2 ? 0 : t < T.s3 ? 1 : t < T.s4 ? 2 : 3} at={T.compte + 0.4} />
      <Mascot pose={pose} since={since} floor={FLOOR} />
      <PixelWipe at={[T.s1, T.s2, T.s3, T.s4, T.score, T.s5]} />
      <CRT />
    </AbsoluteFill>
  );
};
