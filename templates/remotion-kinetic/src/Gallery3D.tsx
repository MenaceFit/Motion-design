// Planche de contrôle : toutes les icônes et scènes 3D sur une image (QC visuel rapide).
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Thing, ICON_NAMES, Crowd, Chart, Counter, Stairs} from './Scenes3D';

const P = {face: '#f6f0ff', side: '#5b2a86', accentFace: '#ff2e55', accentSide: '#2b0614', light: '#ffd9a8'};

export const Gallery3D: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const t = 1.3 + f / fps;
  const items = [...ICON_NAMES, '€', '?', 'emoji:🧠'];
  const cols = 4;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#2a0b2e,#07020a)'}}>
      <ThreeCanvas width={width} height={height} camera={{fov: 40, position: [0, -6, 26]}} gl={{antialias: true}}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 4, 6]} intensity={2.4} color="#ffd9a8" />
        <directionalLight position={[-4, -2, -3]} intensity={1.6} color="#ff2e55" />
        {items.map((n, i) => (
          <group key={n} position={[((i % cols) - 1.5) * 2.7, 6.5 - Math.floor(i / cols) * 2.6, 0]} scale={0.8} rotation={[0.1, 0.35, 0]}>
            <Thing name={n} t={t} c={['coin', 'coins', 'trophy', 'crown', 'star'].includes(n) ? '#ffc94a' : P.accentFace} c2={P.face} />
          </group>
        ))}
        <group position={[-3.2, -9.2, 0]} scale={0.9}><Crowd s={{type: 'crowd', start: 0, end: 3, action: 'jump', count: 5}} t={t} p={P} /></group>
        <group position={[3.2, -8.6, 0]} scale={0.8}><Chart s={{type: 'chart', start: 0, end: 3, trend: 'exp'}} t={t + 2} p={P} /></group>
        <group position={[-3, -11.6, 0]} scale={0.8}><Stairs s={{type: 'stairs', start: 0, end: 3}} t={t + 1} p={P} /></group>
        <group position={[3.2, -11, 0]} scale={0.7}><Counter s={{type: 'counter', start: 0, end: 3, from: 0, to: 702, suffix: ' J'}} t={t + 3} p={P} /></group>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
