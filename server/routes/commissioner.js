import express from "express";
import { randomUUID } from "node:crypto";

const router = express.Router();
export let commissioners = [
  {
    id: "sample-commissioner-1",
    surname: "Renaissance",
    name: "Alex",
    biography: "A sample commissioner for the in-memory API data.",
    city: "Berlin",
    zipCode: "10115",
    country: "Germany",
  },
];

export const getCommissioner = (id) =>
  commissioners.find((commissioner) => commissioner.id === id);

router.get("/commissioner", (_request, response) => {
  response.json(commissioners);
});

router.get("/commissioner/:id", (request, response) => {
  const commissioner = getCommissioner(request.params.id);

  if (!commissioner) {
    response.status(404).json({ message: "Commissioner not found." });
    return;
  }

  response.json(commissioner);
});

router.post("/commissioner", (request, response) => {
  const { email: _email, passwordHash: _passwordHash, ...profile } = request.body;

  const commissioner = {
    id: randomUUID(),
    ...profile,
  };

  commissioners = [commissioner, ...commissioners];
  response.status(201).json(commissioner);
});

router.put("/commissioner/:id", (request, response) => {
  const commissionerIndex = commissioners.findIndex(
    (commissioner) => commissioner.id === request.params.id,
  );

  if (commissionerIndex === -1) {
    response.status(404).json({ message: "Commissioner not found." });
    return;
  }

  const { email: _email, passwordHash: _passwordHash, ...profile } = request.body;

  const commissioner = {
    id: request.params.id,
    ...commissioners[commissionerIndex],
    ...profile,
  };
  commissioners[commissionerIndex] = commissioner;
  response.json(commissioner);
});

router.delete("/commissioner/:id", (request, response) => {
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

export default router;
