<script lang="ts">
  import { onMount } from 'svelte';

  type Theme = 'green' | 'amber';

  let theme = $state<Theme>('green');

  onMount(() => {
    theme = document.documentElement.dataset.theme === 'amber' ? 'amber' : 'green';
  });

  function toggle() {
    theme = theme === 'green' ? 'amber' : 'green';
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // storage unavailable (private mode): the theme still applies for this visit
    }
  }
</script>

<button
  type="button"
  onclick={toggle}
  aria-label={`Switch to ${theme === 'green' ? 'amber' : 'green'} theme`}
  class="border-fg-dim text-fg-dim hover:border-fg hover:text-fg cursor-pointer border px-2 py-1 text-xs transition-colors sm:text-sm"
>
  <span class="hidden sm:inline">[theme: {theme}]</span><span class="sm:hidden">[{theme}]</span>
</button>
