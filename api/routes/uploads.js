const express = require("express");
const router = express.Router();
const multer = require("multer");
const Certificate = require("../models/Certificate");

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files allowed"));
    }
  }
});

/* ===== UPLOAD CERTIFICATE ===== */
router.post("/upload", upload.single("certificate"), async (req, res) => {
  const cert = await Certificate.create({
    name: req.body.name,
    roll: req.body.roll,
    event: req.body.event,
    eventDate: req.body.eventDate,
    type: req.body.type,
    points: req.body.points,
    studentEmail: req.body.studentEmail,
    certificatePath: `/uploads/${req.file.filename}`
  });

  res.json({ success: true, cert });
});

/* ===== GET ALL ===== */
router.get("/all", async (req, res) => {
  const data = await Certificate.find();
  res.json(data);
});

router.get("/my", async (req, res) => {
  const data = await Certificate.find({ studentEmail: req.query.email });
  res.json(data);
});

module.exports = router;
