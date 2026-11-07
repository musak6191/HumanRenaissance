import "dotenv/config";
import cors from "cors";
import express from "express";
import authRouter from "./routes/auth.js";
import artistRouter from "./routes/artist.js";
import artGroupRouter from "./routes/artgroup.js";
import chatRouter from "./routes/chat.js";
import commissionRouter from "./routes/commission.js";
import commissionerRouter from "./routes/commissioner.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use("/api", authRouter);
app.use("/api", commissionRouter);
app.use("/api", commissionerRouter);
app.use("/api", artistRouter);
app.use("/api", artGroupRouter);
app.use("/api", chatRouter);

app.listen(port, () => {
  console.log(`Human Renaissance API listening on http://localhost:${port}`);
});
