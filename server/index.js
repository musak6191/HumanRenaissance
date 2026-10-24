import cors from "cors";
import express from "express";
import { randomUUID } from "node:crypto";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let commissions = [
  {
    id: "sample-1",
    title: "A quiet portrait of becoming",
    prompt:
      "Create an intimate oil portrait of a woman at dawn, surrounded by wild fennel and soft blue shadows. It should feel like the first page of a new chapter.",
    budget: 850,
    timeline: "2–3 months",
    createdAt: "2026-10-20T09:00:00.000Z",
  },
  {
    id: "sample-2",
    title: "The city that lives in rain",
    prompt:
      "A cinematic, slightly surreal painting of a rainy Lisbon street at night. Warm windows should glow against indigo pavement, with one red umbrella as the only bright colour.",
    budget: 1200,
    timeline: "3–4 months",
    createdAt: "2026-10-18T09:00:00.000Z",
  },
  {
    id: "sample-3",
    title: "A garden for my grandmother",
    prompt:
      "Illustrate a botanical garden filled with the flowers my grandmother grew: dahlias, sweet peas and lavender. Make it feel like a memory held in sunlight.",
    budget: 500,
    timeline: "1–2 months",
    createdAt: "2026-10-15T09:00:00.000Z",
  },
];

app.get("/api/commissions", (_request, response) => {
  response.json(commissions);
});

app.post("/api/commissions", (request, response) => {
  const { title, prompt, budget, timeline } = request.body;

  if (
    typeof title !== "string" ||
    title.trim().length < 3 ||
    typeof prompt !== "string" ||
    prompt.trim().length < 20 ||
    !Number.isFinite(Number(budget)) ||
    Number(budget) <= 0 ||
    typeof timeline !== "string" ||
    !timeline.trim()
  ) {
    response.status(400).json({
      message: "Please provide a title, a prompt of at least 20 characters, a budget, and a timeline.",
    });
    return;
  }

  const commission = {
    id: randomUUID(),
    title: title.trim(),
    prompt: prompt.trim(),
    budget: Number(budget),
    timeline: timeline.trim(),
    createdAt: new Date().toISOString(),
  };

  commissions = [commission, ...commissions];
  response.status(201).json(commission);
});

app.listen(port, () => {
  console.log(`Human Renaissance API listening on http://localhost:${port}`);
});
