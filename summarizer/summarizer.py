from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with specific domains in production, e.g., ["https://yourdomain.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from transformers import BartTokenizer, BartForConditionalGeneration

tokenizer = BartTokenizer.from_pretrained("facebook/bart-large-cnn")
model = BartForConditionalGeneration.from_pretrained("facebook/bart-large-cnn")

summarizer = pipeline("summarization", model=model, tokenizer=tokenizer)


class TextInput(BaseModel):
    text: str
    
@app.post("/summarize")
def summarize(input: TextInput):
    tokens = tokenizer.encode(input.text)
    print("Input text:", input.text)
    print("Token count:", len(tokens))
    summary = summarizer(input.text, max_length=200, min_length=100, do_sample=False)
    print("Summary:", summary[0]["summary_text"])
    return {"summary": summary[0]["summary_text"]}



