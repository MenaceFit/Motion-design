// Planche de contrôle du rig : expressions, poses, niveaux + HUD, sous-titre, annotation, badge.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Teddy, Expression} from './Teddy';
import {Grotte, Hud, PunchCaptions, RankBadge, Invitation, C} from './Sets';

const cells: {e: Expression; armL?: number; armR?: number; tilt?: number; level?: 1 | 5; label: string; hold?: boolean}[] = [
  {e: 'neutral', label: 'neutral'}, {e: 'happy', armR: -160, label: 'happy + bras levé'}, {e: 'shock', label: 'shock'},
  {e: 'sad', tilt: -8, label: 'sad'}, {e: 'panic', armL: 40, armR: -40, label: 'panic'}, {e: 'proud', armL: -50, armR: 50, hold: true, label: 'tient le faire-part'},
  {e: 'smug', tilt: 6, label: 'smug'}, {e: 'wink', label: 'wink'}, {e: 'happy', level: 5, label: 'NIV. 5'},
];

export const RigTest: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps + 1;
  return (
    <AbsoluteFill style={{background: '#111'}}>
      <AbsoluteFill><Grotte t={t} /></AbsoluteFill>
      <Hud day={30} glow={0} level={1} t={t} slamAt={0} />
      {cells.map((c, i) => (
        <div key={i} style={{position: 'absolute', left: (i % 3) * 360, top: 300 + Math.floor(i / 3) * 470, width: 360, height: 470}}>
          <Teddy t={t + i} expression={c.e} armL={c.armL ?? 0} armR={c.armR ?? 0} headTilt={c.tilt ?? 0} level={c.level ?? 1}
            holding={c.hold ? <foreignObject x={180} y={470} width={200} height={276}><Invitation w={200} /></foreignObject> : undefined} />
          <div style={{position: 'absolute', bottom: 0, width: '100%', textAlign: 'center', color: '#fff', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 24}}>{c.label}</div>
        </div>
      ))}
      <div style={{position: 'absolute', right: 30, top: 230}}><RankBadge kind="diamant" t={1} size={160} /></div>
      <PunchCaptions caps={[{text: 'UN TOCARD', start: 0, end: 5, color: C.red}]} y={0.955} />
    </AbsoluteFill>
  );
};
