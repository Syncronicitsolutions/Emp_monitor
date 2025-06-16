import { DataTypes } from "sequelize";
import sequelize from "./index";

const Log = sequelize.define("Log", {
  employee_id: { type: DataTypes.STRING, allowNull: false },
  screenshot_url: DataTypes.TEXT,
  webcam_url: DataTypes.TEXT,
  web_log: DataTypes.TEXT,
  system_info: DataTypes.TEXT,    // ✅ added system info
  status: DataTypes.STRING,       // ✅ online / offline
}, {
  tableName: "Logs",
  timestamps: true,
  createdAt: "timestamp",
  updatedAt: false
});

export default Log;
