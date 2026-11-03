# Viralité & monétisation — ce qui est établi, ce qui est supposé

Recherche web faite le 2026-11-03. **Constat honnête** : il n'existe quasiment pas de données
officielles publiées par TikTok/YouTube sur les seuils de rétention ; la plupart des chiffres
circulants viennent de blogs d'outils marketing, non vérifiables. On les traite comme des
**ordres de grandeur**, et on mesure nos propres vidéos (Analytics) pour calibrer.

## 1. Ce qui fait consensus (toutes sources + observation des 5 références)
| Levier | Règle de production | Implémentation dans nos outils |
|---|---|---|
| **Hook ≤ 1–3 s** | 1re phrase contre-intuitive ou question qui crée une boucle ouverte ; premier mot à l'écran avant 0,3 s ; premier impact visuel+sonore avant 1 s | `lead` 0,15 s, drop musical calé sur le 1er mot accentué |
| **Taux de complétion** | Vidéo courte = complétion plus élevée (benchmarks cités : ~92 % < 15 s, ~84 % 16–30 s, ~68 % 31–60 s — source secondaire Socialinsider) | viser 20–35 s pour la viralité pure |
| **Rien de figé** | Changement visuel toutes les 0,3–2 s ; le texte bouge en continu | texte 3D qui respire, caméra Perlin, particules en parallaxe |
| **Lisibilité son coupé** | Tout le message doit passer par le texte à l'écran | 1 bloc de mots synchronisé à la voix |
| **Rythme sonore** | Chaque coupe/mot clé ponctué (swish, impact) ; musique avec drop | `sfx_plan` + `music_gen --drop` |
| **Boucle ouverte → payoff** | Promettre tôt (« la solution ? »), livrer à la fin | structure de script imposée (skill prompt-to-video) |
| **CTA d'enregistrement/partage** | « Enregistre pour… » : les enregistrements/partages sont des signaux d'engagement forts (consensus créateurs, non chiffré officiellement) | dernière ligne du script |
| **Barre de progression** | Indique que la fin est proche → réduit l'abandon (pratique courante, pas d'étude officielle) | `progressBar: true` |

Points **contestés** dans les sources : boucles « seamless » (certains disent qu'elles gonflent
artificiellement la rétention, YouTube exclut les relectures des *engaged views*), et rythme
(cut rapide vs lent : résultats contradictoires). → À tester par A/B sur nos propres comptes.

## 2. Monétisation : contraintes qui changent nos choix
- **TikTok Creator Rewards** : selon plusieurs sources tierces (non officielles), seules les
  vidéos de **plus d'1 minute** sont rémunérées, avec seuils de 10k abonnés / 100k vues sur 30 j,
  18+ et pays éligibles (liste variable selon les sources). → **tension** : viralité = court,
  rémunération = > 60 s. Stratégie : courts pour croître, formats 61–90 s pour monétiser.
  À vérifier dans *Outils créateur* de l'app.
- **YouTube Partner Program** : depuis le 15/07/2025 la règle « contenu répétitif » est renommée
  **« contenu inauthentique »** ; vise les vidéos produites en masse sur un même template avec de
  faibles variations et les **diaporamas / textes défilants sans narration ni commentaire**.
  Appliqué au niveau de la chaîne. → le format « texte + musique sans voix » est **risqué pour la
  monétisation YouTube** ; préférer une narration (idéalement la voix de l'utilisateur) et varier
  réellement les sujets, thèmes, structures.
- **IA / voix de synthèse** : les sources concordent sur une obligation de **label « contenu
  généré par IA »** sur TikTok pour les contenus réalistes, voix synthétiques citées par plusieurs
  sources (périmètre exact incertain, surtout renforcé pour les pubs depuis juillet 2026).
  → Avec la voix Pico/Piper : **activer le label IA**. Avec la voix de l'utilisateur : pas de voix IA.
- **Aucune garantie de monétisation** : dépend des règles du moment, du pays, de l'originalité.

## 3. Formule de script virale (utilisée par la skill prompt-to-video)
1. **Hook (0–2 s)** : contre-intuition (« Tu ne procrastines pas par paresse. »), chiffre choc,
   ou « Personne ne te dit que… ».
2. **Mécanisme (2–10 s)** : le *pourquoi*, 2–3 phrases très courtes, 1 image mentale chacune.
3. **Escalade (10–18 s)** : exemples concrets du quotidien du spectateur (« Un scroll. Une vidéo. »).
4. **Boucle ouverte → payoff (18–28 s)** : « La solution ? » → action simple et actionnable.
5. **Punchline + CTA (dernières 3 s)** : phrase mémorable + « Enregistre / Envoie à … ».
Contraintes : phrases ≤ 8 mots, ~2,5–3 mots/s, 1 mot-clé accentué par phrase (max 2),
1 emoji max par phrase, tutoiement, zéro jargon.

## 4. Ce que nous ne pouvons pas mesurer ici
Pas d'accès aux analytics des comptes. Après publication, relever : % vues > 3 s (ou « viewed vs
swiped away » sur Shorts), durée moyenne, complétion, partages/enregistrements → les consigner dans
`changelog.md` pour ajuster hooks, durée et rythme.

## Sources
- Benchmarks complétion (secondaire, cite Socialinsider) : https://www.shortimize.com/blog/compare-watch-time-tiktok-vs-reels-vs-shorts
- Hook / 3 premières secondes (vendeurs, non vérifié) : https://www.opus.pro/blog/tiktok-hook-formulas ; https://dev.to/bulkdl/hook-engineering-the-science-of-the-first-3-seconds-in-short-form-video-2026-2jp9
- Shorts « viewed vs swiped away » : https://contentstudio.io/blog/youtube-shorts-analytics-guide ; https://www.socialinsider.io/blog/youtube-shorts-analytics-guide/
- TikTok Creator Rewards (tiers) : https://www.toptal.com/creator/post/how-to-join-the-tiktok-creator-rewards-program ; https://adaptlypost.com/blog/tiktok-creator-fund-eligibility-requirements
- YouTube contenu inauthentique : https://www.socialmediatoday.com/news/youtube-clarifies-monetization-update-inauthentic-repeated-content/752892/ ; https://www.subsub.io/blog/youtube-inauthentic-content-policy-2025
- Labels IA TikTok (tiers) : https://www.cinerads.com/blog/tiktok-ai-content-policy ; https://www.echotik.live/blog/tiktok-ai-content-labeling-rules-2026/
