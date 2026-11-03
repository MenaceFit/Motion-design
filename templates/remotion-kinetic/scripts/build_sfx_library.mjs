// Construit la bibliothèque SFX unifiée : public/sfxlib/<source>/<nom>.wav + catalog.json
// Sources (toutes utilisables commercialement, hors ligne) :
//   uisfx  (npm, audio CC0)      : 78 sons d'interface × styles choisis
//   jsfxr  (npm, MIT, générateur): bruitages rétro (pièce, power-up, laser, explosion, saut, blip)
//   zzfx   (npm, MIT, générateur): micro-sons designés (pop, tick, swoosh, impact…)
// Les sons générés sont déterministes (PRNG à graine) → re-génération identique.
// Usage : node scripts/build_sfx_library.mjs [styles=cinematic,glass,studio,soft]
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);

const OUT = path.resolve('public/sfxlib');
const styles = (process.argv[2] ?? 'cinematic,glass,studio,soft').split(',');
const catalog = [];
fs.mkdirSync(OUT, {recursive: true});

// PRNG déterministe (mulberry32) pour jsfxr/zzfx qui utilisent Math.random
const seeded = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

const writeWav = (file, samples, sr) => {
  const n = samples.length, buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(sr, 24);
  buf.writeUInt32LE(sr * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(samples[i] * 32767))), 44 + i * 2);
  fs.writeFileSync(file, buf);
};
const toWav48 = (src, dst, gainDb = 0) => execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-ac', '1', '-ar', '48000', ...(gainDb ? ['-af', `volume=${gainDb}dB`] : []), dst]);

// 1) uisfx (CC0)
const uiRoot = path.resolve('node_modules/uisfx');
const manifest = JSON.parse(fs.readFileSync(path.join(uiRoot, 'manifest.json'), 'utf8'));
const cueCat = {};
for (const c of manifest.cues ?? []) cueCat[c.id ?? c.name] = c.category;
for (const st of styles) {
  const dir = path.join(uiRoot, 'sounds', st);
  if (!fs.existsSync(dir)) continue;
  fs.mkdirSync(path.join(OUT, 'uisfx', st), {recursive: true});
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.mp3'))) {
    const name = f.replace('.mp3', '');
    const dst = path.join(OUT, 'uisfx', st, name + '.wav');
    if (!fs.existsSync(dst)) toWav48(path.join(dir, f), dst);
    catalog.push({id: `uisfx/${st}/${name}`, file: `sfxlib/uisfx/${st}/${name}.wav`, source: 'uisfx', style: st, cue: name, category: cueCat[name] ?? null, license: 'CC0-1.0'});
  }
}

// 2) jsfxr (rétro, MIT) — 3 variantes par preset
const {sfxr, Params} = require('jsfxr');
fs.mkdirSync(path.join(OUT, 'jsfxr'), {recursive: true});
const presets = ['pickupCoin', 'powerUp', 'laserShoot', 'explosion', 'hitHurt', 'jump', 'blipSelect', 'click'];
for (const pr of presets) for (let v = 1; v <= 3; v++) {
  const orig = Math.random; Math.random = seeded(pr.length * 1000 + v);
  try {
    const p = new Params(); p[pr]();
    p.sample_rate = 44100; p.sample_size = 16;
    const wave = sfxr.toWave(p);           // RIFFWAVE : wave.wav = octets WAV
    const tmp = path.join(OUT, 'jsfxr', `_${pr}_${v}.wav`);
    fs.writeFileSync(tmp, Buffer.from(wave.wav));
    const dst = path.join(OUT, 'jsfxr', `${pr}_${v}.wav`);
    toWav48(tmp, dst, -6); fs.unlinkSync(tmp);  // générateurs à 0 dBFS → -6 dB
    catalog.push({id: `jsfxr/${pr}_${v}`, file: `sfxlib/jsfxr/${pr}_${v}.wav`, source: 'jsfxr', cue: pr, license: 'généré (jsfxr MIT)'});
  } finally { Math.random = orig; }
}

// 3) zzfx (micro-sons designés, MIT) — paramètres choisis à la main
globalThis.AudioContext = class { constructor() { this.sampleRate = 44100; } };
const {ZZFX} = await import(path.resolve('node_modules/zzfx/ZzFX.js'));
const zz = {
  pop:      [1.2, 0, 540, .005, .02, .06, 0, 1.6, 0, 0, 0, 0, 0, 0, 0, 0, 0, .8, .02],
  tick:     [.9, 0, 1600, 0, .006, .02, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, .5, .005],
  swoosh:   [1, .1, 120, .08, .12, .2, 4, 0, 6, 0, 0, 0, 0, .3, 0, 0, .1, .5, .1],
  impact:   [1.6, .05, 70, .002, .1, .45, 1, 2.2, -3, 0, 0, 0, 0, .6, 0, .2, .04, .7, .05],
  sparkle:  [.7, 0, 1800, .01, .1, .35, 0, 1.4, 0, 0, 640, .06, .07, 0, 0, 0, 0, .6, .04],
  notify:   [.9, 0, 880, .01, .08, .18, 0, 1.2, 0, 0, 440, .08, 0, 0, 0, 0, 0, .7, .03],
  error:    [1, 0, 180, .01, .12, .15, 2, 1.5, 0, 0, -60, .08, 0, 0, 0, 0, 0, .7, .03],
  rise:     [.8, 0, 200, .4, .3, .1, 0, 1, 8, 0, 0, 0, 0, 0, 0, 0, 0, .6, .05],
};
fs.mkdirSync(path.join(OUT, 'zzfx'), {recursive: true});
for (const [name, prm] of Object.entries(zz)) {
  const orig = Math.random; Math.random = seeded(name.length * 77);
  try {
    const s = ZZFX.buildSamples(...prm);
    const tmp = path.join(OUT, 'zzfx', `_${name}.wav`);
    writeWav(tmp, s, 44100);
    toWav48(tmp, path.join(OUT, 'zzfx', `${name}.wav`), -6); fs.unlinkSync(tmp);
    catalog.push({id: `zzfx/${name}`, file: `sfxlib/zzfx/${name}.wav`, source: 'zzfx', cue: name, license: 'généré (ZzFX MIT)'});
  } finally { Math.random = orig; }
}

fs.writeFileSync(path.join(OUT, 'catalog.json'), JSON.stringify({generated: new Date().toISOString(), count: catalog.length, sounds: catalog}, null, 1));
console.log(`bibliothèque SFX : ${catalog.length} sons → ${OUT}`);
