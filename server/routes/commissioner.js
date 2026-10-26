import express from "express";
import { randomUUID } from "node:crypto";

const router = express.Router();
let commissioners = [];

const getCommissioner = (id) => commissioners.find((commissioner) => commissioner.id === id);
const normalizeEmail = (email) => email.trim().toLowerCase();
const hasRequiredCredentials = ({ email, passwordHash }) =>
  typeof email === "string" &&
  Boolean(email.trim()) &&
  typeof passwordHash === "string" &&
  Boolean(passwordHash.trim());
const emailBelongsToAnotherCommissioner = (email, id) =>
  commissioners.some(
    (commissioner) =>
      commissioner.id !== id && normalizeEmail(commissioner.email) === normalizeEmail(email),
  );

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
  const { email, passwordHash } = request.body;

  if (!hasRequiredCredentials({ email, passwordHash })) {
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

router.put("/commissioner/:id", (request, response) => {
  const commissionerIndex = commissioners.findIndex(
    (commissioner) => commissioner.id === request.params.id,
  );

  if (commissionerIndex === -1) {
    response.status(404).json({ message: "Commissioner not found." });
    return;
  }

  const { email, passwordHash } = request.body;

  if (!hasRequiredCredentials({ email, passwordHash })) {
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
