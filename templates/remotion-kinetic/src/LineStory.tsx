import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing, spring} from 'remotion';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';

export type LineStoryProps = {caption: {text: string; start: number}[]; label: string};
export const lineStoryDefaults: LineStoryProps = {
  label: 'OBJECTIF',
  caption: [
    {text: 'Chaque', start: 0.3}, {text: 'pas', start: 0.6}, {text: 'compte,', start: 0.85},
    {text: 'même', start: 1.6}, {text: 'quand', start: 1.9}, {text: 'personne', start: 2.2}, {text: 'ne', start: 2.6}, {text: 'regarde.', start: 2.8},
  ],
};

const EO = Easing.bezier(0.16, 1, 0.3, 1); // easeOutExpo-like

export const LineStory: React.FC<LineStoryProps> = ({caption, label}) => {
  const f = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = f / fps;
  // Ligne de sol puis pente qui se « dessine » (stroke-dashoffset)
  const ground = height * 0.62;
  const slopeLen = 900;
  const draw = interpolate(f, [8, 38], [slopeLen, 0], {easing: EO, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const flagIn = spring({frame: f - 36, fps, config: {damping: 12, stiffness: 180}});
  // Personnage : avance par petits pas (step function lissée)
  const steps = Math.min(8, Math.max(0, (f - 30) / 10));
  const k = Math.floor(steps) + EO(steps % 1);
  const px = 140 + k * 70;
  const py = ground - Math.max(0, px - 300) * 0.75;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1.5px, transparent 1.5px)', backgroundSize: '36px 36px'}} />
      <svg width={width} height={height} style={{position: 'absolute'}}>
        <line x1={0} y1={ground} x2={300} y2={ground} stroke="#fff" strokeWidth={4} />
        <path d={`M300 ${ground} L${300 + 600} ${ground - 450}`} stroke="#fff" strokeWidth={4} fill="none"
          strokeDasharray={slopeLen} strokeDashoffset={draw} />
        <g transform={`translate(900 ${ground - 450}) scale(${flagIn})`}>
          <line x1={0} y1={0} x2={0} y2={-70} stroke="#fff" strokeWidth={4} />
          <path d="M0 -70 L48 -56 L0 -42 Z" fill="none" stroke="#fff" strokeWidth={4} />
        </g>
        <text x={900} y={ground - 560} fill="#fff" fontFamily="Inter" fontWeight={600} fontSize={26} letterSpacing={10}
          textAnchor="middle" opacity={flagIn}>{label}</text>
        <g transform={`translate(${px} ${py})`}>
          <circle cx={0} cy={-78} r={16} fill="#fff" />
          <path d="M-22 0 L-22 -30 Q-22 -56 0 -56 Q22 -56 22 -30 L22 0 Z" fill="#fff" />
        </g>
      </svg>
      {/* Sous-titres mot à mot : apparition opacity 0.25 → 1 au moment exact du mot */}
      <div style={{position: 'absolute', top: height * 0.74, width: '100%', textAlign: 'center', padding: '0 90px',
        fontFamily: 'Inter', fontWeight: 600, fontSize: 52, lineHeight: 1.3, color: '#fff'}}>
        {caption.map((w, i) => {
          const o = interpolate(t, [w.start - 0.02, w.start + 0.12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return <span key={i} style={{opacity: o, textShadow: '0 0 18px rgba(255,255,255,0.35)'}}>{w.text} </span>;
        })}
      </div>
    </AbsoluteFill>
  );
};
