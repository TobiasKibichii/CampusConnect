from sentence_transformers import SentenceTransformer, util
import torch

# Load the sentence-transformers model (automatically handles tokenizer & model)
model = SentenceTransformer("all-MiniLM-L6-v2")

def encode(text: str):
    return model.encode(text, convert_to_tensor=True)

def semantic_search(query: str, items: list):
    query_embedding = encode(query)
    results = []
    for item in items:
        # Combine title, description, and bio into one text
        text = " ".join([item.get("title", ""), item.get("description", ""), item.get("bio", "")]).strip()
        if not text:
            continue
        item_embedding = encode(text)
        similarity = util.cos_sim(query_embedding, item_embedding).item()
        if similarity > 0.5:  # You can adjust the similarity threshold
            new_item = item.copy()
            new_item["similarity"] = similarity
            results.append(new_item)
    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results

def get_posts():
    # 🔁 TODO: Replace this with your actual DB query to fetch posts
    return [
        {"title": "Campus Coding Hackathon", "description": "A 24-hour challenge", "bio": ""},
        {"title": "Karaoke Night", "description": "Fun and music for students", "bio": ""},
    ]

def get_users():
    # 🔁 TODO: Replace this with your actual DB query to fetch users
    return [
        {"title": "Jane Doe", "description": "Computer Science major", "bio": "Enjoys AI, web dev"},
        {"title": "John Smith", "description": "", "bio": "Member of Drama Club"},
    ]

# Example usage
if __name__ == "__main__":
    query = "student interested in programming events"
    posts = get_posts()
    users = get_users()

    print("🔍 Relevant Posts:")
    for post in semantic_search(query, posts):
        print(f"- {post['title']} ({post['similarity']:.2f})")

    print("\n🔍 Relevant Users:")
    for user in semantic_search(query, users):
        print(f"- {user['title']} ({user['similarity']:.2f})")
