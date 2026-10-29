// Minimal HAST helpers, so the Markdown plugins don't depend on packages that
// are only installed transitively.

export function element(tagName, properties = {}, children = []) {
  return { type: 'element', tagName, properties, children };
}

export function text(value) {
  return { type: 'text', value };
}

export function raw(value) {
  return { type: 'raw', value };
}

export function textContent(node) {
  if (node.type === 'text') return node.value;
  return node.children?.map(textContent).join('') ?? '';
}

// Shiki writes `class` as a string; remark-rehype writes `className` as a list.
export function hasClass(node, name) {
  const value = node.properties?.className ?? node.properties?.class;
  return Array.isArray(value) ? value.includes(name) : String(value ?? '').split(/\s+/).includes(name);
}

/** Visit every element; the callback may replace `parent.children[index]`. */
export function visitElements(node, callback, parent = null, index = 0) {
  if (node.type === 'element' && parent) callback(node, index, parent);
  const children = node.children ?? [];
  for (let i = 0; i < children.length; i++) visitElements(children[i], callback, node, i);
}
