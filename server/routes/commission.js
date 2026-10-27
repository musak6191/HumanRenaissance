import express from "express";
import { randomUUID } from "node:crypto";
import { getArtist } from "./artist.js";
import { getCommissioner } from "./commissioner.js";

const router = express.Router();

let commissions = [
  {
    id: "sample-1",
    commissionerId: "sample-commissioner-1",
    artistIds: ["sample-artist-1"],
    started: false,
    fusionCommission: false,
    prompt:
      "Create an intimate oil portrait of a woman at dawn, surrounded by wild fennel and soft blue shadows. It should feel like the first page of a new chapter.",
    budget: 850,
    timeline: "2–3 months",
    enteredAt: "2026-10-20T09:00:00.000Z",
    startedAt: null,
  },
  {
    id: "sample-2",
    commissionerId: "sample-commissioner-1",
    artistIds: ["sample-artist-1"],
    started: false,
    fusionCommission: false,
    prompt:
      "A cinematic, slightly surreal painting of a rainy Lisbon street at night. Warm windows should glow against indigo pavement, with one red umbrella as the only bright colour.",
    budget: 1200,
    timeline: "3–4 months",
    enteredAt: "2026-10-18T09:00:00.000Z",
    startedAt: null,
  },
  {
    id: "sample-3",
    commissionerId: "sample-commissioner-1",
    artistIds: ["sample-artist-1"],
    started: false,
    fusionCommission: false,
    prompt:
      "Illustrate a botanical garden filled with the flowers my grandmother grew: dahlias, sweet peas and lavender. Make it feel like a memory held in sunlight.",
    budget: 500,
    timeline: "1–2 months",
    enteredAt: "2026-10-15T09:00:00.000Z",
    startedAt: null,
  },
];

const getCommission = (id) => commissions.find((commission) => commission.id === id);
const hasValidArtists = (artistIds, fusionCommission) =>
  Array.isArray(artistIds) &&
  artistIds.length >= 1 &&
  (fusionCommission ? artistIds.length >= 2 : artistIds.length === 1) &&
  new Set(artistIds).size === artistIds.length &&
  artistIds.every((artistId) => typeof artistId === "string" && getArtist(artistId));
const hasValidCommissionCreationDetails = ({
  commissionerId,
  artistIds,
  started,
  fusionCommission,
}) =>
  typeof commissionerId === "string" &&
  Boolean(getCommissioner(commissionerId)) &&
  typeof started === "boolean" &&
  typeof fusionCommission === "boolean" &&
  Array.isArray(artistIds) &&
  new Set(artistIds).size === artistIds.length &&
  artistIds.every((artistId) => typeof artistId === "string" && getArtist(artistId));
const hasValidCommissionDetails = ({
  prompt,
  commissionerId,
  artistIds,
  started,
  fusionCommission,
}) =>
  typeof prompt === "string" &&
  Boolean(prompt.trim()) &&
  typeof commissionerId === "string" &&
  Boolean(getCommissioner(commissionerId)) &&
  typeof started === "boolean" &&
  typeof fusionCommission === "boolean" &&
  hasValidArtists(artistIds, fusionCommission);

router.get(["/commission", "/commissions"], (_request, response) => {
  response.json(commissions);
});

router.get("/commission/:id", (request, response) => {
  const commission = getCommission(request.params.id);

  if (!commission) {
    response.status(404).json({ message: "Commission not found." });
    return;
  }

  response.json(commission);
});

router.post(["/commission", "/commissions"], (request, response) => {
  const { title: _title, prompt, commissionerId, artistIds, started, fusionCommission } =
    request.body;

  if (typeof prompt !== "string" || !prompt.trim()) {
    response.status(400).json({ message: "A prompt is required." });
    return;
  }

  if (
    !hasValidCommissionCreationDetails({
      commissionerId,
      artistIds,
      started,
      fusionCommission,
    })
  ) {
    response.status(400).json({
      message: "A valid commissionerId, artistIds, started, and fusionCommission are required.",
    });
    return;
  }

  const enteredAt = new Date().toISOString();
  const { title: _ignoredTitle, ...commissionData } = request.body;
  const commission = {
    id: randomUUID(),
    ...commissionData,
    prompt: prompt.trim(),
    enteredAt,
    startedAt: started ? enteredAt : null,
  };

  commissions = [commission, ...commissions];
  response.status(201).json(commission);
});

router.put("/commission/:id", (request, response) => {
  const commissionIndex = commissions.findIndex(
    (commission) => commission.id === request.params.id,
  );

  if (commissionIndex === -1) {
    response.status(404).json({ message: "Commission not found." });
    return;
  }

  if (!hasValidCommissionDetails(request.body)) {
    response.status(400).json({
      message: "A valid prompt, commissionerId, artistIds, started, and fusionCommission are required.",
    });
    return;
  }

  const enteredAt = commissions[commissionIndex].enteredAt || new Date().toISOString();
  const { title: _title, ...commissionData } = request.body;
  const commission = {
    ...commissionData,
    id: request.params.id,
    prompt: request.body.prompt.trim(),
    enteredAt,
    startedAt: request.body.started
      ? request.body.startedAt || commissions[commissionIndex].startedAt || new Date().toISOString()
      : null,
  };
  commissions[commissionIndex] = commission;
  response.json(commission);
});

router.delete("/commission/:id", (request, response) => {
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

export default router;
