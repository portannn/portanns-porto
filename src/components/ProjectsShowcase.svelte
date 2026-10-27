<script lang="ts">
  interface Project {
    slug: string;
    title: string;
    shortTitle: string;
    description: string;
    tags: string[];
    url?: string;
    repo?: string;
    images?: string[];
    detailHtml?: string;
  }

  let { projects }: { projects: Project[] } = $props();

  // "see more" expands the project's own window in place (a CSS grid-rows
  // 0fr -> 1fr animation handles the height change without measuring
  // anything in JS). Only one project is expanded at a time.
  let expandedSlug: string | null = $state(null);

  function toggleExpand(slug: string) {
    expandedSlug = expandedSlug === slug ? null : slug;
    if (expandedSlug) imageIndex = { ...imageIndex, [slug]: 0 };
  }

  // one screenshot carousel position per project, keyed by slug
  let imageIndex: Record<string, number> = $state({});

  function stepImage(slug: string, delta: number, total: number) {
    const current = imageIndex[slug] ?? 0;
    imageIndex = { ...imageIndex, [slug]: ((current + delta) % total + total) % total };
  }

  // fullscreen screenshot viewer (native <dialog>: focus trap, Esc and backdrop come for free)
  let viewerEl: HTMLDialogElement | undefined = $state();
  let viewer: { slug: string; title: string; images: string[]; index: number } | null = $state(null);

  function openViewer(p: Project, index: number) {
    if (!p.images?.length) return;
    viewer = { slug: p.slug, title: p.title, images: p.images, index };
    document.body.style.overflow = 'hidden';
    viewerEl?.showModal();
  }

  function closeViewer() {
    viewerEl?.close();
  }

  function onViewerClose() {
    document.body.style.overflow = '';
    // leave the inline carousel on the screenshot that was being viewed
    if (viewer) imageIndex = { ...imageIndex, [viewer.slug]: viewer.index };
    viewer = null;
  }

  function stepViewer(delta: number) {
    if (!viewer) return;
    const total = viewer.images.length;
    viewer.index = ((viewer.index + delta) % total + total) % total;
  }

  function onViewerKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      stepViewer(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      stepViewer(1);
    }
  }

  function onViewerClick(event: MouseEvent) {
    // a click on the backdrop lands on the <dialog> element itself
    if (event.target === viewerEl) closeViewer();
  }

  function collapse() {
    expandedSlug = null;
  }

  // desktop: tabs inside one terminal window
  let activeIndex = $state(0);
  const tabId = (i: number) => `project-tab-${i}`;
  const panelId = (i: number) => `project-panel-${i}`;
  let tabEls: HTMLButtonElement[] = $state([]);

  function selectTab(i: number) {
    activeIndex = i;
    // if the details were open, keep them open on the newly selected project
    if (expandedSlug && projects[i]) {
      expandedSlug = projects[i].slug;
      imageIndex = { ...imageIndex, [expandedSlug]: 0 };
    }
  }

  function onTabKeydown(event: KeyboardEvent) {
    const last = projects.length - 1;
    let next = activeIndex;
    if (event.key === 'ArrowRight') next = activeIndex === last ? 0 : activeIndex + 1;
    else if (event.key === 'ArrowLeft') next = activeIndex === 0 ? last : activeIndex - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    else return;
    event.preventDefault();
    selectTab(next);
    tabEls[next]?.focus();
  }

  // phones and tablets: horizontal scroll-snap carousel
  let track: HTMLElement | undefined = $state();
  let current = $state(0);

  const prefersReducedMotion = () =>
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function onScroll() {
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    let best = 0;
    let bestDistance = Infinity;
    cards.forEach((card, i) => {
      const distance = Math.abs(card.offsetLeft - track!.offsetLeft - track!.scrollLeft);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    });
    if (best !== current) collapse();
    current = best;
  }

  function goTo(index: number) {
    if (!track) return;
    const clamped = Math.max(0, Math.min(projects.length - 1, index));
    const card = track.children[clamped] as HTMLElement | undefined;
    if (card) {
      collapse();
      track.scrollTo({
        left: card.offsetLeft - track.offsetLeft,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      });
    }
  }

  // a skill link elsewhere on the page can ask for a specific project to be shown
  function onShowProject(event: Event) {
    const id = (event as CustomEvent<string>).detail;
    const index = projects.findIndex((p) => p.slug === id);
    if (index === -1) return;
    activeIndex = index;
    goTo(index);
  }
</script>

<svelte:window onshow-project={onShowProject} />

