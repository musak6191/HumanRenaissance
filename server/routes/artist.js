import express from "express";
import { randomUUID } from "node:crypto";

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
  const { email: _email, passwordHash: _passwordHash, portfolioPictures, ...profile } =
    request.body;

  if (!hasValidPortfolioPictures(portfolioPictures)) {
    response.status(400).json({ message: "An artist can have at most 4 portfolio pictures." });
    return;
  }

  const artist = {
    id: randomUUID(),
    ...profile,
    ...(portfolioPictures === undefined ? {} : { portfolioPictures }),
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

  const { email: _email, passwordHash: _passwordHash, portfolioPictures, ...profile } =
    request.body;

  if (!hasValidPortfolioPictures(portfolioPictures)) {
    response.status(400).json({ message: "An artist can have at most 4 portfolio pictures." });
    return;
  }

  const artist = {
    ...profile,
    id: request.params.id,
    ...(portfolioPictures === undefined ? {} : { portfolioPictures }),
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
