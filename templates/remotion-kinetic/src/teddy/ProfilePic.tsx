// Photo de profil TikTok du compte « J-30 : le glow up de Teddy ».
// Carré 1080×1080, tout l'essentiel dans le cercle central (TikTok recadre en rond, affichage ~200 px).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Teddy, Expression} from './Teddy';
import {C, INK} from './Sets';

export type ProfilePicProps = {expression: Expression; tilt: number; bg: 'violet' | 'night'};
export const profilePicDefaults: ProfilePicProps = {expression: 'smug', tilt: 5, bg: 'violet'};

const S = 2.3;                    // échelle du perso (repère 560×900)
const HEAD = {x: 280, y: 250};    // TEDDY_ANCHORS.head
const CX = 540, CY = 470;         // position de la tête dans l'image

export const ProfilePic: React.FC<ProfilePicProps> = ({expression, tilt, bg}) => {
  const base = bg === 'violet' ? ['#9B74FF', '#5A2FD6', '#2A1470'] : ['#3A2266', '#1B1030', '#0B0614'];
  const rays = 18;
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 44%, ${base[0]} 0%, ${base[1]} 48%, ${base[2]} 100%)`, overflow: 'hidden'}}>
      {/* rayons « sunburst » : lisibles même en miniature */}
      <svg width={1080} height={1080} style={{position: 'absolute', inset: 0, opacity: bg === 'violet' ? 0.22 : 0.16}}>
        {Array.from({length: rays}).map((_, i) => {
          const a0 = (i / rays) * Math.PI * 2, a1 = a0 + Math.PI / rays;
          const R = 1100;
          return <path key={i} d={`M${CX} ${CY} L${CX + Math.cos(a0) * R} ${CY + Math.sin(a0) * R} L${CX + Math.cos(a1) * R} ${CY + Math.sin(a1) * R} Z`} fill={C.gold} />;
        })}
      </svg>
      {/* halo doré derrière la tête */}
      <div style={{position: 'absolute', left: CX - 330, top: CY - 330, width: 660, height: 660, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.gold}66 0%, ${C.gold}00 70%)`}} />
      {/* Teddy en buste */}
      <div style={{position: 'absolute', left: CX - HEAD.x * S, top: CY - HEAD.y * S, width: 560 * S, height: 900 * S}}>
        <Teddy t={1.3} expression={expression} headTilt={tilt} showCloud={false} showFly armL={0} armR={0} />
      </div>
      {/* pastille J-30 */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 838, display: 'flex', justifyContent: 'center'}}>
        <div style={{background: C.red, border: `10px solid ${INK}`, borderRadius: 28, padding: '0 38px', transform: 'rotate(-4deg)',
          boxShadow: `0 12px 0 ${INK}`}}>
          <div style={{fontFamily: 'Anton', fontSize: 132, lineHeight: 1.12, color: C.cream, WebkitTextStroke: `8px ${INK}`, paintOrder: 'stroke fill', letterSpacing: 2}}>J-30</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
