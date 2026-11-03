---
name: prompt-to-video
description: Transforme un simple prompt (« fais une vidéo virale sur X ») en vidéo verticale finie — script viral, plan.json, voix, musique originale, SFX, texte 3D animé 60 fps, mix, QC — via tools/make_video.py. À utiliser dès que l'utilisateur donne un sujet/prompt et attend une vidéo.
---

# Prompt → vidéo (texte 3D, 9:16)

## 1. Décisions à prendre seul (ne pas interroger l'utilisateur)
- **Durée** : 20–35 s par défaut (viralité). Si l'utilisateur vise la rémunération TikTok : 61–75 s.
- **Thème** selon le sujet : `neon` (psycho, cerveau, réseaux), `gold` (argent, réussite, luxe),
  `ice` (science, tech, calme), `mono` (philosophie, discipline), `fire` (motivation, colère,
  urgence), `toxic` (danger, arnaques, santé).
- **Musique** : `hype` (faits choc, énergie), `tension` (mystère, révélation), `inspire`
  (motivation), `dark` (introspection). BPM 110–128. `seed` différent à chaque vidéo.
- **Entrée** : `flip` (défaut), `slam` (agressif, faits choc), `twist` (ludique).
- **Police** : `montserrat` (défaut, italique dynamique), `anton` (condensée, très impactante,
  pour blocs longs), `archivo`, `montserratUp`.

Ne demander que si le sujet est ambigu ou sensible (une seule question).

## 2. Écrire le script (règles de `documentation/virality.md` §3)
Hook contre-intuitif ≤ 2 s → mécanisme → escalade concrète → « La solution ? » → payoff →
punchline + CTA « Enregistre… ». Phrases ≤ 8 mots. 1–2 `accents` par phrase (mots qui portent le
sens), ≤ 1 `emoji` par phrase sur un mot concret. Faits : uniquement vérifiables/prudents ;
pas de promesse santé/argent trompeuse.

## 3. Écrire `projects/<slug>/plan.json`
```json
{"slug":"...","prompt":"<prompt original>","theme":"neon","font":"montserrat","entrance":"flip","fps":60,
 "voice":{"engine":"pico","speed":1.08},"music":{"mood":"hype","bpm":120,"seed":7},
 "lines":[{"text":"...","accents":["..."],"emoji":{"mot":"🧠"}}]}
```
Voix : `{"engine":"pico"}` (synthèse hors ligne, label IA requis), `{"file":"voix.wav"}` (voix de
l'utilisateur, recommandé pour la monétisation), ou `null` (texte + musique, mots calés sur les
temps — **risqué pour la monétisation YouTube**, voir virality.md).

## 4. Produire
```bash
python3 tools/make_video.py projects/<slug>/plan.json --out renders/ --preview   # aperçu 30 fps
python3 tools/make_video.py projects/<slug>/plan.json --out renders/             # final 60 fps
```
Lancer le final en arrière-plan (≈ 1,3 s/frame sans GPU : 25 s de vidéo à 60 fps ≈ 30 min).

## 5. Contrôler avant livraison
- Lire `renders/<slug>/qc.txt` (format, loudness, noir, figé). Les avertissements de synchro
  sur un mix voix+musique+SFX sont souvent des faux positifs (onsets de batterie) : vérifier à l'œil.
- Planche d'images : un frame au milieu de 6–8 blocs + le dernier frame →
  pas de débordement, emoji non coupé, dernier mot présent, barre de progression visible.
- Livrer le MP4 + rappeler : label IA si voix de synthèse, vérifier les règles de monétisation.

## Limites connues
- Voix Pico = synthétique, audible. Voix neuronale (Piper) dès que huggingface.co est autorisé.
- Pas de B-roll/illustrations générées : la vidéo repose sur la typo 3D, emojis, particules.
  Pour plus de variété visuelle, combiner avec les scènes 2D (skill motion-graphics).
- Emojis = police Noto Color Emoji (OFL) : rendu dépend de la police installée.
