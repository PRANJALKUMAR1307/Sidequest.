# Sidequest — a little plan for your person ✳

A local AI-powered web application that turns details about your friend into charming, hyper-personalized hangout itineraries.

Built with pure vanilla HTML, modern CSS, JavaScript, and a lightweight Python backend connected to **Ollama** running **Qwen 2.5 (3B)** completely on your own machine. Your friend's information never leaves your device.

---

## ✨ Features

- **100% Private & Local AI**: Uses Ollama with Qwen2.5 locally. No cloud API keys or subscriptions required.
- **Zero Heavy Dependencies**: The Python backend uses only standard libraries (`http.server`, `urllib`, `json`), so no `pip install` steps are necessary!
- **Cozy Editorial Design**: Styled with warm typography, responsive layout, and charming timeline aesthetics.
- **Copy & Share Itinerary**: One-click copy button to text or paste the itinerary straight to your friend.
- **Instant Demo Mode**: Pre-fill with a sample friend profile and test sample itineraries instantly, even before starting Ollama.
- **Live Local AI Health Indicator**: Automatically detects if Ollama is running and which models are pulled.

---

## 🚀 Quickstart

### Step 1: Install & Start Ollama

1. Download and install Ollama from [ollama.com](https://ollama.com/download).
2. Open your terminal or PowerShell and pull the lightweight Qwen model:
   ```bash
   ollama pull qwen2.5:3b
   ```
3. Make sure Ollama is running (it usually starts in the background on system startup or by running `ollama serve`).

### Step 2: Start the Sidequest Server

Open your terminal in this project directory:

```bash
cd "C:\Users\Pranjal kumar\.gemini\antigravity\scratch\sidequest"
python server.py
```

### Step 3: Open in Your Browser

Visit:
```
http://127.0.0.1:8000
```

---

## 📁 Project Structure

```
sidequest/
├── index.html        # Main interface and form cards
├── style.css         # Typography, cozy color palette, animations, and timeline styles
├── script.js         # Interactive form logic, API calls, and plan rendering
├── server.py         # Standard library Python HTTP server & Ollama client
└── README.md         # Documentation and guide
```

---

## 🛠️ Configuration & Options

You can customize port, Ollama host, and model using environment variables:

| Environment Variable | Default | Description |
|----------------------|---------|-------------|
| `PORT` | `8000` | Port for the web server |
| `OLLAMA_HOST` | `http://127.0.0.1:11434` | URL to your Ollama daemon |
| `OLLAMA_MODEL` | `qwen2.5:3b` | Target LLM (e.g. `llama3.2`, `mistral`, `gemma2`) |

Example running with a different model:
```bash
set OLLAMA_MODEL=llama3.2
python server.py
```
