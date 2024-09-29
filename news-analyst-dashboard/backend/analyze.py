import sys
from transformers import pipeline
import requests
from news_analysis import TextAnalysis
# Hugging Face API URL for summarization
API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"
headers = {"Authorization": "Bearer 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"}

def analyze(tool, text):
    
    def query(payload):
        response = requests.post(API_URL, headers=headers, json=payload)
        return response.json()
    if tool == 'summarizer':
        input_length = len(text)
        min_length = max(1, int(input_length * 0.1))
        min_length = max(1, int(input_length * 0.05))
        result = query({
            "inputs": text,
            "parameters": {
                "max_length": min_length,
                "min_length": min_length
            }
        })
        summary = result[0]['summary_text']
        return summary
    elif tool == 'sentiment':
        sentiment, confidence = obj.analyze_sentiment(text)
        return f"Sentiment: {sentiment} (Score: {confidence:.2f})"
    # Add more tool-specific logic here
if __name__ == "__main__":
    obj = TextAnalysis()

    tool = sys.argv[1]
    text = sys.argv[2]
    result = analyze(tool, text)
    print(result)