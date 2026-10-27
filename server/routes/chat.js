import express from "express";
import { randomUUID } from "node:crypto";
import { getArtist } from "./artist.js";
import { getCommissioner } from "./commissioner.js";

const router = express.Router();
let chats = [];

const getChat = (id) => chats.find((chat) => chat.id === id);
const hasParticipants = (artistId, commissionerId) =>
  typeof artistId === "string" &&
  Boolean(getArtist(artistId)) &&
  typeof commissionerId === "string" &&
  Boolean(getCommissioner(commissionerId));
const validMessageType = (type) => ["text", "picture", "speechMemo"].includes(type);
const hasMessageContent = ({ type, content, picture, speechMemo }) => {
  if (type === "text") return typeof content === "string" && Boolean(content.trim());
  if (type === "picture") return typeof picture === "string" && Boolean(picture.trim());
  return typeof speechMemo === "string" && Boolean(speechMemo.trim());
};

router.get("/chat", (_request, response) => {
  response.json(chats);
});

router.get("/chat/:id", (request, response) => {
  const chat = getChat(request.params.id);

  if (!chat) {
    response.status(404).json({ message: "Chat not found." });
    return;
  }

  response.json(chat);
});

router.post("/chat", (request, response) => {
  const { artistId, commissionerId } = request.body;

  if (!hasParticipants(artistId, commissionerId)) {
    response.status(400).json({
      message: "A valid artistId and commissionerId are required.",
    });
    return;
  }

  const chat = {
    id: randomUUID(),
    artistId,
    commissionerId,
    messages: [],
    createdAt: new Date().toISOString(),
  };
  chats = [chat, ...chats];
  response.status(201).json(chat);
});

router.post("/chat/:id/message", (request, response) => {
  const chat = getChat(request.params.id);

  if (!chat) {
    response.status(404).json({ message: "Chat not found." });
    return;
  }

  const { senderId, senderType, type, content, picture, speechMemo } = request.body;
  const senderIsParticipant =
    (senderType === "artist" && senderId === chat.artistId) ||
    (senderType === "commissioner" && senderId === chat.commissionerId);

  if (
    !senderIsParticipant ||
    !validMessageType(type) ||
    !hasMessageContent({ type, content, picture, speechMemo })
  ) {
    response.status(400).json({
      message:
        "Provide a participating sender and a valid text, picture, or speechMemo message.",
    });
    return;
  }

  const message = {
    id: randomUUID(),
    senderId,
    senderType,
    type,
    ...(type === "text" ? { content: content.trim() } : {}),
    ...(type === "picture" ? { picture: picture.trim() } : {}),
    ...(type === "speechMemo" ? { speechMemo: speechMemo.trim() } : {}),
    sentAt: new Date().toISOString(),
  };
  chat.messages.push(message);
  response.status(201).json(message);
});

router.put("/chat/:id", (request, response) => {
  const chatIndex = chats.findIndex((chat) => chat.id === request.params.id);

  if (chatIndex === -1) {
    response.status(404).json({ message: "Chat not found." });
    return;
  }

  const { artistId, commissionerId } = request.body;

  if (!hasParticipants(artistId, commissionerId)) {
    response.status(400).json({
      message: "A valid artistId and commissionerId are required.",
    });
    return;
  }

  const chat = {
    ...chats[chatIndex],
    artistId,
    commissionerId,
  };
  chats[chatIndex] = chat;
  response.json(chat);
});

router.delete("/chat/:id", (request, response) => {
  const chatIndex = chats.findIndex((chat) => chat.id === request.params.id);

  if (chatIndex === -1) {
    response.status(404).json({ message: "Chat not found." });
    return;
  }

  chats.splice(chatIndex, 1);
  response.status(204).send();
});

export default router;
