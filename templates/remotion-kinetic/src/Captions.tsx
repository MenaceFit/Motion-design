// Sous-titres « karaoké » : la phrase s'affiche par pages de ≤ 6 mots ; le mot prononcé est surligné
// (couleur d'accent + petit pop), les mots passés restent blancs, les mots à venir sont atténués.
// Rendu DOM (texte vectoriel net), contour sombre épais pour la lisibilité sur n'importe quel fond.
// Placement : bas de l'image mais AU-DESSUS de la zone d'interface TikTok/Reels (~25 % du bas).
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/montserrat/800.css';
import gsap from 'gsap';
const ELASTIC = gsap.parseEase('elastic.out(1.1, 0.5)');

export type CaptionWord = {text: string; start: number; end: number; line?: number; accent?: boolean};

const MAX_WORDS = 6, MAX_CHARS = 26;

const paginate = (words: CaptionWord[]) => {
  const pages: CaptionWord[][] = [];
  let cur: CaptionWord[] = [];
  for (const w of words) {
    const len = cur.reduce((a, x) => a + x.text.length + 1, 0) + w.text.length;
    const newLine = cur.length && w.line !== undefined && cur[cur.length - 1].line !== w.line;
    if (cur.length && (newLine || cur.length >= MAX_WORDS || len > MAX_CHARS)) { pages.push(cur); cur = []; }
    cur.push(w);
  }
  if (cur.length) pages.push(cur);
  return pages;
};

export const Captions: React.FC<{words: CaptionWord[]; accent: string}> = ({words, accent}) => {
  const f = useCurrentFrame();
  const {fps, height} = useVideoConfig();
  const t = f / fps;
  const pages = paginate(words);
  const idx = pages.findIndex((pg, i) => t >= pg[0].start - 0.02 && (i + 1 >= pages.length || t < pages[i + 1][0].start - 0.02));
  if (idx < 0) return null;
  const page = pages[idx];
  const pageIn = interpolate(t, [page[0].start - 0.02, page[0].start + 0.1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: height * 0.245}}>
      <div style={{width: '84%', textAlign: 'center', lineHeight: 1.18, opacity: pageIn, transform: `translateY(${(1 - pageIn) * 14}px)`,
        fontFamily: 'Montserrat', fontWeight: 800, fontSize: 60, textTransform: 'uppercase', letterSpacing: 0.5}}>
        {page.map((w, i) => {
          const active = t >= w.start && (i + 1 < page.length ? t < page[i + 1].start : t < w.end + 0.3);
          const past = !active && t >= w.start;
          const k = Math.min(1, Math.max(0, (t - w.start) / 0.35));
          const sc = active ? 1.2 - 0.14 * ELASTIC(k) : 1; // pop élastique GSAP : 1,20 → 1,06
          return (
            <span key={i} style={{display: 'inline-block', margin: '0 17px', transform: `scale(${sc})`,
              color: active ? accent : '#ffffff', opacity: active || past ? 1 : 0.42,
              WebkitTextStroke: '11px #0d0612', paintOrder: 'stroke fill',
              textShadow: '0 6px 0 #0d0612, 0 10px 24px rgba(0,0,0,0.55)'}}>{w.text}</span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
