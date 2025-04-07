from transformers import AutoTokenizer, AutoModel
import torch
from sklearn.metrics.pairwise import cosine_similarity


# Load the model and tokenizer (using a sentence-transformers model)
tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
model = AutoModel.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")

def encode(text: str):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
    # Average the token embeddings to get a single vector representation
    embeddings = outputs.last_hidden_state.mean(dim=1)
    return embeddings

def semantic_search(query: str, items: list):
    query_embedding = encode(query)
    results = []
    for item in items:
        # Combine available text fields for a more robust representation.
        text = ""
        if "title" in item:
            text += item["title"] + " "
        if "description" in item:
            text += item["description"] + " "
        if "bio" in item:
            text += item["bio"] + " "
        if not text.strip():
            continue
        item_embedding = encode(text)
        similarity = cosine_similarity(query_embedding, item_embedding)[0][0]
        # Only return items that meet a similarity threshold (adjust as needed)
        if similarity > 0.5:
            new_item = item.copy()
            new_item["similarity"] = similarity
            results.append(new_item)
    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results

def get_posts():
    # TODO: Replace this with your actual database query to retrieve posts/events.
    # For example, query your MongoDB for posts/events and return a list of dictionaries.
    return []

def get_users():
    # TODO: Replace this with your actual database query to retrieve users.
    # For example, query your MongoDB for user profiles and return a list of dictionaries.
    return []
