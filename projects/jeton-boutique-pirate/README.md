# TikTok 10 s — « Jeton de la Boutique Pirate »

Composition Remotion `PirateToken` (`templates/remotion-kinetic/src/PirateToken.tsx`), 1080×1920, 60 fps, 10 s.
Habillage motion original autour de **tes captures de jeu**. Aucun faux jeton n'est dessiné.

## Faits affichés (vérifiés le 2026-11-13)
- **1 chance sur 137 500 par coffre** ouvert en partie classique : chiffre confirmé par le compte Fortnite Status
  le 7 novembre 2026 (rapporté par Dexerto.fr, 9/11/2026). ×1,5 pendant les « Heures des trésors ».
- Le jeton donne **2 activations de 14 jours** sur une sélection de cosmétiques de la boutique, sans V-Bucks.
  Exclus : offres en argent réel, cadeaux, récompenses du Battle Pass.
- Source : https://www.dexerto.fr/fortnite/fortnite-revele-enfin-chances-obtenir-jeton-boutique-pirate-1663649/
- La vidéo ne dit **jamais** que l'abonnement augmente les chances : le CTA porte sur les astuces.

## Captures à fournir (enregistrées par toi en jeu, sans son ou avec, peu importe)
| Prop | Contenu | Utilisé à |
|---|---|---|
| `chestClip` + `chestStart` | ouverture d'un coffre (≥ 1 s) | 0–0,55 s (zoom violent) |
| `tokenClip` + `tokenStart` | le jeton à l'écran (ton loot, ou l'objet dans l'inventaire/la boutique) | 0,55–2 s plein écran, puis 2–5 s dans le médaillon doré |
| `chestsClip` + `chestsStart` | plusieurs coffres qui s'ouvrent (≥ 4 s) | 6,6–8 s, 3 cuts rapides |

Déposer les fichiers dans `templates/remotion-kinetic/public/projects/jeton-boutique-pirate/`, puis :
```bash
R=$PWD/renders/jeton-boutique-pirate
python3 projects/jeton-boutique-pirate/build_audio.py $R
cp $R/master.wav templates/remotion-kinetic/public/projects/jeton-boutique-pirate/
cat > $R/props.json <<'J'
{"audio":"projects/jeton-boutique-pirate/master.wav",
 "chestClip":"projects/jeton-boutique-pirate/coffre.mp4","chestStart":0.2,
 "tokenClip":"projects/jeton-boutique-pirate/jeton.mp4","tokenStart":0,
 "chestsClip":"projects/jeton-boutique-pirate/coffres.mp4","chestsStart":0}
J
cd templates/remotion-kinetic && npx remotion render src/index.ts PirateToken $R/raw.mp4 --props=$R/props.json --crf=16 --concurrency=4 && cd ../..
tools/finish.sh $R/raw.mp4 $R/final.mp4 && python3 tools/qc_check.py $R/final.mp4 --fps 60 --events $R/events.json
```

## Publication
- Légende : « 1 chance sur 137 500… abonne-toi pour nos astuces 🏴‍☠️ » + #fortnite #fortnitefr #jetonpirate #boutiquepirate #onepiece
- Pas de faux concours (« je donne le jeton », « like pour gagner ») : arnaque, interdit par TikTok.
- Fan content : ne pas suggérer de partenariat avec Epic Games ; pas de logo Fortnite ajouté en surimpression.
