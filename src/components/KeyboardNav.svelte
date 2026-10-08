<script lang="ts">
  interface NavItem {
    key: string;
    href: string;
  }

  let { items }: { items: NavItem[] } = $props();

  function isTyping(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false;
    return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
  }

  function jumpTo(href: string) {
    const el = document.querySelector<HTMLElement>(href);
    if (!el) return;
    el.scrollIntoView();
    history.replaceState(null, '', href === '#welcome' ? location.pathname : href);
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey || event.altKey || isTyping(event.target)) return;

    if (event.key === 'Escape' || event.key === '0') {
      jumpTo('#welcome');
      return;
    }

    const item = items.find((i) => i.key === event.key);
    if (item) jumpTo(item.href);
  }
</script>

<svelte:window onkeydown={onKeydown} />
