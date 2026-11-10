import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { authConfig } from "../authConfig.js";
import authenticate from "../middleware/authenticate.js";
import prisma from "../prisma.js";

const router = express.Router();
const invalidCredentialsMessage = "Invalid email or password.";
const normalizeEmail = (email) => email.trim().toLowerCase();
const createAuthToken = (user) =>
  jwt.sign(
    {
      userId: user.id,
      email: user.email,
      accountType: user.accountType,
    },
    authConfig.secret,
    {
      algorithm: authConfig.algorithm,
      audience: authConfig.audience,
      expiresIn: authConfig.expiresIn,
      issuer: authConfig.issuer,
    },
  );

function serializeCookie(token) {
  return `auth_token=${encodeURIComponent(token)}; Max-Age=900; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

function clearAuthenticationCookie() {
  return "auth_token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax";
}

router.post("/auth/register", async (request, response) => {
  const {
    email,
    password,
    accountType,
    surname,
    familyName,
    country,
    postalCode,
    city,
  } = request.body;

  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password ||
    typeof surname !== "string" ||
    !surname.trim() ||
    typeof familyName !== "string" ||
    !familyName.trim() ||
    typeof country !== "string" ||
    !country.trim() ||
    typeof postalCode !== "string" ||
    !postalCode.trim() ||
    typeof city !== "string" ||
    !city.trim() ||
    !["artist", "commissioner"].includes(accountType)
  ) {
    response.status(400).json({
      message: "Complete registration details and a valid account type are required.",
    });
    return;
  }

  try {
    const user = await prisma.$transaction(async (transaction) => {
      const registration = await transaction.registration.create({
        data: {
          id: randomUUID(),
          email: normalizeEmail(email),
          passwordHash: await bcrypt.hash(password, 12),
          accountType,
        },
        select: { id: true, email: true, accountType: true },
      });

      if (accountType === "artist") {
        await transaction.artist.create({
          data: {
            id: registration.id,
            surname,
            familyName,
            country,
            zipCode: postalCode,
            city,
          },
        });
      } else {
        await transaction.commissioner.create({
          data: {
            id: registration.id,
            surname,
            familyName,
            country,
            zipCode: postalCode,
            city,
          },
        });
      }

      return registration;
    });

    response.setHeader("Set-Cookie", serializeCookie(createAuthToken(user)));
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

  try {
    const user = await prisma.registration.findUnique({
      where: { email: normalizeEmail(email) },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      response.status(401).json({ message: invalidCredentialsMessage });
      return;
    }

    response.setHeader("Set-Cookie", serializeCookie(createAuthToken(user)));
    response.json({
      user: { id: user.id, email: user.email, accountType: user.accountType },
    });
  } catch (error) {
    console.error("Failed to log in the user.", error);
    response.status(500).json({ message: "Failed to log in." });
  }
});

router.post("/auth/logout", (_request, response) => {
  response.setHeader("Set-Cookie", clearAuthenticationCookie());
  response.status(204).send();
});

router.get("/auth/me", authenticate, (request, response) => {
  response.json({
    user: {
      id: request.user.userId,
      email: request.user.email,
      accountType: request.user.accountType,
    },
  });
});

export default router;
