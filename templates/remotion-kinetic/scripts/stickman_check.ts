// Contrôle numérique du moteur Stickman : glisse des pieds au sol, pénétration, cadence des pas.
// Usage : node --experimental-strip-types --no-warnings scripts/stickman_check.ts [plan.json]
// Critères : glisse max ≤ 1 px/frame (60 fps), pénétration = 0.
import {readFileSync} from 'node:fs';
import {buildTrack, charAt, RIG} from '../src/stickman/engine.ts';

const plan = process.argv[2] ? JSON.parse(readFileSync(process.argv[2], 'utf8')) : {scenes: [
  {label: 'A', set: 'office', duration: 3, motion: 'walk', prop: 'folder'},
  {label: 'B', set: 'rain', duration: 3, motion: 'sad', beats: [{at: 1.5, motion: 'idle', arms: 'phone'}]},
  {label: 'C', set: 'gym', duration: 2.5, motion: 'run'},
]};
const tr = buildTrack(plan);
let slide = 0, pen = 0;
const prev: Record<string, number | undefined> = {};
for (let f = 0; f < tr.total * 60; f++) {
  const c = charAt(plan, f / 60);
  const pts = {Nh: c.skel.legN.heel, Nt: c.skel.legN.toe, Fh: c.skel.legF.heel, Ft: c.skel.legF.toe};
  for (const [k, p] of Object.entries(pts)) {
    const above = -(c.hipY + p.y + RIG.SOLE);
    if (above < -0.01) pen = Math.max(pen, -above);
    const wx = c.worldX + p.x * Math.sign(c.facing || 1);
    if (above < 0.5 && prev[k] !== undefined) slide = Math.max(slide, Math.abs(wx - prev[k]!));
    prev[k] = above < 0.5 ? wx : undefined;
  }
}
const gaps = tr.steps.slice(1).map((s, i) => s.t - tr.steps[i].t);
console.log(`durée ${tr.total}s · ${tr.steps.length} pas · écart min entre pas ${Math.min(...gaps).toFixed(3)}s`);
console.log(`glisse max ${slide.toFixed(3)} px/frame · pénétration max ${pen.toFixed(3)} px`);
process.exit(slide <= 1 && pen === 0 ? 0 : 1);
