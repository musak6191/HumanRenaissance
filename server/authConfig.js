import "dotenv/config";

const minimumSecretLength = 32;
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.length < minimumSecretLength) {
  throw new Error(
    `JWT_SECRET must be at least ${minimumSecretLength} characters long.`,
  );
}

export const authConfig = {
  secret: jwtSecret,
  issuer: process.env.JWT_ISSUER || "human-renaissance-api",
  audience: process.env.JWT_AUDIENCE || "human-renaissance-web",
  algorithm: "HS256",
  expiresIn: "15m",
};
