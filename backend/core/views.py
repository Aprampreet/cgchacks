from io import BytesIO
from ninja import Router, File, Form,Schema
from ninja.files import UploadedFile
from django.shortcuts import get_object_or_404
from users.AuthHelper import JWTAuth
from .models import Session , ExtesionScan
from typing import List
import pickle 
import numpy as np
import pandas as pd
import requests
from django.core.files.uploadedfile import SimpleUploadedFile
core_router = Router()
import os
from django.conf import settings

MODEL_PATH = os.path.join(settings.BASE_DIR, "core", "ml_model", "car_price_model.pkl")
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

# if hasattr(model, 'named_steps'):
#     print("pipeline steps:", model.named_steps.keys())

# for step_name, step in model.named_steps.items():
#     if hasattr(step, 'transformers'):
#         for transformer in step.transformers:
#             name, transformer_obj, columns = transformer
#             print(f"transformer: {name}, columns: {columns}")


class ExtensionIn(Schema):
    url : str
    media_type : str



class CarFeatures(Schema):
    year: int
    mileage: float
    cylinders: int = 4
    doors: int = 4
    make: str = "Toyota"
    model: str = "Corolla"
    engine: str = "V4"
    fuel: str = "Gasoline"
    transmission: str = "Automatic"
    trim: str = "Base"
    body: str = "Sedan"
    exterior_color: str = "White"
    interior_color: str = "Black"
    drivetrain: str = "FWD"

@core_router.get("/health" , auth=JWTAuth())
def health_check(request):
    return {"message": "Fuck api"}

@core_router.post("/media-upload", auth=JWTAuth())
def media_upload(request, media_type: str = Form(...), file: UploadedFile = File(...)):

    session = Session.objects.create(
        user=request.user,
        media_type=media_type,
        input_media=file,
        status="pending",
    )

    return {
        "message": "File uploaded successfully",
        "session_id": session.id,
        "media_type": session.media_type,
        "media_url": session.input_media.url,
        "status": session.status,
    }

@core_router.get("/show-result", auth=JWTAuth())
def show_result(request, session_id: int):
    session = get_object_or_404(Session, id=session_id, user=request.user)

    return {
        "session_id": session.id,
        "status": 'completed',
        "media_type": session.media_type,
        "input_media": session.input_media.url if session.input_media else None,
        "processed_media": session.processed_media.url if session.processed_media else None,
        "result_data": session.result_data or None,
        "created_at": session.created_at.isoformat(),
        "updated_at": session.updated_at.isoformat(),
        "result_data": {
            "is_deepfake": False,
            "final_confidence": 0.87,
            "scores": {
                "Video Model": 0.82,
                "Audio Model": 0.91,
            },
            "temporal_data": [
                {"start": 0, "end": 15, "confidence": 0.72},
                {"start": 15, "end": 30, "confidence": 0.88},
                {"start": 30, "end": 45, "confidence": 0.93},
                {"start": 45, "end": 60, "confidence": 0.81},
            ],
        },
    }


@core_router.get("/show-history", auth=JWTAuth())
def show_result_history(request):
    sessions = Session.objects.filter(user=request.user).order_by("-created_at")
    if not sessions.exists():
        return {"history": []}

    history = [
        {
            "session_id": s.id,
            "media_type": s.media_type,
            "media_url": s.input_media.url,
            "status": 'completed',
            "processed_media": s.processed_media.url if s.processed_media else None,
            "result_data": s.result_data,
            "result_data": {
                "is_deepfake": False,
                "final_confidence": 0.87,
            },
            "created_at": s.created_at,
            "updated_at": s.updated_at,
        }
        for s in sessions
    ]
    return {"history": history}



@core_router.post("/extension-scan")
def extension_scan(request,data:ExtensionIn):
    url = data.url
    media_type = data.media_type
    if media_type not in ['image', 'video', 'audio']:
        return {"detail": "Invalid media_type. Must be 'image', 'video', or 'audio'."}, 400
    
    response = requests.get(url, stream=True, timeout=15)
    response.raise_for_status()
    content_type = response.headers.get('Content-Type', 'application/octet-stream')
    ext = content_type.split('/')[-1].split(';')[0]
    filename = f"ext_scan_{request.user.id}_{media_type}.{ext}"
    file_content = BytesIO(response.content)

    uploaded_file = SimpleUploadedFile(
        name=filename,
        content=file_content.read(),
        content_type=content_type
    )
    scan = ExtesionScan.objects.create(
        url=url,
        input_media=uploaded_file,
        media_type=media_type,
    )
    scan.save()

    return {
            "message": "Scan initiated and result is ready.",
            "scan_id": scan.id,
            "media_type": scan.media_type,
            "result_url": f"/report/{scan.id}",
            "is_deepfake": True,
            "confidence": 0.90
        }

