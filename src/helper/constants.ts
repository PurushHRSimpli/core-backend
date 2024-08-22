import * as dotenv from "dotenv";
dotenv.config();
export const constants = {
  port: process.env.PORT,
  DATABASE_CONNECTION: "DATABASE_CONNECTION",
  USER_MODEL: "USER_MODEL",
  ROLE_MODEL: "ROLE_MODEL",
  COMPANY_MODEL: "COMPANY_MODEL",
  PREFERENCE_MODEL: "PREFERENCE_MODEL",
  CULTURE_MODEL: "CULTURE_MODEL",
  db_url: process.env.DB_BASE_URL,
  user_type: ["wholeseller", "retailer"],
  order_status: ["placed", "packed", "out_for_delivery", "delevired"],
  payment_type: ["cash_on_delivery", "upi"],
  secret: "rdt_IRtz_RLodf0-xCmr",
  jwt_secret_key: process.env.JWT_SECRET_KEY,
  JWT: "JWT",
};
