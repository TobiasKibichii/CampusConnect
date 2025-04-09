from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer, util
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import logging
import json

# ---------------------------------
# Logging Configuration
# ---------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------
# FastAPI App Setup with CORS
# ---------------------------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your actual frontend URL(s)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------
# Helper Function: Serialize Data
# ---------------------------------
def serialize_mongo_data(data):
    """
    Recursively converts data from MongoDB to JSON serializable format:
      - Converts ObjectId to string.
      - Converts datetime objects to ISO format.
    """
    if isinstance(data, list):
        return [serialize_mongo_data(item) for item in data]
    elif isinstance(data, dict):
        return {key: serialize_mongo_data(value) for key, value in data.items()}
    elif isinstance(data, ObjectId):
        return str(data)
    elif isinstance(data, datetime):
        return data.isoformat()
    else:
        return data

# ---------------------------------
# Load the SentenceTransformer Model
# ---------------------------------
model = SentenceTransformer("all-MiniLM-L6-v2")

def encode(text: str):
    """
    Encode the given text into an embedding tensor.
    """
    return model.encode(text, convert_to_tensor=True)

def semantic_search(query: str, items: list, threshold: float = 0.2):
    """
    Perform semantic search over a list of items.
    
    For each item, concatenates available fields:
      - For events (type=="event"): description, about, whatYoullLearn.
      - For users: firstName, lastName, bio, and occupation.
      
    It computes the cosine similarity between the query embedding and each item's text embedding.
    Items with a similarity greater than or equal to the threshold are returned (sorted descending).
    """
    query_embedding = encode(query)
    results = []
    for item in items:
        fields = []
        # Check if this item represents an event.
        if item.get("type", "").lower() == "event":
            if "description" in item and item["description"]:
                fields.append(item["description"])
            if "about" in item and item["about"]:
                fields.append(item["about"])
            if "whatYoullLearn" in item and item["whatYoullLearn"]:
                fields.append(item["whatYoullLearn"])
        else:
            # Assume it's a user.
            if "firstName" in item and item["firstName"]:
                fields.append(item["firstName"])
            if "lastName" in item and item["lastName"]:
                fields.append(item["lastName"])
            if "bio" in item and item["bio"]:
                fields.append(item["bio"])
            if "occupation" in item and item["occupation"]:
                fields.append(item["occupation"])
                
        text = " ".join(fields).strip()
        logger.info(f"Processing text: {text}")
        if not text:
            continue
        item_embedding = encode(text)
        similarity = util.cos_sim(query_embedding, item_embedding).item()
        if similarity >= threshold:
            new_item = item.copy()
            new_item["similarity"] = similarity
            results.append(new_item)
    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results

# ---------------------------------
# MongoDB Connection Setup
# ---------------------------------
# Replace with your actual MongoDB connection string.
client = MongoClient("mongodb+srv://toby:kitoby789@cluster0.k8nhu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["test"]

def get_posts():
    """
    Retrieve posts (events) from the 'posts' collection.
    Assumes event documents have fields like: description, about, whatYoullLearn, etc.
    """
    posts_cursor = db.posts.find()
    posts = list(posts_cursor)
    logger.info(f"Loaded posts: {serialize_mongo_data(posts)}")
    for post in posts:
        post["_id"] = str(post["_id"])
    return posts

def get_users():
    """
    Retrieve users from the 'users' collection.
    Assumes user documents have fields like: firstName, lastName, bio, occupation.
    """
    users_cursor = db.users.find()
    users = list(users_cursor)
    logger.info(f"Loaded users: {serialize_mongo_data(users)}")
    for user in users:
        user["_id"] = str(user["_id"])
    return users

# ---------------------------------
# /search Endpoint
# ---------------------------------
@app.get("/search")
def search(query: str = Query(...), type: str = Query("posts")):
    """
    Search endpoint.
    
    Query Parameters:
      - query: The search text.
      - type: Either "posts" or "users" (defaults to "posts").
      
    This endpoint fetches the relevant collection from MongoDB, applies semantic search using
    SentenceTransformer embeddings, converts the data to a JSON serializable format, and returns it.
    """
    logger.info(f"Received search query: {query}, type: {type}")
    if type.lower() == "posts":
        items = get_posts()
        logger.info("Searching posts...")
    elif type.lower() == "users":
        items = get_users()
        logger.info("Searching users...")
    else:
        logger.error("Invalid search type. Use 'posts' or 'users'.")
        raise HTTPException(status_code=400, detail="Invalid search type. Use 'posts' or 'users'.")
    
    results = semantic_search(query, items)
    serialized_results = serialize_mongo_data(results)
    logger.info(f"Search results: {json.dumps(serialized_results, indent=2)}")
    logger.info("Returning search results.")
    return {"results": serialized_results}

# ---------------------------------
# Run the App if Executed as __main__
# ---------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=5000, reload=True)
