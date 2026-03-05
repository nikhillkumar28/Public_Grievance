const axios = require("axios");

const predictComplaint = async (text) => {
  try {
    const response = await axios.post(process.env.ML_SERVICE_URL, { text });
    return response.data;
  } catch (error) {
    return {
      category: "General",
      urgency: "Medium",
      confidence: 0
    };
  }
};

module.exports = { predictComplaint };
