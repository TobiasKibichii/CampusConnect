import axios from "axios";

const API_URL = "http://localhost:6001";

export const getRecommendations = async (userId, token) => {
  try {
    const response = await axios.get(`${API_URL}/recommendations/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.recommendations;
  } catch (error) {
    console.error("Error fetching recommendations:", error.response?.data || error.message);
    return [];
  }
};

export const getSuggestedGroups = async (userId, token) => {
  try {
    const response = await axios.get(`${API_URL}/suggestedGroups/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.suggestedGroups;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getSuggestedFriends = async (userId, token) => {
  try {
    const response = await axios.get(`${API_URL}/suggestedFriends/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.suggestedFriends;
  } catch (error) {
    console.error(error);
    return [];
  }
};