# Motion Design Library

Bibliothèque de production motion design : analyse de références, skills réutilisables, outils
testés et templates pour produire des vidéos courtes **originales** (TikTok, Reels, Shorts).

- Instructions de travail pour Claude : [`CLAUDE.md`](CLAUDE.md)
- Capacités réelles et limites : [`documentation/environment.md`](documentation/environment.md)
- Styles analysés : [`references/index.md`](references/index.md)
- Journal : [`changelog.md`](changelog.md)

## Skills (`.claude/skills/`)
| Skill | Usage |
|---|---|
| **prompt-to-video** | **Un prompt → vidéo virale finie (texte 3D 60 fps, voix, musique, SFX, QC)** |
| video-reference-analysis | Décomposer une référence (plans, palette, typo, animations, son) |
| kinetic-typography | Texte synchronisé voix (1 mot géant / sous-titres mot à mot) |
| motion-graphics | Métaphores visuelles 2D, pictos, compteurs, HUD en Remotion/SVG |
| transition-design | Choix et synchro des transitions |
| sound-design | SFX originaux, timeline sonore, mix, loudness |
| short-form-production | Workflow complet brief → export → monétisation |
| quality-control | QC automatique + visuel avant livraison |
| after-effects | Expressions + script JSX (à tester dans AE) |
| blender-3d | 3D headless (bpy, Cycles CPU) |

## Outils
```bash
python3 tools/make_video.py projects/<slug>/plan.json     # prompt → vidéo complète
python3 tools/tts_voice.py script.json out/               # voix hors ligne + timings
python3 tools/music_gen.py music.wav --mood hype --drop 2 # musique originale
python3 tools/mix_audio.py master.wav --voice v.wav --music m.wav --sfx sfx.json
python3 tools/analyze_reference.py ref.mp4 out/          # analyse de référence
python3 tools/sfx_synth.py sfx/ --variants 3              # SFX originaux
python3 tools/transcribe_words.py voix.wav words.json --model small   # timings mot à mot
tools/finish.sh raw.mp4 final.mp4                         # -14 LUFS + export plateforme
python3 tools/qc_check.py final.mp4 --events words.json   # contrôle qualité
```
