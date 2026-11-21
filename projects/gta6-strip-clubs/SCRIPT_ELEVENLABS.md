# Voix off : « Les 3 clubs de strip-tease de GTA 6 » (~62 s)

## Voix et modèle
**Hugo – Punchy French Creator** (`3Tp5mYhT9wrfnry9pzvV`) · **Eleven v4** (ou v3), français.
Un projet ElevenLabs a été créé depuis le connecteur avec une version précédente, plus courte, du texte :
colle plutôt le texte ci-dessous, qui ajoute deux phrases sourcées (enseigne du NINE1NINE, enseigne du Delights).

## Script (une seule génération, à coller tel quel)
```
[excited] Il n'y a que TROIS clubs de strip-tease dans tout GTA 6…
et je vais te montrer EXACTEMENT où ils sont sur la carte !
[curious] On commence avec le NINE1NINE. Il est en plein centre de Vice City, entre Downtown et Crosstown… juste à côté de la boîte The Vault.
[excited] C'est le plus luxueux des trois. Tu ne peux pas le rater : son nom est écrit en grand sur la façade. Et bonne nouvelle : tu peux y aller dès le début de l'aventure.
Deuxième emplacement : le Jack of Hearts. Il se trouve au nord de Crosstown, sur Miramar Drive.
[serious] Ce club appartient à Boobie Ike. Mais attention : il faudra atteindre le chapitre 3 de l'histoire pour pouvoir y entrer.
[dramatically] Enfin, direction Port Gellhorn, dans le comté de Kelly… au nord-ouest de la carte.
Le Delights Cabaret est juste au bord de l'Interstate 404.
[laughs] C'est le plus modeste… et le moins cher des trois. Son enseigne annonce qu'il est ouvert toute la nuit… et qu'il recrute des danseuses.
[excited] Voilà les trois clubs de strip-tease de GTA 6 !
[warmly] Enregistre cette vidéo pour ne pas les perdre… et dis-moi en commentaire lequel tu préfères !
```

## Ensuite
Exporte en MP3 ou WAV et envoie-moi le fichier. Je relance :
```bash
python3 tools/gta_build.py projects/gta6-strip-clubs/plan.json --voice-file <fichier>
```
Les balises d'émotion sont ignorées au calage. Sous-titres, carte, épingles et bruitages se recalent sur la prise.

## Faits et sources
Chaque information du script est recoupée sur au moins 2 sources (liste complète dans `plan.json > sources`
et `renders/gta6-strip-clubs/sources.md`). Positions des marqueurs : base communautaire GTADB (L190, L172,
L629) projetée sur le poster officiel par une transformation affine calée sur 5 repères (résidus de 6 à 33 px).
