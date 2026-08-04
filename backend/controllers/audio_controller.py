

# import tempfile
# import torch
# import os
# import traceback # For debugging
# from datetime import datetime
# from database import audio_collection
# from faster_whisper import WhisperModel
# from transformers import AutoTokenizer, AutoModelForSequenceClassification
# from indic_transliteration import sanscript

# # Path Logic
# BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# TEXT_MODEL_PATH = os.path.join(BASE_DIR, "./models/harassment_model_v3").replace("\\", "/")

# _harassment_model = None
# _tokenizer = None
# _stt_model = None

# def load_models():
#     global _harassment_model, _tokenizer, _stt_model
    
#     # 1. Load Harassment Classifier (Text model)
#     if _harassment_model is None:
#         print("⏳ Loading Harassment Classifier for Audio...")
#         _tokenizer = AutoTokenizer.from_pretrained(TEXT_MODEL_PATH)
#         _harassment_model = AutoModelForSequenceClassification.from_pretrained(TEXT_MODEL_PATH)
#         _harassment_model.eval()

#     # 2. Load Whisper (STT model)
#     if _stt_model is None:
#         print("⏳ Loading LOCAL Speech-to-Text (Whisper Base)...")
#         # Ensure compute_type="int8" for CPU speed
#         _stt_model = WhisperModel("tiny", device="cpu", compute_type="int8")
        
#     return _stt_model, _harassment_model, _tokenizer

# # 🚨 ADD THIS FUNCTION
# def warmup_audio_models():
#     print("🎙️ Warming up Audio AI models...")
#     load_models()
#     print("✅ AUDIO MODELS ARE WARM AND READY")

# LABEL_MAP = {0: "Safe", 1: "Harassment", 2: "Cyberattack/Threat"}

# async def process_audio(file):
#     stt_model, h_model, tokenizer = load_models()
    
#     with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as tmp:
#         tmp.write(await file.read())
#         tmp_path = tmp.name

#     try:
#         # 1. Transcribe (Auto-detecting language is safer than forcing)
#         segments, info = stt_model.transcribe(tmp_path, beam_size=5)
#         native_text = " ".join([segment.text for segment in segments]).strip()
        
#         if not native_text:
#             raise ValueError("No speech detected")

#         # 2. Handle Telugu to English Transliteration
#         # We only transliterate if Whisper detected Telugu ('te')
#         processed_text = native_text
#         transliterated_text = ""

#         if info.language == "te":
#             print("🇮🇳 Telugu detected, converting script...")
#             transliterated_text = sanscript.transliterate(native_text, sanscript.TELUGU, sanscript.ITRANS)
#             processed_text = transliterated_text.lower().replace("^", "")
#         else:
#             print(f"🌍 {info.language} detected, keeping as is.")

#         # 3. Predict
#         inputs = tokenizer(processed_text, return_tensors="pt", truncation=True, padding="max_length", max_length=128)
#         with torch.no_grad():
#             outputs = h_model(**inputs)
#             probs = torch.softmax(outputs.logits, dim=1)

#         pred_index = torch.argmax(probs, dim=1).item()
#         confidence = probs[0][pred_index].item()

#         # 4. Prepare Result
#         result = {
#             "transcription": native_text,
#             "transliterated": processed_text, 
#             "prediction": LABEL_MAP.get(pred_index, "Unknown"),
#             "confidence": f"{round(confidence * 100, 2)}%",
#             "created_at": datetime.utcnow()
#         }

#         # 5. Database Save (use a copy to avoid _id issues)
#         db_data = result.copy()
#         db_data["filename"] = file.filename
#         await audio_collection.insert_one(db_data)

#         return result

#     except Exception as e:
#         print("❌ CRITICAL ERROR IN AUDIO CONTROLLER:")
#         traceback.print_exc() # This prints the EXACT line number of the crash
#         return {
#             "transcription": f"Error: {str(e)}",
#             "prediction": "Error",
#             "confidence": "0%",
#             "created_at": datetime.utcnow(),
#             "transliterated": ""
#         }
#     finally:
#         if os.path.exists(tmp_path):
#             os.remove(tmp_path)



# import tempfile
# import torch
# import os
# import traceback
# from datetime import datetime
# from pathlib import Path
# from database import audio_collection
# from faster_whisper import WhisperModel
# from transformers import AutoTokenizer, AutoModelForSequenceClassification
# from indic_transliteration import sanscript

# # --- PATH CONFIG ---
# # This looks for the folder 'harassment_model_v3' in your backend root
# BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# TEXT_MODEL_PATH = os.path.join(BASE_DIR, "./models/harassment_model_v3").replace("\\", "/")

