import os
import io
import torch
import numpy as np
import cv2
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
from transformers import ViltProcessor, ViltForQuestionAnswering
from ultralytics import YOLO
from deep_translator import GoogleTranslator
import httpx
from dotenv import load_dotenv
import langdetect

vqa_router = APIRouter()

processor: ViltProcessor = None
model: ViltForQuestionAnswering = None
yolo_model: YOLO = None
device: torch.device = None
GMS_API_KEY: str = None
GMS_API_URL = "https://gms.ssafy.io/gmsapi/api.openai.com/v1/chat/completions"

def load_vqa_models():
    global processor, model, yolo_model, device, GMS_API_KEY

    print("--- VQA Module Loading ---")
    load_dotenv("/apps/AI_integration/.env")
    GMS_API_KEY = os.getenv("GMS_API_KEY")
    if not GMS_API_KEY:
        print("WARNING: GMS_API_KEY not found in .env file.")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"VQA models will be loaded on device: {device}")

    yolo_model_path = "unified_server/models/best.pt"
    if not os.path.exists(yolo_model_path):
        raise FileNotFoundError(f"YOLO model not found at {yolo_model_path}.")
    yolo_model = YOLO(yolo_model_path)
    print("YOLO model loaded successfully.")

    try:
        model_name = "dandelin/vilt-b32-finetuned-vqa"
        processor = ViltProcessor.from_pretrained(model_name)
        model = ViltForQuestionAnswering.from_pretrained(model_name)
        model.eval()
        model.to(device)
        print("VQA model loaded successfully.")
    except Exception as e:
        print(f"FATAL: Could not load VQA model: {e}")
        processor = None
        model = None

    print("--- VQA Module Loaded ---")

def translate_to_english(text: str) -> str:
    try:
        return GoogleTranslator(source='ko', target='en').translate(text)
    except Exception as e:
        print(f"Error during translation: {e}")
        return text

def detect_language(text: str) -> str:
    try:
        return langdetect.detect(text)
    except:
        return "unknown"

def analyze_image(image_bytes: bytes) -> str:
    if not yolo_model:
        return "YOLO model not loaded."
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    results = yolo_model(img)
    if len(results) == 0 or len(results[0].boxes) == 0:
        return "No object detected"

    boxes = results[0].boxes
    candidates = []
    for box in boxes:
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        conf = float(box.conf[0])
        cls = int(box.cls[0])
        label = yolo_model.names[cls]
        area = (x2 - x1) * (y2 - y1)
        candidates.append((label, conf, area))

    candidates.sort(key=lambda x: (x[2], x[1]), reverse=True)
    best_label, _, _ = candidates[0]
    return best_label

def answer_question_bytes(image_bytes: bytes, question: str) -> str:
    if not processor or not model:
        return "VQA model is not available."
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        inputs = processor(image, question, return_tensors="pt").to(device)
        with torch.no_grad():
            outputs = model(**inputs)
        logits = outputs.logits
        idx = logits.argmax(-1).item()
        return model.config.id2label[idx]
    except Exception as e:
        return f"Error during VQA inference: {e}"

async def call_llm(prompt: str, lang: str) -> str:
    if not GMS_API_KEY:
        return "LLM API key is not configured."
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GMS_API_KEY}",
    }
    json_data = {
        "model": "gpt-4o",
        "messages": [
            {"role": "developer", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt},
        ],
        "max_tokens": 150,
        "temperature": 0.7,
    }
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            response = await client.post(GMS_API_URL, headers=headers, json=json_data)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            return f"LLM API Error: {e}"

def add_subject_particle(name: str) -> str:
    last_char = name[-1]
    code = ord(last_char) - 0xAC00
    jongseong = code % 28
    return name if jongseong == 0 else name + "이"

async def fetch_image_from_url(url: str) -> bytes:
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.content
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"이미지 다운로드 실패: {e}")

@vqa_router.post("/")
async def handle_vqa(
    image_url: str = Form(...),
    question: str = Form(...),
    child_name: str = Form(...),
):
    if not model:
        raise HTTPException(status_code=503, detail="VQA model is not loaded.")

    image_bytes = await fetch_image_from_url(image_url)
    yolo_label = analyze_image(image_bytes)
    lang = detect_language(question)
    question_for_vqa = translate_to_english(question) if lang == "ko" else question
    vqa_answer = answer_question_bytes(image_bytes, question_for_vqa)
    child_with_particle = add_subject_particle(child_name)

    if lang == "ko":
        prompt = (
            f"{child_with_particle}가 사진을 보면서 이렇게 물었어:\n"
            f"\"{question}\"\n\n"
            f"그에 대한 답은 \"{vqa_answer}\"야.\n\n"
            f"이제 부모님인 내가 {child_with_particle}에게 짧고 쉽게, 따뜻하게 설명해줄게.\n"
            f"{child_with_particle} 눈높이에 맞게 2~3문장 이내로 말해줘."
        )
    else:
        prompt = (
            f"{child_with_particle} asked this question while looking at the picture:\n"
            f"\"{question}\"\n\n"
            f"The answer is \"{vqa_answer}\".\n\n"
            f"Now, as a parent, explain it to {child_with_particle} in a kind, simple way, within 2–3 sentences, easy for a child to understand."
        )

    final_answer = await call_llm(prompt, lang)

    return JSONResponse(
        content={
            "answer": final_answer,
            "vqa_direct_answer": vqa_answer,
            "question": question,
            "detected_object": yolo_label,
        }
    )