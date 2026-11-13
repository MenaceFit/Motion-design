# Style « Arcade Legit Check » — références : ref09, ref10 (legit checks vêtements, format jeu)

Sujet : authentique vs contrefaçon (« 1.1 ») d'un vêtement, présenté comme un **jeu** auquel le
spectateur participe. Analyse mesurée : `references/analyses/legitcheck-ref/ref1|ref2`
(scenes.json, audio.json, contact_sheet.jpg). **Pas de voix off** dans les références (VAD Whisper :
aucun segment) → tout passe par le texte, la musique (~117–123 BPM mesurés) et les SFX.
Production maison : `ArcadeCheck.tsx` (voix de l'utilisateur ajoutée, sous-titres pixel compacts).

## Mécanique de rétention (le cœur du format)
1. **Défi immédiat (0–6 s)** : « UN SEUL EST VRAI » → 2 cartes « ? » → « GAUCHE OU DROITE ? » →
   « T'AS 3 SECONDES ! » + compte à rebours 3-2-1 géant + barre de temps, la carte surlignée
   (jaune) alterne. → le spectateur choisit = il s'engage.
2. **Révélation** : ✗ rouge / ✓ vert, étiquettes FAUX / VRAI, projecteurs teintés rouge/vert,
   « C'EST CELUI DE DROITE ! ».
3. **Score persistant en haut** : cases 1..N (case courante jaune, validées vertes ✓) + « x/N ».
   Chaque critère validé = « +1 » flottant. La barre de progression vidéo (fine, bleue, en haut)
   indique qu'on avance.
4. **Étapes « N°k »** : tag jaune + titre pixel tapé lettre par lettre (≈ 3–4 s par étape, mesuré :
   plan moyen 3,1 s ref09 / 4,1 s ref10).
5. **Appel au commentaire** : « ALORS… T'EN AVAIS COMBIEN ? » + « ?/N » doré pulsé sur rayons
   tournants + « ÉCRIS TON SCORE EN COMMENTAIRE ↓ » + 2 réponses-types en boutons.
6. CTA final (dans les réf. : produit vendu par le créateur, non repris).

## Identité visuelle
- **Scène de nuit arcade** : dégradé bleu nuit `#0a1226 → #04060e` (palette mesurée : `#0f1321`,
  `#182438`, `#05070f`), silhouettes d'**escaliers pixel**, étoiles qui scintillent, 3 **faisceaux**
  de projecteurs (bleus, puis rouge à gauche / vert à droite après verdict), sol = ligne bleue
  lumineuse + grille en perspective. Lignes de balayage CRT + vignette.
- **Cartes** : fond gris-bleu clair, bordure épaisse (bleu neutre / jaune choix / rouge ✗ / vert ✓)
  avec glow, **viseurs** aux 4 coins qui se resserrent, **flèche pixel** qui rebondit sur le détail,
  tampon ✗/✓ en coin (scale 2→1 + rotation), légende 2 lignes sous la carte (rouge / vert).
- **Mascotte pixel** en bas, sur le sol : idle (respiration + clignement), pointe à gauche au
  verdict ✗, à droite au ✓, « ? » au-dessus quand il réfléchit, bras levés au score.
  ⚠ Les références utilisent l'avatar du créateur (son visage) : ne jamais le reproduire —
  mascotte originale uniquement.
- Typo : **pixel** (Pixelify Sans 700 ; Silkscreen écartée : « 4 » illisible), MAJUSCULES,
  ombre portée noire 4–5 px + léger glow ; glitch RVB à l'apparition. Jaune `#ffd23f` = action /
  question, vert `#2fe36b` = vrai, rouge `#ff3b4a` = faux.

## Transitions
- **Pixelisation** : dissolution en blocs (90 px) entre étapes ; les images des cartes arrivent
  pixelisées (mosaïque ~24 px) 0,28 s puis nettes (« chargement »).
- Cartes qui tombent d'en haut (back.out), tags qui « pop ».

## Sound design (fonctions)
typewriter = texte tapé · tick + click = compte à rebours · riser = tension 3-2-1 ·
glitch + sub hit = révélation / changement d'étape · blip montant = ✓ / +1 · blip descendant = ✗ ·
shimmer = point gagné · ticks rapides = compteurs de prix.

## Limites / adaptations
- Avec voix off (cas de l'utilisateur) : jeu d'intro **sans voix** (≈ 6,8 s) puis la voix démarre ;
  pause « score » de ≈ 3,4 s insérée avant la conclusion (silence voix, musique + SFX).
- Ne marquer ✗ que les critères réellement affirmés ET visibles sur les photos fournies.
