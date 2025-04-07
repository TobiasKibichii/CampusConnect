from fastapi import FastAPI, Query
from semantic_engine import semantic_search, get_posts, get_users
import logging

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
app = FastAPI()

@app.get("/search")
def search(query: str = Query(...), type: str = Query("posts")):
    if type.lower() == "posts":
        items = get_posts()  # Replace with your actual posts/events fetch logic
        results = semantic_search(query, items)
    elif type.lower() == "users":
        items = get_users()  # Replace with your actual users fetch logic
        results = semantic_search(query, items)
    else:
        return {"error": "Invalid search type. Use 'posts' or 'users'."}
    return {"results": results}
