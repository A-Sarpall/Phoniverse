# TTS API Endpoints

## Overview

The server now has three TTS endpoints for generating speech, stitching audio, and creating voice clones.

## Endpoints

### 1. Generate Text-to-Speech

**POST** `/tts/generate`

Generate speech from text using ElevenLabs.

**Parameters (Form Data):**

-   `text` (required): Text to convert to speech
-   `voice_id` (optional): ElevenLabs voice ID (default: "56AoDkrOh6qfVPDXZ7Pt" - Cassidy)
-   `speed` (optional): Speech speed 0.25-4.0 (default: 0.8)
-   `stability` (optional): Voice stability 0.0-1.0 (default: 0.95)
-   `similarity_boost` (optional): Voice similarity 0.0-1.0 (default: 0.75)
-   `style` (optional): Voice expressiveness 0.0-1.0 (default: 0.0)

**Returns:** MP3 audio file

**Example (curl):**

```bash
curl -X POST "https://fcf604385834.ngrok-free.app/tts/generate" \
  -F "text=Hello, this is a test" \
  -F "speed=0.8" \
  -o output.mp3
```

**Example (JavaScript/Fetch):**

```javascript
const formData = new FormData();
formData.append("text", "Hello, this is a test");
formData.append("speed", "0.8");

const response = await fetch("https://fcf604385834.ngrok-free.app/tts/generate", {
    method: "POST",
    body: formData,
});

const audioBlob = await response.blob();
const audioUrl = URL.createObjectURL(audioBlob);
// Play or download the audio
```

---

### 2. Stitch Audio Files

**POST** `/tts/stitch`

Combine multiple audio files with pauses in between.

**Parameters:**

-   `audio_files` (required): Multiple audio files to stitch
-   `pause_duration` (optional): Pause duration in milliseconds (default: 500)

**Returns:** Combined MP3 audio file

**Example (curl):**

```bash
curl -X POST "https://fcf604385834.ngrok-free.app/tts/stitch" \
  -F "audio_files=@file1.mp3" \
  -F "audio_files=@file2.mp3" \
  -F "audio_files=@file3.mp3" \
  -F "pause_duration=1000" \
  -o stitched.mp3
```

**Example (JavaScript/Fetch):**

```javascript
const formData = new FormData();
formData.append("audio_files", file1); // File object
formData.append("audio_files", file2);
formData.append("audio_files", file3);
formData.append("pause_duration", "1000");

const response = await fetch("https://fcf604385834.ngrok-free.app/tts/stitch", {
    method: "POST",
    body: formData,
});

const audioBlob = await response.blob();
```

---

### 3. Create Voice Clone

**POST** `/tts/clone`

Create a custom voice clone from an audio sample.

**Parameters:**

-   `audio_file` (required): Audio sample for voice cloning
-   `name` (optional): Name for the cloned voice (default: "userClone")
-   `description` (optional): Description (default: "User's custom voice clone")

**Returns:** JSON with voice_id and details

**Example (curl):**

```bash
curl -X POST "https://fcf604385834.ngrok-free.app/tts/clone" \
  -F "audio_file=@voice_sample.mp3" \
  -F "name=MyVoice" \
  -F "description=My custom voice"
```

**Response:**

```json
{
    "voice_id": "abc123...",
    "name": "MyVoice",
    "description": "My custom voice",
    "status": "Voice clone created successfully"
}
```

**Example (JavaScript/Fetch):**

```javascript
const formData = new FormData();
formData.append("audio_file", audioFile); // File object
formData.append("name", "MyVoice");
formData.append("description", "My custom voice");

const response = await fetch("https://fcf604385834.ngrok-free.app/tts/clone", {
    method: "POST",
    body: formData,
});

const result = await response.json();
console.log("Voice ID:", result.voice_id);
// Use this voice_id in subsequent TTS requests
```

---

## Running the Server

```bash
cd backend
python server.py
# Server runs on https://fcf604385834.ngrok-free.app
```

## Testing with Swagger UI

Visit `https://fcf604385834.ngrok-free.app/docs` to see interactive API documentation and test the endpoints.

---

## React Native Example

```javascript
// Generate TTS
const generateSpeech = async (text) => {
    const formData = new FormData();
    formData.append("text", text);

    const response = await fetch("https://fcf604385834.ngrok-free.app/tts/generate", {
        method: "POST",
        body: formData,
    });

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
};

// Stitch multiple audio files
const stitchAudios = async (audioFiles) => {
    const formData = new FormData();
    audioFiles.forEach((file) => {
        formData.append("audio_files", file);
    });
    formData.append("pause_duration", "500");

    const response = await fetch("https://fcf604385834.ngrok-free.app/tts/stitch", {
        method: "POST",
        body: formData,
    });

    return await response.blob();
};

// Create voice clone
const createVoiceClone = async (audioFile, name) => {
    const formData = new FormData();
    formData.append("audio_file", audioFile);
    formData.append("name", name);

    const response = await fetch("https://fcf604385834.ngrok-free.app/tts/clone", {
        method: "POST",
        body: formData,
    });

    const result = await response.json();
    return result.voice_id;
};
```
