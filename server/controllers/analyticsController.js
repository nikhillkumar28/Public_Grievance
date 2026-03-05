const Complaint = require("../models/Complaint");

const getStatusDistribution = async (_req, res) => {
  try {
    const data = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } }
    ]);
    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch status distribution", error: error.message });
  }
};

const getTrendingComplaints = async (_req, res) => {
  try {
    const data = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $project: {
          category: 1,
          upvotes: 1,
          engagement: { $add: ["$upvotes", { $multiply: [{ $cond: [{ $eq: ["$status", "escalated"] }, 1, 0] }, 5] }] }
        }
      },
      { $sort: { engagement: -1, upvotes: -1 } },
      { $limit: 10 }
    ]);
    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch trending complaints", error: error.message });
  }
};

const getDepartmentPerformance = async (_req, res) => {
  try {
    const data = await Complaint.aggregate([
      {
        $group: {
          _id: "$assignedDepartment",
          totalComplaints: { $sum: 1 },
          resolvedComplaints: {
            $sum: {
              $cond: [{ $eq: ["$status", "resolved"] }, 1, 0]
            }
          },
          avgUpvotes: { $avg: "$upvotes" }
        }
      },
      {
        $project: {
          _id: 0,
          department: "$_id",
          totalComplaints: 1,
          resolvedComplaints: 1,
          resolutionRate: {
            $cond: [
              { $eq: ["$totalComplaints", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$resolvedComplaints", "$totalComplaints"] },
                  100
                ]
              }
            ]
          },
          avgUpvotes: { $round: ["$avgUpvotes", 2] }
        }
      },
      { $sort: { totalComplaints: -1 } }
    ]);
    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch department performance", error: error.message });
  }
};

module.exports = {
  getStatusDistribution,
  getTrendingComplaints,
  getDepartmentPerformance
};
