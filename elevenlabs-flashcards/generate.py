import csv
import os
import requests
import time

API_KEY = os.environ.get("ELEVENLABS_API_KEY")
# Voix multilingue ElevenLabs (Callum — supporte l'espagnol)
VOICE_ID = "N2lVS1w4EtoT3dr4eOWO"
OUTPUT_DIR = "output"

def generate_audio(text: str, filename: str) -> None:
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    headers = {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
    }
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
        },
    }
    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(response.content)
    print(f"  ✓ {filepath}")


def main():
    if not API_KEY:
        print("Erreur : variable d'environnement ELEVENLABS_API_KEY manquante.")
        print("Lance : export ELEVENLABS_API_KEY=ta_clé")
        return

    with open("flashcards.csv", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    print(f"Génération de {len(rows)} flashcard(s)...\n")

    for i, row in enumerate(rows):
        mot = row["mot"].strip()
        exemple = row["exemple"].strip()
        # Texte lu : mot, pause, puis exemple de phrase
        texte = f"{mot}. {exemple}"
        filename = f"{i+1:02d}_{mot}.mp3"
        print(f"[{i+1}/{len(rows)}] {mot}")
        generate_audio(texte, filename)
        # Petite pause pour éviter de dépasser le rate limit
        if i < len(rows) - 1:
            time.sleep(0.5)

    print(f"\nTerminé ! Fichiers dans ./{OUTPUT_DIR}/")


if __name__ == "__main__":
    main()
