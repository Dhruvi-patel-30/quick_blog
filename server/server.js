import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";

import adminRouter from "./routes/adminRoutes.js";
import blogRouter from "./routes/blogRoutes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => res.send("API is Working"));
app.use("/api/admin", adminRouter);
app.use("/api/blog", blogRouter);

const PORT = process.env.PORT || 5000;

// ✅ Proper startup
const startServer = async () => {
  try {
    await connectDB(); // DB first
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Server start failed:", error.message);
  }
};

startServer();

export default app;