# # Global variables
# _harassment_model = None
# _tokenizer = None
# _stt_model = None

# def load_models():
#     global _harassment_model, _tokenizer, _stt_model
    
#     try:
#         # Check if the folder exists
#         if not os.path.exists(TEXT_MODEL_PATH):
#             print(f"❌ ERROR: Model folder NOT FOUND at: {TEXT_MODEL_PATH}")
#             print(f"📂 Please ensure your folder is named 'harassment_model_v3' and is in {BASE_DIR}")
#             return None, None, None

#         if _harassment_model is None:
#             print(f"⏳ Loading Harassment Classifier from: {TEXT_MODEL_PATH}")
#             _tokenizer = AutoTokenizer.from_pretrained(TEXT_MODEL_PATH)
#             _harassment_model = AutoModelForSequenceClassification.from_pretrained(TEXT_MODEL_PATH)
#             _harassment_model.eval()

#         if _stt_model is None:
#             print("⏳ Loading LOCAL Whisper 'base' (Downloading if missing)...")
#             # Changed back to 'base' for faster first-time loading
#             _stt_model = WhisperModel("base", device="cpu", compute_type="int8")
            
#         return _stt_model, _harassment_model, _tokenizer
#     except Exception as e:
#         print("❌ CRITICAL ERROR LOADING MODELS:")
#         traceback.print_exc()
#         return None, None, None

# def warmup_audio_models():
#     print(f"🔍 Checking Model Path: {TEXT_MODEL_PATH}")
#     load_models()

# LABEL_MAP = {0: "Safe", 1: "Harassment", 2: "Cyberattack/Threat"}
# TELUGU_HINTS = "nuvvu, ela unnav, tinnava, lanja, puka, sallu, thoda, nudes, pampu, show me, vippi chupinchu"

# async def process_audio(file):
#     stt_model, h_model, tokenizer = load_models()
    
#     # If the model didn't load, this triggers your "Result: Error"
#     if stt_model is None or h_model is None:
#         print("🚨 Prediction aborted: Models are None")
#         return {
#             "transcription": "AI Model not loaded on server",
#             "prediction": "Error",
#             "confidence": "0%",
#             "created_at": datetime.utcnow()
#         }

#     with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as tmp:
#         tmp.write(await file.read())
#         tmp_path = tmp.name

#     try:
#         print("🎙️ Transcribing...")
#         segments, info = stt_model.transcribe(tmp_path, beam_size=5, initial_prompt=TELUGU_HINTS)
#         native_text = " ".join([segment.text for segment in segments]).strip()
        
#         if not native_text:
#             return {"transcription": "No speech detected", "prediction": "Safe", "confidence": "0%", "created_at": datetime.utcnow()}

#         processed_text = native_text
#         if info.language == "te" or info.language_probability < 0.5:
#             print(f"🇮🇳 Transliterating Telugu (Detected: {info.language})...")
#             transliterated = sanscript.transliterate(native_text, sanscript.TELUGU, sanscript.ITRANS)
#             processed_text = transliterated.lower().replace("^", "").replace("~", "")

#         inputs = tokenizer(processed_text, return_tensors="pt", truncation=True, padding="max_length", max_length=128)
#         with torch.no_grad():
#             outputs = h_model(**inputs)
#             probs = torch.softmax(outputs.logits, dim=1)

#         pred_index = torch.argmax(probs, dim=1).item()
#         confidence = probs[0][pred_index].item()

#         result = {
#             "transcription": native_text,
#             "prediction": LABEL_MAP.get(pred_index, "Unknown"),
#             "confidence": f"{round(confidence * 100, 2)}%",
#             "created_at": datetime.utcnow()
#         }
#         print(f"✅ Result: {result['prediction']} ({result['confidence']})")
#         return result

#     except Exception as e:
#         traceback.print_exc()
#         return {"transcription": "Process failed", "prediction": "Error", "confidence": "0%", "created_at": datetime.utcnow()}
#     finally:
#         if os.path.exists(tmp_path): os.remove(tmp_path)









# import tempfile
# import torch
# import os
# import traceback
# from datetime import datetime
# from pathlib import Path
# from database import audio_collection
# from faster_whisper import WhisperModel 
# from transformers import AutoTokenizer, AutoModelForSequenceClassification
# from indic_transliteration import sanscript

# # --- PATH CONFIG ---
# BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# TEXT_MODEL_PATH = os.path.join(BASE_DIR, "models", "harassment_model_v3").replace("\\", "/")

