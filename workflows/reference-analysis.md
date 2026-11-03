# Workflow — Analyse d'une vidéo de référence

Durée typique : 10–20 min par vidéo de < 60 s.

```
vidéo reçue
   │
   ├─1─ tools/analyze_reference.py  → metadata · coupes · mouvement · palette · audio · planche contact
   ├─2─ lecture planche contact + 2–4 zooms pleine résolution        (typo, contours, ombres, détails)
   ├─3─ couleurs d'accent (k-means pixels saturés) + spectrogramme 12 s
   ├─4─ découpage TC · visuel · texte · animation · rôle narratif
   ├─5─ comparaison avec references/visual-styles/*  → même famille ? nouveauté ?
   ├─6─ séparation réutilisable / propriétaire
   └─7─ mise à jour : fiche de style · index · catalogues patterns · skill concernée · changelog
```

## Livrable d'analyse (format de réponse)
1. **Fiche technique** : format, FPS, durée contenu, nb de plans, durée moyenne, mouvement moyen,
   palette hex, tempo, loudness.
2. **Identité visuelle** : fond, personnages, objets, typo, couleurs par rôle.
3. **Découpage** : tableau des séquences avec timecodes.
4. **Mouvement** : patterns du catalogue reconnus (A1…A16) + nouveaux patterns.
5. **Sound design** : ce qui est mesuré vs ce qui est supposé (le dire).
6. **Ce qu'on reprend / ce qu'on remplace.**
7. **Recommandations** pour une création originale dans cet univers.

## Si la vidéo n'est pas accessible
Demander le fichier, un lien direct téléchargeable, ou des captures avec timecodes. Ne jamais
décrire une vidéo non consultée.
