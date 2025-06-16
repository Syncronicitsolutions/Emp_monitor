import { DataTypes } from "sequelize";
import sequelize from "./index.js";

const Log = sequelize.define("Log", {
  employee_id: { type: DataTypes.STRING, allowNull: false },
  screenshot_url: DataTypes.TEXT,
  webcam_url: DataTypes.TEXT,
  web_log: DataTypes.TEXT,
  system_info: DataTypes.TEXT,
  status: DataTypes.STRING, // online/offline
  on_time_minutes: { type: DataTypes.INTEGER, defaultValue: 0 }, // ✅ Add this
}, {
  tableName: "Logs",
  timestamps: true,
  createdAt: "timestamp",
  updatedAt: false
});

export default Log;
