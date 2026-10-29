const archive = document.querySelector<HTMLElement>('[data-archive]');
const buttons = [...(archive?.querySelectorAll<HTMLButtonElement>('[data-filter]') ?? [])];

if (archive && buttons.length) {
  const rows = [...archive.querySelectorAll<HTMLElement>('[data-category]')];
  const years = [...archive.querySelectorAll<HTMLElement>('[data-year]')];
  const count = archive.querySelector<HTMLElement>('[data-archive-count]');
  const empty = archive.querySelector<HTMLElement>('[data-archive-empty]');
  const status = archive.querySelector<HTMLElement>('[data-archive-status]');
  const valid = new Set(buttons.map(button => button.dataset.filter));
  const PARAM = 'category';

  function apply(requested: string, updateUrl: boolean) {
    const key = valid.has(requested) ? requested : 'all';
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.filter === key));

    let visible = 0;
    for (const row of rows) {
      row.hidden = key !== 'all' && row.dataset.category !== key;
      if (!row.hidden) visible++;
    }
    for (const year of years) year.hidden = !year.querySelector('[data-category]:not([hidden])');

    if (count) count.textContent = String(visible);
    if (empty) empty.hidden = visible > 0;
    if (status) status.textContent = `${visible} ${visible === 1 ? 'article' : 'articles'} shown`;

    if (updateUrl) {
      const next = new URL(window.location.href);
      if (key === 'all') next.searchParams.delete(PARAM);
      else next.searchParams.set(PARAM, key);
      history.replaceState(history.state, '', next);
    }
  }

  for (const button of buttons) {
    button.addEventListener('click', () => apply(button.dataset.filter ?? 'all', true));
  }
  apply(new URLSearchParams(window.location.search).get(PARAM) ?? 'all', false);
}
