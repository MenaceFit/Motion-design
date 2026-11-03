// Surimpression Lottie (animations After Effects/Bodymovin exportées en JSON), rendue image par
// image par @remotion/lottie (lottie-web piloté par la frame → déterministe).
// Ajouter une animation : déposer le .json dans src/lottie/ et l'ajouter au registre ci-dessous.
// LottieFiles : vérifier la licence de CHAQUE animation avant usage commercial.
import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {Lottie, LottieAnimationData} from '@remotion/lottie';
import check from './lottie/check.json';

const REGISTRY: Record<string, unknown> = {check};

export type LottieSpec = {name: string; start: number; end: number; x?: number; y?: number; size?: number};

export const LottieOverlay: React.FC<{spec: LottieSpec}> = ({spec}) => {
  const {width, height} = useVideoConfig();
  const size = (spec.size ?? 0.42) * width;
  const data = REGISTRY[spec.name];
  if (!data) return null;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', width: size, height: size, left: (spec.x ?? 0.5) * width - size / 2, top: (spec.y ?? 0.3) * height - size / 2,
        filter: 'drop-shadow(0 18px 28px rgba(0,0,0,0.45))'}}>
        <Lottie animationData={data as LottieAnimationData} loop={false} style={{width: '100%', height: '100%'}} />
      </div>
    </AbsoluteFill>
  );
};
