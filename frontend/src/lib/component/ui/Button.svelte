<script lang="ts">
  type ColorVariant = 'primary' | 'blue' | 'green' | 'yellow' | 'red' | 'violet' | 'gray';

  export let color: ColorVariant = 'primary';
  export let text: string = 'Button text';
  export let disabled: boolean = false;
  export let type: 'button' | 'submit' | 'reset' = 'button';

  const baseClasses =
    'rounded-lg border px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-all disabled:cursor-not-allowed focus:ring';

  const colorVariants: Record<ColorVariant, string> = {
    primary: `border-primary-500 bg-primary-500 hover:border-primary-700 hover:bg-primary-700 focus:ring-primary-200 disabled:border-primary-300 disabled:bg-primary-300`,
    blue: `border-blue-500 bg-blue-500 hover:border-blue-700 hover:bg-blue-700 focus:ring-blue-200 disabled:border-blue-300 disabled:bg-blue-300`,
    green: `border-green-500 bg-green-500 hover:border-green-700 hover:bg-green-700 focus:ring-green-200 disabled:border-green-300 disabled:bg-green-300`,
    yellow: `border-yellow-500 bg-yellow-500 hover:border-yellow-700 hover:bg-yellow-700 focus:ring-yellow-200 disabled:border-yellow-300 disabled:bg-yellow-300`,
    red: `border-red-500 bg-red-500 hover:border-red-700 hover:bg-red-700 focus:ring-red-200 disabled:border-red-300 disabled:bg-red-300`,
    violet: `border-violet-500 bg-violet-500 hover:border-violet-700 hover:bg-violet-700 focus:ring-violet-200 disabled:border-violet-300 disabled:bg-violet-300`,
    gray: `border-gray-700 bg-gray-700 hover:border-gray-900 hover:bg-gray-900 focus:ring-gray-200 disabled:border-gray-300 disabled:bg-gray-300`
  };

  $: classes = `${baseClasses} ${colorVariants[color]}`;
</script>

<button {type} {disabled} class={classes} on:click {...$$restProps}>
  {text}
  <slot />
</button>
