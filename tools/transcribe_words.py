#!/usr/bin/env python3
"""Voix off → timings mot à mot (words.json) pour piloter la kinetic typography.

Deux modes :
  1. --model (recommandé) : faster-whisper avec word_timestamps. Précision ~±30 ms.
     Nécessite les poids du modèle : accès à huggingface.co OU dossier local
     (ex. --model /chemin/faster-whisper-small).
  2. --script texte.txt (secours, sans modèle) : on connaît déjà le texte ; les mots
     sont répartis sur les zones de voix détectées (énergie RMS), au prorata du nombre
     de syllabes approximé. Précision ~±120 ms : bon pour un premier montage,
     à retoucher à l'œil/oreille sur les mots-clés.

Sortie : [{"text": "MOT", "start": s, "end": s, "accent": false}, ...]
Usage :
  python3 tools/transcribe_words.py voix.wav words.json --model small --lang fr
  python3 tools/transcribe_words.py voix.wav words.json --script texte.txt
"""
import argparse, json, re


def syllables(w):
    return max(1, len(re.findall(r"[aeiouyàâäéèêëîïôöùûü]+", w.lower())))


def from_whisper(audio, model, lang):
    from faster_whisper import WhisperModel
    m = WhisperModel(model, device="cpu", compute_type="int8")
    # Audio décodé ici (librosa, 16 kHz mono) : évite l'incompatibilité PyAV ≥ 15
    # (« open() got an unexpected keyword argument 'metadata_errors' »).
    import librosa
    y, _ = librosa.load(audio, sr=16000, mono=True)
    segs, _ = m.transcribe(y, language=lang, word_timestamps=True, vad_filter=True)
    out = []
    for s in segs:
        for w in s.words:
            out.append({"text": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3), "accent": False})
    return out


def from_script(audio, script):
    import numpy as np, librosa
    y, sr = librosa.load(audio, sr=16000)
    hop = 160
    rms = librosa.feature.rms(y=y, hop_length=hop)[0]
    db = 20 * np.log10(rms + 1e-9)
    voiced = db > (np.percentile(db, 95) - 30)
    t = np.arange(len(rms)) * hop / sr
    # segments voisés (fusion des trous < 120 ms)
    segs, start, gap = [], None, 0
    for i, v in enumerate(voiced):
        if v:
            if start is None: start = i
            gap = 0
        elif start is not None:
            gap += 1
            if gap * hop / sr > 0.12:
                segs.append((t[start], t[i - gap])); start, gap = None, 0
    if start is not None: segs.append((t[start], t[-1]))
    words = open(script, encoding="utf-8").read().split()
    weights = np.array([syllables(w) for w in words], float)
    total_voiced = sum(e - s for s, e in segs)
    # place les mots en continu sur la « timeline voisée »
    cum = np.concatenate([[0], np.cumsum(weights)]) / weights.sum() * total_voiced

    def to_time(x):
        acc = 0.0
        for s, e in segs:
            if x <= acc + (e - s): return s + (x - acc)
            acc += e - s
        return segs[-1][1]

    return [{"text": w, "start": round(to_time(cum[i]), 3), "end": round(to_time(cum[i + 1]), 3), "accent": False}
            for i, w in enumerate(words)]


def main():
    p = argparse.ArgumentParser()
    p.add_argument("audio"); p.add_argument("out")
    p.add_argument("--model"); p.add_argument("--lang", default="fr"); p.add_argument("--script")
    p.add_argument("--upper", action="store_true", help="mettre les mots en MAJUSCULES")
    a = p.parse_args()
    if a.model:
        words = from_whisper(a.audio, a.model, a.lang)
    elif a.script:
        words = from_script(a.audio, a.script)
    else:
        p.error("--model ou --script requis")
    if a.upper:
        for w in words: w["text"] = w["text"].upper()
    json.dump(words, open(a.out, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    print(f"{len(words)} mots → {a.out}")


if __name__ == "__main__":
    main()
