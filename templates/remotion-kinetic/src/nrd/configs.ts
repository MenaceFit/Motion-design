// Configurations des vidéos legit-check (timings = début des mots, transcription Whisper de la voix fournie).
import type {Cfg} from './LegitCheck';

export const nrdCfg: Cfg = {
  dir: 'nrd', duration: 41.5, quizEnd: 29.9,
  words: [[0, 0.8], [1.12, 2.0], [2.08, 2.95], [3.04, 3.5], [3.78, 4.2], [4.62, 5.1], [5.48, 6.5], [6.66, 7.5], [7.6, 8.9],
    [9.34, 10.8], [11.08, 12.75], [13.06, 14.3], [14.54, 16.8], [16.98, 18.0], [18.3, 19.7], [19.98, 21.9], [22.12, 23.6],
    [23.88, 25.4], [25.6, 27.4], [27.56, 29.6], [30.86, 32.4], [32.7, 33.9], [34.1, 35.5], [35.7, 37.0], [37.54, 38.4],
    [38.82, 39.5], [39.84, 40.5]],
  intro: {q: 1.12, three: 2.08, counts: [3.04, 3.78, 4.62], celui: 5.48, reveal: 5.96, compte: 6.66},
  secs: [
    {n: 1, title: 'LA COULEUR', at: 7.6, end: 13.06, imgs: ['color_fake.jpg', 'color_auth.jpg'],
      fakeAt: 9.34, fakeCap: 'QUASI NOIR', realAt: 11.08, realCap: 'HAUT GRIS', plusAt: 12.4,
      fakeBox: [0.1, 0.12, 0.8, 0.5], realBox: [0.1, 0.12, 0.8, 0.5]},
    {n: 2, title: 'LE LOGO', at: 13.06, end: 18.3, imgs: ['logo_fake.jpg', 'logo_auth.jpg'],
      fakeAt: 17.25, fakeCap: 'LA COPIE', realAt: 16.98, realCap: 'BIEN PLACÉ', plusAt: 17.7,
      fakeBox: [0.12, 0.3, 0.76, 0.4], realBox: [0.12, 0.3, 0.76, 0.36],
      checklist: [['BIEN PLACÉ', 14.54], ['BIEN DROIT', 15.48], ['PAS TROP PETIT', 16.24]]},
    {n: 3, title: "L'ÉTIQUETTE", at: 18.3, end: 23.88, imgs: ['label_fake.jpg', 'label_auth.jpg'],
      fakeAt: 19.98, fakeMarkAt: 20.98, fakeCap: 'ÉCRITURE BLANCHE', realAt: 22.12, realCap: 'ÉCRITURE GRISE', plusAt: 23.16,
      fakeBox: [0.08, 0.3, 0.84, 0.42], realBox: [0.04, 0.72, 0.92, 0.16]},
    {n: 4, title: 'LES DAMIERS', at: 23.88, end: 30.3, imgs: ['grid_fake.jpg', 'grid_auth.jpg'],
      fakeAt: 27.56, fakeCap: 'APPROXIMATIF', realAt: 25.6, realCap: 'TRAITS PRÉCIS', plusAt: 28.9,
      fakeBox: [0.12, 0.08, 0.76, 0.6], realBox: [0.1, 0.06, 0.8, 0.5]},
  ],
  outro: {alors: 30.86, combien: 31.7, ecris: 32.7, moi: 34.1, p1At: 34.78, revend: 35.7, p2At: 36.5, benefAt: 37.54,
    plugAt: 38.82, dmAt: 39.84, p1: '50€', p2: '180€', benef: '+120€', img: 'full_auth.jpg'},
};

