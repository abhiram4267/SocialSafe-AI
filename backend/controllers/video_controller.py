

# import os
# import torch
# import tempfile
# import traceback
# import warnings
# from datetime import datetime
# from pathlib import Path

# # AI Models
# from nudenet import NudeDetector
# from faster_whisper import WhisperModel
# from transformers import AutoTokenizer, AutoModelForSequenceClassification
# from indic_transliteration import sanscript

# # MoviePy Import
# try:
#     from moviepy import VideoFileClip
# except ImportError:
#     from moviepy.editor import VideoFileClip

# # --- WINDOWS PATH BUG FIX ---
# BASE_DIR = Path(__file__).resolve().parent.parent
# # os.path.normpath ensures the path is valid for the Windows OS
# MODEL_DIR_NAME = "harassment_model_v3"
# TEXT_MODEL_PATH = os.path.normpath(os.path.join(BASE_DIR, "models", MODEL_DIR_NAME)).replace("\\", "/")

# _nude_detector = None
# _hm_model = None
# _tokenizer = None
# _stt_model = None

# def load_video_models():
#     global _nude_detector, _hm_model, _tokenizer, _stt_model
#     try:
#         # 1. Load NudeDetector
#         if _nude_detector is None:
#             print("⏳ Loading Visual Model (NudeNet)...")
#             _nude_detector = NudeDetector()

#         # 2. Load Harassment Model (The specific fix for your error)
#         if _hm_model is None:
#             if not os.path.exists(TEXT_MODEL_PATH):
#                 print(f"❌ ERROR: Model folder not found at {TEXT_MODEL_PATH}")
#                 raise FileNotFoundError(f"Folder missing: {TEXT_MODEL_PATH}")
            
#             print(f"⏳ Loading Harassment Model from LOCAL path: {TEXT_MODEL_PATH}")
#             # local_files_only=True stops it from trying to check the internet/HuggingFace Hub
#             _tokenizer = AutoTokenizer.from_pretrained(TEXT_MODEL_PATH, local_files_only=True)
#             _hm_model = AutoModelForSequenceClassification.from_pretrained(TEXT_MODEL_PATH, local_files_only=True)
#             _hm_model.eval()

#         # 3. Load Whisper
#         if _stt_model is None:
#             print("⏳ Loading Whisper (Base)...")
#             _stt_model = WhisperModel("base", device="cpu", compute_type="int8")
            
#         return _nude_detector, _hm_model, _tokenizer, _stt_model
#     except Exception as e:
#         print("❌ CRITICAL ERROR IN load_video_models:")
#         traceback.print_exc()
#         return None, None, None, None

# def warmup_video_models():
#     load_video_models()

# LABEL_MAP = {0: "Safe", 1: "Harassment", 2: "Cyberattack/Threat"}
# TELUGU_HINTS = "nuvvu, ela unnav, tinnava, lanja, puka, sallu, thoda, nudes, pampu"

# async def process_video(file):
#     start_time = datetime.now()
#     # Ensure models are loaded
#     nude_detector, hm_model, tokenizer, stt_model = load_video_models()
    
#     # If loading failed, return a proper error dictionary matching the schema
#     if None in (nude_detector, hm_model, tokenizer, stt_model):
#         return {
#             "filename": file.filename,
#             "prediction": "Model Error",
#             "visual_result": "Model failed to load",
#             "audio_transcript": "Check server logs for path issues",
#             "audio_result": "Error",
#             "audio_confidence": "0%",
#             "time_taken": "0s",
#             "created_at": datetime.utcnow()
#         }

#     # --- SAVE FILE SAFELY ---
#     fd, video_path = tempfile.mkstemp(suffix=f"_{file.filename}")
#     try:
#         with os.fdopen(fd, 'wb') as tmp:
#             tmp.write(await file.read())
        
#         audio_path = video_path + ".wav"
#         clip = VideoFileClip(video_path)
#         duration = clip.duration

#         # 1. Visual Analysis
#         max_visual_risk = "Safe"
#         frame_times = [duration * i for i in [0.2, 0.5, 0.8]]
#         for i, t in enumerate(frame_times):
#             temp_frame = f"{video_path}_f{i}.jpg"
#             clip.save_frame(temp_frame, t=t)
#             detections = nude_detector.detect(temp_frame)
#             for det in detections:
#                 if det['score'] > 0.5:
#                     label = det.get('class') or det.get('label') or "Unknown"
#                     if "EXPOSED" in label.upper() or label.upper() in ["BUTTOCKS", "ANUS"]:
#                         max_visual_risk = f"Sexual Visual ({label})"
#                         break
#             if os.path.exists(temp_frame): os.remove(temp_frame)
#             if max_visual_risk != "Safe": break

