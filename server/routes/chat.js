import express from "express";
import { randomUUID } from "node:crypto";
import prisma from "../prisma.js";

const router = express.Router();
let chats = [];

const getChat = (id) => chats.find((chat) => chat.id === id);
const hasParticipants = (artistId, commissionerId) =>
  typeof artistId === "string" &&
  typeof commissionerId === "string" &&
  Boolean(artistId) &&
  Boolean(commissionerId);
const validMessageType = (type) => ["text", "picture", "speechMemo"].includes(type);
const hasMessageContent = ({ type, content, picture, speechMemo }) => {
  if (type === "text") return typeof content === "string" && Boolean(content.trim());
  if (type === "picture") return typeof picture === "string" && Boolean(picture.trim());
  return typeof speechMemo === "string" && Boolean(speechMemo.trim());
};

router.get("/chat", async (_request, response) => {
  try {
    const chatsFromDatabase = await prisma.chat.findMany({
      include: { messages: true },
    });
    response.json(chatsFromDatabase);
  } catch (error) {
    console.error("Failed to load chats from the database.", error);
    response.status(500).json({ message: "Failed to load chats." });
  }
});

router.get("/chat/:id", async (request, response) => {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: request.params.id },
      include: { messages: true },
    });

    if (!chat) {
      response.status(404).json({ message: "Chat not found." });
      return;
    }

    response.json(chat);
  } catch (error) {
    console.error("Failed to load the chat from the database.", error);
    response.status(500).json({ message: "Failed to load chat." });
  }
});

router.post("/chat", async (request, response) => {
  const { artistId, commissionerId } = request.body;

  if (!hasParticipants(artistId, commissionerId)) {
    response.status(400).json({
      message: "A valid artistId and commissionerId are required.",
    });
    return;
  }

  try {
    const [artist, commissioner] = await Promise.all([
      prisma.artist.findUnique({ where: { id: artistId }, select: { id: true } }),
      prisma.commissioner.findUnique({
        where: { id: commissionerId },
        select: { id: true },
      }),
    ]);

    if (!artist || !commissioner) {
      response.status(400).json({
        message: "A valid artistId and commissionerId are required.",
      });
      return;
    }

    const chat = await prisma.chat.create({
      data: {
        id: randomUUID(),
        artist: { connect: { id: artistId } },
        commissioner: { connect: { id: commissionerId } },
        createdAt: new Date(),
      },
      include: { messages: true },
    });

    response.status(201).json(chat);
  } catch (error) {
    console.error("Failed to create the chat in the database.", error);
    response.status(500).json({ message: "Failed to create chat." });
  }
});

router.post("/chat/:id/message", async (request, response) => {
  const { senderId, senderType, type, content, picture, speechMemo } = request.body;

  try {
    const chat = await prisma.chat.findUnique({
      where: { id: request.params.id },
      select: { artistId: true, commissionerId: true },
    });

    if (!chat) {
      response.status(404).json({ message: "Chat not found." });
      return;
    }

    if (
      !validMessageType(type) ||
      !hasMessageContent({ type, content, picture, speechMemo })
    ) {
      response.status(400).json({
        message:
          "Provide a participating sender and a valid text, picture, or speechMemo message.",
      });
      return;
    }

    const senderIsParticipant =
      (senderType === "artist" && senderId === chat.artistId) ||
      (senderType === "commissioner" && senderId === chat.commissionerId);

    if (!senderIsParticipant) {
      response.status(400).json({
        message:
          "Provide a participating sender and a valid text, picture, or speechMemo message.",
      });
      return;
    }

    const message = await prisma.message.create({
      data: {
        id: randomUUID(),
        chatId: request.params.id,
        senderId,
        senderType,
        type,
        ...(type === "text" ? { content: content.trim() } : {}),
        ...(type === "picture" ? { picture: picture.trim() } : {}),
        ...(type === "speechMemo" ? { speechMemo: speechMemo.trim() } : {}),
        sentAt: new Date(),
      },
    });

    response.status(201).json(message);
  } catch (error) {
    console.error("Failed to create the message in the database.", error);
    response.status(500).json({ message: "Failed to create message." });
  }
});

router.put("/chat/:id", async (request, response) => {
  const { artistId, commissionerId } = request.body;

  if (!hasParticipants(artistId, commissionerId)) {
    response.status(400).json({
      message: "A valid artistId and commissionerId are required.",
    });
    return;
  }

  try {
    const [existingChat, artist, commissioner] = await Promise.all([
      prisma.chat.findUnique({ where: { id: request.params.id } }),
      prisma.artist.findUnique({ where: { id: artistId }, select: { id: true } }),
      prisma.commissioner.findUnique({
        where: { id: commissionerId },
        select: { id: true },
      }),
    ]);

    if (!existingChat) {
      response.status(404).json({ message: "Chat not found." });
      return;
    }

    if (!artist || !commissioner) {
      response.status(400).json({
        message: "A valid artistId and commissionerId are required.",
      });
      return;
    }

    const chat = await prisma.chat.update({
      where: { id: request.params.id },
      data: {
        artist: { connect: { id: artistId } },
        commissioner: { connect: { id: commissionerId } },
      },
      include: { messages: true },
    });

    response.json(chat);
  } catch (error) {
    console.error("Failed to update the chat in the database.", error);
    response.status(500).json({ message: "Failed to update chat." });
  }
});

router.delete("/chat/:id", async (request, response) => {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: request.params.id },
    });

    if (!chat) {
      response.status(404).json({ message: "Chat not found." });
      return;
    }

    await prisma.chat.delete({
      where: { id: request.params.id },
    });

    response.status(204).send();
  } catch (error) {
    console.error("Failed to delete the chat from the database.", error);
    response.status(500).json({ message: "Failed to delete chat." });
  }
});

export default router;
