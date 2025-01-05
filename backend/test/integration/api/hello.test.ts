import { expect, it } from "vitest";
import app from "@/index";

it("テスト用 Hello Hono", async () => {
  const res = await app.request("/api/hello");
  expect(res.status).toBe(200);
  expect(await res.text()).toBe("Hello Hono!!");
});
