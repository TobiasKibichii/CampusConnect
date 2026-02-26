from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline, BartTokenizer, BartForConditionalGeneration

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

tokenizer = None
model = None
summarizer = None


@app.on_event("startup")
def load_model():
    global tokenizer, model, summarizer
    print("Loading model...")
    tokenizer = BartTokenizer.from_pretrained("facebook/bart-large-cnn")
    model = BartForConditionalGeneration.from_pretrained("facebook/bart-large-cnn")
    summarizer = pipeline("summarization", model=model, tokenizer=tokenizer)
    print("Model loaded successfully!")


class TextInput(BaseModel):
    text: str


@app.post("/summarize")
def summarize(input: TextInput):
    summary = summarizer(
        input.text,
        max_length=200,
        min_length=100,
        do_sample=False
    )
    return {"summary": summary[0]["summary_text"]}