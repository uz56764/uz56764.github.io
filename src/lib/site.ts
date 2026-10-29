export const site = {
  name: 'uz56764',
  author: 'uz56764',
  fullName: 'Jinu Kim',
  role: 'Vulnerability Researcher',
  email: 'kimjw04271234@gmail.com',
  description: 'Vulnerability research, technical reports, and CTF write-ups.',
  locale: 'en-US',
  /** External profiles (e.g. GitHub), shown in the footer and on About Me. */
  links: [] as { label: string; href: string }[],
};

/** Path under the configured base, e.g. `url('articles/')` → `/repo/articles/`. */
export function url(path = '') {
  return `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}${path.replace(/^\//, '')}`;
}

export function absoluteUrl(path: string, origin: URL | undefined) {
  return new URL(path, origin ?? 'http://localhost').href;
}

const dateFormats = {
  long: { month: 'long', day: 'numeric', year: 'numeric' },
  short: { month: 'short', day: 'numeric', year: 'numeric' },
  day: { month: 'short', day: 'numeric' },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

export function formatDate(date: Date, style: keyof typeof dateFormats = 'long') {
  return new Intl.DateTimeFormat(site.locale, { ...dateFormats[style], timeZone: 'UTC' }).format(date);
}

export type Currency = 'USD' | 'KRW';

/** Whole amounts with the currency sign, e.g. $250,000 or ₩40,000,000. */
export function formatMoney(amount: number, currency: Currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

/** Typographic touch-ups for display titles: en dashes and unbreakable spaced colons. */
export function displayTitle(title: string) {
  return title.replace(/\s-\s/g, ' – ').replace(/\s+([:;!?])/g, ' $1');
}
