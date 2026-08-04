# import os
# import json
# from PIL import Image
# import torch
# import torch.nn as nn
# from torch.utils.data import Dataset, DataLoader
# from transformers import CLIPProcessor, CLIPModel
# from sklearn.model_selection import train_test_split
# from collections import Counter
# from tqdm import tqdm

# # -------------------------
# # CONFIG
# # -------------------------
# DATASET_JSON = "Datasets/ImageDataset/MMHS150K_GT.json"
# IMAGE_DIR = "Datasets/ImageDataset/img_resized"
# SAVE_DIR = "saved_image_model"

# BATCH_SIZE = 8          # CPU friendly
# EPOCHS = 2              # pretrained model → few epochs
# LR = 1e-3
# MAX_SAMPLES = 20000     # LIMIT for speed (increase later)

# os.makedirs(SAVE_DIR, exist_ok=True)
# DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# # -------------------------
# # LABEL HANDLING
# # -------------------------
# def majority_vote(labels):
#     return Counter(labels).most_common(1)[0][0]

# def map_label(label):
#     return 0 if label == 0 else 1   # binary: neutral vs hate

# # -------------------------
# # LOAD DATASET
# # -------------------------
# with open(DATASET_JSON, "r", encoding="utf-8") as f:
#     raw_data = json.load(f)

# samples = []

# for tweet_id, data in raw_data.items():
#     img_path = os.path.join(IMAGE_DIR, f"{tweet_id}.jpg")
#     if not os.path.exists(img_path):
#         continue

#     voted = majority_vote(data["labels"])
#     final_label = map_label(voted)

#     samples.append((img_path, final_label))

# # speed limit
# samples = samples[:MAX_SAMPLES]

# train_samples, val_samples = train_test_split(
#     samples, test_size=0.2, random_state=42
# )

# print(f"Train: {len(train_samples)} | Val: {len(val_samples)}")

# # -------------------------
# # DATASET
# # -------------------------
# class ImageDataset(Dataset):
#     def __init__(self, samples, processor):
#         self.samples = samples
#         self.processor = processor

#     def __len__(self):
#         return len(self.samples)

#     def __getitem__(self, idx):
#         img_path, label = self.samples[idx]
#         image = Image.open(img_path).convert("RGB")
#         inputs = self.processor(images=image, return_tensors="pt")

#         return {
#             "pixel_values": inputs["pixel_values"].squeeze(0),
#             "labels": torch.tensor(label, dtype=torch.long)
#         }

# # -------------------------
# # MODEL
# # -------------------------
# class CLIPHateModel(nn.Module):
#     def __init__(self):
#         super().__init__()
#         self.clip = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
#         for p in self.clip.parameters():
#             p.requires_grad = False   # 🔥 speed boost

#         self.classifier = nn.Linear(self.clip.config.projection_dim, 2)

#     def forward(self, pixel_values, labels=None):
#         with torch.no_grad():
#             features = self.clip.get_image_features(pixel_values)

#         logits = self.classifier(features)
#         loss = None

#         if labels is not None:
#             loss = nn.CrossEntropyLoss()(logits, labels)

#         return loss, logits

# # -------------------------
# # INIT
# # -------------------------
# processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# train_ds = ImageDataset(train_samples, processor)
# val_ds = ImageDataset(val_samples, processor)

# train_loader = DataLoader(
#     train_ds, batch_size=BATCH_SIZE, shuffle=True, num_workers=0
# )
# val_loader = DataLoader(
#     val_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=0
# )

# model = CLIPHateModel().to(DEVICE)
# optimizer = torch.optim.Adam(model.classifier.parameters(), lr=LR)

# # -------------------------
# # TRAINING
# # -------------------------
# for epoch in range(EPOCHS):
#     model.train()
#     total_loss = 0

#     print(f"\nEpoch {epoch+1}/{EPOCHS}")
#     for batch in tqdm(train_loader):
#         pixel_values = batch["pixel_values"].to(DEVICE)
#         labels = batch["labels"].to(DEVICE)

#         loss, _ = model(pixel_values, labels)

#         optimizer.zero_grad()
#         loss.backward()
#         optimizer.step()

#         total_loss += loss.item()

#     avg_loss = total_loss / len(train_loader)
#     print(f"Train Loss: {avg_loss:.4f}")

#     # SAVE EACH EPOCH
#     torch.save(
#         model.state_dict(),
#         os.path.join(SAVE_DIR, f"clip_image_epoch_{epoch+1}.pt")
#     )

# print("\n✅ Image model training completed")
# print(f"📦 Models saved in: {SAVE_DIR}")





import os
import json
import torch
import torch.nn as nn
import torch.optim as optim
from PIL import Image
from torch.utils.data import Dataset, DataLoader
from transformers import CLIPProcessor, CLIPModel
from sklearn.model_selection import train_test_split
from collections import Counter
from tqdm import tqdm
import random

