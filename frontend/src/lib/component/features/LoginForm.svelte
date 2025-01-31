<script lang="ts">
  import { LoaderCircle } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { login } from '$lib/api/auth';
  import { authStore } from '$lib/store/auth';

  let userId = '';
  let password = '';
  let isLoading = false;
  let errorMessage = '';

  // ログイン処理
  async function handleSubmit() {
    errorMessage = '';
    isLoading = true;

    try {
      const result = await login(userId, password);

      if (result.userId) {
        // ログイン成功時
        authStore.set({
          isAuthenticated: true,
          userId: result.userId
        });
        goto('/');
      } else {
        // ログイン失敗時
        errorMessage = 'ログインに失敗しました。';
      }
    } catch (error) {
      errorMessage = 'ログインに失敗しました。';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
  <div class="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
    <form class="space-y-6" on:submit|preventDefault={handleSubmit}>
      <!-- ユーザーID入力 -->
      <div>
        <label for="userId" class="block text-sm font-medium text-gray-700">ユーザーID</label>
        <div class="mt-1">
          <input
            id="userId"
            type="text"
            required
            class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            bind:value={userId}
            autocomplete="username"
          />
        </div>
      </div>

      <!-- パスワード入力 -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">パスワード</label>
        <div class="mt-1">
          <input
            id="password"
            type="password"
            required
            class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            bind:value={password}
            autocomplete="current-password"
          />
        </div>
      </div>

      <!-- ログインボタン -->
      <div>
        <button
          type="submit"
          class="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading}
        >
          {#if isLoading}
            <LoaderCircle class="mr-3 -ml-1 h-5 w-5 animate-spin" />
            <slot name="loading">ログイン中...</slot>
          {:else}
            ログイン
          {/if}
        </button>
      </div>

      <!-- エラーメッセージ -->
      {#if errorMessage}
        <div class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                {errorMessage}
              </h3>
            </div>
          </div>
        </div>
      {/if}
    </form>
  </div>
</div>
