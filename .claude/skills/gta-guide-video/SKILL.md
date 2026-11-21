---
name: gta-guide-video
description: Produit une vidéo verticale « astuces / codes / secrets GTA 6 » au niveau des comptes TikTok du créneau (@adrgta, @gta6alerte_…) — script factuel sourcé, voix off, sous-titres 1–3 mots, footage GTA 6 réel recadré 9:16, transitions zoom-blur / whip cuites, overlays UI (compteur $, code à la croix, carte vitrée, étape, alerte, pin, CTA abonnement), SFX, musique, mix, QC. À utiliser dès que l'utilisateur demande une vidéo GTA (codes de triche, astuces, argent, secrets, easter eggs).
---

# Vidéo « GTA Guide » de bout en bout

Fiche de style mesurée : `references/visual-styles/gta-guide.md` (ref09–ref13).
Footage et faits : skill `gta-footage-sourcing` (à faire d'abord si `footage/index/` est vide).

## Grammaire à respecter (mesurée sur 5 refs)
| Paramètre | Valeur |
|---|---|
| Durée | 30–65 s (refs : ~62 s + carte de fin TikTok) |
| Plan | 1,3–1,8 s (médiane), micro-plans 0,3 s pour les accents ; **l'image bouge toujours** |
| Sous-titre | 1–3 mots, ~2,4 changements/s, centre à **77 % de la hauteur**, condensé gras italique MAJ, mot-clé jaune |
| Ouverture | zoom-blur 6 frames + whoosh, voix dès t = 0, promesse chiffrée (« 250 000 $ ») |
| Structure | hook promesse → piège/condition → étapes numérotées → récompense → avertissement → CTA |
| Son | voix dominante, musique hype avec sub, SFX fonctionnels (whoosh sur transitions, ticks compteur, clic par touche) |

## Procédure
1. **Faits** : vérifier sur ≥ 2 sources (skill `gta-footage-sourcing` §4). Jamais de code « TBA »
   ou non confirmé. Toujours dire les conditions (ex. codes seulement après les 91 missions,
   sauvegarde bloquée après usage).
2. **Script** (FR, tutoiement, phrases courtes ≤ 12 mots, une info par ligne) :
   - L1 hook avec le gain concret ; L2 « mais attention, il y a un piège » (rétention) ;
   - étapes « Étape 1/2/3 » ; récompense ; avertissement ; CTA « abonne-toi pour … ».
   - `text` = affiché ; `say` = prononcé si différent (nombres en lettres, « L 1 » pour L1).
   - `{…}` = groupe insécable (`{L1}`, `{91 missions}`) ; `accents` = mots-clés seuls en jaune + punch.
3. **Plans** : `python3 tools/footage_index.py search --tags <thème> --limit 15`, puis imposer les
   meilleurs (`"shots": [...]`, 1 par ~1,5 s de ligne) — sens : le plan illustre la phrase
   (argent → caisse/bar/supercar ; piège → coffre/silhouette ; téléphone → Jason au téléphone ;
   sauvegarde bloquée → explosion/vitre brisée ; CTA → panorama de Vice City). Pas de réutilisation.
   Sans `shots`, le build cherche par `tags` puis `default_tags`.
4. **Overlays** (`overlay` = objet ou liste, `at` = mot d'ancrage, `until` = s | `"end"`) :
   | type | usage | champs |
   |---|---|---|
   | `counter` | gain d'argent | `value`, `prefix` ($), `countFrames` |
   | `combo` | code à la croix, touche par touche **calée sur la voix** (« haut, droite… ») | `keys` U/D/L/R, `label` |
   | `code` | code chiffré (digicode, coffre) | `code`, `label` |
   | `card` | conditions / stats en barres segmentées | `title`, `rows[{label,value 0–1,color,icon}]` |
   | `step` | badge « 1 Le téléphone » | `n`, `label` |
   | `alert` | piège / avertissement (shake + son d'erreur) | `text` |
   | `title` | gros texte 1–2 lignes (boutons, titre) | `lines`, `accent` (index surligné) |
   | `pin` | lieu sur une carte/vue aérienne | `label`, `x`, `y` |
   | `flow` | chaîne d'icônes fléchées (A → B → C) | `icons` |
   | `subscribe` | CTA bouton S'abonner → clic → Abonné | `label`, `done` |
   Icônes : `src/gta/Icons.tsx` (cash, diamond, car, gun, key, pin, lock, star, phone, map, code…).
5. **Build** :
   ```bash
   python3 tools/gta_build.py projects/<slug>/plan.json --concurrency 3        # 60 i/s : ~12–18 min pour 36 s
   python3 tools/gta_build.py projects/<slug>/plan.json --voice-file voix.mp3  # prise ElevenLabs unique
   python3 tools/gta_build.py projects/<slug>/plan.json --no-render            # vérifier edit.json d'abord
   ```
   Étapes : voix Piper par ligne → Whisper (mots) → sous-titres → créneaux de plans → `clip_cut.py`
   (recadrage 9:16 depuis la 4K + transitions cuites) → overlays/fx/SFX → musique + mix → Remotion
   `GtaGuide` → `finish.sh` (-14 LUFS) → `qc_check.py`.
6. **QC visuel** obligatoire : planche 1 image/s du rendu + lecture des frames clés (hook, combo,
   CTA). Vérifier : sous-titres jamais coupés, overlays sans chevauchement, aucun carton/logo
   Rockstar plein écran, cadrage des visages, pas de plan figé visible (vitesse min 0,72).
7. Livrer `renders/<slug>/<slug>.mp4` + `sources.md` + texte de description avec crédits
   (« Images : Rockstar Games », voix Piper siwis CC-BY 4.0) et rappel monétisation.

## v3 (2026-11-21) : accroche, CTA, plus de footage
- **Accroche** (ligne 0) : overlay `hooktag` (étiquette jaune « CODE SECRET » qui claque dès la 1re image,
  reflet qui balaie, sous-titre « GTA 6 ») + `counter` sans `at` (démarre à 0 s) + `"flash_cuts": true`
  et `"shot_len": 0.55` (coupes régulières toutes les ~0,55 s avec flash blanc, déclencheur photo et
  impact) + sub-drop, shutter et secousse à 0 s. Choisir 5–6 plans d'action différents (explosion,
  tir, chute libre, braquage, jet-ski).
- **CTA** : overlay `follow` (titre « Plus de codes|comme ça ? » sur 2 lignes, la 2e en jaune ; avatar à
  anneau dégradé tournant avec « + » rouge pulsant ; bouton « Abonne-toi » à cloche tapé par une main ;
  « Abonné ! » + cloche qui sonne ; flèche « ICI » vers le bouton + de TikTok à droite). Champs plan :
  `channel` (pseudo affiché) et `initials` (texte de l'avatar).
- **Sons ajoutés** : `record_scratch` sur une coupure musicale, `rev_cymbal` 0,6 s avant chaque zoom/spin,
  `bell` au clic du CTA, `shutter` sur les flashs, `sub_drop` à l'ouverture, et variantes `_2`/`_3` des
  whooshs et des impacts, en rotation automatique.
- **Caméra à l'épaule** : légère dérive (bruit de Perlin, ±7 px, ±0,35°) sur tous les plans.
- **Footage** : « An Extended Look » (26 min 48 s, 346 plans) indexé et tagué. Pour du vrai gameplay
  (HUD, mini-carte) : `footage_index.py search --tags gameplay`.

## v2 (2026-11-20) : fluidité et sound design
- **60 i/s** (`"fps": 60` dans le plan, défaut). Les trailers sont à 30 i/s : leurs images sont doublées,
  mais toute l'animation ajoutée (caméra, transitions, textes, overlays) tourne à 60 i/s. Base de temps
  des composants exprimée en « frames 30 » (`useT()`), donc identique quel que soit le fps.
- **Transitions par ligne** (`"transition"`, sinon cycle automatique zoom → whip → spin → whip_v → whip2 → glitch) :
  | nom | image (queue → tête) | son (`public/sfxpro`) | light leak |
  |---|---|---|---|
  | `zoom` | zoom-blur radial | whoosh_long (pic sur la coupe) + hit | chaud |
  | `whip` / `whip2` | filé vers la gauche / la droite | whoosh_rl / whoosh_lr (le son traverse l'image dans le même sens) | rose / cyan |
  | `whip_v` | filé vers le haut | whoosh_up | chaud |
  | `spin` | rotation floutée ±28° | whoosh_long + whip | rose |
  | `glitch` | RVB + tranches | glitch + hit + secousse | — |
  | `cut` | coupe sèche (dans une ligne) | petit whip discret + punch 3,5 % | — |
- **Speed ramps** : accélération ×3 sur les 0,28 s avant une transition, décélération après ;
  retirées automatiquement si le plan source est trop court (`clip_cut.source_span`).
- **Musique** : `"music": "cut"` sur une ligne → tape-stop puis silence pendant la ligne et boom au retour
  (idéal sur « le piège ») ; `"music": "drop"` → riser 1,4 s avant la ligne + boom.
- **SFX** (`tools/sfx_pro.py`, stéréo, originaux) : boom + flash à 0 s ; hit + punch + secousse sur
  chaque mot-clé ; ticks + ka-ching + pièces sur le compteur ; note montante par touche du combo
  (do-ré-mi…) ; glitch + hit sur une alerte ; whip + pop sur une étape ; clic + « success » sur le CTA.
- **Visuel** : light leaks additifs sur les transitions, grain animé (0,07), sous-titres élastiques
  (mot-clé « slam » jaune avec halo), rayons + explosion de « $ » en fin de compteur, onde sur chaque
  touche, barre de progression des étapes (n/total auto).
- **Voix ElevenLabs / enregistrée** : une seule prise pour tout le script →
  `python3 tools/gta_build.py <plan> --voice-file prise.mp3`. Whisper retranscrit la prise, les nombres
  sont convertis en lettres (num2words), puis un alignement caractère à caractère (difflib) donne les
  bornes de chaque ligne. Testé : 96 % de caractères communs, bornes à ±50 ms. Script à fournir :
  `projects/<slug>/SCRIPT_ELEVENLABS.md` (nombres en lettres, une génération).

## Transitions (cuites par `tools/clip_cut.py`)
- `zoom` : queue 1 → 1,22 + flou radial 0 → 0,30 (5 f) / tête 1,28 → 1 + flou 0,32 → 0 (6 f).
- `whip` : zoom interne + décalage ≤ marge + flou directionnel 210 px (jamais de bord miroir).
- Alternance automatique zoom / whip entre lignes, cut sec à l'intérieur d'une ligne.
- Whoosh (`zzfx/swoosh`) 0,14 s avant chaque transition. Flash blanc 35 % à la fin du compteur.

## Voix
- Défaut : Piper `fr_FR-siwis-medium` (CC-BY 4.0, attribution), `length_scale` 0,86 (débit rapide
  du créneau). Alternative masculine `fr_FR-tom-medium` (jeu de données AGPLv3 → statut des sorties
  à vérifier avant usage commercial). Intelligibilité contrôlée : Whisper retranscrit 100 % des mots.
- Meilleur rendu : la voix de l'utilisateur (ou ElevenLabs) — une prise par ligne dans
  `renders/<slug>/lineNN.wav` (même nommage) ; le reste du pipeline est identique.

## Erreurs déjà rencontrées
- `librosa.beat.beat_track` segfault (numba) sur certains fichiers → tempo par autocorrélation.
- faster-whisper + PyAV récent : `open() got an unexpected keyword 'metadata_errors'` → passer un
  tableau 16 kHz (fait dans `transcribe_words.py` et `gta_build.py`).
- OpenCV 5 n'a plus `CascadeClassifier` → YuNet (`FaceDetectorYN`).
- Ponctuation française séparée (« avant ! », « histoire : ») → rattachée au mot précédent.
- Petits mots orphelins avant un mot-clé (« LES » seul) → intégrés au mot-clé (« LES 91 MISSIONS »).
- Plan trop court pour le créneau → ralenti (≥ 0,72) ; en dessous, choisir un autre plan.

## Checklist livraison
- [ ] Chaque fait a ≥ 2 sources (`sources.md`)
- [ ] Aucun plan `avoid` (cartons, nudité, logos) ; crédit Rockstar à l'écran
- [ ] Audio des trailers absent (musique originale + voix + SFX seulement)
- [ ] QC `qc_check.py` OK (1080×1920, 30 fps, -14 LUFS, synchro)
- [ ] Planche de contrôle relue
- [ ] Rappel à l'utilisateur : monétisation non garantie (politique Rockstar)
