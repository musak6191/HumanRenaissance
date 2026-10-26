import express from "express";
import { randomUUID } from "node:crypto";
import { getCommissioner } from "./commissioner.js";

const router = express.Router();

let commissions = [
  {
    id: "sample-1",
    commissionerId: "sample-commissioner-1",
    title: "A quiet portrait of becoming",
    prompt:
      "Create an intimate oil portrait of a woman at dawn, surrounded by wild fennel and soft blue shadows. It should feel like the first page of a new chapter.",
    budget: 850,
    timeline: "2–3 months",
    createdAt: "2026-10-20T09:00:00.000Z",
  },
  {
    id: "sample-2",
    commissionerId: "sample-commissioner-1",
    title: "The city that lives in rain",
    prompt:
      "A cinematic, slightly surreal painting of a rainy Lisbon street at night. Warm windows should glow against indigo pavement, with one red umbrella as the only bright colour.",
    budget: 1200,
    timeline: "3–4 months",
    createdAt: "2026-10-18T09:00:00.000Z",
  },
  {
    id: "sample-3",
    commissionerId: "sample-commissioner-1",
    title: "A garden for my grandmother",
    prompt:
      "Illustrate a botanical garden filled with the flowers my grandmother grew: dahlias, sweet peas and lavender. Make it feel like a memory held in sunlight.",
    budget: 500,
    timeline: "1–2 months",
    createdAt: "2026-10-15T09:00:00.000Z",
  },
];

const getCommission = (id) => commissions.find((commission) => commission.id === id);

router.get(["/commission", "/commissions"], (_request, response) => {
  response.json(commissions);
});

router.get("/commission/:id", (request, response) => {
  const commission = getCommission(request.params.id);

  if (!commission) {
    response.status(404).json({ message: "Commission not found." });
    return;
  }

  response.json(commission);
});

router.post(["/commission", "/commissions"], (request, response) => {
  const { title, commissionerId } = request.body;

  if (typeof title !== "string" || !title.trim()) {
    response.status(400).json({ message: "A title is required." });
    return;
  }

  if (typeof commissionerId !== "string" || !getCommissioner(commissionerId)) {
    response.status(400).json({ message: "A valid commissionerId is required." });
    return;
  }

  const commission = {
    id: randomUUID(),
    ...request.body,
    title: title.trim(),
    createdAt: new Date().toISOString(),
  };

  commissions = [commission, ...commissions];
  response.status(201).json(commission);
});

router.put("/commission/:id", (request, response) => {
  const commissionIndex = commissions.findIndex(
    (commission) => commission.id === request.params.id,
  );

  if (commissionIndex === -1) {
    response.status(404).json({ message: "Commission not found." });
    return;
  }

  if (
    typeof request.body.commissionerId !== "string" ||
    !getCommissioner(request.body.commissionerId)
  ) {
    response.status(400).json({ message: "A valid commissionerId is required." });
    return;
  }

  const commission = {
    ...request.body,
    id: request.params.id,
  };
  commissions[commissionIndex] = commission;
  response.json(commission);
});

router.delete("/commission/:id", (request, response) => {
  const commissionIndex = commissions.findIndex(
    (commission) => commission.id === request.params.id,
  );

  if (commissionIndex === -1) {
    response.status(404).json({ message: "Commission not found." });
    return;
  }

  commissions.splice(commissionIndex, 1);
  response.status(204).send();
});

export default router;
