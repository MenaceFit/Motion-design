/**
 * Photo de profil de la chaîne (1080×1080, lisible en rond de ~110 px dans TikTok).
 * Design original : aucun logo, police ou visuel Rockstar. Couleurs = charte des vidéos GtaGuide.
 *   variant "dpad"  : croix directionnelle jaune avec « $ » au centre (= codes de triche), anneau néon
 *   variant "mono"  : monogramme condensé italique sur coucher de soleil rayé façon « Miami »
 *   variant "tag"   : étiquette jaune inclinée, comme l'accroche des vidéos
 */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import '@fontsource/anton/400.css';
import '@fontsource/montserrat/900.css';

const Y = '#FFD23F', PINK = '#FF3D9A', CYAN = '#3DE8FF', INK = '#0b0710';
export type AvatarProps = {variant: 'dpad' | 'mono' | 'tag'; mono?: string; line1?: string; line2?: string};

const Bg: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 38%, #4a1a6b 0%, #24103a 45%, #0b0710 100%)'}}>
    {/* soleil rayé (motif « synthwave » générique) */}
    <div style={{position: 'absolute', left: 190, top: 120, width: 700, height: 700, borderRadius: '50%',
      background: `linear-gradient(180deg, ${Y} 0%, #FF8A3D 45%, ${PINK} 100%)`, opacity: 0.9,
      WebkitMaskImage: 'repeating-linear-gradient(180deg, black 0 46px, transparent 46px 62px)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 640, bottom: 0,
      background: 'linear-gradient(180deg, rgba(11,7,16,0) 0%, #0b0710 55%)'}} />
    {/* grille de sol */}
    <div style={{position: 'absolute', left: -200, right: -200, top: 700, height: 500, transform: 'perspective(500px) rotateX(62deg)',
      backgroundImage: `linear-gradient(${CYAN}66 2px, transparent 2px), linear-gradient(90deg, ${CYAN}66 2px, transparent 2px)`,
      backgroundSize: '90px 90px', opacity: 0.55}} />
  </AbsoluteFill>
);

const Ring: React.FC = () => (
  <AbsoluteFill style={{borderRadius: '50%', boxShadow: `inset 0 0 0 26px ${PINK}, inset 0 0 90px ${PINK}, inset 0 0 0 40px ${INK}`, opacity: 0.95}} />
);

const DPad: React.FC = () => {
  const arm = (rot: number) => (
    <div style={{position: 'absolute', left: 540 - 105, top: 540 - 330, width: 210, height: 300, borderRadius: 40, background: Y,
      transform: `rotate(${rot}deg)`, transformOrigin: '105px 330px', boxShadow: `0 14px 0 #b8860b`}}>
      <svg width={210} height={120} viewBox="0 0 210 120" style={{position: 'absolute', top: 26}}>
        <path d="M105 18 L160 88 H50 Z" fill={INK} opacity={0.85} />
      </svg>
    </div>
  );
  return (
    <AbsoluteFill>
      <Bg />
      <AbsoluteFill style={{filter: `drop-shadow(0 0 40px ${Y}aa) drop-shadow(0 20px 30px rgba(0,0,0,0.6))`}}>
        {arm(0)}{arm(90)}{arm(180)}{arm(270)}
        <div style={{position: 'absolute', left: 540 - 105, top: 540 - 105, width: 210, height: 210, background: Y}} />
        <div style={{position: 'absolute', left: 540 - 120, top: 540 - 128, width: 240, height: 240, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontFamily: 'Montserrat', fontWeight: 900, fontSize: 230, color: '#1b9e55',
          WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill'}}>$</div>
      </AbsoluteFill>
      <Ring />
    </AbsoluteFill>
  );
};

const Mono: React.FC<{mono: string}> = ({mono}) => (
  <AbsoluteFill>
    <Bg />
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: 'Anton', fontSize: 560, lineHeight: 1, color: Y, transform: 'skewX(-10deg) translateY(10px)', letterSpacing: -6,
        WebkitTextStroke: `22px ${INK}`, paintOrder: 'stroke fill',
        textShadow: `0 22px 0 ${INK}, 0 0 80px ${PINK}, 0 0 140px ${PINK}88`}}>{mono}</div>
    </AbsoluteFill>
    <Ring />
  </AbsoluteFill>
);

const Tag: React.FC<{l1: string; l2: string}> = ({l1, l2}) => (
  <AbsoluteFill>
    <Bg />
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: 'rotate(-7deg)'}}>
      <div style={{background: Y, padding: '6px 46px 0', borderRadius: 28, boxShadow: `0 18px 0 ${INK}, 0 0 90px ${Y}88`}}>
        <div style={{fontFamily: 'Anton', fontSize: 270, lineHeight: 1.02, color: INK, transform: 'skewX(-9deg)', textAlign: 'center'}}>{l1}</div>
      </div>
      <div style={{fontFamily: 'Anton', fontSize: 210, lineHeight: 1.1, color: '#fff', transform: 'skewX(-9deg)', marginTop: 28,
        WebkitTextStroke: `16px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 0 60px ${CYAN}`}}>{l2}</div>
    </AbsoluteFill>
    <Ring />
  </AbsoluteFill>
);

export const ChannelAvatar: React.FC<AvatarProps> = ({variant, mono = 'VC', line1 = 'VICE', line2 = 'CODES'}) =>
  variant === 'dpad' ? <DPad /> : variant === 'mono' ? <Mono mono={mono} /> : <Tag l1={line1} l2={line2} />;
