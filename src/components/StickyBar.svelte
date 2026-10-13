<script lang="ts">
  import { onMount } from 'svelte';
  import { asciiName } from '../data/ascii';
  import ThemeToggle from './ThemeToggle.svelte';

  interface NavItem {
    key: string;
    label: string;
    href: string;
  }

  let { items }: { items: NavItem[] } = $props();

  let visible = $state(false);
  let active = $state('');
  let navEl: HTMLElement | undefined = $state();

  // keep the current section's link inside the horizontally scrollable bar
  $effect(() => {
    if (!navEl || !active) return;
    const link = navEl.querySelector<HTMLElement>(`a[href="${active}"]`);
    if (link) navEl.scrollTo({ left: link.offsetLeft - navEl.offsetLeft - 8, behavior: 'smooth' });
  });

  onMount(() => {
    const welcome = document.querySelector('#welcome');
    const sections = items
      .map((item) => document.querySelector<HTMLElement>(item.href))
      .filter((el): el is HTMLElement => el !== null);

    const welcomeObserver = new IntersectionObserver(([entry]) => {
      visible = !entry.isIntersecting;
      if (!visible) active = '';
    });
    if (welcome) welcomeObserver.observe(welcome);

    // a section counts as current while it crosses a thin band near the top third of the viewport
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) active = `#${entry.target.id}`;
        }
      },
      { rootMargin: '-35% 0px -60% 0px' }
    );
    sections.forEach((el) => sectionObserver.observe(el));

    return () => {
      welcomeObserver.disconnect();
      sectionObserver.disconnect();
    };
  });
</script>

<header
  inert={!visible}
  aria-hidden={!visible}
  class="border-fg-dim bg-bg/90 fixed inset-x-0 top-0 z-40 border-b backdrop-blur transition-transform duration-300 {visible
    ? 'translate-y-0'
    : '-translate-y-full'}"
>
  <div class="flex items-center gap-3 px-4 py-2 sm:gap-6 lg:grid lg:grid-cols-[1fr_auto_1fr]">
    <a href="#welcome" aria-label="Back to top" class="text-fg hidden shrink-0 justify-self-start lg:block">
      <pre class="font-mono text-[6px] leading-none whitespace-pre select-none" aria-hidden="true">{asciiName}</pre>
    </a>
    <nav bind:this={navEl} aria-label="Section navigation" class="flex min-w-0 flex-1 gap-4 overflow-x-auto text-xs whitespace-nowrap sm:text-sm lg:flex-none lg:justify-center">
      {#each items as item}
        <a
          href={item.href}
          aria-current={active === item.href ? 'true' : undefined}
          class="py-1 transition-colors {active === item.href ? 'text-fg text-glow' : 'text-fg-dim hover:text-fg'}"
        >
          <span aria-hidden="true">{active === item.href ? '>' : '~/'}</span>{item.label}
        </a>
      {/each}
    </nav>
    <div class="shrink-0 justify-self-end">
      <ThemeToggle />
    </div>
  </div>
</header>