#         # 2. Audio Analysis
#         audio_prediction = "Safe"
#         audio_conf = "0%"
#         raw_text = "[No Audio]"
#         if clip.audio:
#             clip.audio.write_audiofile(audio_path, logger=None)
#             segments, info = stt_model.transcribe(audio_path, beam_size=5, initial_prompt=TELUGU_HINTS)
#             raw_text = " ".join([s.text for s in segments])
            
#             processed_text = raw_text
#             if info.language == "te" or info.language_probability < 0.6:
#                 processed_text = sanscript.transliterate(raw_text, sanscript.TELUGU, sanscript.ITRANS).lower()

#             inputs = tokenizer(processed_text, return_tensors="pt", truncation=True, padding="max_length", max_length=128)
#             with torch.no_grad():
#                 probs = torch.softmax(hm_model(**inputs).logits, dim=1)
#                 idx = torch.argmax(probs).item()
#                 audio_prediction = LABEL_MAP[idx]
#                 audio_conf = f"{round(probs[0][idx].item() * 100, 2)}%"

#         # 3. Fusion
#         final_verdict = "Safe"
#         if audio_prediction != "Safe" or max_visual_risk != "Safe":
#             final_verdict = "Harassment"

#         return {
#             "filename": file.filename,
#             "prediction": final_verdict,
#             "visual_result": max_visual_risk,
#             "audio_transcript": raw_text,
#             "audio_result": audio_prediction,
#             "audio_confidence": audio_conf,
#             "time_taken": f"{round((datetime.now()-start_time).total_seconds(), 1)}s",
#             "created_at": datetime.utcnow()
#         }

#     except Exception as e:
#         print("❌ VIDEO PROCESSING CRASH:")
#         traceback.print_exc()
#         return {
#             "filename": file.filename, "prediction": "Process Error", 
#             "visual_result": "Error", "audio_transcript": str(e), 
#             "audio_result": "Error", "audio_confidence": "0%",
#             "time_taken": "0s", "created_at": datetime.utcnow()
#         }
#     finally:
#         if 'clip' in locals(): clip.close()
#         if os.path.exists(video_path): os.remove(video_path)
#         if os.path.exists(audio_path): os.remove(audio_path)





# import os
# import torch
# import tempfile
# import traceback
# import asyncio
# import cv2
# from datetime import datetime
# from pathlib import Path
# from concurrent.futures import ThreadPoolExecutor

# # AI Models
# from nudenet import NudeDetector
# from faster_whisper import WhisperModel
# from transformers import AutoTokenizer, AutoModelForSequenceClassification
# from indic_transliteration import sanscript

# # --- PATH CONFIG ---
# BASE_DIR = Path(__file__).resolve().parent.parent
# MODEL_DIR_NAME = "harassment_model_v3"
# TEXT_MODEL_PATH = os.path.normpath(os.path.join(BASE_DIR, "models", MODEL_DIR_NAME)).replace("\\", "/")
# DEVICE = "cpu"

# # Global model variables
# _nude_detector = None
# _hm_model = None
# _tokenizer = None
# _stt_model = None

# # Acts like a Java ExecutorService for multi-threading
# executor = ThreadPoolExecutor(max_workers=4)

# def load_video_models():
#     """Load all 3 AI models into memory."""
#     global _nude_detector, _hm_model, _tokenizer, _stt_model
#     try:
#         if _nude_detector is None:
#             print("⏳ Loading Visual Model (NudeNet)...")
#             _nude_detector = NudeDetector()

#         if _hm_model is None:
#             print(f"⏳ Loading Harassment Model from: {TEXT_MODEL_PATH}")
#             _tokenizer = AutoTokenizer.from_pretrained(TEXT_MODEL_PATH, local_files_only=True)
#             _hm_model = AutoModelForSequenceClassification.from_pretrained(TEXT_MODEL_PATH, local_files_only=True)
#             _hm_model.eval()

#         if _stt_model is None:
#             print("⏳ Loading Whisper (Base)...")
#             _stt_model = WhisperModel("base", device=DEVICE, compute_type="int8")
            
#         return _nude_detector, _hm_model, _tokenizer, _stt_model
#     except Exception:
#         print("❌ CRITICAL ERROR LOADING MODELS")
#         traceback.print_exc()
#         return None, None, None, None

# # ✅ REQUIRED BY main.py
# def warmup_video_models():
#     print(f"📌 Checking path: {TEXT_MODEL_PATH}")
#     load_video_models()
#     print("✅ VIDEO MODELS ARE WARM AND READY")

# LABEL_MAP = {0: "Safe", 1: "Harassment", 2: "Cyberattack/Threat"}
# TELUGU_HINTS = "nuvvu, ela unnav, tinnava, lanja, puka, sallu, thoda, nudes, pampu"

