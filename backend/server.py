from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
from analyze_speech import analyze_speech
from tts import tts, stitch_audios, stitch_audio_bytes, generate_clone
import logging
from typing import List, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Speech Analysis API",
    description="Analyze speech audio files for phonetic differences",
    version="1.0.0",
)

# CORS middleware for React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your app's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Pre-load the model on server startup"""
    from analyze_speech import get_model

    logger.info("Pre-loading wav2vec2 model...")
    get_model()
    logger.info("Model loaded and ready")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Speech Analysis API", "version": "1.0.0"}


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.post("/analyze")
async def analyze_audio(
    truth_audio: UploadFile = File(..., description="Ground truth audio file"),
    recorded_audio: UploadFile = File(
        ..., description="Recorded audio file to analyze"
    ),
):
    """
    Analyze two audio files and return transcriptions

    - **truth_audio**: The reference/correct pronunciation audio file
    - **recorded_audio**: The user's recorded audio file to analyze

    Returns JSON with transcriptions for both files
    """
    truth_path = None
    recorded_path = None

    try:
        # Validate file types
        allowed_extensions = {".wav", ".mp3", ".m4a", ".flac", ".ogg"}
        truth_ext = os.path.splitext(truth_audio.filename)[1].lower()
        recorded_ext = os.path.splitext(recorded_audio.filename)[1].lower()

        if (
            truth_ext not in allowed_extensions
            or recorded_ext not in allowed_extensions
        ):
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format. Allowed: {', '.join(allowed_extensions)}",
            )

        # Save uploaded files to temporary locations
        with tempfile.NamedTemporaryFile(delete=False, suffix=truth_ext) as truth_tmp:
            truth_path = truth_tmp.name
            truth_tmp.write(await truth_audio.read())

        with tempfile.NamedTemporaryFile(
            delete=False, suffix=recorded_ext
        ) as recorded_tmp:
            recorded_path = recorded_tmp.name
            recorded_tmp.write(await recorded_audio.read())

        # Run analysis
        result = analyze_speech(truth_path, recorded_path)

        return result

    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    finally:
        # Clean up temporary files
        if truth_path and os.path.exists(truth_path):
            os.unlink(truth_path)
        if recorded_path and os.path.exists(recorded_path):
            os.unlink(recorded_path)


@app.post("/tts/generate")
async def generate_tts(
    text: str = Form(..., description="Text to convert to speech"),
    voice_id: str = Form("56AoDkrOh6qfVPDXZ7Pt", description="ElevenLabs voice ID"),
    speed: float = Form(0.8, description="Speech speed (0.25-4.0)"),
    stability: float = Form(0.95, description="Voice stability (0.0-1.0)"),
    similarity_boost: float = Form(0.75, description="Voice similarity (0.0-1.0)"),
    style: float = Form(0.0, description="Voice style/expressiveness (0.0-1.0)"),
):
    """
    Generate text-to-speech audio using ElevenLabs.

    Returns MP3 audio file.
    """
    try:
        audio_bytes = tts(
            text=text,
            voice_id=voice_id,
            speed=speed,
            stability=stability,
            similarity_boost=similarity_boost,
            style=style,
        )

        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "attachment; filename=tts_output.mp3"},
        )
    except Exception as e:
        logger.error(f"TTS generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")


@app.post("/tts/stitch")
async def stitch_audio_files(
    audio_files: List[UploadFile] = File(
        ..., description="Audio files to stitch together"
    ),
    pause_duration: int = Form(
        500, description="Pause duration between clips in milliseconds"
    ),
):
    """
    Stitch multiple audio files together with pauses.

    Returns combined MP3 audio file.
    """
    temp_paths = []

    try:
        # Save uploaded files temporarily
        for audio_file in audio_files:
            ext = os.path.splitext(audio_file.filename)[1].lower()
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
                temp_file.write(await audio_file.read())
                temp_paths.append(temp_file.name)

        # Stitch audios
        stitched = stitch_audios(temp_paths, pause_duration=pause_duration)

        # Export to bytes
        import io

        output_io = io.BytesIO()
        stitched.export(output_io, format="mp3")
        audio_bytes = output_io.getvalue()

        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "attachment; filename=stitched_audio.mp3"},
        )
    except Exception as e:
        logger.error(f"Audio stitching failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Audio stitching failed: {str(e)}")
    finally:
        # Clean up temp files
        for path in temp_paths:
            if os.path.exists(path):
                os.unlink(path)


@app.post("/tts/clone")
async def create_voice_clone(
    audio_file: UploadFile = File(..., description="Audio sample for voice cloning"),
    name: str = Form("userClone", description="Name for the cloned voice"),
    description: str = Form(
        "User's custom voice clone", description="Description of the voice"
    ),
):
    """
    Create a voice clone from an audio sample.

    Returns the voice ID and details.
    """
    try:
        
        # Read audio file
        audio_bytes = await audio_file.read()

        logger.info(f"Received audio file: {audio_file.filename}, size: {len(audio_bytes)} bytes")
        # Create voice clone
        voice = generate_clone(audio_bytes, name=name, description=description)

        return {
            "voice_id": voice.voice_id,
            "name": name,
            "description": description,
            "status": "Voice clone created successfully",
        }
    except Exception as e:
        logger.error(f"Voice cloning failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Voice cloning failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
