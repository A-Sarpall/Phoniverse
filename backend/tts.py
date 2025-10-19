#!/usr/bin/env python3
"""
Text-to-Speech (TTS) Functions
Provides ElevenLabs TTS capabilities including generation, stitching, and voice cloning
"""

from elevenlabs.client import ElevenLabs
from pydub import AudioSegment
import os

# Initialize ElevenLabs client
client = ElevenLabs(
    api_key=os.getenv(
        "ELEVENLABS_API_KEY", "sk_ddccc8ebaa81fead91e8f93921da565e26d3e49fb035f3c6"
    )
)


def tts(
    text,
    voice_id="56AoDkrOh6qfVPDXZ7Pt",
    speed=0.8,
    stability=0.95,
    similarity_boost=0.75,
    style=0.0,
):
    """
    Generate text-to-speech audio using ElevenLabs.

    Args:
        text: Text to convert to speech
        voice_id: ElevenLabs voice ID (default: Cassidy)
        speed: Speech speed (0.25 to 4.0)
        stability: Voice stability (0.0 to 1.0)
        similarity_boost: Voice similarity (0.0 to 1.0)
        style: Voice style/expressiveness (0.0 to 1.0)

    Returns:
        bytes: MP3 audio data
    """
    audio = client.text_to_speech.convert(
        text=text,
        voice_id=voice_id,
        model_id="eleven_multilingual_v2",
        output_format="mp3_44100_128",
        voice_settings={
            "speed": speed,
            "stability": stability,
            "similarity_boost": similarity_boost,
            "style": style,
        },
    )
    # Convert generator to bytes
    audio_bytes = b"".join(audio)
    return audio_bytes


def stitch_audios(audio_list, pause_duration=500):
    """
    Stitch multiple audio files together with pauses in between.

    Args:
        audio_list: List of file paths to audio files
        pause_duration: Duration of pause between clips in milliseconds (default: 500ms)

    Returns:
        AudioSegment: Combined audio
    """
    current_audio = AudioSegment.empty()
    for audio_path in audio_list:
        segment = AudioSegment.from_file(audio_path, format="mp3")
        pause = AudioSegment.silent(duration=pause_duration)
        current_audio += pause
        current_audio += segment
    return current_audio


def stitch_audio_bytes(audio_bytes_list, pause_duration=500):
    """
    Stitch multiple audio byte arrays together with pauses in between.

    Args:
        audio_bytes_list: List of audio data as bytes
        pause_duration: Duration of pause between clips in milliseconds (default: 500ms)

    Returns:
        bytes: Combined audio as MP3 bytes
    """
    import io

    current_audio = AudioSegment.empty()

    for audio_bytes in audio_bytes_list:
        # Load audio from bytes
        segment = AudioSegment.from_file(io.BytesIO(audio_bytes), format="mp3")
        pause = AudioSegment.silent(duration=pause_duration)
        current_audio += pause
        current_audio += segment

    # Export to bytes
    output_io = io.BytesIO()
    current_audio.export(output_io, format="mp3")
    return output_io.getvalue()


def generate_clone(
    audio_bytes, name="userClone", description="User's custom voice clone"
):
    """
    Create a voice clone from audio sample.

    Args:
        audio_bytes: Audio data as bytes (generator will be converted)
        name: Name for the cloned voice
        description: Description of the voice

    Returns:
        Voice object with voice_id attribute
    """
    import tempfile

    # Convert generator to bytes if needed
    if hasattr(audio_bytes, "__iter__") and not isinstance(
        audio_bytes, (bytes, bytearray)
    ):
        audio_bytes = b"".join(audio_bytes)

    # Save to temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_file:
        temp_file.write(audio_bytes)
        temp_path = temp_file.name

    try:
        # Create voice clone
        voice = client.voices.ivc.create(
            name=name,
            files=[temp_path],
            description=description,
            remove_background_noise=True,
        )
        return voice
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.unlink(temp_path)
