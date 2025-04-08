from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI()
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

class TextInput(BaseModel):
    text: str

@app.post("/summarize")
def summarize(input: TextInput):
    summary = summarizer(input.text, max_length=60, min_length=20, do_sample=False)
    return {"summary": summary[0]["summary_text"]}
