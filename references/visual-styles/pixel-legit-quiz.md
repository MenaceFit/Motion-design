# Style « Pixel Legit Quiz » — références : ref09, ref10 (même compte, quiz legit-check vêtements)

Format : **quiz « un seul est vrai »** (authentique vs réplique) commenté par un petit personnage pixel
art, verticales natives 576×1024 (→ 1080×1920), 30 fps, 50–62 s de contenu.

## Structure (identique dans les 2 vidéos, mesurée sur transcription Whisper)
| Temps (ref10) | Bloc | Écran |
|---|---|---|
| 0–3 s | Hook « Un seul de ces deux … est vrai » | 2 cartes photo pleine pièce, tags jaunes « ? » |
| 3–6 s | « Gauche ou droite ? T'as 3 secondes » | titre jaune, compte à rebours 3-2-1 géant, carte surlignée en alternance |
| 6–10 s | « C'est celui de gauche ! » | colonnes teintées vert/rouge derrière les cartes, ✓/✗, VRAI / FAUX 1:1, « L'AUTHENTIQUE / LA COPIE » |
| 10 s | « Compte avec moi » | HUD score (pastilles + « 0/N ») |
| ~6 s / détail | « Numéro N, <détail> » → faux → vrai | chip « N°x », titre tapé, gros plans, crochets de visée + flèche, légende colorée sous chaque carte, « +1 » |
| fin −10 s | « Alors, t'en avais combien ? Écris ton score en commentaire » | « ?/N » dans un cadre doré, fond à rayons |
| fin | CTA (pack / bio) | fond grille → fond vert à rayons + ✓, sticker prix |

## Grammaire visuelle
- Fond bleu nuit `#081230`→`#0d1d4a`, colonnes de lumière verticales, sol lumineux bleu + grille en perspective.
- Police pixel **majuscules** (Silkscreen 700 chez nous), ombre portée dure ; mots-clés vert `#3ee06a` / jaune `#ffd23f`.
- Texte **toujours tapé** lettre par lettre avec curseur bloc (~30 car/s).
- Cartes : cadre clair dégradé, coins arrondis, glow jaune (sélection) / vert / rouge (verdict).
- Transitions : dissolution en blocs pixel sur les cartes, flash court, petit shake sur les révélations.
- Personnage pixel centré en bas, respiration 2 positions, poses (pointe gauche/droite, réfléchit avec « ? », « ! », bras levés).
- Barre de progression bleue en haut de l'écran.

## Son (mesuré)
- Voix off dominante, phrasé rapide ; musique ~117,5 BPM (librosa) discrète en dessous.
- SFX rétro 8-bit : tic de compte à rebours, power-up à la révélation, pièce sur chaque « vrai »,
  buzzer sur chaque « faux », typing sous le texte tapé.

## Implémentation
`templates/remotion-kinetic/src/nrd/LegitCheck.tsx` (composition `LegitCheck`), personnage
`projects/nrd-legit-check/sprite.py`, SFX `projects/nrd-legit-check/sfx_plan.py`.
