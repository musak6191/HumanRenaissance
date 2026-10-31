import express from "express";
import { randomUUID } from "node:crypto";
import prisma from "../prisma.js";

const router = express.Router();
let artists = [
  {
    id: "sample-artist-1",
    surname: "Painter",
    name: "Alex",
    biography: "A sample artist for the in-memory API data.",
    city: "Berlin",
    zipCode: "10115",
    country: "Germany",
    portfolioPictures: [],
  },
];

export const getArtist = (id) => artists.find((artist) => artist.id === id);
const hasValidPortfolioPictures = (portfolioPictures) =>
  portfolioPictures === undefined ||
  (Array.isArray(portfolioPictures) && portfolioPictures.length <= 4);

router.get("/artist", async (_request, response) => {
  try {
    const artistsFromDatabase = await prisma.artist.findMany();
    response.json(artistsFromDatabase);
  } catch (error) {
    console.error("Failed to load artists from the database.", error);
    response.status(500).json({ message: "Failed to load artists." });
  }
});

router.get("/artist/:id", async (request, response) => {
  try {
    const artist = await prisma.artist.findUnique({
      where: { id: request.params.id },
    });

    if (!artist) {
      response.status(404).json({ message: "Artist not found." });
      return;
    }

    response.json(artist);
  } catch (error) {
    console.error("Failed to load the artist from the database.", error);
    response.status(500).json({ message: "Failed to load artist." });
  }
});

router.post("/artist", async (request, response) => {
  const {
    email: _email,
    passwordHash: _passwordHash,
    portfolioPictures,
    surname,
    name,
    biography,
    city,
    zipCode,
    country,
  } = request.body;

  if (!hasValidPortfolioPictures(portfolioPictures)) {
    response.status(400).json({ message: "An artist can have at most 4 portfolio pictures." });
    return;
  }

  try {
    const artist = await prisma.artist.create({
      data: {
        id: randomUUID(),
        surname,
        name,
        biography,
        city,
        zipCode,
        country,
        portfolioPictures: {
          create: (portfolioPictures || []).map((picture, position) => ({
            picture,
            position,
          })),
        },
      },
      include: {
        portfolioPictures: true,
      },
    });

    response.status(201).json(artist);
  } catch (error) {
    console.error("Failed to create the artist in the database.", error);
    response.status(500).json({ message: "Failed to create artist." });
  }
});

router.put("/artist/:id", async (request, response) => {
  const {
    email: _email,
    passwordHash: _passwordHash,
    portfolioPictures,
    surname,
    name,
    biography,
    city,
    zipCode,
    country,
  } = request.body;

  if (!hasValidPortfolioPictures(portfolioPictures)) {
    response.status(400).json({ message: "An artist can have at most 4 portfolio pictures." });
    return;
  }

  try {
    const existingArtist = await prisma.artist.findUnique({
      where: { id: request.params.id },
    });

    if (!existingArtist) {
      response.status(404).json({ message: "Artist not found." });
      return;
    }

    const artist = await prisma.artist.update({
      where: { id: request.params.id },
      data: {
        surname,
        name,
        biography,
        city,
        zipCode,
        country,
        ...(portfolioPictures === undefined
          ? {}
          : {
              portfolioPictures: {
                deleteMany: {},
                create: portfolioPictures.map((picture, position) => ({
                  picture,
                  position,
                })),
              },
            }),
      },
      include: {
        portfolioPictures: true,
      },
    });

    response.json(artist);
  } catch (error) {
    console.error("Failed to update the artist in the database.", error);
    response.status(500).json({ message: "Failed to update artist." });
  }
});

router.delete("/artist/:id", async (request, response) => {
  try {
    const artist = await prisma.artist.findUnique({
      where: { id: request.params.id },
    });

    if (!artist) {
      response.status(404).json({ message: "Artist not found." });
      return;
    }

    await prisma.artist.delete({
      where: { id: request.params.id },
    });

    response.status(204).send();
  } catch (error) {
    console.error("Failed to delete the artist from the database.", error);
    response.status(500).json({ message: "Failed to delete artist." });
  }
});

export default router;