// Bas Nike Phenom Elite — voix « Roger » (ElevenLabs v4), 37,5 s
export const phenomCfg: Cfg = {
  dir: 'phenom', duration: 38.3, quizEnd: 27.25, fx: true,
  words: [[0, 0.74], [1.12, 2.06], [2.44, 3.16], [3.42, 3.68], [4.06, 4.64], [4.94, 5.6], [5.94, 6.72], [7.16, 7.8],
    [8.22, 9.56], [10.12, 12.28], [12.66, 14.56], [15.08, 16.86], [17.14, 17.92], [18.26, 19.6], [19.86, 21.14],
    [21.62, 23.0], [23.28, 25.1], [25.38, 26.98], [27.36, 28.34], [28.74, 29.94], [30.24, 31.54], [31.86, 33.26],
    [33.82, 35.4], [35.58, 36.06], [36.44, 37.14]],
  intro: {q: 1.12, three: 2.44, counts: [3.42, 4.06, 4.94], celui: 5.94, reveal: 6.5, compte: 7.16},
  secs: [
    {n: 1, title: 'LA MATIÈRE', at: 8.22, end: 15.08, imgs: ['mat_fake.jpg', 'mat_auth.jpg'],
      fakeAt: 10.12, fakeCap: 'LISSE, SANS DÉTAILS', realAt: 12.66, realCap: 'TEXTURE VISIBLE', plusAt: 14.3,
      fakeBox: [0.06, 0.06, 0.88, 0.5], realBox: [0.06, 0.3, 0.6, 0.45]},
    {n: 2, title: "L'ÉTIQUETTE", sub: 'DE TAILLE', at: 15.08, end: 21.62, imgs: ['label_fake.jpg', 'label_auth.jpg'],
      fakeAt: 17.14, fakeMarkAt: 18.26, fakeCap: 'ÉCRITURE BLANCHE', realAt: 19.86, realCap: 'ÉCRITURE GRISÉE', plusAt: 20.9,
      fakeBox: [0.12, 0.22, 0.76, 0.48], realBox: [0.1, 0.5, 0.8, 0.38]},
    {n: 3, title: 'LES LACETS', at: 21.62, end: 27.65, imgs: ['lace_fake.jpg', 'lace_auth.jpg'],
      fakeAt: 23.28, fakeCap: 'LETTRAGE FIN', realAt: 25.38, realCap: 'LETTRAGE ÉPAIS', plusAt: 26.6,
      fakeBox: [0.18, 0.08, 0.5, 0.72], realBox: [0.1, 0.08, 0.66, 0.72]},
  ],
  outro: {alors: 27.36, combien: 27.86, ecris: 28.74, moi: 30.24, p1At: 31.0, revend: 31.86, p2At: 32.8, benefAt: 33.82,
    plugAt: 35.58, dmAt: 36.44, p1: '12€', p2: '90€', benef: '+78€', img: 'outro_auth.jpg'},
};

// Nike Tech Fleece « kangourou » — voix Kevin (ElevenLabs v4), 37,5 s ; effets v2 + v3 (tampons, balayage)
export const techfleeceCfg: Cfg = {
  dir: 'techfleece', duration: 38.3, quizEnd: 27.75, fx: true, fx2: true,
  words: [[0, 0.82], [1.24, 2.16], [2.5, 3.42], [3.5, 3.8], [4.08, 4.66], [4.96, 5.6], [5.86, 6.58], [6.9, 7.54],
    [8.06, 9.26], [9.58, 11.92], [12.3, 14.14], [14.56, 16.42], [16.62, 18.22], [18.5, 19.78], [20.0, 21.72],
    [22.04, 23.52], [23.86, 24.64], [25.02, 25.36], [25.74, 27.36], [27.86, 28.8], [29.16, 30.36], [30.56, 31.84],
    [32.08, 33.62], [33.94, 35.2], [35.46, 35.94], [36.32, 36.94]],
  intro: {q: 1.24, three: 2.5, counts: [3.5, 4.08, 4.96], celui: 5.86, reveal: 6.32, compte: 6.9},
  secs: [
    {n: 1, title: 'LES POCHES', at: 8.06, end: 14.56, imgs: ['pocket_fake.jpg', 'pocket_auth.jpg'],
      fakeAt: 9.58, fakeCap: 'LISSES & PETITES', realAt: 12.3, realCap: 'ZIP BIEN VISIBLE', plusAt: 14.0,
      fakeBox: [0.05, 0.36, 0.9, 0.3], realBox: [0.02, 0.58, 0.96, 0.22], stampY: 0.08},
    {n: 2, title: 'LE LOGO', sub: 'DE MANCHE', at: 14.56, end: 22.04, imgs: ['logo_fake.jpg', 'logo_auth.jpg'],
      fakeAt: 16.62, fakeMarkAt: 18.5, fakeCap: 'BRILLANT & PETIT', realAt: 20.0, realCap: 'MAT & BIEN TAILLÉ', plusAt: 21.4,
      fakeBox: [0.06, 0.26, 0.88, 0.42], realBox: [0.1, 0.24, 0.82, 0.36], stampY: 0.72},
    {n: 3, title: "L'ÉTIQUETTE", sub: 'ROUGE', at: 22.04, end: 28.2, imgs: ['label_fake.jpg', 'label_auth.jpg'],
      fakeAt: 23.86, fakeMarkAt: 25.02, fakeCap: 'MADE IN CHINA', realAt: 25.74, realCap: 'MADE IN CAMBODIA', plusAt: 27.3,
      fakeBox: [0.14, 0.44, 0.72, 0.2], realBox: [0.14, 0.46, 0.72, 0.22], stampY: 0.74},
  ],
  outro: {alors: 27.86, combien: 28.34, ecris: 29.16, moi: 30.56, p1At: 31.34, revend: 32.08, p2At: 32.96, benefAt: 33.94,
    plugAt: 35.46, dmAt: 36.32, p1: '9€', p2: '85€', benef: '+76€', img: 'full_auth.jpg'},
};