# -------------------------
# LOCAL CONFIGURATION
# -------------------------
# Change these paths to your local folder locations
DATASET_JSON = "Datasets/ImageDataset/MMHS150K_GT.json"
IMAGE_DIR = "Datasets/ImageDataset/img_resized"
SAVE_DIR = "harassment_image_model_local"

# Local Hardware Optimization
# If you have an NVIDIA GPU, it uses CUDA. If not, it uses CPU.
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
BATCH_SIZE = 32 if DEVICE == "cuda" else 8  # Keep batch small for local RAM
EPOCHS = 8             # 8 epochs is the sweet spot for CLIP fine-tuning
LR = 1e-4
MAX_SAMPLES = 20000    # Start with 20k to see results, increase if PC is fast

os.makedirs(SAVE_DIR, exist_ok=True)

# -------------------------
# DATA BALANCING
# -------------------------
def load_balanced_samples():
    print(f"🔍 Scanning JSON and local folder (this may take a minute)...")
    with open(DATASET_JSON, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    all_samples = []
    # Only use images that actually exist on your hard drive
    for tweet_id, data in tqdm(raw_data.items(), desc="Matching images"):
        img_path = os.path.join(IMAGE_DIR, f"{tweet_id}.jpg")
        if os.path.exists(img_path):
            voted = Counter(data["labels"]).most_common(1)[0][0]
            label = 0 if voted == 0 else 1
            all_samples.append((img_path, label))

    safe = [s for s in all_samples if s[1] == 0]
    hate = [s for s in all_samples if s[1] == 1]
    
    # Balance classes to avoid "Always predict Safe" bias
    min_len = min(len(safe), len(hate), MAX_SAMPLES // 2)
    balanced = random.sample(safe, min_len) + random.sample(hate, min_len)
    random.shuffle(balanced)
    
    print(f"📊 Training on {len(balanced)} balanced samples.")
    return balanced

# -------------------------
# MODEL ARCHITECTURE (High Accuracy MLP Head)
# -------------------------
class CLIPHarassmentClassifier(nn.Module):
    def __init__(self):
        super().__init__()
        # Loads the weights locally or downloads once from HuggingFace
        self.clip = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        self.clip.requires_grad_(False) # Freeze CLIP to make training 10x faster

        # MLP Head for deep feature recognition
        self.mlp = nn.Sequential(
            nn.Linear(self.clip.config.projection_dim, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(0.4), # Prevents overfitting
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Linear(256, 2) 
        )

    def forward(self, pixel_values):
        features = self.clip.get_image_features(pixel_values)
        return self.mlp(features)

# -------------------------
# DATASET CLASS
# -------------------------
class LocalSafeDataset(Dataset):
    def __init__(self, samples, processor):
        self.samples = samples
        self.processor = processor
    def __len__(self): return len(self.samples)
    def __getitem__(self, idx):
        path, label = self.samples[idx]
        try:
            img = Image.open(path).convert("RGB")
            pixel_values = self.processor(images=img, return_tensors="pt")["pixel_values"].squeeze(0)
            return pixel_values, label
        except:
            # Handle corrupted images by returning a random one
            return self.__getitem__(random.randint(0, len(self.samples)-1))

# -------------------------
# MAIN TRAINING LOOP
# -------------------------
if __name__ == "__main__":
    print(f"🚀 Starting Local Training on: {DEVICE}")
    
    samples = load_balanced_samples()
    train_s, val_s = train_test_split(samples, test_size=0.3, random_state=42, shuffle=True)
    
    processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
    train_loader = DataLoader(LocalSafeDataset(train_s, processor), batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(LocalSafeDataset(val_s, processor), batch_size=BATCH_SIZE)

    model = CLIPHarassmentClassifier().to(DEVICE)
    optimizer = optim.AdamW(model.parameters(), lr=LR, weight_decay=0.03)
    criterion = nn.CrossEntropyLoss()
    
    best_acc = 0

    for epoch in range(EPOCHS):
        model.train()
        total_loss = 0
        loop = tqdm(train_loader, desc=f"Epoch {epoch+1}")
        
        for pixels, labels in loop:
            pixels, labels = pixels.to(DEVICE), labels.to(DEVICE)
            
            optimizer.zero_grad()
            logits = model(pixels)
            loss = criterion(logits, labels)
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
            loop.set_postfix(loss=loss.item())

        # Validation at end of each epoch
        model.eval()
        correct = 0
        with torch.no_grad():
            for pixels, labels in val_loader:
                pixels, labels = pixels.to(DEVICE), labels.to(DEVICE)
                preds = model(pixels).argmax(dim=1)
                correct += (preds == labels).sum().item()
        
        val_acc = correct / len(val_s)
        print(f"📈 Epoch {epoch+1} Results -> Val Acc: {val_acc:.4f} | Loss: {total_loss/len(train_loader):.4f}")

        # Save Best Model Only
        if val_acc > best_acc:
            best_acc = val_acc
            torch.save(model.state_dict(), f"{SAVE_DIR}/best_harassment_model.pt")
            print("⭐ New Best model saved to folder!")

    print(f"\n✅ Training Complete! Best Accuracy: {best_acc:.4f}")