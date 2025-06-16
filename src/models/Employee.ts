import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";

const Employee = sequelize.define("Employee", {
  employee_id: { type: DataTypes.STRING, primaryKey: true },
  name: DataTypes.STRING,
  email: DataTypes.STRING,
}, {
  tableName: "Employees",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

export default Employee;
