const env = require("./environment");

const whitelist = env.NODE_ENV === "production"
  ? [env.CLIENT_URL]
  : [
      env.CLIENT_URL,
      "http://localhost:5173",
      "http://localhost:3000",
    ];

module.exports = {
  origin: function (origin, callback) {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}. Allowed: ${whitelist.join(", ")}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
