import type { SearchEntry } from '../lib/posts';

type Indexed = {
  entry: SearchEntry;
  title: string;
  meta: string;
  description: string;
  prose: string;
  code: string;
};

type Result = {
  entry: SearchEntry;
  excerpt: string;
  excerptIsCode: boolean;
};

const RECENT_COUNT = 6;
const EXCERPT_LENGTH = 220;

const dialog = document.querySelector<HTMLDialogElement>('[data-search]');
const input = dialog?.querySelector<HTMLInputElement>('[data-search-input]');
const list = dialog?.querySelector<HTMLUListElement>('[data-search-results]');
const status = dialog?.querySelector<HTMLElement>('[data-search-status]');

if (dialog && input && list && status) {
  let index: Indexed[] | undefined;
  let request: Promise<void> | undefined;
  let unavailable = false;
  let results: Result[] = [];
  let active = -1;

  const lower = (value: string) => value.toLocaleLowerCase();

  function loadIndex() {
    request ??= fetch(dialog!.dataset.index!)
      .then(response => {
        if (!response.ok) throw new Error(`Search index: HTTP ${response.status}`);
        return response.json() as Promise<SearchEntry[]>;
      })
      .then(entries => {
        index = entries.map(entry => ({
          entry,
          title: lower(entry.title),
          meta: lower(`${entry.category} ${entry.tags.join(' ')}`),
          description: lower(entry.description),
          prose: lower(entry.prose),
          code: lower(entry.code),
        }));
      })
      .catch(() => { unavailable = true; })
      .finally(() => { if (dialog!.open) render(); });
    return request;
  }

  function snippet(text: string, position: number) {
    let start = Math.max(0, position - 60);
    if (start > 0) {
      const space = text.indexOf(' ', start);
      if (space !== -1 && space < position) start = space + 1;
    }
    const end = Math.min(text.length, start + EXCERPT_LENGTH);
    return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`;
  }

  function excerpt(item: Indexed, terms: string[]): Pick<Result, 'excerpt' | 'excerptIsCode'> {
    if (terms.every(term => item.description.includes(term) || item.title.includes(term))) {
      return { excerpt: item.entry.description, excerptIsCode: false };
    }
    for (const [field, isCode] of [['prose', false], ['code', true]] as const) {
      const positions = terms.map(term => item[field].indexOf(term)).filter(position => position !== -1);
      if (positions.length) return { excerpt: snippet(item.entry[field], Math.min(...positions)), excerptIsCode: isCode };
    }
    return { excerpt: item.entry.description, excerptIsCode: false };
  }

  function score(item: Indexed, terms: string[]) {
    let total = 0;
    for (const term of terms) {
      if (item.title.includes(term)) total += 10;
      else if (item.meta.includes(term)) total += 6;
      else if (item.description.includes(term)) total += 4;
      else if (item.prose.includes(term)) total += 2;
      else if (item.code.includes(term)) total += 1;
      else return 0;
    }
    return total;
  }

  function search(query: string): Result[] {
    if (!index) return [];
    const terms = lower(query).split(/\s+/).filter(Boolean);
    if (!terms.length) {
      return index.slice(0, RECENT_COUNT).map(item => ({ entry: item.entry, excerpt: item.entry.description, excerptIsCode: false }));
    }
    return index
      .map(item => ({ item, score: score(item, terms) }))
      .filter(match => match.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => ({ entry: item.entry, ...excerpt(item, terms) }));
  }

  function highlight(target: HTMLElement, text: string, terms: string[]) {
    const haystack = lower(text);
    const ranges: [number, number][] = [];
    for (const term of terms) {
      for (let at = haystack.indexOf(term); at !== -1; at = haystack.indexOf(term, at + term.length)) {
        ranges.push([at, at + term.length]);
      }
    }
    ranges.sort((a, b) => a[0] - b[0]);
    let cursor = 0;
    for (const [start, end] of ranges) {
      if (start < cursor) continue;
      target.append(text.slice(cursor, start));
      const mark = document.createElement('mark');
      mark.textContent = text.slice(start, end);
      target.append(mark);
      cursor = end;
    }
    target.append(text.slice(cursor));
  }

  function option(result: Result, i: number, terms: string[]) {
    const item = document.createElement('li');
    item.id = `search-option-${i}`;
    item.className = 'search-option';
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', 'false');

    const link = document.createElement('a');
    link.href = result.entry.href;
    link.tabIndex = -1;

    const title = document.createElement('span');
    title.className = 'search-option-title';
    highlight(title, result.entry.title, terms);

    const text = document.createElement('span');
    text.className = result.excerptIsCode ? 'search-option-excerpt is-code' : 'search-option-excerpt';
    highlight(text, result.excerpt, terms);

    const meta = document.createElement('span');
    meta.className = 'search-option-meta';
    meta.textContent = `${result.entry.category} · ${result.entry.date}`;

    link.append(title, text, meta);
    item.append(link);
    item.addEventListener('pointermove', () => { if (active !== i) setActive(i, false); });
    return item;
  }

  function setActive(next: number, reveal = true) {
    const options = list!.children;
    options[active]?.setAttribute('aria-selected', 'false');
    active = results.length ? (next + results.length) % results.length : -1;
    const current = options[active];
    if (current) {
      current.setAttribute('aria-selected', 'true');
      input!.setAttribute('aria-activedescendant', current.id);
      if (reveal) current.scrollIntoView({ block: 'nearest' });
    } else {
      input!.removeAttribute('aria-activedescendant');
    }
  }

  function render() {
    const query = input!.value.trim();
    const terms = lower(query).split(/\s+/).filter(Boolean);
    results = search(query);
    list!.replaceChildren(...results.map((result, i) => option(result, i, terms)));
    active = -1;
    setActive(0);
    list!.scrollTop = 0;

    if (!index && !unavailable) status!.textContent = 'Loading…';
    else if (unavailable) status!.textContent = 'Search is unavailable right now.';
    else if (!terms.length) status!.textContent = 'Recent articles';
    else if (!results.length) status!.textContent = `No results for “${query}”`;
    else status!.textContent = `${results.length} ${results.length === 1 ? 'result' : 'results'}`;
  }

  function open() {
    if (dialog!.open) return;
    input!.value = '';
    dialog!.showModal();
    render();
    loadIndex();
  }

  function go(result: Result | undefined, newTab = false) {
    if (!result) return;
    if (newTab) window.open(result.entry.href, '_blank', 'noopener');
    else window.location.assign(result.entry.href);
  }

  document.querySelectorAll<HTMLElement>('[data-search-open]').forEach(trigger => {
    trigger.addEventListener('click', open);
    // Warm the index before the click lands.
    trigger.addEventListener('pointerenter', loadIndex, { once: true });
    trigger.addEventListener('focus', loadIndex, { once: true });
  });

  dialog.querySelector('[data-search-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  input.addEventListener('input', render);

  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActive(active + (event.key === 'ArrowDown' ? 1 : -1));
    } else if (event.key === 'Enter' && !event.isComposing) {
      event.preventDefault();
      go(results[active], event.metaKey || event.ctrlKey);
    }
  });

  document.addEventListener('keydown', event => {
    const target = event.target as HTMLElement;
    const typing = target.closest('input, textarea, select, [contenteditable="true"]');
    const modifier = event.metaKey || event.ctrlKey;
    if ((modifier && event.key.toLowerCase() === 'k') || (!typing && !modifier && !event.altKey && event.key === '/')) {
      event.preventDefault();
      if (dialog.open) input.select();
      else open();
    }
  });
}
