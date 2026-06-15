# Flashcards Espagnol — ElevenLabs

Génère des fichiers MP3 de flashcards espagnol à partir d'un CSV.

## Setup

```bash
pip install requests
export ELEVENLABS_API_KEY=ta_clé_ici
```

## Utilisation

1. Édite `flashcards.csv` avec tes mots :

```
mot,traduction,exemple
hablar,parler,Me gusta hablar con mis amigos.
```

2. Lance le script :

```bash
cd flashcards-espagnol
python generate.py
```

3. Les MP3 sont générés dans `output/`.

## Format audio

Chaque fichier lit : **mot** → **exemple de phrase**, en espagnol.