# async def process_audio_task(video_path, stt_model, h_model, tokenizer):
#     """Transcription + Harassment Prediction (Runs in Parallel)"""
#     # beam_size=1 is 'Greedy Search' - much faster for 500ms goal
#     segments, info = stt_model.transcribe(video_path, beam_size=1, initial_prompt=TELUGU_HINTS)
#     raw_text = " ".join([s.text for s in segments]).strip()
    
#     if not raw_text:
#         return "Safe", "[No Audio Detected]", "0%"

#     # Telugu Transliteration
#     processed_text = raw_text
#     if info.language == "te" or info.language_probability < 0.6:
#         processed_text = sanscript.transliterate(raw_text, sanscript.TELUGU, sanscript.ITRANS).lower()

#     # Text AI Prediction
#     inputs = tokenizer(processed_text, return_tensors="pt", truncation=True, padding="max_length", max_length=128)
#     with torch.no_grad():
#         probs = torch.softmax(h_model(**inputs).logits, dim=1)
#         idx = torch.argmax(probs).item()
#         return LABEL_MAP[idx], raw_text, f"{round(probs[0][idx].item() * 100, 2)}%"

# async def process_visual_task(video_path, nude_detector):
#     """Frame extraction + Safety check (Runs in Parallel using OpenCV)"""
#     cap = cv2.VideoCapture(video_path)
#     total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
#     # Check only 2 frames to stay near 500ms (Middle and near end)
#     check_points = [total_frames // 2, max(0, total_frames - 5)]
#     max_risk = "Safe"

#     for frame_no in check_points:
#         cap.set(cv2.CAP_PROP_POS_FRAMES, frame_no)
#         ret, frame = cap.read()
#         if not ret: continue
        
#         # NudeNet can process the raw OpenCV frame directly (faster than saving to disk)
#         detections = nude_detector.detect(frame)
#         for det in detections:
#             label = det.get('class') or det.get('label') or "Unknown"
#             if det['score'] > 0.5 and ("EXPOSED" in label.upper() or label.upper() in ["BUTTOCKS", "ANUS"]):
#                 max_risk = f"Unsafe ({label})"
#                 break
#         if max_risk != "Safe": break
    
#     cap.release()
#     return max_risk

# async def process_video(file):
#     start_time = datetime.now()
#     models = load_video_models()
    
#     if None in models:
#         return {"prediction": "Model Error", "audio_transcript": "Check server logs"}

#     nude_detector, hm_model, tokenizer, stt_model = models

#     # Save incoming file to a fast temporary location
#     fd, video_path = tempfile.mkstemp(suffix=f"_{file.filename}")
#     try:
#         with os.fdopen(fd, 'wb') as tmp:
#             tmp.write(await file.read())

#         # --- 🚀 PARALLEL EXECUTION (Multi-threading) ---
#         # We launch audio and visual analysis at the same time
#         audio_job = process_audio_task(video_path, stt_model, hm_model, tokenizer)
#         visual_job = process_visual_task(video_path, nude_detector)

#         # Wait for both to finish simultaneously
#         (audio_pred, transcript, confidence), visual_risk = await asyncio.gather(audio_job, visual_job)

#         # Fusion Decision
#         final_verdict = "Safe"
#         if audio_pred != "Safe" or visual_risk != "Safe":
#             final_verdict = "Harassment"

#         return {
#             "filename": file.filename,
#             "prediction": final_verdict,
#             "visual_result": visual_risk,
#             "audio_transcript": transcript,
#             "audio_result": audio_pred,
#             "audio_confidence": confidence,
#             "time_taken": f"{(datetime.now()-start_time).total_seconds():.2f}s",
#             "created_at": datetime.utcnow()
#         }

#     except Exception as e:
#         traceback.print_exc()
#         return {"prediction": "Error", "audio_transcript": str(e), "created_at": datetime.utcnow()}
#     finally:
#         if os.path.exists(video_path):
#             os.remove(video_path)




import os
import torch
import tempfile
import traceback
import asyncio
import cv2
import uuid
import base64
from datetime import datetime
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

# AI Models
from nudenet import NudeDetector
from faster_whisper import WhisperModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from indic_transliteration import sanscript

# --- CONFIG ---
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR_NAME = "harassment_model_v3"
TEXT_MODEL_PATH = os.path.normpath(os.path.join(BASE_DIR, "models", MODEL_DIR_NAME)).replace("\\", "/")
DEVICE = "cpu" # Change to "cuda" if you have a GPU

# Global model variables
_nude_detector = None
_hm_model = None
_tokenizer = None
_stt_model = None

# Thread pool for CPU-bound tasks (Visual Analysis)
executor = ThreadPoolExecutor(max_workers=4)

