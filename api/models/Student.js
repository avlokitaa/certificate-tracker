const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  name: String,
  email: String,
  usn: String,
  password: String
});

module.exports = mongoose.model("Student", StudentSchema);
