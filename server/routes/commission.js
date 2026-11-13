import express from "express";
import { randomUUID } from "node:crypto";
import { getArtist } from "./artist.js";
import { getCommissioner } from "./commissioner.js";
import prisma from "../prisma.js";
import { requireAccountType } from "../middleware/accountType.js";

const router = express.Router();
const commissionerOnly = requireAccountType("commissioner");

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

router.get(["/commission", "/commissions"], async (request, response) => {
  try {
    if (request.user.accountType === "artist") {
      const marketCommissions = await prisma.commission.findMany({
        where: {
          started: false,
          artists: { none: {} },
        },
        include: {
          commissioner: {
            select: {
              surname: true,
              familyName: true,
              city: true,
            },
          },
        },
        orderBy: { enteredAt: "desc" },
      });
      response.json(marketCommissions);
      return;
    }

    const commissionsFromDatabase = await prisma.commission.findMany({
      where: {
        OR: [
          { commissionerId: request.user.userId },
          { artists: { some: { artistId: request.user.userId } } },
          { applicants: { some: { artistId: request.user.userId } } },
        ],
      },
    });
    response.json(commissionsFromDatabase);
  } catch (error) {
    console.error("Failed to load commissions from the database.", error);
    response.status(500).json({ message: "Failed to load commissions." });
  }
});

router.get("/commission/:id", async (request, response) => {
  try {
    const commission = await prisma.commission.findFirst({
      where: {
        id: request.params.id,
        OR: [
          { commissionerId: request.user.userId },
          { artists: { some: { artistId: request.user.userId } } },
          { applicants: { some: { artistId: request.user.userId } } },
        ],
      },
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

router.post(["/commission", "/commissions"], commissionerOnly, async (request, response) => {
  const {
    title: _title,
    prompt,
    artistIds,
    applicantIds,
    fusionCommission,
    budget,
    timeline,
  } = request.body;

  if (typeof prompt !== "string" || !prompt.trim()) {
    response.status(400).json({ message: "A prompt is required." });
    return;
  }

  if (typeof budget !== "number" || !Number.isFinite(budget) || budget < 0) {
    response.status(400).json({
      message: "A valid gage is required.",
    });
    return;
  }

  if (typeof fusionCommission !== "boolean") {
    response.status(400).json({ message: "A valid fusion commission value is required." });
    return;
  }

  const commissionerId = request.user.userId;
  const requestedArtistIds = artistIds === undefined ? [] : artistIds;
  const requestedApplicantIds = applicantIds === undefined ? [] : applicantIds;

  if (
    !Array.isArray(requestedArtistIds) ||
    !Array.isArray(requestedApplicantIds) ||
    new Set(requestedArtistIds).size !== requestedArtistIds.length ||
    new Set(requestedApplicantIds).size !== requestedApplicantIds.length ||
    !requestedArtistIds.every((artistId) => typeof artistId === "string") ||
    !requestedApplicantIds.every((artistId) => typeof artistId === "string")
  ) {
    response.status(400).json({ message: "Artist and applicant IDs must be arrays of unique strings." });
    return;
  }

  const enteredAt = new Date();

  try {
    const [commissioner, artists, applicants] = await Promise.all([
      prisma.commissioner.upsert({
        where: { id: commissionerId },
        update: {},
        create: { id: commissionerId },
      }),
      prisma.artist.findMany({
        where: { id: { in: requestedArtistIds } },
        select: { id: true },
      }),
      prisma.artist.findMany({
        where: { id: { in: requestedApplicantIds } },
        select: { id: true },
      }),
    ]);

    if (artists.length !== requestedArtistIds.length || applicants.length !== requestedApplicantIds.length) {
      response.status(400).json({
        message: "The requested artists and applicants must be valid.",
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
        started: false,
        fusionCommission,
        enteredAt,
        startedAt: null,
        artists: {
          create: requestedArtistIds.map((artistId) => ({
            artist: { connect: { id: artistId } },
          })),
        },
        applicants: {
          create: requestedApplicantIds.map((artistId) => ({
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

router.put("/commission/:id", commissionerOnly, async (request, response) => {
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

  if (commissionerId !== request.user.userId) {
    response.status(403).json({ message: "You cannot update a commission for another user." });
    return;
  }

  try {
    const [existingCommission, commissioner, artists] = await Promise.all([
      prisma.commission.findFirst({
        where: {
          id: request.params.id,
          commissionerId: request.user.userId,
        },
      }),
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

router.delete("/commission/:id", commissionerOnly, (request, response) => {
  prisma.commission
    .deleteMany({
      where: {
        id: request.params.id,
        commissionerId: request.user.userId,
      },
    })
    .then((result) => {
      if (result.count === 0) {
        response.status(404).json({ message: "Commission not found." });
        return;
      }
      response.status(204).send();
    })
    .catch((error) => {
      console.error("Failed to delete the commission from the database.", error);
      response.status(500).json({ message: "Failed to delete commission." });
    });
});

export default router;