# # Global variables
# _harassment_model = None
# _tokenizer = None
# _stt_model = None

# def load_models():
#     global _harassment_model, _tokenizer, _stt_model
#     try:
#         if not os.path.exists(TEXT_MODEL_PATH):
#             print(f"❌ ERROR: Model folder NOT FOUND at: {TEXT_MODEL_PATH}")
#             return None, None, None

#         if _harassment_model is None:
#             print(f"⏳ Loading Harassment Classifier: {TEXT_MODEL_PATH}")
#             _tokenizer = AutoTokenizer.from_pretrained(TEXT_MODEL_PATH)
#             _harassment_model = AutoModelForSequenceClassification.from_pretrained(TEXT_MODEL_PATH)
#             _harassment_model.eval()

#         if _stt_model is None:
#             print("⏳ Loading Whisper (Base)...")
#             _stt_model = WhisperModel("base", device="cpu", compute_type="int8")
            
#         return _stt_model, _harassment_model, _tokenizer
#     except Exception:
#         traceback.print_exc()
#         return None, None, None

# def warmup_audio_models():
#     load_models()

# LABEL_MAP = {0: "Safe", 1: "Harassment", 2: "Cyberattack/Threat"}
# TELUGU_HINTS = "nuvvu, ela unnav, tinnava, lanja, puka, sallu, thoda, nudes, pampu, show me, vippi chupinchu,vp"

# async def process_audio(file):
#     stt_model, h_model, tokenizer = load_models()
    
#     if stt_model is None or h_model is None:
#         return {
#             "transcription": "AI Model not loaded",
#             "prediction": "Error",
#             "confidence": "0%",
#             "created_at": datetime.utcnow()
#         }

#     with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as tmp:
#         tmp.write(await file.read())
#         tmp_path = tmp.name

#     try:
#         # 1. INITIAL TRANSCRIPTION (Auto-detect)
#         print("🎙️ Detecting language...")
#         segments, info = stt_model.transcribe(tmp_path, beam_size=5, initial_prompt=TELUGU_HINTS)
        
#         # 2. APPLY "ENGLISH OR TELUGU" RULE
#         # info.language contains the detected code (en, te, ta, ml, etc.)
#         detected_lang = info.language
#         print(f"🌍 Whisper detected: {detected_lang} (Prob: {round(info.language_probability, 2)})")

#         if detected_lang != 'en':
#             # If not English, force Telugu to ensure we get Telugu script for transliteration
#             print(f"🇮🇳 Forcing Telugu transcription for accuracy...")
#             segments, info = stt_model.transcribe(tmp_path, beam_size=5, language='te')
#             is_telugu = True
#         else:
#             is_telugu = False

#         native_text = " ".join([segment.text for segment in segments]).strip()
        
#         if not native_text:
#             return {"transcription": "No speech detected", "prediction": "Safe", "confidence": "0%", "created_at": datetime.utcnow()}

#         # 3. TRANSLITERATE ONLY IF TELUGU
#         processed_text = native_text
#         if is_telugu:
#             # Convert Telugu characters (వస్తావా) to Latin/English script (vastava)
#             processed_text = sanscript.transliterate(native_text, sanscript.TELUGU, sanscript.ITRANS)
#             processed_text = processed_text.lower().replace("^", "").replace("~", "")
#             print(f"🔠 Transliterated: {processed_text}")

#         # 4. PREDICT
#         inputs = tokenizer(processed_text, return_tensors="pt", truncation=True, padding="max_length", max_length=128)
#         with torch.no_grad():
#             outputs = h_model(**inputs)
#             probs = torch.softmax(outputs.logits, dim=1)

#         pred_index = torch.argmax(probs, dim=1).item()
#         confidence = probs[0][pred_index].item()

#         result = {
#             "transcription": native_text,
#             "prediction": LABEL_MAP.get(pred_index, "Unknown"),
#             "confidence": f"{round(confidence * 100, 2)}%",
#             "created_at": datetime.utcnow()
#         }
        
#         print(f"✅ Result: {result['prediction']} ({result['confidence']})")
#         return result

#     except Exception as e:
#         traceback.print_exc()
#         return {"transcription": "Process failed", "prediction": "Error", "confidence": "0%", "created_at": datetime.utcnow()}
#     finally:
#         if os.path.exists(tmp_path): os.remove(tmp_path)




import tempfile
import torch
import os
import traceback
from datetime import datetime
from pathlib import Path
from database import audio_collection
from faster_whisper import WhisperModel 
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from indic_transliteration import sanscript

