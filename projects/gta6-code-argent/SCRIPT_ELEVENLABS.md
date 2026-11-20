# Script voix off : « Le code 250 000 $ de GTA 6 » (~36 s)

À coller **tel quel** dans ElevenLabs, en **une seule génération**, puis m'envoyer le fichier.
Les nombres sont écrits en lettres pour qu'ils soient bien prononcés. Les « … » et les virgules
servent à placer les respirations.

```
Ce code te donne deux cent cinquante mille dollars, sur GTA 6.
Mais personne ne te dit le piège.
Déjà, les codes marchent seulement après l'histoire : les quatre-vingt-onze missions.
Ensuite, sors ton téléphone avec la flèche du haut.
Maintiens L1, et appuie sur R1. Sur Xbox : LB, et RB.
Puis tape : haut, droite, bas, gauche, haut, gauche, bas, droite.
Et boum : deux cent cinquante mille dollars, direct sur ton compte !
Et c'est le même code sur PS5 et sur Xbox.
Mais attention : après un code, tu ne peux plus sauvegarder… et tes trophées sont désactivés.
Alors fais une sauvegarde à part, avant de tricher.
Abonne-toi pour tous les autres codes de GTA 6 !
```

## Réglages conseillés
- **Modèle** : Eleven v3 (le plus expressif) ou Eleven Multilingual v2 ; langue français.
- **Voix** : masculine ou féminine énergique, style « gaming / YouTube » (bibliothèque de voix ElevenLabs, filtre French).
- **Stabilité** : environ 35 à 45 % (ou « Natural » en v3). **Similarité** : environ 75 %. **Style** : environ 20 à 30 %. **Vitesse** : 1,05 à 1,15.
- Optionnel en v3 : ajouter `[excited]` devant la 1re et la 7e ligne, et `[whispers]` devant « Mais personne ne te dit le piège. ».
  Ces balises ne sont pas prononcées et n'empêchent pas le calage.
- **Export** : MP3 44,1 kHz (192 kb/s ou plus) ou WAV. Un seul fichier pour tout le script.

## Ce que je fais ensuite
```bash
python3 tools/gta_build.py projects/gta6-code-argent/plan.json --voice-file <ton_fichier.mp3>
```
Whisper retranscrit ta prise, la cale sur le script, puis tout s'aligne sur ta voix : sous-titres,
plans, transitions, combo de touches, compteur et SFX. Si tu changes une phrase en enregistrant,
dis-le-moi : le calage tolère de petites différences, mais les sous-titres afficheront le texte du plan.