// Zip Running Division vert — 1:1 = photo fournie, vrai = vidéo utilisateur ; voix Kevin v4, 38,3 s ; effets v2+v3+v4
export const divisionCfg: Cfg = {
  dir: 'division', duration: 39.1, quizEnd: 28.3, fx: true, fx2: true, fx3: true,
  words: [[0, 0.82], [1.28, 2.18], [2.52, 3.24], [3.48, 3.94], [4.06, 4.5], [4.92, 5.5], [5.66, 6.36], [6.76, 7.38],
    [7.76, 8.92], [9.48, 11.5], [11.8, 13.78], [14.26, 16.44], [16.96, 17.66], [18.06, 19.28], [19.54, 20.78],
    [21.14, 22.94], [23.18, 25.76], [26.0, 28.24], [28.44, 29.38], [29.7, 30.94], [31.14, 32.44], [32.7, 34.82],
    [35.22, 36.32], [36.56, 36.96], [37.3, 37.98]],
  intro: {q: 1.28, three: 2.52, counts: [3.48, 4.06, 4.92], celui: 5.66, reveal: 6.1, compte: 6.76},
  secs: [
    {n: 1, title: 'LA COULEUR', at: 7.76, end: 14.26, imgs: ['color_fake.jpg', 'color_auth.jpg'],
      fakeAt: 9.48, fakeCap: 'TERNE & GRISÂTRE', realAt: 11.8, realCap: 'VERT MENTHE VIF', plusAt: 13.6,
      fakeBox: [0.2, 0.3, 0.6, 0.4], realBox: [0.15, 0.3, 0.7, 0.4], stampY: 0.74, swatches: ['#91A69A', '#94D2C5']},
    {n: 2, title: "L'ÉCRITURE", sub: 'RUNNING DIVISION', at: 14.26, end: 21.14, imgs: ['writing_fake.jpg', 'writing_auth.jpg'],
      fakeAt: 16.96, fakeMarkAt: 18.06, fakeCap: 'ÉCRITURE BLANCHE', realAt: 19.54, realCap: 'ÉCRITURE GRISÉE', plusAt: 20.6,
      fakeBox: [0.25, 0.17, 0.5, 0.34], realBox: [0.08, 0.5, 0.76, 0.34], stampY: [0.72, 0.1]},
    {n: 3, title: 'LES DÉTAILS', sub: 'ARAIGNÉE', at: 21.14, end: 28.7, imgs: ['spider_fake.jpg', 'spider_auth.jpg'],
      fakeAt: 23.18, fakeMarkAt: 24.44, fakeCap: 'APPROXIMATIFS', realAt: 26.0, realCap: 'GRIS & BIEN TRACÉS', plusAt: 27.9,
      fakeBox: [0.1, 0.08, 0.8, 0.62], realBox: [0.08, 0.06, 0.84, 0.6], stampY: 0.76},
  ],
  outro: {alors: 28.44, combien: 28.92, ecris: 29.7, moi: 31.14, p1At: 31.9, revend: 32.7, p2At: 34.42, benefAt: 35.22,
    plugAt: 36.56, dmAt: 37.3, p1: '30€', p2: '110€', benef: '+80€', img: 'full_auth.jpg', rareAt: 32.94},
};

