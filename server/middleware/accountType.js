export function requireAccountType(accountType) {
  return (request, response, next) => {
    if (request.user.accountType !== accountType) {
      response.status(403).json({ message: "This account cannot access this resource." });
      return;
    }

    next();
  };
}
