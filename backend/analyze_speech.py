#!/usr/bin/env python3
"""
Hybrid Lisp Detection System
Combines phoneme substitution analysis + acoustic feature analysis
to detect 4 types of lisps: Interdental, Palatal, Lateral, Dentalized
"""

import torch
import librosa
import numpy as np
import json
import sys
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
from difflib import SequenceMatcher
from scipy.signal import butter, filtfilt
from scipy.stats import kurtosis


def load_audio(audio_path, target_sr=16000):
    """Load audio file and resample to target sample rate."""
    audio, sr = librosa.load(audio_path, sr=target_sr)
    return audio, sr


def get_transcription(audio, processor, model, device):
    """Extract transcription and logits from audio."""
    inputs = processor(audio, sampling_rate=16000, return_tensors="pt", padding=True)
    input_values = inputs.input_values.to(device)

    with torch.no_grad():
        logits = model(input_values).logits

    predicted_ids = torch.argmax(logits, dim=-1)
    transcription = processor.batch_decode(predicted_ids)[0]

    return transcription, logits


def find_sibilant_regions(audio, logits, processor, sr=16000):
    """Find /s/ sound regions in audio using phoneme detection."""
    predicted_ids = torch.argmax(logits, dim=-1)[0]
    tokens = [processor.tokenizer.decode([id.item()]) for id in predicted_ids]

    regions = []
    current_region = None
    frame_duration = 320 / sr  # wav2vec2 stride

    for i, token in enumerate(tokens):
        token_clean = token.strip().lower()
        is_s = "s" in token_clean

        if is_s:
            if current_region is None:
                current_region = i
        else:
            if current_region is not None:
                regions.append((current_region * frame_duration, i * frame_duration))
                current_region = None

    if current_region is not None:
        regions.append((current_region * frame_duration, len(tokens) * frame_duration))

    return regions


def extract_acoustic_features(audio, sr, start_time, end_time):
    """Extract acoustic features for lisp classification."""
    start_sample = int(start_time * sr)
    end_sample = int(end_time * sr)
    segment = audio[start_sample:end_sample]

    if len(segment) < 512:
        return None

    # High-pass filter at 1.5 kHz
    nyquist = sr / 2
    cutoff = 1500 / nyquist
    b, a = butter(4, cutoff, btype="high")
    segment_filtered = filtfilt(b, a, segment)

    # Extract features
    centroid = librosa.feature.spectral_centroid(
        y=segment_filtered, sr=sr, n_fft=512, hop_length=128
    )
    bandwidth = librosa.feature.spectral_bandwidth(
        y=segment_filtered, sr=sr, n_fft=512, hop_length=128
    )
    zcr = librosa.feature.zero_crossing_rate(
        segment_filtered, frame_length=512, hop_length=128
    )
    flatness = librosa.feature.spectral_flatness(
        y=segment_filtered, n_fft=512, hop_length=128
    )

    # Spectral kurtosis
    spec_kurtosis = kurtosis(centroid[0]) if len(centroid[0]) > 3 else 0

    return {
        "centroid": np.mean(centroid),
        "bandwidth": np.mean(bandwidth),
        "zcr": np.mean(zcr),
        "flatness": np.mean(flatness),
        "kurtosis": spec_kurtosis,
    }


def classify_acoustic_lisp(features):
    """Classify lisp type based on acoustic features."""
    centroid = features["centroid"]
    flatness = features["flatness"]
    zcr = features["zcr"]

    # Classification rules
    if centroid >= 6000 and centroid <= 9000:
        return "normal"
    elif centroid >= 4500 and centroid < 5500:
        return "dentalized"
    elif centroid >= 3500 and centroid < 4500:
        return "palatal"
    elif centroid < 3500:
        return "interdental"

    # Check for lateral characteristics
    if flatness > 0.3 and zcr > 0.2 and 3000 <= centroid <= 5000:
        return "lateral"

    return "normal"


def detect_phoneme_substitutions(truth_transcription, rec_transcription):
    """Detect /s/ substitutions by comparing transcriptions."""
    truth_words = truth_transcription.split()
    rec_words = rec_transcription.split()

    matcher = SequenceMatcher(None, truth_words, rec_words)
    substitutions = []

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "replace":
            for k in range(max(i2 - i1, j2 - j1)):
                truth_word = truth_words[i1 + k] if i1 + k < i2 else ""
                rec_word = rec_words[j1 + k] if j1 + k < j2 else ""

                if "s" in truth_word.lower() and truth_word.lower() != rec_word.lower():
                    # Classify substitution type
                    if "th" in rec_word.lower() or "h" in rec_word.lower():
                        substitutions.append("interdental")
                    elif "sh" in rec_word.lower():
                        substitutions.append("palatal")
                    elif "f" in rec_word.lower():
                        substitutions.append("interdental")
                    else:
                        substitutions.append("interdental")  # Default

    return substitutions


# Global cache for model
_MODEL_CACHE = {}


def get_model(model_name="facebook/wav2vec2-base-960h"):
    """Load and cache the wav2vec2 model."""
    if model_name not in _MODEL_CACHE:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        processor = Wav2Vec2Processor.from_pretrained(model_name)
        model = Wav2Vec2ForCTC.from_pretrained(model_name).to(device)
        model.eval()
        _MODEL_CACHE[model_name] = (processor, model, device)

    return _MODEL_CACHE[model_name]


def analyze_speech(truth_path, recorded_path):
    """
    Hybrid lisp detection: Combines phoneme substitution + acoustic analysis.

    Returns:
        Dictionary with counts for each lisp type:
        {
            "interdental": int,
            "palatal": int,
            "lateral": int,
            "dentalized": int
        }
    """
    processor, model, device = get_model()

    # Load audio
    audio_truth, sr_truth = load_audio(truth_path)
    audio_rec, sr_rec = load_audio(recorded_path)

    # Get transcriptions
    transcription_truth, logits_truth = get_transcription(
        audio_truth, processor, model, device
    )
    transcription_rec, logits_rec = get_transcription(
        audio_rec, processor, model, device
    )

    # Initialize counts
    lisp_counts = {"interdental": 0, "palatal": 0, "lateral": 0, "dentalized": 0}

    # Step 1: Phoneme substitution analysis
    # Detects when /s/ is completely replaced (e.g., s→th, s→sh)
    substitutions = detect_phoneme_substitutions(transcription_truth, transcription_rec)
    for sub_type in substitutions:
        lisp_counts[sub_type] += 1

    # Step 2: Acoustic analysis
    # Analyzes /s/ sounds that were actually produced
    sibilant_regions = find_sibilant_regions(audio_rec, logits_rec, processor, sr_rec)

    for start_time, end_time in sibilant_regions:
        features = extract_acoustic_features(audio_rec, sr_rec, start_time, end_time)
        if features:
            classification = classify_acoustic_lisp(features)
            if classification != "normal":
                lisp_counts[classification] += 1

    return lisp_counts


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

    # Output clean JSON
    print(json.dumps(results, indent=2))

    # Save to file
    output_file = "speech_analysis_results.json"
    with open(output_file, "w") as f:
        json.dump(results, f, indent=2)


if __name__ == "__main__":
    main()
