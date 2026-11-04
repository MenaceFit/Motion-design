# Voix ElevenLabs — mise en place (une fois)

1. **Réseau** : réglages de l'environnement cloud → Network access → ajouter le domaine autorisé
   `api.elevenlabs.io` (laisser « Allow package managers » coché).
   Doc : https://code.claude.com/docs/en/cloud-environments#network-access
2. **Clé** : réglages de l'environnement → secrets / variables d'environnement → `ELEVENLABS_API_KEY`
   = votre clé. Ne jamais la coller dans le chat ni la commiter.
3. **Nouvelle session** (les réglages ne s'appliquent qu'aux sessions démarrées après).
4. Choisir les voix : `python3 tools/elevenlabs_voices.py --search "narrateur"` puis reporter les
   `voice_id` dans `projects/teddy-j30/epXX/full.json` → `voices` :
   - `narrator` : voix **masculine**, grave, expressive (documentaire moqueur) ;
   - `teddy` : homme jeune, nonchalant ;
   - `mamie` : femme âgée, énergique.
5. Rendre : `tools/teddy_render.sh projects/teddy-j30/ep01/full.json` (puis ep02).

## Intonation
- Modèle **`eleven_v3`** : le plus expressif ; comprend les balises audio écrites dans `tts_text`
  (`[mysterious]`, `[sarcastic]`, `[whispers]`, `[laughs]`, `[excited]`, `[sighs]`, `[shouts]`…).
  Le texte affiché à l'écran (`text`) ne contient jamais ces balises.
- Avec `eleven_multilingual_v2` les balises sont retirées automatiquement ; l'intonation passe par
  `style` (0,4–0,7) et une `stability` basse (0,3–0,4) + `previous_text`/`next_text` (enchaînement).
- Si le modèle ne renvoie pas d'horodatage, les mots sont répartis automatiquement (repli).
- Une ligne en erreur (voix invalide, quota) bascule seule sur la voix hors ligne ; voir
  `renders/<slug>/voice_report.json`.

## Licence / plateformes
Vérifier que votre offre ElevenLabs autorise l'usage commercial ; activer le label « contenu
généré par IA » sur TikTok (voix de synthèse).
