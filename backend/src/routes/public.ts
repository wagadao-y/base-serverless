import { Hono } from "hono";
import { vValidator } from "@hono/valibot-validator";
import * as v from "valibot";
import { createAuthModule } from "@/modules/auth/module";

const authHandlers = createAuthModule();

export const publicRouter = new Hono()
  .post("/auth/login", ...authHandlers.login)
  .post("/auth/login-mfa", ...authHandlers.loginMfa)
  .post("/auth/verify-totp-setup", ...authHandlers.verifyTotpSetup)
  .post("/auth/respond-to-mfa", ...authHandlers.respondToMfa)
  // .get("/auth/verify-session", ...authHandlers.verifySession)
  .get("/hello", (c) => {
    return c.text("Hello Hono!!");
  })
  .post("/hello", (c) => {
    return c.text("Hello Post Hono!!");
  })
  .post(
    "/validate-test",
    vValidator(
      "json",
      v.object({
        username: v.string(),
        password: v.string(),
      })
    ),
    (c) => {
      return c.json({
        a: 1,
        b: "2",
      });
    }
  )
  .get(
    "/validate-hello",
    vValidator(
      "query",
      v.object({
        username: v.string(),
        password: v.string(),
      })
    ),
    (c) => {
      return c.json("Hello Validate Hono!!");
    }
  );
