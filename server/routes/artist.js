import express from "express";
import { randomUUID } from "node:crypto";

const router = express.Router();
let artists = [
  {
    id: "sample-artist-1",
    surname: "Painter",
    name: "Alex",
    biography: "A sample artist for the in-memory API data.",
    email: "alex.painter@example.com",
    passwordHash: "sample-password-hash",
    city: "Berlin",
    zipCode: "10115",
    country: "Germany",
    portfolioPictures: [],
  },
];

export const getArtist = (id) => artists.find((artist) => artist.id === id);
const normalizeEmail = (email) => email.trim().toLowerCase();
const hasRequiredCredentials = ({ email, passwordHash }) =>
  typeof email === "string" &&
  Boolean(email.trim()) &&
  typeof passwordHash === "string" &&
  Boolean(passwordHash.trim());
const emailBelongsToAnotherArtist = (email, id) =>
  artists.some(
    (artist) => artist.id !== id && normalizeEmail(artist.email) === normalizeEmail(email),
  );
const hasValidPortfolioPictures = (portfolioPictures) =>
  portfolioPictures === undefined ||
  (Array.isArray(portfolioPictures) && portfolioPictures.length <= 4);

router.get("/artist", (_request, response) => {
  response.json(artists);
});

router.get("/artist/:id", (request, response) => {
  const artist = getArtist(request.params.id);

  if (!artist) {
    response.status(404).json({ message: "Artist not found." });
    return;
  }

  response.json(artist);
});

router.post("/artist", (request, response) => {
  const { email, passwordHash, portfolioPictures } = request.body;

  if (!hasRequiredCredentials({ email, passwordHash })) {
    response.status(400).json({ message: "An email and passwordHash are required." });
    return;
  }

  if (emailBelongsToAnotherArtist(email)) {
    response.status(400).json({ message: "The email is already in use." });
    return;
  }

  if (!hasValidPortfolioPictures(portfolioPictures)) {
    response.status(400).json({ message: "An artist can have at most 4 portfolio pictures." });
    return;
  }

  const artist = {
    id: randomUUID(),
    ...request.body,
    email: normalizeEmail(email),
    passwordHash: passwordHash.trim(),
  };

  artists = [artist, ...artists];
  response.status(201).json(artist);
});

router.put("/artist/:id", (request, response) => {
  const artistIndex = artists.findIndex((artist) => artist.id === request.params.id);

  if (artistIndex === -1) {
    response.status(404).json({ message: "Artist not found." });
    return;
  }

  const { email, passwordHash, portfolioPictures } = request.body;

  if (!hasRequiredCredentials({ email, passwordHash })) {
    response.status(400).json({ message: "An email and passwordHash are required." });
    return;
  }

  if (emailBelongsToAnotherArtist(email, request.params.id)) {
    response.status(400).json({ message: "The email is already in use." });
    return;
  }

  if (!hasValidPortfolioPictures(portfolioPictures)) {
    response.status(400).json({ message: "An artist can have at most 4 portfolio pictures." });
    return;
  }

  const artist = {
    ...request.body,
    id: request.params.id,
    email: normalizeEmail(email),
    passwordHash: passwordHash.trim(),
  };
  artists[artistIndex] = artist;
  response.json(artist);
});

router.delete("/artist/:id", (request, response) => {
  const artistIndex = artists.findIndex((artist) => artist.id === request.params.id);

  if (artistIndex === -1) {
    response.status(404).json({ message: "Artist not found." });
    return;
  }

  artists.splice(artistIndex, 1);
  response.status(204).send();
});

export default router;
