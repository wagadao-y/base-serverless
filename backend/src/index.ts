import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { createAuthModule } from "./modules/auth";
import { errorHandler } from "./handlers/error";
import { auth } from "hono/utils/basic-auth";

const authHandlers = createAuthModule();

// ルートの設定
const app = new Hono();
app.onError(errorHandler);
app.post("/api/auth/login", ...authHandlers.login);
app.post("/api/auth/login-mfa", ...authHandlers.loginMfa);
app.post("/api/auth/verify-totp-setup", ...authHandlers.verifyTotpSetup);
app.post("/api/auth/respond-to-mfa", ...authHandlers.respondToMfa);
app.get("/api/auth/verify-session", ...authHandlers.verifySession);
app.get("/api/hello", (c) => {
  return c.text("Hello Hono!!");
});

export const handler = handle(app);
export default app;