# --- PATH CONFIG ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEXT_MODEL_PATH = os.path.join(BASE_DIR, "models", "harassment_model_v3").replace("\\", "/")

# Global variables
_harassment_model = None
_tokenizer = None
_stt_model = None

def load_models():
    global _harassment_model, _tokenizer, _stt_model
    try:
        if not os.path.exists(TEXT_MODEL_PATH):
            print(f"❌ ERROR: Model folder NOT FOUND at: {TEXT_MODEL_PATH}")
            return None, None, None

        if _harassment_model is None:
            print(f"⏳ Loading Harassment Classifier: {TEXT_MODEL_PATH}")
            _tokenizer = AutoTokenizer.from_pretrained(TEXT_MODEL_PATH)
            _harassment_model = AutoModelForSequenceClassification.from_pretrained(TEXT_MODEL_PATH)
            _harassment_model.eval()

        if _stt_model is None:
            print("⏳ Loading Whisper (Base)...")
            # compute_type="int8" is best for CPU speed
            _stt_model = WhisperModel("base", device="cpu", compute_type="int8")
            
        return _stt_model, _harassment_model, _tokenizer
    except Exception:
        traceback.print_exc()
        return None, None, None

def warmup_audio_models():
    load_models()

LABEL_MAP = {0: "Safe", 1: "Harassment", 2: "Cyberattack/Threat"}
# Added more specific Telugu-English phonetics to the hints to bias the model
TELUGU_HINTS = "nuvvu, ela unnav, tinnava, lanja, puka, sallu, thoda, nudes, pampu, show me, vippi chupinchu, vp, dengey, kottesta"

async def process_audio(file):
    stt_model, h_model, tokenizer = load_models()
    
    if stt_model is None or h_model is None:
        return {"transcription": "AI Model Error", "prediction": "Error", "confidence": "0%", "created_at": datetime.utcnow()}

    with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        # 1. FAST DETECTION PASS (beam_size=1 for speed)
        # We let it detect language first
        _, info = stt_model.transcribe(tmp_path, beam_size=1, initial_prompt=TELUGU_HINTS)
        
        detected_lang = info.language
        lang_prob = info.language_probability
        
        # 2. "NOT ENGLISH = TELUGU" LOGIC
        # If Whisper is not highly confident it's English, we force Telugu
        is_telugu = False
        if detected_lang == 'en' and lang_prob > 0.85:
            print(f"🌍 High confidence English detected ({round(lang_prob*100)}%)")
            segments, _ = stt_model.transcribe(tmp_path, beam_size=1, language='en')
        else:
            # Force Telugu for everything else (ta, ml, hi, or low-conf en)
            print(f"🇮🇳 Forcing Telugu logic (Detected {detected_lang} with {round(lang_prob*100)}% prob)")
            segments, _ = stt_model.transcribe(tmp_path, beam_size=1, language='te', initial_prompt=TELUGU_HINTS)
            is_telugu = True

        native_text = " ".join([segment.text for segment in segments]).strip()
        
        if not native_text:
            return {"transcription": "No speech detected", "prediction": "Safe", "confidence": "0%", "created_at": datetime.utcnow()}

        # 3. TRANSLITERATION (Convert to model-readable format)
        processed_text = native_text
        if is_telugu:
            # Converts 'తెలుగు' script into 'telugu' letters
            processed_text = sanscript.transliterate(native_text, sanscript.TELUGU, sanscript.ITRANS)
            # Cleanup common transliteration symbols that confuse the model
            processed_text = processed_text.lower().replace("^", "").replace("~", "").replace(".n", "n")
            print(f"🔠 Telugu Transliterated: {processed_text}")
        else:
            processed_text = native_text.lower()
            print(f"📝 English Text: {processed_text}")

        # 4. PREDICT
        inputs = tokenizer(processed_text, return_tensors="pt", truncation=True, padding="max_length", max_length=128)
        with torch.no_grad():
            outputs = h_model(**inputs)
            probs = torch.softmax(outputs.logits, dim=1)

        pred_index = torch.argmax(probs, dim=1).item()
        confidence = probs[0][pred_index].item()

        result = {
            "transcription": native_text, # Original script (Telugu or English)
            "prediction": LABEL_MAP.get(pred_index, "Unknown"),
            "confidence": f"{round(confidence * 100, 2)}%",
            "created_at": datetime.utcnow()
        }
        
        print(f"✅ Final Result: {result['prediction']} ({result['confidence']})")
        return result

    except Exception as e:
        traceback.print_exc()
        return {"transcription": "Process failed", "prediction": "Error", "confidence": "0%", "created_at": datetime.utcnow()}
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)