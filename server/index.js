import cors from "cors";
import express from "express";
import artistRouter from "./routes/artist.js";
import artGroupRouter from "./routes/artgroup.js";
import commissionRouter from "./routes/commission.js";
import commissionerRouter from "./routes/commissioner.js";
import registrationRouter from "./routes/registration.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/api", commissionRouter);
app.use("/api", commissionerRouter);
app.use("/api", artistRouter);
app.use("/api", registrationRouter);
app.use("/api", artGroupRouter);

app.listen(port, () => {
  console.log(`Human Renaissance API listening on http://localhost:${port}`);
});
