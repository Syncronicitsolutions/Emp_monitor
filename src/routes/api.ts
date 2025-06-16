import express, { Request, Response } from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import Employee from "../models/Employee.js";
import Log from "../models/Log.js";

dotenv.config();

const apiRoutes = express.Router();

// Initialize S3 client
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: process.env.AWS_REGION!,
});

// Multer S3 storage without ACL
const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET!,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const filename = `logs/${Date.now()}-${file.originalname}`;
      cb(null, filename);
    },
  }),
});
// ==== Register Employee ====
apiRoutes.post("/register", async (req: Request, res: Response) => {
  const { employeeId, name, email } = req.body;
  try {
    const [emp, created] = await Employee.findOrCreate({
      where: { employee_id: employeeId },
      defaults: { name, email },
    });
    res.json({ success: true, created });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Registration failed." });
  }
});

// ==== Upload Log to S3 ====
apiRoutes.post(
  "/log",
  upload.fields([
    { name: "screenshot", maxCount: 1 },
    { name: "webcam", maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    const { employeeId, webLog, systemInfo, status, onTimeMinutes } = req.body;

    try {
      const files = req.files as { [fieldname: string]: Express.MulterS3.File[] };
      const screenshot = files?.["screenshot"]?.[0];
      const webcam = files?.["webcam"]?.[0];

      const log = await Log.create({
        employee_id: employeeId,
        screenshot_url: screenshot?.location || null,
        webcam_url: webcam?.location || null,
        web_log: webLog,
        system_info: systemInfo,
        status,
        on_time_minutes: onTimeMinutes ? parseInt(onTimeMinutes) : 0,
      });

      res.json({ success: true, log });
    } catch (err) {
      console.error("Log error:", err);
      res.status(500).json({ error: "Failed to log." });
    }
  }
);

// ==== Get Logs by Employee ====
apiRoutes.get("/log/:employeeId", async (req: Request, res: Response) => {
  const { employeeId } = req.params;
  try {
    const logs = await Log.findAll({
      where: { employee_id: employeeId },
      order: [["timestamp", "DESC"]],
    });
    res.json({ success: true, logs });
  } catch (err) {
    console.error("Fetch logs error:", err);
    res.status(500).json({ error: "Failed to fetch logs." });
  }
});

// ==== Get All Logs ====
apiRoutes.get("/logs", async (_req: Request, res: Response) => {
  try {
    const logs = await Log.findAll({ order: [["timestamp", "DESC"]] });
    res.json({ success: true, logs });
  } catch (err) {
    console.error("Fetch all logs error:", err);
    res.status(500).json({ error: "Failed to fetch logs." });
  }
});

// ==== Delete Log by ID ====
apiRoutes.delete("/log/:id", async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const log = await Log.findByPk(id);
    if (!log) return res.status(404).json({ error: "Log not found" });

    // Optional: Delete files from S3 (not shown here)

    await log.destroy();
    res.json({ success: true, message: "Log deleted" });
  } catch (err) {
    console.error("Delete log error:", err);
    res.status(500).json({ error: "Failed to delete log." });
  }
});

// ==== Get Latest System Status of Each Employee ====
apiRoutes.get("/status", async (_req: Request, res: Response) => {
  try {
    const [results] =
      (await Log.sequelize?.query(`
        SELECT l1.*
        FROM "Logs" l1
        INNER JOIN (
          SELECT employee_id, MAX("timestamp") as max_time
          FROM "Logs"
          GROUP BY employee_id
        ) l2
        ON l1.employee_id = l2.employee_id AND l1."timestamp" = l2.max_time
        ORDER BY l1."timestamp" DESC;
      `)) || [];

    res.json({ success: true, data: results });
  } catch (err) {
    console.error("Status fetch error:", err);
    res.status(500).json({ error: "Failed to fetch employee status." });
  }
});

// ==== Get Uptime Summary for All Employees ====
apiRoutes.get("/uptime-summary", async (_req: Request, res: Response) => {
  try {
    const [results] =
      (await Log.sequelize?.query(`
        SELECT employee_id, SUM(on_time_minutes) as total_uptime_minutes,
               ROUND(AVG(on_time_minutes), 2) as avg_uptime_minutes
        FROM "Logs"
        GROUP BY employee_id
        ORDER BY total_uptime_minutes DESC;
      `)) || [];

    res.json({ success: true, data: results });
  } catch (err) {
    console.error("Uptime summary error:", err);
    res.status(500).json({ error: "Failed to fetch uptime summary." });
  }
});

export default apiRoutes;
