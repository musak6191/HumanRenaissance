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

let commissioners = [];

const getCommission = (id) => commissions.find((commission) => commission.id === id);
const getCommissioner = (id) => commissioners.find((commissioner) => commissioner.id === id);
const normalizeEmail = (email) => email.trim().toLowerCase();
const hasRequiredCommissionerCredentials = ({ email, passwordHash }) =>
  typeof email === "string" &&
  Boolean(email.trim()) &&
  typeof passwordHash === "string" &&
  Boolean(passwordHash.trim());
const emailBelongsToAnotherCommissioner = (email, id) =>
  commissioners.some(
    (commissioner) =>
      commissioner.id !== id && normalizeEmail(commissioner.email) === normalizeEmail(email),
  );

app.get(["/api/commission", "/api/commissions"], (_request, response) => {
  response.json(commissions);
});

app.get("/api/commission/:id", (request, response) => {
  const commission = getCommission(request.params.id);

  if (!commission) {
    response.status(404).json({ message: "Commission not found." });
    return;
  }

  response.json(commission);
});

app.post(["/api/commission", "/api/commissions"], (request, response) => {
  const { title } = request.body;

  if (typeof title !== "string" || !title.trim()) {
    response.status(400).json({ message: "A title is required." });
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

app.put("/api/commission/:id", (request, response) => {
  const commissionIndex = commissions.findIndex(
    (commission) => commission.id === request.params.id,
  );

  if (commissionIndex === -1) {
    response.status(404).json({ message: "Commission not found." });
    return;
  }

  const commission = {
    ...request.body,
    id: request.params.id,
  };
  commissions[commissionIndex] = commission;
  response.json(commission);
});

app.delete("/api/commission/:id", (request, response) => {
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

app.get("/api/commissioner", (_request, response) => {
  response.json(commissioners);
});

app.get("/api/commissioner/:id", (request, response) => {
  const commissioner = getCommissioner(request.params.id);

  if (!commissioner) {
    response.status(404).json({ message: "Commissioner not found." });
    return;
  }

  response.json(commissioner);
});

app.post("/api/commissioner", (request, response) => {
  const { email, passwordHash } = request.body;

  if (!hasRequiredCommissionerCredentials({ email, passwordHash })) {
    response.status(400).json({ message: "An email and passwordHash are required." });
    return;
  }

  if (emailBelongsToAnotherCommissioner(email)) {
    response.status(400).json({ message: "The email is already in use." });
    return;
  }

  const commissioner = {
    id: randomUUID(),
    ...request.body,
    email: normalizeEmail(email),
    passwordHash: passwordHash.trim(),
  };

  commissioners = [commissioner, ...commissioners];
  response.status(201).json(commissioner);
});

app.put("/api/commissioner/:id", (request, response) => {
  const commissionerIndex = commissioners.findIndex(
    (commissioner) => commissioner.id === request.params.id,
  );

  if (commissionerIndex === -1) {
    response.status(404).json({ message: "Commissioner not found." });
    return;
  }

  const { email, passwordHash } = request.body;

  if (!hasRequiredCommissionerCredentials({ email, passwordHash })) {
    response.status(400).json({ message: "An email and passwordHash are required." });
    return;
  }

  if (emailBelongsToAnotherCommissioner(email, request.params.id)) {
    response.status(400).json({ message: "The email is already in use." });
    return;
  }

  const commissioner = {
    ...request.body,
    id: request.params.id,
    email: normalizeEmail(email),
    passwordHash: passwordHash.trim(),
  };
  commissioners[commissionerIndex] = commissioner;
  response.json(commissioner);
});

app.delete("/api/commissioner/:id", (request, response) => {
  const commissionerIndex = commissioners.findIndex(
    (commissioner) => commissioner.id === request.params.id,
  );

  if (commissionerIndex === -1) {
    response.status(404).json({ message: "Commissioner not found." });
    return;
  }

  commissioners.splice(commissionerIndex, 1);
  response.status(204).send();
});

app.listen(port, () => {
  console.log(`Human Renaissance API listening on http://localhost:${port}`);
});
