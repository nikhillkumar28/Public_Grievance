from flask import Flask, request, jsonify
import joblib
import re
from flask_cors import CORS
from pathlib import Path
import os

app = Flask(__name__)
CORS(app)

# Load Models 

BASE_DIR = Path(__file__).resolve().parent
vectorizer = joblib.load(BASE_DIR / "vectorizer.joblib")
category_model = joblib.load(BASE_DIR / "categoryclassifier.joblib")
urgency_model = joblib.load(BASE_DIR / "urgencyclassifier.joblib")

# Text Cleaning

def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-z\s]', '', text)
    return text

# Health Check

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ML API running"})

# Prediction Endpoint

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        text = data.get("text")

        if not text:
            return jsonify({"error": "Text is required"}), 400

        cleaned = clean_text(text)
        vec = vectorizer.transform([cleaned])

        # Predictions
        category = category_model.predict(vec)[0]
        urgency = urgency_model.predict(vec)[0]

        return jsonify({
            "category": category,
            "urgency": urgency
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

#RUN

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5001"))
    debug = os.getenv("FLASK_DEBUG", "0") == "1"
    app.run(host="0.0.0.0", port=port, debug=debug)
