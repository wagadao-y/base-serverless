import { postLambdaUrl } from '$lib/util/postLambdaUrl';

export async function login(username: string, password: string) {
  try {
    const response = await postLambdaUrl(
      '/api/auth/login-mfa',
      JSON.stringify({ username, password }),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'ログインに失敗しました');
    }

    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function verifyTOTPSetup(username: string, code: string, session: string) {
  try {
    const response = await postLambdaUrl(
      '/api/auth/verify-totp-setup',
      JSON.stringify({ username, code, session }),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'MFAの設定に失敗しました');
    }

    return await response.json();
  } catch (error) {
    console.error('TOTP verification error:', error);
    throw error;
  }
}

export async function respondToMFA(username: string, code: string, session: string) {
  try {
    const response = await postLambdaUrl(
      '/api/auth/respond-to-mfa',
      JSON.stringify({ username, code, session }),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'MFA認証に失敗しました');
    }

    return await response.json();
  } catch (error) {
    console.error('MFA response error:', error);
    throw error;
  }
}
