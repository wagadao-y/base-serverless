<!-- セッションの有効期限が切れたことを表示するモーダル -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { resetSessionExpired } from '$lib/store/session';

  export let redirectDelay = 3000; // デフォルトで3秒後にリダイレクト

  onMount(() => {
    const timer = setTimeout(() => {
      resetSessionExpired();
      goto('/login');
    }, redirectDelay);

    return () => clearTimeout(timer);
  });
</script>

<div class="fixed inset-0 z-40 bg-gray-600 bg-opacity-50">
  <!-- オーバーレイ：画面全体を覆う半透明の背景 -->
</div>

<div class="fixed inset-0 z-50 flex items-center justify-center">
  <!-- モーダルを中央配置するためのコンテナ -->
  <div class="w-96 rounded-lg border border-red-200 bg-red-50 p-4 shadow-lg">
    <div class="flex flex-col gap-1">
      <h3 class="text-base font-medium text-red-800">セッション期限切れ</h3>
      <p class="text-sm text-red-700">
        セッションの有効期限が切れました。{Math.ceil(
          redirectDelay / 1000
        )}秒後にログインページに移動します。
      </p>
    </div>
  </div>
</div>
