<!--
  Adapted from React Bits' DecryptedText (MIT + Commons Clause).
  Source: https://github.com/DavidHDev/react-bits/tree/main/src/content/TextAnimations/DecryptedText
  Copyright (c) 2026 David Haz. Trimmed down for this site: the hover-radius
  heatmap, 3D flip effect, click modes and the `motion/react` dependency are
  dropped — kept is the core "scramble then reveal" behaviour, ported to
  Svelte 5 runes, triggered once when the text scrolls into view.
-->
<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    text: string;
    speed?: number;
    maxIterations?: number;
    sequential?: boolean;
    revealDirection?: 'start' | 'end' | 'center' | 'random';
    useOriginalCharsOnly?: boolean;
    characters?: string;
    /** re-run the effect every N ms while the text is on screen (0 = once) */
    repeatInterval?: number;
    /** vary reveal direction, speed and replay timing between runs */
    randomize?: boolean;
    class?: string;
    encryptedClass?: string;
  }

  let {
    text,
    speed = 35,
    maxIterations = 10,
    sequential = true,
    revealDirection = 'start',
    useOriginalCharsOnly = false,
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
    repeatInterval = 0,
    randomize = false,
    class: className = '',
    encryptedClass = ''
  }: Props = $props();

  const isSpace = (ch: string) => /\s/.test(ch);
  const chars = $derived(Array.from(text));

  function buildPool() {
    const letters = chars.filter((c) => !isSpace(c));
    const source = useOriginalCharsOnly ? Array.from(new Set(letters)) : Array.from(characters);
    return source.length ? source : letters;
  }

  function reducedMotion() {
    return typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  }

  function revealOrder(direction: typeof revealDirection): number[] {
    const order: number[] = [];
    chars.forEach((c, i) => {
      if (!isSpace(c)) order.push(i);
    });
    if (direction === 'end') return order.reverse();
    if (direction === 'center') {
      const mid = Math.floor(chars.length / 2);
      return order.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid));
    }
    if (direction === 'random') {
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
    }
    return order;
  }

  let revealed = $state<boolean[]>(chars.map((c) => isSpace(c)));
  let shown = $state<string[]>([...chars]);

  let containerEl: HTMLSpanElement;
  let timer: ReturnType<typeof setInterval> | null = null;

  function start() {
    if (timer) clearInterval(timer);
    timer = null;
    const pool = buildPool();
    const randomGlyph = () => pool[Math.floor(Math.random() * pool.length)];

    if (reducedMotion() || pool.length === 0) {
      revealed = chars.map(() => true);
      shown = [...chars];
      return;
    }

    // each run can reveal from a different side and at a slightly different pace
    const directions = ['start', 'end', 'center', 'random'] as const;
    const direction = randomize ? directions[Math.floor(Math.random() * directions.length)] : revealDirection;
    const tick = Math.max(16, randomize ? speed * (0.6 + Math.random() * 0.9) : speed);

    revealed = chars.map((c) => isSpace(c));
    shown = chars.map((c, i) => (isSpace(c) ? c : randomGlyph()));

    if (sequential) {
      const order = revealOrder(direction);
      let i = 0;
      timer = setInterval(() => {
        if (i < order.length) {
          revealed[order[i]] = true;
          i++;
        }
        shown = chars.map((c, idx) => (isSpace(c) || revealed[idx] ? c : randomGlyph()));
        if (i >= order.length) {
          if (timer) clearInterval(timer);
          timer = null;
        }
      }, tick);
    } else {
      let iteration = 0;
      timer = setInterval(() => {
        iteration++;
        shown = chars.map((c) => (isSpace(c) ? c : randomGlyph()));
        if (iteration >= maxIterations) {
          revealed = chars.map(() => true);
          shown = [...chars];
          if (timer) clearInterval(timer);
          timer = null;
        }
      }, tick);
    }
  }

  onMount(() => {
    if (typeof IntersectionObserver === 'undefined') {
      start();
      return;
    }
    let visible = false;
    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        if (visible && !started) {
          started = true;
          start();
          if (!repeatInterval) observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(containerEl);

    // replay on a loop, but only while the text is actually on screen
    let loop: ReturnType<typeof setTimeout> | null = null;
    const schedule = () => {
      const jitter = randomize ? 0.65 + Math.random() * 0.8 : 1;
      loop = setTimeout(() => {
        if (visible) start();
        schedule();
      }, repeatInterval * jitter);
    };
    if (repeatInterval > 0) schedule();

    return () => {
      observer.disconnect();
      if (loop) clearTimeout(loop);
      if (timer) clearInterval(timer);
    };
  });
</script>

<span bind:this={containerEl} class={className} style="white-space: pre-wrap;">
  <span class="sr-only">{text}</span>
  <span aria-hidden="true">
    {#each chars as c, i (i)}
      <span class={revealed[i] ? '' : `decrypt-ghost ${encryptedClass}`}>{shown[i]}</span>
    {/each}
  </span>
</span>

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .decrypt-ghost {
    opacity: 0.6;
  }
</style>
