<script lang="ts">
  import { onMount } from 'svelte';

  // Whether the intro runs is decided before first paint by an inline script in Base.astro, which
  // sets `data-boot` on <html> (first visit this session, motion allowed). Until then the overlay
  // stays display:none, so repeat visits and no-JS never see it.
  const TEXT = [
    '[ ok ] loading modules...',
    '[ ok ] mounting ~/projects',
    '[ ok ] starting portanio',
    '> welcome, visitor'
  ];
  const CHAR_MS = 16; // time per typed character
  const LINE_GAP = 160; // pause between lines
  const HOLD_MS = 250; // pause on the finished text before fading
  const FADE_MS = 150; // short, so the CRT power-on can take over the reveal
  const CRT_MS = 900; // how long html[data-crt] stays set; matches the animation in global.css

  // start time of each line; the whole intro lasts TYPED_END + HOLD_MS + FADE_MS (~3s)
  const starts: number[] = [];
  let cursor = 0;
  for (const line of TEXT) {
    starts.push(cursor);
    cursor += line.length * CHAR_MS + LINE_GAP;
  }
  const TYPED_END = cursor - LINE_GAP;
  const FADE_AT = TYPED_END + HOLD_MS;

  let elapsed = $state(0);
  let leaving = $state(false);
  let raf = 0;
  let fadeTimer: ReturnType<typeof setTimeout> | undefined;
  let crtTimer: ReturnType<typeof setTimeout> | undefined;

  const typed = $derived(
    TEXT.map((line, i) => line.slice(0, Math.max(0, Math.floor((elapsed - starts[i]) / CHAR_MS))))
  );
  // the cursor sits at the end of the line that is currently being typed
  const activeLine = $derived(Math.max(0, starts.findLastIndex((s) => elapsed >= s)));

  const root = () => document.documentElement;
  const skipEvents = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
  const removeSkipListeners = () => skipEvents.forEach((e) => window.removeEventListener(e, finish));

  function finish() {
    if (leaving) return;
    leaving = true;
    cancelAnimationFrame(raf);
    removeSkipListeners();
    // CRT power-on of the welcome screen (CSS gates it behind prefers-reduced-motion)
    root().setAttribute('data-crt', '');
    fadeTimer = setTimeout(() => root().removeAttribute('data-boot'), FADE_MS);
    crtTimer = setTimeout(() => root().removeAttribute('data-crt'), CRT_MS);
  }

  onMount(() => {
    try {
      sessionStorage.setItem('booted', '1');
    } catch {
      // storage unavailable: the intro may replay on reload, which is harmless
    }
    if (root().dataset.boot === undefined) return;

    const t0 = performance.now();
    const tick = (now: number) => {
      elapsed = now - t0;
      if (elapsed >= FADE_AT) finish();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    skipEvents.forEach((e) => window.addEventListener(e, finish, { once: true, passive: true }));

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fadeTimer);
      clearTimeout(crtTimer);
      removeSkipListeners();
    };
  });
</script>

<div class="boot" class:leaving style={`--boot-fade: ${FADE_MS}ms`} aria-hidden="true">
  <div class="boot-lines font-heading text-fg text-glow text-xl sm:text-2xl">
    {#each typed as text, i}
      {#if text || i === 0}
        <p>{text}{#if i === activeLine}<span class="cursor-blink">_</span>{/if}</p>
      {/if}
    {/each}
  </div>
</div>
