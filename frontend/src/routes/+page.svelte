<script lang="ts">
  import { getHello, postHello, getValidateTest, getValidateHello } from '$lib/api/hello';
  import Button from '$lib/component/ui/Button.svelte';
</script>

<h1>トップページ</h1>
<a href="/page1">ページ1</a>
<Button onclick={getHello} color="blue">Get HelloWorld</Button>
<Button onclick={postHello} color="green">Post HelloWorld</Button>
<Button onclick={getValidateTest} color="yellow">Get Validate Test</Button>
<Button onclick={getValidateTest} color="red">Get Validate Test</Button>
<Button onclick={getValidateHello} color="violet">Get Validate Hello</Button>
