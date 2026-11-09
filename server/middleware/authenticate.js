import jwt from "jsonwebtoken";
import { authConfig } from "../authConfig.js";

const authenticationFailureMessage = "Authentication required.";

const getCookieToken = (cookieHeader) =>
  cookieHeader
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("auth_token="))
    ?.slice("auth_token=".length);

const getToken = (request) => {
  const authorization = request.headers.authorization;
  if (typeof authorization === "string" && /^Bearer\s+/i.test(authorization)) {
    return authorization.replace(/^Bearer\s+/i, "");
  }

  return getCookieToken(request.headers.cookie);
};

export default function authenticate(request, response, next) {
  const token = getToken(request);
  if (!token) {
    response.status(401).json({ message: authenticationFailureMessage });
    return;
  }

  try {
    request.user = jwt.verify(decodeURIComponent(token), authConfig.secret, {
      algorithms: [authConfig.algorithm],
      issuer: authConfig.issuer,
      audience: authConfig.audience,
    });
    next();
  } catch {
    response.status(401).json({ message: authenticationFailureMessage });
  }
}
