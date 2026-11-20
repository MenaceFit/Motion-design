# Script voix off avec émotions : « Le code 250 000 $ de GTA 6 » (~36 s)

## Voix choisie
**Hugo – Punchy French Creator** · voice_id `3Tp5mYhT9wrfnry9pzvV` (bibliothèque ElevenLabs).
Voix masculine française native, « punchy », pensée pour les accroches et les réactions naturelles
en format court. Choix fait sur la description de la bibliothèque (extrait non écouté) : écoute
l'aperçu avant de générer.
Alternatives : **Léo – Energetic & Engaging** (`jsScnYkNNda9Q1NES5nn`), plus jeune et plus hype ;
**Liam – Sharp & Pro** (`EmZGlxI7QPvCEMOkFhB9`), plus posée.

## Modèle
**Eleven v4** (ou **Eleven v3**) : ce sont les seuls qui jouent les balises d'émotion `[...]`.
Ces modèles n'ont pas de curseur de vitesse : le rythme vient des balises, des « … » et de la ponctuation.
Avec Multilingual v2, les balises seraient lues à voix haute : à éviter.

## Script à coller tel quel, en une seule génération
```
[excited] Ce code te donne 250 000 dollars… sur GTA 6 !
[mischievously] [whispers] Mais personne ne te dit le piège.
[curious] Déjà : les codes marchent seulement après l'histoire. Les 91 missions.
[excited] Ensuite, sors ton téléphone avec la flèche du haut.
Maintiens L1, et appuie sur R1. Sur Xbox : LB, et RB.
[dramatically] Puis tape : haut, droite, bas, gauche… haut, gauche, bas, droite.
[shouting] Et BOUM ! [excited] 250 000 dollars, direct sur ton compte ! [laughs]
[happy] Et c'est le même code sur PS5 et sur Xbox.
[serious] Mais attention : après un code, tu ne peux plus sauvegarder… [sighs] et tes trophées sont désactivés.
[warmly] Alors fais une sauvegarde à part, avant de tricher.
[excited] Abonne-toi pour tous les autres codes de GTA 6 !
```

## Ce que fait chaque émotion dans le montage
| Ligne | Balise | Pourquoi |
|---|---|---|
| Accroche | `[excited]` | énergie dès la 1re seconde, sur le compteur qui monte |
| Le piège | `[mischievously] [whispers]` | la musique se coupe à cet instant : un chuchotement complice crée la tension |
| Les 91 missions | `[curious]` | ton explicatif, on relance l'attention |
| Étapes 1 et 2 | `[excited]` (maintenu) | rythme de tuto rapide |
| Le code | `[dramatically]` | chaque direction tombe sur l'allumage d'une touche à l'écran |
| Et BOUM | `[shouting]` puis `[excited]` + `[laughs]` | tombe sur le drop musical, le ka-ching et l'explosion de $ |
| PS5 = Xbox | `[happy]` | info bonus, ton léger |
| Avertissement | `[serious]` + `[sighs]` | contraste, glitch et alerte rouge à l'écran |
| Conseil | `[warmly]` | ton bienveillant (crédibilité) |
| CTA | `[excited]` | relance finale sur le bouton S'abonner |

## Ensuite
Génère, garde la meilleure prise (fais-en 2 ou 3 si une balise sonne faux), exporte en MP3 ou WAV,
puis envoie-moi le fichier. Je lance :
```bash
python3 tools/gta_build.py projects/gta6-code-argent/plan.json --voice-file <fichier>
```
Les balises sont ignorées au calage (testé : 96 % de caractères communs entre le script et la prise).
