import pandas as pd
import torch
import numpy as np
from torch.utils.data import Dataset, DataLoader
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from sklearn.model_selection import train_test_split
from torch.optim import AdamW
from torch.cuda.amp import GradScaler, autocast # For faster training
from tqdm import tqdm
import json
import os

# ----------------------------
# CONFIG (Optimized for Speed)
# ----------------------------
CSV_PATH = "Datasets/CyberBullying/cyberbullying.csv"
# DistilBERT is much faster. Multilingual-cased handles Telugu transliteration better.
MODEL_NAME = "distilbert-base-multilingual-cased" 
BATCH_SIZE = 16 # Increased for faster hardware utilization
EPOCHS = 3
LEARNING_RATE = 3e-5
MAX_LEN = 128
NUM_LABELS = 3   # 0: Not-Bullying, 1: Bullying, 2: Cyberattack/Threat
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
SAVE_DIR = "harassment_model_v2"

if not os.path.exists(SAVE_DIR):
    os.makedirs(SAVE_DIR)

# ----------------------------
# LOAD & CLEAN DATA
# ----------------------------
df = pd.read_csv(CSV_PATH)

# Match labels to the 3 categories based on your image
label_map = {
    "Not-Bullying": 0,
    "Bullying": 1,
    "Cyberattack/Threat": 2
}

df['label'] = df['Label'].map(label_map)
df = df.dropna(subset=['label', 'Text']) # Ensure no empty rows
df['label'] = df['label'].astype(int)

print(f"✅ Dataset Loaded. Distribution:\n{df['Label'].value_counts()}")

# ----------------------------
# TRAIN / VALIDATION SPLIT
# ----------------------------
train_texts, val_texts, train_labels, val_labels = train_test_split(
    df["Text"].tolist(),
    df["label"].tolist(),
    test_size=0.15, # Use slightly more for training to improve accuracy
    random_state=42,
    stratify=df["label"]
)

# ----------------------------
# FAST TOKENIZER
# ----------------------------
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, use_fast=True)

class TextDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_len):
        self.encodings = tokenizer(texts, truncation=True, padding="max_length", max_length=max_len)
        self.labels = labels

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx])
        return item

train_dataset = TextDataset(train_texts, train_labels, tokenizer, MAX_LEN)
val_dataset = TextDataset(val_texts, val_labels, tokenizer, MAX_LEN)

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, pin_memory=True)
val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE)

# ----------------------------
# MODEL & OPTIMIZER
# ----------------------------
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME, num_labels=NUM_LABELS)
model.to(DEVICE)

optimizer = AdamW(model.parameters(), lr=LEARNING_RATE)
scaler = GradScaler() # Helps speed up training on modern GPUs

# ----------------------------
# TRAINING LOOP (With AMP Speed Boost)
# ----------------------------
for epoch in range(EPOCHS):
    print(f"\n🚀 Epoch {epoch + 1}/{EPOCHS}")
    model.train()
    total_loss = 0

    for batch in tqdm(train_loader):
        optimizer.zero_grad()
        
        # Move batch to device
        input_ids = batch["input_ids"].to(DEVICE)
        attention_mask = batch["attention_mask"].to(DEVICE)
        labels = batch["labels"].to(DEVICE)

        # Mixed Precision context
        with autocast():
            outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
            loss = outputs.loss

        scaler.scale(loss).backward() # Scaled backprop
        scaler.step(optimizer)
        scaler.update()
        
        total_loss += loss.item()

    avg_loss = total_loss / len(train_loader)
    print(f"✅ Training Loss: {avg_loss:.4f}")

# ----------------------------
# SAVE MODEL + CONFIG
# ----------------------------
model.save_pretrained(SAVE_DIR)
tokenizer.save_pretrained(SAVE_DIR)

with open(f"{SAVE_DIR}/label_map.json", "w") as f:
    # Save the mapping so our app knows 0=Safe, etc.
    inv_map = {v: k for k, v in label_map.items()}
    json.dump(inv_map, f)

print(f"\n🎉 Training complete! Faster DistilBERT model saved in ./{SAVE_DIR}")