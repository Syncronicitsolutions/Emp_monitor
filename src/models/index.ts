import { Sequelize } from "sequelize";

// ✅ DB Config
const DB_HOST = "ep-late-band-a1u0yv6c-pooler.ap-southeast-1.aws.neon.tech";
const DB_PORT = 5432;
const DB_NAME = "emp_moniter";
const DB_USER = "syncronic";
const DB_PASS = "npg_BOgFiUZrWV85";

// ✅ Sequelize with SSL required
export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true, // 🔒 Require SSL
      rejectUnauthorized: false, // ✅ Accept self-signed certs (Neon allows this)
    },
  },
  logging: false,
});
