const axios = require("axios");

const ML_API_URL = process.env.ML_API_URL || "http://localhost:5001";

const predictComplaint = async (text) => {
  try {
    const res = await axios.post(`${ML_API_URL}/predict`, {
      text,
    });

    return res.data;
  } catch (error) {
    console.error("ML API Error:", error.message);

    // fallback (important for production)
    return {
      category: "General",
      urgency: "Low",
    };
  }
};

module.exports = { predictComplaint };