// Bas Under Armour hybrid — 1:1 = photos 4-6, vrai = photos 7-10 ; voix Kevin v4, 38,3 s ; effets v2+v3+v4
export const underarmourCfg: Cfg = {
  dir: 'underarmour', duration: 39.0, quizEnd: 28.45, fx: true, fx2: true, fx3: true,
  words: [[0, 0.78], [1.12, 2.1], [2.44, 3.18], [3.46, 3.94], [4.02, 4.6], [5.1, 5.4], [5.78, 6.56], [6.9, 7.54],
    [7.92, 9.56], [9.98, 11.84], [12.2, 14.1], [14.48, 15.72], [16.1, 17.78], [18.28, 19.52], [19.78, 21.54],
    [21.9, 23.2], [23.5, 26.0], [26.18, 28.54], [28.54, 29.78], [30.06, 31.24], [31.46, 32.76], [33.04, 34.38],
    [34.88, 35.92], [36.3, 36.72], [37.0, 37.74]],
  intro: {q: 1.12, three: 2.44, counts: [3.46, 4.02, 5.1], celui: 5.78, reveal: 6.36, compte: 6.9},
  secs: [
    {n: 1, title: 'LA MATIÈRE', sub: 'HYBRIDE', at: 7.92, end: 14.48, imgs: ['panel_fake.jpg', 'panel_auth.jpg'],
      fakeAt: 9.98, fakeCap: 'DEUX NOIRS', realAt: 12.2, realCap: 'MÊME NOIR PARTOUT', plusAt: 13.8,
      fakeBox: [0.05, 0.3, 0.9, 0.4], realBox: [0.05, 0.2, 0.9, 0.45], stampY: 0.78},
    {n: 2, title: 'LE LOGO', at: 14.48, end: 21.9, imgs: ['logo_fake.jpg', 'logo_auth.jpg'],
      fakeAt: 16.1, fakeMarkAt: 18.28, fakeCap: 'RÉFLÉCHISSANT', realAt: 19.78, realCap: 'GRIS & MAT', plusAt: 21.0,
      fakeBox: [0.15, 0.55, 0.55, 0.25], realBox: [0.28, 0.25, 0.42, 0.3], stampY: [0.12, 0.72]},
    {n: 3, title: 'LE DOS', at: 21.9, end: 28.85, imgs: ['back_fake.jpg', 'back_auth.jpg'],
      fakeAt: 23.5, fakeCap: 'MOLLETS BRILLANTS', realAt: 26.18, realCap: 'MAT & UNIFORME', plusAt: 27.95,
      fakeBox: [0.1, 0.5, 0.8, 0.32], realBox: [0.1, 0.5, 0.8, 0.32], stampY: 0.16},
  ],
  outro: {alors: 28.54, combien: 29.16, ecris: 30.06, moi: 31.46, p1At: 32.22, revend: 33.04, p2At: 33.94, benefAt: 34.88,
    plugAt: 36.3, dmAt: 37.0, p1: '30€', p2: '160€', benef: '+130€', img: 'full_auth.jpg'},
};

// Format « comment différencier » — Under Armour hybrid, voix Kevin v4 (33,1 s)
export const underarmourHowtoCfg: Cfg = {
  ...underarmourCfg, mode: 'howto', product: 'BAS UNDER ARMOUR HYBRID', duration: 34.0, quizEnd: 25.95,
  words: [[0, 4.12], [4.12, 4.74], [5.1, 6.68], [7.02, 9.4], [9.74, 11.7], [12.06, 13.2], [13.6, 15.28], [15.68, 16.86],
    [17.1, 18.92], [19.24, 20.46], [20.8, 23.54], [23.76, 26.1], [26.26, 27.78], [27.78, 29.4], [29.84, 31.06],
    [31.3, 31.76], [32.16, 32.76]],
  intro: {q: 0.96, three: 0, counts: [0, 0, 0], celui: 0, reveal: 2.6, compte: 4.12},
  secs: [
    {...underarmourCfg.secs[0], at: 5.1, end: 12.06, fakeAt: 7.02, realAt: 9.74, plusAt: 11.4},
    {...underarmourCfg.secs[1], at: 12.06, end: 19.24, fakeAt: 13.6, fakeMarkAt: 15.68, realAt: 17.1, plusAt: 18.5},
    {...underarmourCfg.secs[2], at: 19.24, end: 26.25, fakeAt: 20.8, realAt: 23.76, plusAt: 25.6},
  ],
  outro: {...underarmourCfg.outro, alors: 26.26, combien: 26.26, ecris: 26.26, moi: 26.26, p1At: 27.26, revend: 27.78, p2At: 28.88,
    benefAt: 29.84, plugAt: 31.3, dmAt: 32.16},
};

