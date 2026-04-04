const http = require("http");

const payload = JSON.stringify({
  source: "Andheri",
  destination: "BKC",
  speed: 70,
  cost: 50,
  comfort: 30,
});

const options = {
  hostname: "localhost",
  port: 5000,
  path: "/api/route/plan",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  },
};

console.log("Testing POST /api/route/plan\n");

const req = http.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log(`Status: ${res.statusCode}`);
    console.log("Response:\n");
    console.log(JSON.stringify(JSON.parse(data), null, 2));
  });
});

req.on("error", (err) => {
  console.error("Request failed:", err.message);
  console.log("\nMake sure the backend is running on port 5000");
});

req.write(payload);
req.end();
