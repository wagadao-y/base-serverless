<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { afterNavigate } from '$app/navigation';
  import { goto } from '$app/navigation';
  import { verifySession } from '$lib/api/auth';
  import SessionExpiredModal from '$lib/component/SessionExpiredModal.svelte';
  import { publicRoutes } from '$lib/constant/routes';
  import { authStore } from '$lib/store/auth';
  import { sessionStore } from '$lib/store/session';
  import { validateSessionInBackground } from '$lib/navigation/session';

  let { children } = $props();
  let isInitialized = $state(false);
  let isInitialNavigation = true;

  // // アプリ起動時のセッションチェック
  isInitialized = true;
  // onMount(async () => {
  //   if (browser) {
  //     // 現在のパスを取得
  //     const currentPath = window.location.pathname;
  //     const isPublicRoute = publicRoutes.includes(currentPath);

  //     // パブリックページ以外の場合のみセッション検証を実行
  //     // セッション検証に失敗した場合はログインページへリダイレクト
  //     if (!isPublicRoute) {
  //       const isValidateSession = await validateSession();
  //       if (!isValidateSession) {
  //         await goto('/login');
  //       }
  //     }

  //     // 検証完了フラグを立てる
  //     isInitialized = true;
  //   }
  // });

  // // ページ遷移後のセッションチェック
  // afterNavigate(async ({ to }) => {
  //   // 初期ナビゲーションはスキップ
  //   if (isInitialized) {
  //     const toPath = to?.url.pathname;
  //     await validateSessionInBackground(toPath!);
  //   }
  //   return;
  // });

  // セッション検証関数
  async function validateSession(): Promise<boolean> {
    try {
      const result = await verifySession();

      if (result.userId) {
        // セッションが有効な場合は、認証状態を保存
        authStore.set({
          isAuthenticated: true,
          userId: result.userId
        });
        return true;
      } else {
        return false;
      }
      // eslint-disable-next-line
    } catch (error) {
      return false;
    }
  }
</script>

{#if isInitialized}
  {#if $sessionStore.isExpired}
    <SessionExpiredModal />
  {/if}

  {@render children()}
{/if}