// Gilet Nike Therma-FIT ADV — authentique À GAUCHE ; vrai = photos 1-2, 1:1 = photos 3-4 ; voix Kevin v4, 37,8 s
export const thermavestCfg: Cfg = {
  dir: 'thermavest', duration: 38.5, quizEnd: 28.15, realLeft: true, fx: true, fx2: true, fx3: true,
  words: [[0, 0.8], [1.16, 2.22], [2.52, 3.16], [3.66, 4.1], [4.1, 4.54], [5.06, 5.38], [5.86, 6.62], [6.94, 7.56],
    [8.06, 9.38], [9.6, 11.34], [11.64, 13.48], [14.04, 15.32], [15.56, 18.86], [19.12, 20.54], [20.8, 22.62],
    [23.1, 25.42], [25.5, 27.96], [28.28, 29.14], [29.48, 30.7], [30.9, 32.18], [32.4, 33.72], [34.4, 35.6],
    [35.82, 36.28], [36.56, 37.32]],
  intro: {q: 1.16, three: 2.52, counts: [3.66, 4.1, 5.06], celui: 5.86, reveal: 6.34, compte: 6.94},
  secs: [
    {n: 1, title: 'LES BULLES', at: 8.06, end: 14.04, imgs: ['bubbles_fake.jpg', 'bubbles_auth.jpg'],
      fakeAt: 11.64, fakeCap: 'TOUTES PLATES', realAt: 9.6, realCap: 'BIEN GONFLÉES', plusAt: 13.6,
      fakeBox: [0.1, 0.15, 0.8, 0.55], realBox: [0.1, 0.15, 0.8, 0.55], stampY: 0.76},
    {n: 2, title: 'LE SIFFLET', at: 14.04, end: 20.8, imgs: ['cord_fake.jpg', 'cord_auth.jpg'],
      fakeAt: 19.12, fakeCap: 'RIEN DU TOUT', realAt: 15.56, realCap: 'SIFFLET + CORDON', plusAt: 20.4,
      fakeBox: [0.1, 0.02, 0.8, 0.3], realBox: [0.05, 0.02, 0.9, 0.36], stampY: 0.78},
    {n: 3, title: "L'ÉCRITURE", sub: "À L'INTÉRIEUR", at: 20.8, end: 28.55, imgs: ['label_fake.jpg', 'label_auth.jpg'],
      fakeAt: 25.5, fakeCap: 'ÉPAISSE, ÇA BAVE', realAt: 23.1, realCap: 'FINE & NETTE', plusAt: 28.0,
      fakeBox: [0.1, 0.3, 0.8, 0.32], realBox: [0.05, 0.3, 0.9, 0.32], stampY: 0.8},
  ],
  outro: {alors: 28.28, combien: 28.7, ecris: 29.48, moi: 30.9, p1At: 31.64, revend: 32.4, p2At: 33.3, benefAt: 34.4,
    plugAt: 35.82, dmAt: 36.56, p1: '15€', p2: '80€', benef: '+65€', img: 'full_auth.jpg'},
};