def load_video_models():
    global _nude_detector, _hm_model, _tokenizer, _stt_model
    if all([_nude_detector, _hm_model, _tokenizer, _stt_model]):
        return _nude_detector, _hm_model, _tokenizer, _stt_model
        
    try:
        if _nude_detector is None:
            _nude_detector = NudeDetector()
        if _hm_model is None:
            _tokenizer = AutoTokenizer.from_pretrained(TEXT_MODEL_PATH, local_files_only=True)
            _hm_model = AutoModelForSequenceClassification.from_pretrained(TEXT_MODEL_PATH, local_files_only=True)
            _hm_model.eval()
        if _stt_model is None:
            # "tiny" is 3x faster than "base" if speed is the priority
            _stt_model = WhisperModel("base", device=DEVICE, compute_type="int8")
        return _nude_detector, _hm_model, _tokenizer, _stt_model
    except Exception:
        traceback.print_exc()
        return None, None, None, None

def warmup_video_models():
    load_video_models()
    print("✅ VIDEO MODELS OPTIMIZED & READY")

LABEL_MAP = {0: "Safe", 1: "Harassment", 2: "Cyberattack/Threat"}
TELUGU_HINTS = "nuvvu, ela unnav, tinnava, lanja, puka, sallu, thoda, nudes, pampu"

def sync_visual_task(video_path):
    """Synchronous CPU-bound visual check (runs in executor)"""
    detector, _, _, _ = load_video_models()
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # Optimization: Only check 3 frames (Start, Middle, End)
    # cap.set is expensive, so we only do it 3 times.
    sample_indices = [0, total_frames // 2, max(0, total_frames - 5)]
    
    max_score = 0
    visual_verdict = "Safe"

    for idx in sample_indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        success, frame = cap.read()
        if not success: continue

        # Resize for faster detection
        frame = cv2.resize(frame, (320, 320))
        detections = detector.detect(frame)
        
        for det in detections:
            label = (det.get('class') or det.get('label') or "Unknown").upper()
            score = det['score']
            if score > 0.5 and ("EXPOSED" in label or label in ["BUTTOCKS", "ANUS", "BREAST"]):
                visual_verdict = f"Unsafe ({label})"
                max_score = score
                break
        if visual_verdict != "Safe": break
    
    cap.release()
    return visual_verdict, max_score

async def process_video(file):
    start_time = datetime.now()
    loop = asyncio.get_event_loop()
    
    models = load_video_models()
    if None in models:
        return {"prediction": "Model Error", "audio_result": "Error"}
    
    nude_detector, hm_model, tokenizer, stt_model = models

    # 1. Create temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
        content = await file.read()
        tmp.write(content)
        video_path = tmp.name

    try:
        # --- 🚀 PARALLEL EXECUTION ---
        # Run Visual Analysis in a separate THREAD (Non-blocking)
        visual_task = loop.run_in_executor(executor, sync_visual_task, video_path)
        
        # Run Audio Transcription (Async)
        segments, info = stt_model.transcribe(
            video_path, 
            beam_size=1, 
            initial_prompt=TELUGU_HINTS,
            vad_filter=True # Speed boost: ignores silence
        )
        
        # Wait for Visual to finish while Audio is processing
        vis_risk, vis_score = await visual_task
        
        # Process Audio Results
        raw_text = " ".join([s.text for s in segments]).strip()
        audio_pred = "Safe"
        audio_conf_val = 0
        
        if raw_text:
            processed_text = raw_text
            if info.language == "te" or info.language_probability < 0.6:
                processed_text = sanscript.transliterate(raw_text, sanscript.TELUGU, sanscript.ITRANS).lower()
            
            inputs = tokenizer(processed_text, return_tensors="pt", truncation=True, max_length=128)
            with torch.no_grad():
                logits = hm_model(**inputs).logits
                probs = torch.softmax(logits, dim=1)
                idx = torch.argmax(probs).item()
                audio_pred = LABEL_MAP[idx]
                audio_conf_val = probs[0][idx].item()

        # --- 🛡️ FUSION LOGIC (The Requirement) ---
        # If either part is not Safe, final prediction is Harassment
        final_prediction = "Safe"
        if vis_risk != "Safe" or audio_pred != "Safe":
            final_prediction = "Harassment"

        # Calculate logical confidence
        # If harassment is found, use the higher of the two confidence scores
        final_conf_float = max(vis_score, audio_conf_val)
        if final_conf_float == 0: final_conf_float = 0.0 # Default

        return {
            "prediction": final_prediction,
            "visual_result": vis_risk,
            "audio_result": audio_pred,
            "audio_confidence": f"{round(final_conf_float * 100, 2)}%",
            "audio_transcript": raw_text if raw_text else "[No Speech]",
            "time_taken": f"{(datetime.now()-start_time).total_seconds():.2f}s"
        }

    except Exception as e:
        traceback.print_exc()
        return {"prediction": "Error", "audio_transcript": str(e)}
    finally:
        if os.path.exists(video_path):
            os.remove(video_path)