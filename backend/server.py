#!/usr/bin/env python3
"""
FastAPI Speech Analysis Server
Backend API for React Native app to analyze speech recordings.

Usage:
    uvicorn server:app --reload --host 0.0.0.0 --port 8000

API Endpoints:
    POST /analyze - Analyze two audio files (truth vs recorded)
    GET /health - Health check endpoint
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import torch
import librosa
import numpy as np
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
import io
import tempfile
from typing import Dict
import uvicorn

# Initialize FastAPI app
app = FastAPI(
    title="Speech Analysis API",
    description="Analyze speech recordings to detect phonetic differences",
    version="1.0.0",
)

# Add CORS middleware for React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your app's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model cache - persists across requests
_MODEL_CACHE = {}


def get_model(model_name="facebook/wav2vec2-base-960h"):
    """
    Load and cache the wav2vec2 model and processor.
    Model stays in RAM between API requests for fast inference.

    Args:
        model_name: HuggingFace model name

    Returns:
        processor: Wav2Vec2Processor
        model: Wav2Vec2ForCTC model
        device: Device (cuda/cpu)
    """
    if model_name not in _MODEL_CACHE:
        print(f"[INIT] Loading wav2vec2 model: {model_name}...")
        device = "cuda" if torch.cuda.is_available() else "cpu"
        processor = Wav2Vec2Processor.from_pretrained(model_name)
        model = Wav2Vec2ForCTC.from_pretrained(model_name).to(device)
        model.eval()
        _MODEL_CACHE[model_name] = (processor, model, device)
        print(f"[INIT] ✓ Model loaded and cached on {device}")

    return _MODEL_CACHE[model_name]


def load_audio_from_bytes(audio_bytes: bytes, target_sr=16000):
    """
    Load audio from bytes (uploaded file) and resample.

    Args:
        audio_bytes: Audio file bytes
        target_sr: Target sample rate (16000 Hz for wav2vec2)

    Returns:
        audio: Audio array
    """
    # Save bytes to temporary file (librosa needs file path)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_file:
        tmp_file.write(audio_bytes)
        tmp_path = tmp_file.name

    # Load with librosa
    audio, sr = librosa.load(tmp_path, sr=target_sr)

    # Clean up temp file
    import os

    os.unlink(tmp_path)

    return audio


def extract_transcription(audio, processor, model, device):
    """
    Extract character-level transcription from audio.

    Args:
        audio: Audio array
        processor: Wav2Vec2Processor
        model: Wav2Vec2ForCTC model
        device: Device to run on

    Returns:
        transcription: String transcription
    """
    # Process audio
    inputs = processor(audio, sampling_rate=16000, return_tensors="pt", padding=True)
    input_values = inputs.input_values.to(device)

    with torch.no_grad():
        logits = model(input_values).logits

    # Get predicted characters
    predicted_ids = torch.argmax(logits, dim=-1)
    transcription = processor.batch_decode(predicted_ids)[0]

    return transcription


@app.on_event("startup")
async def startup_event():
    """Preload model on server startup for faster first request"""
    print("[STARTUP] Preloading model...")
    get_model()
    print("[STARTUP] ✓ Server ready!")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model_loaded = "facebook/wav2vec2-base-960h" in _MODEL_CACHE

    return {"status": "healthy", "model_loaded": model_loaded, "device": device}


@app.post("/analyze")
async def analyze_speech(
    truth: UploadFile = File(..., description="Truth/reference audio file"),
    recorded: UploadFile = File(..., description="Recorded audio file"),
):
    """
    Analyze two audio files and return transcriptions.

    Args:
        truth: Truth/reference audio file (WAV, MP3)
        recorded: Recorded audio file (WAV, MP3)

    Returns:
        JSON with transcriptions:
        {
            "Truth": {"Transcription": "..."},
            "Recorded": {"Transcription": "..."}
        }
    """
    try:
        # Validate file types
        allowed_types = ["audio/wav", "audio/mpeg", "audio/mp3", "audio/x-wav"]
        if truth.content_type not in allowed_types and not truth.filename.endswith(
            (".wav", ".mp3")
        ):
            raise HTTPException(
                400, f"Truth file must be WAV or MP3, got {truth.content_type}"
            )
        if (
            recorded.content_type not in allowed_types
            and not recorded.filename.endswith((".wav", ".mp3"))
        ):
            raise HTTPException(
                400, f"Recorded file must be WAV or MP3, got {recorded.content_type}"
            )

        print(f"[REQUEST] Analyzing: {truth.filename} vs {recorded.filename}")

        # Get cached model (instant after first load)
        processor, model, device = get_model()

        # Read uploaded files
        truth_bytes = await truth.read()
        recorded_bytes = await recorded.read()

        # Load audio
        print("[PROCESS] Loading audio files...")
        audio_truth = load_audio_from_bytes(truth_bytes)
        audio_rec = load_audio_from_bytes(recorded_bytes)

        # Extract transcriptions
        print("[PROCESS] Extracting transcriptions...")
        transcription_truth = extract_transcription(
            audio_truth, processor, model, device
        )
        transcription_rec = extract_transcription(audio_rec, processor, model, device)

        # Build response
        results = {
            "Truth": {"Transcription": transcription_truth},
            "Recorded": {"Transcription": transcription_rec},
        }

        print(f"[SUCCESS] Analysis complete!")
        return JSONResponse(content=results)

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        raise HTTPException(500, f"Analysis failed: {str(e)}")


@app.get("/")
async def root():
    """Root endpoint with API info"""
    return {
        "message": "Speech Analysis API",
        "version": "1.0.0",
        "endpoints": {
            "/health": "GET - Health check",
            "/analyze": "POST - Analyze speech (multipart/form-data with 'truth' and 'recorded' files)",
            "/docs": "GET - Interactive API documentation",
        },
    }


if __name__ == "__main__":
    # Run server
    print("Starting Speech Analysis API Server...")
    print("Access API docs at: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
