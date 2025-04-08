from fastapi import FastAPI, Query
from semantic_engine import semantic_search, get_posts, get_users
from fastapi.middleware.cors import CORSMiddleware
import logging

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or your frontend URL like ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],  # <-- this is the key
    allow_headers=["*"],
)


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.get("/search")
def search(query: str = Query(...), type: str = Query("posts")):
    logger.info(f"Received search query: {query}, type: {type}")
    if type.lower() == "posts":
        items = get_posts()  # Replace with your actual posts/events fetch logic
        logger.info("Fetching posts...")
        results = semantic_search(query, items)
    elif type.lower() == "users":
        items = get_users()  # Replace with your actual users fetch logic
        logger.info("Fetching users...")
        results = semantic_search(query, items)
    else:
        logger.error("Invalid search type. Use 'posts' or 'users'.")
        return {"error": "Invalid search type. Use 'posts' or 'users'."}
    logger.info("Search results returned.")
    return {"results": results}
