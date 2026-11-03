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

## 2b. Une métaphore visuelle 3D par phrase (ce qui fait le niveau « pro » des références)
Chaque ligne reçoit une `scene`. Choisir l'objet qui **résume l'idée en 1 s, sans le son**.

| Type | Paramètres | Exemples d'idées |
|---|---|---|
| `icon` | `icon`, `color`, `color2` | voir tableau ci-dessous |
| `emoji` | `emoji` | concept sans icône (🧠 cerveau, 😨 peur, 📌 enregistrer) — rendu 2D dans l'espace 3D |
| `crowd` | `action` idle/jump/walk/leave/rise/fall, `count` | « tout le monde », « les autres partent » (leave), « toi tu montes » (rise), « tu échoues » (fall : seul le héros tombe), « ensemble » (jump) |
| `chart` | `trend` up/down/exp/flat-then-up | progression, effet composé (exp), patience (flat-then-up), déclin |
| `counter` | `from`, `to`, `prefix`, `suffix` | chiffres choc : `0 → 702 " jours"`, `4000 → 1000000 " €"` |
| `stairs` | — | étapes, progression pas à pas |
| `versus` | `icon`, `icon2` | choix/opposition (ex. phone vs bulb) |

Icônes (originales, procédurales) : `heart` amour/envie · `bolt` énergie/choc · `up` `down` hausse/baisse ·
`check` `cross` vrai/faux · `star` excellence/favori · `crown` statut · `gear` système/process ·
`bubble` message/conversation · `phone` réseaux/dopamine · `clock` temps qui file · `hourglass`
patience/délai · `coin` `coins` argent · `lock` secret/bloqué (s'ouvre) · `trophy` réussite ·
`bulb` idée · `target` objectif (flèche qui touche) · `rocket` démarrage/croissance · `battery`
énergie/fatigue · `magnifier` détail/analyse · `mountain` défi/sommet · tout caractère (`€`, `?`, `!`, `%`, `VS`, chiffres).

Règles : varier les types (pas 3 icônes d'affilée si une foule/un graphique raconte mieux) ;
`climax_line` = index de la ligne « solution / retournement » → bascule chaude du fond.
Planche de contrôle de toutes les icônes : composition `Gallery3D`.

## 3. Écrire `projects/<slug>/plan.json`
```json
{"slug":"...","prompt":"<prompt original>","theme":"neon","font":"montserrat","entrance":"flip","fps":60,
 "voice":{"engine":"pico","speed":1.08},"music":{"mood":"hype","bpm":120,"seed":7},
 "climax_line":5,
 "lines":[{"text":"...","accents":["..."],"scene":{"type":"icon","icon":"hourglass"}}]}
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
- `python3 tools/compare_to_refs.py renders/<slug>/<slug>.mp4` : mouvement, images figées,
  événements/s, changements de plan vs les 5 références → corriger ce qui sort de la plage.
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
