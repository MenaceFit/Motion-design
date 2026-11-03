# Projets

Un dossier par vidéo : `projects/<slug>/plan.json` (écrit à partir du prompt, voir skill
`prompt-to-video`). Les rendus (`renders/`) ne sont pas versionnés ; seul le plan l'est, ce qui
permet de régénérer la vidéo à l'identique (`seed` musique/SFX fixés).

```bash
python3 tools/make_video.py projects/<slug>/plan.json --out renders/ --preview  # aperçu 30 fps
python3 tools/make_video.py projects/<slug>/plan.json --out renders/            # final 60 fps
```
