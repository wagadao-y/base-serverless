import { Context } from "hono";
import { HTTPException } from "hono/http-exception";

export const errorHandler = (err: Error, c: Context): Response => {
  if (err instanceof HTTPException) {
    console.error("エラーが発生しました", err);
    return err.getResponse();
  } else {
    console.error("エラーが発生しました", err);
    return c.text("Internal Server Error", { status: 500 });
  }
};
