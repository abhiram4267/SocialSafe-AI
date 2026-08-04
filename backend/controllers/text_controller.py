

import torch
import os
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# 1. Path to your new model (extracted from harassment_model_v3.zip)
MODEL_PATH = "./models/harassment_model_v3" 

# Global variables for Lazy Loading (keeps server restarts fast)
_model = None
_tokenizer = None

def load_text_model():
    """Internal function to load model into memory only once."""
    global _model, _tokenizer
    if _model is None or _tokenizer is None:
        try:
            print(f"⏳ Loading Text AI Model from {MODEL_PATH}...")
            _tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
            _model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
            _model.eval() # Set to evaluation mode
            print("✅ Text model loaded successfully!")
        except Exception as e:
            print(f"❌ Critical Error loading model: {e}")
    return _model, _tokenizer

# Mapping based on your harassment_model_v3 training
# 0: Not-Bullying, 1: Bullying, 2: Cyberattack/Threat
LABEL_MAP = {
    0: "Safe",
    1: "Harassment",
    2: "Cyberattack/Threat"
}

def predict_text(text: str):
    """
    Predicts if a message is Safe, Harassment, or an Attack.
    Handles English and Transliterated Telugu.
    """
    # Get the model and tokenizer (loads only on first call)
    model, tokenizer = load_text_model()
    
    if model is None or tokenizer is None:
        return {"error": "Model not available", "prediction": "Unknown", "confidence": 0}

    # Pre-process text
    text = text.strip()
    if not text:
        return {"error": "Empty text", "prediction": "Safe", "confidence": 100}

    # Tokenize input
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding="max_length",
        max_length=128
    )

    # Prediction
    with torch.no_grad():
        outputs = model(**inputs)
        # Apply softmax to get percentages for each label
        probs = torch.softmax(outputs.logits, dim=1)

    # Get the result
    pred_index = torch.argmax(probs, dim=1).item()
    confidence = probs[0][pred_index].item()

    return {
        "text": text,
        "prediction": LABEL_MAP.get(pred_index, "Unknown"),
        "confidence": round(confidence * 100, 2), # e.g. 98.45
        "label_id": pred_index
    }