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
