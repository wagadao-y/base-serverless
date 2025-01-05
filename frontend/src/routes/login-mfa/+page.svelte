<script lang="ts">
  import { login } from '$lib/api/authMfa';
  import { authStore } from '$lib/store/authMfa';
  import { goto } from '$app/navigation';

  let username = '';
  let password = '';
  let error = '';
  let loading = false;

  async function handleSubmit() {
    loading = true;
    error = '';

    try {
      const response = await login(username, password);

      if (response.challengeName === 'MFA_SETUP') {
        // 初回MFA設定が必要な場合
        authStore.update((state) => ({
          ...state,
          user: { username },
          mfaRequired: true,
          mfaSession: response.session,
          isInitialSetup: true,
          secretCode: response.secretCode // secretCodeを保存
        }));
        goto('/mfa/setup');
      } else if (response.challengeName === 'SOFTWARE_TOKEN_MFA') {
        // MFA認証が必要な場合
        authStore.update((state) => ({
          ...state,
          user: { username },
          mfaRequired: true,
          mfaSession: response.session,
          isInitialSetup: false
        }));
        goto('/mfa');
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'ログインに失敗しました';
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-md">
    <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">ログイン</h2>
  </div>

  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <div class="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
      <form class="space-y-6" on:submit|preventDefault={handleSubmit}>
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700"> ユーザー名 </label>
          <div class="mt-1">
            <input
              id="username"
              type="text"
              bind:value={username}
              required
              disabled={loading}
              class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700"> パスワード </label>
          <div class="mt-1">
            <input
              id="password"
              type="password"
              bind:value={password}
              required
              disabled={loading}
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
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
