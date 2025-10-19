from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Body
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


@app.get("/audio/{filename}")
async def serve_audio_file(filename: str):
    """
    Serve audio files from the sound_samples folder.

    - **filename**: Name of the audio file (e.g., test_phrase.mp3)
    """
    try:
        sound_samples_dir = os.path.join(os.path.dirname(__file__), "sound_samples")
        file_path = os.path.join(sound_samples_dir, filename)
        logger.info(f"Serving audio file: {file_path}")
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"File not found: {filename}")

        # Read file
        with open(file_path, "rb") as f:
            audio_bytes = f.read()

        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={"Content-Disposition": f"inline; filename={filename}"},
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to serve audio file: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to serve audio file: {str(e)}"
        )


@app.post("/analyze")
async def analyze_audio(
    truth_audio: UploadFile = File(None, description="Ground truth audio file"),
    recorded_audio: UploadFile = File(
        None, description="Recorded audio file to analyze"
    ),
    truth_audio_base64: str = Form(None, description="Ground truth audio as base64"),
    recorded_audio_base64: str = Form(None, description="Recorded audio as base64"),
    truth_audio_filename: str = Form(
        "truth_audio.mp3", description="Truth audio filename"
    ),
    recorded_audio_filename: str = Form(
        "recorded_audio.m4a", description="Recorded audio filename"
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
        logger.info("=== ANALYSIS REQUEST RECEIVED ===")

        # Check if we received base64 data or file uploads
        use_base64 = (
            truth_audio_base64 is not None and recorded_audio_base64 is not None
        )
        logger.info(f"Using base64 input: {use_base64}")

        if use_base64:
            logger.info(f"Truth audio base64 length: {len(truth_audio_base64)}")
            logger.info(f"Recorded audio base64 length: {len(recorded_audio_base64)}")
            logger.info(f"Truth filename: {truth_audio_filename}")
            logger.info(f"Recorded filename: {recorded_audio_filename}")
        else:
            logger.info(f"Truth audio filename: {truth_audio.filename}")
            logger.info(f"Recorded audio filename: {recorded_audio.filename}")
            logger.info(f"Truth audio content_type: {truth_audio.content_type}")
            logger.info(f"Recorded audio content_type: {recorded_audio.content_type}")

        # Validate file types
        allowed_extensions = {".wav", ".mp3", ".m4a", ".flac", ".ogg"}

        if use_base64:
            truth_ext = os.path.splitext(truth_audio_filename)[1].lower()
            recorded_ext = os.path.splitext(recorded_audio_filename)[1].lower()
        else:
            truth_ext = os.path.splitext(truth_audio.filename)[1].lower()
            recorded_ext = os.path.splitext(recorded_audio.filename)[1].lower()

        logger.info(f"Truth file extension: {truth_ext}")
        logger.info(f"Recorded file extension: {recorded_ext}")

        if (
            truth_ext not in allowed_extensions
            or recorded_ext not in allowed_extensions
        ):
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format. Allowed: {', '.join(allowed_extensions)}",
            )

        # Save uploaded files to temporary locations
        if use_base64:
            # Decode base64 data
            import base64

            logger.info("=== DECODING BASE64 TRUTH AUDIO ===")
            truth_bytes = base64.b64decode(truth_audio_base64)
            logger.info(f"Truth audio bytes decoded: {len(truth_bytes)} bytes")
            logger.info(f"Truth audio first 20 bytes: {truth_bytes[:20]}")

            with tempfile.NamedTemporaryFile(
                delete=False, suffix=truth_ext
            ) as truth_tmp:
                truth_path = truth_tmp.name
                logger.info(f"Writing {len(truth_bytes)} bytes to: {truth_path}")
                bytes_written = truth_tmp.write(truth_bytes)
                logger.info(f"Bytes written to truth file: {bytes_written}")
                truth_tmp.flush()
                logger.info(f"File flushed to disk")

            logger.info("=== DECODING BASE64 RECORDED AUDIO ===")
            recorded_bytes = base64.b64decode(recorded_audio_base64)
            logger.info(f"Recorded audio bytes decoded: {len(recorded_bytes)} bytes")
            logger.info(f"Recorded audio first 20 bytes: {recorded_bytes[:20]}")

            with tempfile.NamedTemporaryFile(
                delete=False, suffix=recorded_ext
            ) as recorded_tmp:
                recorded_path = recorded_tmp.name
                logger.info(f"Writing {len(recorded_bytes)} bytes to: {recorded_path}")
                bytes_written = recorded_tmp.write(recorded_bytes)
                logger.info(f"Bytes written to recorded file: {bytes_written}")
                recorded_tmp.flush()
                logger.info(f"File flushed to disk")
        else:
            # Read from uploaded files
            logger.info("=== READING TRUTH AUDIO ===")
            truth_bytes = await truth_audio.read()
            logger.info(f"Truth audio bytes read: {len(truth_bytes)} bytes")
            logger.info(f"Truth audio first 20 bytes: {truth_bytes[:20]}")

            with tempfile.NamedTemporaryFile(
                delete=False, suffix=truth_ext
            ) as truth_tmp:
                truth_path = truth_tmp.name
                logger.info(f"Writing {len(truth_bytes)} bytes to: {truth_path}")
                bytes_written = truth_tmp.write(truth_bytes)
                logger.info(f"Bytes written to truth file: {bytes_written}")
                truth_tmp.flush()
                logger.info(f"File flushed to disk")

            logger.info("=== READING RECORDED AUDIO ===")
            recorded_bytes = await recorded_audio.read()
            logger.info(f"Recorded audio bytes read: {len(recorded_bytes)} bytes")
            logger.info(f"Recorded audio first 20 bytes: {recorded_bytes[:20]}")

            with tempfile.NamedTemporaryFile(
                delete=False, suffix=recorded_ext
            ) as recorded_tmp:
                recorded_path = recorded_tmp.name
                logger.info(f"Writing {len(recorded_bytes)} bytes to: {recorded_path}")
                bytes_written = recorded_tmp.write(recorded_bytes)
                logger.info(f"Bytes written to recorded file: {bytes_written}")
                recorded_tmp.flush()
                logger.info(f"File flushed to disk")

        # Verify files exist and have content
        logger.info("=== VERIFYING FILES ON DISK ===")
        logger.info(f"Checking if truth file exists: {truth_path}")
        if not os.path.exists(truth_path):
            raise Exception(f"Truth file not created: {truth_path}")
        logger.info(f"✓ Truth file exists")

        logger.info(f"Checking if recorded file exists: {recorded_path}")
        if not os.path.exists(recorded_path):
            raise Exception(f"Recorded file not created: {recorded_path}")
        logger.info(f"✓ Recorded file exists")

        truth_size = os.path.getsize(truth_path)
        recorded_size = os.path.getsize(recorded_path)
        logger.info(f"Truth file size on disk: {truth_size} bytes")
        logger.info(f"Recorded file size on disk: {recorded_size} bytes")

        if truth_size == 0:
            raise Exception(f"Truth audio file is empty: {truth_path}")
        if recorded_size == 0:
            raise Exception(f"Recorded audio file is empty: {recorded_path}")

        # Convert m4a to wav if needed (for better compatibility with librosa)
        if recorded_ext == ".m4a":
            logger.info("Converting m4a to wav...")
            from pydub import AudioSegment

            # Load m4a and convert to wav
            audio = AudioSegment.from_file(recorded_path, format="m4a")
            new_recorded_path = recorded_path.replace(".m4a", ".wav")
            audio.export(new_recorded_path, format="wav")

            # Clean up old m4a file
            os.unlink(recorded_path)
            recorded_path = new_recorded_path
            logger.info(f"Converted to wav: {recorded_path}")

        if truth_ext == ".m4a":
            logger.info("Converting truth m4a to wav...")
            from pydub import AudioSegment

            # Load m4a and convert to wav
            audio = AudioSegment.from_file(truth_path, format="m4a")
            new_truth_path = truth_path.replace(".m4a", ".wav")
            audio.export(new_truth_path, format="wav")

            # Clean up old m4a file
            os.unlink(truth_path)
            truth_path = new_truth_path
            logger.info(f"Converted truth to wav: {truth_path}")

        # Run analysis
        logger.info("Starting speech analysis...")
        result = analyze_speech(truth_path, recorded_path)
        logger.info("=== ANALYSIS SUCCESS ===")

        return result

    except Exception as e:
        logger.error("=== ANALYSIS FAILED ===")
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Error message: {str(e)}")
        import traceback

        logger.error(f"Traceback:\n{traceback.format_exc()}")
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
    try:
        logger.info(f"Received {len(audio_files)} audio files to stitch")

        # Read all audio files as bytes
        audio_bytes_list = []
        for i, audio_file in enumerate(audio_files):
            logger.info(
                f"File {i}: {audio_file.filename}, content_type: {audio_file.content_type}"
            )
            audio_bytes = await audio_file.read()
            logger.info(f"File {i} size: {len(audio_bytes)} bytes")
            audio_bytes_list.append(audio_bytes)

        # Stitch audios using bytes directly (no temp files needed!)
        audio_bytes = stitch_audio_bytes(
            audio_bytes_list, pause_duration=pause_duration
        )

        logger.info(f"Stitched audio size: {len(audio_bytes)} bytes")

        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "attachment; filename=stitched_audio.mp3"},
        )
    except Exception as e:
        logger.error(f"Audio stitching failed: {str(e)}")
        import traceback

        logger.error(f"Traceback:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Audio stitching failed: {str(e)}")


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

        logger.info(
            f"Received audio file: {audio_file.filename}, size: {len(audio_bytes)} bytes"
        )
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
