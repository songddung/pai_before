import sys
import os

# Add the local, complete zonos source to the python path
# This is to bypass a faulty installation by pip from the git repo.
# The path is relative to this file's location (unified_server/).
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))

from fastapi import FastAPI

# Import routers and model loaders from their respective modules
from tts_module.tts import tts_router, load_tts_model
from vqa_module.vqa import vqa_router, load_vqa_models
from recommend_module.recommend import recommend_router

app = FastAPI(
    title="Unified AI Server - TTS and VQA",
    version="1.0",
    description="An integrated server providing both Text-to-Speech (TTS) and Visual Question Answering (VQA) functionalities."
)

@app.on_event("startup")
def on_startup():
    """Load all AI models on server startup."""
    print("--- Server startup sequence initiated ---")
    # Load models for each module sequentially
    load_tts_model()
    load_vqa_models()
    print("--- All models loaded. Server startup complete. ---")


@app.get("/")
def read_root():
    return {"message": "Welcome to the Unified AI Server. Visit /docs for API details."}

# Include routers from each module with their own prefixes and tags
app.include_router(tts_router, prefix="/api/ai/tts", tags=["TTS - Voice Cloning"])
app.include_router(vqa_router, prefix="/api/ai/vqa", tags=["VQA - Visual Question Answering"])
app.include_router(recommend_router, prefix="/api/ai/recommend", tags=["Recommend - "])