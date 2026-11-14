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
