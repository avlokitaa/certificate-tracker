import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import certificateRoutes from "./routes/certificate.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/certificate", certificateRoutes);

export default app;