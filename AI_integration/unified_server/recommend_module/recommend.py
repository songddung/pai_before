import os
import math
import requests
from dotenv import load_dotenv
from fastapi import APIRouter
from pydantic import BaseModel
import urllib.parse

# 환경변수 로드
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
DATA_API_KEY = os.getenv("DATA_API_KEY")

recommend_router = APIRouter()

class RecommendRequest(BaseModel):
    user_id: int
    profile_id: int
    category: str
    lat: float
    lon: float


# Google Cloud Translate 클라이언트
def translate_text(text: str, source="en", target="ko") -> str:
    if not text:
        return ""
    url = "https://translation.googleapis.com/language/translate/v2"
    params = {
        "q": text,
        "source": source,
        "target": target,
        "format": "text",
        "key": GOOGLE_API_KEY,
    }
    res = requests.get(url, params=params)
    print(res)
    return res.json()["data"]["translations"][0]["translatedText"]


# 거리 계산 (Haversine 공식)
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    return R * (2 * math.asin(math.sqrt(a)))


@recommend_router.post("/")
def recommend_event(req: RecommendRequest):
    # 1. 번역
    translated_category = translate_text(req.category)

    # 2. 공공데이터 API 호출
    url = "http://apis.data.go.kr/B551011/KorService2/searchKeyword2"
    params = {
        "serviceKey": DATA_API_KEY,
        "MobileOS": "ETC",
        "MobileApp": "festivalApp",
        "_type": "json",
        "numOfRows": 50,
        "pageNo": 1,
        "arrange": "C",
        "keyword": translated_category,
    }

    res = requests.get(url, params=params)
    try:
        data = res.json()
    except Exception:
        return {"error": "Invalid JSON", "text": res.text}

    festivals = []
    items = data.get("response", {}).get("body", {}).get("items", {}).get("item", [])
    for item in items:
        try:
            fest_lat = float(item.get("mapy", 0))  # 위도
            fest_lon = float(item.get("mapx", 0))  # 경도
            distance = haversine(req.lat, req.lon, fest_lat, fest_lon)
            if distance <= 50:
                festivals.append(
                    {
                        "title": item.get("title", ""),
                        "address": item.get("addr1", ""),
                        "lat": fest_lat,
                        "lon": fest_lon,
                        "distance_km": round(distance, 2),
                        "first_image": item.get("firstimage", ""),
                        "tel": item.get("tel", ""),
                    }
                )
        except Exception:
            continue

    # 거리순 정렬
    festivals.sort(key=lambda x: x["distance_km"])

    return {
        "user_id": req.user_id,
        "profile_id": req.profile_id,
        "translated_category": translated_category,
        "festivals": festivals,
    }
