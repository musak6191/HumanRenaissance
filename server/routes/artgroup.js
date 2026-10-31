import express from "express";
import { randomUUID } from "node:crypto";
import { getArtist } from "./artist.js";
import prisma from "../prisma.js";

const router = express.Router();
let artGroups = [];

const getArtGroup = (id) => artGroups.find((artGroup) => artGroup.id === id);
const normalizeArtStyle = (artStyle) => artStyle.trim().toLowerCase();
const validStringList = (values) =>
  values === undefined ||
  (Array.isArray(values) &&
    values.length <= 3 &&
    values.every((value) => typeof value === "string" && Boolean(value.trim())));
const validArtistIds = (artistIds) =>
  Array.isArray(artistIds) &&
  new Set(artistIds).size === artistIds.length &&
  artistIds.every((artistId) => typeof artistId === "string" && getArtist(artistId));
const validVisibility = (visibility) =>
  ["public", "private", "invitation"].includes(visibility);

const artStyleIsInUse = (artStyle, id) =>
  artGroups.some(
    (artGroup) =>
      artGroup.id !== id &&
      normalizeArtStyle(artGroup.artStyle) === normalizeArtStyle(artStyle),
  );
const validArtGroupData = ({ artStyle, interests, artistIds, visibility }) =>
  typeof artStyle === "string" &&
  Boolean(artStyle.trim()) &&
  validStringList(interests) &&
  validArtistIds(artistIds) &&
  validVisibility(visibility);

router.get("/artgroup", async (_request, response) => {
  try {
    const artGroupsFromDatabase = await prisma.artGroup.findMany();
    response.json(artGroupsFromDatabase);
  } catch (error) {
    console.error("Failed to load art groups from the database.", error);
    response.status(500).json({ message: "Failed to load art groups." });
  }
});

router.get("/artgroup/:id", async (request, response) => {
  try {
    const artGroup = await prisma.artGroup.findUnique({
      where: { id: request.params.id },
    });

    if (!artGroup) {
      response.status(404).json({ message: "Art group not found." });
      return;
    }

    response.json(artGroup);
  } catch (error) {
    console.error("Failed to load the art group from the database.", error);
    response.status(500).json({ message: "Failed to load art group." });
  }
});

router.post("/artgroup", async (request, response) => {
  const { artStyle, interests, artistIds, visibility } = request.body;

  if (typeof artStyle !== "string" || !artStyle.trim()) {
    response.status(400).json({ message: "An artStyle is required." });
    return;
  }

  if (artStyleIsInUse(artStyle)) {
    response.status(400).json({ message: "The artStyle is already in use." });
    return;
  }

  if (!validArtGroupData({ artStyle, interests, artistIds, visibility })) {
    response.status(400).json({
      message:
        "Provide valid interests, artistIds, and visibility. Interests may contain at most 3 items.",
    });
    return;
  }

  try {
    const artGroup = await prisma.artGroup.create({
      data: {
        id: randomUUID(),
        artStyle: artStyle.trim(),
        visibility,
        interests: {
          create: (interests || []).map((interest, position) => ({
            interest: interest.trim(),
            position,
          })),
        },
        artists: {
          create: artistIds.map((artistId) => ({
            artist: { connect: { id: artistId } },
          })),
        },
      },
      include: {
        interests: true,
        artists: true,
      },
    });

    response.status(201).json(artGroup);
  } catch (error) {
    console.error("Failed to create the art group in the database.", error);
    response.status(500).json({ message: "Failed to create art group." });
  }
});

router.put("/artgroup/:id", async (request, response) => {
  const { artStyle, interests, artistIds, visibility } = request.body;

  if (typeof artStyle !== "string" || !artStyle.trim()) {
    response.status(400).json({ message: "An artStyle is required." });
    return;
  }

  if (!validArtGroupData({ artStyle, interests, artistIds, visibility })) {
    response.status(400).json({
      message:
        "Provide valid artStyle, interests, artistIds, and visibility. Interests may contain at most 3 items.",
    });
    return;
  }

  try {
    const existingArtGroup = await prisma.artGroup.findUnique({
      where: { id: request.params.id },
    });

    if (!existingArtGroup) {
      response.status(404).json({ message: "Art group not found." });
      return;
    }

    const artStylesInUse = await prisma.artGroup.findMany({
      where: { NOT: { id: request.params.id } },
      select: { artStyle: true },
    });

    if (
      artStylesInUse.some(
        (existing) => normalizeArtStyle(existing.artStyle) === normalizeArtStyle(artStyle),
      )
    ) {
      response.status(400).json({ message: "The artStyle is already in use." });
      return;
    }

    const artGroup = await prisma.artGroup.update({
      where: { id: request.params.id },
      data: {
        artStyle: artStyle.trim(),
        visibility,
        interests: {
          deleteMany: {},
          create: (interests || []).map((interest, position) => ({
            interest: interest.trim(),
            position,
          })),
        },
        artists: {
          deleteMany: {},
          create: artistIds.map((artistId) => ({
            artist: { connect: { id: artistId } },
          })),
        },
      },
      include: {
        interests: true,
        artists: true,
      },
    });

    response.json(artGroup);
  } catch (error) {
    console.error("Failed to update the art group in the database.", error);
    response.status(500).json({ message: "Failed to update art group." });
  }
});

router.delete("/artgroup/:id", async (request, response) => {
  try {
    const artGroup = await prisma.artGroup.findUnique({
      where: { id: request.params.id },
    });

    if (!artGroup) {
      response.status(404).json({ message: "Art group not found." });
      return;
    }

    await prisma.artGroup.delete({
      where: { id: request.params.id },
    });

    response.status(204).send();
  } catch (error) {
    console.error("Failed to delete the art group from the database.", error);
    response.status(500).json({ message: "Failed to delete art group." });
  }
});

export default router;
