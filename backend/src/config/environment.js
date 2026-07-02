require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 10000,
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_URL: process.env.CLIENT_URL || (
    process.env.NODE_ENV === "production"
      ? "https://pravaasin.vercel.app"
      : "http://localhost:5173"
  ),
  SARVAM_API_KEY: process.env.SARVAM_API_KEY || "",
};
