import natural from "natural";
const TfIdf = natural.TfIdf;

// A helper function to compute cosine similarity between two numeric vectors.
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Given an array of documents (strings), this function calculates TF–IDF vectors for each document.
function computeTfIdfVectors(docs) {
  const tfidf = new TfIdf();
  docs.forEach(doc => tfidf.addDocument(doc));
  // Extract vocabulary by combining all terms in each document.
  const vocabulary = [];
  tfidf.documents.forEach(doc => {
    Object.keys(doc).forEach(term => {
      if (!vocabulary.includes(term)) {
        vocabulary.push(term);
      }
    });
  });
  // Compute each document's vector (an array of TF–IDF weights for each vocabulary term).
  const vectors = docs.map((_, idx) => {
    return vocabulary.map(term => tfidf.tfidf(term, idx));
  });
  return { vectors, vocabulary };
}

// Build the aggregated user document from liked posts, saved posts, and groups text.
// Then, for each candidate post (its text is built from title + description),
// compute the cosine similarity and return the top N recommendations.
export const recommendPostsForUser = (userAggText, candidatePosts, topN = 5) =>{
  // Build a corpus with the user aggregate document first.
  const corpus = [userAggText];
  candidatePosts.forEach(post => {
    // Combine the candidate post's title and description into one string.
    const postText = `${post.title} ${post.description}`;
    corpus.push(postText);
  });
  // Compute TF–IDF vectors for the entire corpus.
  const { vectors } = computeTfIdfVectors(corpus);
  const userVector = vectors[0];
  let recommendations = [];

  // For each candidate post vector (documents 1 .. N), compute similarity with the user vector.
  for (let i = 1; i < vectors.length; i++) {
    const similarity = cosineSimilarity(userVector, vectors[i]);
    recommendations.push({ post: candidatePosts[i - 1], similarity });
  }
  // Sort by similarity (highest first) and return the top recommendations.
  recommendations.sort((a, b) => b.similarity - a.similarity);
  return recommendations.slice(0, topN);
}


