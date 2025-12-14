const mongoose = require('mongoose');

const AdminUserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'STAFF'], default: 'ADMIN' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminUser', AdminUserSchema);
