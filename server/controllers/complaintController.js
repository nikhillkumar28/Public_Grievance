const Complaint = require("../models/Complaint");
const { predictComplaint } = require("../services/mlService");
const { findDuplicateComplaint } = require("../services/duplicateService");

const createComplaint = async (req, res) => {
  try {
    const { description } = req.body;
    const requestWard = req.body.ward || req.body["location[ward]"] || req.body["location.ward"];
    const requestAddress = req.body.address || req.body["location[address]"] || req.body["location.address"];
    const uploadedImageUrl = req.file ? `/uploads/complaints/${req.file.filename}` : req.body.imageUrl || null;
    if (!description) {
      return res.status(400).json({ message: "description is required" });
    }

    const mlPrediction = await predictComplaint(description);
    const ward = requestWard || req.user.ward || null;
    const duplicateResult = await findDuplicateComplaint({ description, ward });

    if (duplicateResult.duplicateFound) {
      return res.status(200).json({
        duplicateFound: true,
        similarComplaintId: duplicateResult.similarComplaintId,
        similarity: duplicateResult.similarity,
        message: "Similar complaint exists. Upvote instead?"
      });
    }

    const complaint = await Complaint.create({
      userId: req.user._id,
      description,
      category: mlPrediction.category || "General",
      urgency: mlPrediction.urgency || "Medium",
      confidence: mlPrediction.confidence ?? 0,
      location: {
        address: requestAddress || null,
        lat: null,
        lng: null,
        ward
      },
      imageUrl: uploadedImageUrl,
      assignedDepartment: mlPrediction.category || null,
      timeline: [{ status: "pending", updatedAt: new Date() }]
    });

    return res.status(201).json({
      message: "Complaint filed successfully",
      complaint
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create complaint", error: error.message });
  }
};

const listComplaints = async (req, res) => {
  try {
    const { status, category, urgency } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (urgency) query.urgency = urgency;

    if (req.user.role === "citizen") {
      query.userId = req.user._id;
    }

    if (req.user.role === "authority" && req.user.department) {
      query.assignedDepartment = req.user.department;
    }

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ complaints });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch complaints", error: error.message });
  }
};

const getPublicOverview = async (_req, res) => {
  try {
    const [totalComplaints, grouped] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
    ]);

    const statusMap = grouped.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return res.status(200).json({
      totalComplaints,
      pending: statusMap.pending || 0,
      in_progress: statusMap.in_progress || 0,
      resolved: statusMap.resolved || 0,
      escalated: statusMap.escalated || 0
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch public overview", error: error.message });
  }
};

const getTrendingComplaints = async (_req, res) => {
  try {
    const complaints = await Complaint.find()
      .select("description category status upvotes location createdAt urgency imageUrl")
      .sort({ upvotes: -1 })
      .limit(6);

    return res.status(200).json({ complaints });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch trending complaints", error: error.message });
  }
};

const getPublicRecent = async (_req, res) => {
  try {
    const complaints = await Complaint.find()
      .select("description category status upvotes location createdAt urgency imageUrl")
      .sort({ createdAt: -1 })
      .limit(9);

    return res.status(200).json({ complaints });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch recent complaints", error: error.message });
  }
};

const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    return res.status(200).json({ complaint });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch complaint", error: error.message });
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["pending", "in_progress", "resolved", "escalated"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (req.user.role === "authority" && req.user.department && complaint.assignedDepartment !== req.user.department) {
      return res.status(403).json({ message: "You can update only complaints assigned to your department" });
    }

    complaint.status = status;
    complaint.timeline.push({ status, updatedAt: new Date() });
    await complaint.save();

    return res.status(200).json({ message: "Complaint status updated", complaint });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update complaint status", error: error.message });
  }
};

const upvoteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.upvotedBy.some((id) => id.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: "Complaint already upvoted by this user" });
    }

    complaint.upvotes += 1;
    complaint.upvotedBy.push(req.user._id);
    await complaint.save();

    return res.status(200).json({ message: "Complaint upvoted", upvotes: complaint.upvotes });
  } catch (error) {
    return res.status(500).json({ message: "Failed to upvote complaint", error: error.message });
  }
};

module.exports = {
  createComplaint,
  listComplaints,
  getPublicOverview,
  getTrendingComplaints,
  getPublicRecent,
  getComplaintById,
  updateComplaintStatus,
  upvoteComplaint
};
