import { Sequelize } from "sequelize";

// ✅ Replace these values with your actual DB config
const DB_HOST = "ep-late-band-a1u0yv6c-pooler.ap-southeast-1.aws.neon.tech";
const DB_PORT = 5432; // 👈 specify your port here
const DB_NAME = "emp_moniter";
const DB_USER = "syncronic";
const DB_PASS = "npg_BOgFiUZrWV85";

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT, // 👈 explicitly set the port
  dialect: "postgres",
  logging: false,
});
export default sequelize;