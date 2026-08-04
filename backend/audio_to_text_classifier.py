import openai
import os
import torch
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification

# Load text classifier
MODEL_PATH = "models/text"  # your fine-tuned text model
tokenizer = DistilBertTokenizerFast.from_pretrained(MODEL_PATH)
text_model = DistilBertForSequenceClassification.from_pretrained(MODEL_PATH)
text_model.eval()

# Load your OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

def transcribe_with_openai(file_path):
    """
    Sends audio/video file to OpenAI Whisper API for transcription.
    Works with mp4, wav, m4a, mp3, flac, etc.
    """
    with open(file_path, "rb") as f:
        response = openai.audio.transcriptions.create(
            file=f,
            model="gpt-4o-tiny-transcribe"
        )
    return response["text"]

def classify_text(text):
    # Run through your text classifier
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = text_model(**inputs)
    probs = torch.softmax(outputs.logits, dim=1)
    pred = torch.argmax(probs).item()
    confidence = probs[0][pred].item()

    label_map = {0: "Neutral", 1: "Offensive", 2: "Hateful"}
    return label_map[pred], confidence

def audio_to_classification(file_path):
    print(f"📂 Processing file: {file_path}")
    
    # 1. Transcribe
    try:
        text = transcribe_with_openai(file_path)
    except Exception as e:
        print("❌ Transcription failed:", e)
        return None
    
    print("📄 Transcript:", text[:100], "....")

    # 2. Classify
    label, confidence = classify_text(text)
    return {"text": text, "label": label, "confidence": confidence}

if __name__ == "__main__":
    test_file = "audio_test/sample.mp4"  # your test file
    result = audio_to_classification(test_file)
    print("📊 Result:", result)
