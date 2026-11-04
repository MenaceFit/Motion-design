#!/usr/bin/env python3
"""Liste les voix ElevenLabs du compte (et de la bibliothèque) pour choisir celles des personnages.
Prérequis : variable ELEVENLABS_API_KEY + hôte api.elevenlabs.io autorisé dans le réseau.
Usage : python3 tools/elevenlabs_voices.py [--search "french"]
Puis reporter les voice_id dans projects/<série>/<épisode>.json → "voices".
"""
import argparse, json, os, sys, urllib.request
sys.path.insert(0, os.path.dirname(__file__))
from tts_voice import _ssl_ctx, elevenlabs_available

ap = argparse.ArgumentParser(); ap.add_argument("--search", default="")
a = ap.parse_args()
if not elevenlabs_available():
    sys.exit("ElevenLabs inaccessible : définir ELEVENLABS_API_KEY et autoriser api.elevenlabs.io.")
key = os.environ["ELEVENLABS_API_KEY"]
for url in ["https://api.elevenlabs.io/v1/voices", f"https://api.elevenlabs.io/v1/shared-voices?page_size=30&language=fr&search={a.search}"]:
    req = urllib.request.Request(url, headers={"xi-api-key": key})
    data = json.loads(urllib.request.urlopen(req, timeout=30, context=_ssl_ctx()).read())
    print("==", url.split("/v1/")[1].split("?")[0])
    for v in data.get("voices", []):
        lab = v.get("labels") or {}
        print(f"  {v['voice_id']}  {v.get('name','')[:28]:<28} {lab.get('gender', v.get('gender',''))} {lab.get('age', v.get('age',''))} {lab.get('accent', v.get('accent',''))} {lab.get('description', v.get('descriptive',''))}")
