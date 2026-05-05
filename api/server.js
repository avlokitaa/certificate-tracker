const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const path = require("path");

const app = express();

/* ===== MIDDLEWARE ===== */

app.use(cors({
  origin: "https://certificate-tracker-xi.vercel.app/", 
  credentials: true
}));

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.set("trust proxy", 1);

app.use(
  session({
    secret: "certitrack_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,        // required for HTTPS
      sameSite: "none"     // required for cross-origin
    }
  })
);

/* ===== DATABASE ===== */

if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI not set");
} else {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));
}

/* ===== ROUTES ===== */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/certificate", require("./routes/certificate"));

app.get("/", (req, res) => {
  res.send("Backend running");
});

/* ===== EXPORT ===== */
module.exports = app;