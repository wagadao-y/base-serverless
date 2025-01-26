/**
 * Lambda関数URLへのPOSTリクエストを行うラッパー関数
 * CloudFrontからLambda関数URLへのリクエストに必要なペイロードのSHA-256ハッシュ値を自動的に計算して付与します
 *
 * @param url - Lambda関数のURL
 * @param body - POSTするJSON文字列
 * @param options - fetchのオプション（省略可）
 * @returns Promise<Response> fetchのレスポンス
 * @throws Error ネットワークエラーが発生した場合（fetchのデフォルトの挙動）
 */
export async function postLambdaUrl(
  url: string,
  body: string,
  options?: Omit<RequestInit, 'method' | 'body'>
): Promise<Response> {
  // デフォルトのヘッダーを設定
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'x-amz-content-sha256': await hashPayload(body)
  };

  // オプションをマージ
  const mergedOptions: RequestInit = {
    method: 'POST',
    body,
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options?.headers ?? {})
    }
  };

  return fetch(url, mergedOptions);
}

/**
 * ペイロードのSHA-256ハッシュ値を計算して返します
 * @param payload
 * @returns
 */
export const hashPayload = async (payload: string) => {
  // SHA-256ハッシュ値を計算
  const encoder = new TextEncoder().encode(payload);
  const hash = await crypto.subtle.digest('SHA-256', encoder);

  // ハッシュ値をbase64に変換
  const hashArray = Array.from(new Uint8Array(hash));
  return hashArray.map((bytes) => bytes.toString(16).padStart(2, '0')).join('');
};
