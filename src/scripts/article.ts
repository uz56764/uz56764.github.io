import { bindCopyButton } from './clipboard';

const article = document.querySelector<HTMLElement>('[data-article]');

function setupCodeBlocks(root: HTMLElement) {
  root.querySelectorAll<HTMLButtonElement>('[data-copy-code]').forEach(button => {
    const code = button.closest('.code-block')?.querySelector('pre code');
    if (code) bindCopyButton(button, () => code.textContent ?? '', { message: 'Code copied to clipboard.' });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-expand-code]').forEach(button => {
    const block = button.closest<HTMLElement>('.code-block');
    const label = button.querySelector<HTMLElement>('[data-label]');
    if (!block || !label) return;
    const collapsedLabel = label.textContent ?? '';
    button.addEventListener('click', () => {
      const expanded = !('expanded' in block.dataset);
      block.toggleAttribute('data-expanded', expanded);
      button.setAttribute('aria-expanded', String(expanded));
      label.textContent = expanded ? 'Collapse' : collapsedLabel;
      // Collapsing a long listing would leave the reader far below it.
      if (!expanded && block.getBoundingClientRect().top < 0) block.scrollIntoView({ block: 'start' });
    });
  });
}

function setupLightbox(root: HTMLElement) {
  const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox]');
  const image = dialog?.querySelector<HTMLImageElement>('[data-lightbox-image]');
  if (!dialog || !image) return;

  const zoomable = (img: HTMLImageElement) => img.naturalWidth > img.clientWidth * 1.15;

  root.querySelectorAll<HTMLImageElement>('img').forEach(img => {
    const enhance = () => {
      if (!zoomable(img) || img.parentElement?.matches('.zoomable')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'zoomable';
      button.setAttribute('aria-label', img.alt ? `Enlarge image: ${img.alt}` : 'Enlarge image');
      img.replaceWith(button);
      button.append(img);
      button.addEventListener('click', () => {
        image.src = img.currentSrc || img.src;
        image.alt = img.alt;
        dialog.showModal();
      });
    };
    if (img.complete) enhance();
    else img.addEventListener('load', enhance, { once: true });
  });

  dialog.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => image.removeAttribute('src'));
}

function setupReadingState(root: HTMLElement) {
  const headings = [...root.querySelectorAll<HTMLElement>('h2[id], h3[id], h4[id]')];
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]')];
  const progressBar = document.querySelector<HTMLElement>('[data-reading-progress]');
  const tocBar = document.querySelector<HTMLDetailsElement>('[data-toc-bar]');
  const currentLabel = tocBar?.querySelector<HTMLElement>('[data-current-section]');
  const sidebarList = document.querySelector<HTMLElement>('.toc-sidebar .toc-list');
  const header = document.querySelector<HTMLElement>('.site-header');
  let activeId: string | undefined;
  let frame = 0;

  const offset = () => (header?.offsetHeight ?? 0) + (tocBar?.offsetParent ? tocBar.offsetHeight : 0);

  function keepVisible(list: HTMLElement | null) {
    const link = list?.querySelector<HTMLElement>('[aria-current]');
    if (!list || !link || list.scrollHeight <= list.clientHeight) return;
    const top = link.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop;
    if (top < list.scrollTop + 24 || top > list.scrollTop + list.clientHeight - 48) {
      list.scrollTo({ top: top - list.clientHeight / 3 });
    }
  }

  function update() {
    frame = 0;
    const line = offset() + 64;

    let current = headings[0];
    for (const heading of headings) {
      if (heading.getBoundingClientRect().top > line) break;
      current = heading;
    }
    if (current?.id !== activeId) {
      activeId = current?.id;
      for (const link of links) {
        if (decodeURIComponent(link.hash.slice(1)) === activeId) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
      if (currentLabel && current) currentLabel.textContent = current.textContent;
      keepVisible(sidebarList);
    }

    const box = root.getBoundingClientRect();
    const distance = box.height - window.innerHeight + offset();
    const progress = Math.min(1, Math.max(0, (offset() - box.top) / Math.max(1, distance)));
    progressBar?.style.setProperty('--progress', progress.toFixed(4));
  }

  const schedule = () => { frame ||= requestAnimationFrame(update); };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  document.fonts?.ready.then(schedule);
  update();

  if (!tocBar) return;
  tocBar.addEventListener('toggle', () => {
    if (tocBar.open) keepVisible(tocBar.querySelector('.toc-bar-panel'));
  });
  tocBar.querySelectorAll('[data-toc-link]').forEach(link => link.addEventListener('click', () => { tocBar.open = false; }));
  document.addEventListener('click', event => {
    if (tocBar.open && !tocBar.contains(event.target as Node)) tocBar.open = false;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && tocBar.open) {
      tocBar.open = false;
      tocBar.querySelector('summary')?.focus();
    }
  });
}

if (article) {
  setupCodeBlocks(article);
  setupLightbox(article);
  setupReadingState(article);
}

document.querySelectorAll<HTMLButtonElement>('[data-copy-link]').forEach(button => {
  bindCopyButton(button, () => window.location.href.split('#')[0], { message: 'Link copied to clipboard.' });
});
