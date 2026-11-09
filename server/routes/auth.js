import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import authenticate from "../middleware/authenticate.js";
import prisma from "../prisma.js";

const router = express.Router();
const invalidCredentialsMessage = "Invalid email or password.";
const normalizeEmail = (email) => email.trim().toLowerCase();

function getJwtSecret(response) {
  if (!process.env.JWT_SECRET) {
    response.status(500).json({ message: "Authentication is not configured." });
    return null;
  }

  return process.env.JWT_SECRET;
}

function serializeCookie(token) {
  return `auth_token=${encodeURIComponent(token)}; Max-Age=86400; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

router.post("/auth/register", async (request, response) => {
  const { email, password } = request.body;

  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    response.status(400).json({ message: "An email and password are required." });
    return;
  }

  try {
    const user = await prisma.registration.create({
      data: {
        id: randomUUID(),
        email: normalizeEmail(email),
        passwordHash: await bcrypt.hash(password, 12),
      },
      select: { id: true, email: true },
    });

    response.status(201).json({ user });
  } catch (error) {
    if (error?.code === "P2002") {
      response.status(409).json({ message: "The email is already in use." });
      return;
    }

    console.error("Failed to register the user.", error);
    response.status(500).json({ message: "Failed to register user." });
  }
});

router.post("/auth/login", async (request, response) => {
  const { email, password } = request.body;

  if (typeof email !== "string" || typeof password !== "string") {
    response.status(401).json({ message: invalidCredentialsMessage });
    return;
  }

  const jwtSecret = getJwtSecret(response);
  if (!jwtSecret) {
    return;
  }

  try {
    const user = await prisma.registration.findUnique({
      where: { email: normalizeEmail(email) },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      response.status(401).json({ message: invalidCredentialsMessage });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      { expiresIn: "24h" },
    );
    response.setHeader("Set-Cookie", serializeCookie(token));
    response.json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error("Failed to log in the user.", error);
    response.status(500).json({ message: "Failed to log in." });
  }
});

router.get("/auth/me", authenticate, (request, response) => {
  response.json({
    user: { id: request.user.userId, email: request.user.email },
  });
});

export default router;
