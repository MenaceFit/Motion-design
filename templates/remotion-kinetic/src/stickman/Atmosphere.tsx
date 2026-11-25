/*
 * Atmosphère du style « Stickman Spotlight » : faisceau de projecteur (cône chaud), flaque de lumière
 * pointillée au sol, poussières dans le faisceau, pluie (plus brillante dans le faisceau, arrêtée par
 * le parapluie), étiquette de lieu en petites capitales espacées, cadre « carte », légende mot à mot.
 */
import React from 'react';
import {clamp, rnd, smooth, wobble} from './engine';

export type Cone = {cx: number; topY: number; topW: number; floorY: number; botW: number};
export const conePoints = (c: Cone) =>
  `${c.cx - c.topW / 2},${c.topY} ${c.cx + c.topW / 2},${c.topY} ${c.cx + c.botW / 2},${c.floorY} ${c.cx - c.botW / 2},${c.floorY}`;

/** intensité du projecteur : clignotement de néon à l'allumage, baisse avant la scène suivante */
export const lightLevel = (tIn: number, tOut: number) => {
  // tIn : s depuis le début de scène ; tOut : s avant la fin
  const keys: [number, number][] = [[0, 0.22], [0.05, 1], [0.1, 0.3], [0.17, 0.95], [0.24, 0.55], [0.34, 1]];
  let v = 1;
  if (tIn < 0.34) {
    for (let i = 0; i < keys.length - 1; i++) {
      const [a, va] = keys[i], [b, vb] = keys[i + 1];
      if (tIn >= a && tIn <= b) v = va + (vb - va) * smooth((tIn - a) / (b - a));
    }
  }
  const out = tOut < 0.4 ? 0.22 + 0.78 * smooth(tOut / 0.4) : 1;
  return Math.min(v, out);
};