// Gilet Therma-FIT ADV menthe — authentique À GAUCHE ; vrai = images 1-3, 1:1 = images 4-5 ; voix Kevin v4, 35,6 s
export const thermamintCfg: Cfg = {
  dir: 'thermamint', duration: 36.3, quizEnd: 26.1, realLeft: true, fx: true, fx2: true, fx3: true,
  words: [[0, 0.78], [1.22, 2.1], [2.44, 3.16], [3.4, 3.84], [4.06, 4.44], [4.84, 5.4], [5.68, 6.42], [6.74, 7.36],
    [7.76, 9.12], [9.32, 11.08], [11.36, 13.14], [13.68, 14.96], [15.2, 16.98], [17.32, 18.84], [19.18, 20.94],
    [21.22, 23.32], [23.6, 25.86], [26.2, 27.1], [27.46, 28.56], [28.56, 30.3], [30.56, 31.76], [32.24, 33.52],
    [33.74, 34.26], [34.62, 35.28]],
  intro: {q: 1.22, three: 2.44, counts: [3.4, 4.06, 4.84], celui: 5.68, reveal: 6.16, compte: 6.74},
  secs: [
    {n: 1, title: 'LES BULLES', at: 7.76, end: 13.68, imgs: ['bubbles_fake.jpg', 'bubbles_auth.jpg'],
      fakeAt: 11.36, fakeCap: 'TOUTES PLATES', realAt: 9.32, realCap: 'BIEN GONFLÉES', plusAt: 13.3,
      fakeBox: [0.1, 0.15, 0.8, 0.55], realBox: [0.1, 0.15, 0.8, 0.55], stampY: 0.78},
    {n: 2, title: 'LE SIFFLET', at: 13.68, end: 19.18, imgs: ['cord_fake.jpg', 'cord_auth.jpg'],
      fakeAt: 17.32, fakeCap: 'RIEN DU TOUT', realAt: 15.2, realCap: 'ACCROCHÉ AU COL', plusAt: 18.9,
      fakeBox: [0.1, 0.05, 0.8, 0.35], realBox: [0.4, 0.3, 0.4, 0.32], stampY: 0.78},
    {n: 3, title: "L'ÉCRITURE", sub: 'DANS LE DOS', at: 19.18, end: 26.5, imgs: ['back_fake.jpg', 'back_auth.jpg'],
      fakeAt: 23.6, fakeCap: 'NOIRE & ÉPAISSE', realAt: 21.22, realCap: 'FINE & RÉFLÉCHISSANTE', plusAt: 25.9,
      fakeBox: [0.15, 0.55, 0.7, 0.2], realBox: [0.55, 0.62, 0.43, 0.2], stampY: 0.12},
  ],
  outro: {alors: 26.2, combien: 26.64, ecris: 27.46, moi: 28.56, p1At: 29.56, revend: 30.56, p2At: 31.4, benefAt: 32.24,
    plugAt: 33.74, dmAt: 34.62, p1: '22€', p2: '80€', benef: '+58€', img: 'full_auth.jpg'},
};

// Bas Nike AeroSwift — DA pixel sur fond bleu minuit étoilé (theme night) ; vrai = images 3-5, 1:1 = images 1-2 ; voix Kevin v4, 39,7 s
export const aeroswiftCfg: Cfg = {
  dir: 'aeroswift', duration: 40.4, quizEnd: 29.15, theme: 'night', fx: true, fx2: true, fx3: true,
  words: [[0, 0.76], [1.18, 2.12], [2.48, 3.18], [3.38, 3.86], [3.88, 4.5], [4.98, 5.5], [5.72, 6.44], [6.82, 7.46],
    [7.88, 9.48], [9.88, 12.16], [12.42, 15.18], [15.56, 17.16], [17.72, 18.46], [18.84, 20.32], [20.52, 21.78],
    [22.2, 23.86], [24.14, 27.0], [27.22, 29.26], [29.26, 30.64], [31.02, 32.2], [32.44, 33.9], [34.2, 35.6],
    [36.04, 37.56], [37.86, 38.28], [38.66, 39.32]],
  intro: {q: 1.18, three: 2.48, counts: [3.38, 3.88, 4.98], celui: 5.72, reveal: 6.18, compte: 6.82},
  secs: [
    {n: 1, title: "L'EMPLACEMENT", sub: 'DU LOGO', at: 7.88, end: 15.56, imgs: ['logo_fake.jpg', 'logo_auth.jpg'],
      fakeAt: 9.88, fakeCap: 'PENCHÉ & MAL PLACÉ', realAt: 12.42, realCap: 'DROIT, PRÈS DE LA POCHE', plusAt: 15.2,
      fakeBox: [0.45, 0.42, 0.45, 0.32], realBox: [0.45, 0.42, 0.45, 0.25], stampY: 0.1},
    {n: 2, title: "L'ÉCRITURE", sub: "À L'INTÉRIEUR", at: 15.56, end: 22.2, imgs: ['label_fake.jpg', 'label_auth.jpg'],
      fakeAt: 17.72, fakeMarkAt: 18.84, fakeCap: 'ÉCRITURE BLANCHE', realAt: 20.52, realCap: 'ÉCRITURE GRISÉE', plusAt: 21.85,
      fakeBox: [0.1, 0.25, 0.8, 0.45], realBox: [0.1, 0.05, 0.8, 0.4], stampY: [0.8, 0.62]},
    {n: 3, title: 'LA MATIÈRE', sub: 'HYBRIDE', at: 22.2, end: 29.6, imgs: ['hybrid_fake.jpg', 'hybrid_auth.jpg'],
      fakeAt: 24.14, fakeCap: 'CÔTELÉ EN BAS SEULEMENT', realAt: 27.22, realCap: 'REMONTE SUR LES CÔTÉS', plusAt: 29.1,
      fakeBox: [0.1, 0.55, 0.8, 0.3], realBox: [0.02, 0.2, 0.4, 0.6], stampY: 0.12},
  ],
  outro: {alors: 29.26, combien: 30.1, ecris: 31.02, moi: 32.44, p1At: 33.18, revend: 34.2, p2At: 35.06, benefAt: 36.04,
    plugAt: 37.86, dmAt: 38.66, p1: '25€', p2: '90€', benef: '+65€', img: 'full_auth.jpg'},
};

