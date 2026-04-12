const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["citizen", "authority", "admin"], default: "citizen" },
    department: {
      type: String,
      trim: true,
      default: null,
      validate: {
        validator(value) {
          if (this.role !== "authority") return true;
          return Boolean(value && value.trim());
        },
        message: "department is required for authority role"
      }
    },
    ward: { type: String, trim: true, default: null },
    address: { type: String, trim: true, default: null }
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
