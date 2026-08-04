import torch
import torch.nn as nn
from PIL import Image
import io
import os
from datetime import datetime
from transformers import CLIPProcessor, CLIPModel
from pathlib import Path

# --- PATH CONFIG ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Point to your best epoch (Epoch 2 is usually better)


# MODEL_WEIGHTS_PATH = str(Path(BASE_DIR) / "models/saved_image_model/clip_image_epoch_2.pt").replace("\\", "/")

MODEL_WEIGHTS_PATH = str(Path(BASE_DIR) / "harassment_image_model_local/best_harassment_model.pt").replace("\\", "/")





# --- MODEL ARCHITECTURE (Must match training script) ---
# class CLIPHateModel(nn.Module):
#     def __init__(self):
#         super().__init__()
#         self.clip = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
#         self.classifier = nn.Linear(self.clip.config.projection_dim, 2)

#     def forward(self, pixel_values):
#         features = self.clip.get_image_features(pixel_values)
#         return self.classifier(features)


class CLIPHateModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.clip = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        # THIS MLP MUST BE EXACTLY THE SAME AS THE TRAINING SCRIPT
        self.mlp = nn.Sequential(
            nn.Linear(self.clip.config.projection_dim, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(0.4),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Linear(256, 2)
        )

    def forward(self, pixel_values):
        features = self.clip.get_image_features(pixel_values)
        return self.mlp(features)


# --- LAZY LOADING LOGIC ---
_model = None
_processor = None

def get_image_model():
    global _model, _processor
    if _model is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"⏳ INITIALIZING IMAGE MODEL ON {device}...")
        _processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
        _model = CLIPHateModel()
        _model.load_state_dict(torch.load(MODEL_WEIGHTS_PATH, map_location=device))
        _model.to(device)
        _model.eval()
        print("✅ IMAGE MODEL IS WARM AND READY")
    return _model, _processor

# Add this small function to trigger the load
def warmup_image_model():
    get_image_model()
# Based on your map_label function: 0 = neutral, 1 = hate
LABEL_MAP = {0: "Safe Image", 1: "Harassment/Inappropriate"}

async def process_image(file):
    model, processor = get_image_model()
    device = "cuda" if torch.cuda.is_available() else "cpu"

    try:
        # 1. Read binary image data
        content = await file.read()
        image = Image.open(io.BytesIO(content)).convert("RGB")

        # 2. Preprocess for CLIP
        inputs = processor(images=image, return_tensors="pt").to(device)

        # 3. Predict
        with torch.no_grad():
            logits = model(inputs["pixel_values"])
            probs = torch.softmax(logits, dim=1)
            pred_idx = torch.argmax(probs, dim=1).item()
            confidence = probs[0][pred_idx].item()

        print(f"✅ Image Processed: Prediction={LABEL_MAP.get(pred_idx, 'Unknown')}, Confidence={confidence:.4f}")
        return {
            "transcription": "Visual content analyzed", # matching schema structure
            "prediction": LABEL_MAP.get(pred_idx, "Unknown"),
            "confidence": f"{round(confidence * 100, 2)}%",
            "created_at": datetime.utcnow()
        }
    except Exception as e:
        print(f"❌ Image Processing Error: {e}")
        return {
            "transcription": "Error analyzing image",
            "prediction": "Error",
            "confidence": "0%",
            "created_at": datetime.utcnow()
        }