// Bas Nike Trail — authentique À GAUCHE, fond étoilé ; vrai = images 1-2, 1:1 = images 3-5 ; voix Kevin v4, 41,6 s
export const trailCfg: Cfg = {
  dir: 'trail', duration: 42.3, quizEnd: 31.75, theme: 'night', realLeft: true, fx: true, fx2: true, fx3: true,
  words: [[0, 0.9], [1.12, 2.3], [2.36, 3.25], [3.32, 3.8], [3.88, 4.4], [4.8, 5.4], [5.56, 6.5], [6.66, 7.6],
    [7.66, 8.9], [9.46, 11.8], [12.0, 14.2], [14.68, 16.5], [16.84, 18.7], [18.92, 21.5], [21.84, 23.5],
    [23.98, 26.0], [26.5, 30.2], [30.34, 31.6], [31.92, 33.0], [33.14, 34.4], [34.58, 35.9], [36.2, 37.6],
    [37.9, 39.7], [39.78, 40.3], [40.6, 41.4]],
  intro: {q: 1.12, three: 2.36, counts: [3.32, 3.88, 4.8], celui: 5.56, reveal: 6.02, compte: 6.66},
  secs: [
    {n: 1, title: 'LA MATIÈRE', at: 7.66, end: 14.68, imgs: ['mat_fake.jpg', 'mat_auth.jpg'],
      fakeAt: 12.0, fakeCap: 'MATE & PLATE', realAt: 9.46, realCap: 'LÉGÈRE & BRILLANTE', plusAt: 14.3,
      fakeBox: [0.1, 0.15, 0.8, 0.6], realBox: [0.1, 0.15, 0.8, 0.6], stampY: 0.78},
    {n: 2, title: 'LE LOGO', sub: 'NIKE TRAIL', at: 14.68, end: 21.84, imgs: ['logo_fake.jpg', 'logo_auth.jpg'],
      fakeAt: 18.92, fakeCap: 'BLANC & ÉPAIS', realAt: 16.84, realCap: 'GRIS RÉFLÉCHISSANT', plusAt: 21.4,
      fakeBox: [0.25, 0.28, 0.5, 0.2], realBox: [0.22, 0.28, 0.5, 0.25], stampY: 0.78},
    {n: 3, title: "L'ÉCRITURE", sub: "À L'INTÉRIEUR", at: 21.84, end: 32.1, imgs: ['label_fake.jpg', 'label_auth.jpg'],
      fakeAt: 26.5, fakeMarkAt: 30.34, fakeCap: 'DRI-FIT ADV, CAMBODIA', realAt: 23.98, realCap: 'MADE IN VIETNAM', plusAt: 31.4,
      fakeBox: [0.1, 0.1, 0.8, 0.6], realBox: [0.1, 0.4, 0.8, 0.3], stampY: [0.85, 0.82]},
  ],
  outro: {alors: 31.92, combien: 32.34, ecris: 33.14, moi: 34.58, p1At: 35.32, revend: 36.2, p2At: 37.1, benefAt: 37.9,
    plugAt: 39.78, dmAt: 40.6, p1: '15€', p2: '110€', benef: '+95€', img: 'full_auth.jpg'},
};

