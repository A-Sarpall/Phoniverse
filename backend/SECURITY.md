# Security: API Key Management

## ✅ Setup Instructions

### 1. Create your `.env` file

Copy the example file and add your actual API key:

```bash
cd backend
cp .env.example .env
```

Then edit `.env` and replace `your_api_key_here` with your actual ElevenLabs API key.

### 2. Verify `.env` is in `.gitignore`

Make sure `.env` is listed in `.gitignore` (already done):

```
backend/.env
.env
```

### 3. Check git status

Verify that `.env` is **NOT** being tracked:

```bash
git status
```

You should NOT see `.env` in the list of files to be committed.

---

## 📝 Usage

### In Jupyter Notebooks:

```python
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Use the API key
api_key = os.getenv("ELEVENLABS_API_KEY")
```

### In Python Scripts:

The `tts.py` and `server.py` files already use environment variables:

```python
import os

api_key = os.getenv("ELEVENLABS_API_KEY", "default_fallback_key")
```

---

## ⚠️ IMPORTANT: If You Accidentally Committed Your API Key

If you already committed your API key to git, you need to:

### 1. Immediately revoke/regenerate the API key

Go to [ElevenLabs Dashboard](https://elevenlabs.io/) and generate a new API key.

### 2. Remove the key from git history

```bash
# Remove the file from git history (requires force push)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env" \
  --prune-empty --tag-name-filter cat -- --all

# Or use BFG Repo-Cleaner (easier):
# brew install bfg
# bfg --delete-files .env
```

### 3. Force push (if working with a team, coordinate first!)

```bash
git push origin --force --all
```

---

## 🚀 Deployment

### For production deployment (Heroku, AWS, etc.):

Don't use `.env` files. Instead, set environment variables in your hosting platform:

**Heroku:**

```bash
heroku config:set ELEVENLABS_API_KEY=your_actual_key
```

**AWS Lambda/Elastic Beanstalk:**
Set environment variables in the console or via CLI.

**Docker:**

```bash
docker run -e ELEVENLABS_API_KEY=your_actual_key your-image
```

**Vercel/Netlify:**
Add environment variables in the project settings dashboard.

---

## 🔍 Quick Security Check

Run this to make sure your API key isn't in git:

```bash
# Search for your API key pattern in git history
git log -p | grep -i "sk_" || echo "✅ No API keys found in git history"

# Check current files
git ls-files | xargs grep -l "sk_" 2>/dev/null || echo "✅ No API keys in tracked files"
```

---

## 📚 Additional Resources

-   [ElevenLabs API Documentation](https://docs.elevenlabs.io/)
-   [python-dotenv Documentation](https://github.com/theskumar/python-dotenv)
-   [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
