# Catalogue de patterns sonores

Les sons de `tools/sfx_synth.py` sont synthétisés (originaux, libres de droits, pas de risque Content ID).

## Règles de synchronisation
- **L'audio part 1 frame (≈33 ms) avant l'image** : le cerveau perçoit le son plus vite que l'image,
  un impact parfaitement aligné paraît légèrement en retard. Tolérance acceptable : ±50 ms (QC).
- **Whoosh** : le pic d'énergie doit tomber au moment de vitesse maximale du mouvement, donc le son
  commence 4–8 frames AVANT la transition.
- **Riser** : se termine exactement sur le drop/l'impact (sub_hit), jamais après.
- **Voix = priorité** : SFX entre -18 et -10 dB sous la voix ; musique à -20/-24 dB sous la voix
  (ducking/sidechain si la musique a des fréquences médiums).
- Ne pas sonoriser chaque mot avec le même son : alterner 2–3 variantes (fatigue auditive).
- Loudness final : -14 LUFS intégré, true peak ≤ -1,5 dBTP avant encodage AAC (mesuré : l'AAC
  remonte le pic d'environ +0,5 dB).

## Correspondance événement visuel → SFX
| Événement | SFX | Volume relatif | Offset |
|---|---|---|---|
| Mot normal qui apparaît (style 1 mot) | pop (variantes alternées) | faible (0,25–0,3) | -1 f |
| Mot-clé / punchline | sub_hit + pop | fort (0,55) | -1 f |
| Mot révélé dans un sous-titre | click / typewriter (très bas) | très faible (0,1–0,15) | -1 f |
| Changement de scène rapide | swish | moyen | -4 f |
| Grande transition / light sweep | whoosh_in | moyen | -6 f |
| Montée de tension avant révélation | riser (2 s) → sub_hit | crescendo | fin du riser = impact |
| Compteur qui défile | tick (1 par incrément visible, max ~12/s) | faible | 0 |
| Validation ✓ / erreur ✗ | blip_up / blip_down | moyen | 0 |
| Idée, étincelle, illumination | shimmer | faible | 0 |
| Glitch visuel | glitch | moyen | 0 |

## Observations sur les références (mesures, pas écoute)
- Toutes : voix très dominante, musique de fond tonale/ambient en continu, mix fort (pic ≈ -4,5 dBFS).
- ref04/05 : drone grave permanent < 300 Hz = signature « contemplative ».
- ref01/ref02 : nappe tonale + transitoires larges bande aux coupes.
- ref03 : densité d'onsets la plus élevée → SFX UI fréquents probables (bulles, notifs).

## Style « Stickman Spotlight » (`tools/stickman_build.py`)
| Événement | SFX | Volume | Synchro |
|---|---|---|---|
| Pied qui touche le sol | `footstep` (sec) / `footstep_wet` (pluie), 4 variantes alternées | 0,36–0,42 × force de l'allure ; pied lointain × 0,82 | instant exact calculé par le moteur d'animation, -4 ms |
| Allumage du projecteur (début de scène) | `light_on` (relais + bourdonnement 100 Hz) | 0,34 | +20 ms |
| Décor qui se dessine | `shimmer` | 0,09 | +180 ms |
| Baisse de lumière (fin de scène) | `whoosh_out` | 0,10 | fin − 450 ms |
| 1er mot d'un groupe *mis en valeur* | `pop` | 0,12 | instant de révélation du mot |
| Scènes pluvieuses | `rain_loop` (souffle filtré + gouttes) | 0,5 | fondu 0,5 s, début − 250 ms |
| Fond | `music_gen.py --mood lofi` (78–80 BPM) | -17 dB | drop ~1,2 s |
Mesuré sur la démo : synchro pas/son médiane 12 ms, max 45 ms (19 appuis).