// Bas Nike Phenom Elite Tokyo — format « comment différencier », fond étoilé, vrai à droite ; images = slideshow @ak4run ; voix Kevin v4, 47,2 s
export const phenomtokyoCfg: Cfg = {
  dir: 'phenomtokyo', duration: 48.0, quizEnd: 37.6, mode: 'howto', product: 'NIKE PHENOM ELITE TOKYO 🇯🇵', theme: 'night', fx: true, fx2: true, fx3: true,
  words: [[0, 4.12], [4.36, 4.96], [5.52, 6.6], [7.04, 10.0], [10.44, 12.7], [13.06, 14.6], [14.82, 17.4], [17.78, 19.6],
    [19.94, 21.6], [21.94, 22.6], [22.86, 23.9], [24.34, 26.4], [26.8, 28.4], [28.46, 32.3], [32.5, 37.3], [37.78, 39.3],
    [39.46, 40.8], [41.24, 45.2], [45.52, 46.0], [46.2, 47.1]],
  intro: {q: 0.96, three: 0, counts: [0, 0, 0], celui: 0, reveal: 3.52, compte: 4.36},
  secs: [
    {n: 1, title: 'LE LOGO', at: 5.52, end: 13.06, imgs: ['logo_fake.jpg', 'logo_auth.jpg'],
      fakeAt: 7.04, fakeCap: "S'EFFACE VITE", realAt: 10.44, realCap: 'NET & BIEN IMPRIMÉ', plusAt: 12.6,
      fakeBox: [0.25, 0.3, 0.6, 0.35], realBox: [0.3, 0.35, 0.65, 0.35], stampY: 0.8},
    {n: 2, title: 'LA POCHE', sub: 'ARRIÈRE', at: 13.06, end: 19.94, imgs: ['back_fake.jpg', 'back_auth.jpg'],
      fakeAt: 14.82, fakeCap: 'POCHE & ZIP TROP PETITS', realAt: 17.78, realCap: 'POCHE & ZIP PLUS GRANDS', plusAt: 19.5,
      fakeBox: [0.3, 0.12, 0.35, 0.22], realBox: [0.12, 0.12, 0.45, 0.35], stampY: 0.8},
    {n: 3, title: 'LA POCHE', sub: 'SUR LE CÔTÉ', at: 19.94, end: 26.8, imgs: ['pocket_fake.jpg', 'pocket_auth.jpg'],
      fakeAt: 21.94, fakeMarkAt: 22.86, fakeCap: 'ELLE BRILLE', realAt: 24.34, realCap: 'CLASSIQUE & MATE', plusAt: 26.4,
      fakeBox: [0.15, 0.05, 0.6, 0.6], realBox: [0.1, 0.2, 0.75, 0.35], stampY: [0.8, 0.08]},
    {n: 4, title: "L'ÉTIQUETTE", sub: 'INTÉRIEURE', at: 26.8, end: 37.95, imgs: ['label_fake.jpg', 'label_auth.jpg'],
      fakeAt: 28.46, fakeCap: 'FAUX N° : DQ6537', realAt: 32.5, realCap: 'BON N° : DH1483', plusAt: 36.6,
      fakeBox: [0.3, 0.02, 0.45, 0.45], realBox: [0.55, 0.1, 0.4, 0.55], stampY: [0.85, 0.85]},
  ],
  outro: {alors: 37.78, combien: 39.46, ecris: 39.46, moi: 41.24, p1At: 41.76, revend: 42.52, p2At: 42.94, benefAt: 43.62,
    plugAt: 45.52, dmAt: 46.2, p1: '30€', p2: '150€', benef: '+120€', img: 'full_auth.jpg'},
};
