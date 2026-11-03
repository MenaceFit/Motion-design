# Librairies d'animation et sources SFX — évaluation pour la production vidéo

**Règle n° 1 de notre rendu** : Remotion calcule chaque image indépendamment, dans le désordre,
dans un navigateur sans écran. Une animation n'est utilisable que si elle est une **fonction pure
du numéro d'image** (on peut « se placer » à l'instant t). Tout ce qui dépend de l'horloge réelle
(requestAnimationFrame libre, CSS transitions/animations lancées au chargement, scroll, survol)
donne des vidéos saccadées ou fausses.

Évaluation réalisée le 2026-11-03 dans le conteneur cloud (npm et PyPI accessibles, sites de
banques sonores bloqués par la politique réseau).

## Animation — retenu et intégré
| Librairie | Usage dans nos vidéos | Où | Licence |
|---|---|---|---|
| **GSAP 3.13** | Moteur d'easing de référence (`back.out`, `expo.out`, `elastic.out`, `power3.in`) appliqué image par image : cascade de lettres 3D, éclats, pop des sous-titres. Timelines GSAP utilisables en pause + `seek(t)` | `Text3D.tsx`, `Captions.tsx` | Licence standard GSAP « no charge » (gratuite, usage commercial OK, **pas MIT** ; interdit seulement pour concurrencer les outils visuels de Webflow) |
| **Three.js** (+ react-three-fiber, @remotion/three) | Texte 3D extrudé, objets-métaphores, personnages, éclairage studio PMREM | `Text3D.tsx`, `Scenes3D.tsx` | MIT |
| **cannon-es** | Physique 3D (chute, rebonds, empilement) précalculée puis rejouée par image | scène `physics` | MIT |
| **Lottie** (lottie-web via @remotion/lottie) | Animations After Effects exportées en JSON, pilotées par l'image | `LottieOverlay.tsx`, `src/lottie/` | MIT (lecteur) — **licence de chaque animation à vérifier** |
| **Remotion** (interpolate, spring, @remotion/noise, paths, transitions) | Base de toute l'animation | partout | gratuit ≤ 3 personnes, sinon licence entreprise |

## Animation — installé, disponible, non utilisé par défaut
| Librairie | Raison |
|---|---|
| Anime.js 4 | Fait double emploi avec GSAP (easings, timelines). Gardé pour qui préfère son API (`createTimeline({autoplay:false}).seek()`). |
| Matter.js | Physique 2D : utile pour des scènes plates (étiquettes qui tombent). La physique 3D (cannon-es) couvre nos besoins actuels. |
| Zdog | Pseudo-3D plat : piste pour un style « flat 3D » façon ref01 ; Three.js couvre déjà le volume. |

## Animation — évalué, non retenu (et pourquoi)
| Librairie | Raison |
|---|---|
| Motion (Framer Motion), Popmotion, Velocity.js, Web Animations API | Pilotées par l'horloge réelle ; Remotion `spring`/`interpolate` + GSAP font la même chose de façon déterministe. |
| Theatre.js | Excellent éditeur de timeline, mais nécessite l'interface Studio (pas d'écran ici). À considérer si vous voulez caler des caméras à la main sur votre machine. |
| Mo.js | Bursts → réimplémentés en Three.js (`Burst`) pour rester dans la scène 3D et déterministes. |
| Animate.css, Hover.css, Magic CSS, Loaders.css, AOS, WOW.js, ScrollTrigger, Lenis, Locomotive, ScrollReveal, Rellax | Web interactif (scroll, survol, chargement) : sans objet pour une vidéo. |
| SplitType / Splitting.js | Découpage du texte réalisé directement en 3D (une géométrie par glyphe). |
| Typed.js, Vivus, Snap.svg, SVG.js, Two.js | Machine à écrire / tracé SVG déjà couverts (révélation mot à mot, `strokeDashoffset`, @remotion/paths). |
| Rive | Nécessite des fichiers .riv (éditeur Rive). Possible plus tard avec vos fichiers. |
| Babylon.js, PixiJS, p5.js, Konva, Fabric.js | Moteurs alternatifs : un seul moteur 3D (Three.js) + DOM suffit ; en ajouter un second alourdirait sans gain. |
| Vanta.js, tsParticles / particles.js | Boucle temps réel non déterministe ; nos particules Three.js sont pilotées par l'image. |
| Magic UI, Aceternity UI, React Bits, Animata | Composants web (Tailwind + Motion) pensés pour l'interaction ; à transposer à la main si un effet précis vous plaît. |

## Effets sonores
| Source | Statut ici | Utilisation |
|---|---|---|
| **uisfx** (npm, audio **CC0**) | ✅ intégré | 78 sons d'interface × 4 styles (cinematic, glass, studio, soft) → `public/sfxlib/uisfx/` |
| **jsfxr** (npm, MIT, générateur sfxr) | ✅ intégré | 8 presets × 3 variantes (pièce, power-up, laser, explosion, impact, saut, blip, clic), graine fixe |
| **ZzFX** (npm, MIT, générateur) | ✅ intégré | 8 micro-sons designés (pop, tick, swoosh, impact, sparkle, notify, error, rise) |
| Notre synthèse (`tools/sfx_synth.py`) | ✅ | whoosh, sub hit, riser, glitch… |
| @remotion/sfx | ⚠️ installable mais les sons sont hébergés sur remotion.media (bloqué) | — |
| Pixabay, Mixkit, Freesound, Zapsplat, Sonniss, Kenney, OpenGameArt, Orange Free Sounds, SoundBible, Uppbeat, FMA, LottieFiles | ❌ bloqués par la politique réseau du conteneur | ajouter les domaines autorisés, ou déposer les fichiers dans le dépôt |
| BBC Sound Effects | ⛔ exclu | licence limitée à l'usage personnel/éducatif/recherche → incompatible monétisation |
| Epidemic Sound | ⛔ | essai seulement, abonnement requis pour publier |
| ElevenLabs SFX | ❌ API bloquée + clé requise | — |

Construction de la bibliothèque : `cd templates/remotion-kinetic && node scripts/build_sfx_library.mjs`
(344 sons, catalogue `public/sfxlib/catalog.json`, non versionné car régénérable à l'identique).

Le pipeline choisit automatiquement un **son sémantique par scène** (`SCENE_SFX` dans
`tools/make_video.py`) : notification pour le téléphone, pièces pour l'argent, succès pour la
coche, déverrouillage pour le cadenas, progression pour les graphiques, ticks pour les compteurs…
Style uisfx selon l'ambiance (hype/tension → cinematic, inspire → soft, dark → studio, thème ice → glass).
