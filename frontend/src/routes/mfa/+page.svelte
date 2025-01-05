<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$lib/store/authMfa';
  import { respondToMFA } from '$lib/api/authMfa';
  import { goto } from '$app/navigation';

  let code = '';
  let error = '';
  let loading = false;

  $: user = $authStore.user;
  $: session = $authStore.mfaSession;

  onMount(() => {
    if (!user?.username || !session) {
      goto('/login-mfa');
    }
  });

  async function handleSubmit() {
    if (!user?.username || !session) return;

    loading = true;
    error = '';

    try {
      const response = await respondToMFA(user.username, code, session);

      authStore.update((state) => ({
        ...state,
        isAuthenticated: true,
        user: {
          ...state.user!,
          tokens: response.tokens
        },
        mfaRequired: false,
        mfaSession: null
      }));

      goto('/dashboard');
    } catch (e) {
      error = e instanceof Error ? e.message : 'MFA認証に失敗しました';
      code = ''; // エラー時にコードをクリア
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-md">
    <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">MFA認証</h2>
  </div>

  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <div class="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
      <form class="space-y-6" on:submit|preventDefault={handleSubmit}>
        <div>
          <label for="code" class="block text-sm font-medium text-gray-700">
            認証アプリに表示される6桁のコードを入力してください
          </label>
          <div class="mt-1">
            <input
              type="text"
              id="code"
              bind:value={code}
              pattern="[0-9]+"
              minlength="6"
              maxlength="6"
              required
              disabled={loading}
              placeholder="000000"
              class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100 sm:text-sm"
            />
          </div>
        </div>

        {#if error}
          <div class="rounded-md bg-red-50 p-4">
            <div class="text-sm text-red-700">
              {error}
            </div>
          </div>
        {/if}

        <div>
          <button
            type="submit"
            disabled={loading}
            class="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
          >
            {loading ? '認証中...' : '認証'}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
