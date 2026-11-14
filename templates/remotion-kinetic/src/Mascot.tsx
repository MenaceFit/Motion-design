// Mascotte pixel ORIGINALE « streetwear » (moodboard fourni par l'utilisateur : tech fleece gris clair,
// sacoche bandoulière monogrammée noire sangle rouge/verte, casquette noire à l'envers, TN noires).
// Ne représente aucune personne réelle. Sprite 20×27 px logiques, rendu en <rect> nets (crispEdges).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useT} from './LegitCheck';

// Look (moodboard utilisateur) : tech fleece gris clair capuche autour du cou + cordons, casquette noire
// à l'envers (ouverture de la sangle sur le front), jogging à poche zippée, chaussettes blanches, TN noires.
const HALF = ['......kkkk', '.....kcccc', '....kccccC', '....kccccc', '....kkkkhh', '....khssss', '....ksssss', '....ksskss', '....ksssss', '....kssssk', '.....kssss', '...klllllS', '..kllllllz', '..kggggzgz', '..kggggzgz', '..kggggggz', '..kgGGGggz', '..kGGGGGGG', '...kgggggg', '...kgggggk', '...kgggggk', '....kggggk', '....kGGGGk', '....kwwwwk', '...kffffk.', '..kffFFfk.', '..kkkkkkk.'];
const BODY = HALF.map((l) => l + l.split('').reverse().join(''));
export const COL: Record<string, string> = {
  k: '#0b0c10', h: '#140e0a', c: '#15171c', C: '#2f333b', s: '#9a6644', S: '#7b4e33', l: '#d6d9de', g: '#bfc3ca', G: '#9ea3ab',
  z: '#25282e', w: '#f2f2f2', f: '#1b1c20', F: '#5c6068', r: '#c4283a', n: '#1f6b3a', b: '#26282e', B: '#41444c', m: '#c9b27a'};

export type Pose = 'idle' | 'left' | 'right' | 'think' | 'cheer';
// bras [x, y, w, h, couleur] en pixels logiques du canevas (corps décalé de 4 colonnes)
const ARMS: Record<Pose, [number, number, number, number, string][]> = {
  idle: [[4, 13, 2, 6, 'g'], [4, 19, 2, 1, 's'], [22, 13, 2, 6, 'g'], [22, 19, 2, 1, 's']],
  left: [[0, 13, 6, 2, 'g'], [-1, 13, 1, 2, 's'], [22, 13, 2, 6, 'g'], [22, 19, 2, 1, 's']],
  right: [[4, 13, 2, 6, 'g'], [4, 19, 2, 1, 's'], [22, 13, 6, 2, 'g'], [28, 13, 1, 2, 's']],
  think: [[4, 13, 2, 6, 'g'], [4, 19, 2, 1, 's'], [19, 10, 2, 5, 'g'], [18, 9, 2, 1, 's']],
  cheer: [[3, 5, 2, 8, 'g'], [3, 4, 2, 1, 's'], [23, 5, 2, 8, 'g'], [23, 4, 2, 1, 's']],
};

// bandoulière (épaule gauche → hanche droite) + sacoche monogrammée, en cases du corps
const strap: [number, number, string][] = [];
for (let i = 0; i <= 10; i++) {
  const x = 4 + i, y = 12 + Math.round(i * 0.55);
  strap.push([x, y, 'r'], [x, y + 1, 'n']);
}
const bag: [number, number, string][] = [];
for (let y = 17; y <= 21; y++) for (let x = 12; x <= 18; x++) {
  const edge = y === 17 || y === 21 || x === 12 || x === 18;
  bag.push([x, y, edge ? 'k' : (x + y) % 3 === 0 ? 'B' : 'b']);
}
bag.push([15, 19, 'm']);                         // fermoir
const extra: [number, number, string][] = [[5, 19, 'z'], [5, 20, 'z'], [5, 21, 'z']];   // poche zippée du jogging

export const MascotSprite: React.FC<{pose: Pose; P?: number; blink?: boolean}> = ({pose, P = 14, blink = false}) => {
  const cells = new Map<string, string>();
  BODY.forEach((row, y) => row.split('').forEach((ch, x) => { if (ch !== '.') cells.set(`${x},${y}`, ch); }));
  if (blink) [[7, 7], [12, 7]].forEach(([x, y]) => cells.set(`${x},${y}`, 's'));
  [...extra, ...strap, ...bag].forEach(([x, y, c]) => cells.set(`${x},${y}`, c));
  const rects: React.ReactNode[] = [];
  ARMS[pose].forEach(([x, y, w, h], i) => rects.push(
    <rect key={`ao${i}`} x={x * P - 3} y={y * P - 3} width={w * P + 6} height={h * P + 6} fill={COL.k} />));
  cells.forEach((c, key) => { const [x, y] = key.split(',').map(Number);
    rects.push(<rect key={key} x={(x + 4) * P} y={y * P} width={P} height={P} fill={COL[c]} />); });
  ARMS[pose].forEach(([x, y, w, h, c], i) => rects.push(
    <rect key={`a${i}`} x={x * P} y={y * P} width={w * P} height={h * P} fill={COL[c]} />));
  // reflet sur la casquette
  rects.push(<rect key="hl" x={9 * P} y={1 * P} width={2 * P} height={P} fill="rgba(255,255,255,0.14)" />);
  rects.push(<rect key="clasp" x={13.5 * P} y={4 * P + 3} width={P} height={P - 6} fill="#9aa0a8" />);
  return (
    <svg width={30 * P} height={27 * P} viewBox={`${-1 * P} 0 ${30 * P} ${27 * P}`} shapeRendering="crispEdges" style={{overflow: 'visible'}}>{rects}</svg>
  );
};

// Mascotte animée posée sur le sol (respiration, clignement, rebond au changement de pose, « ? »).
export const Mascot: React.FC<{pose: Pose; since: number; floor: number; color?: string}> = ({pose, since, floor, color = '#ffd23f'}) => {
  const t = useT();
  const P = 14;
  const bob = Math.round(Math.sin(t * 5) * 1.5) * 3;
  const squash = 1 + 0.08 * Math.exp(-(t - since) * 12) * Math.sin((t - since) * 30);
  return (
    <div style={{position: 'absolute', left: 540 - 14 * P, top: floor - 27 * P + bob, transformOrigin: '50% 100%', transform: `scaleY(${squash})`}}>
      {pose === 'think' ? (
        <div style={{position: 'absolute', left: 23 * P, top: 4 + Math.sin(t * 6) * 6, fontFamily: 'Pixelify Sans', fontWeight: 700, fontSize: 64,
          color, textShadow: '0 4px 0 #000'}}>?</div>
      ) : null}
      <MascotSprite pose={pose} P={P} blink={(t % 3.1) < 0.12} />
      <div style={{position: 'absolute', left: 6 * P, top: 27 * P + 2, width: 18 * P, height: 14, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', filter: 'blur(4px)'}} />
    </div>
  );
};

// Planche d'aperçu des 5 poses (composition « MascotSheet »).
export const MascotSheet: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg, #0a1226, #04060e)', display: 'flex', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-around', padding: 40}}>
    {(['idle', 'left', 'right', 'think', 'cheer'] as Pose[]).map((p) => (
      <div key={p} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
        <MascotSprite pose={p} P={10} />
        <div style={{fontFamily: 'Pixelify Sans', fontSize: 34, color: '#cfe0ff'}}>{p}</div>
      </div>
    ))}
  </AbsoluteFill>
);
