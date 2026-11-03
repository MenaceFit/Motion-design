---
name: transition-design
description: Conçoit des transitions entre plans (cut sur le mot, match cut, light sweep, morph de forme, push caméra, waveform, glitch) cohérentes avec le style et synchronisées au son. À utiliser lors du montage d'une séquence de scènes motion design.
---

# Transition design

**Objectif** : chaque transition a une raison narrative et un son ; aucune transition décorative.

## Choisir la transition
| Situation narrative | Transition | Durée (30 fps) | SFX |
|---|---|---|---|
| Idée suivante dans le même raisonnement | **Cut sec sur le mot** | 0 | aucun / pop |
| Même forme, nouveau sens (cercle → horloge) | **Match cut / morph** | 6–10 f | swish |
| Révélation, « découverte » | **Light sweep** (barre lumineuse) | 4–6 f | whoosh_in |
| Entrer dans le détail | **Push-in** jusqu'à remplir le cadre puis cut | 10–15 f | whoosh_in |
| Changement de chapitre | **Fondu par le noir** court | 6–8 f | sub_hit ou silence |
| Réduction du bruit / calme | **Waveform → ligne plate** | 15–20 f | décrescendo |
| Choc, erreur, contradiction | **Glitch** RGB + slices | 2–4 f | glitch |
| Climax positif | **Bascule de palette** froide → chaude | 15–30 f | shimmer + riser |

## Procédure
1. Lister les coupes du storyboard et leur rôle (continuité, rupture, révélation).
2. 70–80 % de cuts secs synchronisés sur la voix (ce que font les 5 références) ; garder les
   transitions marquées pour les changements de chapitre et les révélations.
3. Synchroniser : le pic visuel (vitesse max) = pic du whoosh ; le son démarre 4–8 f avant.
4. Vérifier qu'aucune transition ne crée de frame noire involontaire (QC blackdetect).

## Erreurs fréquentes
- Mettre une transition à chaque plan (fatigue, ralentit le rythme).
- Transition plus longue que 0,5 s en short-form (sauf chapitre).
- Whoosh aligné sur le début du mouvement au lieu de son pic.

## Checklist
- [ ] Chaque transition a un rôle narratif
- [ ] ≥ 70 % de cuts secs
- [ ] SFX alignés (±50 ms)
- [ ] Pas de noir involontaire

## Limites
Les transitions « light sweep », « glitch », « morph » ne sont pas encore codées en composants
Remotion réutilisables (prochaine étape — voir changelog).
