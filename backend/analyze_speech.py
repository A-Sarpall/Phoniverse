#!/usr/bin/env python3
"""
Speech Analysis Pipeline
Analyzes two audio recordings (truth vs recorded) to detect phonetic differences.
"""

import torch
import librosa
import json
import sys
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
from functools import lru_cache


def load_audio(audio_path, target_sr=16000):
    """
    Load audio file and resample to target sample rate.
    Supports WAV and MP3 formats.

    Args:
        audio_path: Path to audio file
        target_sr: Target sample rate (default 16000 Hz for wav2vec2)

    Returns:
        audio: Audio array
        sr: Sample rate
    """
    audio, sr = librosa.load(audio_path, sr=target_sr)
    return audio, sr


def extract_transcription(audio, processor, model, device):
    """
    Extract character-level transcription from audio using wav2vec2 CTC model.

    Args:
        audio: Audio array
        processor: Wav2Vec2Processor
        model: Wav2Vec2ForCTC model
        device: Device to run on (cuda/cpu)

    Returns:
        transcription: String transcription
        logits: Model logits for phoneme analysis
    """
    # Process audio
    inputs = processor(audio, sampling_rate=16000, return_tensors="pt", padding=True)
    input_values = inputs.input_values.to(device)

    with torch.no_grad():
        logits = model(input_values).logits

    # Get predicted characters
    predicted_ids = torch.argmax(logits, dim=-1)
    transcription = processor.batch_decode(predicted_ids)[0]

    return transcription, logits


def extract_phonemes(logits, processor):
    """
    Extract phoneme sequence from model logits.

    Args:
        logits: Model output logits
        processor: Wav2Vec2Processor for vocabulary

    Returns:
        phonemes: List of phoneme symbols
    """
    vocab = processor.tokenizer.get_vocab()
    id_to_char = {v: k for k, v in vocab.items()}

    # Get predicted IDs
    predicted_ids = torch.argmax(logits, dim=-1)[0]

    # Decode to characters
    chars = [id_to_char.get(cid.item(), "?") for cid in predicted_ids]

    # Remove consecutive duplicates and special tokens
    phonemes = []
    prev_char = None
    for char in chars:
        if char not in ["<pad>", "|", "<s>", "</s>", "<unk>"] and char != prev_char:
            phonemes.append(char)
            prev_char = char

    return phonemes


# Global cache for model and processor
_MODEL_CACHE = {}


def get_model(model_name="facebook/wav2vec2-base-960h"):
    """
    Load and cache the wav2vec2 model and processor.
    Model is only loaded once and reused for subsequent calls.

    Args:
        model_name: HuggingFace model name

    Returns:
        processor: Wav2Vec2Processor
        model: Wav2Vec2ForCTC model
        device: Device (cuda/cpu)
    """
    if model_name not in _MODEL_CACHE:
        print(f"Loading wav2vec2 model: {model_name}...")
        device = "cuda" if torch.cuda.is_available() else "cpu"
        processor = Wav2Vec2Processor.from_pretrained(model_name)
        model = Wav2Vec2ForCTC.from_pretrained(model_name).to(device)
        model.eval()
        _MODEL_CACHE[model_name] = (processor, model, device)
        print(f"✓ Model loaded and cached on {device}")
    else:
        print(f"✓ Using cached model")
        processor, model, device = _MODEL_CACHE[model_name]

    return processor, model, device


def analyze_speech(truth_path, recorded_path):
    """
    Main analysis pipeline: Compare truth vs recorded audio.

    Args:
        truth_path: Path to truth/reference audio file
        recorded_path: Path to recorded audio file

    Returns:
        results: Dictionary with analysis results
    """
    # Get cached model (loads only once)
    processor, model, device = get_model()

    # Load audio files
    print(f"Loading truth audio: {truth_path}")
    audio_truth, sr_truth = load_audio(truth_path)

    print(f"Loading recorded audio: {recorded_path}")
    audio_rec, sr_rec = load_audio(recorded_path)

    # Extract transcriptions
    print("Extracting transcriptions...")
    transcription_truth, logits_truth = extract_transcription(
        audio_truth, processor, model, device
    )
    transcription_rec, logits_rec = extract_transcription(
        audio_rec, processor, model, device
    )

    # Build results
    results = {
        "Truth": {"Transcription": transcription_truth},
        "Recorded": {"Transcription": transcription_rec},
    }

    return results


def main():
    """Command line interface"""
    if len(sys.argv) != 3:
        print("Usage: python analyze_speech.py <truth_audio> <recorded_audio>")
        print("Example: python analyze_speech.py no_lisp.wav lisp.wav")
        sys.exit(1)

    truth_path = sys.argv[1]
    recorded_path = sys.argv[2]

    # Run analysis
    results = analyze_speech(truth_path, recorded_path)

    # Print results as JSON
    print("\n" + "=" * 80)
    print("RESULTS")
    print("=" * 80)
    print(json.dumps(results, indent=2))

    # Also save to file
    output_file = "speech_analysis_results.json"
    with open(output_file, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nResults saved to: {output_file}")


if __name__ == "__main__":
    main()