export const Spotlight: React.FC<{c: Cone; level: number; color: string; uid: string; t: number}> = ({c, level, color, uid, t}) => {
  const hum = 1 + wobble(t * 7, 11) * 0.025; // très léger vacillement de lampe
  const L = level * hum;
  const inner: Cone = {...c, topW: c.topW * 0.55, botW: c.botW * 0.5};
  return (
    <g style={{mixBlendMode: 'screen'}}>
      <defs>
        <linearGradient id={`${uid}-cone`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity={0.55} />
          <stop offset="0.55" stopColor={color} stopOpacity={0.22} />
          <stop offset="1" stopColor={color} stopOpacity={0.12} />
        </linearGradient>
        <filter id={`${uid}-soft`} x="-30%" y="-10%" width="160%" height="120%"><feGaussianBlur stdDeviation={14} /></filter>
        <radialGradient id={`${uid}-pool`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={color} stopOpacity={0.55} />
          <stop offset="0.6" stopColor={color} stopOpacity={0.18} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <polygon points={conePoints(c)} fill={`url(#${uid}-cone)`} filter={`url(#${uid}-soft)`} opacity={L * 0.85} />
      <polygon points={conePoints(inner)} fill={`url(#${uid}-cone)`} filter={`url(#${uid}-soft)`} opacity={L * 0.35} />
      {/* source : petit trait lumineux en haut du cône */}
      <rect x={c.cx - c.topW / 2} y={c.topY - 3} width={c.topW} height={6} rx={3} fill={color} opacity={L * 0.9} filter={`url(#${uid}-soft)`} />
      <ellipse cx={c.cx} cy={c.floorY} rx={c.botW * 0.62} ry={70} fill={`url(#${uid}-pool)`} opacity={L} />
    </g>
  );
};

/** flaque pointillée au sol (sous les pieds) */
export const FloorPool: React.FC<{cx: number; floorY: number; level: number; color: string; t: number}> = ({cx, floorY, level, color, t}) => (
  <g opacity={0.35 + 0.65 * level}>
    <ellipse cx={cx} cy={floorY + 4} rx={250} ry={34} fill="none" stroke={color} strokeWidth={4.5} strokeDasharray="0 11" strokeLinecap="round"
      strokeDashoffset={-t * 6} opacity={0.95} />
    <ellipse cx={cx} cy={floorY + 4} rx={170} ry={20} fill="none" stroke={color} strokeWidth={2.5} opacity={0.6} />
  </g>
);

/** poussières qui flottent dans le faisceau (visibles seulement dedans) */
export const Dust: React.FC<{c: Cone; level: number; t: number; uid: string; n?: number}> = ({c, level, t, uid, n = 46}) => (
  <g clipPath={`url(#${uid}-coneclip)`} opacity={level}>
    <defs><clipPath id={`${uid}-coneclip`}><polygon points={conePoints(c)} /></clipPath></defs>
    {Array.from({length: n}, (_, i) => {
      const H = c.floorY - c.topY;
      const sp = 14 + rnd(i, 1) * 26;
      const y = c.floorY - ((rnd(i, 2) * H + t * sp) % H);
      const x = c.cx + (rnd(i, 3) - 0.5) * c.botW * 0.9 + wobble(t * 0.6 + i, i) * 22;
      const tw = 0.35 + 0.65 * Math.max(0, Math.sin(t * (1 + rnd(i, 4) * 2) + i));
      return <circle key={i} cx={x} cy={y} r={1.2 + rnd(i, 5) * 2.2} fill="#fff3d0" opacity={tw * 0.55} />;
    })}
  </g>
);

export type Shield = {x0: number; x1: number; y: number} | null;

/** pluie : traînées obliques ; `lit` = version dans le faisceau (plus lumineuse, teintée) */
export const Rain: React.FC<{t: number; amount: number; width: number; height: number; floorY: number; shield: Shield; uid: string; c: Cone; light: string; level: number}> = ({t, amount, width, height, floorY, shield, uid, c, light, level}) => {
  if (amount <= 0.01) return null;
  const n = 150, ang = 0.2; // pente : la pluie tombe vers la gauche
  const drops = Array.from({length: n}, (_, i) => {
    const speed = 2100 + rnd(i, 7) * 900, len = 55 + rnd(i, 8) * 70;
    const span = floorY + 140;
    const y = ((rnd(i, 9) * span + t * speed) % span) - 120;
    const x = rnd(i, 10) * (width + 400) - 100 - (y + 120) * ang;
    const z = rnd(i, 11);
    return {x, y, len, z};
  }).filter((d) => !(shield && d.x > shield.x0 && d.x < shield.x1 && d.y > shield.y));
  const lines = (op: number, col: string) => drops.map((d, i) => (
    <line key={i} x1={d.x} y1={d.y} x2={d.x + d.len * ang} y2={d.y - d.len} stroke={col} strokeWidth={1.4 + d.z * 1.6}
      strokeOpacity={op * (0.35 + d.z * 0.65)} strokeLinecap="round" />
  ));
  const splashes = Array.from({length: 26}, (_, i) => {
    const per = 0.45 + rnd(i, 12) * 0.5, ph = ((t + rnd(i, 13) * per) % per) / per;
    const x = rnd(i, 14) * width;
    if (shield && x > shield.x0 && x < shield.x1) return null;
    return <ellipse key={i} cx={x} cy={floorY + 4 + rnd(i, 15) * 60} rx={4 + ph * 18} ry={1.5 + ph * 4} fill="none" stroke="#d8d8d8"
      strokeWidth={2} strokeDasharray="0 6" strokeLinecap="round" opacity={(1 - ph) * 0.5} />;
  });
  return (
    <g opacity={amount}>
      <g>{lines(0.32, '#cfcfcf')}</g>
      <g clipPath={`url(#${uid}-rainclip)`} opacity={level}>
        <defs><clipPath id={`${uid}-rainclip`}><polygon points={conePoints(c)} /></clipPath></defs>
        {lines(0.9, light)}
      </g>
      {splashes}
    </g>
  );
};

/** étiquette de lieu : pastille sombre, petites capitales très espacées, lettres en cascade */
export const PlaceLabel: React.FC<{text: string; k: number; cx: number; y: number}> = ({text, k, cx, y}) => {
  if (k <= 0.001) return null;
  const letters = text.toUpperCase().split('');
  const fs = 30, track = 0.46 * fs, cw = fs * 0.72 + track;
  const w = letters.length * cw + 70;
  return (
    <g opacity={clamp(k * 1.5)}>
      <rect x={cx - w / 2} y={y - 30} width={w} height={60} rx={8} fill="#111111" stroke="#262626" strokeWidth={2} opacity={0.92} />
      {letters.map((ch, i) => {
        const kk = smooth(clamp(k * 1.8 - (i / letters.length) * 0.8));
        return (
          <text key={i} x={cx - (letters.length * cw) / 2 + i * cw + cw / 2 - track / 2} y={y + 11} textAnchor="middle" fontFamily="Montserrat" fontWeight={600}
            fontSize={fs} fill="#9d9d9d" opacity={kk} transform={`translate(0 ${(1 - kk) * 8})`}>{ch}</text>
        );
      })}
    </g>
  );
};

/** cadre arrondi façon « carte » + quelques étoiles au-dehors */
export const CardFrame: React.FC<{width: number; height: number; t: number}> = ({width, height, t}) => {
  const m = 30;
  return (
    <g>
      <path d={`M0 0 H${width} V${height} H0 Z M${m + 40} ${m} H${width - m - 40} Q${width - m} ${m} ${width - m} ${m + 40} V${height - m - 40} Q${width - m} ${height - m} ${width - m - 40} ${height - m} H${m + 40} Q${m} ${height - m} ${m} ${height - m - 40} V${m + 40} Q${m} ${m} ${m + 40} ${m} Z`}
        fill="#020202" fillRule="evenodd" />
      <rect x={m} y={m} width={width - 2 * m} height={height - 2 * m} rx={40} fill="none" stroke="#2c2c2c" strokeWidth={3} />
      {Array.from({length: 10}, (_, i) => (
        <circle key={i} cx={rnd(i, 21) < 0.5 ? rnd(i, 22) * m : width - rnd(i, 22) * m} cy={rnd(i, 23) * height} r={1.4}
          fill="#fff" opacity={0.25 + 0.4 * Math.max(0, Math.sin(t * 1.3 + i * 2))} />
      ))}
    </g>
  );
};

/** mots mis en valeur : *un mot* ou *plusieurs mots* (l'étoile peut suivre « ou précéder la ponctuation) */
export const highlightFlags = (words: string[]) => {
  let on = false;
  return words.map((w) => {
    const s = /^[«"(]*\*/.test(w), n = (w.match(/\*/g) || []).length;
    const e = /\*[.,!?…»"):;]*$/.test(w) && n >= (s ? 2 : 1);
    if (s) on = true;
    const f = on;
    if (e) on = false;
    return f;
  });
};

/** légende : mots révélés un à un (fondu + montée), *mot* en couleur de lumière */
export const Caption: React.FC<{text: string; t: number; dur: number; cx: number; y: number; light: string; width: number}> = ({text, t, dur, cx, y, light, width}) => {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  const per = Math.min(0.32, (dur * 0.55) / words.length);
  const start = 0.45;
  const out = clamp((dur - t) / 0.3);
  // mise en page fixe (pas de reflow) : lignes de ~22 caractères
  const lines: string[][] = [[]];
  let n = 0;
  words.forEach((w) => { if (n + w.length > 22 && lines[lines.length - 1].length) { lines.push([]); n = 0; } lines[lines.length - 1].push(w); n += w.length + 1; });
  const flags = highlightFlags(words);
  let idx = 0;
  return (
    <g opacity={out}>
      {lines.map((ln, li) => (
        <text key={li} x={cx} y={y + li * 70} textAnchor="middle" fontFamily="Montserrat" fontWeight={600} fontSize={52} style={{maxWidth: width}}>
          {ln.map((w, wi) => {
            const hi = flags[idx];
            const k = smooth(clamp((t - start - idx++ * per) / 0.22));
            const clean = w.replace(/\*/g, '');
            return (
              <tspan key={wi} fill={hi ? light : '#f2f2f2'} opacity={0.12 + 0.88 * k} dx={wi ? 14 : 0}>{clean}</tspan>
            );
          })}
        </text>
      ))}
    </g>
  );
};
