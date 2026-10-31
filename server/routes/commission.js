import express from "express";
import { randomUUID } from "node:crypto";
import { getArtist } from "./artist.js";
import { getCommissioner } from "./commissioner.js";
import prisma from "../prisma.js";

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
  {
    id: "sample-display-1",
    commissionerId: "sample-commissioner-1",
    artistIds: [],
    applicantIds: ["sample-artist-1"],
    started: false,
    fusionCommission: false,
    prompt:
      "Design a bold, hopeful poster for a new beginning, combining expressive typography with warm sunrise colours.",
    budget: 650,
    timeline: "1–2 months",
    enteredAt: "2026-10-22T09:00:00.000Z",
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
  typeof started === "boolean" &&
  typeof fusionCommission === "boolean" &&
  Array.isArray(artistIds) &&
  new Set(artistIds).size === artistIds.length &&
  artistIds.every((artistId) => typeof artistId === "string");
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
const hasValidCommissionUpdateDetails = ({
  prompt,
  commissionerId,
  artistIds,
  started,
  fusionCommission,
}) =>
  typeof prompt === "string" &&
  Boolean(prompt.trim()) &&
  typeof commissionerId === "string" &&
  typeof started === "boolean" &&
  typeof fusionCommission === "boolean" &&
  Array.isArray(artistIds) &&
  new Set(artistIds).size === artistIds.length &&
  artistIds.every((artistId) => typeof artistId === "string") &&
  (artistIds.length === 0 ||
    (artistIds.length >= 1 &&
      (fusionCommission ? artistIds.length >= 2 : artistIds.length === 1)));

router.get(["/commission", "/commissions"], async (_request, response) => {
  try {
    const commissionsFromDatabase = await prisma.commission.findMany();
    response.json(commissionsFromDatabase);
  } catch (error) {
    console.error("Failed to load commissions from the database.", error);
    response.status(500).json({ message: "Failed to load commissions." });
  }
});

router.get("/commission/:id", async (request, response) => {
  try {
    const commission = await prisma.commission.findUnique({
      where: { id: request.params.id },
    });

    if (!commission) {
      response.status(404).json({ message: "Commission not found." });
      return;
    }

    response.json(commission);
  } catch (error) {
    console.error("Failed to load the commission from the database.", error);
    response.status(500).json({ message: "Failed to load commission." });
  }
});

router.post(["/commission", "/commissions"], async (request, response) => {
  const {
    title: _title,
    prompt,
    commissionerId,
    artistIds,
    applicantIds,
    started,
    fusionCommission,
    budget,
    timeline,
  } = request.body;

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

  const enteredAt = new Date();

  try {
    const [commissioner, artists] = await Promise.all([
      prisma.commissioner.findUnique({ where: { id: commissionerId } }),
      prisma.artist.findMany({
        where: { id: { in: artistIds } },
        select: { id: true },
      }),
    ]);

    if (!commissioner || artists.length !== artistIds.length) {
      response.status(400).json({
        message: "A valid commissionerId, artistIds, started, and fusionCommission are required.",
      });
      return;
    }

    const commission = await prisma.commission.create({
      data: {
        id: randomUUID(),
        commissioner: { connect: { id: commissionerId } },
        prompt: prompt.trim(),
        budget,
        timeline,
        started,
        fusionCommission,
        enteredAt,
        startedAt: started ? enteredAt : null,
        artists: {
          create: artistIds.map((artistId) => ({
            artist: { connect: { id: artistId } },
          })),
        },
        applicants: {
          create: (applicantIds || []).map((artistId) => ({
            artist: { connect: { id: artistId } },
          })),
        },
      },
      include: {
        artists: true,
        applicants: true,
      },
    });

    response.status(201).json(commission);
  } catch (error) {
    console.error("Failed to create the commission in the database.", error);
    response.status(500).json({ message: "Failed to create commission." });
  }
});

router.put("/commission/:id", async (request, response) => {
  if (!hasValidCommissionUpdateDetails(request.body)) {
    response.status(400).json({
      message: "A valid prompt, commissionerId, artistIds, started, and fusionCommission are required.",
    });
    return;
  }

  const {
    prompt,
    commissionerId,
    artistIds,
    started,
    fusionCommission,
    budget,
    timeline,
    startedAt,
  } = request.body;

  try {
    const [existingCommission, commissioner, artists] = await Promise.all([
      prisma.commission.findUnique({ where: { id: request.params.id } }),
      prisma.commissioner.findUnique({ where: { id: commissionerId } }),
      prisma.artist.findMany({
        where: { id: { in: artistIds } },
        select: { id: true },
      }),
    ]);

    if (!existingCommission) {
      response.status(404).json({ message: "Commission not found." });
      return;
    }

    if (!commissioner || artists.length !== artistIds.length) {
      response.status(400).json({
        message:
          "A valid prompt, commissionerId, artistIds, started, and fusionCommission are required.",
      });
      return;
    }

    const updatedCommission = await prisma.commission.update({
      where: { id: request.params.id },
      data: {
        commissioner: { connect: { id: commissionerId } },
        prompt: prompt.trim(),
        budget,
        timeline,
        started,
        fusionCommission,
        startedAt: started ? startedAt || existingCommission.startedAt || new Date() : null,
        artists: {
          deleteMany: {},
          create: artistIds.map((artistId) => ({
            artist: { connect: { id: artistId } },
          })),
        },
      },
      include: {
        artists: true,
        applicants: true,
      },
    });

    response.json(updatedCommission);
  } catch (error) {
    console.error("Failed to update the commission in the database.", error);
    response.status(500).json({ message: "Failed to update commission." });
  }
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
