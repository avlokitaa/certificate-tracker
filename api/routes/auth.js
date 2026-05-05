const express = require("express");
const router = express.Router();

const Student = require("../models/Student");
const Proctor = require("../models/Proctor");

/* ===== STUDENT REGISTER ===== */
router.post("/student/register", async (req, res) => {
  const { name, email, usn, password } = req.body;

  if (!name || !email || !usn || !password) {
    return res.json({ success: false, message: "All fields required" });
  }

  const exists = await Student.findOne({ email });
  if (exists) {
    return res.json({ success: false, message: "Student already exists" });
  }

  await Student.create(req.body);
  res.json({ success: true });
});

/* ===== PROCTOR REGISTER ===== */
router.post("/proctor/register", async (req, res) => {
  const { name, email, empId, password } = req.body;

  if (!name || !email || !empId || !password) {
    return res.json({ success: false, message: "All fields required" });
  }

  const exists = await Proctor.findOne({ email });
  if (exists) {
    return res.json({ success: false, message: "Proctor already exists" });
  }

  await Proctor.create(req.body);
  res.json({ success: true });
});

/* ===== LOGIN ===== */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const student = await Student.findOne({ email: username, password });
  if (student) {
    req.session.user = { role: "student" };
    return res.json({ success: true, role: "student" });
  }

  const proctor = await Proctor.findOne({ email: username, password });
  if (proctor) {
    req.session.user = { role: "proctor" };
    return res.json({ success: true, role: "proctor" });
  }

  res.json({ success: false });
});

/* ===== CHECK SESSION ===== */
router.get("/me", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

module.exports = router;
