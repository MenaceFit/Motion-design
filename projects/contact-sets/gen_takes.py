# Génère K prises par phrase (Chatterbox multilingue FR, voix par défaut, watermark Perth).
import sys, torch, torchaudio as ta
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
L = [
 "Cet ensemble Alo coûte trois-cents euros en boutique.",
 "Moi, je l'ai payé...",
 "quatre-vingt-dix euros !",
 "Et cet ensemble Essentials ?",
 "Cinquante euros.",
 "Il se revend en ce moment autour de cent-trente-cinq euros sur Vinted.",
 "Et non, c'est pas du un-un.",
 "C'est que de l'authentique.",
 "Comment je fais ?",
 "J'ai un contact qui vend ses ensembles en direct, sans passer par les boutiques.",
 "Et ce contact, je te le donne directement dans le lien en bio.",
 "Une question avant de te lancer ?",
 "Écris-moi en DM, je te réponds.",
 "Que de l'authentique.",
]
EX = {2: 0.8, 4: 0.65, 7: 0.6, 10: 0.65}
only = [int(x) for x in sys.argv[2].split(',')] if len(sys.argv) > 2 else range(len(L))
K = int(sys.argv[1])
m = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
for i in only:
    for k in range(K):
        seed = 100 * i + k + (int(sys.argv[3]) if len(sys.argv) > 3 else 0)
        torch.manual_seed(seed)
        w = m.generate(L[i], language_id="fr", exaggeration=EX.get(i, 0.5), cfg_weight=0.5, temperature=0.7)
        ta.save(f"cb/takes/s{i:02d}_{seed}.wav", w, m.sr)
        print(i, seed, round(w.shape[-1] / m.sr, 2), flush=True)
