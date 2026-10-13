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

  // phone menu: floating bubble that opens a small terminal-style panel
  let menuOpen = $state(false);
  let menuEl: HTMLElement | undefined = $state();
  let bubbleEl: HTMLButtonElement | undefined = $state();

  $effect(() => {
    document.body.dataset.menuOpen = menuOpen ? '1' : '';
  });

  // closing: leaving the welcome-free zone, or moving to another section
  $effect(() => {
    if (!visible) menuOpen = false;
  });
  $effect(() => {
    active;
    menuOpen = false;
  });

  function closeMenu(returnFocus = false) {
    menuOpen = false;
    if (returnFocus) bubbleEl?.focus();
  }

  function onWindowKeydown(event: KeyboardEvent) {
    if (menuOpen && event.key === 'Escape') closeMenu(true);
  }

  function onWindowPointerdown(event: PointerEvent) {
    if (!menuOpen) return;
    const target = event.target as Node;
    if (menuEl?.contains(target) || bubbleEl?.contains(target)) return;
    closeMenu();
  }

  $effect(() => {
    if (menuOpen) menuEl?.querySelector<HTMLElement>('a')?.focus();
  });

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

<svelte:window onkeydown={onWindowKeydown} onpointerdown={onWindowPointerdown} />

<header
  inert={!visible}
  aria-hidden={!visible}
  class="border-fg-dim bg-bg/90 fixed inset-x-0 top-0 z-40 hidden border-b backdrop-blur transition-transform duration-300 lg:block {visible
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

<!-- phones and tablets: floating bubble instead of the top bar -->
<div
  inert={!visible}
  aria-hidden={!visible}
  class="fixed right-4 z-40 flex flex-col items-end gap-3 transition-opacity duration-300 lg:hidden {visible
    ? 'opacity-100'
    : 'pointer-events-none opacity-0'}"
  style="bottom: calc(1rem + env(safe-area-inset-bottom));"
>
  {#if menuOpen}
    <div
      bind:this={menuEl}
      id="section-menu"
      role="dialog"
      aria-label="Section menu"
      class="border-fg-dim bg-bg w-56 border shadow-[0_0_18px_-6px_var(--color-fg-dim)]"
    >
      <div class="border-fg-dim text-fg-dim flex items-center justify-between border-b px-3 py-1.5 text-xs">
        <span>~/menu</span>
        <button type="button" onclick={() => closeMenu(true)} aria-label="Close menu" class="text-fg cursor-pointer">[x]</button>
      </div>
      <nav aria-label="Section navigation" class="flex flex-col py-1 text-sm">
        {#each items as item}
          <a
            href={item.href}
            aria-current={active === item.href ? 'true' : undefined}
            class="px-3 py-2 transition-colors {active === item.href ? 'text-fg text-glow' : 'text-fg-dim hover:text-fg'}"
          >
            <span aria-hidden="true">{active === item.href ? '>' : '~/'}</span>{item.label}
          </a>
        {/each}
      </nav>
      <div class="border-fg-dim border-t px-3 py-2">
        <ThemeToggle />
      </div>
    </div>
  {/if}

  <button
    bind:this={bubbleEl}
    type="button"
    onclick={() => (menuOpen = !menuOpen)}
    aria-expanded={menuOpen}
    aria-controls="section-menu"
    aria-label={menuOpen ? 'Close section menu' : 'Open section menu'}
    class="border-fg bg-bg/90 text-fg text-glow flex size-12 cursor-pointer items-center justify-center border text-lg shadow-[0_0_14px_-4px_var(--color-fg)] backdrop-blur transition-colors hover:bg-fg hover:text-bg"
  >
    {menuOpen ? 'x' : '≡'}
  </button>
</div>
