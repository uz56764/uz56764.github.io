export function announce(message: string) {
  const region = document.getElementById('announcer');
  if (!region) return;
  region.textContent = '';
  // A fresh text node makes screen readers repeat identical messages.
  requestAnimationFrame(() => { region.textContent = message; });
}

export async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    // The async API needs a secure context; plain-HTTP previews fall back to this.
    const field = document.createElement('textarea');
    field.value = value;
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.append(field);
    field.select();
    const copied = document.execCommand('copy');
    field.remove();
    if (!copied) throw new Error('Clipboard unavailable');
  }
}

const resetTimers = new WeakMap<HTMLElement, number>();

/**
 * Copy on click and confirm in place: sets `data-copied` for styling and
 * swaps the text of the button's `[data-label]` child for a moment.
 */
export function bindCopyButton(
  button: HTMLElement,
  getValue: () => string,
  { done = 'Copied', message = 'Copied to clipboard.', failure = 'Copy failed. Select the text to copy it manually.' } = {},
) {
  const label = button.querySelector<HTMLElement>('[data-label]');
  const idle = label?.textContent ?? '';
  button.addEventListener('click', async () => {
    try {
      await copyText(getValue());
    } catch {
      announce(failure);
      return;
    }
    button.dataset.copied = '';
    if (label) label.textContent = done;
    announce(message);
    clearTimeout(resetTimers.get(button));
    resetTimers.set(button, window.setTimeout(() => {
      delete button.dataset.copied;
      if (label) label.textContent = idle;
    }, 1800));
  });
}
