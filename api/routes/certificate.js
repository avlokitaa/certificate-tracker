const express = require("express");
const router = express.Router();
const Certificate = require("../models/Certificate");
const multer = require("multer");

// Multer storage config
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


/* ===== UPLOAD (STUDENT) ===== */
router.post("/upload", upload.single("certificate"), async (req, res) => {
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);

  if (!req.file) {
    return res.status(400).json({ error: "NO FILE RECEIVED" });
  }

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

/* ===== VIEW ALL (PROCTOR DASHBOARD) ===== */
router.get("/all", async (req, res) => {
  const data = await Certificate.find();
  res.json(data);
});

// GET certificates of one student
router.get("/my", async (req, res) => {
  const email = req.query.email;
  const data = await Certificate.find({ studentEmail: email });
  res.json(data);
});


module.exports = router;
