import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { serve } from "@hono/node-server";
import { errorHandler } from "@/modules/error/controller";
import { publicRouter } from "./routes/public";
import { privateRouter } from "./routes/private";
import { adminRouter } from "./routes/admin";

export const app = new Hono().onError(errorHandler);

// ルートの設定
export const appRouter = app
  .route("/api/public", publicRouter) // 認証不要のルート
  .route("/api/private", privateRouter) // 認証必須のルート
  .route("/api/admin", adminRouter); // 管理者用のルート

export type AppType = typeof appRouter;

// AWS Lambda用
export const handler = handle(app);

// ローカル開発用
if (process.env.NODE_ENV === "development") {
  serve(
    {
      fetch: app.fetch,
      port: 3000,
    },
    (info) => {
      console.log(`Listening on http://127.0.0.1:${info.port}`);
    }
  );
}
