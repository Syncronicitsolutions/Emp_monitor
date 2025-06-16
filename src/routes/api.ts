import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import Employee from "../models/Employee";
import Log from "../models/Log";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();

// ==== Multer for Uploads ====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ==== Register Employee ====
router.post("/register", async (req: Request, res: Response) => {
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

// ==== Log Upload ====
router.post(
  "/log",
  upload.fields([
    { name: "screenshot", maxCount: 1 },
    { name: "webcam", maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    const { employeeId, webLog, systemInfo, status } = req.body;

    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const screenshot = files?.["screenshot"]?.[0];
      const webcam = files?.["webcam"]?.[0];

      const log = await Log.create({
        employee_id: employeeId,
        screenshot_url: screenshot ? `/uploads/${screenshot.filename}` : null,
        webcam_url: webcam ? `/uploads/${webcam.filename}` : null,
        web_log: webLog,
        system_info: systemInfo,
        status,
      });

      res.json({ success: true, log });
    } catch (err) {
      console.error("Log error:", err);
      res.status(500).json({ error: "Failed to log." });
    }
  }
);

// ==== Get Logs by Employee ====
router.get("/log/:employeeId", async (req: Request, res: Response) => {
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
router.get("/logs", async (_req: Request, res: Response) => {
  try {
    const logs = await Log.findAll({ order: [["timestamp", "DESC"]] });
    res.json({ success: true, logs });
  } catch (err) {
    console.error("Fetch all logs error:", err);
    res.status(500).json({ error: "Failed to fetch logs." });
  }
});

// ==== Delete Log by ID ====
router.delete("/log/:id", async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const log = await Log.findByPk(id);
    if (!log) return res.status(404).json({ error: "Log not found" });

    await log.destroy();
    res.json({ success: true, message: "Log deleted" });
  } catch (err) {
    console.error("Delete log error:", err);
    res.status(500).json({ error: "Failed to delete log." });
  }
});

// ==== Get System Status of Each Employee (latest log) ====
router.get("/status", async (_req: Request, res: Response) => {
  try {
    const [results] = await Log.sequelize?.query(`
      SELECT l1.*
      FROM "Logs" l1
      INNER JOIN (
        SELECT employee_id, MAX("timestamp") as max_time
        FROM "Logs"
        GROUP BY employee_id
      ) l2
      ON l1.employee_id = l2.employee_id AND l1."timestamp" = l2.max_time
      ORDER BY l1."timestamp" DESC;
    `) || [];

    res.json({ success: true, data: results });
  } catch (err) {
    console.error("Status fetch error:", err);
    res.status(500).json({ error: "Failed to fetch employee status." });
  }
});

export default router;
