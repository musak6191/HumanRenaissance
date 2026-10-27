import express from "express";
import { randomUUID } from "node:crypto";
import { getArtist } from "./artist.js";

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

router.get("/artgroup", (_request, response) => {
  response.json(artGroups);
});

router.get("/artgroup/:id", (request, response) => {
  const artGroup = getArtGroup(request.params.id);

  if (!artGroup) {
    response.status(404).json({ message: "Art group not found." });
    return;
  }

  response.json(artGroup);
});

router.post("/artgroup", (request, response) => {
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

  const artGroup = {
    id: randomUUID(),
    artStyle: artStyle.trim(),
    interests: interests || [],
    artistIds,
    visibility,
  };
  artGroups = [artGroup, ...artGroups];
  response.status(201).json(artGroup);
});

router.put("/artgroup/:id", (request, response) => {
  const artGroupIndex = artGroups.findIndex(
    (artGroup) => artGroup.id === request.params.id,
  );

  if (artGroupIndex === -1) {
    response.status(404).json({ message: "Art group not found." });
    return;
  }

  const { artStyle, interests, artistIds, visibility } = request.body;

  if (typeof artStyle !== "string" || !artStyle.trim()) {
    response.status(400).json({ message: "An artStyle is required." });
    return;
  }

  if (artStyleIsInUse(artStyle, request.params.id)) {
    response.status(400).json({ message: "The artStyle is already in use." });
    return;
  }

  if (!validArtGroupData({ artStyle, interests, artistIds, visibility })) {
    response.status(400).json({
      message:
        "Provide valid artStyle, interests, artistIds, and visibility. Interests may contain at most 3 items.",
    });
    return;
  }

  const artGroup = {
    id: request.params.id,
    artStyle: artStyle.trim(),
    interests: interests || [],
    artistIds,
    visibility,
  };
  artGroups[artGroupIndex] = artGroup;
  response.json(artGroup);
});

router.delete("/artgroup/:id", (request, response) => {
  const artGroupIndex = artGroups.findIndex(
    (artGroup) => artGroup.id === request.params.id,
  );

  if (artGroupIndex === -1) {
    response.status(404).json({ message: "Art group not found." });
    return;
  }

  artGroups.splice(artGroupIndex, 1);
  response.status(204).send();
});

export default router;
