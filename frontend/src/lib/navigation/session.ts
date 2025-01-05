import { verifySession } from '$lib/api/auth';
import { setSessionExpired } from '$lib/store/session';
import { publicRoutes } from '$lib/constant/routes';

// セッション検証（バックグラウンド）
export async function validateSessionInBackground(pathname: string) {
  // パブリックページではセッション検証をスキップ
  if (publicRoutes.includes(pathname)) {
    return;
  }

  // セッション切れの場合は、モーダルを表示してログインページへリダイレクト
  // セッション切れのモーダル表示はSessionExpiredModal.svelteで処理
  try {
    const result = await verifySession();
    if (!result.userId) {
      setSessionExpired();
    }
    // eslint-disable-next-line
  } catch (error) {
    setSessionExpired();
  }
}
