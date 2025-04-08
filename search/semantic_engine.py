from pymongo import MongoClient
from bson.objectid import ObjectId
from sentence_transformers import SentenceTransformer, util
import torch

# Load the pre-trained Sentence Transformer model.
model = SentenceTransformer("all-MiniLM-L6-v2")

def encode(text: str):
    """Encodes text into an embedding tensor using the loaded model."""
    return model.encode(text, convert_to_tensor=True)

def semantic_search(query: str, items: list, threshold: float = 0.5):
    """
    Performs semantic search on the list of items (posts or users).
    
    Each item is expected to be a dictionary containing text fields.
    This function:
      - Encodes the query.
      - For each item, it concatenates the 'title', 'description', and 'bio' fields.
      - Computes cosine similarity between the query embedding and the item embedding.
      - Returns items with similarity above a threshold, sorted in descending order.
    """
    query_embedding = encode(query)
    results = []
    
    for item in items:
        # Combine available text fields; adjust fields based on your schema.
        text = " ".join([
            item.get("title", ""), 
            item.get("description", "")
        ]).strip()
        
        if not text:
            continue
        
        item_embedding = encode(text)
        similarity = util.cos_sim(query_embedding, item_embedding).item()
        
        if similarity > threshold:
            new_item = item.copy()
            new_item["similarity"] = similarity
            results.append(new_item)
    
    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results

def get_posts():
    """
    Queries the MongoDB for posts.
    Replace 'posts' with the actual name of your posts collection.
    """
    try:
        client = MongoClient("mongodb+srv://toby:kitoby789@cluster0.k8nhu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        db = client["socialpedia"]  # change "campusconnect" to your database name
        posts_cursor = db.posts.find()
        posts = list(posts_cursor)
        # Convert ObjectId to a string for each post.
        for post in posts:
            post["_id"] = str(post["_id"])
        return posts
    except Exception as e:
        print("Error querying posts:", e)
        return []
    finally:
        client.close()

def get_users():
    """
    Queries the MongoDB for users.
    Replace 'users' with your users collection name.
    """
    try:
        client = MongoClient("mongodb+srv://toby:kitoby789@cluster0.k8nhu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        db = client["socialpedia"]  # change as needed
        users_cursor = db.users.find()
        users = list(users_cursor)
        # Convert ObjectId to a string for each user.
        for user in users:
            user["_id"] = str(user["_id"])
        return users
    except Exception as e:
        print("Error querying users:", e)
        return []
    finally:
        client.close()

if __name__ == "__main__":
    # Define a sample search query
    query = "student interested in programming events"

    # Retrieve data from the database.
    posts = get_posts()
    users = get_users()

    # Perform semantic search on posts.
    print("🔍 Relevant Posts:")
    posts_results = semantic_search(query, posts)
    if posts_results:
        for post in posts_results:
            print(f"- {post.get('title', 'Untitled')} (Similarity: {post['similarity']:.2f})")
    else:
        print("No matching posts found.")

    # Perform semantic search on users.
    print("\n🔍 Relevant Users:")
    users_results = semantic_search(query, users)
    if users_results:
        for user in users_results:
            print(f"- {user.get('title', 'No Name')} (Similarity: {user['similarity']:.2f})")
    else:
        print("No matching users found.")
