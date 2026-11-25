// Événements audio d'un plan « Stickman Spotlight » (temps exacts des appuis de pied, allumages…).
// Usage : node --experimental-strip-types scripts/stickman_events.ts plan.json > events.json
import {readFileSync} from 'node:fs';
import {audioEvents} from '../src/stickman/engine.ts';

const plan = JSON.parse(readFileSync(process.argv[2], 'utf8'));
process.stdout.write(JSON.stringify(audioEvents(plan), null, 1));
