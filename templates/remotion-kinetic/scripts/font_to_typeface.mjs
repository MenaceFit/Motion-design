// Convertit une police WOFF/TTF/OTF en typeface JSON pour THREE.TextGeometry.
// Usage : node scripts/font_to_typeface.mjs in.woff out.json
import fs from 'node:fs';
import {TTFLoader} from 'three/examples/jsm/loaders/TTFLoader.js';
const [, , input, output] = process.argv;
const buf = fs.readFileSync(input);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const json = new TTFLoader().parse(ab);
fs.writeFileSync(output, JSON.stringify(json));
console.log(output, Object.keys(json.glyphs).length, 'glyphes', 'é' in json.glyphs ? '(accents OK)' : '(SANS accents)');
