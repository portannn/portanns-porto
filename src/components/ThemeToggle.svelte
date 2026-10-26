<script lang="ts">
  import { onMount } from 'svelte';

  type Theme = 'green' | 'amber';

  let theme = $state<Theme>('green');

  onMount(() => {
    theme = document.documentElement.dataset.theme === 'amber' ? 'amber' : 'green';
  });

  const SWEEP_MS = 800;
  const SWEEP_EASING = 'cubic-bezier(0.45, 0, 0.25, 1)';

  function apply(next: Theme) {
    theme = next;
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      // storage unavailable (private mode): the theme still applies for this visit
    }
  }

  function toggle() {
    const next: Theme = theme === 'green' ? 'amber' : 'green';
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // no View Transitions support, or reduced motion: just switch
    if (reduced || !('startViewTransition' in document)) {
      apply(next);
      return;
    }

    const line = document.createElement('div');
    line.className = 'theme-sweep-line';
    line.setAttribute('aria-hidden', 'true');

    const transition = document.startViewTransition(() => {
      apply(next);
      document.body.appendChild(line);
    });

    transition.ready
      .then(() => {
        const root = document.documentElement;
        const options = { duration: SWEEP_MS, easing: SWEEP_EASING, fill: 'forwards' as const };
        // the new theme is revealed from the top edge downwards...
        root.animate(
          { clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0 0)'] },
          { ...options, pseudoElement: '::view-transition-new(root)' }
        );
        // ...with the scanline riding its leading edge
        root.animate(
          { transform: ['translateY(0)', `translateY(${window.innerHeight - 3}px)`] },
          { ...options, pseudoElement: '::view-transition-group(theme-sweep)' }
        );
      })
      .catch(() => {});

    transition.finished.finally(() => line.remove());
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
