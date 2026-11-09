import jwt from "jsonwebtoken";

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
  if (!process.env.JWT_SECRET) {
    response.status(500).json({ message: "Authentication is not configured." });
    return;
  }

  const token = getToken(request);
  if (!token) {
    response.status(401).json({ message: authenticationFailureMessage });
    return;
  }

  try {
    request.user = jwt.verify(decodeURIComponent(token), process.env.JWT_SECRET);
    next();
  } catch {
    response.status(401).json({ message: authenticationFailureMessage });
  }
}
