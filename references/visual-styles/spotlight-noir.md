# Style « Spotlight Noir » — références : ref09 + ref10 (même compte, séduction)

Sujets : ref09 « La femme que tu veux est plus facile à séduire que tu ne le crois » (137 s de
contenu) ; ref10 « Comment la rendre accro ? » (150 s). Séduction / psychologie sociale, voix off
masculine posée, ton « je t'explique le mécanisme ».

## Format (mesuré)
- Export 576×1024, 30 fps. **Letterbox volontaire** : bande noire en haut avec le **titre-hook écrit
  en blanc pendant toute la vidéo** (sans-serif SemiBold, casse normale, 3 lignes max), panneau
  d'animation 16:9 au centre, bas noir (zone UI TikTok). Le hook reste lisible à chaque instant :
  quelqu'un qui arrive au milieu sait de quoi parle la vidéo → rétention sur formats longs.
- Durées 137 et 150 s : format **> 60 s** (cohérent avec les règles de rémunération TikTok, voir
  `documentation/virality.md`). Cartes de fin TikTok ~3,5 s exclues.
- Loudness mesurée : **-20,8 / -20,9 LUFS**, LRA 3,6 LU, crête 0 dBFS → mix très compressé mais
  bas ; la plateforme normalise. Nous restons à -14 LUFS.

## Identité visuelle
- **Monochrome gris** (studio 3D : murs, sol, portes, casiers, foules) + **UNE couleur d'accent**
  acide jaune-citron, mesurée `#c4d117` / `#dbea1a` (k-means pixels saturés, 41 % / 30 %).
  L'accent est réservé au **sujet (« toi »)** et à ce qui compte : mot-clé, jauge, chiffre.
- **Projecteurs volumétriques** (cônes de lumière + flaque au sol + poussières) : la lumière
  désigne le personnage dont on parle. Le sens se lit sans le son.
- **Pictogrammes** type signalétique (tête ronde, corps simple) : homme gris/blanc ou contour,
  femme en silhouette robe blanche, foules répétées, « toi » en accent avec halo.
- **HUD de surveillance** : croix de visée aux 4 coins du panneau, micro-labels monospace tapés
  lettre par lettre (« SIGNAL DÉTECTÉ / SOURCE : TOI »), petits panneaux de stats, jauges à
  aiguille qui tremble (103–105 %), compteurs, ECG.
- Objets-métaphores 3D simples (porte géante « TIRER », rayon de supermarché, ticket de caisse,
  interrupteur ON/OFF, téléphone, batterie, cloche sous verre) : **un objet = une idée**.

## Typographie
- **Sous-titre = boîte blanche, texte noir condensé (Anton/Bebas-like) en capitales**, en bas du
  panneau. La boîte **grandit mot à mot** (largeur ajustée au texte affiché), 1–6 mots par boîte,
  coupure à la ponctuation. Mesuré ref10 16,3–17,1 s : « MAIS IL SE » → « …PASSE » → « …AUTRE » →
  « …CHOSE. » (un mot ≈ 4–6 images).
- **Carte mot-clé** plein cadre noir : mot géant condensé en accent avec glow (« RIEN. »,
  « TIRER », « CONVERSATION », « ATTENTION. »), point final, micro-label monospace dessous
  (« DÉPLACEMENT : 0 MM »). Le sous-titre disparaît pendant la carte.
- Grands chiffres condensés accent (« 0 MM », « 12 KG », « 100 », « 77 % ») = preuve visuelle.

## Mouvement (mesuré image par image)
- **Caméra continue dans un monde 3D** : PySceneDetect ne trouve que 15 « coupes » sur 137 s alors
  que l'œil voit ~70 changements → la plupart des changements sont des **mouvements de caméra**
  (travelling, push-in, whip pan), pas des cuts. Pics de mouvement : **31,5/min** (ref09), 32,7/min (ref10).
- **Whip pan** : 6–8 images, flou directionnel fort, le plan suivant arrive dans le même geste.
- **Mot néon défaillant** (ref09 3,3 s) : les lettres de « TIRER » s'allument une par une en
  clignotant pendant ~9 images, puis **2 images de fond jaune** (flash), étincelles qui
  retombent, puis sortie en whip pan flou.
- **Glitch → flash gris → carte** (ref09 8,9 s) : bandes horizontales décalées 2–3 images,
  1 image grise unie, puis carte noire « RIEN. ».
- Jauges : l'aiguille dépasse 100 % puis **tremble** (± 1–2 %) = effort inutile.
- Labels HUD : frappe ~25–35 caractères/s.

## Sound design (mesures : spectrogramme 0–14 s, onsets ; pas d'écoute)
- **Sub-basse quasi continue < 150 Hz** (pulsation sombre) sous une voix dominante.
- **Impacts sub** (bandes jaunes larges en bas du spectre) exactement sur le flash « TIRER »
  (3,3 s) et la carte « RIEN. » (8,9–9,6 s).
- **Trou d'énergie juste avant l'impact « RIEN. »** (≈ 8,8 s) : *silence avant l'impact*.
- Raie aiguë stable ~10 kHz pendant 2,8–4,0 s = bourdonnement/« buzz » cohérent avec le néon qui
  s'allume (hypothèse).
- Traits verticaux réguliers 12,6–13,6 s = tics (frappe HUD / compteur) — hypothèse, la voix masque.

## Structure narrative (ref09)
Hook-titre permanent → image-métaphore filée (une porte que tout le monde pousse alors qu'il faut
tirer) → chiffres absurdes (« 0 MM ») → retournement (« elle s'ouvre toute seule ») → règles
numérotées (« 01 », « 02 ») → répétition du motif → punchline « PORTE. ».
**Principe réutilisable** : *une métaphore visuelle récurrente qui revient 3–4 fois* (cohérence +
payoff), chapitres numérotés, mots-clés en cartes.

## Réutilisable / à remplacer
| Réutilisable (principes) | À remplacer obligatoirement |
|---|---|
| Studio gris + 1 accent réservé au sujet | Couleur exacte : choisir **notre** accent (démo : rose `#ff2d6f`) |
| Hook-titre permanent en haut | Leur titre, leur texte, leur métaphore de la porte |
| Sous-titre boîte blanche qui grandit mot à mot | Leurs personnages 3D, leurs décors |
| Carte mot-clé néon + flash + étincelles | Le watermark / nom du compte |
| Whip pan, glitch→gris→carte, jauge qui tremble | — |
| Silence avant l'impact, sub sur les cartes | — |

## Implémentation (testée)
- Composition `NoirStage` / `NoirStage30` : `templates/remotion-kinetic/src/noir/NoirStage.tsx`
  (2D SVG, ~0,12 s/image à demi-résolution, rapide comparé au WebGL logiciel).
- Pipeline : `python3 tools/make_noir.py projects/<slug>/plan.json` (skill `spotlight-noir`).
- Démo originale : `projects/attention-signal/plan.json` (séduction, accent rose, 41 s).
- Format natif 1080×1920 : titre 175–445 px, scène carrée 1080×1080 à y = 470, 370 px libres en bas.
