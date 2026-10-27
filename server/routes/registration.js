import express from "express";
import { randomUUID } from "node:crypto";

const router = express.Router();
let registrations = [];

const getRegistration = (id) =>
  registrations.find((registration) => registration.id === id);
const normalizeEmail = (email) => email.trim().toLowerCase();
const emailIsInUse = (email, id) =>
  registrations.some(
    (registration) =>
      registration.id !== id && normalizeEmail(registration.email) === normalizeEmail(email),
  );

router.get("/auth/registration", (_request, response) => {
  response.json(registrations);
});

router.get("/auth/registration/:id", (request, response) => {
  const registration = getRegistration(request.params.id);

  if (!registration) {
    response.status(404).json({ message: "Registration not found." });
    return;
  }

  response.json(registration);
});

router.post("/auth/registration", (request, response) => {
  const { email, password } = request.body;

  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password.trim()
  ) {
    response.status(400).json({ message: "An email and password are required." });
    return;
  }

  if (emailIsInUse(email)) {
    response.status(400).json({ message: "The email is already in use." });
    return;
  }

  const registration = {
    id: randomUUID(),
    email: normalizeEmail(email),
    password: password.trim(),
  };
  registrations = [registration, ...registrations];
  response.status(201).json(registration);
});

router.put("/auth/registration/:id", (request, response) => {
  const registrationIndex = registrations.findIndex(
    (registration) => registration.id === request.params.id,
  );

  if (registrationIndex === -1) {
    response.status(404).json({ message: "Registration not found." });
    return;
  }

  const { email, password } = request.body;

  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password.trim()
  ) {
    response.status(400).json({ message: "An email and password are required." });
    return;
  }

  if (emailIsInUse(email, request.params.id)) {
    response.status(400).json({ message: "The email is already in use." });
    return;
  }

  const registration = {
    id: request.params.id,
    email: normalizeEmail(email),
    password: password.trim(),
  };
  registrations[registrationIndex] = registration;
  response.json(registration);
});

router.delete("/auth/registration/:id", (request, response) => {
  const registrationIndex = registrations.findIndex(
    (registration) => registration.id === request.params.id,
  );

  if (registrationIndex === -1) {
    response.status(404).json({ message: "Registration not found." });
    return;
  }

  registrations.splice(registrationIndex, 1);
  response.status(204).send();
});

export default router;