{#snippet details(p: Project)}
  {@const expanded = expandedSlug === p.slug}
  <h3 class="font-heading text-fg text-glow text-xl sm:text-2xl">
    <span class="text-fg-dim" aria-hidden="true">&gt;&nbsp;</span>{p.title}
  </h3>
  <p class="text-fg-dim mt-2 text-sm sm:text-base">{p.description}</p>
  <ul class="mt-3 flex flex-wrap gap-2" aria-label="Technologies used">
    {#each p.tags as tag}
      <li class="border-fg-dim text-fg-dim border px-2 py-0.5 text-xs">{tag}</li>
    {/each}
  </ul>

  <div
    class="grid transition-[grid-template-rows] duration-300 ease-out"
    style={`grid-template-rows: ${expanded ? '1fr' : '0fr'}`}
  >
    <div class="min-h-0 overflow-hidden">
      <div id={`project-detail-${p.slug}`} class="flex flex-col gap-4 pt-4">
        {#if p.images && p.images.length > 0}
          {@const images = p.images}
          {@const idx = ((imageIndex[p.slug] ?? 0) % images.length + images.length) % images.length}
          <div class="flex flex-col gap-2">
            <div class="border-fg-dim flex justify-center border bg-black/60">
              <button
                type="button"
                onclick={() => openViewer(p, idx)}
                aria-label={`View ${p.title} screenshot ${idx + 1} fullscreen`}
                class="block max-w-full cursor-zoom-in"
              >
                <img
                  src={images[idx]}
                  alt={`${p.title} screenshot ${idx + 1} of ${images.length}`}
                  loading="lazy"
                  class="block h-auto max-h-[65vh] w-auto max-w-full object-contain"
                />
              </button>
            </div>
            <p class="text-fg-dim text-center text-xs">click image to enlarge</p>
            {#if images.length > 1}
              <div class="text-fg-dim flex items-center justify-center gap-4 text-sm">
                <button
                  type="button"
                  onclick={() => stepImage(p.slug, -1, images.length)}
                  aria-label="Previous screenshot"
                  class="hover:text-fg cursor-pointer px-1"
                >
                  [&lt;]
                </button>
                <span aria-live="polite">{idx + 1}/{images.length}</span>
                <button
                  type="button"
                  onclick={() => stepImage(p.slug, 1, images.length)}
                  aria-label="Next screenshot"
                  class="hover:text-fg cursor-pointer px-1"
                >
                  [&gt;]
                </button>
              </div>
            {/if}
          </div>
        {/if}

        {#if p.detailHtml}
          <div class="detail-prose text-fg-dim text-sm sm:text-base">
            {@html p.detailHtml}
          </div>
        {/if}

        {#if p.url || p.repo}
          <div class="border-fg-dim flex gap-4 border-t pt-4 text-sm">
            {#if p.url}
              <a href={p.url} target="_blank" rel="noreferrer" class="text-fg hover:text-glow underline">
                live &rarr;
              </a>
            {/if}
            {#if p.repo}
              <a href={p.repo} target="_blank" rel="noreferrer" class="text-fg hover:text-glow underline">
                github &rarr;
              </a>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>

  <div class="mt-auto pt-4 text-sm">
    <button
      type="button"
      onclick={() => toggleExpand(p.slug)}
      aria-expanded={expanded}
      aria-controls={`project-detail-${p.slug}`}
      class="text-fg hover:text-glow cursor-pointer underline"
    >
      {expanded ? 'see less ↑' : 'see more ↓'}
    </button>
  </div>
{/snippet}

<!-- desktop: tabs -->
<div class="hidden lg:block">
  <div class="border-fg-dim bg-bg/60 border shadow-[0_0_18px_-6px_var(--color-fg-dim)]">
    <div class="border-fg-dim text-fg-dim flex items-center justify-between gap-3 border-b px-3 py-1.5 text-sm">
      <span class="min-w-0 truncate">~/projects/{projects[activeIndex]?.slug}</span>
      <span class="shrink-0 tracking-widest" aria-hidden="true">[_][&#9633;][x]</span>
    </div>

    <div role="tablist" aria-label="Projects" class="border-fg-dim flex flex-wrap gap-x-1 border-b px-2 pt-2">
      {#each projects as p, i}
        <button
          bind:this={tabEls[i]}
          type="button"
          role="tab"
          id={tabId(i)}
          aria-selected={activeIndex === i}
          aria-controls={panelId(i)}
          tabindex={activeIndex === i ? 0 : -1}
          onclick={() => selectTab(i)}
          onkeydown={onTabKeydown}
          class="-mb-px cursor-pointer border border-b-0 px-3 py-1.5 text-sm transition-colors {activeIndex === i
            ? 'border-fg-dim bg-bg text-fg text-glow'
            : 'text-fg-dim hover:text-fg border-transparent'}"
        >
          {p.shortTitle}
        </button>
      {/each}
    </div>

    <!-- every panel sits in the same grid cell, so the window keeps the height of the tallest one -->
    <div class="grid p-6">
      {#each projects as p, i}
        <div
          role="tabpanel"
          id={panelId(i)}
          aria-labelledby={tabId(i)}
          inert={activeIndex !== i}
          class="col-start-1 row-start-1 flex flex-col {activeIndex === i ? '' : 'invisible'}"
        >
          {@render details(p)}
        </div>
      {/each}
    </div>
  </div>
</div>

<!-- phones and tablets: carousel -->
<div class="lg:hidden">
  <div class="text-fg-dim mb-3 flex items-center justify-end gap-3 text-sm">
    <button
      type="button"
      onclick={() => goTo(current - 1)}
      disabled={current === 0}
      aria-label="Previous project"
      class="hover:text-fg cursor-pointer px-1 disabled:opacity-40"
    >
      [&lt;]
    </button>
    <span aria-live="polite">{current + 1}/{projects.length}</span>
    <button
      type="button"
      onclick={() => goTo(current + 1)}
      disabled={current === projects.length - 1}
      aria-label="Next project"
      class="hover:text-fg cursor-pointer px-1 disabled:opacity-40"
    >
      [&gt;]
    </button>
  </div>

  <div
    bind:this={track}
    onscroll={onScroll}
    role="region"
    aria-roledescription="carousel"
    aria-label="Projects"
    tabindex="0"
    class="-mr-4 flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto pr-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
  >
    {#each projects as p, i}
      <article
        aria-roledescription="slide"
        aria-label={`${i + 1} of ${projects.length}`}
        class="border-fg-dim bg-bg/60 flex w-[85%] shrink-0 snap-start flex-col border shadow-[0_0_18px_-6px_var(--color-fg-dim)] sm:w-[60%]"
      >
        <div class="border-fg-dim text-fg-dim border-b px-3 py-1.5 text-xs">
          <span class="block truncate">~/projects/{p.slug}</span>
        </div>
        <div class="flex flex-1 flex-col p-4">
          {@render details(p)}
        </div>
      </article>
    {/each}
  </div>
</div>

<dialog
  bind:this={viewerEl}
  onclose={onViewerClose}
  onclick={onViewerClick}
  onkeydown={onViewerKeydown}
  aria-label="Screenshot viewer"
  class="border-fg bg-bg text-fg m-auto w-[min(96vw,1400px)] max-w-none border p-0 shadow-[0_0_40px_-8px_var(--color-fg)] backdrop:bg-black/85"
>
  {#if viewer}
    {@const total = viewer.images.length}
    <div class="border-fg-dim text-fg-dim flex items-center justify-between gap-3 border-b px-3 py-1.5 text-sm">
      <span class="min-w-0 truncate">~/projects/{viewer.slug}/screenshot-{viewer.index + 1}.png</span>
      <button
        type="button"
        onclick={closeViewer}
        aria-label="Close viewer"
        class="hover:text-fg shrink-0 cursor-pointer tracking-widest"
      >
        [x]
      </button>
    </div>

    <div class="flex items-center justify-center bg-black/60 p-2 sm:p-4">
      <img
        src={viewer.images[viewer.index]}
        alt={`${viewer.title} screenshot ${viewer.index + 1} of ${total}`}
        class="block h-auto max-h-[78vh] w-auto max-w-full object-contain"
      />
    </div>

    <div class="border-fg-dim text-fg-dim flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t px-3 py-2 text-sm">
      {#if total > 1}
        <button type="button" onclick={() => stepViewer(-1)} aria-label="Previous screenshot" class="hover:text-fg cursor-pointer px-1">
          [&lt;]
        </button>
        <span aria-live="polite">{viewer.index + 1}/{total}</span>
        <button type="button" onclick={() => stepViewer(1)} aria-label="Next screenshot" class="hover:text-fg cursor-pointer px-1">
          [&gt;]
        </button>
      {/if}
      <span class="pointer-coarse:hidden text-xs">
        {total > 1 ? '←/→ switch · ' : ''}esc to close
      </span>
    </div>
  {/if}
</dialog>

<style>
  .detail-prose :global(p) {
    margin-top: 0.75em;
  }

  .detail-prose :global(p:first-child) {
    margin-top: 0;
  }

  .detail-prose :global(a) {
    color: var(--color-fg);
    text-decoration: underline;
  }
</style>
