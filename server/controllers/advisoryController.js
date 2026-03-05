const Advisory = require("../models/Advisory");

const createAdvisory = async (req, res) => {
  try {
    const { title, description, department, location, startDate, endDate } = req.body;
    if (!title || !description || !department || !startDate || !endDate) {
      return res.status(400).json({
        message: "title, description, department, startDate, endDate are required"
      });
    }

    const advisory = await Advisory.create({
      title,
      description,
      department,
      location: location || null,
      startDate,
      endDate
    });

    return res.status(201).json({ message: "Advisory created", advisory });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create advisory", error: error.message });
  }
};

const getActiveAdvisories = async (_req, res) => {
  try {
    const now = new Date();
    const advisories = await Advisory.find({
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ startDate: -1, createdAt: -1 });

    return res.status(200).json({ advisories });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch advisories", error: error.message });
  }
};

module.exports = { createAdvisory, getActiveAdvisories };
