"""Pour chaque phrase : transcrit les prises (Whisper small, mots horodatés), garde celle qui colle le mieux au texte,
coupe après le dernier mot attendu (supprime le charabia final), assemble avec des pauses → voice.wav + words.json."""
import glob, json, re, difflib, numpy as np, soundfile as sf, librosa
from faster_whisper import WhisperModel
src = open('cb/gen_takes.py').read(); L = eval(src.split('L = ', 1)[1].split(']', 1)[0] + ']')
SPOKEN = {6: "Et non, c'est pas du 1.1."}
PAUSE = [0.2, 0.1, 0.35, 0.2, 0.2, 0.35, 0.1, 0.35, 0.2, 0.3, 0.3, 0.15, 0.3, 0.3]
norm = lambda s: re.sub(r"[^a-zàâäéèêëîïôöùûüç0-9 ]", " ", s.lower().replace('-', ' ')).split()
NUM = {'300': 'trois cents', '90': 'quatre vingt dix', '50': 'cinquante', '135': 'cent trente cinq', '1.1': 'un un', '1,1': 'un un'}
def words(s):
    out = []
    for w in s.lower().split():
        w2 = w.strip('.,!?…')
        out += norm(NUM.get(w2, w))
    return out
m = WhisperModel('small', device='cpu', compute_type='int8')
SR = sf.info(sorted(glob.glob('cb/takes/*.wav'))[0]).samplerate
parts = []; report = []
for i, txt in enumerate(L):
    target = words(txt); best = None
    for f in sorted(glob.glob(f'cb/takes/s{i:02d}_*.wav')):
        y, sr = sf.read(f, dtype='float32'); y16 = librosa.resample(y, orig_sr=sr, target_sr=16000)
        segs, _ = m.transcribe(y16, language='fr', word_timestamps=True)
        ws = [w for s in segs for w in s.words]
        hyp = [x for w in ws for x in words(w.word)]
        # meilleur préfixe de l'hypothèse qui correspond à la cible
        bestcut, bestr = 0, 0
        for n in range(1, len(ws) + 1):
            h = [x for w in ws[:n] for x in words(w.word)]
            r = difflib.SequenceMatcher(None, h, target).ratio()
            if r >= bestr: bestr, bestcut = r, n
        end = ws[bestcut - 1].end + 0.12 if bestcut else len(y) / sr
        tail = len(hyp) - len([x for w in ws[:bestcut] for x in words(w.word)])
        score = bestr - 0.02 * tail
        if best is None or score > best[0]: best = (score, f, end, bestr, ' '.join(hyp))
    score, f, end, r, hyp = best
    y, sr = sf.read(f, dtype='float32'); y = y[:int(end * sr)]
    nz = np.where(np.abs(y) > 0.01)[0]; y = y[max(0, nz[0] - int(0.03 * sr)):] if len(nz) else y
    fade = int(0.02 * sr); y[-fade:] *= np.linspace(1, 0, fade)
    parts += [y, np.zeros(int(PAUSE[i] * sr), dtype='float32')]
    report.append((i, round(r, 2), f.split('/')[-1], hyp))
v = np.concatenate(parts); sf.write('cb/voice_final.wav', v, SR)
for x in report: print(*x)
print('durée', round(len(v) / SR, 2))
