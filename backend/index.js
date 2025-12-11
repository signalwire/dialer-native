require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post("/signup", async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        error: "Password must be between 8 and 72 characters",
      });
    }

    const SPACE_NAME = process.env.SIGNALWIRE_SPACE_NAME;
    const PROJECT_ID = process.env.SIGNALWIRE_PROJECT_ID;
    const API_TOKEN = process.env.SIGNALWIRE_API_TOKEN;

    if (!SPACE_NAME || !PROJECT_ID || !API_TOKEN) {
      console.error("Missing SignalWire configuration");
      return res.status(500).json({
        error: "Server configuration error",
      });
    }

    const signalwireUrl = `https://${SPACE_NAME}.signalwire.com/api/fabric/resources/subscribers`;

    const credentials = Buffer.from(`${PROJECT_ID}:${API_TOKEN}`).toString(
      "base64"
    );

    const payload = {
      email,
      password,
      first_name,
    };

    if (last_name) {
      payload.last_name = last_name;
    }

    if (first_name && last_name) {
      payload.display_name = `${first_name} ${last_name}`;
    } else if (first_name) {
      payload.display_name = first_name;
    }

    console.log("[SIGNUP] Creating subscriber:", email);

    const response = await fetch(signalwireUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[SIGNUP] SignalWire error:", data);

      if (response.status === 422 && data.errors) {
        return res.status(422).json({
          errors: data.errors,
        });
      }

      return res.status(response.status).json({
        error: data.message || "Failed to create subscriber",
      });
    }

    console.log("[SIGNUP] Subscriber created successfully:", data.id);

    res.status(201).json({
      id: data.id,
      email: data.subscriber.email,
      first_name: data.subscriber.first_name,
      last_name: data.subscriber.last_name,
      display_name: data.subscriber.display_name,
      created_at: data.created_at,
    });
  } catch (error) {
    console.error("[SIGNUP] Server error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`SignalWire Dialer Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
