import cors from "cors";
import express from "express";
import commissionRouter from "./routes/commission.js";
import commissionerRouter from "./routes/commissioner.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/api", commissionRouter);
app.use("/api", commissionerRouter);

app.listen(port, () => {
  console.log(`Human Renaissance API listening on http://localhost:${port}`);
});
