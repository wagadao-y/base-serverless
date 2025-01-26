import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { errorHandler } from "./handlers/error";
import { publicRouter } from "./routes/public";
import { privateRouter } from "./routes/private";
import { adminRouter } from "./routes/admin";

const app = new Hono().onError(errorHandler);

// ルートの設定
export const appRouter = app
  .route("/api/public", publicRouter) // 認証不要のルート
  .route("/api/private", privateRouter) // 認証必須のルート
  .route("/api/admin", adminRouter); // 管理者用のルート

export const handler = handle(app);
export default app;
export type AppType = typeof appRouter;
