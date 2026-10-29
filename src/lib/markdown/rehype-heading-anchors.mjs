import { element, visitElements } from './hast.mjs';

// A hover-revealed permalink for each section heading. The link is empty
// (its glyph comes from CSS) so collected heading text and the generated
// table of contents stay clean; keyboard users navigate via the contents list.
export default function rehypeHeadingAnchors({ levels = ['h2', 'h3', 'h4'] } = {}) {
  return function transform(tree) {
    visitElements(tree, node => {
      if (!levels.includes(node.tagName) || typeof node.properties?.id !== 'string') return;
      node.children.push(element('a', {
        className: ['heading-anchor'],
        href: `#${node.properties.id}`,
        ariaHidden: 'true',
        tabIndex: -1,
      }));
    });
  };
}
