---
name: after-effects
description: Fournit des expressions After Effects (overshoot, inertial bounce, wiggle contrôlé, typewriter, compteur, loop) et des scripts ExtendScript (.jsx) pour générer automatiquement des compositions de kinetic typography à partir d'un words.json. À utiliser quand l'utilisateur travaille dans After Effects ou demande un livrable AE.
---

# After Effects (expressions & scripts)

**Important** : After Effects n'est pas disponible dans le conteneur cloud. Les livrables AE sont
écrits d'après le guide de scripting d'Adobe et doivent être **testés par l'utilisateur** ; le
dire explicitement à chaque livraison.

## Ressources
- `templates/after-effects/expressions.md` : expressions commentées prêtes à coller.
- `templates/after-effects/words_to_comp.jsx` : crée une comp 1080×1920 avec un calque texte par
  mot de `words.json`, positionné dans le temps, animation pop par expression.

## Procédure
1. Générer `words.json` (`tools/transcribe_words.py`).
2. Dans AE : *Fichier > Scripts > Exécuter le fichier de script…* → `words_to_comp.jsx` → choisir
   `words.json`.
3. Ajuster police/couleurs dans les variables en tête de script.
4. Import de la voix + SFX ; vérifier la synchro sur la timeline.
5. Rendu : Adobe Media Encoder H.264 → puis `tools/finish.sh` (loudness) et `tools/qc_check.py`.

## Erreurs fréquentes
- Expressions en moteur Legacy ExtendScript vs JavaScript : les expressions fournies sont
  compatibles avec le moteur JavaScript (par défaut depuis AE 16.0).
- Police non installée → AE substitue silencieusement : vérifier le nom PostScript.

## Limites
Non testé dans AE depuis ce conteneur. Les retours d'erreur de l'utilisateur doivent être consignés
ici pour fiabiliser la skill.
