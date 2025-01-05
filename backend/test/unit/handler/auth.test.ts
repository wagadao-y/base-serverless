import { describe, test, expect, vi } from "vitest";
import app from "@/index";
import { HTTPException } from "hono/http-exception";

// AuthServiceのモックを作成
const loginMock = vi.hoisted(() => vi.fn());
const verifyMock = vi.hoisted(() => vi.fn());

vi.mock("@/service/auth", () => {
  return {
    AuthService: vi.fn().mockImplementation(() => ({
      login: loginMock,
      verify: verifyMock,
    })),
  };
});

describe("AuthHandlers", async () => {
  test("セッション検証に成功した場合", async () => {
    // Arrange
    verifyMock.mockResolvedValue(true);
    const req = {
      method: "POST",
      headers: { Cookie: "sessionId=123" },
    };

    // Act
    const res = await app.request("/api/auth/verify", req);

    // Assert
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  test("セッション検証に失敗した場合", async () => {
    // Arrange
    verifyMock.mockRejectedValue(new HTTPException(401));
    const req = {
      method: "POST",
      headers: { Cookie: "sessionId=123" },
    };

    // Act
    const res = await app.request("/api/auth/verify", req);

    // Assert
    expect(res.status).toBe(401);
  });

  test("セッション検証でセッションIDが設定されていない場合", async () => {
    // Arrange
    verifyMock.mockResolvedValue(false);
    const req = {
      method: "POST",
    };

    // Act
    const res = await app.request("/api/auth/verify", req);

    // Assert
    expect(res.status).toBe(400);
    expect(await res.text()).toBe("cookieにセッションIDが含まれていません");
  });

  test("セッション検証で例外がアサートされた場合", async () => {
    // Arrange
    verifyMock.mockRejectedValue(new Error("セッションIDの検証に失敗しました"));
    const req = {
      method: "POST",
      headers: { Cookie: "sessionId=123" },
    };

    // Act
    const res = await app.request("/api/auth/verify", req);

    // Assert
    expect(res.status).toBe(500);
    expect(await res.text()).toBe("Internal Server Error");
  });

  test("ログインに成功した場合", async () => {
    // Arrange
    loginMock.mockResolvedValue({ sessionId: "mock-session-id" });
    const req = {
      method: "POST",
      body: JSON.stringify({ userId: "test", password: "password" }),
    };

    // Act
    const res = await app.request("/api/auth/login", req);

    // Assert
    // セッションIDがCookieに設定されていることを確認
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
    expect(res.headers.get("Set-Cookie")).toBe(
      "sessionId=mock-session-id; Max-Age=86400; Path=/; HttpOnly; Secure; SameSite=Strict"
    );
  });

  test("ログインに失敗した場合", async () => {
    // Arrange
    loginMock.mockRejectedValue(
      new HTTPException(401, { message: "認証に失敗しました" })
    );
    const req = {
      method: "POST",
      body: JSON.stringify({ userId: "test", password: "password" }),
    };

    // Act
    const res = await app.request("/api/auth/login", req);

    // Assert
    // セッションIDがCookieに設定されていないこと
    expect(res.status).toBe(401);
    expect(res.headers.get("Set-Cookie")).toBeNull();
  });

  test("ログイン時にユーザーIDとパスワードが未入力の場合", async () => {
    // Arrange
    loginMock.mockImplementation(() => {});
    const req = {
      method: "POST",
      body: JSON.stringify({ userId: "", password: "" }),
    };

    // Act
    const res = await app.request("/api/auth/login", req);

    // Assert
    // セッションIDがCookieに設定されていないこと
    expect(res.status).toBe(400);
    expect(await res.text()).toBe("ユーザーIDとパスワードは必須です");
    expect(res.headers.get("Set-Cookie")).toBeNull();
  });

  test("ログイン時にユーザーIDが未入力の場合", async () => {
    // Arrange
    loginMock.mockImplementation(() => {});
    const req = {
      method: "POST",
      body: JSON.stringify({ userId: "", password: "password" }),
    };

    // Act
    const res = await app.request("/api/auth/login", req);

    // Assert
    // セッションIDがCookieに設定されていないこと
    expect(res.status).toBe(400);
    expect(await res.text()).toBe("ユーザーIDとパスワードは必須です");
    expect(res.headers.get("Set-Cookie")).toBeNull();
  });

  test("ログイン時にパスワードが未入力の場合", async () => {
    // Arrange
    loginMock.mockImplementation(() => {});
    const req = {
      method: "POST",
      body: JSON.stringify({ userId: "test", password: "" }),
    };

    // Act
    const res = await app.request("/api/auth/login", req);

    // Assert
    // セッションIDがCookieに設定されていないこと
    expect(res.status).toBe(400);
    expect(await res.text()).toBe("ユーザーIDとパスワードは必須です");
    expect(res.headers.get("Set-Cookie")).toBeNull();
  });
});
