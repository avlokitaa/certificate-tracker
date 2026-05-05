const mongoose = require("mongoose");

const CertificateSchema = new mongoose.Schema({
  name: String,
  roll: String,
  event: String,
  eventDate: Date,
  type: String,
  points: Number,
  studentEmail: String,
  certificatePath: String
});

module.exports = mongoose.model("Certificate", CertificateSchema);
