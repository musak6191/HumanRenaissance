import express from "express";
import prisma from "../prisma.js";
import { requireAccountType } from "../middleware/accountType.js";

const router = express.Router();
const isCurrentUser = (request, id) => request.user.userId === id;
const commissionerOnly = requireAccountType("commissioner");
export let commissioners = [
  {
    id: "sample-commissioner-1",
    surname: "Renaissance",
    familyName: "Alex",
    biography: "A sample commissioner for the in-memory API data.",
    city: "Berlin",
    zipCode: "10115",
    country: "Germany",
  },
];

export const getCommissioner = (id) =>
  commissioners.find((commissioner) => commissioner.id === id);

router.get("/commissioner", async (request, response) => {
  try {
    const commissionersFromDatabase = await prisma.commissioner.findMany({
      where: { id: request.user.userId },
    });
    response.json(commissionersFromDatabase);
  } catch (error) {
    console.error("Failed to load commissioners from the database.", error);
    response.status(500).json({ message: "Failed to load commissioners." });
  }
});

router.get("/commissioner/:id", async (request, response) => {
  if (!isCurrentUser(request, request.params.id)) {
    response.status(403).json({ message: "You cannot access this profile." });
    return;
  }
  try {
    const commissioner = await prisma.commissioner.findUnique({
      where: { id: request.params.id },
    });

    if (!commissioner) {
      response.status(404).json({ message: "Commissioner not found." });
      return;
    }

    response.json(commissioner);
  } catch (error) {
    console.error("Failed to load the commissioner from the database.", error);
    response.status(500).json({ message: "Failed to load commissioner." });
  }
});

router.post("/commissioner", commissionerOnly, async (request, response) => {
  const {
    email: _email,
    passwordHash: _passwordHash,
    surname,
    familyName,
    biography,
    city,
    zipCode,
    country,
  } = request.body;

  try {
    const commissioner = await prisma.commissioner.create({
      data: {
        id: request.user.userId,
        surname,
        familyName,
        biography,
        city,
        zipCode,
        country,
      },
    });

    response.status(201).json(commissioner);
  } catch (error) {
    console.error("Failed to create the commissioner in the database.", error);
    response.status(500).json({ message: "Failed to create commissioner." });
  }
});

router.put("/commissioner/:id", commissionerOnly, async (request, response) => {
  if (!isCurrentUser(request, request.params.id)) {
    response.status(403).json({ message: "You cannot update this profile." });
    return;
  }
  const {
    email: _email,
    passwordHash: _passwordHash,
    surname,
    familyName,
    biography,
    city,
    zipCode,
    country,
  } = request.body;

  try {
    const existingCommissioner = await prisma.commissioner.findUnique({
      where: { id: request.params.id },
    });

    if (!existingCommissioner) {
      response.status(404).json({ message: "Commissioner not found." });
      return;
    }

    const commissioner = await prisma.commissioner.update({
      where: { id: request.params.id },
      data: {
        surname,
        familyName,
        biography,
        city,
        zipCode,
        country,
      },
    });

    response.json(commissioner);
  } catch (error) {
    console.error("Failed to update the commissioner in the database.", error);
    response.status(500).json({ message: "Failed to update commissioner." });
  }
});

router.delete("/commissioner/:id", commissionerOnly, async (request, response) => {
  if (!isCurrentUser(request, request.params.id)) {
    response.status(403).json({ message: "You cannot delete this profile." });
    return;
  }
  try {
    const commissioner = await prisma.commissioner.findUnique({
      where: { id: request.params.id },
    });

    if (!commissioner) {
      response.status(404).json({ message: "Commissioner not found." });
      return;
    }

    await prisma.commissioner.delete({
      where: { id: request.params.id },
    });

    response.status(204).send();
  } catch (error) {
    console.error("Failed to delete the commissioner from the database.", error);
    response.status(500).json({ message: "Failed to delete commissioner." });
  }
});

export default router;
