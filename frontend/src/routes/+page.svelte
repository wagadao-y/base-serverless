<script lang="ts">
  import { apiClient } from '$lib/util/apiClient';
  import { hashPayload } from '$lib/util/postLambdaUrl';

  async function getHello() {
    const res = await apiClient.api.hello.$get();
    console.log(res);
  }

  async function postHello() {
    const res = await apiClient.api.hello.$post(
      {},
      {
        headers: {
          'x-amz-content-sha256': await hashPayload('')
        }
      }
    );
    console.log(res);
  }

  const getValidateTest = async () => {
    const payload = {
      username: 'test',
      password: 'password'
    };

    const res = await apiClient.api['validate-test'].$post(
      {
        json: payload
      },
      {
        headers: {
          'x-amz-content-sha256': await hashPayload(JSON.stringify(payload))
        }
      }
    );
  };

  const getValidateHello = async () => {
    const payload = {
      username: 'test',
      password: 'password'
    };

    const res = await apiClient.api['validate-hello'].$get(
      {
        query: payload
      },
      {
        headers: {
          'x-amz-content-sha256': await hashPayload(JSON.stringify(payload))
        }
      }
    );
  };
</script>

<h1>トップページ</h1>
<a href="/page1">ページ1</a>
<button onclick={getHello}>Get HelloWorld</button>
<button onclick={postHello}>Post HelloWorld</button>
<button onclick={getValidateTest}>Get Validate Test</button>
<button onclick={getValidateHello}>Get Validate Hello</button>
