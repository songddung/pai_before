import os
import uuid
import asyncio
import torch
import numpy as np
import cv2
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image
from transformers import ViltProcessor, ViltForQuestionAnswering
from ultralytics import YOLO
from googletrans import Translator
import httpx
from dotenv import load_dotenv
import io  # 파일 상단에 추가

# 번역기, 환경변수, VQA 모델, YOLO 모델 초기화
translator = Translator()
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL_NAME = "dandelin/vilt-b32-finetuned-vqa"

# YOLO 객체 인식 (초기화 1회)
yolo_model = YOLO("models/best.pt")

print("VQA 모델을 로드합니다...")
try:
    processor = ViltProcessor.from_pretrained(MODEL_NAME)
    model = ViltForQuestionAnswering.from_pretrained(MODEL_NAME)
    model.eval()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    print("VQA 모델 로드 완료.")
except Exception as e:
    print(f"모델 로딩 중 오류 발생: {e}")
    processor = None
    model = None

# 앱 인스턴스, 정적파일, 임시이미지 디렉터리
app = FastAPI()
static_dir = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")
temp_dir = os.path.join(os.path.dirname(__file__), "..", "temp_images")
os.makedirs(temp_dir, exist_ok=True)

def translate_to_english(text: str) -> str:
    try:
        translated = translator.translate(text, src='ko', dest='en')
        return translated.text
    except Exception:
        return text

def analyze_image(image_bytes: bytes) -> str:
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
    best_label, best_conf, best_area = candidates[0]
    return best_label

def answer_question_bytes(image_bytes: bytes, question: str) -> str:
    if not processor or not model:
        return "죄송합니다, AI 모델을 로드하지 못했습니다."
    try:
        image = Image.open(io.BytesIO(image_bytes))
        if image.mode != "RGB":
            image = image.convert("RGB")
        inputs = processor(image, question, return_tensors="pt").to(device)
        outputs = model(**inputs)
        logits = outputs.logits
        idx = logits.argmax(-1).item()
        answer = model.config.id2label[idx]
        return answer
    except Exception as e:
        return f"답변 생성 중 오류가 발생했습니다: {e}"

async def call_openrouter_llm(prompt: str) -> str:
    if not OPENROUTER_API_KEY:
        return "LLM API 키가 설정되어 있지 않습니다."
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    }
    json_data = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 150,
        "temperature": 0.7,
    }
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(OPENROUTER_API_URL, headers=headers, json=json_data)
        response.raise_for_status()
        data = response.json()
    return data["choices"][0]["message"]["content"].strip()

def call_llm_for_tone_variation(base_answer: str, tone: str) -> str:
    if tone == "기본":
        return base_answer
    elif tone == "친근하게":
        return f"음... {base_answer}인 것 같아요!"
    elif tone == "정중하게":
        return f"답변드리자면, {base_answer}입니다."
    elif tone == "단호하게":
        return f"{base_answer}. 더 이상 질문은 받지 않습니다."
    else:
        return f"[{tone} 말투] {base_answer}"

@app.get("/")
async def read_root():
    return FileResponse(os.path.join(static_dir, 'index.html'))

@app.post("/analyze/")
async def yolo_analyze(file: UploadFile = File(...)):
    image_bytes = await file.read()
    label = analyze_image(image_bytes)
    return {"label": label}

import io

@app.post("/api/vqa")
async def vqa_endpoint(
    image_file: UploadFile = File(...),
    question: str = Form(...),
    tone: str = Form("기본"),
):
    if not image_file:
        raise HTTPException(status_code=400, detail="이미지 파일이 필요합니다.")
    
    # 1. 이미지 바이트를 오직 한 번만 읽음 (변수로 저장)
    image_bytes = await image_file.read()
    
    # 2. YOLO 객체 식별 (바이트에서 바로)
    label = analyze_image(image_bytes)
    
    # 3. VQA 추론 (바이트 바로)
    question_en = translate_to_english(question)
    vqa_answer = answer_question_bytes(image_bytes, question_en)
    
    # 4. LLM 프롬프트 생성 및 응답
    prompt_text = (
        f"다음 질문에 대해 아이에게 알기 쉽게 설명해 주세요.\n"
        f"질문: {question}\n"
        f"짧은 답변: {vqa_answer}\n"
        f"친근하고 이해하기 쉽게 설명해 주세요."
    )
    llm_answer = await call_openrouter_llm(prompt_text)
    final_answer = call_llm_for_tone_variation(llm_answer, tone)
    
    # 5. 응답
    return JSONResponse(
        content={
            "answer": final_answer,
            "vqa_answer": vqa_answer,
            "question": question,
            "yolo": label
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server_test:app", host="0.0.0.0", port=8000, reload=True)
