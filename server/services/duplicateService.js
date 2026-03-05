const Complaint = require("../models/Complaint");

const tokenize = (text) =>
  new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
  );

const jaccard = (a, b) => {
  if (!a.size || !b.size) return 0;
  const intersection = [...a].filter((token) => b.has(token)).length;
  const union = new Set([...a, ...b]).size;
  return union ? intersection / union : 0;
};

const findDuplicateComplaint = async ({ description, ward, lookbackDays = 30, threshold = 0.45 }) => {
  const query = {
    createdAt: { $gte: new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000) }
  };

  if (ward) {
    query["location.ward"] = ward;
  }

  const recentComplaints = await Complaint.find(query).sort({ createdAt: -1 }).limit(100);
  const incomingTokens = tokenize(description);

  let best = { score: 0, complaint: null };

  for (const complaint of recentComplaints) {
    const score = jaccard(incomingTokens, tokenize(complaint.description));
    if (score > best.score) {
      best = { score, complaint };
    }
  }

  if (best.complaint && best.score >= threshold) {
    return {
      duplicateFound: true,
      similarComplaintId: best.complaint._id,
      similarity: best.score
    };
  }

  return { duplicateFound: false };
};

module.exports = { findDuplicateComplaint };
