# Catalogue de patterns d'animation (valeurs à 30 fps)

Chaque pattern : propriété, valeurs, durée, easing, équivalents Remotion / After Effects.
Source = observé dans les références (ref0X) ou validé par rendu test.

| # | Pattern | Propriétés & valeurs | Durée | Easing | Vu dans |
|---|---|---|---|---|---|
| A1 | **Word pop** | scale 0,72 → 1 (overshoot ~1,06), rotation -6° → 0° | 6–8 f | spring(damping 13, stiffness 420, mass 0,5) | ref01, ref02 |
| A2 | **Word drift** | scale 1 → 1,05 pendant toute la vie du mot | durée du mot | linéaire | ref01 |
| A3 | **Word-by-word reveal** | opacité 0 → 1 (ou gris 25 % → blanc), mise en page fixe | 3–4 f | ease-out | ref03, ref04, ref05 |
| A4 | **Stroke draw** | strokeDashoffset L → 0 | 20–30 f | easeOutExpo `bezier(.16,1,.3,1)` | ref04, ref05, ref02 |
| A5 | **Icon pop** | scale 0 → 1, overshoot 10–15 % | 8–12 f | spring(damping 12, stiffness 180) | ref01, ref03 |
| A6 | **Counter roll** | valeur numérique interpolée, chiffres tabulaires | 30–45 f | ease-in-out (accélère puis ralentit) | ref05 |
| A7 | **Light sweep** | barre verticale lumineuse traverse le cadre, blend add | 4–6 f | linéaire | ref02 |
| A8 | **Glow pulse** | opacité halo 0,6 ↔ 1, scale 1 ↔ 1,04 | boucle 40–60 f | sinus | ref03 |
| A9 | **Push-in émotionnel** | scale caméra 1 → 1,12 | 2–4 s | ease-in-out | ref01, ref02 |
| A10 | **Stagger crowd** | N éléments, décalage 2–3 f chacun (apparition/disparition) | — | ease-out | ref01, ref05 |
| A11 | **Stamp / press** | translateY -200 → 0 + squash 1,15/0,85 → 1 | 5 f descente + 6 f rebond | ease-in puis spring | ref01 |
| A12 | **Balance tilt** | rotation 0 → ±12° avec rebond | 12–15 f | spring(damping 8) | ref01 |
| A13 | **Waveform → flat** | amplitude d'onde 1 → 0 | 15–20 f | ease-out | ref04 |
| A14 | **Step walk** | translation par paliers (1 pas = 10 f), chaque pas easé | 10 f/pas | easeOutExpo par pas | ref04 (recréé dans LineStory) |
| A15 | **Palette shift climax** | teinte de fond froide → chaude | 15–30 f | ease-in-out | ref01 |
| A16 | **Glitch accent** | décalage RGB ±6 px + slices horizontales | 2–3 f | step | ref01 (mots-clés) |

## Règles de rythme short-form (déduites des 5 refs)
- Texte : jamais immobile plus de 0,5 s sans changement (mot ou révélation).
- Visuel : un changement significatif toutes les 1,3–2,7 s (ref03 : 3,9 s, compensé par des boucles).
- Une seule action principale à la fois dans les styles minimalistes.
- Le premier mouvement doit arriver avant 0,3 s (pas d'intro lente).

## Correspondances After Effects
- Spring/overshoot → expression *inertial bounce* (voir `templates/after-effects/expressions.md`).
- easeOutExpo → Graph Editor : influence sortante ~85 %, entrante ~10 % ; ou Flow/Ease and Wizz.
- Stroke draw → Trim Paths (End 0 → 100 %).
- Word-by-word → Text Animator Opacity + Range Selector *Based on Words*, piloté par marqueurs.
