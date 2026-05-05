const mongoose = require("mongoose");

const ProctorSchema = new mongoose.Schema({
  name: String,
  email: String,
  empId: String,
  password: String
});

module.exports = mongoose.model("Proctor", ProctorSchema);
