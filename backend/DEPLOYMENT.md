# Speech Analysis API - Setup & Deployment Guide

## Architecture Decision

**Chosen Approach: FastAPI Backend with In-Memory Model Cache**

### Why this approach?

1. **Mobile apps can't run PyTorch**: React Native can't execute heavy ML models
2. **API server is necessary**: Backend handles all ML processing
3. **In-memory cache vs disk storage**:
    - ✅ **In-memory cache (chosen)**: Model stays in RAM between requests
        - First request: ~10 seconds (model loads)
        - Subsequent requests: ~2 seconds (instant model access)
    - ❌ **Disk storage**: Would reload from disk each time (~10 seconds per request)
4. **FastAPI benefits**:
    - Fast async processing
    - Automatic API documentation
    - Easy file uploads
    - Production-ready

---

## Local Development Setup

### 1. Install Dependencies

```bash
pip install -r requirements-server.txt
```

### 2. Start the Server

```bash
# Development mode (auto-reload)
uvicorn server:app --reload --host 0.0.0.0 --port 8000

# Or run directly
python server.py
```

### 3. Test the API

Visit: http://localhost:8000/docs (Interactive API documentation)

**Health Check:**

```bash
curl http://localhost:8000/health
```

**Analyze Speech:**

```bash
curl -X POST http://localhost:8000/analyze \
  -F "truth=@no_lisp.wav" \
  -F "recorded=@lisp.wav"
```

---

## React Native Integration

### 1. Update API URL

In `ReactNativeClient.js`, change:

```javascript
const API_BASE_URL = "http://YOUR_SERVER_IP:8000";
```

**For local testing:**

-   iOS Simulator: `http://localhost:8000`
-   Android Emulator: `http://10.0.2.2:8000`
-   Physical device: `http://192.168.x.x:8000` (your computer's local IP)

### 2. Install React Native Dependencies

```bash
npm install react-native-fs  # For file handling
# or
npm install expo-file-system  # If using Expo
```

### 3. Use the API

```javascript
import { analyzeSpeech } from "./ReactNativeClient";

const results = await analyzeSpeech(truthFileUri, recordedFileUri);
console.log(results.Truth.Transcription);
console.log(results.Recorded.Transcription);
```

---

## Production Deployment

### Option 1: Cloud VM (AWS EC2, DigitalOcean, etc.)

```bash
# 1. Install dependencies on server
pip install -r requirements-server.txt

# 2. Run with gunicorn (production WSGI server)
pip install gunicorn
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# 3. Use nginx as reverse proxy (recommended)
# 4. Set up SSL certificate (Let's Encrypt)
```

### Option 2: Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements-server.txt .
RUN pip install --no-cache-dir -r requirements-server.txt

COPY server.py .

EXPOSE 8000

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t speech-analysis-api .
docker run -p 8000:8000 speech-analysis-api
```

### Option 3: Cloud Functions (AWS Lambda, Google Cloud Run)

**Note:** Lambda has limitations:

-   Max 10GB RAM (model needs ~2-3GB)
-   Cold start time (~10s first request)
-   Better for serverless: Use AWS ECS or Google Cloud Run instead

---

## Performance Optimization

### Model Caching Strategy

**Current implementation (in-memory cache):**

-   ✅ Model loaded on server startup
-   ✅ Stays in RAM between requests
-   ✅ Sub-second inference after first load
-   ✅ No disk I/O overhead

**Why not save to disk?**

-   Disk loading: ~5-10 seconds per request
-   RAM loading: ~0.1 seconds per request
-   50-100x faster with in-memory cache!

### Scaling for Multiple Users

If you expect high traffic:

1. **Horizontal scaling**: Run multiple server instances behind load balancer
2. **GPU acceleration**: Use CUDA-enabled server for 2-3x speed boost
3. **Batch processing**: Process multiple requests together

---

## API Endpoints

### `GET /health`

Check server status and model loading state.

**Response:**

```json
{
    "status": "healthy",
    "model_loaded": true,
    "device": "cpu"
}
```

### `POST /analyze`

Analyze two audio files.

**Request:**

-   Form-data with two files: `truth` and `recorded`
-   Supported formats: WAV, MP3

**Response:**

```json
{
    "Truth": {
        "Transcription": "HEY THERE I'M SO GLAD YOU COULD MAKE IT..."
    },
    "Recorded": {
        "Transcription": "HEY THERE I'M SO GLAD YOU CUN MAKE IT..."
    }
}
```

---

## Security Considerations

For production:

1. **Rate limiting**: Prevent abuse

    ```bash
    pip install slowapi
    ```

2. **API key authentication**: Protect your endpoint

    ```python
    from fastapi.security import APIKeyHeader
    ```

3. **File size limits**: Already set to reasonable defaults

4. **CORS**: Update `allow_origins` in `server.py` to your app's domain

---

## Troubleshooting

**Q: Model takes too long to load?**

-   A: Normal on first request (~10s). Use startup preloading (already implemented)

**Q: Server crashes with OOM (Out of Memory)?**

-   A: Increase server RAM (need ~4GB minimum, 8GB recommended)

**Q: React Native can't connect to localhost?**

-   A: Use `10.0.2.2` for Android emulator, computer's IP for physical device

**Q: Want faster inference?**

-   A: Use GPU-enabled server (CUDA), or consider smaller model variant

---

## Cost Estimation

**Cloud hosting (per month):**

-   AWS EC2 t3.medium (4GB RAM): ~$30/month
-   DigitalOcean Droplet (4GB): ~$24/month
-   Google Cloud Run (pay per use): ~$10-50/month depending on traffic

**Recommendation:** Start with DigitalOcean or AWS EC2 for predictable pricing.
