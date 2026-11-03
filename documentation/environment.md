# Capacités réelles de l'environnement (vérifiées le 2026-11-03)

Conteneur cloud Claude Code (Linux, 4 CPU, 15 Go RAM, pas de GPU). Éphémère : **tout ce qui doit
durer est commité dans ce dépôt**.

## Ce qui fonctionne (testé)
| Capacité | Outil | Test réalisé |
|---|---|---|
| Lire/découper vidéo & audio | ffmpeg / ffprobe | 5 références analysées |
| Détection de plans | PySceneDetect 0.7 | coupes des 5 références |
| Analyse image | OpenCV 5, NumPy | mouvement/frame, palettes k-means |
| Analyse audio | librosa 1.0 | onsets, tempo, RMS, silences ; spectrogrammes ffmpeg |
| Voir des images | outil Read (vision) | planches contact, zooms, QC de rendus |
| Rendu motion design 2D | Remotion 4.0.290 + Chromium headless préinstallé | 2 compositions rendues en 1080×1920 |
| Rendu 3D | Blender 5.2.3 (module bpy), Cycles CPU | image test ~6 s/frame en 540×960 |
| SFX originaux | synthèse NumPy (`tools/sfx_synth.py`) | 13 types × variantes, spectrogrammes vérifiés |
| Loudness / export plateforme | ffmpeg loudnorm 2 passes | -14,8 LUFS / -1,4 dBTP mesurés |
| QC automatique | `tools/qc_check.py` | synchro A/V mesurée : médiane 4 ms, max 19 ms |
| Polices libres | npm @fontsource (Montserrat, Inter…) | utilisées dans les rendus |
| Paquets | PyPI, npm | OK |
| Recherche web | outils de recherche/scraping web | disponibles (non utilisés pour cette mise en place) |
| Persistance | git (ce dépôt) + skills `.claude/skills/` | chargées automatiquement par Claude Code |

## Ce qui est bloqué (politique réseau du conteneur)
| Hôte | Conséquence | Contournement actuel |
|---|---|---|
| huggingface.co | pas de modèles Whisper → pas de transcription auto | mode `--script` (voix sèche) |
| dl.fbaipublicfiles.com | pas de Demucs (séparation voix/musique/SFX) | analyse spectrale, hypothèses explicites |
| github.com (téléchargements) | pas de whisper.cpp | — |
| freesound.org, pixabay.com | pas de banques SFX/musique | synthèse procédurale |
| download.pytorch.org | pas de PyTorch → pas de modèles audio/vidéo génératifs locaux | — |

→ Pour débloquer : réglages de l'environnement cloud > Network access > ajouter les domaines
autorisés (au minimum `huggingface.co` pour la transcription mot à mot).
Doc : https://code.claude.com/docs/en/cloud-environments#network-access

## Non disponible par nature
- After Effects, Premiere Pro, DaVinci Resolve, Photoshop, Illustrator (logiciels de bureau) :
  livrables sous forme de scripts/expressions/instructions, **non testés ici**.
- Figma / Canva : connecteurs présents mais en échec de connexion dans cette session.
- Écoute audio : l'audio est mesuré, pas écouté.
- TTS / voix de synthèse : non disponible → voix off fournie par l'utilisateur.
- Génération d'images/vidéos par IA : aucun outil branché dans cette session.

## Licences des outils
- **Remotion** : gratuit pour particuliers et entreprises ≤ 3 personnes ; licence entreprise
  payante au-delà (vérifier remotion.dev/license avant usage commercial en structure).
- Blender (GPL), ffmpeg (LGPL/GPL), librosa (ISC), OpenCV (Apache 2), PySceneDetect (BSD) :
  utilisables commercialement pour produire des vidéos.
- Polices Montserrat / Inter : SIL Open Font License (usage commercial OK).
